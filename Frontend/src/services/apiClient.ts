import axios from 'axios';

// Environment variable for backend connection: VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach JWT bearer token & active persona header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('land_gov_auth_token');
    const activePersona = localStorage.getItem('bhu_active_persona') || 'SUPER_ADMIN';
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (activePersona && config.headers && !config.headers['x-dev-persona']) {
      config.headers['x-dev-persona'] = activePersona;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session timeouts / unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized request');
    }
    return Promise.reject(error);
  }
);

// Helper to simulate realistic API latency for mock fallback
export const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));
