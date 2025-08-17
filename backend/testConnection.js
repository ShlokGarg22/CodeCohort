console.log('Script starting...');

const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
