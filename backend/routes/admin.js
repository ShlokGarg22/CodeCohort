const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  rateLimits, 
  sanitizeInput, 
  handleValidationErrors 
} = require('../middleware/security');
const { body, param, query } = require('express-validator');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Message = require('../models/Message');
const TeamRequest = require('../models/TeamRequest');

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);
router.use(rateLimits.general);
router.use(sanitizeInput);

// Admin validation rules
const roleUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['user', 'creator', 'admin']).withMessage('Invalid role specified')
];

const banUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ban reason must not exceed 500 characters')
];

const problemApprovalValidation = [
  param('id').isMongoId().withMessage('Invalid problem ID'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Approval notes must not exceed 1000 characters')
];

const exportValidation = [
  query('type')
    .isIn(['users', 'problems', 'analytics'])
    .withMessage('Export type must be users, problems, or analytics')
];

const projectEndValidation = [
  param('id').isMongoId().withMessage('Invalid problem ID'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('End reason must not exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['completed', 'cancelled', 'ended'])
    .withMessage('Status must be completed, cancelled, or ended')
];

// Admin metrics
router.get('/metrics', async (req, res) => {
  try {
    const [
      totalUsers,
      activeProjects,
      totalMessages,
      pendingRequests,
      totalTeams,
      activeSessions,
      pendingCreators,
      approvedCreators,
      admins
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments({ isActive: true }),
      Message.countDocuments(),
      TeamRequest.countDocuments({ status: 'pending' }),
      Problem.countDocuments({ 'teamMembers.0': { $exists: true } }),
      User.countDocuments({ 
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      User.countDocuments({ role: 'creator', creatorStatus: 'pending' }),
      User.countDocuments({ role: 'creator', creatorStatus: 'approved' }),
      User.countDocuments({ role: 'admin' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeProjects,
        totalMessages,
        pendingRequests,
        totalTeams,
        activeSessions,
        pendingCreators,
        approvedCreators,
        admins
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch metrics',
      error: error.message 
    });
  }
});

// Get all problems for moderation
router.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate('createdBy', 'fullName email username')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch problems',
      error: error.message 
    });
  }
});

// Approve problem
router.patch('/problems/:id/approve', problemApprovalValidation, handleValidationErrors, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      message: 'Problem approved successfully',
      data: problem
    });
  } catch (error) {
    console.error('Error approving problem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve problem',
      error: error.message 
    });
  }
});

// Update user role
router.patch('/users/:id/role', roleUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        role,
        ...(role === 'creator' && { creatorStatus: 'pending' })
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role',
      error: error.message 
    });
  }
});

// Ban user
router.patch('/users/:id/ban', banUserValidation, handleValidationErrors, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'banned',
        bannedBy: req.user._id,
        bannedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User banned successfully',
      data: user
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to ban user',
      error: error.message 
    });
  }
});

// System health
router.get('/system-health', async (req, res) => {
  try {
    const activeConnections = await User.countDocuments({ 
      updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } 
    });
    
    // Calculate uptime (in a real app, you'd track actual server uptime)
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: `${uptimeHours}h ${uptimeMinutes}m`,
        responseTime: '45ms',
        activeConnections,
        serverUptime: uptime,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system health',
      error: error.message 
    });
  }
});

// Recent activities (simplified version - in a real app you'd have an activity log)
router.get('/activities', async (req, res) => {
  try {
    // Get recent users and problems as activities
    const [recentUsers, recentProblems] = await Promise.all([
      User.find()
        .select('fullName createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      Problem.find()
        .populate('createdBy', 'fullName')
        .select('title createdBy createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        _id: `user-${user._id}`,
        user: user.fullName,
        action: 'registered on the platform',
        timestamp: user.createdAt,
        type: 'user_registration'
      });
    });

    // Add problem creations
    recentProblems.forEach(problem => {
      activities.push({
        _id: `problem-${problem._id}`,
        user: problem.createdBy?.fullName || 'Unknown User',
        action: `created problem "${problem.title}"`,
        timestamp: problem.createdAt,
        type: 'problem_creation'
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, 20);

    res.json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activities',
      error: error.message 
    });
  }
});

// Get team requests
router.get('/team-requests', async (req, res) => {
  try {
    const requests = await TeamRequest.find({ status: 'pending' })
      .populate('requester', 'fullName email username')
      .populate('problem', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching team requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team requests',
      error: error.message 
    });
  }
});

// Export data (enhanced version with multiple formats)
router.get('/export', exportValidation, handleValidationErrors, async (req, res) => {
  try {
    const { type } = req.query;
    
    let data;
    let filename;
    let exportData = {};
    
    switch (type) {
      case 'users':
        data = await User.find()
          .select('-password')
          .populate('approvedBy', 'fullName email')
          .populate('bannedBy', 'fullName email')
          .sort({ createdAt: -1 });
        
        exportData = {
          exportInfo: {
            type: 'users',
            exportDate: new Date().toISOString(),
            totalRecords: data.length,
            description: 'Complete user database export including profiles, roles, and status information'
          },
          summary: {
            totalUsers: data.length,
            usersByRole: {
              admin: data.filter(u => u.role === 'admin').length,
              creator: data.filter(u => u.role === 'creator').length,
              user: data.filter(u => u.role === 'user').length
            },
            usersByStatus: {
              active: data.filter(u => u.status === 'active' || !u.status).length,
              banned: data.filter(u => u.status === 'banned').length,
              suspended: data.filter(u => u.status === 'suspended').length
            },
            creatorsByStatus: {
              pending: data.filter(u => u.role === 'creator' && u.creatorStatus === 'pending').length,
              approved: data.filter(u => u.role === 'creator' && u.creatorStatus === 'approved').length,
              rejected: data.filter(u => u.role === 'creator' && u.creatorStatus === 'rejected').length
            }
          },
          users: data
        };
        filename = 'users_export';
        break;
        
      case 'problems':
        data = await Problem.find()
          .populate('createdBy', 'fullName email username')
          .populate('approvedBy', 'fullName email')
          .populate('teamMembers.user', 'fullName email username')
          .sort({ createdAt: -1 });
        
        exportData = {
          exportInfo: {
            type: 'problems',
            exportDate: new Date().toISOString(),
            totalRecords: data.length,
            description: 'Complete problems/projects database export including team information and metadata'
          },
          summary: {
            totalProblems: data.length,
            problemsByDifficulty: {
              Beginner: data.filter(p => p.difficulty === 'Beginner').length,
              Intermediate: data.filter(p => p.difficulty === 'Intermediate').length,
              Advanced: data.filter(p => p.difficulty === 'Advanced').length
            },
            problemsByStatus: {
              active: data.filter(p => p.isActive).length,
              inactive: data.filter(p => !p.isActive).length,
              approved: data.filter(p => p.status === 'approved').length,
              pending: data.filter(p => p.status === 'pending').length
            },
            averageTeamSize: data.reduce((acc, p) => acc + (p.teamMembers?.length || 0), 0) / data.length || 0,
            totalParticipants: data.reduce((acc, p) => acc + (p.teamMembers?.length || 0), 0)
          },
          problems: data
        };
        filename = 'problems_export';
        break;
        
      case 'analytics':
        // Gather comprehensive analytics data
        const [
          userStats,
          problemStats,
          messageStats,
          teamRequestStats,
          recentActivity
        ] = await Promise.all([
          User.aggregate([
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                adminCount: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
                creatorCount: { $sum: { $cond: [{ $eq: ["$role", "creator"] }, 1, 0] } },
                userCount: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
                bannedCount: { $sum: { $cond: [{ $eq: ["$status", "banned"] }, 1, 0] } },
                avgProjectsPerUser: { $avg: { $size: "$joinedProjects" } }
              }
            }
          ]),
          Problem.aggregate([
            {
              $group: {
                _id: null,
                totalProblems: { $sum: 1 },
                activeProblems: { $sum: { $cond: ["$isActive", 1, 0] } },
                avgViews: { $avg: "$views" },
                avgLikes: { $avg: "$likes" },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" }
              }
            }
          ]),
          Message.aggregate([
            {
              $group: {
                _id: null,
                totalMessages: { $sum: 1 }
              }
            }
          ]),
          TeamRequest.aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ]),
          User.find()
            .select('createdAt')
            .sort({ createdAt: -1 })
            .limit(30)
        ]);

        // Calculate growth metrics
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [newUsersLast30Days, newProblemsLast30Days] = await Promise.all([
          User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
          Problem.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        exportData = {
          exportInfo: {
            type: 'analytics',
            exportDate: new Date().toISOString(),
            description: 'Comprehensive platform analytics and usage statistics'
          },
          platformOverview: {
            totalUsers: userStats[0]?.totalUsers || 0,
            totalProblems: problemStats[0]?.totalProblems || 0,
            totalMessages: messageStats[0]?.totalMessages || 0,
            platformAge: Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
          },
          userAnalytics: userStats[0] || {},
          problemAnalytics: problemStats[0] || {},
          growthMetrics: {
            newUsersLast30Days,
            newProblemsLast30Days,
            userGrowthRate: ((newUsersLast30Days / (userStats[0]?.totalUsers || 1)) * 100).toFixed(2) + '%',
            problemGrowthRate: ((newProblemsLast30Days / (problemStats[0]?.totalProblems || 1)) * 100).toFixed(2) + '%'
          },
          teamRequestStats: teamRequestStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          recentUserRegistrations: recentActivity.map(user => ({
            date: user.createdAt,
            month: new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          }))
        };
        filename = 'analytics_export';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type. Available types: users, problems, analytics'
        });
    }

    // Set headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${timestamp}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data',
      error: error.message 
    });
  }
});

// Admin Project Management

// End project (admin only)
router.put('/problems/:id/end', projectEndValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status = 'ended' } = req.body;

    const problem = await Problem.findById(id)
      .populate('teamMembers.user', 'username fullName email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is already ended
    if (problem.projectStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Project is already ${problem.projectStatus}`
      });
    }

    // Validate status
    const validStatuses = ['completed', 'cancelled', 'ended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project status. Must be completed, cancelled, or ended'
      });
    }

    // Update project status
    problem.projectStatus = status;
    problem.endedAt = new Date();
    problem.endReason = reason || `Project ${status} by admin`;
    problem.isActive = false; // Mark as inactive for listing purposes
    await problem.save();

    // Remove project from all team members' joined projects
    const User = require('../models/User');
    const teamMemberIds = problem.teamMembers.map(member => member.user._id);
    
    await User.updateMany(
      { _id: { $in: teamMemberIds } },
      { $pull: { joinedProjects: id } }
    );

    // Remove creator's project reference as well
    await User.findByIdAndUpdate(
      problem.createdBy,
      { $pull: { joinedProjects: id } }
    );

    // Clean up pending team requests
    const TeamRequest = require('../models/TeamRequest');
    await TeamRequest.deleteMany({ project: id, status: 'pending' });

    res.status(200).json({
      success: true,
      message: `Project ${status} successfully by admin`,
      data: {
        project: {
          _id: problem._id,
          title: problem.title,
          projectStatus: problem.projectStatus,
          endedAt: problem.endedAt,
          endReason: problem.endReason
        }
      }
    });

  } catch (error) {
    console.error('Admin end project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete project permanently (admin only)
router.delete('/problems/:id', [param('id').isMongoId().withMessage('Invalid problem ID')], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .populate('teamMembers.user', 'username fullName email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove project from all team members' joined projects
    const User = require('../models/User');
    const teamMemberIds = problem.teamMembers.map(member => member.user._id);
    
    await User.updateMany(
      { _id: { $in: teamMemberIds } },
      { $pull: { joinedProjects: id } }
    );

    // Remove creator's project reference as well
    await User.findByIdAndUpdate(
      problem.createdBy,
      { $pull: { joinedProjects: id } }
    );

    // Clean up related data
    const TeamRequest = require('../models/TeamRequest');
    const Task = require('../models/Task');
    const Message = require('../models/Message');

    await Promise.all([
      TeamRequest.deleteMany({ project: id }),
      Task.deleteMany({ projectId: id }),
      Message.deleteMany({ project: id })
    ]);

    // Delete the project
    await Problem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted permanently by admin',
      data: {
        deletedProject: {
          _id: problem._id,
          title: problem.title
        }
      }
    });

  } catch (error) {
    console.error('Admin delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
