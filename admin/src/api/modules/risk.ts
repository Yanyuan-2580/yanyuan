import { get, put } from '../request';
import type { ApiResponse, RiskRecord, PageResult } from '@/types';

export const riskApi = {
  getRiskRecords: (page: number, pageSize: number, riskLevel?: number, type?: string): Promise<ApiResponse<PageResult<RiskRecord>>> => {
    return get('/risk-records', { page, pageSize, riskLevel, type });
  },

  resolveRiskRecord: (type: string, id: number, resolution: string): Promise<ApiResponse<void>> => {
    return put(`/risk-records/${type}/${id}/resolve`, { resolution });
  }
};
