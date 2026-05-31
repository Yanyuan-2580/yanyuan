import { post, get, del } from '../request';
import type { ApiResponse, AiSession, ChatMessage } from '@/types';

export interface SendMessageData {
  content: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  session: AiSession;
  message: ChatMessage;
}

export interface WeeklyChatCount {
  weeklyCount: number;
  weeklyLimit: number;
  totalCount: number;
}

export const chatApi = {
  getWeeklyChatCount: (): Promise<ApiResponse<WeeklyChatCount>> => {
    return get('/chat/stats/weekly-count');
  },

  createSession: (): Promise<ApiResponse<AiSession>> => {
    return post('/chat/sessions');
  },

  getSessions: (): Promise<ApiResponse<AiSession[]>> => {
    return get('/chat/sessions');
  },

  getSession: (id: number): Promise<ApiResponse<AiSession>> => {
    return get(`/chat/sessions/${id}`);
  },

  endSession: (id: number): Promise<ApiResponse<void>> => {
    return del(`/chat/sessions/${id}`);
  },

  getMessages: (sessionId: string): Promise<ApiResponse<ChatMessage[]>> => {
    return get(`/chat/messages/${sessionId}`);
  },

  sendMessage: (data: SendMessageData): Promise<ApiResponse<SendMessageResponse>> => {
    return post('/chat/messages', data);
  }
};
