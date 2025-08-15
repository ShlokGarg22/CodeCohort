import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!user || !authIsAuthenticated) {
      console.log('🔌 No user or not authenticated, skipping socket initialization');
      return null;
    }

    console.log('🔌 Initializing socket connection...');
    
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('connected');
      setIsConnected(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Authenticate with the server
      newSocket.emit('authenticate', { 
        userId: user._id,
        token: token || null // Send null if no token
      });
    });

    newSocket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
      setIsAuthenticated(true);
      setConnectionStatus('authenticated');
    });

    newSocket.on('auth-error', (error) => {
      console.error('❌ Socket authentication failed:', error);
      setIsAuthenticated(false);
      setConnectionStatus('auth-failed');
      
      // Show user-friendly error message
      if (error.message === 'Invalid or expired token') {
        toast.error('Session expired. Please log in again.', {
          duration: 5000
        });
        // Optionally redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/signin';
        }, 2000);
      } else if (error.message === 'User not found') {
        toast.error('User account not found. Please contact support.', {
          duration: 5000
        });
      } else {
        toast.error('Connection authentication failed. Some real-time features may not work.', {
          duration: 5000
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnectionStatus('error');
      setIsConnected(false);
      setIsAuthenticated(false);
      
      // Show user-friendly error message
      toast.error('Unable to connect to real-time service. Some features may not work.', {
        duration: 5000
      });
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setConnectionStatus('reconnected');
      setIsConnected(true);
      
      // Re-authenticate after reconnection
      if (user) {
        const token = localStorage.getItem('token');
        newSocket.emit('authenticate', { 
          userId: user._id,
          token: token || null
        });
      }
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
      setConnectionStatus('reconnect-failed');
    });

    // Handle task updates for real-time collaboration
    newSocket.on('task-updated', (taskData) => {
      console.log('📝 Task updated:', taskData);
      // This will be handled by the KanbanBoard component
    });

    // Join request notification handlers
    newSocket.on('new_join_request', (notification) => {
      console.log('📨 New join request received:', notification);
      
      // Add to join requests list
      setJoinRequests(prev => [notification, ...prev]);
      
      // Add to general notifications
      const generalNotification = {
        id: notification.requestId,
        type: 'join_request',
        title: 'New Team Join Request',
        message: `${notification.requester.fullName || notification.requester.username} wants to join "${notification.projectTitle}"`,
        timestamp: notification.timestamp,
        data: notification
      };
      setNotifications(prev => [generalNotification, ...prev]);

      // Show toast notification
      toast.info(`${notification.requester.fullName || notification.requester.username} wants to join "${notification.projectTitle}"`, {
        action: {
          label: 'View',
          onClick: () => window.location.href = '/dashboard'
        },
        duration: 10000
      });
    });

    // Join request response handlers
    newSocket.on('join_request_response', (response) => {
      console.log('📨 Join request response received:', response);
      
      const generalNotification = {
        id: response.requestId,
        type: 'join_response',
        title: response.approved ? 'Request Approved!' : 'Request Declined',
        message: response.message,
        timestamp: response.timestamp,
        data: response
      };
      setNotifications(prev => [generalNotification, ...prev]);

      // Show appropriate toast
      if (response.approved) {
        toast.success(`You've been accepted to join "${response.projectTitle}"!`, {
          action: {
            label: 'View Project',
            onClick: () => window.location.href = `/project/${response.projectId}`
          },
          duration: 8000
        });
        
        // Let individual components handle data refresh instead of forcing a page reload
        console.log('✅ Join request approved, components will refresh data automatically');
      } else {
        toast.error(`Your request to join "${response.projectTitle}" was declined`, {
          duration: 6000
        });
      }
    });

    // Team member joined notification
    newSocket.on('team_member_joined', (data) => {
      console.log('👥 New team member joined:', data);
      
      const notification = {
        id: Date.now().toString(),
        type: 'team_update',
        title: 'New Team Member',
        message: `${data.newMember.fullName || data.newMember.username} joined "${data.projectTitle}"`,
        timestamp: data.timestamp,
        data: data
      };
      setNotifications(prev => [notification, ...prev]);

      toast.success(`${data.newMember.fullName || data.newMember.username} joined the team!`);
    });

    // Handle user typing indicators
    newSocket.on('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      // This can be used for real-time typing indicators
    });

    return newSocket;
  }, [user, authIsAuthenticated]);

  // Initialize socket when user changes
  useEffect(() => {
    if (authIsAuthenticated && user) {
      const newSocket = initializeSocket();
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          console.log('🔌 Cleaning up socket connection');
          newSocket.close();
        }
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        console.log('🔌 User logged out, disconnecting socket');
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setIsAuthenticated(false);
        setConnectionStatus('disconnected');
        setJoinRequests([]);
        setNotifications([]);
      }
    }
  }, [authIsAuthenticated, user, initializeSocket]);

  // Send join request function
  const sendJoinRequest = useCallback((projectId, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket || !isAuthenticated) {
        reject(new Error('Socket not connected or not authenticated'));
        return;
      }

      console.log('📨 Sending join request:', { projectId, message });

      // Set up success listener
      const onSuccess = (data) => {
        console.log('✅ Join request sent successfully:', data);
        socket.off('join_request_sent', onSuccess);
        socket.off('join_request_error', onError);
        resolve(data);
      };

      // Set up error listener
      const onError = (error) => {
        console.error('❌ Join request failed:', error);
        socket.off('join_request_sent', onSuccess);
        socket.off('join_request_error', onError);
        reject(new Error(error.message));
      };

      socket.on('join_request_sent', onSuccess);
      socket.on('join_request_error', onError);

      // Emit the request
      socket.emit('send_join_request', {
        projectId,
        message
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off('join_request_sent', onSuccess);
        socket.off('join_request_error', onError);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }, [socket, isAuthenticated]);

  // Respond to join request function
  const respondToJoinRequest = useCallback((requestId, action, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket || !isAuthenticated) {
        reject(new Error('Socket not connected or not authenticated'));
        return;
      }

      console.log('📨 Responding to join request:', { requestId, action, message });

      // Set up success listener
      const onSuccess = (data) => {
        console.log('✅ Join request response sent successfully:', data);
        socket.off('join_response_sent', onSuccess);
        socket.off('join_response_error', onError);
        
        // Remove from local state
        setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
        
        resolve(data);
      };

      // Set up error listener
      const onError = (error) => {
        console.error('❌ Join request response failed:', error);
        socket.off('join_response_sent', onSuccess);
        socket.off('join_response_error', onError);
        reject(new Error(error.message));
      };

      socket.on('join_response_sent', onSuccess);
      socket.on('join_response_error', onError);

      // Emit the response
      socket.emit('respond_join_request', {
        requestId,
        action,
        message
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off('join_response_sent', onSuccess);
        socket.off('join_response_error', onError);
        reject(new Error('Response timeout'));
      }, 10000);
    });
  }, [socket, isAuthenticated]);

  // Function to join project room for real-time collaboration
  const joinProjectRoom = useCallback((projectId) => {
    if (!socket || !isAuthenticated) {
      console.error('❌ Socket not connected or not authenticated');
      return;
    }

    console.log('📁 Joining project room:', projectId);
    socket.emit('join-project-room', projectId);
  }, [socket, isAuthenticated]);

  // Function to leave project room
  const leaveProjectRoom = useCallback((projectId) => {
    if (!socket) return;

    console.log('📁 Leaving project room:', projectId);
    socket.emit('leave-project-room', projectId);
  }, [socket]);

  // Function to broadcast task update
  const broadcastTaskUpdate = useCallback((projectId, taskData) => {
    if (!socket || !isAuthenticated) {
      console.error('❌ Socket not connected or not authenticated');
      return;
    }

    console.log('📝 Broadcasting task update:', taskData.title);
    socket.emit('task-updated', { projectId, task: taskData });
  }, [socket, isAuthenticated]);

  // Function to send typing indicator
  const sendTypingIndicator = useCallback((projectId, isTyping) => {
    if (!socket || !isAuthenticated || !user) return;

    socket.emit('user-typing', { projectId, userId: user._id, isTyping });
  }, [socket, isAuthenticated, user]);

  // Function to clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Function to clear join request
  const clearJoinRequest = useCallback((requestId) => {
    setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
  }, []);

  // Function to clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Function to clear all join requests
  const clearAllJoinRequests = useCallback(() => {
    setJoinRequests([]);
  }, []);

  const value = {
    socket,
    isConnected,
    isAuthenticated,
    connectionStatus,
    joinRequests,
    notifications,
    sendJoinRequest,
    respondToJoinRequest,
    joinProjectRoom,
    leaveProjectRoom,
    broadcastTaskUpdate,
    sendTypingIndicator,
    clearNotification,
    clearJoinRequest,
    clearAllNotifications,
    clearAllJoinRequests
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
