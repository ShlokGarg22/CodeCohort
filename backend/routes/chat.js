const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/security');
const { body } = require('express-validator');
const chat = require('../controllers/chatController');
const { upload } = require('../config/cloudinary');

router.use(authenticateToken);

// REST endpoints for messages with validation
router.get('/:projectId/messages', chat.getMessages);
router.post('/:projectId/messages', validationRules.messageValidation, handleValidationErrors, chat.sendMessage);
router.post('/:projectId/messages/image', upload.single('image'), chat.sendMessage);
router.put('/:projectId/messages/:messageId', [
  body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
], handleValidationErrors, chat.editMessage);
router.delete('/:projectId/messages/:messageId', chat.deleteMessage);

module.exports = router;
