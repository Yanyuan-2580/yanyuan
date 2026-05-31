import axios from 'axios';
import type { ApiResponse, KnowledgeArticle, KnowledgeCategory, PageResult } from '@/types';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export interface CreateArticleData {
  title: string;
  content: string;
  summary: string;
  author: string;
  categoryId: number;
  tags: string[];
}

export const knowledgeApi = {
  getArticles: (page: number, pageSize: number): Promise<ApiResponse<PageResult<KnowledgeArticle>>> => {
    return axiosInstance.get('/articles', { params: { page, pageSize } });
  },

  getArticle: (id: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return axiosInstance.get(`/articles/${id}`);
  },

  createArticle: (data: CreateArticleData): Promise<ApiResponse<KnowledgeArticle>> => {
    return axiosInstance.post('/articles', data);
  },

  updateArticle: (id: number, data: CreateArticleData): Promise<ApiResponse<KnowledgeArticle>> => {
    return axiosInstance.put(`/articles/${id}`, data);
  },

  deleteArticle: (id: number): Promise<ApiResponse<void>> => {
    return axiosInstance.delete(`/articles/${id}`);
  },

  getCategories: (): Promise<ApiResponse<KnowledgeCategory[]>> => {
    return axiosInstance.get('/articles/categories');
  },

  createCategory: (data: { name: string; description: string }): Promise<ApiResponse<KnowledgeCategory>> => {
    return axiosInstance.post('/articles/categories', data);
  },

  deleteCategory: (id: number): Promise<ApiResponse<void>> => {
    return axiosInstance.delete(`/articles/categories/${id}`);
  }
};
