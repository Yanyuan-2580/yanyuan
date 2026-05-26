import { get, put, del } from '../request';
import type { ApiResponse, User, PageResult } from '@/types';

export const userApi = {
  getUsers: (page: number, pageSize: number): Promise<ApiResponse<PageResult<User>>> => {
    return get('/users', { page, pageSize });
  },

  getUser: (id: number): Promise<ApiResponse<User>> => {
    return get(`/users/${id}`);
  },

  updateUser: (id: number, data: { nickname: string; status: number }): Promise<ApiResponse<User>> => {
    return put(`/users/${id}`, data);
  },

  deleteUser: (id: number): Promise<ApiResponse<void>> => {
    return del(`/users/${id}`);
  }
};
