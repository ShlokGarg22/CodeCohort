const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const chat = require('../controllers/chatController');
const { upload } = require('../config/cloudinary');

router.use(authenticateToken);

// REST endpoints for messages
router.get('/:projectId/messages', chat.getMessages);
router.post('/:projectId/messages', chat.sendMessage);
router.post('/:projectId/messages/image', upload.single('image'), chat.sendMessage);
router.put('/:projectId/messages/:messageId', chat.editMessage);
router.delete('/:projectId/messages/:messageId', chat.deleteMessage);

module.exports = router;
