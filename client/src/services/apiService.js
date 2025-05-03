import axios from 'axios';
import { store } from '../redux/store';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Always get the token from localStorage to ensure it's available after login and reloads
    const token = localStorage.getItem('hrms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle specific error cases
    if (response && response.status === 401) {
      // Unauthorized - could trigger logout here if needed
      console.error('Authentication error:', response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;