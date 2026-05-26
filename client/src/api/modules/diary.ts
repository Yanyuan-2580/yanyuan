import { post, get, put, del } from '../request';
import type { ApiResponse, MoodDiary, PageResult } from '@/types';

export interface CreateDiaryData {
  moodScore: number;
  moodTags?: string[];
  triggerEvent?: string;
  bodyFeeling?: string;
  sleepHours?: number;
  content?: string;
  isPublic?: number;
}

export type UpdateDiaryData = Partial<CreateDiaryData>;

export interface DiaryStats {
  total: number;
  avgScore: string;
  scoreDistribution: Record<number, number>;
  period: 'week' | 'month' | 'year';
}

export const diaryApi = {
  create: (data: CreateDiaryData): Promise<ApiResponse<MoodDiary>> => {
    return post('/diaries', data);
  },

  list: (page: number, pageSize: number): Promise<ApiResponse<PageResult<MoodDiary>>> => {
    return get('/diaries', { page, pageSize });
  },

  get: (id: number): Promise<ApiResponse<MoodDiary>> => {
    return get(`/diaries/${id}`);
  },

  update: (id: number, data: UpdateDiaryData): Promise<ApiResponse<MoodDiary>> => {
    return put(`/diaries/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return del(`/diaries/${id}`);
  },

  stats: (period: 'week' | 'month' | 'year'): Promise<ApiResponse<DiaryStats>> => {
    return get(`/diaries/stats/${period}`);
  }
};
