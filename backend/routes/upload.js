const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { uploadProfileImage, deleteProfileImage } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

// Test route to verify router is working (no auth required)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Upload router is working!' });
});

// Upload profile image
router.post('/profile-image', authenticateToken, upload.single('profileImage'), uploadProfileImage);

// Delete profile image
router.delete('/profile-image', authenticateToken, deleteProfileImage);

module.exports = router;
