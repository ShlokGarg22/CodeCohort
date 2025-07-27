const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  signup,
  signin,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.use(authenticateToken); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

module.exports = router;
