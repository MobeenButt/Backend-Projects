import api from './api';

export const dashboardService = {
  // Get channel statistics
  getChannelStats: async () => {
    return await api.get('/dashboard/stats');
  },

  // Get channel videos
  getChannelVideos: async (page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc') => {
    return await api.get(`/dashboard/videos?page=${page}&limit=${limit}&sortBy=${sortBy}&sortType=${sortType}`);
  },
};

export default dashboardService;
