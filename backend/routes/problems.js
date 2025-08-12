const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createProblem,
  getProblems,
  getProblemById,
  getMyProblems,
  updateProblem,
  deleteProblem,
  updateGitHubRepository,
  getGitHubRepository,
  lockGitHubRepository,
  unlockGitHubRepository
} = require('../controllers/problemController');

// Public routes
router.get('/', getProblems); // Get all problems (public)

// Protected routes
router.use(authenticateToken); // Apply auth middleware to all routes below

router.get('/:id', getProblemById); // Get problem by ID (authenticated)
router.post('/', createProblem); // Create new problem (creators only)
router.get('/my/problems', getMyProblems); // Get my problems (creators only)
router.put('/:id', updateProblem); // Update problem (creator/admin only)
router.delete('/:id', deleteProblem); // Delete problem (creator/admin only)

// GitHub repository routes
router.put('/:projectId/github-repository', updateGitHubRepository); // Update GitHub repository
router.get('/:projectId/github-repository', getGitHubRepository); // Get GitHub repository
router.put('/:projectId/github-repository/lock', lockGitHubRepository); // Lock GitHub repository
router.put('/:projectId/github-repository/unlock', unlockGitHubRepository); // Unlock GitHub repository

module.exports = router;
