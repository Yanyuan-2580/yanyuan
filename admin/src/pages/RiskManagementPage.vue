<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { riskApi } from '@/api';
import type { RiskRecord } from '@/types';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const riskRecords = ref<RiskRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const filterRiskLevel = ref<number | undefined>(undefined);
const filterType = ref<string | undefined>(undefined);

const lowCount = ref(0);
const midCount = ref(0);
const highCount = ref(0);

const loadRiskRecords = async () => {
  try {
    const res = await riskApi.getRiskRecords(page.value, pageSize.value, filterRiskLevel.value, filterType.value);
    if (res.code === 200) {
      riskRecords.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取风险记录失败');
  }
};

const loadSummary = async () => {
  try {
    const [lowRes, midRes, highRes] = await Promise.all([
      riskApi.getRiskRecords(1, 1, 0),
      riskApi.getRiskRecords(1, 1, 1),
      riskApi.getRiskRecords(1, 1, 2)
    ]);
    lowCount.value = lowRes.code === 200 ? lowRes.data.total : 0;
    midCount.value = midRes.code === 200 ? midRes.data.total : 0;
    highCount.value = highRes.code === 200 ? highRes.data.total : 0;
  } catch (e) {
    // 统计计数失败不影响主列表
  }
};

const getRiskLevelLabel = (level: number) => {
  switch (level) {
    case 0: return { label: '正常', class: 'bg-gray-100 text-gray-600' };
    case 1: return { label: '关注', class: 'bg-yellow-100 text-yellow-600' };
    case 2: return { label: '高危', class: 'bg-red-100 text-red-600' };
    default: return { label: '未知', class: 'bg-gray-100 text-gray-600' };
  }
};

const resolveRecord = async (record: RiskRecord) => {
  const resolution = prompt('请输入处理备注：', '已处理');
  if (!resolution) return;
  try {
    await riskApi.resolveRiskRecord(record.type, record.id, resolution);
    ElMessage.success('已标记为已处理');
    loadRiskRecords();
    loadSummary();
  } catch (error: any) {
    ElMessage.error(error.message || '处理失败');
  }
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadRiskRecords();
};

const handleSearch = () => {
  page.value = 1;
  loadRiskRecords();
};

onMounted(() => {
  loadRiskRecords();
  loadSummary();
});
</script>

<template>
  <AdminLayout active-menu="risk">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">风险监控</h2>
        <p class="text-gray-500 mt-1">监控用户风险行为，及时介入</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">正常/低风险</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ lowCount }}</p>
          </div>
          <div class="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
            <span class="text-green-600 text-2xl">✅</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">需要关注</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ midCount }}</p>
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
            <p class="text-3xl font-bold text-red-600 mt-2">{{ highCount }}</p>
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
        <option :value="0">正常</option>
        <option :value="1">关注</option>
        <option :value="2">高危</option>
      </select>
      <select v-model="filterType" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部类型</option>
        <option value="user">用户风险</option>
        <option value="session">会话风险</option>
      </select>
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="handleSearch">筛选</button>
    </div>

    <!-- Risk Records Table -->
    <div class="bg-white rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-16">ID</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-24">类型</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">风险内容</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-24">风险等级</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-40">时间</th>
            <th class="text-right p-4 text-sm font-medium text-gray-500 w-28">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in riskRecords" :key="`${record.type}-${record.id}`" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="p-4 text-sm text-gray-600">{{ record.id }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs', record.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600']">
                {{ record.type === 'user' ? '用户' : '会话' }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-800 max-w-xs truncate">{{ record.content }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs', getRiskLevelLabel(record.riskLevel).class]">
                {{ getRiskLevelLabel(record.riskLevel).label }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-500">{{ new Date(record.createdAt).toLocaleString('zh-CN') }}</td>
            <td class="p-4 text-right">
              <button
                class="text-sm text-green-500 hover:underline"
                @click="resolveRecord(record)"
              >标记已处理</button>
            </td>
          </tr>
          <tr v-if="riskRecords.length === 0">
            <td colspan="6" class="p-12 text-center text-gray-400">
              <span class="text-4xl block mb-2">🛡️</span>
              暂无风险记录
            </td>
          </tr>
        </tbody>
      </table>
      <div class="p-4 flex justify-between items-center">
        <span class="text-sm text-gray-500">共 {{ total }} 条记录</span>
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
