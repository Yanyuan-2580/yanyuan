import { post, get } from '../request';
import type { ApiResponse, Admin, LoginData, LoginResponse, Statistics, WeeklyTrend, HourlyHeatmap, WeeklyDistribution, MoodDistribution, DashboardOverview } from '@/types';

export const adminApi = {
  login: (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    return post('/login', data);
  },

  logout: (): Promise<ApiResponse<void>> => {
    return post('/logout');
  },

  getProfile: (): Promise<ApiResponse<Admin>> => {
    return get('/profile');
  },

  getStatistics: (): Promise<ApiResponse<Statistics>> => {
    return get('/statistics');
  },

  getWeeklyTrend: (): Promise<ApiResponse<WeeklyTrend>> => {
    return get('/analytics/weekly-trend');
  },

  getHourlyHeatmap: (): Promise<ApiResponse<HourlyHeatmap>> => {
    return get('/analytics/hourly-heatmap');
  },

  getWeeklyDistribution: (): Promise<ApiResponse<WeeklyDistribution>> => {
    return get('/analytics/weekly-distribution');
  },

  getMoodDistribution: (): Promise<ApiResponse<MoodDistribution>> => {
    return get('/analytics/mood-distribution');
  },

  getDashboardOverview: (): Promise<ApiResponse<DashboardOverview>> => {
    return get('/analytics/overview');
  },
};
