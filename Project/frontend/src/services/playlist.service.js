import api from './api';

export const playlistService = {
  // Create playlist
  createPlaylist: async (name, description) => {
    return await api.post('/playlists', { name, description });
  },

  // Get user playlists
  getUserPlaylists: async (userId) => {
    return await api.get(`/playlists/user/${userId}`);
  },

  // Get playlist by ID
  getPlaylist: async (playlistId) => {
    return await api.get(`/playlists/${playlistId}`);
  },

  // Update playlist
  updatePlaylist: async (playlistId, data) => {
    return await api.patch(`/playlists/${playlistId}`, data);
  },

  // Delete playlist
  deletePlaylist: async (playlistId) => {
    return await api.delete(`/playlists/${playlistId}`);
  },

  // Add video to playlist
  addVideoToPlaylist: async (playlistId, videoId) => {
    return await api.patch(`/playlists/add/${playlistId}/${videoId}`);
  },

  // Remove video from playlist
  removeVideoFromPlaylist: async (playlistId, videoId) => {
    return await api.patch(`/playlists/remove/${playlistId}/${videoId}`);
  },
};

export default playlistService;
