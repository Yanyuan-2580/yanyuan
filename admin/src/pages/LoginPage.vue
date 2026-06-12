<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { ElMessage } from 'element-plus';

const router = useRouter();
const adminStore = useAdminStore();

const username = ref('');
const password = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.error('请填写用户名和密码');
    return;
  }
  if (username.value.length < 2) {
    ElMessage.error('用户名长度至少2位');
    return;
  }
  if (password.value.length < 4) {
    ElMessage.error('密码长度至少4位');
    return;
  }

  isLoading.value = true;
  try {
    await adminStore.login({ username: username.value, password: password.value });
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-calm-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
    <!-- Decorative blobs -->
    <div class="absolute -top-20 -right-20 w-80 h-80 bg-calm-200/20 rounded-full blur-3xl" />
    <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl" />

    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in border border-gray-100 dark:border-gray-700">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
            <path d="M18 9h-5a4 4 0 0 0-4 4v2" />
            <path d="M10 19h4" />
            <circle cx="12" cy="7" r="3" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">管理后台</h1>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">心理健康AI助手</p>
      </div>

      <div class="space-y-5">
        <div>
          <label class="block text-[13px] font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1.5 ml-1">用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入管理员用户名" class="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            class="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-400 transition-all duration-200"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1.5 ml-1">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入管理员密码" class="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            class="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-400 transition-all duration-200"
          />
        </div>

        <button
          class="w-full py-3.5 bg-gray-900 dark:bg-gray-700 text-white text-[15px] font-semibold rounded-2xl shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
          <span v-else>登 录</span>
        </button>
      </div>
    </div>
  </div>
</template>
