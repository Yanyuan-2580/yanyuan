import { get } from '../request';
import type { ApiResponse, PageResult } from '@/types';

export interface AdminChatSession {
  id: number;
  userId: number;
  title: string;
  messageCount: number;
  riskFlag: number;
  moodTag: string;
  status: string;
  createdAt: string;
}

export const chatSessionApi = {
  getSessions: (
    page: number,
    pageSize: number,
    params?: { riskFlag?: number; keyword?: string },
  ): Promise<ApiResponse<PageResult<AdminChatSession>>> => {
    return get('/chat/sessions', { page, pageSize, ...params });
  },
};
