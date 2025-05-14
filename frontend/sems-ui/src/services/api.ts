import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// If environment variable is not set, default to localhost gateway service
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

console.log('API configured with base URL:', BASE_URL);

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout for better reliability
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Always log request details for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data || {},
      params: config.params || {}
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response scenarios
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Always log response for debugging
    console.log(`API Response (${response.status}):`, response.data);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Log detailed error info
      console.error(`API Error ${error.response.status}:`, {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        headers: error.config?.headers
      });
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.warn('Authentication error - redirecting to login');
        // Remove token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Only redirect if we're not already on the login page to prevent infinite loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Handle forbidden errors (403)
      if (error.response.status === 403) {
        console.error('Permission denied error');
        // Could redirect to a permission denied page here
      }
      
      // Handle server errors (500)
      if (error.response.status >= 500) {
        console.error('Server error occurred:', error.response.data);
        // Could show a server error notification here
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error - No response received:', {
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 