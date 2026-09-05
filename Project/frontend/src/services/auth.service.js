import api, { buildFormData } from './api';

// The backend returns ApiResponse { statusCode, data, message, success }
// After the interceptor, `response` is that ApiResponse object, so the
// actual payload lives at `response.data`.

const persistSession = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const authService = {
  register: async (userData) => {
    // Build multipart payload (includes avatar file + refreshToken array as JSON)
    const formData =
      userData instanceof FormData ? userData : buildFormData(userData);
    const response = await api.post('/users/register', formData);
    persistSession(response.data);
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    persistSession(response.data);
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
    const response = await api.get('/users/current-user');
    persistSession(response.data);
    return response;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/update-account', data);
    persistSession(response.data);
    return response;
  },

  changePassword: async (data) => {
    return await api.post('/users/change-password', data);
  },
};

export default authService;
