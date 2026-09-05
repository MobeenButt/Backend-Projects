import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The backend wraps every response in ApiResponse { statusCode, data, message, success }.
// This helper unwraps the axios response to return the full ApiResponse object,
// so callers can read .data for the payload and .message for toasts.
const unwrap = (response) => response.data;

// Builds a multipart FormData payload from a plain object.
// Array values are appended as JSON strings (e.g. refreshToken array in register).
export const buildFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // For file uploads, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap + handle token refresh
api.interceptors.response.use(
  (response) => unwrap(response),
  async (error) => {
    const originalRequest = error.config;

    if (!error.response && !originalRequest._retry) {
      // Network-level failure (server unreachable) - pass through
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = ['/users/login', '/users/register', '/users/refresh-token']
        .some((path) => originalRequest.url?.includes(path));

      // Never try to refresh for auth endpoints - reject with the real error
      // (e.g. "Invalid password") so callers show an accurate message.
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Only attempt refresh if we believe a session exists.
      // httpOnly cookies can't be read from JS, so use the mirrored user record.
      if (!localStorage.getItem('user')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Refresh uses a bare axios call (not the instance) to avoid loops
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.data?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - session is gone. Clean up local state and reject
        // with the ORIGINAL error. Never hard-redirect here: AuthGuard handles
        // navigation for protected routes (redirecting from the interceptor
        // caused an infinite reload loop).
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
