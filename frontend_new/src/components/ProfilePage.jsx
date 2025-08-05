import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Github, 
  Shield, 
  Edit,
  Save,
  X,
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  Settings,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePictureSelector from './ProfilePictureSelector';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    githubProfile: user?.githubProfile || '',
    profileImage: user?.profileImage || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
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
      const profileData = {
        fullName: formData.fullName,
        username: formData.username,
        profileImage: formData.profileImage,
        githubProfile: formData.githubProfile
      };

      const response = await authService.updateProfile(profileData);

      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Optionally refresh the page to get updated user data
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      fullName: user?.fullName || '',
      username: user?.username || '',
      email: user?.email || '',
      githubProfile: user?.githubProfile || '',
      profileImage: user?.profileImage || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordChange(false);
  };

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
        return <Briefcase className="h-3 w-3" />;
      case 'user':
      default:
        return <User className="h-3 w-3" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view this page</p>
          <Link to="/signin">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                    <AvatarImage src={formData.profileImage} alt={formData.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {formData.fullName?.charAt(0) || formData.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="mt-4">
                      <ProfilePictureSelector
                        value={formData.profileImage}
                        onChange={(imageUrl) => setFormData({ ...formData, profileImage: imageUrl })}
                        fullName={formData.fullName}
                        username={formData.username}
                      />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.fullName || formData.username}
                </h2>
                <p className="text-gray-600 mb-4">@{formData.username}</p>
                
                <div className="flex justify-center gap-2 mb-4">
                  <Badge className={`${getRoleColor(user.role)} font-medium`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </Badge>
                  {user.role === 'creator' && user.creatorStatus && (
                    <Badge 
                      variant={user.creatorStatus === 'approved' ? 'default' : 'secondary'}
                    >
                      {user.creatorStatus}
                    </Badge>
                  )}
                </div>

                {formData.bio && (
                  <p className="text-sm text-gray-600 mb-4">{formData.bio}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                  </div>
                  {formData.location && (
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.joinedProjects?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Projects Joined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {user.role === 'creator' ? (user.createdProjects?.length || 0) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Projects Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Editable Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your personal details' : 'Your basic information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
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
                      ) : (
                        <p className="text-gray-900 py-2">{user.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      {isEditing ? (
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
                      ) : (
                        <p className="text-gray-900 py-2">@{user.username}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
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
                    ) : (
                      <p className="text-gray-900 py-2">{user.email}</p>
                    )}
                  </div>

                  {user.role === 'user' && (
                    <div className="space-y-2">
                      <Label htmlFor="githubProfile">GitHub Profile</Label>
                      {isEditing ? (
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
                      ) : (
                        <div className="py-2">
                          {user.githubProfile ? (
                            <a 
                              href={user.githubProfile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              View GitHub Profile
                            </a>
                          ) : (
                            <p className="text-gray-500">No GitHub profile linked</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {user.bio || 'No bio available'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="City, Country"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-900 py-2">
                          {formData.location || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://your-website.com"
                        />
                      ) : (
                        <div className="py-2">
                          {formData.website ? (
                            <a 
                              href={formData.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {formData.website}
                            </a>
                          ) : (
                            <p className="text-gray-500">No website</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showPasswordChange ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-gray-600">Change your password</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPasswordChange(true)}
                      >
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Account Type</p>
                          <p className="text-sm text-gray-600">
                            Current: <span className="capitalize font-medium">{user.role}</span>
                            {user.role === 'creator' && user.creatorStatus && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                user.creatorStatus === 'approved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : user.creatorStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {user.creatorStatus}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {user.role === 'user' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info('Creator upgrade feature coming soon!')}
                        >
                          Upgrade to Creator
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelPasswordChange}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelPasswordChange}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
