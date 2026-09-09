import api from './api';

export const channelService = {
  // GET /users/c/:username  — public channel profile
  getUserProfile: async (username) => {
    return await api.get(`/users/c/${username}`);
  },

  // Subscriptions
  subscribe: async (channelId) => {
    return await api.post(`/subscriptions/c/${channelId}`);
  },
  getSubscribers: async (channelId) => {
    return await api.get(`/subscriptions/c/${channelId}`);
  },
  getSubscriptions: async (userId) => {
    return await api.get(`/subscriptions/u/${userId}`);
  },

  // Dashboard / Analytics
  getChannelStats: async () => {
    return await api.get('/dashboard/stats');
  },
  getChannelVideos: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await api.get(`/dashboard/videos${qs ? `?${qs}` : ''}`);
  },
  getSubscriberAnalytics: async (period = 'month') => {
    return await api.get(`/dashboard/subscribers/analytics?period=${period}`);
  },
  getVideoAnalytics: async () => {
    return await api.get('/dashboard/videos/analytics');
  },

  // Watch history  (now lives under /users/history per the updated routes)
  getWatchHistory: async () => {
    return await api.get('/users/history');
  },
  clearWatchHistory: async () => {
    return await api.delete('/dashboard/history');
  },
};

export default channelService;
