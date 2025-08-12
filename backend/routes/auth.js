const express = require('express');
const router = express.Router();
const passport = require('passport');
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
  getAllUsers,
  githubCallback
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/signin' }),
  githubCallback
);

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
