import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, Check, X, MessageSquare, Clock } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { joinRequests, notifications, clearJoinRequest, clearNotification, respondToJoinRequest } = useSocket();
  const [processingRequests, setProcessingRequests] = useState(new Set());

  const handleRequestResponse = async (request, approved) => {
    try {
      setProcessingRequests(prev => new Set([...prev, request.requestId]));

      // Call API to handle the request
      await teamService.respondToJoinRequest(request.requestId, approved ? 'approve' : 'reject');

      // Send real-time notification via Socket.io
      respondToJoinRequest(
        request.requester.id,
        request.projectId,
        approved,
        { title: request.projectTitle }
      );

      // Clear the request from local state
      clearJoinRequest(request.requestId);

      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.requestId);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return format(date, 'MMM d, h:mm a');
    } catch (error) {
      return 'Unknown time';
    }
  };

  if (!isOpen) return null;

  const hasJoinRequests = joinRequests.length > 0;
  const hasNotifications = notifications.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Join Requests Section */}
          {hasJoinRequests && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-sm text-gray-600 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Team Join Requests ({joinRequests.length})
              </h4>
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <Card key={request.requestId} className="border border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.requester.profileImage} />
                          <AvatarFallback>
                            {request.requester.fullName?.charAt(0) || 
                             request.requester.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {request.requester.fullName || request.requester.username}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {formatTimeAgo(request.timestamp)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Wants to join "<span className="font-medium">{request.projectTitle}</span>"
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border mb-3">
                              "{request.message}"
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestResponse(request, true)}
                              disabled={processingRequests.has(request.requestId)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestResponse(request, false)}
                              disabled={processingRequests.has(request.requestId)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* General Notifications Section */}
          {hasNotifications && (
            <div className="p-4">
              <h4 className="font-medium text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity ({notifications.length})
              </h4>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasJoinRequests && !hasNotifications && (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You'll see join requests and updates here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
