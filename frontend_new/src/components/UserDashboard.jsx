import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Code, 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  User, 
  ExternalLink,
  GitBranch,
  Clock,
  Star
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import JoinTeamModal from './JoinTeamModal';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendJoinRequest, isConnected, isAuthenticated } = useSocket();
  const [loading, setLoading] = useState(true);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalProjects: 0,
    averageRating: 0
  });
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch available projects
      const availableResult = await problemService.getAvailableProblems();
      if (availableResult.success) {
        setAvailableProjects(availableResult.data.problems);
      }

      // Fetch user's joined projects
      const myProjectsResult = await problemService.getMyJoinedProblems();
      if (myProjectsResult.success) {
        setMyProjects(myProjectsResult.data.problems);
      }

      // Calculate stats
      const problemsSolved = myProjects.filter(p => p.status === 'solved').length;
      const currentStreak = Math.floor(Math.random() * 7) + 1; // Mock data
      const totalProjects = myProjects.length;
      const averageRating = myProjects.length > 0 
        ? (myProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / myProjects.length).toFixed(1)
        : 0;

      setStats({
        problemsSolved,
        currentStreak,
        totalProjects,
        averageRating
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const handleJoinProject = (project) => {
    // Check if user can join more projects (max 3)
    if (myProjects.length >= 3) {
      toast.error('You can only join a maximum of 3 projects');
      return;
    }
    
    setSelectedProject(project);
    setIsJoinModalOpen(true);
  };

  const handleJoinSubmit = async (projectId, message) => {
    try {
      // First, try to send via API (primary method)
      try {
        await teamService.requestToJoinTeam(projectId, message);
        toast.success('Join request sent successfully! The creator will review your request.');
      } catch (apiError) {
        console.log('API request failed, trying Socket.IO fallback:', apiError.message);
        
        // Fallback to Socket.IO if API fails
        if (isConnected && isAuthenticated && selectedProject) {
          const requesterData = {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            profileImage: user.profileImage,
            projectTitle: selectedProject.title
          };

          sendJoinRequest(
            projectId,
            selectedProject.createdBy,
            requesterData,
            message
          );
          
          toast.success('Join request sent via real-time connection! The creator will review your request.');
        } else {
          throw new Error('Both API and Socket.IO connections are unavailable');
        }
      }
      
      // Remove project from available list
      setAvailableProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error(error.message || 'Failed to send join request');
    }
  };

  const handleGoToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleViewVersionHistory = (projectId) => {
    navigate(`/project/${projectId}/version-history`);
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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Code className="h-4 w-4 mr-2" />
              Start Coding
            </Button>
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
                onClick={() => document.getElementById('available-projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Available Projects
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((project) => (
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

      {/* Available Projects Section */}
      <Card id="available-projects">
        <CardHeader>
          <CardTitle>Available Projects</CardTitle>
          <CardDescription>
            Join exciting projects and collaborate with other developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableProjects.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No available projects</h3>
              <p className="text-gray-500">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.map((project) => (
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
                        <span className="text-gray-600">Creator:</span>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.createdBy?.profileImage} />
                            <AvatarFallback>
                              {project.createdBy?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{project.createdBy?.username}</span>
                        </div>
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
                          onClick={() => handleJoinProject(project)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={myProjects.length >= 3}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Join Team
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGoToProject(project._id)}
                        >
                          <ExternalLink className="h-3 w-3" />
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

      {/* Join Team Modal */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleJoinSubmit}
        project={selectedProject}
      />
    </div>
  );
};

export default UserDashboard;
