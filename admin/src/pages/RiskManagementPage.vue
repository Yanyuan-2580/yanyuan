<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api';
import type { RiskRecordV2 } from '@/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const records = ref<RiskRecordV2[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const filterRiskLevel = ref<number | undefined>(undefined);
const filterSource = ref<string | undefined>(undefined);
const filterStatus = ref<string | undefined>('pending');

const stats = ref({ pendingCount: 0, highCount: 0, mediumCount: 0 });

const loadRecords = async () => {
  try {
    const res = await adminApi.getRiskRecordsV2(page.value, pageSize.value, {
      riskLevel: filterRiskLevel.value,
      source: filterSource.value,
      status: filterStatus.value,
    });
    if (res.code === 200) {
      records.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取风险记录失败');
  }
};

const loadStats = async () => {
  try {
    const res = await adminApi.getRiskRecordStats();
    if (res.code === 200) {
      stats.value = res.data;
    }
  } catch { /* 统计不影响主列表 */ }
};

const getRiskLabel = (level: number) => {
  switch (level) {
    case 1: return { label: '中危关注', cls: 'bg-yellow-100 text-yellow-700' };
    case 2: return { label: '高危预警', cls: 'bg-red-100 text-red-700' };
    default: return { label: '正常', cls: 'bg-gray-100 text-gray-600' };
  }
};

const getSourceLabel = (source: string) => {
  const map: Record<string, string> = { chat: 'AI对话', diary: '日记', comment: '评论', mood: '心情' };
  return map[source] || source;
};

const getSourceClass = (source: string) => {
  const map: Record<string, string> = {
    chat: 'bg-blue-100 text-blue-600',
    diary: 'bg-green-100 text-green-600',
    comment: 'bg-purple-100 text-purple-600',
    mood: 'bg-orange-100 text-orange-600',
  };
  return map[source] || 'bg-gray-100 text-gray-600';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: '待处理', cls: 'bg-red-50 text-red-600 border-red-200' },
    resolved: { label: '已处理', cls: 'bg-green-50 text-green-600 border-green-200' },
    false_positive: { label: '误报', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  };
  return map[status] || { label: status, cls: '' };
};

const resolveRecord = async (record: RiskRecordV2) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入处理备注', '标记已处理', {
      confirmButtonText: '确认处理',
      cancelButtonText: '取消',
      inputValue: '管理员已处理',
    });
    await adminApi.resolveRiskRecordV2(record.id, value || undefined);
    ElMessage.success('已标记为已处理');
    loadRecords();
    loadStats();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '处理失败');
    }
  }
};

const markFalsePositive = async (record: RiskRecordV2) => {
  try {
    await ElMessageBox.confirm(
      `确定将这条记录标记为误报吗？\n\n内容："${(record.content || '').slice(0, 100)}"`,
      '标记误报',
      { confirmButtonText: '确认误报', cancelButtonText: '取消', type: 'warning' }
    );
    await adminApi.markFalsePositive(record.id, '管理员标记为误报');
    ElMessage.success('已标记为误报');
    loadRecords();
    loadStats();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败');
    }
  }
};

const viewContent = (record: RiskRecordV2) => {
  ElMessageBox.alert(record.content || '(无内容)', '风险内容详情', {
    confirmButtonText: '关闭',
    customClass: 'risk-content-dialog',
  });
};

const handleSearch = () => {
  page.value = 1;
  loadRecords();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadRecords();
};

onMounted(() => {
  loadRecords();
  loadStats();
});
</script>

<template>
  <AdminLayout active-menu="risk">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">风险监控</h2>
        <p class="text-gray-500 mt-1">实时风险内容追踪，及时干预</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">待处理</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ stats.pendingCount }}</p>
          </div>
          <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
            <span class="text-2xl">📋</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">中危关注</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ stats.mediumCount }}</p>
          </div>
          <div class="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
            <span class="text-yellow-600 text-2xl">⚠️</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">高危预警</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ stats.highCount }}</p>
          </div>
          <div class="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
            <span class="text-red-600 text-2xl">🚨</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
      <select v-model="filterRiskLevel" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部风险等级</option>
        <option :value="2">高危</option>
        <option :value="1">中危</option>
      </select>
      <select v-model="filterSource" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部来源</option>
        <option value="chat">AI对话</option>
        <option value="diary">日记</option>
        <option value="comment">评论</option>
        <option value="mood">心情</option>
      </select>
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option value="pending">待处理</option>
        <option value="resolved">已处理</option>
        <option value="false_positive">误报</option>
        <option :value="undefined">全部状态</option>
      </select>
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="handleSearch">筛选</button>
    </div>

    <!-- Risk Records Table -->
    <div class="bg-white rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-16">序号</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-20">来源</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-16">用户</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">风险内容</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-20">等级</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-20">状态</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-40">时间</th>
            <th class="text-right p-4 text-sm font-medium text-gray-500 w-48">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, idx) in records" :key="record.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="p-4 text-sm text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs', getSourceClass(record.source)]">
                {{ getSourceLabel(record.source) }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-600">{{ record.userId }}</td>
            <td class="p-4">
              <div class="max-w-md">
                <p class="text-sm text-gray-800 leading-relaxed line-clamp-2">
                  {{ record.content || '(无内容)' }}
                </p>
              </div>
            </td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', getRiskLabel(record.riskLevel).cls]">
                {{ getRiskLabel(record.riskLevel).label }}
              </span>
            </td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs border', getStatusLabel(record.status).cls]">
                {{ getStatusLabel(record.status).label }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-500 whitespace-nowrap">
              {{ new Date(record.createdAt).toLocaleString('zh-CN') }}
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <button class="text-xs text-gray-500 hover:text-gray-700 underline mr-2" @click="viewContent(record)">
                查看全文
              </button>
              <template v-if="record.status === 'pending'">
                <button class="text-xs text-green-500 hover:underline mr-2" @click="resolveRecord(record)">
                  已处理
                </button>
                <button class="text-xs text-gray-400 hover:text-gray-600 underline" @click="markFalsePositive(record)">
                  误报
                </button>
              </template>
              <span v-else class="text-xs text-gray-400">
                {{ record.resolvedAt ? new Date(record.resolvedAt).toLocaleDateString('zh-CN') : '' }}
              </span>
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="8" class="p-16 text-center text-gray-400">
              <span class="text-5xl block mb-3">🛡️</span>
              <p class="text-lg">暂无风险记录</p>
              <p class="text-sm mt-1">系统运行正常，未检测到风险内容</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="p-4 flex justify-between items-center" v-if="total > 0">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button
            v-for="p in Math.min(Math.ceil(total / pageSize), 10)"
            :key="p"
            class="w-8 h-8 rounded-lg text-sm"
            :class="page === p ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="handlePageChange(p)"
          >{{ p }}</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
