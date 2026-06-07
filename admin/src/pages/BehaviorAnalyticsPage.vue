<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { behaviorApi } from '@/api';
import type { BehaviorOverview, PageViewStat, DailyActive, EventDistribution } from '@/api/modules/behavior';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const overview = ref<BehaviorOverview | null>(null);
const days = ref(7);

const loadData = async () => {
  try {
    const res = await behaviorApi.getOverview();
    if (res.code === 200) {
      overview.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取行为数据失败');
  }
};

const totalPageViews = () => {
  return overview.value?.pageViews?.reduce((sum, p) => sum + p.count, 0) || 0;
};

const maxPageViewCount = () => {
  return Math.max(...(overview.value?.pageViews?.map((p) => p.count) || [1]));
};

const maxDailyActive = () => {
  return Math.max(...(overview.value?.dailyActiveUsers?.map((d) => d.activeUsers) || [1]));
};

const totalEvents = () => {
  return overview.value?.eventDistribution?.reduce((sum, e) => sum + e.count, 0) || 0;
};

const shortenPage = (page: string) => {
  return page.replace('/api/v1', '').substring(0, 40);
};

onMounted(() => loadData());
</script>

<template>
  <AdminLayout active-menu="behavior">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">行为分析</h2>
        <p class="text-gray-500 mt-1">用户行为日志与活跃度分析</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">统计周期：</span>
        <select
          v-model="days"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          @change="loadData"
        >
          <option :value="7">近 7 天</option>
          <option :value="14">近 14 天</option>
          <option :value="30">近 30 天</option>
        </select>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          @click="loadData"
        >
          刷新
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">总页面访问</p>
        <p class="text-3xl font-bold text-primary-600 mt-2">{{ totalPageViews() }}</p>
        <p class="text-xs text-gray-400 mt-1">近 {{ days }} 天</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">总事件数</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ totalEvents() }}</p>
        <p class="text-xs text-gray-400 mt-1">所有事件类型</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">日均活跃用户</p>
        <p class="text-3xl font-bold text-orange-500 mt-2">
          {{ overview?.dailyActiveUsers?.length
            ? Math.round(overview!.dailyActiveUsers.reduce((s, d) => s + d.activeUsers, 0) / overview!.dailyActiveUsers.length)
            : 0 }}
        </p>
        <p class="text-xs text-gray-400 mt-1">近 {{ days }} 天均值</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Page Views -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">📄 页面访问排行</h3>
        <div v-if="overview?.pageViews?.length" class="space-y-3">
          <div v-for="pv in overview.pageViews.slice(0, 10)" :key="pv.page">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 truncate max-w-[250px]">{{ shortenPage(pv.page) }}</span>
              <span class="text-gray-400">{{ pv.count }}</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-400 rounded-full transition-all"
                :style="{ width: (pv.count / maxPageViewCount() * 100) + '%' }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据</p>
      </div>

      <!-- Daily Active Users -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">📈 日活跃用户趋势</h3>
        <div v-if="overview?.dailyActiveUsers?.length" class="space-y-3">
          <div v-for="dau in overview.dailyActiveUsers" :key="dau.date">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">{{ dau.date }}</span>
              <span class="text-gray-400">{{ dau.activeUsers }} 人</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-400 rounded-full transition-all"
                :style="{ width: (dau.activeUsers / maxDailyActive() * 100) + '%' }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据</p>
      </div>
    </div>

    <!-- Event Distribution -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <h3 class="font-semibold text-gray-800 mb-4">📊 事件类型分布</h3>
      <div v-if="overview?.eventDistribution?.length" class="flex flex-wrap gap-4">
        <div
          v-for="event in overview.eventDistribution"
          :key="event.eventType"
          class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
        >
          <div class="w-3 h-3 rounded-full bg-primary-400" />
          <div>
            <p class="text-sm font-medium text-gray-700">{{ shortenPage(event.eventType) }}</p>
            <p class="text-xs text-gray-500">{{ event.count }} 次</p>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据 — 用户使用后自动产生</p>
    </div>
  </AdminLayout>
</template>
