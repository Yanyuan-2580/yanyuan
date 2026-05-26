import { post, get } from '../request';
import type { ApiResponse, Admin, LoginData, LoginResponse, Statistics } from '@/types';

export const adminApi = {
  login: (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    return post('/login', data);
  },

  logout: (): Promise<ApiResponse<void>> => {
    return post('/logout');
  },

  getProfile: (): Promise<ApiResponse<Admin>> => {
    return get('/profile');
  },

  getStatistics: (): Promise<ApiResponse<Statistics>> => {
    return get('/statistics');
  }
};
