const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate requests
teamRequestSchema.index({ projectId: 1, userId: 1 }, { unique: true });
teamRequestSchema.index({ creatorId: 1, status: 1 });
teamRequestSchema.index({ userId: 1, status: 1 });

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);

module.exports = TeamRequest;
