const sanitizeHtml = require('sanitize-html');
const Message = require('../models/Message');
const Problem = require('../models/Problem');
const { cloudinary } = require('../config/cloudinary');
const { parseMessageContent } = require('../utils/codeParser');

const isMember = async (projectId, userId) => {
  const p = await Problem.findById(projectId).select('createdBy teamMembers');
  if (!p) return false;
  if (p.createdBy?.toString() === userId.toString()) return true;
  return p.teamMembers?.some(m => m.user?.toString() === userId.toString());
};

exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
  const rawLimit = req.query.limit || '50';
  const limit = rawLimit === 'all' ? null : Math.min(parseInt(rawLimit, 10), 200);
    if (!(await isMember(projectId, req.user._id))) return res.status(403).json({ success: false, message: 'Forbidden' });
    let query = Message.find({ project: projectId, deletedAt: null })
      .sort({ createdAt: -1 })
      .populate('sender', 'username fullName profileImage');
    if (limit) {
      query = query.limit(limit);
    }
    const msgs = await query;
    res.json({ success: true, data: msgs.reverse() });
  } catch (e) {
    console.error('getMessages error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    let { content, mentions = [] } = req.body || {};
    if (typeof mentions === 'string') {
      try { mentions = JSON.parse(mentions); } catch { mentions = []; }
    }
    if (!(await isMember(projectId, req.user._id))) return res.status(403).json({ success: false, message: 'Forbidden' });
    let imageUrl = null;
    let imagePublicId = null;

    // If a file was uploaded via multipart/form-data, store it via Cloudinary
    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const clean = sanitizeHtml(content || '', { allowedTags: [], allowedAttributes: {} }).trim();
    if (!clean && !imageUrl) return res.status(400).json({ success: false, message: 'Empty message' });
    
    // Parse message content for code blocks
    const { messageType, parsedContent } = parseMessageContent(clean);
    
    const msg = await Message.create({ 
      project: projectId, 
      sender: req.user._id, 
      content: clean, 
      messageType,
      parsedContent,
      mentions, 
      imageUrl, 
      imagePublicId 
    });
    const populated = await msg.populate('sender', 'username fullName profileImage');

    // Broadcast to project room so all members see the new message in realtime
    try {
      const io = req.app.get('io');
      if (io) {
        const payload = { type: 'message', projectId, message: populated };
        io.to(`project_${projectId}`).emit('message:new', payload);
        // Fallback: also emit to individual user rooms in case some clients haven't joined the project room yet
        try {
          const project = await Problem.findById(projectId).select('createdBy teamMembers');
          const memberIds = new Set();
          if (project?.createdBy) memberIds.add(project.createdBy.toString());
          (project?.teamMembers || []).forEach(m => m?.user && memberIds.add(m.user.toString()));
          memberIds.forEach(uid => io.to(`user_${uid}`).emit('message:new', payload));
        } catch (roomErr) {
          console.error('Personal room emit error:', roomErr);
        }
      }
    } catch (emitErr) {
      console.error('Socket emit error (REST sendMessage):', emitErr);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    console.error('sendMessage error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { projectId, messageId } = req.params;
    const { content } = req.body || {};
    const msg = await Message.findById(messageId);
    if (!msg || msg.project.toString() !== projectId) return res.status(404).json({ success: false, message: 'Not found' });
    if (msg.sender.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
    const clean = sanitizeHtml(content || '', { allowedTags: [], allowedAttributes: {} }).trim();
    if (!clean) return res.status(400).json({ success: false, message: 'Empty message' });
    
    // Parse updated message content for code blocks
    const { messageType, parsedContent } = parseMessageContent(clean);
    
    msg.content = clean; 
    msg.messageType = messageType;
    msg.parsedContent = parsedContent;
    msg.edited = true; 
    await msg.save();
    const populated = await msg.populate('sender', 'username fullName profileImage');
    res.json({ success: true, data: populated });
  } catch (e) {
    console.error('editMessage error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { projectId, messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg || msg.project.toString() !== projectId) return res.status(404).json({ success: false, message: 'Not found' });
    const project = await Problem.findById(projectId).select('createdBy teamMembers');
    const isAdmin = project.createdBy?.toString() === req.user._id.toString();
    const isSender = msg.sender.toString() === req.user._id.toString();
    if (!isAdmin && !isSender) return res.status(403).json({ success: false, message: 'Forbidden' });
    // If message has an image, attempt to delete from Cloudinary
    if (msg.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(msg.imagePublicId);
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr);
      }
    }
    msg.deletedAt = new Date(); await msg.save();
    res.json({ success: true });
  } catch (e) {
    console.error('deleteMessage error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
