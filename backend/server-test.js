const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Try adding auth routes
try {
  const authRouter = require('./routes/auth');
  app.use("/api/v1/auth", authRouter);
  console.log('Auth routes loaded successfully');
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

async function main(){
    try {
        await mongoose.connect(process.env.MONGODB_URI);
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
