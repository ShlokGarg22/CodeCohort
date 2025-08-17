const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors 
} = require('../middleware/security');
const { body, param } = require('express-validator');
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  reorderTasks
} = require('../controllers/taskController');

// All routes require authentication
router.use(authenticateToken);
router.use(rateLimits.general);
router.use(sanitizeInput);

// Task validation rules
const taskValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Task title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Task description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Task status must be todo, in-progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Task priority must be low, medium, or high'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
];

const taskUpdateValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Task title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Task description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Task status must be todo, in-progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Task priority must be low, medium, or high'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
];

const reorderValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  body('tasks')
    .isArray()
    .withMessage('Tasks must be an array'),
  body('tasks.*.taskId')
    .isMongoId()
    .withMessage('Invalid task ID in reorder array'),
  body('tasks.*.order')
    .isInt({ min: 0 })
    .withMessage('Task order must be a non-negative integer')
];

// Task routes
router.post('/projects/:projectId/tasks', [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  ...taskValidation
], handleValidationErrors, createTask);

router.get('/projects/:projectId/tasks', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], handleValidationErrors, getProjectTasks);

router.put('/tasks/:taskId', taskUpdateValidation, handleValidationErrors, updateTask);

router.delete('/tasks/:taskId', [
  param('taskId').isMongoId().withMessage('Invalid task ID')
], handleValidationErrors, deleteTask);

router.put('/projects/:projectId/tasks/reorder', reorderValidation, handleValidationErrors, reorderTasks);

module.exports = router;
