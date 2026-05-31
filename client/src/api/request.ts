import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getToast } from '@/composables/useToast';

const toast = getToast();

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshResponse = await instance.post('/users/refresh-token');
        if (refreshResponse.code === 200) {
          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return instance(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        toast.warning('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 统一错误提示
    const data = error.response?.data;
    const status = error.response?.status;

    if (status === 403) {
      toast.error(data?.message || '权限不足，无法执行此操作');
    } else if (status === 404) {
      toast.error(data?.message || '请求的资源不存在');
    } else if (status === 429) {
      toast.warning('操作过于频繁，请稍后再试');
    } else if (status === 500) {
      toast.error('服务器异常，请稍后再试');
    } else if (status === 0 || !status) {
      // 网络错误
      toast.error('网络连接失败，请检查网络');
    } else if (data?.message) {
      toast.error(data.message);
    }

    return Promise.reject(data || error);
  }
);

export const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config);
};

export const get = <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
  return instance.get(url, { params });
};

export const post = <T = any>(url: string, data?: Record<string, any>): Promise<T> => {
  return instance.post(url, data);
};

export const put = <T = any>(url: string, data?: Record<string, any>): Promise<T> => {
  return instance.put(url, data);
};

export const del = <T = any>(url: string): Promise<T> => {
  return instance.delete(url);
};

export default instance;
