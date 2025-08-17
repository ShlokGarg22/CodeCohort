import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import {
  User,
  MapPin,
  Calendar,
  Github,
  ExternalLink,
  Briefcase,
  Code,
  Users,
  BookOpen,
  Loader2,
  Mail
} from 'lucide-react';
import { authService } from '../services/authService';
import { format } from 'date-fns';
import { toast } from 'sonner';

const UserProfileModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  initialUserData = null // Can pass initial data to avoid extra API call
}) => {
  const [user, setUser] = useState(initialUserData);
  const [loading, setLoading] = useState(!initialUserData);

  useEffect(() => {
    if (isOpen && userId && !initialUserData) {
      fetchUserProfile();
    }
  }, [isOpen, userId, initialUserData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserProfile(userId);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUser(initialUserData);
    setLoading(!initialUserData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading profile...</span>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-lg">
                  {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.fullName || user.username}</h3>
                <p className="text-gray-600">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-gray-700 mt-2">{user.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === 'creator' ? 'default' : 'secondary'}>
                    {user.role === 'creator' ? 'Creator' : 'Developer'}
                  </Badge>
                  {user.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{user.stats?.totalProjects || 0}</div>
                  <div className="text-xs text-gray-600">Projects Joined</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">
                    {user.stats?.memberSince ? format(new Date(user.stats.memberSince), 'MMM yyyy') : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Member Since</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Code className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">{user.skills?.length || 0}</div>
                  <div className="text-xs text-gray-600">Skills</div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Section */}
            {user.skills && user.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {user.experience && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience Level
                </h4>
                <Badge variant="secondary" className="text-sm">
                  {user.experience}
                </Badge>
              </div>
            )}

            {/* Recent Projects */}
            {user.joinedProjects && user.joinedProjects.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Recent Projects ({user.joinedProjects.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {user.joinedProjects.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{project.title}</div>
                        <div className="text-xs text-gray-600">{project.category} • {project.difficulty}</div>
                      </div>
                    </div>
                  ))}
                  {user.joinedProjects.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      ...and {user.joinedProjects.length - 5} more projects
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links Section */}
            <div className="flex gap-2">
              {user.githubUsername && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://github.com/${user.githubUsername}`, '_blank')}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              )}
              {user.portfolioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(user.portfolioUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portfolio
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600">
              Unable to load user profile information.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
