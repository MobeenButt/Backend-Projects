import api from '../utils/api';

export const videoService = {
  getAllVideos: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/videos${queryString ? `?${queryString}` : ''}`);
  },

  getVideoById: async (videoId) => {
    return await api.get(`/videos/${videoId}`);
  },

  uploadVideo: async (formData) => {
    return await api.upload('/videos', formData);
  },

  updateVideo: async (videoId, data) => {
    return await api.patch(`/videos/${videoId}`, data);
  },

  deleteVideo: async (videoId) => {
    return await api.delete(`/videos/${videoId}`);
  },

  togglePublish: async (videoId) => {
    return await api.patch(`/videos/${videoId}/toggle-publish`);
  },

  incrementViews: async (videoId) => {
    return await api.post(`/videos/${videoId}/views`);
  },

  likeVideo: async (videoId) => {
    return await api.post(`/likes/toggle/v/${videoId}`);
  },

  getComments: async (videoId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/comments/${videoId}${queryString ? `?${queryString}` : ''}`);
  },

  addComment: async (videoId, content) => {
    return await api.post(`/comments/${videoId}`, { content });
  },

  updateComment: async (commentId, content) => {
    return await api.patch(`/comments/c/${commentId}`, { content });
  },

  deleteComment: async (commentId) => {
    return await api.delete(`/comments/c/${commentId}`);
  },

  likeComment: async (commentId) => {
    return await api.post(`/likes/toggle/c/${commentId}`);
  },
};
