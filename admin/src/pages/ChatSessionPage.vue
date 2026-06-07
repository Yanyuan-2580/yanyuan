<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { chatSessionApi } from '@/api';
import type { AdminChatSession } from '@/api/modules/chat-session';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const sessions = ref<AdminChatSession[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const filterRiskFlag = ref<number | undefined>(undefined);
const filterKeyword = ref('');

const getRiskLabel = (level: number) => {
  switch (level) {
    case 0: return { label: '正常', class: 'bg-gray-100 text-gray-600' };
    case 1: return { label: '关注', class: 'bg-yellow-100 text-yellow-600' };
    case 2: return { label: '高危', class: 'bg-red-100 text-red-600' };
    default: return { label: '未知', class: 'bg-gray-100 text-gray-600' };
  }
};

const loadSessions = async () => {
  try {
    const res = await chatSessionApi.getSessions(page.value, pageSize.value, {
      riskFlag: filterRiskFlag.value,
      keyword: filterKeyword.value || undefined,
    });
    if (res.code === 200) {
      sessions.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取会话列表失败');
  }
};

const handleSearch = () => {
  page.value = 1;
  loadSessions();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadSessions();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => loadSessions());
</script>

<template>
  <AdminLayout active-menu="chat-sessions">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">会话管理</h2>
        <p class="text-gray-500 mt-1">查看和管理用户AI对话会话</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <select
          v-model="filterRiskFlag"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @change="handleSearch"
        >
          <option :value="undefined">全部风险等级</option>
          <option :value="0">正常</option>
          <option :value="1">关注</option>
          <option :value="2">高危</option>
        </select>
        <input
          v-model="filterKeyword"
          type="text"
          placeholder="搜索会话标题..."
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @keyup.enter="handleSearch"
        />
        <button
          class="px-6 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition"
          @click="handleSearch"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <el-table :data="sessions" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="会话标题" min-width="200" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="messageCount" label="消息数" width="100" />
        <el-table-column label="风险等级" width="100">
          <template #default="{ row }">
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getRiskLabel(row.riskFlag).class">
              {{ getRiskLabel(row.riskFlag).label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="moodTag" label="情绪标签" width="100" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <div class="flex justify-between items-center p-4 border-t">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </AdminLayout>
</template>
