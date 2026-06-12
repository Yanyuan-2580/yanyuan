<script setup lang="ts">
import { ref } from 'vue';
import { exportApi } from '@/api';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const exporting = ref('');

const exportTypes = [
  { key: 'users', label: '用户数据', icon: '👥', desc: '导出全部用户信息（脱敏）' },
  { key: 'diaries', label: '情绪日记', icon: '📔', desc: '导出全部日记数据' },
  { key: 'mood-records', label: '心情记录', icon: '💭', desc: '导出全部心情记录' },
  { key: 'sessions', label: '对话会话', icon: '💬', desc: '导出AI对话会话数据' },
  { key: 'statistics', label: '平台统计', icon: '📊', desc: '导出平台核心统计数据' },
];

const handleExport = async (type: string) => {
  exporting.value = type;
  try {
    await exportApi.downloadExport(type);
    ElMessage.success('导出成功');
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败');
  } finally {
    exporting.value = '';
  }
};
</script>

<template>
  <AdminLayout active-menu="export">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">数据导出</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">导出平台各类数据为 JSON 格式</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in exportTypes"
        :key="item.key"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-gray-100 dark:border-gray-700"
        @click="handleExport(item.key)"
      >
        <div class="flex items-start justify-between mb-4">
          <span class="text-3xl">{{ item.icon }}</span>
          <span
            v-if="exporting === item.key"
            class="inline-flex items-center gap-1 text-xs text-primary-500"
          >
            <span class="animate-spin">⏳</span> 导出中...
          </span>
        </div>
        <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-1">{{ item.label }}</h3>
        <p class="text-sm text-gray-500">{{ item.desc }}</p>
      </div>
    </div>
  </AdminLayout>
</template>
