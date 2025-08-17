const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors 
} = require('../middleware/security');
const { body, param } = require('express-validator');
const ai = require('../controllers/aiController');

router.use(authenticateToken);
router.use(rateLimits.general);
router.use(sanitizeInput);

// AI prompt validation
const promptValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  body('prompt')
    .isLength({ min: 10, max: 2000 })
    .withMessage('AI prompt must be between 10 and 2000 characters'),
  body('context')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Context must not exceed 5000 characters')
];

router.post('/:projectId/prompt', promptValidation, handleValidationErrors, ai.prompt);
router.get('/health', ai.health);

module.exports = router;
