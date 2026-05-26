<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { adminApi } from '@/api';
import type { Statistics } from '@/types';
import { ElMessage } from 'element-plus';

const router = useRouter();
const adminStore = useAdminStore();

const statistics = ref<Statistics | null>(null);
const activeMenu = ref('dashboard');

const menuItems = [
  { name: 'dashboard', label: '数据概览', icon: '📊', path: '/' },
  { name: 'users', label: '用户管理', icon: '👥', path: '/users' },
  { name: 'articles', label: '文章管理', icon: '📝', path: '/articles' },
  { name: 'risk', label: '风险监控', icon: '🛡️', path: '/risk' }
];

const statCards = [
  { key: 'totalUsers', label: '总用户数', color: 'bg-blue-500' },
  { key: 'activeUsers', label: '活跃用户', color: 'bg-green-500' },
  { key: 'totalDiaries', label: '日记总数', color: 'bg-purple-500' },
  { key: 'riskCount', label: '风险预警', color: 'bg-red-500' }
];

const loadStatistics = async () => {
  try {
    const res = await adminApi.getStatistics();
    if (res.code === 200) {
      statistics.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败');
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

onMounted(() => {
  loadStatistics();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <aside class="w-64 bg-white shadow-md min-h-screen">
        <div class="p-6 border-b">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span class="text-white text-lg">AI</span>
            </div>
            <div>
              <h1 class="font-bold text-gray-800">管理后台</h1>
              <p class="text-xs text-gray-500">心理健康助手</p>
            </div>
          </div>
        </div>

        <nav class="p-4">
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.name">
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                :class="activeMenu === item.name ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'"
                @click="activeMenu = item.name; router.push(item.path)"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div class="absolute bottom-0 left-0 w-64 p-4 border-t">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
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

      <main class="flex-1 p-6">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">数据概览</h2>
            <p class="text-gray-500 mt-1">欢迎回来，{{ adminStore.admin?.nickname }}</p>
          </div>
          <div class="text-right">
            <p class="text-gray-500 text-sm">{{ new Date().toLocaleDateString('zh-CN') }}</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            v-for="stat in statCards"
            :key="stat.key"
            class="bg-white rounded-2xl shadow-sm p-6"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">{{ stat.label }}</p>
                <p class="text-3xl font-bold text-gray-800 mt-2">{{ statistics?.[stat.key as keyof Statistics] || 0 }}</p>
              </div>
              <div :class="['w-14 h-14 rounded-xl flex items-center justify-center', stat.color]">
                <span class="text-white text-2xl">
                  {{ stat.key === 'totalUsers' ? '👥' : stat.key === 'activeUsers' ? '✅' : stat.key === 'totalDiaries' ? '📔' : '⚠️' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">用户增长趋势</h3>
            <div class="h-64 flex items-end justify-around gap-4">
              <div v-for="(height, index) in [60, 80, 45, 90, 70, 100, 85]" :key="index" class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full bg-gradient-to-t from-primary-400 to-primary-200 rounded-t-lg transition-all hover:from-primary-500 hover:to-primary-300" :style="{ height: `${height}%` }"></div>
                <span class="text-xs text-gray-500">{{ ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index] }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">风险等级分布</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">低风险</span>
                  <span class="text-gray-800 font-medium">75%</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">中风险</span>
                  <span class="text-gray-800 font-medium">18%</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500 rounded-full" style="width: 18%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">高风险</span>
                  <span class="text-gray-800 font-medium">7%</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500 rounded-full" style="width: 7%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
