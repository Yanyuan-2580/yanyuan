import { post, get, put, del } from '../request';
import type { ApiResponse, Admin, LoginData, LoginResponse, Statistics, WeeklyTrend, HourlyHeatmap, WeeklyDistribution, MoodDistribution, DashboardOverview, PageResult, RiskRecordV2, RiskRecordStats } from '@/types';

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

  // ==================== Admin Management (SuperAdmin) ====================

  getAdmins: (page: number, pageSize: number, keyword?: string): Promise<ApiResponse<PageResult<Admin>>> => {
    const params: any = { page, pageSize };
    if (keyword) params.keyword = keyword;
    return get('/admins', params);
  },

  getAdminDetail: (id: number): Promise<ApiResponse<Admin>> => {
    return get(`/admins/${id}`);
  },

  createAdmin: (data: { username: string; password: string; nickname?: string; roles?: string[] }): Promise<ApiResponse<Admin>> => {
    return post('/admins', data);
  },

  updateAdmin: (id: number, data: { nickname?: string; roles?: string[]; status?: number }): Promise<ApiResponse<Admin>> => {
    return put(`/admins/${id}`, data);
  },

  deleteAdmin: (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return del(`/admins/${id}`);
  },

  // ==================== Risk Records V2 ====================

  getRiskRecordsV2: (page: number, pageSize: number, filters?: { status?: string; riskLevel?: number; source?: string }): Promise<ApiResponse<PageResult<RiskRecordV2>>> => {
    const params: any = { page, pageSize };
    if (filters?.status) params.status = filters.status;
    if (filters?.riskLevel !== undefined) params.riskLevel = filters.riskLevel;
    if (filters?.source) params.source = filters.source;
    return get('/risk-records-v2', params);
  },

  getRiskRecordStats: (): Promise<ApiResponse<RiskRecordStats>> => {
    return get('/risk-records-v2/stats');
  },

  resolveRiskRecordV2: (id: number, resolution?: string): Promise<ApiResponse<RiskRecordV2>> => {
    return put(`/risk-records-v2/${id}/resolve`, { resolution });
  },

  markFalsePositive: (id: number, reason?: string): Promise<ApiResponse<RiskRecordV2>> => {
    return put(`/risk-records-v2/${id}/false-positive`, { reason });
  },
};
