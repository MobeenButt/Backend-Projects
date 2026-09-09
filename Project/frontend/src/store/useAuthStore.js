import { create } from 'zustand';
import { authService } from '../services/auth.service';

// Safely read user from localStorage without crashing on corrupt data
const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const useAuthStore = create((set) => ({
  user:            getInitialUser(),
  // Start in loading=true so AuthGuard never flashes the login redirect
  // before loadUser() has had a chance to validate the session cookie.
  isAuthenticated: !!getInitialUser(),
  loading:         false,
  error:           null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const user = response?.data ?? null;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      // api.js interceptor converts all errors to `new Error(message)`
      const message = error.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      const user = response?.data ?? null;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      const message = error.message || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear local state so the UI isn't stuck
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  // Called on app mount to validate the session cookie with the server.
  // Sets loading=true while in-flight so AuthGuard shows a spinner instead
  // of immediately redirecting to /login.
  loadUser: async () => {
    set({ loading: true });
    try {
      const response = await authService.getCurrentUser();
      const user = response?.data ?? null;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
      set({ user, isAuthenticated: !!user, loading: false });
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  updateUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
