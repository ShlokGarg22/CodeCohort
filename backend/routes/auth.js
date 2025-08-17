const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/security');
const { auditLogger } = require('../utils/auditLogger');
const {
  signup,
  signin,
  getProfile,
  getUserProfile,
  updateProfile,
  changePassword,
  logout,
  getPendingCreators,
  updateCreatorStatus,
  getAllUsers,
  githubCallback
} = require('../controllers/authController');

// Public routes with validation
router.post('/signup', validationRules.userValidation, handleValidationErrors, signup);
router.post('/signin', [
  // Custom validation for signin
  require('express-validator').body('email').isEmail().normalizeEmail(),
  require('express-validator').body('password').isLength({ min: 1 })
], handleValidationErrors, signin);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/signin' }),
  githubCallback
);

// Protected routes with validation
router.use(authenticateToken); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.get('/users/:userId', getUserProfile); // Get another user's public profile
router.put('/profile', validationRules.userValidation, handleValidationErrors, updateProfile);
router.put('/change-password', [
  require('express-validator').body('currentPassword').isLength({ min: 1 }),
  require('express-validator').body('newPassword').isLength({ min: 6 })
], handleValidationErrors, changePassword);
router.post('/logout', logout);

// Admin routes
router.get('/admin/pending-creators', requireAdmin, getPendingCreators);
router.put('/admin/creator-status', requireAdmin, updateCreatorStatus);
router.get('/admin/users', requireAdmin, getAllUsers);

module.exports = router;
