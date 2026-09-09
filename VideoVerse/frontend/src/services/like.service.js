import api from './api';

export const likeService = {
  // Toggle video like
  toggleVideoLike: async (videoId) => {
    return await api.post(`/likes/toggle/v/${videoId}`);
  },

  // Toggle comment like
  toggleCommentLike: async (commentId) => {
    return await api.post(`/likes/toggle/c/${commentId}`);
  },

  // Toggle tweet like
  toggleTweetLike: async (tweetId) => {
    return await api.post(`/likes/toggle/t/${tweetId}`);
  },

  // Get liked videos
  getLikedVideos: async () => {
    return await api.get('/likes/videos');
  },
};

export default likeService;
