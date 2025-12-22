import axios from 'axios';
import { getToken, verifySessionWithBackend, clearSessionData } from './sessionStorage';
import { apiTracker } from './performanceMonitor';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br', // Enable compression
  },
  // Performance optimizations
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  decompress: true, // Auto decompress responses
});

// Request interceptor to add auth token and track performance
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Add performance tracking
    config.metadata = { startTime: Date.now() };
    
    // Only add Authorization header if token exists and is not null/undefined
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Allow login/health endpoints without token
      if (config.url.includes('/login') || 
          config.url.includes('/health') || 
          config.url.includes('/register')) {
        return config;
      }
      
      // For other endpoints, warn but still send request
      // The backend will respond with 401/403 which the response interceptor will handle
      console.warn('⚠️ No valid token available for request:', config.url);
    }
    
    // CRITICAL: Remove Content-Type header for FormData requests
    // Let the browser set it automatically with the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📤 FormData detected - removing Content-Type header to allow multipart/form-data');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and performance tracking
axiosInstance.interceptors.response.use(
  (response) => {
    // Track API performance
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      apiTracker.track(
        response.config.url,
        response.config.method.toUpperCase(),
        duration,
        response.status
      );
      
      // Log slow requests in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`⚠️ Slow API call: ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`);
      }
    }
    
    return response;
  },
  async (error) => {
    // Track failed API calls
    if (error.config && error.config.metadata) {
      const duration = Date.now() - error.config.metadata.startTime;
      apiTracker.track(
        error.config.url,
        error.config.method.toUpperCase(),
        duration,
        error.response?.status || 'ERROR'
      );
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🔒 Authentication error:', error.response.status);
      
      // Check if token is invalid or expired
      const token = getToken();
      if (token && token !== 'null' && token !== 'undefined') {
        // Token exists but is invalid - verify with backend
        const isValid = await verifySessionWithBackend();
        
        if (!isValid) {
          console.error('❌ Token verification failed - clearing session and redirecting to login');
          clearSessionData();
          
          // Only redirect if we're not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?session=expired';
          }
        }
      } else {
        // No token - redirect to login
        console.error('❌ No token found - redirecting to login');
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout:', error.config.url);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check your internet connection');
    }
    
    return Promise.reject(error);
  }
);

// Export enhanced instance
export default axiosInstance;

// Export utility functions for manual performance tracking
export const trackAPICall = (endpoint, method, duration, status) => {
  apiTracker.track(endpoint, method, duration, status);
};

export const getAPIStats = () => {
  return apiTracker.getStats();
};

export const getAPICalls = () => {
  return apiTracker.getCalls();
};

export const clearAPITracking = () => {
  apiTracker.clear();
};
