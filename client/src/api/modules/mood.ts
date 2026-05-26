import request from '@/api/request';

export const moodApi = {
  recordMood(data: { moodScore: number; moodType: string; reason?: string }) {
    return request.post('/mood/record', data);
  },

  getMoodHistory(period: 'week' | 'month' | 'year' = 'week') {
    return request.get('/mood/history', { params: { period } });
  },

  getMoodStats() {
    return request.get('/mood/stats');
  }
};