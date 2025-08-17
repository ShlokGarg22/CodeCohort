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

  async getAllProblems() {
    try {
      const response = await api.get('/problems');
      return {
        success: true,
        data: response.data?.problems || response.data || [],
        problems: response.data?.problems || response.data || []
      };
    } catch (error) {
      console.error('Get all problems error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch problems',
        data: []
      };
    }
  },

  async getAvailableProblems() {
    try {
      const response = await api.get('/problems');
      // Filter out problems where user is already a member
      const allProblems = response.data?.problems || response.data || [];
      return {
        success: true,
        data: {
          problems: allProblems
        }
      };
    } catch (error) {
      console.error('Get available problems error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available problems',
        data: { problems: [] }
      };
    }
  },

  async getMyJoinedProblems() {
    try {
      const response = await api.get('/problems/joined');

      // Backend may return either:
      // { success: true, data: { problems: [...] } }
      // or directly { problems: [...] }
      const problemsFromBody = response.data?.data?.problems
        || response.data?.problems
        || response.data
        || [];

      // Ensure we return a plain array under data.problems
      return {
        success: true,
        data: {
          problems: Array.isArray(problemsFromBody) ? problemsFromBody : []
        }
      };
    } catch (error) {
      console.error('Get joined problems error:', error);
      // If endpoint doesn't exist, try to get user's projects from user profile
      try {
        const userResponse = await api.get('/auth/profile');
        const joinedProjects = userResponse.data?.user?.joinedProjects || [];
        return {
          success: true,
          data: {
            problems: joinedProjects
          }
        };
      } catch (profileError) {
        console.error('Get user profile error:', profileError);
        return {
          success: false,
          message: 'Failed to fetch joined problems',
          data: { problems: [] }
        };
      }
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
  },

  async updateGitHubRepository(projectId, repositoryData) {
    try {
      const response = await api.put(`/problems/${projectId}/github-repository`, repositoryData);
      return response.data;
    } catch (error) {
      console.error('Update GitHub repository error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update GitHub repository');
    }
  },

  async getGitHubRepository(projectId) {
    try {
      const response = await api.get(`/problems/${projectId}/github-repository`);
      return response.data;
    } catch (error) {
      console.error('Get GitHub repository error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch GitHub repository');
    }
  },

  async lockGitHubRepository(projectId) {
    try {
      const response = await api.put(`/problems/${projectId}/github-repository/lock`);
      return response.data;
    } catch (error) {
      console.error('Lock GitHub repository error:', error);
      throw new Error(error.response?.data?.message || 'Failed to lock GitHub repository');
    }
  },

  async unlockGitHubRepository(projectId) {
    try {
      const response = await api.put(`/problems/${projectId}/github-repository/unlock`);
      return response.data;
    } catch (error) {
      console.error('Unlock GitHub repository error:', error);
      throw new Error(error.response?.data?.message || 'Failed to unlock GitHub repository');
    }
  },

  async endProject(projectId, endData) {
    try {
      const response = await api.put(`/problems/${projectId}/end`, endData);
      return response.data;
    } catch (error) {
      console.error('End project error:', error);
      throw new Error(error.response?.data?.message || 'Failed to end project');
    }
  }
};
