import { get } from '../request';
import type { ApiResponse } from '@/types';

export const exportApi = {
  exportData: (type: string): Promise<ApiResponse<any>> => {
    return get(`/export/${type}`);
  },

  downloadExport: async (type: string): Promise<void> => {
    const res = await get(`/export/${type}`);
    const dataStr = JSON.stringify((res as any)?.data || res, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
