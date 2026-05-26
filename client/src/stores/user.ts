import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { userApi } from '@/api';
import type { LoginData, RegisterData, UpdateProfileData, LoginResponse } from '@/api/modules/user';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const loadUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      user.value = JSON.parse(stored);
    }
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (data: LoginData): Promise<LoginResponse> => {
    const response = await userApi.login(data);
    if (response.code === 200) {
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
    }
    return response.data;
  };

  const register = async (data: RegisterData): Promise<LoginResponse> => {
    const response = await userApi.register(data);
    if (response.code === 200) {
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = async () => {
    await userApi.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    user.value = null;
  };

  const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    const response = await userApi.updateProfile(data);
    if (response.code === 200) {
      setUser(response.data);
    }
    return response.data;
  };

  const getProfile = async (): Promise<User> => {
    const response = await userApi.getProfile();
    if (response.code === 200) {
      setUser(response.data);
    }
    return response.data;
  };

  return {
    user,
    isLoggedIn,
    loadUser,
    setUser,
    login,
    register,
    logout,
    updateProfile,
    getProfile
  };
});
