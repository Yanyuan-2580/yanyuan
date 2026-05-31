/**
 * Uni-App request wrapper for mini program
 * Reuses the same /api/v1 server API
 */

const BASE_URL = 'https://your-api-domain.com/api/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res: any) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('accessToken');
          uni.reLaunch({ url: '/pages/index/index' });
          return;
        }
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

export const api = {
  get: <T>(url: string, params?: any) => {
    const query = params ? '?' + Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as any)}`)
      .join('&') : '';
    return request<T>({ url: url + query, method: 'GET' });
  },
  post: <T>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  del: <T>(url: string) => request<T>({ url, method: 'DELETE' })
};
