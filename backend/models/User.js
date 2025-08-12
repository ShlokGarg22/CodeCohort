const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.githubId; // Password not required for GitHub OAuth users
    },
    minlength: 6,
    select: false
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  cloudinaryPublicId: {
    type: String,
    default: ''
  },
  githubProfile: {
    type: String,
    required: function() {
      return this.role === 'user' && !this.githubId; // Only required for non-OAuth users
    },
    validate: {
      validator: function(v) {
        if (this.role !== 'user' || this.githubId) return true;
        return /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub profile URL (https://github.com/username)'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'creator'],
    default: 'user'
  },
  creatorStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      return this.role === 'creator' ? 'pending' : undefined;
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  joinedProjects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['creator', 'developer'],
      default: 'developer'
    }
  }],
  maxProjects: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
