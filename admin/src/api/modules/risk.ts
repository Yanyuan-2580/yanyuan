import { get } from '../request';
import type { ApiResponse, RiskRecord, PageResult } from '@/types';

export const riskApi = {
  getRiskRecords: (page: number, pageSize: number): Promise<ApiResponse<PageResult<RiskRecord>>> => {
    return get('/risk-records', { page, pageSize });
  }
};
