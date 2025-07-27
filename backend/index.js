const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const authRouter = require('./routes/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);

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
        
        app.listen(5000, () => {
            console.log("Server started on port 5000");
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

main().catch(err => console.error(err));