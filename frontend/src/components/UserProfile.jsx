import React, { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

const UserProfile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const fileInputRef = useRef(null)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: user?.username || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    about: user?.about || 'Passionate full-stack developer with 3+ years of experience building modern web applications.',
    techStack: user?.techStack || ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    avatar: user?.avatar || null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  // Generate avatar initials
  const getAvatarInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle tech stack changes
  const handleTechStackChange = (e) => {
    const value = e.target.value
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech)
    setProfileData(prev => ({
      ...prev,
      techStack: techArray
    }))
  }

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          avatar: 'File size must be less than 5MB'
        }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }))
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove tech stack item
  const removeTechStack = (indexToRemove) => {
    setProfileData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, index) => index !== indexToRemove)
    }))
  }

  // Add new tech stack item
  // (Function removed because it was unused)

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (isChangingPassword) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Current password is required'
      }
      if (!profileData.newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (profileData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters'
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return
    
    try {
      // Here you would typically call an API to update the user
      // await updateUser(profileData)
      
      console.log('Saving profile:', profileData)
      setIsEditing(false)
      setIsChangingPassword(false)
      
      // Reset password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
      // Show success message (you can implement a toast notification)
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ general: 'Failed to update profile. Please try again.' })
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false)
    setIsChangingPassword(false)
    setErrors({})
    // Reset form to original user data
    setProfileData({
      username: user?.username || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      about: user?.about || 'Passionate full-stack developer with 3+ years of experience building modern web applications.',
      techStack: user?.techStack || ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      avatar: user?.avatar || null,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a192f' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-cyan-400/30 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-8">
            <div className="flex flex-col items-center space-y-4">
              
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-cyan-400/50 overflow-hidden bg-slate-600 flex items-center justify-center">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-cyan-400">
                      {getAvatarInitials(profileData.username)}
                    </span>
                  )}
                </div>
                
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-2 rounded-full shadow-lg transition-all transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              {errors.avatar && (
                <p className="text-red-400 text-sm">{errors.avatar}</p>
              )}
              
              {/* Edit Button */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-medium transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-medium transition-all transform hover:scale-105 shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-600 hover:bg-slate-500 text-slate-200 px-6 py-2 rounded-md font-medium transition-colors border border-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="p-6 space-y-6">
            
            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-400 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-200 py-2">{profileData.username}</p>
                )}
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-200 py-2">{profileData.email}</p>
                )}
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            
            {/* Password Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                {!isChangingPassword && isEditing && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              {!isChangingPassword ? (
                <p className="text-slate-200 py-2">••••••••••••</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={profileData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                    {errors.currentPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={profileData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                    {errors.newPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="text-slate-400 hover:text-slate-300 text-sm"
                  >
                    Cancel Password Change
                  </button>
                </div>
              )}
            </div>
            
            {/* About Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                About
              </label>
              {isEditing ? (
                <textarea
                  name="about"
                  value={profileData.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-200 py-2 leading-relaxed">{profileData.about}</p>
              )}
            </div>
            
            {/* Tech Stack Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tech Stack
              </label>
              
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter technologies separated by commas (e.g., JavaScript, React, Node.js)"
                    value={profileData.techStack.join(', ')}
                    onChange={handleTechStackChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                  <p className="text-slate-400 text-xs">
                    Separate technologies with commas. Click on a technology below to remove it.
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {profileData.techStack.map((tech, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 bg-slate-700 text-cyan-400 text-sm rounded-full border border-cyan-400/30 ${
                      isEditing ? 'cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/30' : ''
                    } transition-all`}
                    onClick={() => isEditing && removeTechStack(index)}
                    title={isEditing ? 'Click to remove' : ''}
                  >
                    {tech}
                    {isEditing && (
                      <span className="ml-2">×</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
