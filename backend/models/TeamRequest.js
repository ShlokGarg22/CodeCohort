const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creator: {
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
teamRequestSchema.index({ project: 1, requester: 1 }, { unique: true });
teamRequestSchema.index({ creator: 1, status: 1 });
teamRequestSchema.index({ requester: 1, status: 1 });

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);

module.exports = TeamRequest;
