import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
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
  User
} from 'lucide-react';
import { toast } from 'sonner';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const isApproved = user?.creatorStatus === 'approved';
  const isPending = user?.creatorStatus === 'pending';
  const isRejected = user?.creatorStatus === 'rejected';

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

  const handleJoinRequestAction = async (requestId, action) => {
    try {
      if (action === 'approve') {
        await teamService.approveJoinRequest(requestId);
        toast.success('Join request approved successfully!');
      } else {
        await teamService.rejectJoinRequest(requestId);
        toast.success('Join request rejected');
      }
      
      // Remove the request from the list
      setJoinRequests(prev => prev.filter(req => req._id !== requestId));
      
      // Refresh problems to update team member count
      fetchMyProblems();
    } catch (error) {
      console.error('Error processing join request:', error);
      toast.error(error.message || 'Failed to process join request');
    }
  };

  const handleGoToProject = (projectId) => {
    navigate(`/project/${projectId}`);
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

      {/* Join Requests */}
      {joinRequests.length > 0 && (
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
                {joinRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{request.user.fullName}</span>
                        <span className="text-sm text-gray-500">wants to join</span>
                        <span className="font-medium">{request.project.title}</span>
                      </div>
                      {request.message && (
                        <p className="text-sm text-gray-600 mb-2 pl-6">
                          "{request.message}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pl-6">
                        <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                        <span>Team: {request.project.teamMembers?.length || 0}/{request.project.maxTeamSize || 5}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleJoinRequestAction(request._id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoinRequestAction(request._id, 'reject')}
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
                      <span className={`font-medium ${problem.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {problem.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGoToProject(problem._id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Board
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
