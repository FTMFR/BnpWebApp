import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from './types';
import { endpoints } from './endpoints';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useSessionModalStore } from '@/stores/sessionModal';
import { usePermissionsStore } from '@/stores/permission';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : '/api');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
    const authStore = useAuthStore();
    if (authStore.Token) {
      config.headers.Authorization = `Bearer ${authStore.Token}`;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Accept'] = 'application/json';

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

    if (!error.response && error.request) {
      console.error('CORS Error or Network Error:', error.message);
      const toastStore = useToastStore();
      toastStore.showToast('ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error', 5000);
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const toastStore = useToastStore();
      let shouldShowToast = false;
      let toastMessage = '';

      // Login failed (wrong username/password): show API message and reject (401 or 400)
      if ((status === 401 || status === 400) && originalRequest?.url?.includes('/Auth/login')) {
        const loginErrorMessage = data?.message || data?.error || 'خطایی در ورود به سیستم رخ داده است';
        toastStore.showToast(loginErrorMessage, 'error', 5000);
        return Promise.reject(error);
      }

      // Token invalidated by password change: clear locally and redirect without calling refresh/logout (they would 401)
      if (status === 401 && typeof sessionStorage !== 'undefined') {
        const authStore = useAuthStore();
        const permissionStore = usePermissionsStore();
        const sessionModalStore = useSessionModalStore();
        authStore.clear();
        permissionStore.clearPermissions();
        sessionModalStore.closeModal();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (status === 401 && originalRequest && originalRequest.url?.includes('/Auth/refresh')) {
        const errorMessage = data?.message || '';
        const isRefreshTokenNotFound =
          errorMessage.includes('یافت نشد') || errorMessage.includes('Refresh Token');

        if (isRefreshTokenNotFound) {
          return Promise.reject(error);
        }

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
        const isLoginRequest = originalRequest.url?.includes('/Auth/login');


        if (isLoginRequest) {
          const loginErrorMessage = data?.message || data?.error || 'خطایی در ورود به سیستم رخ داده است';
          toastStore.showToast(loginErrorMessage, 'error', 5000);
          return Promise.reject(error);
        } else {
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
          } catch (refreshErr: unknown) {
            const refreshError = refreshErr as AxiosError<ApiError>;
            const errorMessage = refreshError.response?.data?.message || '';
            const isRefreshTokenNotFound = errorMessage.includes('یافت نشد') ||
              errorMessage.includes('Refresh Token');

            if (isRefreshTokenNotFound) {
              processQueue(refreshError);
              return Promise.reject(refreshError);
            }

            processQueue(refreshError);
            const authStore = useAuthStore();

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
      }

      if (status === 401) {
        const isLoginRequest = originalRequest?.url?.includes('/Auth/login');
        const isRefreshRequest = originalRequest?.url?.includes('/Auth/refresh');
        const isLogoutRequest = originalRequest?.url?.includes('/Auth/logout');
        if (!isLoginRequest && !isRefreshRequest && !isLogoutRequest && window.location.pathname !== '/login') {
          const authStore = useAuthStore();
          try {
            await apiClient.post(endpoints.auth.logout);
          } catch (logoutError) {
            // Logout often returns 401 when token is already invalid; we still clear and redirect
            console.error('Logout API error:', logoutError);
          }
          authStore.clear();
          toastStore.showToast('نشست منقضی شده است. لطفاً دوباره وارد شوید.', 'error', 5000);
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      if (status === 403) {
        if (data?.denialCode === 'TooManySessions') {
          const authStore = useAuthStore();
          const isSessionCheckRequest = originalRequest?.url?.includes('/Session/MySessions');

          // If this is a session check request after successful login
          if (isSessionCheckRequest && authStore.Token) {
            // DO NOT reject — instead, open the modal
            const sessionModalStore = useSessionModalStore();

            if (!sessionModalStore.isModalShown) {
              await sessionModalStore.openModal(); // This will show the modal
            }
            // Return a rejected promise so the calling code knows something failed
            return Promise.reject(error);
          }

          // For other cases (e.g., other API calls), show toast
          const errorMessage = data?.message || 'تعداد نشست‌های همزمان به حداکثر رسیده است';
          toastStore.showToast(errorMessage, 'error', 7000);
          return Promise.reject(error);
        }

        const isUserRequest = originalRequest?.url?.includes('/Users/');
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/register', '/forgot-password'];
        const isAuthPage = authPages.some(page => currentPath.startsWith(page));

        if (isUserRequest && !isAuthPage) {
          // Check if modal is already shown to prevent duplicate modals
          const sessionModalStore = useSessionModalStore();

          if (!sessionModalStore.isModalShown) {
            // Open modal and fetch sessions instead of logging out
            await sessionModalStore.openModal();
            // Don't logout or redirect - user can continue with current token
            return Promise.reject(error);
          }

          // If modal is already shown, just reject the error
          return Promise.reject(error);
        }

        if (!isAuthPage) {
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
        } else {
          shouldShowToast = true;
          toastMessage = data?.message || data?.error || 'دسترسی غیرمجاز';
        }
      } else {
        const isRefreshTokenError = status === 401 && originalRequest?.url?.includes('/Auth/refresh');
        const isLoginRequest = status === 401 && originalRequest?.url?.includes('/Auth/login');

        if (!isRefreshTokenError && !isLoginRequest && (data?.message || data?.error)) {
          shouldShowToast = true;
          toastMessage = data?.message || data?.error || 'خطایی رخ داده است';
        }
      }

      if (shouldShowToast && toastMessage) {
        toastStore.showToast(toastMessage, 'error', 5000);
      }

      if (status >= 500) {
        console.error('Server error:', data?.message || 'Internal server error');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

