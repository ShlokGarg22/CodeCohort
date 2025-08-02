const TeamRequest = require('../models/TeamRequest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { z } = require('zod');

// Validation schema for team join request
const joinRequestSchema = z.object({
  message: z.string().max(500, 'Message must not exceed 500 characters').optional().default('')
});

// Send a request to join a team
const requestToJoinTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const validatedData = joinRequestSchema.parse(req.body);

    // Check if project exists
    const project = await Problem.findById(projectId).populate('createdBy');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is active
    if (!project.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting new members'
      });
    }

    // Check if user is already a team member
    const isAlreadyMember = project.teamMembers.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Check if user has reached max projects limit
    const userWithProjects = await User.findById(req.user._id);
    if (userWithProjects.joinedProjects && userWithProjects.joinedProjects.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'You can only join up to 5 projects'
      });
    }

    // Check if there's already a pending request
    const existingRequest = await TeamRequest.findOne({
      project: projectId,
      requester: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this project'
      });
    }

    // Create the join request
    const teamRequest = new TeamRequest({
      project: projectId,
      requester: req.user._id,
      message: validatedData.message
    });

    await teamRequest.save();

    // Get populated request data for socket emission
    const populatedRequest = await TeamRequest.findById(teamRequest._id)
      .populate('requester', 'username fullName profileImage')
      .populate('project', 'title description');

    // Emit real-time notification to creator via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${project.createdBy._id}`).emit('new-join-request', {
        requestId: populatedRequest._id,
        projectId: project._id,
        projectTitle: project.title,
        requester: {
          id: populatedRequest.requester._id,
          username: populatedRequest.requester.username,
          fullName: populatedRequest.requester.fullName,
          profileImage: populatedRequest.requester.profileImage
        },
        message: populatedRequest.message,
        timestamp: populatedRequest.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: populatedRequest
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Request to join team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Respond to a team join request (approve/reject)
const respondToJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    // Find the request
    const teamRequest = await TeamRequest.findById(requestId)
      .populate('project')
      .populate('requester', 'username fullName profileImage');

    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Check if user is the project creator
    if (teamRequest.project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can respond to join requests'
      });
    }

    // Check if request is still pending
    if (teamRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request status
    teamRequest.status = action === 'approve' ? 'approved' : 'rejected';
    teamRequest.respondedAt = new Date();
    await teamRequest.save();

    // If approved, add user to team
    if (action === 'approve') {
      const project = await Problem.findById(teamRequest.project._id);
      
      // Check if team is full
      if (project.teamMembers.length >= 10) { // Max team size
        return res.status(400).json({
          success: false,
          message: 'Team is already full'
        });
      }

      // Add user to team
      project.teamMembers.push({
        user: teamRequest.requester._id,
        joinedAt: new Date(),
        role: 'developer'
      });
      
      await project.save();

      // Add project to user's joined projects
      await User.findByIdAndUpdate(teamRequest.requester._id, {
        $addToSet: { joinedProjects: project._id }
      });
    }

    // Emit real-time notification to requester via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${teamRequest.requester._id}`).emit('join-request-response', {
        requestId: teamRequest._id,
        projectId: teamRequest.project._id,
        projectTitle: teamRequest.project.title,
        approved: action === 'approve',
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Request ${action}d successfully`,
      data: teamRequest
    });

  } catch (error) {
    console.error('Respond to join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending join requests for a project (creator only)
const getProjectJoinRequests = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and user is the creator
    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can view join requests'
      });
    }

    // Get all pending requests for this project
    const requests = await TeamRequest.find({
      project: projectId,
      status: 'pending'
    })
    .populate('requester', 'username fullName profileImage')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get project join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's join request history
const getUserJoinRequests = async (req, res) => {
  try {
    const requests = await TeamRequest.find({
      requester: req.user._id
    })
    .populate('project', 'title description createdBy')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get user join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Leave a team
const leaveTeam = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is a team member
    const memberIndex = project.teamMembers.findIndex(
      member => member.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Remove user from team
    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    // Remove project from user's joined projects
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedProjects: projectId }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left the team'
    });

  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get team members for a project
const getTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Problem.findById(projectId)
      .populate('createdBy', 'username fullName profileImage')
      .populate('teamMembers.user', 'username fullName profileImage');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to view team members
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isTeamMember = project.teamMembers.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isTeamMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const teamData = {
      creator: project.createdBy,
      members: project.teamMembers,
      totalMembers: project.teamMembers.length + 1 // +1 for creator
    };

    res.status(200).json({
      success: true,
      data: teamData
    });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  requestToJoinTeam,
  respondToJoinRequest,
  getProjectJoinRequests,
  getUserJoinRequests,
  leaveTeam,
  getTeamMembers
};
