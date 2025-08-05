import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Github, 
  Shield, 
  Edit,
  MapPin,
  Phone,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import ProfileEditor from './ProfileEditor';

const Profile = ({ isCompact = false }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'creator':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'creator':
        return <User className="h-3 w-3" />;
      case 'user':
      default:
        return <User className="h-3 w-3" />;
    }
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
        <Avatar className="h-12 w-12 border-2 border-gray-200">
          <AvatarImage src={user.profileImage} alt={user.fullName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.fullName || user.username}
            </h3>
            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="ml-1 capitalize">{user.role}</span>
            </Badge>
          </div>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
          {user.role === 'creator' && user.creatorStatus && (
            <Badge 
              variant={user.creatorStatus === 'approved' ? 'default' : 'secondary'}
              className="text-xs mt-1"
            >
              {user.creatorStatus}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="flex-shrink-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.profileImage} alt={user.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 shadow-lg"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {user.fullName || user.username}
        </CardTitle>
        <CardDescription className="flex items-center justify-center gap-2 mt-2">
          <Badge className={`${getRoleColor(user.role)} font-medium`}>
            {getRoleIcon(user.role)}
            <span className="ml-1 capitalize">{user.role}</span>
          </Badge>
          {user.role === 'creator' && user.creatorStatus && (
            <Badge 
              variant={user.creatorStatus === 'approved' ? 'default' : 'secondary'}
            >
              Status: {user.creatorStatus}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Username:</span>
            <span className="font-medium text-gray-900">@{user.username}</span>
          </div>
          
          {user.githubProfile && (
            <div className="flex items-center gap-3 text-sm">
              <Github className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">GitHub:</span>
              <a 
                href={user.githubProfile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View Profile
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Joined:</span>
            <span className="font-medium text-gray-900">
              {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Recently'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {user.joinedProjects?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {user.role === 'creator' ? user.createdProjects?.length || 0 : '-'}
              </div>
              <div className="text-xs text-gray-600">Created</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-3 w-3 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Editor Modal */}
        <ProfileEditor
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      </CardContent>
    </Card>
  );
};

export default Profile;
