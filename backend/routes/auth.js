const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  signup,
  signin,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getPendingCreators,
  updateCreatorStatus,
  getAllUsers
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.use(authenticateToken); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

// Admin routes
router.get('/admin/pending-creators', getPendingCreators);
router.put('/admin/creator-status', updateCreatorStatus);
router.get('/admin/users', getAllUsers);

module.exports = router;
