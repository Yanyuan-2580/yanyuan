import { get, post, put, del } from '../request';
import type { ApiResponse, KnowledgeArticle, KnowledgeCategory, PageResult } from '@/types';

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
    return get('/articles', { page, pageSize });
  },

  getArticle: (id: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return get(`/articles/${id}`);
  },

  createArticle: (data: CreateArticleData): Promise<ApiResponse<KnowledgeArticle>> => {
    return post('/articles', data);
  },

  updateArticle: (id: number, data: CreateArticleData): Promise<ApiResponse<KnowledgeArticle>> => {
    return put(`/articles/${id}`, data);
  },

  deleteArticle: (id: number): Promise<ApiResponse<void>> => {
    return del(`/articles/${id}`);
  },

  getCategories: (): Promise<ApiResponse<KnowledgeCategory[]>> => {
    return get('/articles/categories');
  },

  createCategory: (data: { name: string; description: string }): Promise<ApiResponse<KnowledgeCategory>> => {
    return post('/articles/categories', data);
  },

  deleteCategory: (id: number): Promise<ApiResponse<void>> => {
    return del(`/articles/categories/${id}`);
  }
};
