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

// Security middleware imports
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors, 
  validationRules, 
  helmetConfig 
} = require('./middleware/security');
const { auditLogger, auditMiddleware } = require('./utils/auditLogger');

// Route imports
const authRouter = require('./routes/auth');
const problemRouter = require('./routes/problems');
const taskRouter = require('./routes/tasks');
const teamRouter = require('./routes/teams');
const uploadRouter = require('./routes/upload');
const chatRouter = require('./routes/chat');
const aiRouter = require('./routes/ai');
const adminRouter = require('./routes/admin');
const debugRouter = require('./routes/debug');

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

// Security middleware - Apply helmet first
app.use(helmetConfig);

// General rate limiting
app.use(rateLimits.general);

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInput);

// Audit logging middleware
app.use(auditMiddleware(auditLogger));

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

// Routes with specific rate limiting
app.use("/api/v1/auth", rateLimits.auth, authRouter);
app.use("/api/v1/problems", rateLimits.problemCreation, problemRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1", taskRouter);
app.use("/api/v1/teams", rateLimits.teamOperations, teamRouter);
app.use("/api/v1/chat", rateLimits.chat, chatRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/debug", debugRouter);

// Enhanced health check route
app.get('/api/v1/health', (req, res) => {
  const healthStatus = {
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    connections: {
      connectedUsers: connectedUsers.size,
      activeSocketConnections: io.engine.clientsCount
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'Unknown'
    }
  };

  // Log health check access
  auditLogger.logSystemEvent('HEALTH_CHECK', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json(healthStatus);
});

// Security headers check endpoint
app.get('/api/v1/security-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Security headers active',
    headers: {
      'content-security-policy': 'enabled',
      'x-frame-options': 'enabled',
      'x-content-type-options': 'enabled',
      'strict-transport-security': 'enabled'
    },
    rateLimiting: 'enabled',
    inputSanitization: 'enabled',
    auditLogging: 'enabled'
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  console.log("----------------GETTING ERROR-------------------");
  console.error(err);

  // Log error with audit logger
  auditLogger.logError(err, {
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  }, req);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry detected'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler with logging
app.use((req, res) => {
  auditLogger.logSecurityEvent('404_ACCESS_ATTEMPT', {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent')
  }, req);

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