import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from './types';
import { endpoints } from './endpoints';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : '/api');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from store
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig &
    { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;

      // اگر درخواست refresh خودش 401 گرفت، logout و redirect
      if (status === 401 && originalRequest && originalRequest.url?.includes('/Auth/refresh')) {
        console.log('Refresh token expired (401), logging out...');
        const authStore = useAuthStore();
        try {
          await apiClient.post(endpoints.auth.logout);
        } catch (logoutError) {
          console.error('Logout API error:', logoutError);
        }
        authStore.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient.request(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await apiClient.post(endpoints.auth.refresh);
          processQueue(null);
          return apiClient.request(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          const authStore = useAuthStore();

          // اگر refresh token هم 401 گرفت، clear و redirect به login
          // (logout قبلاً در interceptor انجام شده)
          if (refreshError instanceof AxiosError && refreshError.response?.status === 401) {
            await apiClient.post(endpoints.auth.logout);
            authStore.clear();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }

          authStore.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // شرط 403 جنرال (به جز متد refresh) - کامنت شده برای بعد
      // if (status === 403 && originalRequest && !originalRequest.url?.includes('/Auth/refresh')) {
      //   const authStore = useAuthStore();
      //   try {
      //     await apiClient.post(endpoints.auth.logout);
      //   } catch (logoutError) {
      //     console.error('Logout API error:', logoutError);
      //   }
      //   authStore.clear();
      //   if (window.location.pathname !== '/login') {
      //     window.location.href = '/login';
      //   }
      //   return Promise.reject(error);
      // }

      if (status === 403) {
        const authStore = useAuthStore();
        try {
          await apiClient.post(endpoints.auth.logout);
        } catch (logoutError) {
          console.error('Logout API error:', logoutError);
        }
        authStore.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (status >= 500) {
        console.error('Server error:', data?.message || 'Internal server error');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

