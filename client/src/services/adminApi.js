import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin`;

const http = axios.create({
  baseURL: API_BASE
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  async login(email, password) {
    const { data } = await http.post('/auth/login', { email, password });
    return data;
  },

  async me() {
    const { data } = await http.get('/auth/me');
    return data;
  },

  async updateCompanyProfile(payload) {
    const { data } = await http.put('/auth/company/profile', payload);
    return data;
  },

  async listHackathons() {
    const { data } = await http.get('/hackathons');
    return data;
  },

  async createHackathon(payload) {
    const { data } = await http.post('/hackathons', payload);
    return data;
  },

  async updateHackathon(id, payload) {
    const { data } = await http.put(`/hackathons/${id}`, payload);
    return data;
  },

  async publishHackathon(id) {
    const { data } = await http.post(`/hackathons/${id}/publish`);
    return data;
  },

  async cloneHackathon(id) {
    const { data } = await http.post(`/hackathons/${id}/clone`);
    return data;
  },

  async archiveHackathon(id) {
    const { data } = await http.post(`/hackathons/${id}/archive`);
    return data;
  },

  async deleteHackathon(id) {
    const { data } = await http.delete(`/hackathons/${id}`);
    return data;
  },

  async getRegistrationsAnalytics(hackathonId) {
    const { data } = await http.get(`/analytics/${hackathonId}/registrations`);
    return data;
  },

  async getDemographicsAnalytics(hackathonId) {
    const { data } = await http.get(`/analytics/${hackathonId}/demographics`);
    return data;
  },

  async getSkillsAnalytics(hackathonId) {
    const { data } = await http.get(`/analytics/${hackathonId}/skills`);
    return data;
  },

  async getEngagementAnalytics(hackathonId) {
    const { data } = await http.get(`/analytics/${hackathonId}/engagement`);
    return data;
  },

  async getTalentAnalytics(hackathonId) {
    const { data } = await http.get(`/analytics/${hackathonId}/talent`);
    return data;
  },

  exportParticipantsUrl(hackathonId, format = 'csv') {
    return `${API_BASE}/analytics/${hackathonId}/export?format=${format}`;
  }
};
