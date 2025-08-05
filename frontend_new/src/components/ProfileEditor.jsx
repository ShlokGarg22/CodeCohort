import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Github, 
  Save,
  X,
  Camera
} from 'lucide-react';
import ProfilePictureSelector from './ProfilePictureSelector';
import { toast } from 'sonner';

const ProfileEditor = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    githubProfile: user?.githubProfile || '',
    profileImage: user?.profileImage || '',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would call your API to update the user profile
      // For now, we'll just show a toast
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20 border-4 border-gray-200">
                  <AvatarImage src={formData.profileImage} alt={formData.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {formData.fullName?.charAt(0) || formData.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                  <ProfilePictureSelector
                    value={formData.profileImage}
                    onChange={(imageUrl) => setFormData({ ...formData, profileImage: imageUrl })}
                    fullName={formData.fullName}
                    username={formData.username}
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {user?.role === 'user' && (
                <div className="space-y-2">
                  <Label htmlFor="githubProfile">GitHub Profile URL</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="githubProfile"
                      name="githubProfile"
                      type="url"
                      value={formData.githubProfile}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {/* Role Badge (Read-only) */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${
                      user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user?.role === 'creator' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user?.role}
                  </Badge>
                  {user?.role === 'creator' && user?.creatorStatus && (
                    <Badge variant={user.creatorStatus === 'approved' ? 'default' : 'secondary'}>
                      {user.creatorStatus}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEditor;
