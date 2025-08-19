const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Test authentication endpoint
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      creatorStatus: req.user.creatorStatus,
      status: req.user.status
    }
  });
});

// Test creator permissions
router.get('/test-creator', authenticateToken, (req, res) => {
  if (req.user.role !== 'creator' || req.user.creatorStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only approved creators can access this endpoint.',
      currentRole: req.user.role,
      currentCreatorStatus: req.user.creatorStatus
    });
  }

  res.json({
    success: true,
    message: 'Creator permissions verified',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      creatorStatus: req.user.creatorStatus
    }
  });
});

module.exports = router;
