import React, { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload, Camera, Sparkles, Check, Loader2 } from 'lucide-react';
import { animatedAvatars, getAvatarDataUrl } from '../data/animatedAvatars';
import { toast } from 'sonner';
import imageUploadService from '../services/imageUploadService';
import { useAuth } from '../contexts/AuthContext';

const ProfilePictureSelector = ({ value, onChange, fullName, username }) => {
  const [activeTab, setActiveTab] = useState('animated');
  const [selectedAnimated, setSelectedAnimated] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { updateUser } = useAuth();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Upload to Cloudinary
      const result = await imageUploadService.uploadProfileImage(file);
      
      if (result.success) {
        setUploadedImage(result.imageUrl);
        setSelectedAnimated(null);
        onChange(result.imageUrl);
        setActiveTab('upload');
        
        // Update user context with new profile image
        if (result.user) {
          updateUser(result.user);
        }
        
        toast.success('Profile image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectAnimatedAvatar = (avatar) => {
    const avatarUrl = getAvatarDataUrl(avatar);
    setSelectedAnimated(avatar.id);
    setUploadedImage(null);
    onChange(avatarUrl);
    setActiveTab('animated');
  };

  const clearSelection = () => {
    setSelectedAnimated(null);
    setUploadedImage(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Profile Picture</Label>
      
      {/* Current Selection Preview */}
      {(value || uploadedImage) && (
        <div className="flex items-center justify-center">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={value || uploadedImage} alt="Profile preview" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                {fullName?.charAt(0) || username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
              onClick={clearSelection}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Tab Selection */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'animated' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('animated')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Animated
        </Button>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Animated Avatars Tab */}
      {activeTab === 'animated' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {animatedAvatars.map((avatar) => (
                <div key={avatar.id} className="relative">
                  <button
                    type="button"
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAnimated === avatar.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectAnimatedAvatar(avatar)}
                  >
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: avatar.svg }}
                    />
                    {selectedAnimated === avatar.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-blue-600 bg-white rounded-full p-1" />
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-center mt-1 text-gray-600 truncate">
                    {avatar.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
                  isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-sm text-blue-600 mb-2">
                      Uploading your image...
                    </p>
                    <p className="text-xs text-gray-500">
                      Please wait while we process your image
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload your profile picture
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </>
                )}
              </div>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              
              {uploadedImage && (
                <div className="flex items-center justify-center">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={uploadedImage} alt="Uploaded preview" />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePictureSelector;
