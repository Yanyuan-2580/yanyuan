import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Admin } from '@/types';
import { adminApi } from '@/api';
import type { LoginData, LoginResponse } from '@/types';

export const useAdminStore = defineStore('admin', () => {
  const admin = ref<Admin | null>(null);
  const isLoggedIn = computed(() => !!admin.value);

  const loadAdmin = () => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      admin.value = JSON.parse(stored);
    }
  };

  const setAdmin = (newAdmin: Admin) => {
    admin.value = newAdmin;
    localStorage.setItem('admin', JSON.stringify(newAdmin));
  };

  const login = async (data: LoginData): Promise<LoginResponse> => {
    const response = await adminApi.login(data);
    if (response.code === 200) {
      localStorage.setItem('adminToken', response.data.accessToken);
      setAdmin(response.data.admin);
    }
    return response.data;
  };

  const logout = async () => {
    await adminApi.logout();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    admin.value = null;
  };

  const getProfile = async (): Promise<Admin> => {
    const response = await adminApi.getProfile();
    if (response.code === 200) {
      setAdmin(response.data);
    }
    return response.data;
  };

  return {
    admin,
    isLoggedIn,
    loadAdmin,
    setAdmin,
    login,
    logout,
    getProfile
  };
});
