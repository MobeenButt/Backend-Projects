import api from './api';

export const tweetService = {
  // Create tweet
  createTweet: async (content) => {
    return await api.post('/tweets', { content });
  },

  // Get user tweets
  getUserTweets: async (userId, page = 1, limit = 10) => {
    return await api.get(`/tweets/user/${userId}?page=${page}&limit=${limit}`);
  },

  // Update tweet
  updateTweet: async (tweetId, content) => {
    return await api.patch(`/tweets/${tweetId}`, { content });
  },

  // Delete tweet
  deleteTweet: async (tweetId) => {
    return await api.delete(`/tweets/${tweetId}`);
  },
};

export default tweetService;
