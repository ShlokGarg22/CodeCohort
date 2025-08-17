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
    .populate('requester', 'username fullName profileImage bio location skills experience role')
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

// Cancel a join request (only by the requester)
const cancelJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await TeamRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if the request belongs to the user
    if (request.requester.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    await TeamRequest.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: 'Join request cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Cancel join request error:', error);
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

// Get join requests for a specific project (creator only)
const getProjectJoinRequests = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and user is creator
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
        message: 'Access denied'
      });
    }

    const requests = await TeamRequest.find({
      project: projectId,
      status: 'pending'
    }).populate('requester', 'username fullName profileImage');

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Get project join requests error:', error);
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
    const userId = req.user._id;

    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove user from team
    project.teamMembers = project.teamMembers.filter(
      member => member.user.toString() !== userId.toString()
    );
    await project.save();

    // Remove project from user's joined projects
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedProjects: projectId }
    });

    res.json({
      success: true,
      message: 'Successfully left the team'
    });

  } catch (error) {
    console.error('❌ Leave team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove a team member (creator only)
const removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can remove team members'
      });
    }

    // Remove user from team
    project.teamMembers = project.teamMembers.filter(
      member => member.user.toString() !== userId.toString()
    );
    await project.save();

    // Remove project from user's joined projects
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedProjects: projectId }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update member role (creator only)
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can update member roles'
      });
    }

    // Find and update member role
    const memberIndex = project.teamMembers.findIndex(
      member => member.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    project.teamMembers[memberIndex].role = role;
    await project.save();

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });

  } catch (error) {
    console.error('❌ Update member role error:', error);
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
  getCreatorJoinRequests,
  getUserJoinRequests,
  cancelJoinRequest,
  leaveTeam,
  getTeamMembers,
  removeTeamMember,
  updateMemberRole
};
