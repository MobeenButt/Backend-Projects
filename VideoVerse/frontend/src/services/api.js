import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Token store (in-memory + localStorage) ────────────────────────────────────
// We use a module-level variable as the primary source of truth so the token
// is available synchronously in the request interceptor without a store lookup.
// localStorage is used only for persistence across page refreshes.

let _accessToken  = localStorage.getItem('accessToken')  || null;
let _refreshToken = localStorage.getItem('refreshToken') || null;

export const tokenStore = {
  getAccess:    ()  => _accessToken,
  getRefresh:   ()  => _refreshToken,
  setTokens: (access, refresh) => {
    _accessToken  = access  ?? _accessToken;
    _refreshToken = refresh ?? _refreshToken;
    if (access)  localStorage.setItem('accessToken',  access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },
  clear: () => {
    _accessToken  = null;
    _refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// ── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true, // still send cookies when browser allows them
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Attach access token as Authorization header on every request.
    // This works regardless of whether the browser allows 3rd-party cookies.
    const token = tokenStore.getAccess();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // For file uploads let the browser set Content-Type with the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Convert http:// media URLs to https:// (legacy Cloudinary records)
const toHttps = (value) => {
  if (typeof value === 'string')        return value.replace(/^http:\/\//i, 'https://');
  if (Array.isArray(value))             return value.map(toHttps);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = toHttps(value[k]);
    return out;
  }
  return value;
};

const buildError = (axiosError) =>
  new Error(
    axiosError.response?.data?.message ||
    axiosError.message ||
    'An error occurred'
  );

// ── Response interceptor ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue  = [];   // requests that arrived while refresh was in flight

const processQueue = (err) => {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url} → ${response.status}`);
    }
    // Unwrap ApiResponse { statusCode, data, message, success }
    // and normalise all http:// URLs to https://
    return toHttps(response.data);
  },

  async (error) => {
    const originalRequest = error.config;

    if (import.meta.env.DEV) {
      console.error(
        `❌ ${originalRequest?.url} → ${error.response?.status}`,
        error.response?.data?.message || error.message
      );
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error — server unreachable'));
    }

    const status = error.response.status;

    // ── 401: try to refresh the access token, then retry ──────────────────
    if (status === 401 && !originalRequest._retry) {

      // Never attempt refresh for auth endpoints
      const isAuthEndpoint = [
        '/users/login',
        '/users/register',
        '/users/refresh-token',
      ].some((p) => originalRequest.url?.includes(p));

      if (isAuthEndpoint) return Promise.reject(buildError(error));

      // If we have no refresh token at all, don't bother
      const rt = tokenStore.getRefresh();
      if (!rt) return Promise.reject(buildError(error));

      // Queue concurrent 401s while a refresh is already in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        )
          .then(() => api(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refreshToken both as cookie (if available) AND in body
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          { refreshToken: rt },           // body fallback for cookie-blocked browsers
          { withCredentials: true }
        );

        // Backend returns { data: { accessToken, refreshToken } }
        const newAccess  = refreshResponse.data?.data?.accessToken;
        const newRefresh = refreshResponse.data?.data?.refreshToken;

        if (newAccess) {
          tokenStore.setTokens(newAccess, newRefresh);
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        }

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        tokenStore.clear();
        return Promise.reject(buildError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(buildError(error));
  }
);

// ── FormData helper ───────────────────────────────────────────────────────────

export const buildFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value == null) return;
    if (value instanceof File)     fd.append(key, value);
    else if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
    else                           fd.append(key, value);
  });
  return fd;
};

export default api;
