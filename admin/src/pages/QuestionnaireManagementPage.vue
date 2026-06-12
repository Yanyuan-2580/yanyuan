<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { questionnaireApi } from '@/api';
import type { AdminQuestionnaire } from '@/api/modules/questionnaire';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const questionnaires = ref<AdminQuestionnaire[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新建问卷');
const formData = ref<Partial<AdminQuestionnaire>>({
  title: '',
  description: '',
  category: 'general',
  questions: [],
  scoringRules: { ranges: [] },
  status: 1,
});
const editingId = ref<number | null>(null);
const jsonEditorContent = ref('');

const loadList = async () => {
  try {
    const res = await questionnaireApi.getList();
    if (res.code === 200) {
      questionnaires.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取问卷列表失败');
  }
};

const openCreateDialog = () => {
  dialogTitle.value = '新建问卷';
  editingId.value = null;
  formData.value = {
    title: '',
    description: '',
    category: 'general',
    questions: [],
    scoringRules: { ranges: [] },
    status: 1,
  };
  jsonEditorContent.value = JSON.stringify(formData.value.questions, null, 2);
  dialogVisible.value = true;
};

const openEditDialog = async (row: AdminQuestionnaire) => {
  dialogTitle.value = '编辑问卷';
  editingId.value = row.id;
  try {
    const res = await questionnaireApi.getDetail(row.id);
    if (res.code === 200) {
      formData.value = { ...res.data };
      jsonEditorContent.value = JSON.stringify(res.data.questions, null, 2);
    }
  } catch {
    formData.value = { ...row };
    jsonEditorContent.value = JSON.stringify(row.questions, null, 2);
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  try {
    // Parse JSON questions if edited
    try {
      formData.value.questions = JSON.parse(jsonEditorContent.value);
    } catch {
      ElMessage.error('题目 JSON 格式不正确');
      return;
    }

    if (editingId.value) {
      await questionnaireApi.update(editingId.value, formData.value);
      ElMessage.success('更新成功');
    } else {
      await questionnaireApi.create(formData.value);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadList();
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

const handleDelete = async (row: AdminQuestionnaire) => {
  try {
    await ElMessageBox.confirm(`确定要删除问卷「${row.title}」吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
    await questionnaireApi.delete(row.id);
    ElMessage.success('已删除');
    loadList();
  } catch {
    // cancelled
  }
};

const getStatusLabel = (status: number) => {
  return status === 1
    ? { label: '已发布', class: 'bg-green-100 text-green-600' }
    : { label: '已下架', class: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
};

onMounted(() => loadList());
</script>

<template>
  <AdminLayout active-menu="questionnaires">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">问卷管理</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">创建和管理心理测评问卷</p>
      </div>
      <button
        class="px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm"
        @click="openCreateDialog"
      >
        + 新建问卷
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <el-table :data="questionnaires" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="题目数" width="100">
          <template #default="{ row }">{{ row.questions?.length || 0 }} 题</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusLabel(row.status).class">
              {{ getStatusLabel(row.status).label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <button class="text-primary-500 hover:text-primary-700 mr-3 text-sm" @click="openEditDialog(row)">
              编辑
            </button>
            <button class="text-red-500 hover:text-red-700 text-sm" @click="handleDelete(row)">删除</button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="formData.title"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="问卷标题"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            v-model="formData.description"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="问卷描述"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              v-model="formData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="anxiety">焦虑评估</option>
              <option value="depression">抑郁评估</option>
              <option value="stress">压力评估</option>
              <option value="sleep">睡眠评估</option>
              <option value="general">通用评估</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option :value="1">已发布</option>
              <option :value="0">已下架</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            题目 JSON
            <span class="text-gray-400 font-normal">（格式: [{ "id": 1, "text": "...", "options": [{"value": 0, "label": "...", "score": 0}] }]）</span>
          </label>
          <textarea
            v-model="jsonEditorContent"
            rows="12"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500"
            placeholder="在此编辑题目 JSON..."
          />
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-3" @click="dialogVisible = false">
          取消
        </button>
        <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600" @click="handleSave">
          保存
        </button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>
