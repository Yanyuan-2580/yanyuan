<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { diaryApi } from '@/api';
import type { AdminDiary } from '@/api/modules/diary';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const diaries = ref<AdminDiary[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const loadDiaries = async () => {
  try {
    const res = await diaryApi.getDiaries(page.value, pageSize.value);
    if (res.code === 200) {
      diaries.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取日记列表失败');
  }
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadDiaries();
};

const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN');

const moodEmoji = (score: number) => {
  if (score >= 4) return '😊';
  if (score >= 3) return '😐';
  return '😢';
};

onMounted(() => loadDiaries());
</script>

<template>
  <AdminLayout active-menu="diaries">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">日记管理</h2>
        <p class="text-gray-500 mt-1">查看用户的情绪日记记录</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <el-table :data="diaries" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="心情" width="80">
          <template #default="{ row }">
            <span class="text-2xl">{{ moodEmoji(row.moodScore) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="moodScore" label="评分" width="80" />
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <span
              v-for="tag in row.moodTags"
              :key="tag"
              class="inline-block px-2 py-1 mr-1 rounded-full text-xs bg-primary-50 text-primary-600"
            >{{ tag }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="250">
          <template #default="{ row }">
            <span class="text-gray-600 text-sm">{{ row.content?.substring(0, 100) }}{{ row.content?.length > 100 ? '...' : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="公开" width="80">
          <template #default="{ row }">
            <span :class="row.isPublic ? 'text-green-500' : 'text-gray-400'">{{ row.isPublic ? '是' : '否' }}</span>
          </template>
        </el-table-column>
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
