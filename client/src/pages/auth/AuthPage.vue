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
const loginUsername = ref('');
const loginPassword = ref('');
const showLoginPassword = ref(false);
const loginLoading = ref(false);

// Register fields
const regUsername = ref('');
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

const resetStepIndex = (step: string) => {
  const order = ['phone', 'code', 'password'];
  return order.indexOf(step);
};

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
  if (!loginUsername.value || !loginPassword.value) {
    errorMessage.value = '请填写用户名和密码';
    return;
  }
  if (loginUsername.value.length < 3) {
    errorMessage.value = '用户名至少3个字符';
    return;
  }
  loginLoading.value = true;
  try {
    await userStore.login({ username: loginUsername.value, password: loginPassword.value });
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
  if (!regUsername.value || !regPassword.value || !regConfirmPassword.value) {
    errorMessage.value = '请填写用户名和密码';
    return;
  }
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(regUsername.value)) {
    errorMessage.value = '用户名由3-30位字母、数字、下划线组成';
    return;
  }
  if (regPhone.value && !/^1[3-9]\d{9}$/.test(regPhone.value)) {
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
      username: regUsername.value,
      password: regPassword.value,
      phone: regPhone.value || undefined,
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
    const res = await request.post('/users/send-code', { phone: codePhone.value });
    startCodeCountdown(codeCountdown);
    // 开发环境显示验证码
    if (res.data?.devCode) {
      errorMessage.value = '';
      successMessage.value = `[DEV] 验证码: ${res.data.devCode}`;
    } else {
      errorMessage.value = '';
      successMessage.value = '验证码已发送';
    }
  } catch (error: any) {
    errorMessage.value = error.message || '发送失败';
    successMessage.value = '';
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
    const res = await request.post('/users/forgot-password', { phone: resetPhone.value });
    resetStep.value = 'code';
    startCodeCountdown(resetCountdown);
    if (res.data?.devCode) {
      successMessage.value = `[DEV] 验证码: ${res.data.devCode}`;
      errorMessage.value = '';
    } else {
      errorMessage.value = '';
      successMessage.value = '验证码已发送';
    }
  } catch (error: any) {
    errorMessage.value = error.message || '发送失败，请确认手机号已注册';
    successMessage.value = '';
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
  <div class="min-h-screen flex flex-col relative overflow-hidden" style="background: linear-gradient(160deg, #f3f7f4 0%, #fafbf9 15%, #ffffff 35%, #f8f9fb 55%, #f7f8fb 75%, #eef4f0 100%)">
    <!-- ── 超大柔和光晕 ── -->
    <!-- 右上：雾凇青大光斑 -->
    <div class="absolute -top-[10%] -right-[5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(117,155,127,0.12) 0%, rgba(159,187,166,0.06) 35%, rgba(197,215,201,0.02) 65%, transparent 100%);" />
    <!-- 左下：柔烟蓝光斑 -->
    <div class="absolute -bottom-[15%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(166,176,208,0.10) 0%, rgba(197,205,226,0.05) 40%, transparent 70%);" />
    <!-- 中上：暖琥珀微光 -->
    <div class="absolute top-[5%] left-[35%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(239,176,76,0.07) 0%, rgba(245,200,126,0.03) 45%, transparent 75%);" />
    <!-- 右下：柔粉光晕 -->
    <div class="absolute bottom-[10%] right-[15%] w-[30vw] h-[30vw] max-w-[380px] max-h-[380px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(247,178,178,0.07) 0%, rgba(251,213,213,0.03) 50%, transparent 80%);" />

    <!-- ── 网格纹理 ── -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.03]"
      style="background-image: radial-gradient(circle, #577f63 1px, transparent 1px); background-size: 32px 32px;" />

    <!-- ── 装饰光条 ── -->
    <div class="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
      style="background: linear-gradient(90deg, transparent 0%, rgba(117,155,127,0.15) 20%, rgba(166,176,208,0.10) 50%, rgba(117,155,127,0.08) 80%, transparent 100%);" />
    <div class="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
      style="background: linear-gradient(90deg, transparent 0%, rgba(166,176,208,0.10) 30%, rgba(117,155,127,0.12) 60%, transparent 100%);" />

    <!-- ── 浮动形状组 ── -->
    <!-- 圆点 -->
    <div class="absolute top-[12%] left-[6%] w-2.5 h-2.5 rounded-full bg-calm-400/20 animate-float pointer-events-none" />
    <div class="absolute top-[18%] right-[8%] w-3 h-3 rounded-full bg-soft-400/18 animate-float pointer-events-none" style="animation-delay: 0.8s" />
    <div class="absolute bottom-[22%] left-[10%] w-2 h-2 rounded-full bg-amber-400/18 animate-float pointer-events-none" style="animation-delay: 1.6s" />
    <div class="absolute bottom-[16%] right-[12%] w-3.5 h-3.5 rounded-full bg-rose-300/14 animate-float pointer-events-none" style="animation-delay: 2.4s" />
    <div class="absolute top-[40%] left-[3%] w-2 h-2 rounded-full bg-calm-300/15 animate-float pointer-events-none" style="animation-delay: 3.2s" />
    <div class="absolute top-[35%] right-[5%] w-2.5 h-2.5 rounded-full bg-blue-300/14 animate-float pointer-events-none" style="animation-delay: 4s" />

    <!-- 圆环 -->
    <div class="absolute top-[22%] left-[14%] w-6 h-6 rounded-full border-[1.5px] border-calm-300/15 animate-float pointer-events-none" style="animation-delay: 0.5s" />
    <div class="absolute bottom-[28%] right-[18%] w-5 h-5 rounded-full border-[1.5px] border-soft-300/12 animate-float pointer-events-none" style="animation-delay: 2s" />
    <div class="absolute top-[55%] right-[10%] w-7 h-7 rounded-full border-[1px] border-amber-300/10 animate-float pointer-events-none" style="animation-delay: 3.5s" />

    <!-- 小菱形（旋转45°的正方形） -->
    <div class="absolute top-[30%] right-[16%] w-2.5 h-2.5 bg-calm-300/12 rounded-sm rotate-45 animate-float pointer-events-none" style="animation-delay: 1.2s" />
    <div class="absolute bottom-[35%] left-[16%] w-2 h-2 bg-soft-300/12 rounded-sm rotate-45 animate-float pointer-events-none" style="animation-delay: 2.8s" />

    <!-- ── 柔和波浪曲线 ── -->
    <svg class="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.06]" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path d="M0,40 C320,120 480,0 720,30 C960,60 1120,10 1440,50 L1440,120 L0,120 Z" fill="#759b7f" />
      <path d="M0,60 C280,10 520,100 720,50 C920,0 1100,80 1440,45 L1440,120 L0,120 Z" fill="#9fbba6" opacity="0.5" />
    </svg>

    <!-- ── 左侧竖条装饰 ── -->
    <div class="absolute left-6 top-[20%] bottom-[20%] w-[2px] pointer-events-none hidden xl:block"
      style="background: linear-gradient(180deg, transparent 0%, rgba(117,155,127,0.12) 30%, rgba(166,176,208,0.10) 50%, rgba(117,155,127,0.08) 70%, transparent 100%);" />
    <div class="absolute right-6 top-[25%] bottom-[25%] w-[2px] pointer-events-none hidden xl:block"
      style="background: linear-gradient(180deg, transparent 0%, rgba(166,176,208,0.10) 25%, rgba(117,155,127,0.10) 55%, rgba(239,176,76,0.06) 75%, transparent 100%);" />

    <!-- Brand Header -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-8">
      <!-- Logo / Brand Mark -->
      <div class="mb-6 text-center animate-fade-in">
        <div class="w-[72px] h-[72px] mx-auto mb-5 rounded-2xl bg-gradient-to-br from-calm-400 via-calm-500 to-emerald-500 flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <Heart class="w-9 h-9 text-white" fill="white" />
        </div>
        <h1 class="text-[22px] font-bold text-gray-800 mb-1 tracking-tight">心灵港湾</h1>
        <p class="text-gray-400 text-sm">温暖陪伴，专业支持</p>
      </div>

      <!-- Tab Card -->
      <div class="w-full max-w-[400px] animate-slide-up">
        <!-- Tab Switcher -->
        <div v-if="activeTab !== 'reset'" class="flex bg-white/80 backdrop-blur rounded-2xl p-1 mb-4 shadow-sm border border-gray-100">
          <button
            v-for="tab in [
              { key: 'login', label: '密码登录' },
              { key: 'code', label: '验证码登录' },
              { key: 'register', label: '注册' }
            ]"
            :key="tab.key"
            class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
            :class="activeTab === tab.key
              ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700'"
            @click="switchTab(tab.key as any)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Reset: Back button -->
        <div v-if="activeTab === 'reset'" class="mb-4">
          <button class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-calm-600 transition-colors" @click="switchTab('login')">
            <ArrowLeft class="w-4 h-4" />
            返回登录
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-3xl p-6 shadow-card border border-gray-50">
          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-2.5 animate-fade-in">
            <div class="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-px">
              <span class="text-xs">⚠️</span>
            </div>
            <span class="leading-relaxed">{{ errorMessage }}</span>
          </div>
          <!-- Success Alert -->
          <div v-if="successMessage" class="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm flex items-center gap-2.5 animate-fade-in">
            <div class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span class="text-xs">✅</span>
            </div>
            <span class="leading-relaxed">{{ successMessage }}</span>
          </div>

          <!-- ========= LOGIN FORM ========= -->
          <form v-if="activeTab === 'login'" class="space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">用户名</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <User class="w-[18px] h-[18px]" />
                </div>
                <input v-model="loginUsername" type="text" placeholder="请输入用户名"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5 ml-1">
                <label class="text-[13px] font-medium text-gray-700">密码</label>
                <button type="button" class="text-[11px] text-gray-400 hover:text-calm-500 transition-colors" @click="switchTab('reset')">忘记密码？</button>
              </div>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Lock class="w-[18px] h-[18px]" />
                </div>
                <input v-model="loginPassword" :type="showLoginPassword ? 'text' : 'password'" placeholder="请输入密码"
                  class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" @click="showLoginPassword = !showLoginPassword">
                  <Eye v-if="showLoginPassword" class="w-[18px] h-[18px]" />
                  <EyeOff v-else class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
            <button type="submit" :disabled="loginLoading"
              class="w-full py-3.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-[15px] font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              <span v-if="loginLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                登录中...
              </span>
              <span v-else>登 录</span>
            </button>
            <p class="text-center text-gray-400 text-xs pt-1">
              还没有账号？<button type="button" class="text-calm-500 hover:text-calm-600 font-medium ml-1 transition-colors" @click="switchTab('register')">立即注册</button>
            </p>
          </form>

          <!-- ========= CODE LOGIN FORM ========= -->
          <form v-if="activeTab === 'code'" class="space-y-4" @submit.prevent="handleCodeLogin">
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">手机号</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Phone class="w-[18px] h-[18px]" />
                </div>
                <input v-model="codePhone" type="tel" placeholder="请输入手机号"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                  maxlength="11" />
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">验证码</label>
              <div class="flex gap-3">
                <div class="relative flex-1 group">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                    <Key class="w-[18px] h-[18px]" />
                  </div>
                  <input v-model="codeValue" type="text" placeholder="请输入验证码"
                    class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                    maxlength="6" />
                </div>
                <button type="button"
                  class="px-5 py-3.5 rounded-2xl text-[13px] font-medium whitespace-nowrap transition-all duration-200"
                  :class="codeCountdown > 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-calm-50 text-calm-600 hover:bg-calm-100 active:scale-95'"
                  :disabled="codeCountdown > 0 || codeSending"
                  @click="sendLoginCode">
                  {{ codeSending ? '发送中...' : codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
                </button>
              </div>
            </div>
            <button type="submit" :disabled="codeLoginLoading"
              class="w-full py-3.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-[15px] font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              <span v-if="codeLoginLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                登录中...
              </span>
              <span v-else>验 证 登 录</span>
            </button>
            <p class="text-center text-gray-400 text-xs pt-1">
              <button type="button" class="text-calm-500 hover:text-calm-600 font-medium transition-colors" @click="switchTab('login')">密码登录</button>
              <span class="mx-2 text-gray-300">|</span>
              <button type="button" class="text-calm-500 hover:text-calm-600 font-medium transition-colors" @click="switchTab('register')">注册账号</button>
            </p>
          </form>

          <!-- ========= REGISTER FORM ========= -->
          <form v-if="activeTab === 'register'" class="space-y-4" @submit.prevent="handleRegister">
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">用户名</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <User class="w-[18px] h-[18px]" />
                </div>
                <input v-model="regUsername" type="text" placeholder="3-30位字母、数字、下划线"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                  maxlength="30" />
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">
                昵称 <span class="text-gray-300 font-normal text-xs">(可选，默认同用户名)</span>
              </label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <User class="w-[18px] h-[18px]" />
                </div>
                <input v-model="regNickname" type="text" placeholder="给自己取个温暖的名字"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                  maxlength="50" />
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">
                手机号 <span class="text-gray-300 font-normal text-xs">(可选)</span>
              </label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Phone class="w-[18px] h-[18px]" />
                </div>
                <input v-model="regPhone" type="tel" placeholder="选填，方便找回密码"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                  maxlength="11" />
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">密码</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Lock class="w-[18px] h-[18px]" />
                </div>
                <input v-model="regPassword" :type="showRegPassword ? 'text' : 'password'" placeholder="至少6位密码"
                  class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" @click="showRegPassword = !showRegPassword">
                  <Eye v-if="showRegPassword" class="w-[18px] h-[18px]" />
                  <EyeOff v-else class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-gray-700 mb-1.5 ml-1">确认密码</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Lock class="w-[18px] h-[18px]" />
                </div>
                <input v-model="regConfirmPassword" :type="showRegPassword ? 'text' : 'password'" placeholder="再次输入密码"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
              </div>
              <p v-if="regPassword && regConfirmPassword && regPassword !== regConfirmPassword"
                class="text-red-400 text-[11px] mt-1.5 ml-1 animate-fade-in">两次输入的密码不一致</p>
            </div>
            <button type="submit" :disabled="regLoading"
              class="w-full py-3.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-[15px] font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              <span v-if="regLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                注册中...
              </span>
              <span v-else>注 册</span>
            </button>
            <p class="text-center text-gray-400 text-xs pt-1">
              已有账号？<button type="button" class="text-calm-500 hover:text-calm-600 font-medium ml-1 transition-colors" @click="switchTab('login')">立即登录</button>
            </p>
          </form>

          <!-- ========= PASSWORD RESET FORM ========= -->
          <form v-if="activeTab === 'reset'" class="space-y-4"
            @submit.prevent="resetStep === 'phone' ? sendResetCode() : resetStep === 'code' ? resetStep = 'password' : handleResetPassword()">
            <!-- Step indicator -->
            <div class="flex items-center justify-center gap-2 mb-1">
              <div v-for="step in ['phone', 'code', 'password']" :key="step"
                class="w-2 h-2 rounded-full transition-all duration-300"
                :class="resetStep === step ? 'bg-calm-500 w-6' : resetStepIndex(step) < resetStepIndex(resetStep) ? 'bg-calm-300' : 'bg-gray-200'" />
            </div>
            <h2 class="text-lg font-semibold text-gray-800 text-center mb-1">
              {{ resetStep === 'phone' ? '验证身份' : resetStep === 'code' ? '输入验证码' : '设置新密码' }}
            </h2>
            <p class="text-xs text-gray-400 text-center mb-2">
              {{ resetStep === 'phone' ? '请输入注册时使用的手机号' : resetStep === 'code' ? '验证码已发送，5分钟内有效' : '请设置你的新密码' }}
            </p>

            <!-- Step 1: Phone -->
            <div v-if="resetStep === 'phone'">
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Phone class="w-[18px] h-[18px]" />
                </div>
                <input v-model="resetPhone" type="tel" placeholder="请输入手机号"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                  maxlength="11" />
              </div>
            </div>

            <!-- Step 2: Code -->
            <div v-if="resetStep === 'code'">
              <div class="flex gap-3">
                <div class="relative flex-1 group">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                    <Key class="w-[18px] h-[18px]" />
                  </div>
                  <input v-model="resetCode" type="text" placeholder="请输入验证码"
                    class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
                    maxlength="6" />
                </div>
                <button type="button"
                  class="px-5 py-3.5 rounded-2xl text-[13px] font-medium whitespace-nowrap transition-all duration-200"
                  :class="resetCountdown > 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-calm-50 text-calm-600 hover:bg-calm-100 active:scale-95'"
                  :disabled="resetCountdown > 0 || resetSending"
                  @click="sendResetCode">
                  {{ resetSending ? '发送中...' : resetCountdown > 0 ? `${resetCountdown}s 后重发` : '重新发送' }}
                </button>
              </div>
            </div>

            <!-- Step 3: New Password -->
            <template v-if="resetStep === 'password'">
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Lock class="w-[18px] h-[18px]" />
                </div>
                <input v-model="resetNewPassword" :type="showResetPassword ? 'text' : 'password'" placeholder="至少6位新密码"
                  class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" @click="showResetPassword = !showResetPassword">
                  <Eye v-if="showResetPassword" class="w-[18px] h-[18px]" />
                  <EyeOff v-else class="w-[18px] h-[18px]" />
                </button>
              </div>
              <div class="relative group mt-3">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
                  <Lock class="w-[18px] h-[18px]" />
                </div>
                <input v-model="resetConfirmPassword" :type="showResetPassword ? 'text' : 'password'" placeholder="确认新密码"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200" />
              </div>
            </template>

            <button type="submit"
              class="w-full py-3.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-[15px] font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="(resetStep === 'phone' && resetSending) || (resetStep === 'password' && resetLoading)">
              {{ resetStep === 'phone' ? '发送验证码' : resetStep === 'code' ? '下一步' : (resetLoading ? '重置中...' : '重置密码') }}
            </button>
          </form>
        </div>

        <!-- Trust & Features -->
        <div class="mt-5 grid grid-cols-3 gap-3 px-1">
          <div class="text-center group cursor-default">
            <div class="w-11 h-11 mx-auto mb-1.5 rounded-xl bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
              <Shield class="w-5 h-5 text-calm-500" />
            </div>
            <p class="text-[11px] text-gray-400 font-medium">隐私保护</p>
          </div>
          <div class="text-center group cursor-default">
            <div class="w-11 h-11 mx-auto mb-1.5 rounded-xl bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
              <Zap class="w-5 h-5 text-amber-500" />
            </div>
            <p class="text-[11px] text-gray-400 font-medium">AI 智能陪伴</p>
          </div>
          <div class="text-center group cursor-default">
            <div class="w-11 h-11 mx-auto mb-1.5 rounded-xl bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
              <Heart class="w-5 h-5 text-rose-400" fill="currentColor" />
            </div>
            <p class="text-[11px] text-gray-400 font-medium">温暖专业</p>
          </div>
        </div>

        <!-- Bottom text -->
        <p class="text-center text-[11px] text-gray-300 mt-5">
          登录即表示同意 <span class="text-gray-400 cursor-pointer hover:text-calm-500 transition-colors">服务协议</span> 和 <span class="text-gray-400 cursor-pointer hover:text-calm-500 transition-colors">隐私政策</span>
        </p>
      </div>
    </div>
  </div>
</template>
