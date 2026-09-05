import api from './api';

export const commentService = {
  // Get comments for a video
  getVideoComments: async (videoId, page = 1, limit = 10) => {
    return await api.get(`/comments/${videoId}?page=${page}&limit=${limit}`);
  },

  // Add comment to video
  addComment: async (videoId, content) => {
    return await api.post(`/comments/${videoId}`, { content });
  },

  // Update comment
  updateComment: async (commentId, content) => {
    return await api.patch(`/comments/c/${commentId}`, { content });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return await api.delete(`/comments/c/${commentId}`);
  },
};

export default commentService;
