import api, { buildFormData, tokenStore } from './api';

// Persist user profile to localStorage so loadUser() can skip the server
// call for unauthenticated visitors.
const persistUser = (user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else      localStorage.removeItem('user');
};

export const authService = {

  register: async (userData) => {
    const formData =
      userData instanceof FormData ? userData : buildFormData(userData);

    const response = await api.post('/users/register', formData);

    // Backend now returns { user, accessToken, refreshToken } in data
    const { user, accessToken, refreshToken } = response.data ?? response;

    // Save tokens so every subsequent request includes Authorization header
    tokenStore.setTokens(accessToken, refreshToken);
    persistUser(user);

    // Normalise response.data so useAuthStore can read .data.user
    response.data = { user };
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);

    const { user, accessToken, refreshToken } = response.data ?? response;

    tokenStore.setTokens(accessToken, refreshToken);
    persistUser(user);

    response.data = { user };
    return response;
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } finally {
      tokenStore.clear();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current-user');
    const user = response.data ?? response;
    persistUser(user);
    // Wrap in { data: user } so useAuthStore reads response.data correctly
    return { data: user };
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/update-account', data);
    const user = response.data ?? response;
    persistUser(user);
    return { data: user };
  },

  changePassword: async (data) => {
    return await api.post('/users/change-password', data);
  },
};

export default authService;
