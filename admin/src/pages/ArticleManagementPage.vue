<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { knowledgeApi } from '@/api';
import type { KnowledgeArticle, KnowledgeCategory } from '@/types';
import type { CreateArticleData } from '@/api/modules/knowledge';
import { ElMessage, ElTable, ElTableColumn, ElPagination, ElButton, ElDialog, ElInput, ElSelect, ElOption, ElTextarea } from 'element-plus';
const router = useRouter();
const adminStore = useAdminStore();
const articles = ref<KnowledgeArticle[]>([]);
const categories = ref<KnowledgeCategory[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const activeMenu = ref('articles');
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editArticle = ref<KnowledgeArticle | null>(null);
const form = ref<CreateArticleData>({
 title: '',
 content: '',
 summary: '',
 author: '',
 categoryId: 0,
 tags: []
});
const menuItems = [
 { name: 'dashboard', label: '数据概览', icon: '📊', path: '/' },
 { name: 'users', label: '用户管理', icon: '👥', path: '/users' },
 { name: 'articles', label: '文章管理', icon: '📝', path: '/articles' },
 { name: 'risk', label: '风险监控', icon: '🛡️', path: '/risk' }
];
const loadArticles = async () => {
 try {
 const res = await knowledgeApi.getArticles(page.value, pageSize.value);
 if (res.code === 200) {
 articles.value = res.data.list;
 total.value = res.data.total;
 }
 }
 catch (error: any) {
 ElMessage.error(error.message || '获取文章列表失败');
 }
};
const loadCategories = async () => {
 try {
 const res = await knowledgeApi.getCategories();
 if (res.code === 200) {
 categories.value = res.data;
 }
 }
 catch (error: any) {
 ElMessage.error(error.message || '获取分类失败');
 }
};
const openCreateDialog = () => {
 form.value = {
 title: '',
 content: '',
 summary: '',
 author: '',
 categoryId: 0,
 tags: []
 };
 showCreateDialog.value = true;
};
const openEditDialog = (article: KnowledgeArticle) => {
 editArticle.value = article;
 form.value = {
 title: article.title,
 content: article.content,
 summary: article.summary,
 author: article.author,
 categoryId: article.categoryId,
 tags: article.tags
 };
 showEditDialog.value = true;
};
const saveArticle = async () => {
 if (!form.value.title || !form.value.content) {
 ElMessage.error('请填写标题和内容');
 return;
 }
 try {
 if (editArticle.value) {
 await knowledgeApi.updateArticle(editArticle.value.id, form.value);
 ElMessage.success('修改成功');
 }
 else {
 await knowledgeApi.createArticle(form.value);
 ElMessage.success('创建成功');
 }
 showCreateDialog.value = false;
 showEditDialog.value = false;
 loadArticles();
 }
 catch (error: any) {
 ElMessage.error(error.message || '操作失败');
 }
};
const deleteArticle = async (id: number) => {
 if (!confirm('确定要删除该文章吗？'))
 return;
 try {
 await knowledgeApi.deleteArticle(id);
 ElMessage.success('删除成功');
 loadArticles();
 }
 catch (error: any) {
 ElMessage.error(error.message || '删除失败');
 }
};
const handleLogout = async () => {
 try {
 await adminStore.logout();
 ElMessage.success('退出成功');
 router.push('/login');
 }
 catch (error: any) {
 ElMessage.error(error.message || '退出失败');
 }
};
const handlePageChange = (newPage: number) => {
 page.value = newPage;
 loadArticles();
};
const handlePageSizeChange = (newSize: number) => {
 pageSize.value = newSize;
 page.value = 1;
 loadArticles();
};
onMounted(() => {
 loadArticles();
 loadCategories();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <aside class="w-64 bg-white shadow-md min-h-screen">
        <div class="p-6 border-b">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span class="text-white text-lg">AI</span>
            </div>
            <div>
              <h1 class="font-bold text-gray-800">管理后台</h1>
              <p class="text-xs text-gray-500">心理健康助手</p>
            </div>
          </div>
        </div>

        <nav class="p-4">
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.name">
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                :class="activeMenu === item.name ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'"
                @click="activeMenu = item.name; router.push(item.path)"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div class="absolute bottom-0 left-0 w-64 p-4 border-t">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            @click="handleLogout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 p-6">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">文章管理</h2>
            <p class="text-gray-500 mt-1">管理知识库文章</p>
          </div>
          <ElButton type="primary" @click="openCreateDialog">新增文章</ElButton>
        </header>

        <div class="bg-white rounded-2xl shadow-sm">
          <ElTable :data="articles" border class="w-full">
            <ElTableColumn prop="id" label="ID" width="80" />
            <ElTableColumn prop="title" label="标题" />
            <ElTableColumn prop="categoryName" label="分类" />
            <ElTableColumn prop="author" label="作者" width="120" />
            <ElTableColumn prop="viewCount" label="浏览量" width="100" />
            <ElTableColumn prop="likeCount" label="点赞数" width="100" />
            <ElTableColumn prop="status" label="状态">
              <template #default="scope">
                <span :class="scope.row.status === 1 ? 'px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm' : 'px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm'">
                  {{ scope.row.status === 1 ? '发布' : '草稿' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createdAt" label="创建时间">
              <template #default="scope">
                {{ new Date(scope.row.createdAt).toLocaleDateString('zh-CN') }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="180">
              <template #default="scope">
                <ElButton size="small" @click="openEditDialog(scope.row)">编辑</ElButton>
                <ElButton size="small" type="danger" @click="deleteArticle(scope.row.id)">删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="p-4 flex justify-end">
            <ElPagination
              :total="total"
              :page-size="pageSize"
              :current-page="page"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>

        <ElDialog :title="editArticle ? '编辑文章' : '新增文章'" v-model="showCreateDialog || showEditDialog" width="800px">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <ElInput v-model="form.title" placeholder="请输入标题" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <ElSelect v-model="form.categoryId" placeholder="请选择分类">
                <ElOption v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </ElSelect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">作者</label>
              <ElInput v-model="form.author" placeholder="请输入作者" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">摘要</label>
              <ElTextarea v-model="form.summary" placeholder="请输入摘要" :rows="3" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
              <ElTextarea v-model="form.content" placeholder="请输入内容" :rows="6" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
              <ElInput v-model="form.tags" placeholder="请输入标签" />
            </div>
          </div>
          <template #footer>
            <ElButton @click="showCreateDialog = false; showEditDialog = false">取消</ElButton>
            <ElButton type="primary" @click="saveArticle">保存</ElButton>
          </template>
        </ElDialog>
      </main>
    </div>
  </div>
</template>