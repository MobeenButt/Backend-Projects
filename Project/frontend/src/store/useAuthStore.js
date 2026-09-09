import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { tokenStore } from '../services/api';

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
  isAuthenticated: !!getInitialUser() && !!tokenStore.getAccess(),
  loading:         false,
  error:           null,

  // ── Login ───────────────────────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const user = response?.data?.user ?? response?.data ?? null;
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Login failed', loading: false });
      throw error;
    }
  },

  // ── Register ────────────────────────────────────────────────────────────
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      const user = response?.data?.user ?? response?.data ?? null;
      set({ user, isAuthenticated: !!user, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Registration failed', loading: false });
      throw error;
    }
  },

  // ── Logout ──────────────────────────────────────────────────────────────
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
    } catch {
      // Always clear local state even if server call fails
    } finally {
      tokenStore.clear();
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  // ── Load user on app mount ───────────────────────────────────────────────
  // Only validates the token with the server if we have BOTH a local user
  // record AND an access token. Unauthenticated visitors are ignored entirely
  // — no server call, no console errors, no redirect flash.
  loadUser: async () => {
    const hasLocal  = !!localStorage.getItem('user');
    const hasToken  = !!tokenStore.getAccess();

    if (!hasLocal || !hasToken) {
      // No session to validate
      if (hasLocal && !hasToken) {
        // Stale local record with no token — clean up
        localStorage.removeItem('user');
      }
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await authService.getCurrentUser();
      const user = response?.data ?? null;
      set({ user, isAuthenticated: !!user, loading: false });
    } catch {
      // Token was rejected (expired, rotated secret, etc.)
      tokenStore.clear();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  // ── Update user in store + localStorage ─────────────────────────────────
  updateUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else      localStorage.removeItem('user');
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
