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

export default apiClient;