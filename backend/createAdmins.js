const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin accounts already exist
    const existingAdmins = await User.find({ role: 'admin' });
    if (existingAdmins.length > 0) {
      console.log('Admin accounts already exist');
      return;
    }

    // Create sample admin accounts
    const adminAccounts = [
      {
        username: 'admin1',
        email: 'admin1@codecohort.com',
        password: 'Admin123!',
        fullName: 'Admin One',
        role: 'admin',
        isVerified: true
      },
      {
        username: 'admin2',
        email: 'admin2@codecohort.com',
        password: 'Admin123!',
        fullName: 'Admin Two',
        role: 'admin',
        isVerified: true
      }
    ];

    for (const adminData of adminAccounts) {
      const admin = new User(adminData);
      await admin.save();
      console.log(`Created admin account: ${admin.username} (${admin.email})`);
    }

    console.log('Sample admin accounts created successfully');

  } catch (error) {
    console.error('Error creating admin accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdminAccounts();
