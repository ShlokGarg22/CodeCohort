import React, { useState } from 'react';
import { Bell, Users, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    joinRequests,
    notifications,
    respondToJoinRequest,
    clearNotification,
    clearJoinRequest,
    clearAllNotifications,
    clearAllJoinRequests,
    isAuthenticated
  } = useSocket();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'requests'
  const [isLoading, setIsLoading] = useState({});

  const handleJoinResponse = async (requestId, action, message = '') => {
    setIsLoading(prev => ({ ...prev, [requestId]: action }));
    
    try {
      await respondToJoinRequest(requestId, action, message);
      
      toast.success(
        action === 'approve' 
          ? 'Join request approved successfully!' 
          : 'Join request declined'
      );
    } catch (error) {
      console.error('Error responding to join request:', error);
      toast.error(`Failed to ${action} request: ${error.message}`);
    } finally {
      setIsLoading(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'join_response':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'team_update':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const totalNotifications = notifications.length + joinRequests.length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-16 w-96 bg-white border rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalNotifications}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="flex-1 h-8 text-xs"
          >
            All ({totalNotifications})
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('requests')}
            className="flex-1 h-8 text-xs"
          >
            Requests ({joinRequests.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {!isAuthenticated ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Connect to see notifications</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Join Requests Section */}
            {(activeTab === 'all' || activeTab === 'requests') && joinRequests.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Join Requests</h4>
                  {activeTab === 'requests' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllJoinRequests}
                      className="text-xs h-6 px-2"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <Card key={request.requestId} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">
                                {request.requester.fullName || request.requester.username}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                wants to join "{request.projectTitle}"
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearJoinRequest(request.requestId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {request.message && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            "{request.message}"
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTimestamp(request.timestamp)}
                          </span>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleJoinResponse(request.requestId, 'reject', 'Request declined')}
                              disabled={isLoading[request.requestId]}
                              className="h-7 px-3 text-xs"
                            >
                              {isLoading[request.requestId] === 'reject' ? (
                                <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Decline
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleJoinResponse(request.requestId, 'approve', 'Welcome to the team!')}
                              disabled={isLoading[request.requestId]}
                              className="h-7 px-3 text-xs"
                            >
                              {isLoading[request.requestId] === 'approve' ? (
                                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Accept
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* General Notifications Section */}
            {activeTab === 'all' && notifications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Recent Activity</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-xs h-6 px-2"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {notifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearNotification(notification.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty States */}
            {((activeTab === 'all' && totalNotifications === 0) || 
              (activeTab === 'requests' && joinRequests.length === 0)) && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No {activeTab === 'requests' ? 'join requests' : 'notifications'}</p>
                <p className="text-xs mt-1">
                  {activeTab === 'requests' 
                    ? 'Join requests will appear here' 
                    : 'All your notifications will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
