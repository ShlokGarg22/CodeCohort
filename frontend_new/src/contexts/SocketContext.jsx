import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [joinRequests, setJoinRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user's personal room for notifications
        newSocket.emit('join-user-room', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // Handle incoming join requests (for creators)
      newSocket.on('new-join-request', (data) => {
        console.log('New join request received:', data);
        
        setJoinRequests(prev => [data, ...prev]);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'join-request',
          title: 'New Team Join Request',
          message: `${data.requester.username} wants to join "${data.projectTitle}"`,
          timestamp: new Date(),
          data: data
        }, ...prev]);

        // Show toast notification
        toast.info(`${data.requester.username} wants to join "${data.projectTitle}"`, {
          action: {
            label: 'View',
            onClick: () => window.location.href = '/dashboard'
          }
        });
      });

      // Handle join request responses (for developers)
      newSocket.on('join-request-response', (data) => {
        console.log('Join request response received:', data);
        
        setNotifications(prev => [{
          id: Date.now(),
          type: 'join-response',
          title: data.approved ? 'Request Approved!' : 'Request Declined',
          message: data.approved 
            ? `You've been accepted to join "${data.projectTitle}"`
            : `Your request to join "${data.projectTitle}" was declined`,
          timestamp: new Date(),
          data: data
        }, ...prev]);

        // Show toast notification
        if (data.approved) {
          toast.success(`You've been accepted to join "${data.projectTitle}"!`, {
            action: {
              label: 'View Project',
              onClick: () => window.location.href = `/project/${data.projectId}`
            }
          });
        } else {
          toast.error(`Your request to join "${data.projectTitle}" was declined`);
        }

        // If approved, refresh the page to update navigation
        if (data.approved) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });

      // Handle task updates for real-time collaboration
      newSocket.on('task-updated', (taskData) => {
        console.log('Task updated:', taskData);
        // This will be handled by the KanbanBoard component
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setJoinRequests([]);
        setNotifications([]);
      }
    }
  }, [isAuthenticated, user]);

  // Function to send join request
  const sendJoinRequest = (projectId, creatorId, requesterData, message) => {
    if (socket) {
      socket.emit('send-join-request', {
        projectId,
        creatorId,
        requesterData,
        message
      });
    }
  };

  // Function to respond to join request
  const respondToJoinRequest = (requesterId, projectId, approved, projectData) => {
    if (socket) {
      socket.emit('handle-join-request', {
        requesterId,
        projectId,
        approved,
        projectData
      });
    }
  };

  // Function to join project room for real-time collaboration
  const joinProjectRoom = (projectId) => {
    if (socket) {
      socket.emit('join-project-room', projectId);
    }
  };

  // Function to broadcast task update
  const broadcastTaskUpdate = (projectId, taskData) => {
    if (socket) {
      socket.emit('task-updated', { projectId, task: taskData });
    }
  };

  // Function to clear notifications
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Function to clear join request
  const clearJoinRequest = (requestId) => {
    setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
  };

  const value = {
    socket,
    isConnected,
    joinRequests,
    notifications,
    sendJoinRequest,
    respondToJoinRequest,
    joinProjectRoom,
    broadcastTaskUpdate,
    clearNotification,
    clearJoinRequest
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
