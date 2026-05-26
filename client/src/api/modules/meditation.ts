import request from '@/api/request';

export const meditationApi = {
  getAllMeditations(category?: string) {
    const params = category ? { category } : {};
    return request.get('/meditation', { params });
  },

  getMeditationById(id: number) {
    return request.get(`/meditation/${id}`);
  },

  recordMeditation(meditationId: number, duration: number) {
    return request.post('/meditation/record', { meditationId, duration });
  },

  getMeditationStats() {
    return request.get('/meditation/stats');
  }
};