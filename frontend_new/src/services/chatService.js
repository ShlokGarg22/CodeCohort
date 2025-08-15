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

export const chatService = {
  async getMessages(projectId, { limit = 'all', before } = {}) {
    const params = { limit };
    if (before) params.before = before;
    const res = await api.get(`/chat/${projectId}/messages`, { params });
    // Handle shapes: { success, data: [...] } or { success, data: { messages: [...] } } or { messages: [...] }
    const payload = res.data?.data ?? res.data;
    const messages = Array.isArray(payload)
      ? payload
      : (payload?.messages || []);
    return Array.isArray(messages) ? messages : [];
  },

  async sendMessage(projectId, content, mentions = []) {
    const res = await api.post(`/chat/${projectId}/messages`, { content, mentions });
    return res.data?.data ?? res.data;
  },

  async editMessage(projectId, messageId, content) {
    const res = await api.put(`/chat/${projectId}/messages/${messageId}`, { content });
    return res.data?.data ?? res.data;
  },

  async deleteMessage(projectId, messageId) {
    const res = await api.delete(`/chat/${projectId}/messages/${messageId}`);
    return res.data?.data ?? res.data;
  },
};

export default chatService;
