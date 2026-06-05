import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1/admin',
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
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const get = <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
  return axiosInstance.get(url, { params });
};

export const post = <T = any>(url: string, data?: Record<string, any>): Promise<T> => {
  return axiosInstance.post(url, data);
};

export const put = <T = any>(url: string, data?: Record<string, any>): Promise<T> => {
  return axiosInstance.put(url, data);
};

export const del = <T = any>(url: string): Promise<T> => {
  return axiosInstance.delete(url);
};
