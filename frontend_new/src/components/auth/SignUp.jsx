import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, Shield, Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import ProfilePictureSelector from '../ProfilePictureSelector';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'user',
    githubProfile: '',
    profileImage: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, message: '', type: 'error' });

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (formData.password.length < 6) {
      setAlert({
        show: true,
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    // Check password complexity (uppercase, lowercase, number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setAlert({
        show: true,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        type: 'error'
      });
      return;
    }

    // Check username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setAlert({
        show: true,
        message: 'Username can only contain letters, numbers, and underscores',
        type: 'error'
      });
      return;
    }

    // Check GitHub profile for user role
    if (formData.role === 'user') {
      if (!formData.githubProfile) {
        setAlert({
          show: true,
          message: 'GitHub profile URL is required for user accounts',
          type: 'error'
        });
        return;
      }

      const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/;
      if (!githubRegex.test(formData.githubProfile)) {
        setAlert({
          show: true,
          message: 'Please provide a valid GitHub profile URL (https://github.com/username)',
          type: 'error'
        });
        return;
      }
    }

    // Create account
    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.username,
      formData.role,
      formData.githubProfile,
      formData.profileImage
    );

    if (result.success) {
      setAlert({
        show: true,
        message: result.message,
        type: 'success'
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setAlert({
        show: true,
        message: result.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your CodeCohort account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alert.show && (
            <Alert className={`mb-4 ${alert.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
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
                <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <ProfilePictureSelector
              value={formData.profileImage}
              onChange={(imageUrl) => setFormData({ ...formData, profileImage: imageUrl })}
              fullName={formData.fullName}
              username={formData.username}
            />

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role === 'creator' && (
                <p className="text-sm text-amber-600 mt-1">
                  Creator accounts require admin approval before access is granted.
                </p>
              )}
            </div>

            {formData.role === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="githubProfile">GitHub Profile URL</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="githubProfile"
                    name="githubProfile"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={formData.githubProfile}
                    onChange={handleChange}
                    className="pl-10"
                    required={formData.role === 'user'}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your GitHub profile will be visible to other users and team members.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
