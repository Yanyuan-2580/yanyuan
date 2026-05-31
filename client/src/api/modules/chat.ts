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
  },

  /**
   * SSE streaming chat
   * Returns an AbortController to cancel the stream
   */
  sendMessageStream: (
    data: SendMessageData,
    onChunk: (chunk: string) => void,
    onComplete: (data: { sessionId: number; moodTag?: string }) => void,
    onError: (error: string) => void,
    onStart?: (data: { sessionId: number; riskLevel?: number }) => void
  ): AbortController => {
    const controller = new AbortController();
    const token = localStorage.getItem('accessToken');

    fetch('/api/v1/chat/messages/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    }).then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: '请求失败' }));
        onError(err.message || '请求失败');
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('浏览器不支持流式读取');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              switch (eventData.type) {
                case 'start':
                  onStart?.(eventData.data);
                  break;
                case 'chunk':
                  onChunk(eventData.data.content);
                  break;
                case 'complete':
                  onComplete(eventData.data);
                  break;
                case 'error':
                  onError(eventData.data.message);
                  break;
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message || '网络错误');
      }
    });

    return controller;
  }
};
