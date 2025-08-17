const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/security');
const { body } = require('express-validator');
const {
  createProblem,
  getProblems,
  getProblemById,
  getMyProblems,
  getJoinedProblems,
  updateProblem,
  deleteProblem,
  updateGitHubRepository,
  getGitHubRepository,
  lockGitHubRepository,
  unlockGitHubRepository,
  endProject
} = require('../controllers/problemController');

// Public routes
router.get('/', getProblems); // Get all problems (public)

// Protected routes
router.use(authenticateToken); // Apply auth middleware to all routes below

// Specific routes MUST come before parameterized routes
router.get('/joined', getJoinedProblems); // Get problems user has joined
router.get('/my/problems', getMyProblems); // Get my problems (creators only)

// Parameterized routes come after specific routes with validation
router.get('/:id', getProblemById); // Get problem by ID (authenticated)
router.post('/', validationRules.problemValidation, handleValidationErrors, createProblem); // Create new problem (creators only)
router.put('/:id', validationRules.problemValidation, handleValidationErrors, updateProblem); // Update problem (creator/admin only)
router.delete('/:id', deleteProblem); // Delete problem (creator/admin only)

// GitHub repository routes with validation
router.put('/:projectId/github-repository', [
  body('repositoryUrl').isURL().withMessage('Invalid repository URL'),
  body('repositoryName').isLength({ min: 1, max: 100 }).withMessage('Repository name must be 1-100 characters')
], handleValidationErrors, updateGitHubRepository); // Update GitHub repository
router.get('/:projectId/github-repository', getGitHubRepository); // Get GitHub repository
router.put('/:projectId/github-repository/lock', lockGitHubRepository); // Lock GitHub repository
router.put('/:projectId/github-repository/unlock', unlockGitHubRepository); // Unlock GitHub repository

// Project management routes
router.put('/:id/end', endProject); // End project (creator only)

module.exports = router;
