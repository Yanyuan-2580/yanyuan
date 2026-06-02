<script setup lang="ts">import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { MessageCircle, Phone, Lock, Eye, EyeOff } from 'lucide-vue-next';
const router = useRouter();
const userStore = useUserStore();
const phone = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const handleLogin = async () => {
 if (!phone.value || !password.value) {
 errorMessage.value = '请填写手机号和密码';
 return;
 }
 if (!/^1[3-9]\d{9}$/.test(phone.value)) {
 errorMessage.value = '请输入正确的手机号';
 return;
 }
 isLoading.value = true;
 try {
 await userStore.login({ phone: phone.value, password: password.value });
 router.push('/');
 }
 catch (error: any) {
 errorMessage.value = error.message || '登录失败，请重试';
 }
 finally {
 isLoading.value = false;
 }
};

const handleRegister = () => {
 router.push('/register');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <div class="w-full max-w-md animate-fadeIn">
      <div class="glass-card text-center mb-8">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-calm-400 to-emerald-500 flex items-center justify-center shadow-soft">
          <MessageCircle class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">心理健康AI助手</h1>
        <p class="text-gray-500">陪伴你每一天</p>
      </div>
      
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">登录</h2>
        
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {{ errorMessage }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <div class="relative">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="phone"
                type="tel"
                placeholder="请输入手机号"
                class="input-field pl-12"
                maxlength="11"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="input-field pl-12 pr-12"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            class="btn-primary w-full mt-6"
            :disabled="isLoading"
            @click="handleLogin"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </div>
        
        <p class="mt-6 text-center text-gray-500 text-sm">
          还没有账号？
          <button class="text-calm-500 hover:text-calm-600 font-medium" @click="handleRegister">
            立即注册
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
