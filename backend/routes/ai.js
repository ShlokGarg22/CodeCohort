const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const ai = require('../controllers/aiController');

router.use(authenticateToken);

router.post('/:projectId/prompt', ai.prompt);
router.get('/health', ai.health);

module.exports = router;
