import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Code, 
  Trophy, 
  Clock, 
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  User,
  ExternalLink,
  GitBranch
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { teamService } from '../services/teamService';
import JoinTeamModal from './JoinTeamModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalSubmissions: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch available projects from backend
      try {
        const projectsResponse = await problemService.getAllProblems();
        const allProjects = projectsResponse.data || [];
        
        // Filter projects: exclude user's own projects and those already joined
        const userJoinedProjectIds = user?.joinedProjects?.map(p => p._id) || [];
        const available = allProjects.filter(project => 
          project.creator !== user?.id && // Not created by user
          !userJoinedProjectIds.includes(project._id) && // Not already joined
          project.isActive && // Project is active
          (project.teamMembers?.length || 0) < (project.maxTeamSize || 5) // Has available slots
        );
        
        // Get user's joined projects
        const joined = allProjects.filter(project => 
          userJoinedProjectIds.includes(project._id)
        );
        
        setAvailableProjects(available.slice(0, 6)); // Show only first 6
        setMyProjects(joined);
        
        // Update stats based on real data
        setStats({
          problemsSolved: joined.length,
          currentStreak: 3,
          totalSubmissions: joined.length * 4,
          successRate: joined.length > 0 ? 75 : 0
        });

        // Create recent activity based on joined projects
        const mockActivity = joined.slice(0, 3).map((project, index) => ({
          id: project._id,
          problemTitle: project.title,
          status: "Working",
          difficulty: project.difficulty || "Medium",
          date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
          timeSpent: `${Math.floor(Math.random() * 60) + 15} min`
        }));
        
        setRecentActivity(mockActivity);
        
      } catch (apiError) {
        console.log('API not available, using demo data');
        // Fallback to demo data when backend is not available
        const demoProjects = [
          {
            _id: '1',
            title: 'E-commerce Platform',
            description: 'Build a full-stack e-commerce platform with React and Node.js',
            difficulty: 'Hard',
            techStack: ['React', 'Node.js', 'MongoDB'],
            creator: 'demo-creator-1',
            isActive: true,
            teamMembers: ['user1', 'user2'],
            maxTeamSize: 5,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            _id: '2',
            title: 'Task Management App',
            description: 'Create a collaborative task management application',
            difficulty: 'Medium',
            techStack: ['React', 'Express', 'PostgreSQL'],
            creator: 'demo-creator-2',
            isActive: true,
            teamMembers: ['user3'],
            maxTeamSize: 4,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            _id: '3',
            title: 'Chat Application',
            description: 'Real-time chat application with Socket.io',
            difficulty: 'Medium',
            techStack: ['React', 'Socket.io', 'Node.js'],
            creator: 'demo-creator-3',
            isActive: true,
            teamMembers: [],
            maxTeamSize: 3,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ];
        
        setAvailableProjects(demoProjects);
        setMyProjects([]);
        
        // Demo stats
        setStats({
          problemsSolved: 0,
          currentStreak: 0,
          totalSubmissions: 0,
          successRate: 0
        });
        
        setRecentActivity([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Only show error if it's not a network error (backend not running)
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to load dashboard data');
      } else {
        console.log('Backend not available, using demo mode');
      }
    } finally {
      setLoading(false);
    }
    
    // Keep the recommended problems mock data
    setRecommendedProblems([
      {
        id: 1,
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        category: "Linked Lists",
        rating: 4.5,
        solvedBy: 1250
      },
      {
        id: 2,
        title: "Maximum Subarray",
        difficulty: "Medium",
        category: "Dynamic Programming",
        rating: 4.3,
        solvedBy: 890
      },
      {
        id: 3,
        title: "Valid Palindrome",
        difficulty: "Easy",
        category: "String Manipulation",
        rating: 4.1,
        solvedBy: 2100
      }
    ]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
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
      await teamService.requestToJoinTeam(projectId, message);
      toast.success('Join request sent successfully! The creator will review your request.');
      
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
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Code submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Problem success rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Projects ({myProjects.length}/3)
            </CardTitle>
            <CardDescription>
              Projects you've joined as a team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>You haven't joined any projects yet</p>
                <p className="text-sm text-gray-400">Browse available projects below to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myProjects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <h4 className="font-medium">{project.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {project.difficulty && (
                          <Badge className={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{project.teamMembers?.length || 0}/{project.maxTeamSize || 5}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created by {project.creator?.fullName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVersionHistory(project._id)}
                        className="flex items-center gap-1"
                      >
                        <GitBranch className="h-3 w-3" />
                        History
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleGoToProject(project._id)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Projects to Join */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Projects
            </CardTitle>
            <CardDescription>
              Discover and join exciting projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No available projects to join</p>
                <p className="text-sm text-gray-400">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableProjects.map((project) => {
                  const teamSlotsUsed = project.teamMembers?.length || 0;
                  const maxTeamSize = project.maxTeamSize || 5;
                  
                  return (
                    <div key={project._id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {project.difficulty && (
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{teamSlotsUsed}/{maxTeamSize} members</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          by {project.creator?.fullName}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinProject(project)}
                        disabled={myProjects.length >= 3}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest coding sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.problemTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(activity.difficulty)}>
                        {activity.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.date.toLocaleDateString()} • {activity.timeSpent}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Problems tailored to your skill level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{problem.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{problem.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{problem.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {problem.solvedBy} solved
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Solve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
