/**
 * Database cleanup script for TeamRequest collection
 * Removes any records with null projectId or userId to fix duplicate key errors
 */

const mongoose = require('mongoose');
require('dotenv').config();

const TeamRequest = require('./models/TeamRequest');

async function cleanupTeamRequests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codecohort');
    console.log('✅ Connected to MongoDB');

    // Find and remove documents with null project or requester fields
    const nullRecords = await TeamRequest.find({
      $or: [
        { project: null },
        { requester: null },
        { creator: null }
      ]
    });

    if (nullRecords.length > 0) {
      console.log(`🧹 Found ${nullRecords.length} records with null values`);
      
      const deleteResult = await TeamRequest.deleteMany({
        $or: [
          { project: null },
          { requester: null },
          { creator: null }
        ]
      });

      console.log(`🗑️ Deleted ${deleteResult.deletedCount} problematic records`);
    } else {
      console.log('✅ No problematic records found');
    }

    // Check for any remaining issues
    const totalRequests = await TeamRequest.countDocuments();
    console.log(`📊 Total team requests in database: ${totalRequests}`);

    // List all indexes
    const indexes = await TeamRequest.collection.getIndexes();
    console.log('📋 Current indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`  - ${indexName}:`, indexes[indexName]);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupTeamRequests();
}

module.exports = { cleanupTeamRequests };
