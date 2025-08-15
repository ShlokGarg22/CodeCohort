/**
 * Socket.IO handlers for project join notification system
 * Handles real-time notifications for project join requests and responses
 */

const mongoose = require('mongoose');
const TeamRequest = require('../models/TeamRequest');
const Problem = require('../models/Problem');
const User = require('../models/User');

/**
 * Setup Socket.IO event handlers for project join notifications
 * @param {Socket.IO Server} io - Socket.io server instance
 */
const setupJoinNotificationHandlers = (io) => {
  
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User authentication and room joining
    socket.on('authenticate', async (data) => {
      try {
        const { userId, token } = data;
        
        if (!userId || !token) {
          socket.emit('auth_error', { message: 'Missing authentication data' });
          return;
        }

        // Store user info in socket
        socket.userId = userId;
        socket.userToken = token;

        // Join user's personal notification room
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        
        console.log(`✅ User ${userId} authenticated and joined room ${userRoom}`);
        socket.emit('authenticated', { 
          success: true, 
          userId, 
          room: userRoom 
        });

        // Join all project rooms for projects the user is part of
        await joinUserProjectRooms(socket, userId);

      } catch (error) {
        console.error('❌ Authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle project join requests
    socket.on('send_join_request', async (data) => {
      try {
        const { projectId, message } = data;
        const requesterId = socket.userId;

        console.log(`📨 Received join request:`, { projectId, requesterId, message: message?.substring(0, 50) });

        // Validate required fields
        if (!projectId || !requesterId) {
          console.error('❌ Missing required fields:', { projectId, requesterId });
          socket.emit('join_request_error', { 
            message: 'Missing required information. Please refresh and try again.' 
          });
          return;
        }

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          console.error('❌ Invalid project ID:', projectId);
          socket.emit('join_request_error', { message: 'Invalid project ID' });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(requesterId)) {
          console.error('❌ Invalid user ID:', requesterId);
          socket.emit('join_request_error', { message: 'Invalid user ID' });
          return;
        }

        if (!requesterId) {
          socket.emit('join_request_error', { message: 'Not authenticated' });
          return;
        }

        console.log(`📨 Processing join request: User ${requesterId} -> Project ${projectId}`);

        // Validate project exists and get creator info
        const project = await Problem.findById(projectId)
          .populate('createdBy', 'username fullName email')
          .populate('teamMembers.user', '_id username');

        if (!project) {
          socket.emit('join_request_error', { message: 'Project not found' });
          return;
        }

        console.log(`🔍 Project found: ${project.title}`);
        console.log(`👥 Current team members:`, project.teamMembers.map(m => m.user._id.toString()));

        // Get requester info
        const requester = await User.findById(requesterId)
          .select('username fullName email profileImage');

        if (!requester) {
          socket.emit('join_request_error', { message: 'User not found' });
          return;
        }

        // Check if user is already a team member
        const isAlreadyMember = project.teamMembers.some(member => 
          member.user._id.toString() === requesterId.toString()
        );

        console.log(`🔍 Checking membership for user: ${requesterId}`);
        console.log(`👥 Is already member: ${isAlreadyMember}`);

        if (isAlreadyMember) {
          socket.emit('join_request_error', { 
            message: 'You are already a member of this project' 
          });
          return;
        }

        // Check for existing pending request
        const existingRequest = await TeamRequest.findOne({
          project: projectId,
          requester: requesterId,
          status: 'pending'
        });

        if (existingRequest) {
          socket.emit('join_request_error', { 
            message: 'You already have a pending request for this project' 
          });
          return;
        }

        // Create new team request
        const teamRequest = new TeamRequest({
          project: projectId,
          requester: requesterId,
          creator: project.createdBy._id,
          message: message || '',
          status: 'pending'
        });

        await teamRequest.save();

        // Populate the request for notification
        const populatedRequest = await TeamRequest.findById(teamRequest._id)
          .populate('requester', 'username fullName profileImage')
          .populate('project', 'title description')
          .populate('creator', 'username fullName');

        // Prepare notification data
        const notification = {
          type: 'join_request',
          requestId: populatedRequest._id.toString(),
          projectId: project._id.toString(),
          projectTitle: project.title,
          requester: {
            id: requester._id.toString(),
            username: requester.username,
            fullName: requester.fullName,
            profileImage: requester.profileImage
          },
          creator: {
            id: project.createdBy._id.toString(),
            username: project.createdBy.username
          },
          message: message || '',
          timestamp: new Date().toISOString()
        };

        // Send notification to project creator
        const creatorRoom = `user_${project.createdBy._id}`;
        io.to(creatorRoom).emit('new_join_request', notification);

        console.log(`📡 Sent join request notification to creator in room: ${creatorRoom}`);

        // Confirm to requester
        socket.emit('join_request_sent', {
          success: true,
          projectTitle: project.title,
          requestId: teamRequest._id.toString()
        });

      } catch (error) {
        console.error('❌ Join request error:', error);
        socket.emit('join_request_error', { 
          message: error.message || 'Failed to process join request' 
        });
      }
    });

    // Handle join request responses (approve/reject)
    socket.on('respond_join_request', async (data) => {
      try {
        const { requestId, action, message } = data;
        const responderId = socket.userId;

        if (!responderId) {
          socket.emit('join_response_error', { message: 'Not authenticated' });
          return;
        }

        console.log(`📋 Processing join request response: ${action} for request ${requestId}`);

        // Find and validate the request
        const request = await TeamRequest.findById(requestId)
          .populate('requester', 'username fullName profileImage email')
          .populate('project', 'title description createdBy')
          .populate('creator', 'username fullName');

        if (!request) {
          console.log(`❌ Request not found: ${requestId}`);
          socket.emit('join_response_error', { message: 'Request not found' });
          return;
        }

        console.log(`✅ Request found: ${request._id}`);
        console.log(`📋 Request details:`, {
          requester: request.requester.username,
          project: request.project.title,
          creator: request.creator.username,
          status: request.status
        });

        // Verify the responder is the project creator
        if (request.creator._id.toString() !== responderId) {
          console.log(`❌ Authorization failed: ${responderId} is not creator ${request.creator._id}`);
          socket.emit('join_response_error', { 
            message: 'Only the project creator can respond to this request' 
          });
          return;
        }

        console.log(`✅ Authorization passed for creator: ${request.creator.username}`);

        // Update request status
        const approved = action === 'approve';
        request.status = approved ? 'approved' : 'rejected';
        request.respondedAt = new Date();
        request.response = message || '';

        console.log(`📝 Updating request status to: ${request.status}`);
        await request.save();
        console.log(`✅ Request saved successfully`);

        // If approved, add user to project team members
        if (approved) {
          console.log(`➕ Adding user ${request.requester.username} to project ${request.project.title}`);
          
          await Problem.findByIdAndUpdate(request.project._id, {
            $addToSet: { 
              teamMembers: {
                user: request.requester._id,
                role: 'developer',
                joinedAt: new Date()
              }
            }
          });

          // Add project to user's joined projects
          await User.findByIdAndUpdate(request.requester._id, {
            $addToSet: { joinedProjects: request.project._id }
          });

          console.log(`✅ User ${request.requester._id} added to project ${request.project._id}`);
        }

        // Prepare response notification
        const responseNotification = {
          type: 'join_response',
          requestId: request._id.toString(),
          projectId: request.project._id.toString(),
          projectTitle: request.project.title,
          approved: approved,
          message: approved 
            ? `Your request to join "${request.project.title}" has been approved!`
            : `Your request to join "${request.project.title}" has been declined.`,
          responderMessage: message || '',
          timestamp: new Date().toISOString(),
          creator: {
            id: request.creator._id.toString(),
            username: request.creator.username,
            fullName: request.creator.fullName
          }
        };

  // Send notification to requester
  const requesterRoom = `user_${request.requester._id}`;
  console.log(`📡 Preparing response notification for: ${requesterRoom}`);
  io.to(requesterRoom).emit('join_request_response', responseNotification);

  console.log(`📡 Sent join response notification to requester in room: ${requesterRoom}`);

        // If approved, add user to project room for real-time collaboration
        if (approved) {
          console.log(`🔗 Adding user to project room for real-time collaboration`);
          const projectRoom = `project_${request.project._id}`;
          // Find requester's socket and add to project room
          const requesterSockets = await io.in(requesterRoom).fetchSockets();
          console.log(`👥 Found ${requesterSockets.length} sockets for requester`);
          
          requesterSockets.forEach(requesterSocket => {
            requesterSocket.join(projectRoom);
            console.log(`➕ Added user to project room: ${projectRoom}`);
          });

          // Notify project team about new member
          io.to(projectRoom).emit('team_member_joined', {
            type: 'team_update',
            projectId: request.project._id.toString(),
            projectTitle: request.project.title,
            newMember: {
              id: request.requester._id.toString(),
              username: request.requester.username,
              fullName: request.requester.fullName,
              profileImage: request.requester.profileImage
            },
            timestamp: new Date().toISOString()
          });
        }

        // Confirm to responder
        socket.emit('join_response_sent', {
          success: true,
          action: action,
          requesterName: request.requester.username,
          projectTitle: request.project.title
        });

        // Clean up the processed request to avoid duplicates
        await TeamRequest.findByIdAndDelete(requestId);
        console.log(`🧹 Cleaned up processed team request: ${requestId}`);

      } catch (error) {
        console.error('❌ Join response error:', error);
        socket.emit('join_response_error', { 
          message: error.message || 'Failed to process response' 
        });
      }
    });

    // Handle project room joining for real-time collaboration
    socket.on('join_project_room', async (data) => {
      try {
        const { projectId } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit('project_room_error', { message: 'Not authenticated' });
          return;
        }

        // Verify user is a member of this project
        const project = await Problem.findById(projectId);
        const isMember = project?.teamMembers?.some(member => 
          member.user?.toString() === userId.toString()
        ) || project?.createdBy?.toString() === userId.toString();

        if (!isMember) {
          socket.emit('project_room_error', { 
            message: 'You are not a member of this project' 
          });
          return;
        }

        const projectRoom = `project_${projectId}`;
        socket.join(projectRoom);
        
        console.log(`📁 User ${userId} joined project room: ${projectRoom}`);
        socket.emit('project_room_joined', { projectId, room: projectRoom });

      } catch (error) {
        console.error('❌ Project room join error:', error);
        socket.emit('project_room_error', { 
          message: error.message || 'Failed to join project room' 
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });

  });

};

/**
 * Helper function to join user to all their project rooms
 */
async function joinUserProjectRooms(socket, userId) {
  try {
    // Find all projects where user is creator or team member
    const userProjects = await Problem.find({
      $or: [
        { createdBy: userId },
        { 'teamMembers.user': userId }
      ]
    }).select('_id');

    // Join each project room
    userProjects.forEach(project => {
      const projectRoom = `project_${project._id}`;
      socket.join(projectRoom);
      console.log(`📁 Auto-joined project room: ${projectRoom}`);
    });

  } catch (error) {
    console.error('❌ Error joining project rooms:', error);
  }
}

module.exports = {
  setupJoinNotificationHandlers
};
