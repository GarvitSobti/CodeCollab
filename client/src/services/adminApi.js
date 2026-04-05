import axios from 'axios';
import { getApiOrigin } from '../utils/runtimeConfig';

const API_BASE = `${getApiOrigin()}/api/admin`;

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

  async uploadSponsorLogo(file) {
    const toBase64 = (selectedFile) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const data = result.includes(',') ? result.split(',')[1] : result;
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });

    const base64Data = await toBase64(file);
    const { data } = await http.post('/hackathons/upload/sponsor-logo', {
      fileName: file?.name,
      mimeType: file?.type,
      base64Data
    });
    return data;
  },

  async getAuditLogs() {
    const { data } = await http.get('/analytics/audit/logs');
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

  async getRegistrationsAnalytics(hackathonId, filters = {}) {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    const { data } = await http.get(`/analytics/${hackathonId}/registrations`, { params });
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
