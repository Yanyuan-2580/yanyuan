import { post, get, put, del } from '../request';
import type { ApiResponse, User } from '@/types';

export interface LoginData {
  phone: string;
  password: string;
}

export interface RegisterData extends LoginData {
  nickname?: string;
}

export interface UpdateProfileData {
  nickname?: string;
  avatarUrl?: string;
  email?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const userApi = {
  register: (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return post('/users/register', data);
  },

  login: (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    return post('/users/login', data);
  },

  refreshToken: (): Promise<ApiResponse<LoginResponse>> => {
    return post('/users/refresh-token');
  },

  getProfile: (): Promise<ApiResponse<User>> => {
    return get('/users/profile');
  },

  updateProfile: (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    return put('/users/profile', data);
  },

  changePassword: (data: ChangePasswordData): Promise<ApiResponse<{ success: boolean }>> => {
    return put('/users/password', data);
  },

  logout: (): Promise<ApiResponse<{ success: boolean }>> => {
    return post('/users/logout');
  },

  deleteAccount: (): Promise<ApiResponse<{ success: boolean }>> => {
    return del('/users/account');
  }
};
