<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { riskApi } from '@/api';
import type { RiskRecord } from '@/types';
import { ElMessage, ElTable, ElTableColumn, ElPagination } from 'element-plus';
const router = useRouter();
const adminStore = useAdminStore();
const riskRecords = ref<RiskRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const activeMenu = ref('risk');
const menuItems = [
 { name: 'dashboard', label: '数据概览', icon: '📊', path: '/' },
 { name: 'users', label: '用户管理', icon: '👥', path: '/users' },
 { name: 'articles', label: '文章管理', icon: '📝', path: '/articles' },
 { name: 'risk', label: '风险监控', icon: '🛡️', path: '/risk' }
];
const handleMenuClick = async (item: typeof menuItems[0]) => {
  activeMenu.value = item.name;
  try {
    await router.push(item.path);
  }
  catch (error: any) {
    console.error('路由跳转失败:', error);
    ElMessage.error('页面跳转失败，请刷新重试');
  }
};

const loadRiskRecords = async () => {
 try {
 const res = await riskApi.getRiskRecords(page.value, pageSize.value);
 if (res.code === 200) {
 riskRecords.value = res.data.list;
 total.value = res.data.total;
 }
 }
 catch (error: any) {
 ElMessage.error(error.message || '获取风险记录失败');
 }
};
const getRiskLevelLabel = (level: number) => {
 switch (level) {
 case 1: return { label: '低风险', class: 'bg-green-100 text-green-600' };
 case 2: return { label: '中风险', class: 'bg-yellow-100 text-yellow-600' };
 case 3: return { label: '高风险', class: 'bg-red-100 text-red-600' };
 default: return { label: '未知', class: 'bg-gray-100 text-gray-600' };
 }
};
const handleLogout = async () => {
 try {
 await adminStore.logout();
 ElMessage.success('退出成功');
 router.push('/login');
 }
 catch (error: any) {
 ElMessage.error(error.message || '退出失败');
 }
};
const handlePageChange = (newPage: number) => {
 page.value = newPage;
 loadRiskRecords();
};
const handlePageSizeChange = (newSize: number) => {
 pageSize.value = newSize;
 page.value = 1;
 loadRiskRecords();
};
onMounted(() => {
 loadRiskRecords();
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
                @click="handleMenuClick(item)"
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
            <h2 class="text-2xl font-bold text-gray-800">风险监控</h2>
            <p class="text-gray-500 mt-1">监控用户风险行为</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">低风险</p>
                <p class="text-3xl font-bold text-green-600 mt-2">{{ riskRecords.filter(r => r.riskLevel === 1).length }}</p>
              </div>
              <div class="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <span class="text-green-600 text-2xl">✅</span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">中风险</p>
                <p class="text-3xl font-bold text-yellow-600 mt-2">{{ riskRecords.filter(r => r.riskLevel === 2).length }}</p>
              </div>
              <div class="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
                <span class="text-yellow-600 text-2xl">⚠️</span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">高风险</p>
                <p class="text-3xl font-bold text-red-600 mt-2">{{ riskRecords.filter(r => r.riskLevel === 3).length }}</p>
              </div>
              <div class="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
                <span class="text-red-600 text-2xl">🚨</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm">
          <ElTable :data="riskRecords" border class="w-full">
            <ElTableColumn prop="id" label="ID" width="80" />
            <ElTableColumn prop="userName" label="用户" width="120" />
            <ElTableColumn prop="content" label="风险内容" />
            <ElTableColumn prop="riskType" label="风险类型" width="120" />
            <ElTableColumn prop="riskLevel" label="风险等级">
              <template #default="scope">
                <span :class="['px-2 py-1 rounded-full text-sm', getRiskLevelLabel(scope.row.riskLevel).class]">
                  {{ getRiskLevelLabel(scope.row.riskLevel).label }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createdAt" label="时间">
              <template #default="scope">
                {{ new Date(scope.row.createdAt).toLocaleString('zh-CN') }}
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="p-4 flex justify-end">
            <ElPagination
              :total="total"
              :page-size="pageSize"
              :current-page="page"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>