const TeamRequest = require('../models/TeamRequest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { z } = require('zod');

// Validation schemas
const joinRequestSchema = z.object({
  message: z.string().max(500).optional().default('')
});

const respondSchema = z.object({
  action: z.enum(['approve', 'reject'])
});

// Send a request to join a team
const requestToJoinTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const validatedData = joinRequestSchema.parse(req.body);
    const userId = req.user._id;

    console.log('📨 New join request:', { projectId, userId, message: validatedData.message });

    // Find and validate project
    const project = await Problem.findById(projectId).populate('createdBy', 'username fullName');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Prevent self-joining
    if (project.createdBy._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own project'
      });
    }

    // Check if already a member
    const isAlreadyMember = project.teamMembers.some(
      member => member.user.toString() === userId.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Check for existing request
    const existingRequest = await TeamRequest.findOne({
      project: projectId,
      requester: userId
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this project'
        });
      }
      // Delete old request if rejected/approved
      await TeamRequest.findByIdAndDelete(existingRequest._id);
    }

    // Create new request
    const teamRequest = new TeamRequest({
      project: projectId,
      requester: userId,
      creator: project.createdBy._id,
      message: validatedData.message
    });

    await teamRequest.save();

    // Get populated request for response
    const populatedRequest = await TeamRequest.findById(teamRequest._id)
      .populate('requester', 'username fullName profileImage')
      .populate('project', 'title description')
      .populate('creator', 'username');

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
      const notification = {
        type: 'new-join-request',
        requestId: populatedRequest._id.toString(),
        projectId: project._id.toString(),
        projectTitle: project.title,
        requester: {
          id: populatedRequest.requester._id.toString(),
          username: populatedRequest.requester.username,
          fullName: populatedRequest.requester.fullName,
          profileImage: populatedRequest.requester.profileImage
        },
        message: populatedRequest.message,
        timestamp: populatedRequest.createdAt
      };

      console.log('📡 Sending notification to creator:', project.createdBy._id);
      io.to(`user-${project.createdBy._id}`).emit('new-join-request', notification);
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

    console.error('❌ Request to join team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Respond to a join request
const respondToJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const validatedData = respondSchema.parse(req.body);
    const { action } = validatedData;
    const userId = req.user._id;

    console.log('📋 Processing response:', { requestId, action, userId });

    // Find and validate request
    const request = await TeamRequest.findById(requestId)
      .populate('requester', 'username fullName profileImage joinedProjects maxProjects')
      .populate('project', 'title description teamMembers maxTeamSize createdBy')
      .populate('creator', 'username');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Verify user is the creator
    if (request.creator._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can respond to join requests'
      });
    }

    // Check if already processed
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status}`
      });
    }

    // Update request status
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.respondedAt = new Date();
    await request.save();

    let responseMessage = '';
    
    if (action === 'approve') {
      // Add user to team
      const project = await Problem.findById(request.project._id);
      
      // Check capacity
      if (project.teamMembers.length >= project.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: 'Team is at maximum capacity'
        });
      }

      // Add to team
      project.teamMembers.push({
        user: request.requester._id,
        role: 'developer',
        joinedAt: new Date()
      });
      await project.save();

      // Update user's joined projects
      await User.findByIdAndUpdate(
        request.requester._id,
        { $addToSet: { joinedProjects: request.project._id } }
      );

      responseMessage = `Your request to join "${request.project.title}" has been approved!`;
    } else {
      responseMessage = `Your request to join "${request.project.title}" has been rejected.`;
    }

    // Send notification to requester
    const io = req.app.get('io');
    if (io) {
      const notification = {
        type: 'join-request-response',
        requestId: request._id.toString(),
        projectId: request.project._id.toString(),
        projectTitle: request.project.title,
        status: request.status,
        message: responseMessage,
        timestamp: request.respondedAt
      };

      console.log('📡 Sending response to requester:', request.requester._id);
      io.to(`user-${request.requester._id}`).emit('join-request-response', notification);
    }

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      data: {
        requestId: request._id,
        status: request.status,
        projectTitle: request.project.title,
        requesterName: request.requester.username
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('❌ Respond to join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get join requests for creator
const getCreatorJoinRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await TeamRequest.find({
      creator: userId,
      status: 'pending'
    })
    .populate('requester', 'username fullName profileImage')
    .populate('project', 'title description')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Get creator join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's own requests
const getUserJoinRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await TeamRequest.find({
      requester: userId
    })
    .populate('project', 'title description')
    .populate('creator', 'username fullName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Get user join requests error:', error);
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
    const userId = req.user._id;

    const project = await Problem.findById(projectId)
      .populate('teamMembers.user', 'username fullName profileImage')
      .populate('createdBy', 'username fullName profileImage');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access (is creator or team member)
    const isCreator = project.createdBy._id.toString() === userId.toString();
    const isMember = project.teamMembers.some(
      member => member.user._id.toString() === userId.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        creator: project.createdBy,
        members: project.teamMembers,
        totalMembers: project.teamMembers.length,
        maxTeamSize: project.maxTeamSize
      }
    });

  } catch (error) {
    console.error('❌ Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  requestToJoinTeam,
  respondToJoinRequest,
  getCreatorJoinRequests,
  getUserJoinRequests,
  getTeamMembers
};
