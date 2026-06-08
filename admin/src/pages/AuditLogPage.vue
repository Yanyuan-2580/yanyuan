<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { get } from '@/api/request';
import type { ApiResponse, PageResult } from '@/types';
import AdminLayout from '@/components/AdminLayout.vue';

interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  targetType: string;
  targetId: number;
  detail: any;
  ip: string;
  createdAt: string;
}

const logs = ref<AuditLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterAction = ref('');

const loadLogs = async () => {
  try {
    const res = await get('/admin/audit-logs', {
      page: page.value,
      pageSize: pageSize.value,
      action: filterAction.value || undefined
    }) as any;
    if (res?.code === 200 && res.data) {
      logs.value = res.data.list || [];
      total.value = res.data.total || 0;
    }
  } catch (e) { console.error(e); }
};

onMounted(loadLogs);
</script>

<template>
  <AdminLayout active-menu="">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800">审计日志</h2>
      <p class="text-gray-500 mt-1">管理员操作记录</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 flex gap-4 items-center">
      <select v-model="filterAction" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="page=1;loadLogs()">
        <option value="">全部操作</option>
        <option value="createUser">创建用户</option>
        <option value="updateUserStatus">修改状态</option>
        <option value="deleteUser">删除用户</option>
        <option value="createArticle">创建文章</option>
        <option value="resolveRisk">处理风险</option>
      </select>
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="page=1;loadLogs()">查询</button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm text-gray-500 w-16">序号</th>
            <th class="text-left p-4 text-sm text-gray-500">管理员</th>
            <th class="text-left p-4 text-sm text-gray-500">操作</th>
            <th class="text-left p-4 text-sm text-gray-500">目标类型</th>
            <th class="text-left p-4 text-sm text-gray-500">目标ID</th>
            <th class="text-left p-4 text-sm text-gray-500">IP</th>
            <th class="text-left p-4 text-sm text-gray-500">时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, idx) in logs" :key="log.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="p-4 text-sm text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-4 text-sm text-gray-800">{{ log.adminId }}</td>
            <td class="p-4"><span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{{ log.action }}</span></td>
            <td class="p-4 text-sm text-gray-500">{{ log.targetType }}</td>
            <td class="p-4 text-sm text-gray-600">{{ log.targetId }}</td>
            <td class="p-4 text-sm text-gray-500">{{ log.ip }}</td>
            <td class="p-4 text-sm text-gray-500">{{ new Date(log.createdAt).toLocaleString('zh-CN') }}</td>
          </tr>
        </tbody>
      </table>
      <div class="p-4 flex justify-between">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button v-for="p in Math.min(Math.ceil(total/pageSize), 10)" :key="p"
            class="w-8 h-8 rounded-lg text-sm"
            :class="page===p?'bg-primary-500 text-white':'bg-gray-100 text-gray-600'"
            @click="page=p;loadLogs()">{{ p }}</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
