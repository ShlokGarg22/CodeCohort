import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email, password) {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/auth/signin', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(fullName, email, password, username, role = 'user', githubProfile = '', profileImage = '') {
    try {
      console.log('Attempting registration with:', { fullName, email, username, role, githubProfile, profileImage: profileImage ? 'provided' : 'none' });
      const response = await api.post('/auth/signup', { 
        fullName, 
        email, 
        password, 
        username,
        role,
        githubProfile,
        profileImage
      });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async verifyToken() {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  async getUserProfile(userId) {
    try {
      const response = await api.get(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
};
