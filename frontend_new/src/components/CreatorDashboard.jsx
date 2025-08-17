import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
import GitHubRepositoryInput from './VersionHistory/GitHubRepositoryInput';
import TeamManagement from './TeamManagement';
import EndProjectModal from './EndProjectModal';
import UserProfileModal from './UserProfileModal';
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
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { joinRequests: socketJoinRequests, respondToJoinRequest } = useSocket();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectRepo, setSelectedProjectRepo] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [endProjectModal, setEndProjectModal] = useState({ isOpen: false, project: null });
  const [endingProject, setEndingProject] = useState(false);
  const [profileModal, setProfileModal] = useState({ isOpen: false, userId: null, userData: null });

  const isApproved = user?.creatorStatus === 'approved';
  const isPending = user?.creatorStatus === 'pending';
  const isRejected = user?.creatorStatus === 'rejected';

  // Use socket join requests if available, otherwise fall back to API
  const displayJoinRequests = socketJoinRequests.length > 0 ? socketJoinRequests : joinRequests;

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
      setJoinRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleJoinRequestAction = async (request, action) => {
    try {
      console.log('🔄 Processing join request action:', { 
        request: {
          id: request._id || request.requestId,
          projectTitle: request.project?.title || request.projectTitle,
          requesterName: request.requester?.username || request.requester?.name
        }, 
        action 
      });
      
      // Extract the correct request ID
      const requestId = request._id || request.requestId;
      
      if (!requestId) {
        console.error('❌ No request ID found:', request);
        throw new Error('Invalid request - missing ID');
      }

      console.log('📤 Sending API request with ID:', requestId);
      
      // Call the API to respond to the request
      const response = await teamService.respondToJoinRequest(requestId, action);
      console.log('✅ API response received:', response);
      
      // Remove the processed request from the list
      setJoinRequests(prev => prev.filter(req => {
        const reqId = req._id || req.requestId;
        return reqId !== requestId;
      }));
      
      // Show success message with project title
      const projectTitle = request.project?.title || request.projectTitle || 'the project';
      toast.success(`${action === 'approve' ? 'Approved' : 'Rejected'} join request for "${projectTitle}" successfully!`);
      
      // Refresh problems to show updated team member count
      await fetchMyProblems();
      
    } catch (error) {
      console.error('❌ Error processing join request:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} join request`;
      toast.error(errorMessage);
    }
  };

  const handleGoToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    navigate(`/edit-problem/${projectId}`);
  };

  const handleViewVersionHistory = (projectId) => {
    navigate(`/project/${projectId}/version-history`);
  };

  const fetchProjectRepository = async (projectId) => {
    try {
      setRepoLoading(true);
      const response = await problemService.getGitHubRepository(projectId);
      console.log('Fetched repository data for project:', projectId, response.data);
      
      // Check if repository data exists and has a URL
      if (response.data && response.data.url) {
        setSelectedProjectRepo(response.data);
      } else {
        // No repository linked yet
        setSelectedProjectRepo({
          url: '',
          owner: '',
          name: '',
          fullName: '',
          isLocked: false,
          lockedAt: null
        });
      }
    } catch (error) {
      console.error('Error fetching project repository:', error);
      // Set empty repository data if error occurs (e.g., no repository linked)
      setSelectedProjectRepo({
        url: '',
        owner: '',
        name: '',
        fullName: '',
        isLocked: false,
        lockedAt: null
      });
    } finally {
      setRepoLoading(false);
    }
  };

  const handleProjectSelection = (projectId) => {
    setSelectedProject(projectId);
    if (projectId) {
      fetchProjectRepository(projectId);
    } else {
      setSelectedProjectRepo(null);
    }
  };

  const handleRepositoryChange = (repoUrl, repoData, isLocked) => {
    console.log('Repository updated:', { repoUrl, repoData, isLocked });
    // Update local state with all repository information
    setSelectedProjectRepo({
      url: repoUrl || '',
      owner: repoData?.owner?.login || '',
      name: repoData?.name || '',
      fullName: repoData?.full_name || repoData?.fullName || '',
      isLocked,
      lockedAt: isLocked ? new Date().toISOString() : null
    });
    toast.success(`Repository ${isLocked ? 'locked' : 'updated'} successfully!`);
  };

  const handleLockRepository = async () => {
    if (!selectedProject) return;
    
    try {
      await problemService.lockGitHubRepository(selectedProject);
      setSelectedProjectRepo(prev => ({
        ...prev,
        isLocked: true,
        lockedAt: new Date().toISOString()
      }));
      toast.success('Repository locked successfully! Team members can now access it.');
    } catch (error) {
      console.error('Error locking repository:', error);
      toast.error(error.message || 'Failed to lock repository');
    }
  };

  const handleUnlockRepository = async () => {
    if (!selectedProject) return;
    
    try {
      await problemService.unlockGitHubRepository(selectedProject);
      setSelectedProjectRepo(prev => ({
        ...prev,
        isLocked: false,
        lockedAt: null
      }));
      toast.success('Repository unlocked successfully!');
    } catch (error) {
      console.error('Error unlocking repository:', error);
      toast.error(error.message || 'Failed to unlock repository');
    }
  };

  const handleEndProject = (project) => {
    setEndProjectModal({ isOpen: true, project });
  };

  const handleConfirmEndProject = async (endData) => {
    if (!endProjectModal.project) return;

    try {
      setEndingProject(true);
      await problemService.endProject(endProjectModal.project._id, endData);
      
      toast.success(`Project "${endProjectModal.project.title}" has been ${endData.status} successfully!`);
      
      // Close modal and refresh data
      setEndProjectModal({ isOpen: false, project: null });
      await fetchMyProblems();
      
    } catch (error) {
      console.error('Error ending project:', error);
      toast.error(error.message || 'Failed to end project');
    } finally {
      setEndingProject(false);
    }
  };

  const handleCloseEndProjectModal = () => {
    setEndProjectModal({ isOpen: false, project: null });
  };

  const handleViewProfile = (userId, userData = null) => {
    setProfileModal({ isOpen: true, userId, userData });
  };

  const handleCloseProfileModal = () => {
    setProfileModal({ isOpen: false, userId: null, userData: null });
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Creator Account Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your creator account is pending admin approval. You'll be able to create problems once approved.
              </AlertDescription>
            </Alert>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• An admin will review your creator request</li>
                <li>• You'll receive access to create coding problems once approved</li>
                <li>• Check back here for updates on your approval status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Creator Account Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-500 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your creator account request has been rejected. Please contact an administrator for more information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Creator Dashboard
          </CardTitle>
          <CardDescription>
            Welcome to your creator dashboard! Create and manage projects and teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default" className="mb-2">Approved Creator</Badge>
              <p className="text-sm text-gray-600">You can now create projects and manage teams.</p>
            </div>
            <Link to="/create-problem">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problems.length}</div>
            <p className="text-xs text-muted-foreground">Total projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {problems.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Published projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {problems.reduce((total, p) => total + (p.teamMembers?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{joinRequests.length}</div>
            <p className="text-xs text-muted-foreground">Join requests</p>
          </CardContent>
        </Card>
      </div>

      {/* GitHub Repository Management */}
      {problems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Repository Management
            </CardTitle>
            <CardDescription>
              Link your projects to GitHub repositories for version history tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Project selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Project to Manage
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {problems.map((problem) => (
                    <Button
                      key={problem._id}
                      variant={selectedProject === problem._id ? 'default' : 'outline'}
                      className="p-3 h-auto text-left justify-start"
                      onClick={() => handleProjectSelection(problem._id)}
                    >
                      <div>
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {problem.isActive ? 'Active' : 'Draft'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* GitHub Repository Input for selected project */}
              {selectedProject && (
                <div className="space-y-4">
                  {repoLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-gray-600">Loading repository data...</span>
                      </div>
                    </div>
                  ) : (
                    <GitHubRepositoryInput
                      key={selectedProject} // Force re-render when project changes
                      projectId={selectedProject}
                      initialRepoUrl={selectedProjectRepo?.url || ""}
                      isLocked={selectedProjectRepo?.isLocked || false}
                      canEdit={true}
                      onRepositoryChange={handleRepositoryChange}
                    />
                  )}
                  
                  {/* Lock/Unlock Repository Section */}
                  {selectedProjectRepo && selectedProjectRepo.url && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedProjectRepo.isLocked ? (
                            <>
                              <Lock className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Repository Locked</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-600">Repository Unlocked</span>
                            </>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={selectedProjectRepo.isLocked ? "outline" : "default"}
                          onClick={selectedProjectRepo.isLocked ? handleUnlockRepository : handleLockRepository}
                          className={selectedProjectRepo.isLocked ? 
                            "text-red-600 border-red-600 hover:bg-red-50" : 
                            "bg-green-600 hover:bg-green-700"
                          }
                        >
                          {selectedProjectRepo.isLocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Unlock Repository
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Lock Repository
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedProjectRepo.isLocked ? 
                          'Team members can access this repository through the navbar. Unlock to restrict access.' :
                          'Lock this repository to allow approved team members to access it through the navbar.'
                        }
                      </p>
                      {selectedProjectRepo.isLocked && selectedProjectRepo.lockedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Locked on {new Date(selectedProjectRepo.lockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Management */}
      <TeamManagement projects={problems} onRefresh={fetchMyProblems} />

      {/* Join Requests */}
      {displayJoinRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Join Requests
            </CardTitle>
            <CardDescription>
              Review and approve developers who want to join your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="text-center py-4">Loading requests...</div>
            ) : (
              <div className="space-y-4">
                {displayJoinRequests.map((request) => (
                  <div key={request._id || request.requestId} className="flex items-start justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex gap-3 flex-1">
                      {/* User Avatar */}
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarImage src={request.requester?.profileImage || request.user?.profileImage} />
                        <AvatarFallback>
                          {(request.requester?.fullName || request.user?.fullName || request.requester?.username || request.user?.username)?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {request.requester?.fullName || request.requester?.username || request.user?.fullName}
                          </span>
                          <span className="text-sm text-gray-500">wants to join</span>
                          <span className="font-medium">
                            {request.projectTitle || request.project?.title}
                          </span>
                        </div>
                        
                        {/* User info */}
                        <div className="text-xs text-gray-600 mb-2">
                          @{request.requester?.username || request.user?.username}
                          {(request.requester?.bio || request.user?.bio) && (
                            <span className="ml-2">• {(request.requester?.bio || request.user?.bio).substring(0, 50)}...</span>
                          )}
                        </div>
                        
                        {request.message && (
                          <p className="text-sm text-gray-600 mb-2 italic">
                            "{request.message}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Requested {new Date(request.timestamp || request.createdAt).toLocaleDateString()}
                          </span>
                          <span>Team: {request.project?.teamMembers?.length || 0}/{request.project?.maxTeamSize || 5}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(
                          request.requester?._id || request.user?._id, 
                          request.requester || request.user
                        )}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleJoinRequestAction(request, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoinRequestAction(request, 'reject')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            Manage your created projects and teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your projects...</div>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Start creating your first project!</p>
              <Link to="/create-problem">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <div key={problem._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{problem.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{problem.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{problem.difficulty}</Badge>
                      <Badge variant="secondary">{problem.category}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />
                        {problem.teamMembers?.length || 0}/{problem.maxTeamSize || 5}
                      </Badge>
                      {problem.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {problem.tags?.length > 2 && (
                        <span className="text-xs text-gray-500">+{problem.tags.length - 2} more</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Created: {new Date(problem.createdAt).toLocaleDateString()}</span>
                      <span className={`font-medium ${
                        problem.projectStatus === 'active' 
                          ? 'text-green-600' 
                          : problem.projectStatus === 'completed'
                          ? 'text-blue-600'
                          : problem.projectStatus === 'cancelled'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}>
                        {problem.projectStatus === 'active' 
                          ? 'Active' 
                          : problem.projectStatus === 'completed'
                          ? 'Completed'
                          : problem.projectStatus === 'cancelled'
                          ? 'Cancelled'
                          : 'Ended'
                        }
                      </span>
                      {problem.endedAt && (
                        <span>Ended: {new Date(problem.endedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewVersionHistory(problem._id)}
                      className="flex items-center gap-1"
                    >
                      <GitBranch className="h-4 w-4" />
                      History
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleGoToProject(problem._id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Board
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditProject(problem._id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEndProject(problem)}
                      disabled={problem.projectStatus !== 'active'}
                      className={`${
                        problem.projectStatus !== 'active' 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'text-red-600 border-red-600 hover:bg-red-50'
                      }`}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {problem.projectStatus !== 'active' ? 'Project Ended' : 'End Project'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={handleCloseProfileModal}
        userId={profileModal.userId}
        initialUserData={profileModal.userData}
      />

      {/* End Project Modal */}
      <EndProjectModal
        isOpen={endProjectModal.isOpen}
        onClose={handleCloseEndProjectModal}
        onConfirm={handleConfirmEndProject}
        project={endProjectModal.project}
        loading={endingProject}
      />
    </div>
  );
};

export default CreatorDashboard;
