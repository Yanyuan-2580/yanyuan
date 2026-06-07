<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { useDarkMode } from '@/composables/useDarkMode';
import { ElMessage } from 'element-plus';

const props = withDefaults(defineProps<{
  activeMenu?: string;
}>(), {
  activeMenu: 'dashboard'
});

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const { isDark, toggle: toggleDarkMode } = useDarkMode();

const currentMenu = computed(() => props.activeMenu);

const menuItems = [
  { name: 'dashboard', label: '数据概览', icon: '📊', path: '/' },
  { name: 'users', label: '用户管理', icon: '👥', path: '/users' },
  { name: 'articles', label: '文章管理', icon: '📝', path: '/articles' },
  { name: 'risk', label: '风险监控', icon: '🛡️', path: '/risk' },
  { name: 'chat-sessions', label: '会话管理', icon: '💬', path: '/chat-sessions' },
  { name: 'diaries', label: '日记管理', icon: '📔', path: '/diaries' },
  { name: 'questionnaires', label: '问卷管理', icon: '📋', path: '/questionnaires' },
  { name: 'meditations', label: '冥想管理', icon: '🧘', path: '/meditations' },
  { name: 'behavior', label: '行为分析', icon: '📈', path: '/behavior' },
  { name: 'export', label: '数据导出', icon: '📥', path: '/export' },
  { name: 'audit-logs', label: '审计日志', icon: '📜', path: '/audit-logs' },
];

const handleMenuClick = async (item: typeof menuItems[0]) => {
  try {
    await router.push(item.path);
  } catch (error: any) {
    ElMessage.error('页面跳转失败');
  }
};

const handleLogout = async () => {
  try {
    await adminStore.logout();
    ElMessage.success('退出成功');
    router.push('/login');
  } catch (error: any) {
    ElMessage.error(error.message || '退出失败');
  }
};
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-50 dark:bg-charcoal-900 transition-colors">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-white dark:bg-charcoal-800 shadow-md flex flex-col h-full transition-colors">
      <div class="p-6 border-b dark:border-charcoal-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span class="text-white text-lg">AI</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-800 dark:text-gray-100">管理后台</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">心理健康助手</p>
          </div>
        </div>
      </div>

      <nav class="p-4 flex-1 overflow-y-auto">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.name">
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              :class="currentMenu === item.name
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-700'"
              @click="handleMenuClick(item)"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t dark:border-charcoal-700 space-y-2">
        <!-- Dark Mode Toggle -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-all"
          @click="toggleDarkMode"
        >
          <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
          <span class="font-medium text-sm">{{ isDark ? '浅色模式' : '深色模式' }}</span>
        </button>
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          @click="handleLogout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span class="font-medium">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6 dark:bg-charcoal-900 transition-colors">
      <slot />
    </main>
  </div>
</template>
