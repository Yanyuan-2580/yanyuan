import axios, { type InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export const getPublic = <T = any>(url: string, params?: Record<string, any>): Promise<T> =>
  axiosInstance.get(url, { params });

export const postPublic = <T = any>(url: string, data?: Record<string, any>): Promise<T> =>
  axiosInstance.post(url, data);

export const putPublic = <T = any>(url: string, data?: Record<string, any>): Promise<T> =>
  axiosInstance.put(url, data);

export const delPublic = <T = any>(url: string): Promise<T> =>
  axiosInstance.delete(url);
