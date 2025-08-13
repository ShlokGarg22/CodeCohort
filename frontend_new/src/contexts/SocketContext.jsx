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

    // Handle incoming join requests (for creators)
    newSocket.on('new-join-request', (data) => {
      console.log('📨 New join request received:', data);
      
      const notification = {
        id: data.requestId || Date.now().toString(),
        type: 'join-request',
        title: 'New Team Join Request',
        message: `${data.requester.username} wants to join "${data.projectTitle}"`,
        timestamp: new Date(data.timestamp),
        data: data
      };
      
      setJoinRequests(prev => [data, ...prev]);
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      toast.info(`${data.requester.username} wants to join "${data.projectTitle}"`, {
        action: {
          label: 'View',
          onClick: () => window.location.href = '/dashboard'
        },
        duration: 10000
      });
    });

    // Handle join request responses (for developers)
    newSocket.on('join-request-response', (data) => {
      console.log('📨 Join request response received:', data);
      
      const notification = {
        id: data.requestId || Date.now().toString(),
        type: 'join-response',
        title: data.approved ? 'Request Approved!' : 'Request Declined',
        message: data.approved 
          ? `You've been accepted to join "${data.projectTitle}"`
          : `Your request to join "${data.projectTitle}" was declined`,
        timestamp: new Date(data.timestamp),
        data: data
      };
      
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      if (data.approved) {
        toast.success(`You've been accepted to join "${data.projectTitle}"!`, {
          action: {
            label: 'View Project',
            onClick: () => window.location.href = `/project/${data.projectId}`
          },
          duration: 8000
        });
        
        // Refresh the page after a delay to update navigation
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast.error(`Your request to join "${data.projectTitle}" was declined`, {
          duration: 6000
        });
      }
    });

    // Handle task updates for real-time collaboration
    newSocket.on('task-updated', (taskData) => {
      console.log('📝 Task updated:', taskData);
      // This will be handled by the KanbanBoard component
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

  // Function to send join request via socket
  const sendJoinRequest = useCallback((projectId, creatorId, requesterData, message = '') => {
    if (!socket || !isAuthenticated) {
      console.error('❌ Socket not connected or not authenticated');
      throw new Error('Socket connection not available');
    }

    console.log('📨 Sending join request via socket:', {
      projectId,
      creatorId,
      requesterData: requesterData.username,
      message
    });

    socket.emit('send-join-request', {
      projectId,
      creatorId,
      requesterData,
      message
    });
  }, [socket, isAuthenticated]);

  // Function to respond to join request via socket
  const respondToJoinRequest = useCallback((requesterId, projectId, approved, projectData) => {
    if (!socket || !isAuthenticated) {
      console.error('❌ Socket not connected or not authenticated');
      throw new Error('Socket connection not available');
    }

    console.log('📨 Sending join request response via socket:', {
      requesterId,
      projectId,
      approved,
      projectData: projectData?.title
    });

    socket.emit('handle-join-request', {
      requesterId,
      projectId,
      approved,
      projectData
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
