import { get, post, put, del } from '../request';
import type { ApiResponse, User, PageResult } from '@/types';

export const userApi = {
  getUsers: (page: number, pageSize: number, params?: { status?: number; riskLevel?: number; keyword?: string }): Promise<ApiResponse<PageResult<User>>> => {
    return get('/users', { page, pageSize, ...params });
  },

  getUser: (id: number): Promise<ApiResponse<User>> => {
    return get(`/users/${id}`);
  },

  createUser: (data: { username: string; password: string; nickname?: string }): Promise<ApiResponse<User>> => {
    return post('/users', data);
  },

  updateUser: (id: number, data: { nickname?: string; status?: number; riskLevel?: number }): Promise<ApiResponse<User>> => {
    return put(`/users/${id}`, data);
  },

  updateUserStatus: (id: number, status: number): Promise<ApiResponse<User>> => {
    return put(`/users/${id}/status`, { status });
  },

  updateUserRiskLevel: (id: number, riskLevel: number): Promise<ApiResponse<User>> => {
    return put(`/users/${id}/risk-level`, { riskLevel });
  },

  deleteUser: (id: number): Promise<ApiResponse<void>> => {
    return del(`/users/${id}`);
  }
};
