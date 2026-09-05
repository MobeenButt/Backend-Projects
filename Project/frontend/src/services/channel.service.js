import api from './api';

export const channelService = {
  subscribe: async (channelId) => {
    return await api.post(`/subscriptions/c/${channelId}`);
  },

  getSubscribers: async (channelId) => {
    return await api.get(`/subscriptions/c/${channelId}`);
  },

  getSubscriptions: async (userId) => {
    return await api.get(`/subscriptions/u/${userId}`);
  },

  getChannelStats: async () => {
    return await api.get('/dashboard/stats');
  },

  getChannelVideos: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/dashboard/videos${queryString ? `?${queryString}` : ''}`);
  },

  getSubscriberAnalytics: async (period = 'month') => {
    return await api.get(`/dashboard/subscribers/analytics?period=${period}`);
  },

  getVideoAnalytics: async () => {
    return await api.get('/dashboard/videos/analytics');
  },

  getWatchHistory: async () => {
    return await api.get('/dashboard/history');
  },

  clearWatchHistory: async () => {
    return await api.delete('/dashboard/history');
  },
};
