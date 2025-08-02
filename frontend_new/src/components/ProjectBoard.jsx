import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { problemService } from '../services/problemService';
import KanbanBoard from './KanbanBoard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  User,
  Clock,
  Star,
  Code,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await problemService.getProblemById(projectId);
      const projectData = response.data;
      
      // Check if user has access to this project
      const isCreator = projectData.createdBy?._id === user?._id;
      const isAdmin = user?.role === 'admin';
      const isTeamMember = projectData.teamMembers?.some(member => 
        (member.user?._id || member._id) === user?._id
      );
      
      if (!isCreator && !isAdmin && !isTeamMember) {
        setError('You do not have access to this project');
        toast.error('Access denied. You are not a member of this project.');
        return;
      }
      
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 403) {
        setError('Access denied. You are not a member of this project.');
        toast.error('Access denied. You are not a member of this project.');
      } else {
        setError('Failed to load project');
        toast.error('Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = project.creator._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const isTeamMember = project.teamMembers?.some(member => member._id === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGoBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  <p className="text-gray-600">Project Board</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Project Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.teamMembers?.length || 0}/{project.maxTeamSize || 5}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                {/* Role Badge */}
                <Badge className={
                  isCreator ? 'bg-purple-100 text-purple-700' :
                  isAdmin ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {isCreator ? 'Creator' : isAdmin ? 'Admin' : 'Team Member'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Details */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                  {project.difficulty && (
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                  )}
                  {project.category && (
                    <Badge variant="secondary">{project.category}</Badge>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                
                {/* Creator */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Project Creator</h4>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={project.creator.profileImage} />
                      <AvatarFallback className="text-xs">
                        {project.creator.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{project.creator.fullName}</p>
                      <p className="text-xs text-gray-500">@{project.creator.username}</p>
                    </div>
                  </div>
                </div>
                
                {/* Team Members */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Developers ({project.teamMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {project.teamMembers.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profileImage} />
                            <AvatarFallback className="text-xs">
                              {member.fullName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {member._id === user?.id ? 'You' : member.fullName}
                            </p>
                            <p className="text-xs text-gray-500">@{member.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Available Slots */}
                {(project.teamMembers?.length || 0) < (project.maxTeamSize || 5) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {(project.maxTeamSize || 5) - (project.teamMembers?.length || 0)} slot(s) available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <KanbanBoard projectId={projectId} projectData={project} />
      </div>
    </div>
  );
};

export default ProjectBoard;
