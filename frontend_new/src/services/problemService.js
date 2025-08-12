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

export const problemService = {
  async createProblem(problemData) {
    try {
      console.log('Creating problem:', problemData);
      const response = await api.post('/problems', problemData);
      console.log('Create problem response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create problem error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Failed to create problem');
    }
  },

  async getProblems(params = {}) {
    try {
      const response = await api.get('/problems', { params });
      return response.data;
    } catch (error) {
      console.error('Get problems error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch problems');
    }
  },

  // Alias for getAllProblems
  async getAllProblems(params = {}) {
    return this.getProblems(params);
  },

  async getProblemById(id) {
    try {
      const response = await api.get(`/problems/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get problem error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch problem');
    }
  },

  async getMyProblems() {
    try {
      const response = await api.get('/problems/my/problems');
      return response.data;
    } catch (error) {
      console.error('Get my problems error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch your problems');
    }
  },

  async updateProblem(id, problemData) {
    try {
      const response = await api.put(`/problems/${id}`, problemData);
      return response.data;
    } catch (error) {
      console.error('Update problem error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update problem');
    }
  },

  async deleteProblem(id) {
    try {
      const response = await api.delete(`/problems/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete problem error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete problem');
    }
  }
};
