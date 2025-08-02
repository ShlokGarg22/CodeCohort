const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  reorderTasks
} = require('../controllers/taskController');

// All routes require authentication
router.use(authenticateToken);

// Task routes
router.post('/projects/:projectId/tasks', createTask);
router.get('/projects/:projectId/tasks', getProjectTasks);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.put('/projects/:projectId/tasks/reorder', reorderTasks);

module.exports = router;
