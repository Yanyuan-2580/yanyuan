<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { knowledgeApi } from '@/api';
import type { KnowledgeArticle, KnowledgeCategory } from '@/types';
import type { CreateArticleData } from '@/api/modules/knowledge';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';

const articles = ref<KnowledgeArticle[]>([]);
const categories = ref<KnowledgeCategory[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');
const filterStatus = ref<number | undefined>(undefined);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showCategoryDialog = ref(false);
const editArticle = ref<KnowledgeArticle | null>(null);
const newCategoryName = ref('');
const newCategoryDesc = ref('');
const form = ref<CreateArticleData>({
  title: '',
  content: '',
  coverUrl: '',
  categoryId: 0,
  tags: [],
  authorId: 1
});

const loadArticles = async () => {
  try {
    const res = await knowledgeApi.getArticles(page.value, pageSize.value, filterStatus.value, searchKeyword.value || undefined);
    if (res.code === 200) {
      articles.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文章列表失败');
  }
};

const loadCategories = async () => {
  try {
    const res = await knowledgeApi.getCategories();
    if (res.code === 200) {
      categories.value = res.data;
    }
  } catch (e) {
    console.error('获取分类失败:', e);
  }
};

const openCreateDialog = () => {
  form.value = { title: '', content: '', coverUrl: '', categoryId: categories.value[0]?.id || 0, tags: [], authorId: 1 };
  showEditDialog.value = false;
  showCreateDialog.value = true;
};

const openEditDialog = (article: KnowledgeArticle) => {
  editArticle.value = article;
  form.value = {
    title: article.title,
    content: article.content,
    coverUrl: article.coverUrl || '',
    categoryId: article.categoryId,
    tags: article.tags || [],
    authorId: article.authorId
  };
  showCreateDialog.value = false;
  showEditDialog.value = true;
};

const saveArticle = async () => {
  try {
    if (showEditDialog.value && editArticle.value) {
      await knowledgeApi.updateArticle(editArticle.value.id, form.value);
      ElMessage.success('修改成功');
    } else {
      await knowledgeApi.createArticle(form.value);
      ElMessage.success('创建成功');
    }
    showCreateDialog.value = false;
    showEditDialog.value = false;
    loadArticles();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const deleteArticle = async (id: number) => {
  if (!confirm('确定删除此文章？')) return;
  try {
    await knowledgeApi.deleteArticle(id);
    ElMessage.success('删除成功');
    loadArticles();
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
};

const toggleStatus = async (article: KnowledgeArticle) => {
  const newStatus = article.status === 2 ? 1 : 2; // toggle between published and draft
  try {
    await knowledgeApi.updateArticleStatus(article.id, newStatus);
    ElMessage.success(newStatus === 2 ? '已发布' : '已下架');
    loadArticles();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }
  try {
    const res = await knowledgeApi.createCategory({ name: newCategoryName.value.trim(), description: newCategoryDesc.value.trim() });
    if (res.code === 200) {
      ElMessage.success('分类创建成功');
      newCategoryName.value = '';
      newCategoryDesc.value = '';
      await loadCategories();
    }
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || '创建失败';
    ElMessage.error(msg);
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('确定删除此分类？')) return;
  try {
    await knowledgeApi.deleteCategory(id);
    ElMessage.success('删除成功');
    loadCategories();
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
};

const handleSearch = () => {
  page.value = 1;
  loadArticles();
};

onMounted(() => {
  loadArticles();
  loadCategories();
});
</script>

<template>
  <AdminLayout active-menu="articles">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">文章管理</h2>
        <p class="text-gray-500 mt-1">管理知识库文章</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50" @click="showCategoryDialog = true">
          管理分类
        </button>
        <button class="btn-primary px-4 py-2 rounded-lg" @click="openCreateDialog">
          + 新建文章
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索标题或内容..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
        @keyup.enter="handleSearch"
      />
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部状态</option>
        <option :value="2">已发布</option>
        <option :value="1">待审核</option>
        <option :value="0">草稿</option>
        <option :value="3">已下线</option>
      </select>
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="handleSearch">搜索</button>
    </div>

    <!-- Articles Table -->
    <div class="bg-white rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-16">ID</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">标题</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-24">分类</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-20">状态</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-24">浏览量</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-32">创建时间</th>
            <th class="text-right p-4 text-sm font-medium text-gray-500 w-48">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="p-4 text-sm text-gray-600">{{ article.id }}</td>
            <td class="p-4 text-sm text-gray-800 max-w-xs truncate">{{ article.title }}</td>
            <td class="p-4 text-sm text-gray-500">{{ article.category?.name || '-' }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs',
                article.status === 2 ? 'bg-green-100 text-green-600' :
                article.status === 1 ? 'bg-yellow-100 text-yellow-600' :
                article.status === 0 ? 'bg-gray-100 text-gray-600' :
                'bg-red-100 text-red-600'
              ]">
                {{ article.status === 2 ? '已发布' : article.status === 1 ? '待审' : article.status === 0 ? '草稿' : '已下线' }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-500">{{ article.viewCount || 0 }}</td>
            <td class="p-4 text-sm text-gray-500">{{ new Date(article.createdAt).toLocaleDateString('zh-CN') }}</td>
            <td class="p-4 text-right">
              <button class="text-sm text-green-500 hover:underline mr-2" :class="{ 'text-gray-400': article.status === 2 }" @click="toggleStatus(article)">
                {{ article.status === 2 ? '下架' : '发布' }}
              </button>
              <button class="text-sm text-blue-500 hover:underline mr-2" @click="openEditDialog(article)">编辑</button>
              <button class="text-sm text-red-500 hover:underline" @click="deleteArticle(article.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="p-4 flex justify-between items-center">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button v-for="p in Math.min(Math.ceil(total / pageSize), 10)" :key="p"
            class="w-8 h-8 rounded-lg text-sm"
            :class="page === p ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="page = p; loadArticles()"
          >{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <el-dialog title="新建文章" v-model="showCreateDialog" width="700px">
      <div class="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
          <el-input v-model="form.title" placeholder="文章标题" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <el-select v-model="form.categoryId" class="w-full">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">封面图URL</label>
            <el-input v-model="form.coverUrl" placeholder="可选" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
          <MarkdownEditor v-model="form.content" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog title="编辑文章" v-model="showEditDialog" width="700px">
      <div class="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
          <el-input v-model="form.title" placeholder="文章标题" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <el-select v-model="form.categoryId" class="w-full">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">封面图URL</label>
            <el-input v-model="form.coverUrl" placeholder="可选" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
          <MarkdownEditor v-model="form.content" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>

    <!-- Category Management Dialog -->
    <el-dialog title="管理分类" v-model="showCategoryDialog" width="500px">
      <div class="space-y-4">
        <div class="flex gap-2">
          <el-input v-model="newCategoryName" placeholder="分类名称" />
          <el-input v-model="newCategoryDesc" placeholder="描述（可选）" />
          <el-button type="primary" @click="createCategory">添加</el-button>
        </div>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <span class="text-sm text-gray-800">{{ cat.name }}</span>
              <span v-if="cat.description" class="text-xs text-gray-400 ml-2">{{ cat.description }}</span>
            </div>
            <button class="text-xs text-red-500 hover:underline" @click="deleteCategory(cat.id)">删除</button>
          </div>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>
