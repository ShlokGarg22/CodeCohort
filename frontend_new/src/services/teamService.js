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

export const teamService = {
  async requestToJoinTeam(projectId, message = '') {
    try {
      const response = await api.post(`/projects/${projectId}/join`, { message });
      return response.data;
    } catch (error) {
      console.error('Request to join team error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send join request');
    }
  },

  async getPendingRequests() {
    try {
      const response = await api.get('/requests/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  },

  async respondToJoinRequest(requestId, action) {
    try {
      const response = await api.put(`/requests/${requestId}/respond`, { action });
      return response.data;
    } catch (error) {
      console.error('Respond to join request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to respond to request');
    }
  },

  async getMyRequests() {
    try {
      const response = await api.get('/requests/my');
      return response.data;
    } catch (error) {
      console.error('Get my requests error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch your requests');
    }
  },

  async getMyTeams() {
    try {
      const response = await api.get('/teams/my');
      return response.data;
    } catch (error) {
      console.error('Get my teams error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch your teams');
    }
  },

  async leaveTeam(projectId) {
    try {
      const response = await api.delete(`/projects/${projectId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Leave team error:', error);
      throw new Error(error.response?.data?.message || 'Failed to leave team');
    }
  }
};
