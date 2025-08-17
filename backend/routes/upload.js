const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { uploadProfileImage, deleteProfileImage } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors 
} = require('../middleware/security');

//Apply rate limiting and sanitization to authenticated routes
const uploadRateLimit = rateLimits.general;

// Test route to verify router is working (no auth required)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Upload router is working!' });
});

// File upload validation middleware
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB'
    });
  }

  // Check file type for profile images
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
    });
  }

  next();
};

// Upload profile image
router.post('/profile-image', 
  authenticateToken, 
  uploadRateLimit, 
  sanitizeInput, 
  upload.single('profileImage'), 
  validateFileUpload,
  uploadProfileImage
);

// Delete profile image
router.delete('/profile-image', 
  authenticateToken, 
  uploadRateLimit, 
  sanitizeInput, 
  deleteProfileImage
);

module.exports = router;
