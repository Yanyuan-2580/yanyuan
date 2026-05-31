import { post, get } from '../request';
import type { ApiResponse, KnowledgeArticle, KnowledgeCategory, PageResult } from '@/types';

export interface LikeResponse {
  liked: boolean;
  count: number;
}

export interface CollectResponse {
  collected: boolean;
  count: number;
}

export const knowledgeApi = {
  getArticles: (page: number, pageSize: number, categoryId?: number): Promise<ApiResponse<PageResult<KnowledgeArticle>>> => {
    return get('/articles', { page, pageSize, categoryId });
  },

  search: (q: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PageResult<KnowledgeArticle>>> => {
    return get('/articles/search', { q, page, pageSize });
  },

  getArticle: (id: number): Promise<ApiResponse<KnowledgeArticle>> => {
    return get(`/articles/${id}`);
  },

  getCategories: (): Promise<ApiResponse<KnowledgeCategory[]>> => {
    return get('/categories');
  },

  like: (id: number): Promise<ApiResponse<LikeResponse>> => {
    return post(`/articles/${id}/like`);
  },

  collect: (id: number): Promise<ApiResponse<CollectResponse>> => {
    return post(`/articles/${id}/collect`);
  },

  isLiked: (id: number): Promise<ApiResponse<boolean>> => {
    return get(`/articles/${id}/liked`);
  },

  isCollected: (id: number): Promise<ApiResponse<boolean>> => {
    return get(`/articles/${id}/collected`);
  }
};
