const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  requestToJoinTeam,
  respondToJoinRequest,
  getProjectJoinRequests,
  getCreatorJoinRequests,
  getUserJoinRequests,
  leaveTeam,
  getTeamMembers
} = require('../controllers/teamController');

// All routes require authentication
router.use(authenticateToken);

// Team join request routes
router.post('/projects/:projectId/join', requestToJoinTeam);
router.get('/projects/:projectId/requests', getProjectJoinRequests);
router.get('/requests/creator', getCreatorJoinRequests);
router.put('/requests/:requestId/respond', respondToJoinRequest);
router.get('/requests/my', getUserJoinRequests);
router.get('/projects/:projectId/team', getTeamMembers);
router.delete('/projects/:projectId/leave', leaveTeam);

module.exports = router;
