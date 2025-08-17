const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function approveAllCreators() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with role 'creator'
    const creators = await User.find({ role: 'creator' });
    console.log(`Found ${creators.length} creators`);

    for (const creator of creators) {
      console.log(`\nCreator: ${creator.username} (${creator.email})`);
      console.log(`Current status: ${creator.creatorStatus}`);
      
      if (creator.creatorStatus !== 'approved') {
        creator.creatorStatus = 'approved';
        creator.approvedAt = new Date();
        await creator.save();
        console.log(`✅ Approved creator: ${creator.username}`);
      } else {
        console.log(`Already approved: ${creator.username}`);
      }
    }

    console.log('\n✅ All creators have been approved!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

approveAllCreators();
