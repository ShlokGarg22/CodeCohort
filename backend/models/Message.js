const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

MessageSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
