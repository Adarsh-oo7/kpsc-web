import axios from 'axios';

// Create a new axios instance with a predefined configuration
const apiClient = axios.create({
  // The baseURL ensures every request starts with http://<your-backend>/api
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// Use an "interceptor" to automatically add the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Only try to add the token if it's not a public, un-authenticated request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and automatic refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            // Obtain a new access token using the refresh token
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/token/refresh/`,
              { refresh: refreshToken }
            );
            
            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Retry the original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Clear expired session data
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;