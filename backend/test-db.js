const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codecohort');
    console.log('✅ MongoDB connection successful!');
    
    // Test if User model works
    const User = require('./models/User');
    console.log('✅ User model loaded successfully!');
    
    await mongoose.disconnect();
    console.log('✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
