import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'bg-gray-200'
  });

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = '';
    
    if (password.length === 0) {
      return { score: 0, feedback: '', color: 'bg-gray-200' };
    }
    
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    switch (score) {
      case 0-2:
        feedback = 'Very Weak';
        return { score, feedback, color: 'bg-red-500' };
      case 3:
        feedback = 'Weak';
        return { score, feedback, color: 'bg-orange-500' };
      case 4:
        feedback = 'Fair';
        return { score, feedback, color: 'bg-yellow-500' };
      case 5:
        feedback = 'Good';
        return { score, feedback, color: 'bg-green-500' };
      case 6:
        feedback = 'Strong';
        return { score, feedback, color: 'bg-green-600' };
      default:
        feedback = 'Very Weak';
        return { score, feedback, color: 'bg-red-500' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength for password field
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword: _, ...signupData } = formData;
    const result = await signup(signupData);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Animated Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 transform transition-all duration-700 hover:scale-105 hover:shadow-purple-500/25">
          {/* Header with Animation */}
          <div className="text-center transform transition-all duration-500">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform transition-all duration-500 hover:rotate-12 hover:scale-110">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join CodeCohort
            </h2>
            <p className="mt-3 text-slate-300">
              Start your coding journey with us
            </p>
            <div className="mt-2">
              <Link
                to="/signin"
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div className="transform transition-all duration-300 hover:scale-102">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-700/50 border ${
                  validationErrors.fullName ? 'border-red-500/50' : 'border-slate-600/50'
                } rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                placeholder="Enter your full name"
              />
              {validationErrors.fullName && (
                <p className="mt-2 text-sm text-red-400 animate-fade-in">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-102">
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-700/50 border ${
                  validationErrors.username ? 'border-red-500/50' : 'border-slate-600/50'
                } rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                placeholder="Choose a username"
              />
              {validationErrors.username && (
                <p className="mt-2 text-sm text-red-400 animate-fade-in">{validationErrors.username}</p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-102">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-700/50 border ${
                  validationErrors.email ? 'border-red-500/50' : 'border-slate-600/50'
                } rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                placeholder="Enter your email address"
              />
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-400 animate-fade-in">{validationErrors.email}</p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-102">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border ${
                    validationErrors.password ? 'border-red-500/50' : 'border-slate-600/50'
                  } rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="h-5 w-5 text-slate-400 hover:text-purple-400 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Enhanced Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-600/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color} shadow-lg`}
                        style={{ 
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          boxShadow: passwordStrength.score > 3 ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      passwordStrength.score < 3 ? 'text-red-400' : 
                      passwordStrength.score < 5 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-1 transition-colors duration-300 ${
                      formData.password.length >= 6 ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>6+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 transition-colors duration-300 ${
                      /[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center space-x-1 transition-colors duration-300 ${
                      /[a-z]/.test(formData.password) ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center space-x-1 transition-colors duration-300 ${
                      /\d/.test(formData.password) ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-400 animate-fade-in">{validationErrors.password}</p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-102">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border ${
                    validationErrors.confirmPassword ? 'border-red-500/50' : 'border-slate-600/50'
                  } rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg
                    className="h-5 w-5 text-slate-400 hover:text-purple-400 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 animate-fade-in">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-105">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors duration-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1C5.03 1 1 5.03 1 10s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM9 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
