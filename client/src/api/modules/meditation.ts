import { post, get } from '../request';

export const meditationApi = {
  getAllMeditations(category?: string) {
    const params = category ? { category } : undefined;
    return get('/meditation', params);
  },

  getMeditationById(id: number) {
    return get(`/meditation/${id}`);
  },

  recordMeditation(meditationId: number, duration: number) {
    return post('/meditation/record', { meditationId, duration });
  },

  getMeditationStats() {
    return get('/meditation/stats');
  }
};