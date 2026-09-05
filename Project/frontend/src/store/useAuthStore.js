import { create } from 'zustand';
import { authService } from '../services/auth.service';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const user = response.data || null;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      const user = response.data || null;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
    } catch (error) {
      // even if the API call fails, clear local state
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  loadUser: async () => {
    // Restore / validate session with the server
    set({ loading: true });
    try {
      const response = await authService.getCurrentUser();
      const user = response.data || null;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: !!user, loading: false });
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
