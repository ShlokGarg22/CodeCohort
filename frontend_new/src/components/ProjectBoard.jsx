import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectAccess } from '../hooks/useProjectAccess';
import { problemService } from '../services/problemService';
import KanbanBoard from './KanbanBoard';
import GitHubRepositoryInput from './VersionHistory/GitHubRepositoryInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ProjectChat from './ProjectChat';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  User,
  Clock,
  Star,
  Code,
  AlertCircle,
  Crown,
  Shield,
  Github,
  GitBranch,
  Settings,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    loading: accessLoading, 
    hasAccess, 
    isCreator, 
    isTeamMember, 
    memberRole,
    project,
    canAccessRepository,
    canViewVersionHistory,
    error: accessError,
    refetch: refetchAccess
  } = useProjectAccess(projectId);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // When access check is complete, set loading to false
    if (!accessLoading) {
      setLoading(false);
      if (accessError) {
        setError(accessError);
      } else if (!hasAccess) {
        setError('You do not have access to this project');
      }
    }
  }, [accessLoading, hasAccess, accessError]);

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

  const handleRepositoryChange = (url, repoData, isLocked) => {
    // Refresh the project access data to get updated repository info
    refetchAccess();
    toast.success('Repository settings updated!');
  };

  if (!user || loading) {
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'creator':
        return <Crown className="h-4 w-4" />;
      case 'lead':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    if (isCreator) return 'bg-purple-100 text-purple-700';
    if (user?.role === 'admin') return 'bg-red-100 text-red-700';
    if (memberRole === 'lead') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getRoleDisplayName = () => {
    if (isCreator) return 'Creator';
    if (user?.role === 'admin') return 'Admin';
    if (memberRole === 'lead') return 'Team Lead';
    return 'Developer';
  };

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
                <Badge className={getRoleBadgeColor()}>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(memberRole)}
                    {getRoleDisplayName()}
                  </div>
                </Badge>

                {/* Repository Access */}
                {canAccessRepository && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(project.githubRepository.url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Repository
                  </Button>
                )}

                {/* Version History Access */}
                {canViewVersionHistory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/project/${projectId}/version-history`)}
                    className="flex items-center gap-2"
                  >
                    <GitBranch className="h-4 w-4" />
                    Version History
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ended Project Banner */}
      {project.projectStatus !== 'active' && (
        <div className={`${
          project.projectStatus === 'completed' 
            ? 'bg-blue-50 border-blue-200' 
            : project.projectStatus === 'cancelled'
            ? 'bg-red-50 border-red-200'
            : 'bg-orange-50 border-orange-200'
        } border-b px-4 py-3`}>
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className={`h-5 w-5 ${
              project.projectStatus === 'completed' 
                ? 'text-blue-600' 
                : project.projectStatus === 'cancelled'
                ? 'text-red-600'
                : 'text-orange-600'
            }`} />
            <div className="flex-1">
              <p className={`font-medium ${
                project.projectStatus === 'completed' 
                  ? 'text-blue-900' 
                  : project.projectStatus === 'cancelled'
                  ? 'text-red-900'
                  : 'text-orange-900'
              }`}>
                This project has been {project.projectStatus}
                {project.endedAt && ` on ${format(new Date(project.endedAt), 'PPP')}`}
              </p>
              {project.endReason && (
                <p className={`text-sm mt-1 ${
                  project.projectStatus === 'completed' 
                    ? 'text-blue-700' 
                    : project.projectStatus === 'cancelled'
                    ? 'text-red-700'
                    : 'text-orange-700'
                }`}>
                  {project.endReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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

                {/* Open Chat Button */}
                <div className="mb-6">
                  <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        Open Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Project Chat</DialogTitle>
                      </DialogHeader>
                      <ProjectChat projectId={projectId} />
                    </DialogContent>
                  </Dialog>
                </div>
                
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
                      <AvatarImage src={project.creator?.profileImage || project.createdBy?.profileImage} />
                      <AvatarFallback className="text-xs">
                        {(project.creator?.fullName || project.createdBy?.fullName)?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{project.creator?.fullName || project.createdBy?.fullName || 'Creator'}</p>
                      <p className="text-xs text-gray-500">@{project.creator?.username || project.createdBy?.username || 'creator'}</p>
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
                      {project.teamMembers?.map((member) => {
                        const userData = member.user || member; // Handle both nested and flat structure
                        return (
                          <div key={userData?._id || Math.random()} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userData?.profileImage} />
                              <AvatarFallback className="text-xs">
                                {userData?.fullName?.charAt(0)?.toUpperCase() || userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {userData?._id === user?.id ? 'You' : userData?.fullName || userData?.username || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">@{userData?.username || 'unknown'}</p>
                            </div>
                          </div>
                        );
                      })}
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

        {/* Main Content - Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <TabsList className={`grid w-full ${isCreator && canViewVersionHistory ? 'grid-cols-3' : isCreator || canViewVersionHistory ? 'grid-cols-2' : 'grid-cols-1'} bg-gray-50 rounded-t-lg`}>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Project Board
              </TabsTrigger>
              {isCreator && (
                <TabsTrigger value="repository" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Repository Settings
                </TabsTrigger>
              )}
              {canViewVersionHistory && (
                <TabsTrigger value="version" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Version History
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="board" className="space-y-6">
            <KanbanBoard projectId={projectId} projectData={project} />
          </TabsContent>

          {isCreator && (
            <TabsContent value="repository" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Repository Integration
                  </CardTitle>
                  <CardDescription>
                    Link your project to a GitHub repository to enable version history tracking for your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GitHubRepositoryInput
                    projectId={projectId}
                    initialRepoUrl={project?.githubRepository?.url || ''}
                    isLocked={project?.githubRepository?.isLocked || false}
                    canEdit={true}
                    onRepositoryChange={handleRepositoryChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canViewVersionHistory && (
            <TabsContent value="version" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Version History
                  </CardTitle>
                  <CardDescription>
                    View detailed commit history and code changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to View Version History
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your repository is linked and ready for version tracking
                    </p>
                    <Button
                      onClick={() => navigate(`/project/${projectId}/version-history`)}
                      className="flex items-center gap-2"
                    >
                      <GitBranch className="h-4 w-4" />
                      Open Version History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectBoard;
