import { get } from '../request';
import type { ApiResponse, PageResult } from '@/types';

export interface AdminDiary {
  id: number;
  userId: number;
  moodScore: number;
  moodTags: string[];
  content: string;
  isPublic: boolean;
  aiInsight: string;
  createdAt: string;
}

export const diaryApi = {
  getDiaries: (
    page: number,
    pageSize: number,
  ): Promise<ApiResponse<PageResult<AdminDiary>>> => {
    return get('/diaries', { page, pageSize });
  },
};
