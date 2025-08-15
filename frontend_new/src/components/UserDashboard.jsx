import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Code, 
  Trophy, 
  TrendingUp, 
  Users, 
  ExternalLink,
  GitBranch,
  Clock,
  Star,
  Home
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalProjects: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for join request responses to refresh dashboard
  useEffect(() => {
    if (!socket) return;

    const handleJoinResponse = (response) => {
      console.log('🔄 Join response received in UserDashboard:', response);
      if (response.approved) {
        console.log('✅ Join request approved, refreshing dashboard data...');
        toast.success(`You've been added to "${response.projectTitle}"! Refreshing dashboard...`);
        
        // Multiple refresh attempts to ensure data is loaded
        // First refresh after 1 second
        setTimeout(() => {
          console.log('🔄 First dashboard refresh after join approval...');
          fetchDashboardData();
        }, 1000);
        
        // Second refresh after 3 seconds as backup
        setTimeout(() => {
          console.log('🔄 Second dashboard refresh after join approval...');
          fetchDashboardData();
        }, 3000);
      } else {
        toast.info(`Your request to join "${response.projectTitle}" was declined.`);
      }
    };

    // Also listen for team member joined events
    const handleTeamMemberJoined = (data) => {
      console.log('👥 Team member joined event:', data);
      if (data.newMember && data.newMember.id === user?._id) {
        console.log('✅ I was added to a team, refreshing dashboard...');
        fetchDashboardData();
      }
    };

    socket.on('join_request_response', handleJoinResponse);
    socket.on('team_member_joined', handleTeamMemberJoined);

    return () => {
      socket.off('join_request_response', handleJoinResponse);
      socket.off('team_member_joined', handleTeamMemberJoined);
    };
  }, [socket, user?._id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Fetching dashboard data...');
      console.log('👤 Current user:', user);

      // Fetch pending requests
      const pendingResult = await teamService.getPendingRequests();
      console.log('Pending requests result:', pendingResult);
      if (pendingResult.success) {
        const pendingArray = Array.isArray(pendingResult.data) ? pendingResult.data : [];
        setPendingRequests(pendingArray);
        console.log('✅ Pending requests set:', pendingArray.length);
      } else {
        console.error('Failed to fetch pending requests:', pendingResult.message);
      }
      
      // Fetch user's joined projects
      console.log('🔍 Fetching joined projects...');
      const myProjectsResult = await problemService.getMyJoinedProblems();
      console.log('My projects result:', myProjectsResult);
      
      let myProjectsArray = [];
      if (myProjectsResult.success) {
        const joinedProjects = myProjectsResult.data?.problems || [];
        console.log('joinedProjects extracted:', joinedProjects);
        console.log('joinedProjects type:', typeof joinedProjects);
        console.log('joinedProjects is array:', Array.isArray(joinedProjects));
        console.log('joinedProjects length:', joinedProjects?.length);
        
        // Ensure we always set an array and normalize _id/string ids
        myProjectsArray = Array.isArray(joinedProjects) ? joinedProjects : [];
        myProjectsArray = myProjectsArray.map(p => ({
          // normalize id to _id if backend sometimes returns id
          _id: p._id || p.id || (typeof p === 'string' ? p : undefined),
          title: p.title,
          description: p.description,
          status: p.status,
          teamMembers: p.teamMembers || [],
          maxTeamSize: p.maxTeamSize,
          createdAt: p.createdAt || p.createdAtDate || new Date().toISOString(),
          rating: p.rating
        }));
        setMyProjects(myProjectsArray);
        console.log('✅ My projects set:', myProjectsArray.length, 'projects');
        
        // Calculate stats based on actual data
        if (Array.isArray(myProjectsArray)) {
          const problemsSolved = myProjectsArray.filter(p => p.status === 'completed').length;
          const currentStreak = Math.floor(Math.random() * 7) + 1; // Mock data for now
          const totalProjects = myProjectsArray.length;
          const averageRating = myProjectsArray.length > 0 
            ? (myProjectsArray.reduce((sum, p) => sum + (p.rating || 4), 0) / myProjectsArray.length).toFixed(1)
            : 0;

          setStats({
            problemsSolved,
            currentStreak,
            totalProjects,
            averageRating: parseFloat(averageRating)
          });
        } else {
          setStats({
            problemsSolved: 0,
            currentStreak: 0,
            totalProjects: 0,
            averageRating: 0
          });
        }
      } else {
        console.error('Failed to fetch joined projects:', myProjectsResult.message);
        toast.error('Failed to load your projects');
        setMyProjects([]);
        setStats({
          problemsSolved: 0,
          currentStreak: 0,
          totalProjects: 0,
          averageRating: 0
        });
      }
      
      console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(`Failed to load dashboard: ${error.message || 'Unknown error'}`);
      
      // Set default values so dashboard still shows
      setMyProjects([]);
      setStats({
        problemsSolved: 0,
        currentStreak: 0,
        totalProjects: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'solved': return 'bg-green-100 text-green-800';
      case 'working': return 'bg-blue-100 text-blue-800';
      case 'attempted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const handleGoToProject = (projectId) => {
    if (!projectId) {
      toast.error('Project id missing');
      return;
    }
    navigate(`/project/${projectId}`);
  };

  const handleViewVersionHistory = (projectId) => {
    navigate(`/project/${projectId}/version-history`);
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await teamService.cancelJoinRequest(requestId);
      toast.success('Join request cancelled successfully');
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading dashboard...</p>
        </div>
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
          <CardTitle>Welcome back, {user?.fullName}!</CardTitle>
          <CardDescription>
            Continue your coding journey and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">Coding Enthusiast</Badge>
              <p className="text-sm text-gray-600">Keep practicing to unlock new achievements!</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
              >
                🔄 Refresh
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Code className="h-4 w-4 mr-2" />
                Start Coding
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.problemsSolved}</div>
            <p className="text-xs text-muted-foreground">Great progress!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active collaborations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Join Requests
            </CardTitle>
            <CardDescription>
              Requests you've sent that are awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{request.project?.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Request sent to {request.creator?.fullName || request.creator?.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelRequest(request._id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>
            Projects you're currently working on
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myProjects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Join a project to start collaborating with other developers</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Browse Available Projects
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(myProjects) && myProjects.map((project) => (
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
                        <Badge className={getStatusBadgeClass(project.status)}>
                          {project.status || 'Not Started'}
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
                          View Project
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewVersionHistory(project._id)}
                        >
                          <GitBranch className="h-3 w-3" />
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
    </div>
  );
};

export default UserDashboard;
