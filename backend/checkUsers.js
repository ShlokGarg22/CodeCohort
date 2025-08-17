const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('Starting script...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users with their roles and creator status
    const users = await User.find({}).select('username email role creatorStatus fullName');
    console.log(`Found ${users.length} users`);
    
    console.log('\n=== ALL USERS ===');
    users.forEach(user => {
      console.log(`${user.username} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Creator Status: ${user.creatorStatus || 'N/A'}`);
      console.log(`  Full Name: ${user.fullName}`);
      console.log('---');
    });

    // Find creators specifically
    const creators = await User.find({ role: 'creator' });
    console.log('\n=== CREATORS ===');
    console.log(`Found ${creators.length} creators`);
    creators.forEach(creator => {
      console.log(`${creator.username}: ${creator.creatorStatus}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers();
