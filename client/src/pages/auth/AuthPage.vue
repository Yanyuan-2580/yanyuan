<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Heart, Phone, Lock, User, Eye, EyeOff, Zap, Shield, MessageCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Tab state: 'login' or 'register'
const activeTab = ref<'login' | 'register'>(route.path === '/register' ? 'register' : 'login');

// Login fields
const loginPhone = ref('');
const loginPassword = ref('');
const showLoginPassword = ref(false);
const loginLoading = ref(false);

// Register fields
const regPhone = ref('');
const regPassword = ref('');
const regConfirmPassword = ref('');
const regNickname = ref('');
const showRegPassword = ref(false);
const regLoading = ref(false);

const errorMessage = ref('');

const switchTab = (tab: 'login' | 'register') => {
  activeTab.value = tab;
  errorMessage.value = '';
  router.replace(tab === 'login' ? '/login' : '/register');
};

const handleLogin = async () => {
  errorMessage.value = '';
  if (!loginPhone.value || !loginPassword.value) {
    errorMessage.value = '请填写手机号和密码';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(loginPhone.value)) {
    errorMessage.value = '请输入正确的手机号';
    return;
  }
  loginLoading.value = true;
  try {
    await userStore.login({ phone: loginPhone.value, password: loginPassword.value });
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请重试';
  } finally {
    loginLoading.value = false;
  }
};

const handleRegister = async () => {
  errorMessage.value = '';
  if (!regPhone.value || !regPassword.value || !regConfirmPassword.value) {
    errorMessage.value = '请填写完整信息';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(regPhone.value)) {
    errorMessage.value = '请输入正确的手机号';
    return;
  }
  if (regPassword.value.length < 6) {
    errorMessage.value = '密码长度至少6位';
    return;
  }
  if (regPassword.value !== regConfirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }
  regLoading.value = true;
  try {
    await userStore.register({
      phone: regPhone.value,
      password: regPassword.value,
      nickname: regNickname.value || undefined
    });
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请重试';
  } finally {
    regLoading.value = false;
  }
};

onMounted(() => {
  activeTab.value = route.path === '/register' ? 'register' : 'login';
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 flex flex-col">
    <!-- Brand Header -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
      <!-- Logo / Brand Mark -->
      <div class="mb-8 text-center animate-fade-in">
        <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-soft transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <Heart class="w-12 h-12 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">心理健康AI助手</h1>
        <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          温暖陪伴，专业支持<br/>在这里，遇见更好的自己
        </p>
      </div>

      <!-- Tab Card -->
      <div class="w-full max-w-md animate-slide-up">
        <!-- Tab Switcher -->
        <div class="flex bg-white/70 backdrop-blur rounded-2xl p-1 mb-4 shadow-sm">
          <button
            class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            :class="activeTab === 'login'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700'"
            @click="switchTab('login')"
          >
            登录
          </button>
          <button
            class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            :class="activeTab === 'register'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700'"
            @click="switchTab('register')"
          >
            注册
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-3xl p-6 shadow-card">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <span class="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form v-if="activeTab === 'login'" class="space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="loginPhone"
                  type="tel"
                  placeholder="请输入手机号"
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                  maxlength="11"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">密码</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="loginPassword"
                  :type="showLoginPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500" @click="showLoginPassword = !showLoginPassword">
                  <Eye v-if="showLoginPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:from-amber-400 hover:to-orange-500 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loginLoading"
            >
              <span v-if="loginLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                登录中...
              </span>
              <span v-else>登 录</span>
            </button>

            <p class="text-center text-gray-400 text-xs mt-4">
              还没有账号？
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('register')">立即注册</button>
            </p>
          </form>

          <!-- Register Form -->
          <form v-else class="space-y-4" @submit.prevent="handleRegister">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="regPhone"
                  type="tel"
                  placeholder="请输入手机号"
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                  maxlength="11"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">昵称 <span class="text-gray-300 font-normal">（可选）</span></label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="regNickname"
                  type="text"
                  placeholder="给自己取个温暖的名字"
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                  maxlength="50"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">密码</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="regPassword"
                  :type="showRegPassword ? 'text' : 'password'"
                  placeholder="请设置密码（至少6位）"
                  class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500" @click="showRegPassword = !showRegPassword">
                  <Eye v-if="showRegPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">确认密码</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  v-model="regConfirmPassword"
                  :type="showRegPassword ? 'text' : 'password'"
                  placeholder="请再次输入密码"
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:from-amber-400 hover:to-orange-500 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="regLoading"
            >
              <span v-if="regLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                注册中...
              </span>
              <span v-else>注 册</span>
            </button>

            <p class="text-center text-gray-400 text-xs mt-4">
              已有账号？
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('login')">立即登录</button>
            </p>
          </form>
        </div>

        <!-- Trust & Features -->
        <div class="mt-6 grid grid-cols-3 gap-3 px-2">
          <div class="text-center">
            <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-white/80 flex items-center justify-center">
              <Shield class="w-5 h-5 text-calm-500" />
            </div>
            <p class="text-xs text-gray-400">隐私保护</p>
          </div>
          <div class="text-center">
            <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-white/80 flex items-center justify-center">
              <Zap class="w-5 h-5 text-warm-500" />
            </div>
            <p class="text-xs text-gray-400">AI智能陪伴</p>
          </div>
          <div class="text-center">
            <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-white/80 flex items-center justify-center">
              <MessageCircle class="w-5 h-5 text-primary-500" />
            </div>
            <p class="text-xs text-gray-400">专业支持</p>
          </div>
        </div>

        <!-- Bottom text -->
        <p class="text-center text-xs text-gray-300 mt-6">
          登录即表示同意
          <span class="text-gray-400">服务协议</span>
          和
          <span class="text-gray-400">隐私政策</span>
        </p>
      </div>
    </div>
  </div>
</template>
