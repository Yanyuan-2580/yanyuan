<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { request } from '@/api/request';
import { Heart, Phone, Lock, User, Eye, EyeOff, Zap, Shield, MessageCircle, Key, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Tab: 'login' | 'register' | 'code' | 'reset'
const activeTab = ref<'login' | 'register' | 'code' | 'reset'>(
  route.path === '/register' ? 'register' : 'login'
);

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

// Code login fields
const codePhone = ref('');
const codeValue = ref('');
const codeSending = ref(false);
const codeCountdown = ref(0);
const codeLoginLoading = ref(false);

// Password reset fields
const resetStep = ref<'phone' | 'code' | 'password'>('phone');
const resetPhone = ref('');
const resetCode = ref('');
const resetNewPassword = ref('');
const resetConfirmPassword = ref('');
const resetSending = ref(false);
const resetCountdown = ref(0);
const resetLoading = ref(false);
const showResetPassword = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

let countdownTimer: ReturnType<typeof setInterval> | null = null;

const switchTab = (tab: 'login' | 'register' | 'code' | 'reset') => {
  activeTab.value = tab;
  errorMessage.value = '';
  successMessage.value = '';
  if (tab === 'reset') {
    resetStep.value = 'phone';
  }
  if (tab !== 'login' && tab !== 'register') {
    router.replace('/login');
  } else {
    router.replace(tab === 'login' ? '/login' : '/register');
  }
};

// --- Login ---
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

// --- Register ---
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

// --- Code Login ---
const startCodeCountdown = (target: Ref<number>) => {
  target.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (target.value > 0) {
      target.value--;
    } else {
      if (countdownTimer) clearInterval(countdownTimer);
    }
  }, 1000);
};

const sendLoginCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(codePhone.value)) {
    errorMessage.value = '请输入正确的手机号';
    return;
  }
  codeSending.value = true;
  try {
    await request.post('/users/send-code', { phone: codePhone.value });
    startCodeCountdown(codeCountdown);
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.message || '发送失败';
  } finally {
    codeSending.value = false;
  }
};

const handleCodeLogin = async () => {
  errorMessage.value = '';
  if (!codePhone.value || !codeValue.value) {
    errorMessage.value = '请填写手机号和验证码';
    return;
  }
  codeLoginLoading.value = true;
  try {
    const res = await request.post('/users/code-login', {
      phone: codePhone.value,
      code: codeValue.value
    });
    if (res.code === 200) {
      localStorage.setItem('accessToken', res.data.accessToken);
      userStore.setUser(res.data.user);
      router.push('/');
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败';
  } finally {
    codeLoginLoading.value = false;
  }
};

// --- Password Reset ---
const sendResetCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(resetPhone.value)) {
    errorMessage.value = '请输入正确的手机号';
    return;
  }
  resetSending.value = true;
  try {
    await request.post('/users/forgot-password', { phone: resetPhone.value });
    resetStep.value = 'code';
    startCodeCountdown(resetCountdown);
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.message || '发送失败，请确认手机号已注册';
  } finally {
    resetSending.value = false;
  }
};

const handleResetPassword = async () => {
  errorMessage.value = '';
  if (!resetCode.value) {
    errorMessage.value = '请输入验证码';
    return;
  }
  if (resetNewPassword.value.length < 6) {
    errorMessage.value = '密码长度至少6位';
    return;
  }
  if (resetNewPassword.value !== resetConfirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }
  resetLoading.value = true;
  try {
    await request.post('/users/reset-password', {
      phone: resetPhone.value,
      code: resetCode.value,
      newPassword: resetNewPassword.value
    });
    successMessage.value = '密码重置成功！请使用新密码登录';
    setTimeout(() => {
      switchTab('login');
      loginPhone.value = resetPhone.value;
    }, 2000);
  } catch (error: any) {
    errorMessage.value = error.message || '重置失败';
  } finally {
    resetLoading.value = false;
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
        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-soft transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <Heart class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1">心理健康AI助手</h1>
        <p class="text-gray-400 text-sm">温暖陪伴，专业支持</p>
      </div>

      <!-- Tab Card -->
      <div class="w-full max-w-md animate-slide-up">
        <!-- Tab Switcher (hidden for reset flow) -->
        <div v-if="activeTab !== 'reset'" class="flex bg-white/70 backdrop-blur rounded-2xl p-1 mb-4 shadow-sm">
          <button
            v-for="tab in [
              { key: 'login', label: '密码登录' },
              { key: 'code', label: '验证码登录' },
              { key: 'register', label: '注册' }
            ]"
            :key="tab.key"
            class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
            :class="activeTab === tab.key
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700'"
            @click="switchTab(tab.key as any)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Reset: Back button -->
        <div v-if="activeTab === 'reset'" class="mb-4">
          <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700" @click="switchTab('login')">
            <ArrowLeft class="w-4 h-4" />
            返回登录
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-3xl p-6 shadow-card">
          <!-- Error -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <span class="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>
          <!-- Success -->
          <div v-if="successMessage" class="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm">
            ✅ {{ successMessage }}
          </div>

          <!-- ========= LOGIN FORM ========= -->
          <form v-if="activeTab === 'login'" class="space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="loginPhone" type="tel" placeholder="请输入手机号" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="11" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">密码</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="loginPassword" :type="showLoginPassword ? 'text' : 'password'" placeholder="请输入密码" class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500" @click="showLoginPassword = !showLoginPassword">
                  <Eye v-if="showLoginPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60" :disabled="loginLoading">
              <span v-if="loginLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                登录中...
              </span>
              <span v-else>登 录</span>
            </button>
            <p class="text-center text-gray-400 text-xs mt-3">
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('reset')">忘记密码？</button>
              <span class="mx-2">|</span>
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('register')">立即注册</button>
            </p>
          </form>

          <!-- ========= CODE LOGIN FORM ========= -->
          <form v-if="activeTab === 'code'" class="space-y-4" @submit.prevent="handleCodeLogin">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="codePhone" type="tel" placeholder="请输入手机号" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="11" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">验证码</label>
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <Key class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input v-model="codeValue" type="text" placeholder="请输入验证码" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="6" />
                </div>
                <button type="button" class="px-4 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all"
                        :class="codeCountdown > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'"
                        :disabled="codeCountdown > 0 || codeSending"
                        @click="sendLoginCode">
                  {{ codeSending ? '发送中...' : codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
                </button>
              </div>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60" :disabled="codeLoginLoading">
              <span v-if="codeLoginLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                登录中...
              </span>
              <span v-else>登 录</span>
            </button>
            <p class="text-center text-gray-400 text-xs mt-3">
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('login')">密码登录</button>
              <span class="mx-2">|</span>
              <button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('register')">立即注册</button>
            </p>
          </form>

          <!-- ========= REGISTER FORM ========= -->
          <form v-if="activeTab === 'register'" class="space-y-4" @submit.prevent="handleRegister">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="regPhone" type="tel" placeholder="请输入手机号" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="11" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">昵称 <span class="text-gray-300 font-normal">(可选)</span></label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="regNickname" type="text" placeholder="给自己取个温暖的名字" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="50" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">密码</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="regPassword" :type="showRegPassword ? 'text' : 'password'" placeholder="至少6位密码" class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
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
                <input v-model="regConfirmPassword" :type="showRegPassword ? 'text' : 'password'" placeholder="再次输入密码" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
              </div>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60" :disabled="regLoading">
              <span v-if="regLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                注册中...
              </span>
              <span v-else>注 册</span>
            </button>
            <p class="text-center text-gray-400 text-xs mt-3">
              已有账号？<button type="button" class="text-amber-500 hover:text-amber-600 font-medium" @click="switchTab('login')">立即登录</button>
            </p>
          </form>

          <!-- ========= PASSWORD RESET FORM ========= -->
          <form v-if="activeTab === 'reset'" class="space-y-4" @submit.prevent="resetStep === 'phone' ? sendResetCode() : resetStep === 'code' ? resetStep = 'password' : handleResetPassword()">
            <h2 class="text-lg font-semibold text-gray-800 text-center mb-2">重置密码</h2>

            <!-- Step 1: Phone -->
            <div v-if="resetStep === 'phone'">
              <label class="block text-sm font-medium text-gray-600 mb-1.5">请输入注册手机号</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="resetPhone" type="tel" placeholder="请输入手机号" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="11" />
              </div>
              <p class="text-xs text-gray-400 mt-2">验证码将发送到该手机号，用于验证你的身份</p>
            </div>

            <!-- Step 2: Code -->
            <div v-if="resetStep === 'code'">
              <label class="block text-sm font-medium text-gray-600 mb-1.5">验证码</label>
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <Key class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input v-model="resetCode" type="text" placeholder="请输入验证码" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" maxlength="6" />
                </div>
                <button type="button" class="px-4 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all"
                        :class="resetCountdown > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'"
                        :disabled="resetCountdown > 0 || resetSending"
                        @click="sendResetCode">
                  {{ resetSending ? '发送中...' : resetCountdown > 0 ? `${resetCountdown}s` : '重新发送' }}
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-2">验证码已发送至 {{ resetPhone }}，5分钟内有效</p>
            </div>

            <!-- Step 3: New Password -->
            <div v-if="resetStep === 'password'">
              <label class="block text-sm font-medium text-gray-600 mb-1.5">新密码</label>
              <div class="relative mb-3">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="resetNewPassword" :type="showResetPassword ? 'text' : 'password'" placeholder="至少6位新密码" class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500" @click="showResetPassword = !showResetPassword">
                  <Eye v-if="showResetPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input v-model="resetConfirmPassword" :type="showResetPassword ? 'text' : 'password'" placeholder="确认新密码" class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
              </div>
            </div>

            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                    :disabled="(resetStep === 'phone' && resetSending) || (resetStep === 'password' && resetLoading)">
              {{ resetStep === 'phone' ? '发送验证码' : resetStep === 'code' ? '下一步' : (resetLoading ? '重置中...' : '重置密码') }}
            </button>
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
          登录即表示同意 <span class="text-gray-400">服务协议</span> 和 <span class="text-gray-400">隐私政策</span>
        </p>
      </div>
    </div>
  </div>
</template>
