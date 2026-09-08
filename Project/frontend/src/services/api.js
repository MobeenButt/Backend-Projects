import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL for cross-origin cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API calls in development
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    // For file uploads, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    
    // Backend wraps responses in ApiResponse { statusCode, data, message, success }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error: Unable to reach server');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for auth endpoints
      const isAuthEndpoint = ['/users/login', '/users/register', '/users/refresh-token']
        .some((path) => originalRequest.url?.includes(path));

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Check if user session exists
      if (!localStorage.getItem('user')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt token refresh
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.data?.accessToken) {
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear local state
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        console.error('🔒 Session expired. Please login again.');
      }
    }

    // Return structured error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper to build FormData from plain object
export const buildFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value == null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

export default api;