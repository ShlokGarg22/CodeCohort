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

export const taskService = {
  async createTask(projectId, taskData) {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Create task error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  },

  async getProjectTasks(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Get project tasks error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Update task error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  },

  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Delete task error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  },

  async reorderTasks(projectId, tasks) {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/reorder`, { tasks });
      return response.data;
    } catch (error) {
      console.error('Reorder tasks error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reorder tasks');
    }
  }
};
