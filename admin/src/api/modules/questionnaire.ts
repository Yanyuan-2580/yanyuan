import { getPublic, postPublic, putPublic, delPublic } from '../request-public';
import type { ApiResponse, PageResult } from '@/types';

export interface AdminQuestionnaire {
  id: number;
  title: string;
  description: string;
  category: string;
  questions: Array<{
    id: number;
    text: string;
    options: Array<{ value: number; label: string; score: number }>;
  }>;
  scoringRules: {
    ranges: Array<{ min: number; max: number; level: string; label: string }>;
  };
  status: number;
  createdAt: string;
}

export const questionnaireApi = {
  getList: (): Promise<ApiResponse<AdminQuestionnaire[]>> => {
    return getPublic('/questionnaires');
  },

  getDetail: (id: number): Promise<ApiResponse<AdminQuestionnaire>> => {
    return getPublic(`/questionnaires/${id}`);
  },

  create: (data: Partial<AdminQuestionnaire>): Promise<ApiResponse<AdminQuestionnaire>> => {
    return postPublic('/questionnaires', data);
  },

  update: (id: number, data: Partial<AdminQuestionnaire>): Promise<ApiResponse<AdminQuestionnaire>> => {
    return putPublic(`/questionnaires/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return delPublic(`/questionnaires/${id}`);
  },
};
