const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRouter = require('./routes/auth');
const problemRouter = require('./routes/problems');
const taskRouter = require('./routes/tasks');
const teamRouter = require('./routes/teams');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join project room for real-time collaboration
  socket.on('join-project-room', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project room: ${projectId}`);
  });

  // Handle team join requests
  socket.on('send-join-request', (data) => {
    const { projectId, creatorId, requesterData } = data;
    // Send notification to creator
    io.to(`user-${creatorId}`).emit('new-join-request', {
      projectId,
      requester: requesterData,
      timestamp: new Date()
    });
  });

  // Handle request approval/rejection
  socket.on('handle-join-request', (data) => {
    const { requesterId, projectId, approved, projectData } = data;
    // Send notification to requester
    io.to(`user-${requesterId}`).emit('join-request-response', {
      projectId,
      approved,
      projectData,
      timestamp: new Date()
    });
  });

  // Handle task updates for real-time collaboration
  socket.on('task-updated', (data) => {
    const { projectId, task } = data;
    socket.to(`project-${projectId}`).emit('task-updated', task);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1", taskRouter);
app.use("/api/v1", teamRouter);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
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
        console.log('Connected to MongoDB');
        
        server.listen(5000, () => {
            console.log("Server started on port 5000");
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

main().catch(err => console.error(err));