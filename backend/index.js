require('dotenv').config({ path: __dirname + '/.env' });
const dns = require('dns');
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
const chatRouter = require('./routes/chat');
const aiRouter = require('./routes/ai');

// Force reliable public DNS resolvers to avoid local/ISP DNS issues with SRV/TXT lookups
// This helps resolve errors like: queryTxt ESERVFAIL cluster0.x.mongodb.net
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
  // Non-fatal if setting servers fails; continue with system defaults
}

// Import socket handlers
const { setupJoinNotificationHandlers } = require('./socket/handlers');

const app = express();
const server = createServer(app);

// Track connected users
const connectedUsers = new Map();

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

// Setup socket handlers for join notifications
setupJoinNotificationHandlers(io);

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
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/ai", aiRouter);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    connectedUsers: connectedUsers.size,
    activeConnections: io.engine.clientsCount,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
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
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codecohort';
  
  console.log('🔍 Environment check:');
  console.log('MONGODB_URI from env:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('Using URI:', primaryUri.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials

  const connectOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip IPv6
  };

  const tryConnect = async (uri, label) => {
    console.log(`🔗 Attempting MongoDB connection [${label}] → ${uri.startsWith('mongodb+srv://') ? 'Atlas Cloud' : 'Local'}`);
    await mongoose.connect(uri, connectOptions);
    console.log(`✅ Connected to MongoDB [${label}]`);
  };

  try {
    await tryConnect(primaryUri, 'MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Please check your internet connection and MongoDB Atlas credentials');
    process.exit(1);
  }

  server.listen(5000, () => {
    console.log('🚀 Server started on port 5000');
    console.log('📡 Socket.IO server ready for connections');
    console.log('💾 Database: Connected to MongoDB Atlas');
  });
}

main().catch(err => console.error(err));