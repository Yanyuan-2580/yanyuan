<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { meditationApi } from '@/api';
import type { AdminMeditation } from '@/api/modules/meditation';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const meditations = ref<AdminMeditation[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新建课程');
const formData = ref<Partial<AdminMeditation>>({
  title: '',
  description: '',
  category: 'breathing',
  duration: 5,
  audioUrl: '',
  coverImage: '',
  status: 1,
});
const editingId = ref<number | null>(null);

const loadList = async () => {
  try {
    const res = await meditationApi.getList();
    if (res.code === 200) {
      meditations.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取课程列表失败');
  }
};

const openCreateDialog = () => {
  dialogTitle.value = '新建冥想课程';
  editingId.value = null;
  formData.value = {
    title: '',
    description: '',
    category: 'breathing',
    duration: 5,
    audioUrl: '',
    coverImage: '',
    status: 1,
  };
  dialogVisible.value = true;
};

const openEditDialog = async (row: AdminMeditation) => {
  dialogTitle.value = '编辑冥想课程';
  editingId.value = row.id;
  try {
    const res = await meditationApi.getDetail(row.id);
    if (res.code === 200) {
      formData.value = { ...res.data };
    }
  } catch {
    formData.value = { ...row };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  try {
    if (!formData.value.title?.trim()) {
      ElMessage.warning('请输入课程标题');
      return;
    }
    if (editingId.value) {
      await meditationApi.update(editingId.value, formData.value);
      ElMessage.success('更新成功');
    } else {
      await meditationApi.create(formData.value);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadList();
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

const handleDelete = async (row: AdminMeditation) => {
  try {
    await ElMessageBox.confirm(`确定要删除课程「${row.title}」吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
    await meditationApi.delete(row.id);
    ElMessage.success('已删除');
    loadList();
  } catch {
    // cancelled
  }
};

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    breathing: '呼吸练习',
    body_scan: '身体扫描',
    mindfulness: '正念冥想',
    sleep: '助眠冥想',
    relaxation: '放松训练',
  };
  return map[cat] || cat;
};

onMounted(() => loadList());
</script>

<template>
  <AdminLayout active-menu="meditations">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">冥想管理</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理冥想课程内容</p>
      </div>
      <button
        class="px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm"
        @click="openCreateDialog"
      >
        + 新建课程
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <el-table :data="meditations" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">{{ getCategoryLabel(row.category) }}</template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="{ row }">{{ row.duration }} 分钟</template>
        </el-table-column>
        <el-table-column prop="playCount" label="播放次数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="row.status === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            >{{ row.status === 1 ? '已发布' : '已下架' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <button class="text-primary-500 hover:text-primary-700 mr-3 text-sm" @click="openEditDialog(row)">编辑</button>
            <button class="text-red-500 hover:text-red-700 text-sm" @click="handleDelete(row)">删除</button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="formData.title"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="课程标题"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="课程描述"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select v-model="formData.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="breathing">呼吸练习</option>
              <option value="body_scan">身体扫描</option>
              <option value="mindfulness">正念冥想</option>
              <option value="sleep">助眠冥想</option>
              <option value="relaxation">放松训练</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">时长（分钟）</label>
            <input v-model.number="formData.duration" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">音频URL</label>
          <input v-model="formData.audioUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">封面图片URL</label>
          <input v-model="formData.coverImage" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-3" @click="dialogVisible = false">取消</button>
        <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600" @click="handleSave">保存</button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>
