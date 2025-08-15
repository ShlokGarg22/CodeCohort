import React, { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

const JoinRequestSection = ({ projectId, projectTitle, userRole = 'user', className = '' }) => {
  const { joinRequests, respondToJoinRequest, isAuthenticated } = useSocket();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState({});
  const [showAll, setShowAll] = useState(false);

  // Filter join requests for this specific project
  const projectJoinRequests = joinRequests.filter(
    request => request.projectId === projectId
  );

  // Only show to project creators/admins
  if (userRole !== 'creator' && user?.role !== 'admin') {
    return null;
  }

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

  const displayedRequests = showAll ? projectJoinRequests : projectJoinRequests.slice(0, 3);

  if (!isAuthenticated) {
    return (
      <div className={`${className}`}>
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Connect to see join requests</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectJoinRequests.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No pending join requests</p>
            <p className="text-xs text-gray-400 mt-1">
              When developers request to join "{projectTitle}", they'll appear here
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Join Requests
              </CardTitle>
              <CardDescription>
                Manage pending requests for "{projectTitle}"
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {projectJoinRequests.length} pending
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {displayedRequests.map((request) => (
              <div 
                key={request.requestId} 
                className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={request.requester.profilePicture} 
                    alt={request.requester.fullName || request.requester.username} 
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {(request.requester.fullName || request.requester.username)
                      .charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Request Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {request.requester.fullName || request.requester.username}
                      </h4>
                      <p className="text-xs text-gray-500">
                        @{request.requester.username || 'user'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(request.timestamp)}
                    </div>
                  </div>
                  
                  {/* Request Message */}
                  {request.message && (
                    <div className="mb-3 p-2 bg-white rounded border text-sm text-gray-700">
                      <span className="text-xs text-gray-500 font-medium">Message:</span>
                      <p className="mt-1">"{request.message}"</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleJoinResponse(request.requestId, 'reject', 'Request declined')}
                      disabled={isLoading[request.requestId]}
                      className="h-8 px-3 text-xs"
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
                      className="h-8 px-3 text-xs"
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
              </div>
            ))}
            
            {/* Show More/Less Button */}
            {projectJoinRequests.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showAll 
                    ? 'Show Less' 
                    : `Show ${projectJoinRequests.length - 3} More`
                  }
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinRequestSection;
