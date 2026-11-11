import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:')) {
    return 'https://popydev.com/auto-movil/api/v1';
  }
  return import.meta.env.PROD ? '/auto-movil/api/v1' : '/api/v1';
};

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 10000,
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Normalizar errores
    const normalizedError = {
      message: error.response?.data?.message || 'Error de conexión con el servidor LAN.',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(normalizedError);
  }
);
