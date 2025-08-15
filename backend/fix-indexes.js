const mongoose = require('mongoose');
require('dotenv').config();

async function fixTeamRequestIndexes() {
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

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop any problematic indexes
    const problemIndexes = indexes.filter(idx => 
      (idx.key.projectId && idx.key.userId) || 
      (idx.name && idx.name.includes('projectId_1_userId_1'))
    );

    for (const index of problemIndexes) {
      try {
        await collection.dropIndex(index.name);
        console.log(`🗑️  Dropped problematic index: ${index.name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop index ${index.name}:`, error.message);
      }
    }

    // Create the correct indexes
    try {
      await collection.createIndex({ project: 1, requester: 1 }, { unique: true });
      console.log('✅ Created compound index: project + requester');
    } catch (error) {
      console.log('⚠️  Compound index might already exist:', error.message);
    }

    try {
      await collection.createIndex({ creator: 1, status: 1 });
      console.log('✅ Created index: creator + status');
    } catch (error) {
      console.log('⚠️  Creator + status index might already exist:', error.message);
    }

    try {
      await collection.createIndex({ requester: 1, status: 1 });
      console.log('✅ Created index: requester + status');
    } catch (error) {
      console.log('⚠️  Requester + status index might already exist:', error.message);
    }

    // Clean up any malformed documents
    const malformedDocs = await collection.find({
      $or: [
        { project: null },
        { requester: null },
        { creator: null }
      ]
    }).toArray();

    if (malformedDocs.length > 0) {
      console.log(`🧹 Found ${malformedDocs.length} malformed documents, removing them...`);
      await collection.deleteMany({
        $or: [
          { project: null },
          { requester: null },
          { creator: null }
        ]
      });
      console.log('✅ Cleaned up malformed documents');
    }

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('📋 Final indexes:', finalIndexes.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('🎉 Database indexes fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
fixTeamRequestIndexes();
