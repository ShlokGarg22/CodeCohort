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

    console.log('📨 Join request received:', {
      projectId,
      requesterId: req.user._id,
      requesterName: req.user.username
    });

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

    // Prevent creator from joining their own project
    if (project.createdBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own project'
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

    // Check user's project limit
    const userWithProjects = await User.findById(req.user._id);
    if (userWithProjects.joinedProjects && userWithProjects.joinedProjects.length >= userWithProjects.maxProjects) {
      return res.status(400).json({
        success: false,
        message: `You can only join up to ${userWithProjects.maxProjects} projects`
      });
    }

    // Check team capacity
    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team is full (${project.teamMembers.length}/${project.maxTeamSize})`
      });
    }

    // Check for existing requests
    const existingRequest = await TeamRequest.findOne({
      project: projectId,
      requester: req.user._id
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this project'
        });
      } else if (existingRequest.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'You are already approved for this project'
        });
      } else if (existingRequest.status === 'rejected') {
        // Allow reapplication after rejection
        await TeamRequest.findByIdAndDelete(existingRequest._id);
      }
    }

    // Create new join request
    const teamRequest = new TeamRequest({
      project: projectId,
      requester: req.user._id,
      creator: project.createdBy._id,
      message: validatedData.message || ''
    });

    await teamRequest.save();

    // Populate request data for response
    const populatedRequest = await TeamRequest.findById(teamRequest._id)
      .populate('requester', 'username fullName profileImage')
      .populate('project', 'title description');

    // Emit real-time notification to creator
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        type: 'new-join-request',
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
      };

      console.log('📡 Sending notification to creator:', project.createdBy._id);
      io.to(`user-${project.createdBy._id}`).emit('new-join-request', notificationData);
    }

    console.log('✅ Join request created successfully');
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

// Respond to a team join request (approve/reject)
const respondToJoinRequest = async (req, res) => {
  try {
    console.log('📨 Processing join request response:', {
      requestId: req.params.requestId,
      action: req.body.action,
      userId: req.user._id
    });

    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      console.log('❌ Invalid action provided:', action);
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    // Find the request
    const teamRequest = await TeamRequest.findById(requestId)
      .populate('project')
      .populate('requester', 'username fullName profileImage');

    console.log('📋 Found team request:', teamRequest?._id);

    if (!teamRequest) {
      console.log('❌ Team request not found:', requestId);
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Check if user is the project creator
    const isCreator = teamRequest.project.createdBy.toString() === req.user._id.toString();
    console.log('🔐 Permission check:', {
      projectCreator: teamRequest.project.createdBy.toString(),
      currentUser: req.user._id.toString(),
      isCreator
    });

    if (!isCreator) {
      console.log('❌ User is not the project creator');
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can respond to join requests'
      });
    }

    // Check if request is still pending
    if (teamRequest.status !== 'pending') {
      console.log('❌ Request already processed:', teamRequest.status);
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request status
    teamRequest.status = action === 'approve' ? 'approved' : 'rejected';
    teamRequest.respondedAt = new Date();
    await teamRequest.save();
    console.log('✅ Request status updated:', teamRequest.status);

    // If approved, add user to team
    if (action === 'approve') {
      console.log('➕ Adding user to team...');
      const project = await Problem.findById(teamRequest.project._id);
      
      // Check if team is full
      if (project.teamMembers.length >= project.maxTeamSize) {
        console.log('❌ Team is full:', project.teamMembers.length, '/', project.maxTeamSize);
        return res.status(400).json({
          success: false,
          message: `Team is already full (max ${project.maxTeamSize} members)`
        });
      }

      // Add user to team
      project.teamMembers.push({
        user: teamRequest.requester._id,
        joinedAt: new Date(),
        role: 'developer'
      });
      
      await project.save();
      console.log('✅ User added to team successfully');

      // Add project to user's joined projects
      await User.findByIdAndUpdate(teamRequest.requester._id, {
        $addToSet: { 
          joinedProjects: {
            project: project._id,
            joinedAt: new Date(),
            role: 'developer'
          }
        }
      });
      console.log('✅ Project added to user joined projects');
    }

    // Emit real-time notification to requester via Socket.io
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        requestId: teamRequest._id,
        projectId: teamRequest.project._id,
        projectTitle: teamRequest.project.title,
        approved: action === 'approve',
        timestamp: new Date(),
        isApiRequest: true // Distinguish from socket requests
      };

      console.log('📡 Emitting join request response to user:', teamRequest.requester._id);
      io.to(`user-${teamRequest.requester._id}`).emit('join-request-response', notificationData);
    } else {
      console.log('⚠️ Socket.IO not available for real-time notification');
    }

    console.log('✅ Request processed successfully');
    res.status(200).json({
      success: true,
      message: `Request ${action}d successfully`,
      data: teamRequest
    });

  } catch (error) {
    console.error('❌ Respond to join request error:', error);
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

// Get all join requests for a creator's projects
const getCreatorJoinRequests = async (req, res) => {
  try {
    // Get all projects created by this user
    const projects = await Problem.find({ createdBy: req.user._id });
    const projectIds = projects.map(p => p._id);

    // Get all pending requests for these projects
    const requests = await TeamRequest.find({
      project: { $in: projectIds },
      status: 'pending'
    })
    .populate('requester', 'username fullName profileImage')
    .populate('project', 'title description')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get creator join requests error:', error);
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
      $pull: { joinedProjects: { project: projectId } }
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

// Remove a team member from a project (creator only)
const removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Find the project
    const project = await Problem.findById(projectId)
      .populate('createdBy', 'username fullName')
      .populate('teamMembers.user', 'username fullName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if current user is the project creator
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can remove team members'
      });
    }

    // Check if user is a team member
    const memberIndex = project.teamMembers.findIndex(
      member => member.user._id.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    // Prevent creator from removing themselves
    if (userId === project.createdBy._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Project creator cannot be removed from the team'
      });
    }

    // Remove user from team
    const removedMember = project.teamMembers[memberIndex];
    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    // Remove project from user's joined projects
    await User.findByIdAndUpdate(userId, {
      $pull: { 
        joinedProjects: { project: projectId }
      }
    });

    // Remove any pending team requests for this user and project
    await TeamRequest.deleteMany({
      project: projectId,
      requester: userId
    });

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: {
        removedMember: {
          user: removedMember.user,
          joinedAt: removedMember.joinedAt,
          role: removedMember.role
        }
      }
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update team member role (creator only)
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['developer', 'lead'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "developer" or "lead"'
      });
    }

    // Find the project
    const project = await Problem.findById(projectId)
      .populate('createdBy', 'username fullName')
      .populate('teamMembers.user', 'username fullName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if current user is the project creator
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can update team member roles'
      });
    }

    // Find team member
    const memberIndex = project.teamMembers.findIndex(
      member => member.user._id.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    // Update role
    project.teamMembers[memberIndex].role = role;
    await project.save();

    // Update role in user's joined projects
    await User.findOneAndUpdate(
      { 
        _id: userId,
        'joinedProjects.project': projectId
      },
      {
        $set: { 'joinedProjects.$.role': role }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Team member role updated successfully',
      data: {
        member: project.teamMembers[memberIndex]
      }
    });

  } catch (error) {
    console.error('Update member role error:', error);
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
  leaveTeam,
  getTeamMembers,
  removeTeamMember,
  updateMemberRole
};
