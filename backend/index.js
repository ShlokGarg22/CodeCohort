require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authRouter = require('./routes/auth');
const problemRouter = require('./routes/problems');
const taskRouter = require('./routes/tasks');
const teamRouter = require('./routes/teams');
const uploadRouter = require('./routes/upload');

const app = express();
const server = createServer(app);

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Make io available to routes
app.set('io', io);

// Socket connection management
const connectedUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId

// JWT token verification function
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);

  // Authenticate and join user room
  socket.on('authenticate', async (data) => {
    try {
      const { userId, token } = data;
      
      if (!userId) {
        console.log('❌ Authentication failed: No userId provided');
        socket.emit('auth-error', { message: 'User ID is required' });
        return;
      }

      // If token is provided, validate it
      if (token) {
        try {
          const decoded = verifyToken(token);
          
          // Verify that the token belongs to the claimed user
          if (decoded.userId !== userId) {
            console.log('❌ Authentication failed: Token user mismatch');
            socket.emit('auth-error', { message: 'Invalid token for user' });
            return;
          }

          // Verify user exists in database
          const user = await User.findById(userId);
          if (!user) {
            console.log('❌ Authentication failed: User not found');
            socket.emit('auth-error', { message: 'User not found' });
            return;
          }

          console.log(`✅ Token validated for user ${userId}`);
        } catch (tokenError) {
          console.log('❌ Authentication failed: Invalid token');
          socket.emit('auth-error', { message: 'Invalid or expired token' });
          return;
        }
      } else {
        // If no token provided, just use userId (for development/testing)
        console.log(`⚠️ No token provided for user ${userId} - proceeding without token validation`);
      }

      // Store user connection info
      connectedUsers.set(socket.id, userId);
      userSockets.set(userId, socket.id);
      
      // Join user's personal room for notifications
      socket.join(`user-${userId}`);
      console.log(`✅ User ${userId} authenticated and joined room: user-${userId}`);
      
      // Emit authentication success
      socket.emit('authenticated', { userId });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  });

  // Join project room for real-time collaboration
  socket.on('join-project-room', (projectId) => {
    if (!connectedUsers.has(socket.id)) {
      console.log('❌ User not authenticated, cannot join project room');
      return;
    }
    
    socket.join(`project-${projectId}`);
    console.log(`📁 User joined project room: project-${projectId}`);
  });

  // Leave project room
  socket.on('leave-project-room', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`📁 User left project room: project-${projectId}`);
  });

  // Handle team join request (from user to creator)
  socket.on('send-join-request', (data) => {
    try {
      const { projectId, creatorId, requesterData, message } = data;
      
      if (!projectId || !creatorId || !requesterData) {
        console.log('❌ Invalid join request data:', data);
        return;
      }

      console.log(`📨 Join request from ${requesterData.username} to creator ${creatorId} for project ${projectId}`);
      
      // Send notification to creator
      io.to(`user-${creatorId}`).emit('new-join-request', {
        requestId: Date.now().toString(), // Temporary ID for socket requests
        projectId,
        projectTitle: requesterData.projectTitle,
        requester: {
          id: requesterData.id,
          username: requesterData.username,
          fullName: requesterData.fullName,
          profileImage: requesterData.profileImage
        },
        message: message || '',
        timestamp: new Date(),
        isSocketRequest: true
      });
      
      console.log(`✅ Join request notification sent to creator ${creatorId}`);
      
    } catch (error) {
      console.error('❌ Error sending join request:', error);
    }
  });

  // Handle join request response (from creator to user)
  socket.on('handle-join-request', (data) => {
    try {
      const { requesterId, projectId, approved, projectData } = data;
      
      if (!requesterId || !projectId) {
        console.log('❌ Invalid join request response data:', data);
        return;
      }

      console.log(`📨 Join request response to ${requesterId} for project ${projectId}: ${approved ? 'APPROVED' : 'REJECTED'}`);
      
      // Send notification to requester
      io.to(`user-${requesterId}`).emit('join-request-response', {
        requestId: Date.now().toString(),
        projectId,
        projectTitle: projectData?.title || 'Project',
        approved,
        timestamp: new Date()
      });
      
      console.log(`✅ Join request response sent to user ${requesterId}`);
      
    } catch (error) {
      console.error('❌ Error handling join request response:', error);
    }
  });

  // Handle task updates for real-time collaboration
  socket.on('task-updated', (data) => {
    try {
      const { projectId, task } = data;
      
      if (!projectId || !task) {
        console.log('❌ Invalid task update data:', data);
        return;
      }

      console.log(`📝 Task updated in project ${projectId}:`, task.title);
      
      // Broadcast to all users in the project room (except sender)
      socket.to(`project-${projectId}`).emit('task-updated', task);
      
    } catch (error) {
      console.error('❌ Error broadcasting task update:', error);
    }
  });

  // Handle user typing indicator
  socket.on('user-typing', (data) => {
    const { projectId, userId, isTyping } = data;
    socket.to(`project-${projectId}`).emit('user-typing', { userId, isTyping });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      console.log(`🔌 User ${userId} disconnected (socket: ${socket.id})`);
      connectedUsers.delete(socket.id);
      userSockets.delete(userId);
    } else {
      console.log(`🔌 Anonymous user disconnected (socket: ${socket.id})`);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Utility function to get socket by user ID
const getUserSocket = (userId) => {
  const socketId = userSockets.get(userId);
  return socketId ? io.sockets.sockets.get(socketId) : null;
};

// Make utility functions available to routes
app.set('getUserSocket', getUserSocket);
app.set('userSockets', userSockets);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1", taskRouter);
app.use("/api/v1/teams", teamRouter);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    connectedUsers: connectedUsers.size,
    activeConnections: io.engine.clientsCount
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.log("----------------GETTING ERROR-------------------")
  console.error(err);
  res.status(500).json({
    success: false,
    message: err || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

async function main(){
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codecohort');
        console.log('✅ Connected to MongoDB');
        
        server.listen(5000, () => {
            console.log("🚀 Server started on port 5000");
            console.log("📡 Socket.IO server ready for connections");
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

main().catch(err => console.error(err));