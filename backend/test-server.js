const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Simple test route
app.get('/api/v1/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection test
app.get('/api/v1/db-test', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ 
        success: true, 
        message: 'Database connected successfully',
        dbState: 'Connected'
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Database not connected',
        dbState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database error',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    
    app.listen(PORT, () => {
      console.log(`✅ Test server running on port ${PORT}`);
      console.log(`🔗 Test backend: http://localhost:${PORT}/api/v1/test`);
      console.log(`🔗 Test database: http://localhost:${PORT}/api/v1/db-test`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
