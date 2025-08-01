const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    required: true,
    trim: true
  },
  techStack: [{
    type: String,
    required: true
  }],
  timeEstimate: {
    type: String,
    required: true
  },
  teamSize: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  deliverables: {
    type: String,
    default: ''
  },
  evaluation: {
    type: String,
    default: ''
  },
  resources: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  submissions: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ isActive: 1 });
problemSchema.index({ projectType: 1 });
problemSchema.index({ techStack: 1 });

// Virtual for calculating popularity score
problemSchema.virtual('popularityScore').get(function() {
  return (this.views * 0.1) + (this.likes * 0.5) + (this.submissions * 0.3);
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
