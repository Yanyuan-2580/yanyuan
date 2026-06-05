<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { adminApi } from '@/api';
import type { DashboardOverview, WeeklyTrend, HourlyHeatmap, WeeklyDistribution, MoodDistribution } from '@/types';
import AdminLayout from '@/components/AdminLayout.vue';
import { SvgLineChart, SvgDonutChart, HeatmapChart, WeeklyDistribution as WeeklyDistChart } from '@/components/charts';
import { Users, Activity, BookOpen, TriangleAlert } from 'lucide-vue-next';

const overview = ref<DashboardOverview | null>(null);
const weeklyTrend = ref<WeeklyTrend | null>(null);
const hourlyHeatmap = ref<HourlyHeatmap | null>(null);
const weeklyDistribution = ref<WeeklyDistribution | null>(null);
const moodDistribution = ref<MoodDistribution | null>(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    const [overviewRes, trendRes, heatmapRes, weeklyDistRes, moodDistRes] = await Promise.all([
      adminApi.getDashboardOverview(),
      adminApi.getWeeklyTrend(),
      adminApi.getHourlyHeatmap(),
      adminApi.getWeeklyDistribution(),
      adminApi.getMoodDistribution(),
    ]);
    if (overviewRes.code === 200) overview.value = overviewRes.data;
    if (trendRes.code === 200) weeklyTrend.value = trendRes.data;
    if (heatmapRes.code === 200) hourlyHeatmap.value = heatmapRes.data;
    if (weeklyDistRes.code === 200) weeklyDistribution.value = weeklyDistRes.data;
    if (moodDistRes.code === 200) moodDistribution.value = moodDistRes.data;
  } catch (e: any) {
    console.error('API load failed:', e.message);
  } finally {
    loading.value = false;
  }
});

const moodSegments = computed(() => {
  if (!moodDistribution.value) return [];
  const dist = moodDistribution.value.moodTypeDistribution;
  return [
    { label: '愉快', value: dist.happy, color: '#10b981' },
    { label: '平静', value: dist.calm, color: '#3b82f6' },
    { label: '悲伤', value: dist.sad, color: '#f59e0b' },
    { label: '焦虑', value: dist.anxious, color: '#ef4444' },
    { label: '愤怒', value: dist.angry, color: '#ec4899' },
  ].filter(s => s.value > 0);
});

const dailyActivity = computed(() => {
  if (!weeklyTrend.value?.trends) return [];
  return weeklyTrend.value.trends.map(t => ({
    label: t.day,
    value: t.sessions + t.diaries,
  }));
});

const weeklyBarSeries = computed(() => {
  if (!weeklyTrend.value?.trends) return { labels: [] as string[], datasets: [] as any[] };
  return {
    labels: weeklyTrend.value.trends.map(t => t.day),
    datasets: [
      { label: '新用户', color: '#3b82f6', data: weeklyTrend.value.trends.map(t => t.newUsers) },
      { label: '会话', color: '#8b5cf6', data: weeklyTrend.value.trends.map(t => t.sessions) },
      { label: '日记', color: '#10b981', data: weeklyTrend.value.trends.map(t => t.diaries) },
    ],
  };
});
</script>

<template>
  <AdminLayout active-menu="dashboard">
    <header class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">数据概览</h2>
        <p class="text-gray-500 mt-1 text-sm">{{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </header>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-400 text-sm">总用户数</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ loading ? '-' : (overview?.totalUsers ?? 0).toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">本周新增 {{ overview?.newUsersThisWeek ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Users class="text-white" :size="22" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-400 text-sm">活跃用户</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ loading ? '-' : (overview?.activeUsers ?? 0).toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">活跃率 {{ overview?.engagementRate ?? 0 }}%</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <Activity class="text-white" :size="22" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-400 text-sm">日记总数</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ loading ? '-' : (overview?.totalDiaries ?? 0).toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">今日 {{ overview?.todayDiaries ?? 0 }} 篇</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <BookOpen class="text-white" :size="22" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-400 text-sm">风险预警</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ loading ? '-' : (overview?.riskCount ?? 0).toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ overview?.highRiskUsers ?? 0 }} 用户 · {{ overview?.highRiskSessions ?? 0 }} 会话</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <TriangleAlert class="text-white" :size="22" />
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: LineChart + DonutChart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
        <SvgLineChart
          title="七日活跃趋势"
          subtitle="每日 AI 会话 + 日记总活动量"
          :data="dailyActivity"
          :loading="loading"
          line-color="#3b82f6"
          :height="260"
        />
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <SvgDonutChart
          v-if="moodSegments.length > 0"
          :segments="moodSegments"
          :size="180"
          :thickness="36"
          :center-value="overview?.averageMoodScore?.toFixed(1) ?? '-'"
          center-label="平均分"
          :center-sub-label="`${moodDistribution?.totalResponses ?? 0} 条记录`"
          :show-legend="true"
          :loading="loading"
        />
        <div v-else-if="loading" class="flex items-center justify-center h-64">
          <div class="w-44 h-44 bg-gray-100 animate-pulse rounded-full" />
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-400 text-sm">
          暂无心情数据
        </div>
      </div>
    </div>

    <!-- Row 3: Weekly Bar Chart + Risk Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
        <WeeklyDistChart
          v-if="weeklyBarSeries.labels.length > 0"
          title="本周数据概览"
          subtitle="每日新用户 / 会话 / 日记独立计数"
          :labels="weeklyBarSeries.labels"
          :datasets="weeklyBarSeries.datasets"
          :loading="loading"
        />
        <div v-else class="flex items-center justify-center h-72 text-gray-400 text-sm">暂无趋势数据</div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">风险等级分布</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1.5">
              <span class="text-gray-500">低风险</span>
              <span class="text-gray-700 font-medium">{{ moodDistribution ? moodDistribution.riskLevelDistribution.low : (overview ? Math.max((overview.totalUsers - overview.riskCount), 0) : 0) }}</span>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-400 rounded-full transition-all duration-700" :style="{ width: overview?.totalUsers ? Math.max(((overview.totalUsers - overview.riskCount) / overview.totalUsers) * 100, 3) + '%' : '0%' }" />
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1.5">
              <span class="text-gray-500">中风险</span>
              <span class="text-gray-700 font-medium">{{ moodDistribution?.riskLevelDistribution.medium ?? 0 }}</span>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-yellow-400 rounded-full transition-all duration-700" :style="{ width: overview?.totalUsers ? Math.max(((moodDistribution?.riskLevelDistribution.medium ?? 0) / overview.totalUsers) * 100, 3) + '%' : '0%' }" />
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1.5">
              <span class="text-gray-500">高风险</span>
              <span class="text-gray-700 font-medium">{{ moodDistribution ? moodDistribution.riskLevelDistribution.high : (overview?.highRiskUsers ?? 0) }}</span>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-red-400 rounded-full transition-all duration-700" :style="{ width: overview?.totalUsers ? Math.max(((moodDistribution?.riskLevelDistribution.high ?? overview?.highRiskUsers ?? 0) / overview.totalUsers) * 100, 3) + '%' : '0%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Heatmap -->
    <div class="mb-6">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <HeatmapChart
          title="24小时活跃热力图"
          subtitle="最近 7 天活动时段分布"
          :data="hourlyHeatmap?.data ?? Array.from({ length: 7 }, () => new Array(24).fill(0))"
          :days="hourlyHeatmap?.days ?? []"
          :hours="hourlyHeatmap?.hours ?? []"
          :max-value="hourlyHeatmap?.maxValue ?? 1"
          :loading="loading"
        />
      </div>
    </div>
  </AdminLayout>
</template>
