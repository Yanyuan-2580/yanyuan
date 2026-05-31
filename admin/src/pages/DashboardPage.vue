<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api';
import type { Statistics } from '@/types';
import type { WeeklyTrend } from '@/api/modules/admin';
import AdminLayout from '@/components/AdminLayout.vue';
import { ElMessage } from 'element-plus';

const statistics = ref<Statistics | null>(null);
const weeklyTrend = ref<WeeklyTrend | null>(null);

const statCards = [
  { key: 'totalUsers', label: '总用户数', color: 'bg-blue-500', icon: '👥' },
  { key: 'activeUsers', label: '活跃用户', color: 'bg-green-500', icon: '✅' },
  { key: 'totalDiaries', label: '日记总数', color: 'bg-purple-500', icon: '📔' },
  { key: 'riskCount', label: '风险预警', color: 'bg-red-500', icon: '⚠️' }
];

const loadData = async () => {
  try {
    const [statsRes, trendRes] = await Promise.all([
      adminApi.getStatistics(),
      adminApi.getWeeklyTrend()
    ]);
    if (statsRes.code === 200) {
      statistics.value = statsRes.data;
    }
    if (trendRes.code === 200) {
      weeklyTrend.value = trendRes.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败');
  }
};

const getStatValue = (key: string): number => {
  if (!statistics.value) return 0;
  return (statistics.value as any)[key] || 0;
};

const getMaxTrendValue = (): number => {
  if (!weeklyTrend.value?.trends) return 1;
  const trends = weeklyTrend.value.trends;
  return Math.max(
    ...trends.map(t => Math.max(t.newUsers, t.sessions, t.diaries)),
    1
  );
};

onMounted(loadData);
</script>

<template>
  <AdminLayout active-menu="dashboard">
    <header class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">数据概览</h2>
        <p class="text-gray-500 mt-1">{{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in statCards" :key="stat.key" class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ getStatValue(stat.key) }}</p>
          </div>
          <div :class="['w-14 h-14 rounded-xl flex items-center justify-center', stat.color]">
            <span class="text-white text-2xl">{{ stat.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Weekly Trend -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">本周数据趋势</h3>
        <div class="h-64">
          <div v-if="weeklyTrend?.trends" class="h-full flex items-end justify-around gap-2">
            <div
              v-for="item in weeklyTrend.trends"
              :key="item.day"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="w-full flex flex-col items-center gap-0.5" style="height: 85%">
                <div
                  class="w-5 rounded-t transition-all"
                  :style="{ height: Math.max((item.newUsers / getMaxTrendValue()) * 90, 2) + '%' }"
                  :title="`新用户: ${item.newUsers}`"
                  style="background: linear-gradient(to top, #3b82f6, #93c5fd)"
                ></div>
                <div
                  class="w-5 rounded-t transition-all"
                  :style="{ height: Math.max((item.sessions / getMaxTrendValue()) * 90, 2) + '%' }"
                  :title="`会话: ${item.sessions}`"
                  style="background: linear-gradient(to top, #8b5cf6, #c4b5fd)"
                ></div>
                <div
                  class="w-5 rounded-t transition-all"
                  :style="{ height: Math.max((item.diaries / getMaxTrendValue()) * 90, 2) + '%' }"
                  :title="`日记: ${item.diaries}`"
                  style="background: linear-gradient(to top, #10b981, #6ee7b7)"
                ></div>
              </div>
              <span class="text-xs text-gray-500 mt-1">{{ item.day }}</span>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无趋势数据
          </div>
        </div>
        <div class="flex justify-center gap-6 mt-4">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span class="w-3 h-3 rounded" style="background: #3b82f6"></span> 新用户
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span class="w-3 h-3 rounded" style="background: #8b5cf6"></span> 会话
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span class="w-3 h-3 rounded" style="background: #10b981"></span> 日记
          </div>
        </div>
      </div>

      <!-- Risk Distribution -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">风险等级分布</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">低风险</span>
              <span class="text-gray-800 font-medium">
                {{ statistics ? Math.max((statistics.totalUsers - (statistics.riskCount || 0)), 0) : 0 }}
              </span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all"
                :style="{ width: statistics?.totalUsers ? Math.max(((statistics.totalUsers - (statistics.riskCount || 0)) / statistics.totalUsers) * 100, 5) + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">高风险</span>
              <span class="text-gray-800 font-medium">{{ statistics?.highRiskUsers || 0 }}</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-red-500 rounded-full transition-all"
                :style="{ width: statistics?.totalUsers ? Math.max((statistics.highRiskUsers / statistics.totalUsers) * 100, 3) + '%' : '0%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ statistics?.todayDiaries || 0 }}</p>
              <p class="text-xs text-gray-500">今日日记</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ statistics?.todaySessions || 0 }}</p>
              <p class="text-xs text-gray-500">今日会话</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ statistics?.totalArticles || 0 }}</p>
              <p class="text-xs text-gray-500">已发布文章</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ statistics?.highRiskSessions || 0 }}</p>
              <p class="text-xs text-gray-500">高危会话</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
