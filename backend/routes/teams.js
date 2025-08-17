const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors, 
  validationRules 
} = require('../middleware/security');
const { body, param } = require('express-validator');
const {
  requestToJoinTeam,
  respondToJoinRequest,
  getProjectJoinRequests,
  getCreatorJoinRequests,
  getUserJoinRequests,
  cancelJoinRequest,
  leaveTeam,
  getTeamMembers,
  removeTeamMember,
  updateMemberRole
} = require('../controllers/teamController');

// All routes require authentication
router.use(authenticateToken);
router.use(rateLimits.teamOperations);
router.use(sanitizeInput);

// Team join request validation
const joinRequestValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Join request message must not exceed 500 characters')
];

// Response validation
const responseValidation = [
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  body('response').isIn(['accept', 'reject']).withMessage('Response must be accept or reject'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Response message must not exceed 500 characters')
];

// Role update validation
const roleUpdateValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['member', 'moderator']).withMessage('Role must be member or moderator')
];

// Team join request routes
router.post('/projects/:projectId/join', joinRequestValidation, handleValidationErrors, requestToJoinTeam);
router.get('/projects/:projectId/requests', [param('projectId').isMongoId()], handleValidationErrors, getProjectJoinRequests);
router.get('/requests/creator', getCreatorJoinRequests);
router.put('/requests/:requestId/respond', responseValidation, handleValidationErrors, respondToJoinRequest);
router.get('/requests/my', getUserJoinRequests);
router.delete('/requests/:requestId/cancel', [param('requestId').isMongoId()], handleValidationErrors, cancelJoinRequest);
router.get('/projects/:projectId/team', [param('projectId').isMongoId()], handleValidationErrors, getTeamMembers);
router.delete('/projects/:projectId/leave', [param('projectId').isMongoId()], handleValidationErrors, leaveTeam);
router.delete('/projects/:projectId/members/:userId', [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  param('userId').isMongoId().withMessage('Invalid user ID')
], handleValidationErrors, removeTeamMember);
router.put('/projects/:projectId/members/:userId/role', roleUpdateValidation, handleValidationErrors, updateMemberRole);

module.exports = router;
