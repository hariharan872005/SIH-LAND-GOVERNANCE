import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const persona = localStorage.getItem('DEV_PERSONA') || 'SUPER_ADMIN';
  config.headers['x-dev-persona'] = persona;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Call Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
