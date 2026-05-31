import { get, post, put, del } from '../request';
import type { ApiResponse, KnowledgeArticle, KnowledgeCategory, PageResult } from '@/types';

export interface CreateArticleData {
  title: string;
  content: string;
  coverUrl?: string;
  categoryId: number;
  tags?: string[];
  authorId?: number;
}

export const knowledgeApi = {
  getArticles: (page: number, pageSize: number, status?: number, keyword?: string): Promise<ApiResponse<PageResult<KnowledgeArticle>>> => {
    return get('/articles', { page, pageSize, status, keyword });
  },

  getArticle: (id: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return get(`/articles/${id}`);
  },

  createArticle: (data: CreateArticleData): Promise<ApiResponse<KnowledgeArticle>> => {
    return post('/articles', data);
  },

  updateArticle: (id: number, data: Partial<CreateArticleData>): Promise<ApiResponse<KnowledgeArticle>> => {
    return put(`/articles/${id}`, data);
  },

  deleteArticle: (id: number): Promise<ApiResponse<void>> => {
    return del(`/articles/${id}`);
  },

  updateArticleStatus: (id: number, status: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return put(`/articles/${id}/status`, { status });
  },

  publishArticle: (id: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return put(`/articles/${id}/publish`);
  },

  getCategories: (): Promise<ApiResponse<KnowledgeCategory[]>> => {
    return get('/categories');
  },

  createCategory: (data: { name: string; description?: string }): Promise<ApiResponse<KnowledgeCategory>> => {
    return post('/categories', data);
  },

  updateCategory: (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<KnowledgeCategory>> => {
    return put(`/categories/${id}`, data);
  },

  deleteCategory: (id: number): Promise<ApiResponse<void>> => {
    return del(`/categories/${id}`);
  }
};
