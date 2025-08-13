import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
import GitHubRepositoryInput from './VersionHistory/GitHubRepositoryInput';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Code, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ExternalLink,
  Calendar,
  User,
  GitBranch,
  Github,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { 
    joinRequests: socketJoinRequests, 
    respondToJoinRequest, 
    clearJoinRequest,
    isConnected,
    isAuthenticated 
  } = useSocket();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [apiJoinRequests, setApiJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectRepo, setSelectedProjectRepo] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  const isApproved = user?.creatorStatus === 'approved';
  const isPending = user?.creatorStatus === 'pending';
  const isRejected = user?.creatorStatus === 'rejected';

  // Combine socket and API join requests, prioritizing socket requests
  const displayJoinRequests = [
    ...socketJoinRequests,
    ...apiJoinRequests.filter(apiReq => 
      !socketJoinRequests.some(socketReq => socketReq.requestId === apiReq._id)
    )
  ];

  useEffect(() => {
    if (isApproved) {
      fetchMyProblems();
      fetchJoinRequests();
    }
  }, [isApproved]);

  const fetchMyProblems = async () => {
    try {
      setLoading(true);
      const result = await problemService.getMyProblems();
      if (result.success) {
        setProblems(result.data.problems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await teamService.getJoinRequests();
      setApiJoinRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleJoinRequestAction = async (request, action) => {
    try {
      const requestId = request.requestId || request._id;
      
      if (!requestId) {
        throw new Error('Invalid request ID');
      }

      setProcessingRequests(prev => new Set([...prev, requestId]));

      console.log('📨 Processing join request:', { requestId, action, isSocketRequest: !!request.requestId });

      // Try API first, then fallback to Socket.IO
      try {
        await teamService.respondToJoinRequest(requestId, action);
        console.log('✅ API request successful');
      } catch (apiError) {
        console.log('❌ API request failed, trying Socket.IO:', apiError.message);
        
        // Fallback to Socket.IO if API fails
        if (isConnected && isAuthenticated && request.requester?.id && request.projectId) {
          respondToJoinRequest(
            request.requester.id,
            request.projectId,
            action === 'approve',
            { title: request.projectTitle }
          );
          console.log('✅ Socket.IO request sent');
        } else {
          throw new Error('Both API and Socket.IO connections are unavailable');
        }
      }
      
      // Remove the request from local state
      if (request.requestId) {
        // Socket request
        clearJoinRequest(request.requestId);
      } else {
        // API request
        setApiJoinRequests(prev => prev.filter(req => req._id !== request._id));
      }
      
      toast.success(`Join request ${action}d successfully!`);
      
      // Refresh problems to update team member count
      fetchMyProblems();
      
    } catch (error) {
      console.error('❌ Error processing join request:', error);
      toast.error(error.message || 'Failed to process join request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.requestId || request._id);
        return newSet;
      });
    }
  };

  const handleGoToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await problemService.deleteProblem(projectId);
        toast.success('Project deleted successfully');
        fetchMyProblems();
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleLockRepository = async (projectId) => {
    try {
      await problemService.lockGitHubRepository(projectId);
      toast.success('Repository locked successfully');
      fetchMyProblems();
    } catch (error) {
      console.error('Error locking repository:', error);
      toast.error('Failed to lock repository');
    }
  };

  const handleUnlockRepository = async (projectId) => {
    try {
      await problemService.unlockGitHubRepository(projectId);
      toast.success('Repository unlocked successfully');
      fetchMyProblems();
    } catch (error) {
      console.error('Error unlocking repository:', error);
      toast.error('Failed to unlock repository');
    }
  };

  const handleViewVersionHistory = (projectId) => {
    navigate(`/project/${projectId}/version-history`);
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your creator application is currently under review. You'll be notified once it's approved.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your creator application was not approved. Please contact support for more information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be approved as a creator to access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-700">
                Connecting to real-time service...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.fullName}!</CardTitle>
          <CardDescription>
            Manage your projects and review team join requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">Project Creator</Badge>
              <p className="text-sm text-gray-600">Create and manage collaborative coding projects</p>
            </div>
            <Button 
              onClick={() => navigate('/create-problem')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join Requests Section */}
      {displayJoinRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Join Requests ({displayJoinRequests.length})
            </CardTitle>
            <CardDescription>
              Review and respond to requests from developers wanting to join your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayJoinRequests.map((request) => {
                const isProcessing = processingRequests.has(request.requestId || request._id);
                const isSocketRequest = !!request.requestId;
                
                return (
                  <div key={request.requestId || request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.requester?.profileImage} />
                        <AvatarFallback>
                          {request.requester?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{request.requester?.fullName || request.requester?.username}</h4>
                          {isSocketRequest && (
                            <Badge variant="outline" className="text-xs">Real-time</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Wants to join "{request.projectTitle}"
                        </p>
                        {request.message && (
                          <div className="flex items-center space-x-1 mt-1">
                            <MessageSquare className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500 line-clamp-1">
                              "{request.message}"
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(request.timestamp || request.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleJoinRequestAction(request, 'approve')}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoinRequestAction(request, 'reject')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>
            Projects you've created and are managing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Create your first project to start collaborating with developers</p>
              <Button 
                onClick={() => navigate('/create-problem')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((project) => (
                <Card key={project._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={project.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {project.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Team Size:</span>
                        <span className="font-medium">
                          {project.teamMembers?.length || 0}/{project.maxTeamSize || 5}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleGoToProject(project._id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProject(project._id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewVersionHistory(project._id)}
                        >
                          <GitBranch className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => project.githubRepositoryLocked ? 
                            handleUnlockRepository(project._id) : 
                            handleLockRepository(project._id)
                          }
                        >
                          {project.githubRepositoryLocked ? 
                            <Unlock className="h-3 w-3" /> : 
                            <Lock className="h-3 w-3" />
                          }
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Repository Input Modal */}
      {selectedProject && (
        <GitHubRepositoryInput
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          projectId={selectedProject._id}
          projectTitle={selectedProject.title}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;
