import { get } from '../request';
import type { ApiResponse } from '@/types';

export interface PageViewStat {
  page: string;
  count: number;
}

export interface DailyActive {
  date: string;
  activeUsers: number;
}

export interface EventDistribution {
  eventType: string;
  count: number;
}

export interface BehaviorOverview {
  pageViews: PageViewStat[];
  dailyActiveUsers: DailyActive[];
  eventDistribution: EventDistribution[];
}

export const behaviorApi = {
  getOverview: (): Promise<ApiResponse<BehaviorOverview>> => {
    return get('/behavior/overview');
  },

  getPageViews: (days: number = 7): Promise<ApiResponse<PageViewStat[]>> => {
    return get('/behavior/page-views', { days });
  },

  getDailyActive: (days: number = 7): Promise<ApiResponse<DailyActive[]>> => {
    return get('/behavior/daily-active', { days });
  },

  getEventDistribution: (days: number = 7): Promise<ApiResponse<EventDistribution[]>> => {
    return get('/behavior/event-distribution', { days });
  },
};
