const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupOldIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('teamrequests');

    // Drop old indexes that are no longer needed
    const oldIndexesToDrop = [
      'creatorId_1_status_1',
      'userId_1_status_1'
    ];

    for (const indexName of oldIndexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`🗑️  Dropped old index: ${indexName}`);
      } catch (error) {
        console.log(`⚠️  Index ${indexName} might not exist:`, error.message);
      }
    }

    // Show final clean indexes
    const finalIndexes = await collection.indexes();
    console.log('📋 Clean indexes:', finalIndexes.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('🎉 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupOldIndexes();
