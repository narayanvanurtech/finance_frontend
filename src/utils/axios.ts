import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// ---- Internal state for refresh token logic ---- //
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// ---- Add token to request headers ---- //
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Custom type to support `_retry` flag ---- //
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

// ---- Handle 401 errors & refresh logic ---- //
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle backend responses that indicate success despite error messages
    if (response.data && response.data.success === 1 && response.data.message) {
      console.warn('Backend returned success=1 with error message:', response.data.message);
      // Still return the response as successful since success=1
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle the case where backend returns success=1 but axios treats it as an error
    if (error.response?.data && 
        (error.response.data as any).success === 1) {
      console.warn('Backend returned success=1 but axios treated as error:', error.response.data);
      // Convert the error to a successful response
      return Promise.resolve(error.response);
    }

    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    const isAuthError =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout');

    if (!isAuthError) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If another refresh is already happening, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Refresh token timeout'));
        }, 10000); // 10s timeout

        subscribeTokenRefresh((token: string) => {
          clearTimeout(timeout);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // First request to refresh token
    isRefreshing = true;

    try {
      await useAuthStore.getState().refreshTokens();
      const newToken = useAuthStore.getState().token;
      onRefreshed(newToken || '');
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // If refresh fails, log user out
      await useAuthStore.getState().logoutUser();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
