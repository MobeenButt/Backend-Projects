import api from '../utils/api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/update-account', data);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  changePassword: async (data) => {
    return await api.post('/users/change-password', data);
  },
};
