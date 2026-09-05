import api from './api';

export const subscriptionService = {
  // Toggle subscription to a channel
  toggleSubscription: async (channelId) => {
    return await api.post(`/subscriptions/c/${channelId}`);
  },

  // Get channel subscribers
  getChannelSubscribers: async (channelId) => {
    return await api.get(`/subscriptions/c/${channelId}`);
  },

  // Get subscribed channels
  getSubscribedChannels: async (userId) => {
    return await api.get(`/subscriptions/u/${userId}`);
  },
};

export default subscriptionService;
