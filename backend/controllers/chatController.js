const sanitizeHtml = require('sanitize-html');
const Message = require('../models/Message');
const Problem = require('../models/Problem');

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
    const { content, mentions = [] } = req.body || {};
    if (!(await isMember(projectId, req.user._id))) return res.status(403).json({ success: false, message: 'Forbidden' });
    const clean = sanitizeHtml(content || '', { allowedTags: [], allowedAttributes: {} }).trim();
    if (!clean) return res.status(400).json({ success: false, message: 'Empty message' });
    const msg = await Message.create({ project: projectId, sender: req.user._id, content: clean, mentions });
    const populated = await msg.populate('sender', 'username fullName profileImage');
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
    msg.content = clean; msg.edited = true; await msg.save();
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
    msg.deletedAt = new Date(); await msg.save();
    res.json({ success: true });
  } catch (e) {
    console.error('deleteMessage error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
