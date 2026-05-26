import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
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
