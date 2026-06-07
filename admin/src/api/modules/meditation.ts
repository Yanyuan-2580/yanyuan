import { getPublic, postPublic, putPublic, delPublic } from '../request-public';
import type { ApiResponse } from '@/types';

export interface AdminMeditation {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  audioUrl: string;
  coverImage: string;
  status: number;
  playCount: number;
  createdAt: string;
}

export const meditationApi = {
  getList: (): Promise<ApiResponse<AdminMeditation[]>> => {
    return getPublic('/meditation/admin/list');
  },

  getDetail: (id: number): Promise<ApiResponse<AdminMeditation>> => {
    return getPublic(`/meditation/${id}`);
  },

  create: (data: Partial<AdminMeditation>): Promise<ApiResponse<AdminMeditation>> => {
    return postPublic('/meditation', data);
  },

  update: (id: number, data: Partial<AdminMeditation>): Promise<ApiResponse<AdminMeditation>> => {
    return putPublic(`/meditation/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return delPublic(`/meditation/${id}`);
  },
};
