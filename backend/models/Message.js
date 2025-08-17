const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  messageType: { 
    type: String, 
    enum: ['text', 'code', 'mixed'], 
    default: 'text' 
  },
  parsedContent: [{
    type: {
      type: String,
      enum: ['text', 'code'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: null
    }
  }],
  imageUrl: { type: String, default: null },
  imagePublicId: { type: String, default: null },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

MessageSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
