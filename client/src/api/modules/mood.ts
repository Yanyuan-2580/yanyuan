import { post, get } from '../request';

export const moodApi = {
  recordMood(data: { moodScore: number; moodType: string; reason?: string }) {
    return post('/mood/record', data);
  },

  getMoodHistory(period: 'week' | 'month' | 'year' = 'week') {
    return get('/mood/history', { period });
  },

  getMoodStats() {
    return get('/mood/stats');
  }
};