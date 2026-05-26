<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { userApi } from '@/api';
import type { User } from '@/types';
import { ElMessage, ElTable, ElTableColumn, ElPagination, ElButton, ElDialog, ElInput, ElSelect } from 'element-plus';
const router = useRouter();
const adminStore = useAdminStore();
const users = ref<User[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const activeMenu = ref('users');
const showEditDialog = ref(false);
const editUser = ref<User | null>(null);
const editForm = ref({
 nickname: '',
 status: 1
});
const menuItems = [
 { name: 'dashboard', label: '数据概览', icon: '📊', path: '/' },
 { name: 'users', label: '用户管理', icon: '👥', path: '/users' },
 { name: 'articles', label: '文章管理', icon: '📝', path: '/articles' },
 { name: 'risk', label: '风险监控', icon: '🛡️', path: '/risk' }
];
const loadUsers = async () => {
 try {
 const res = await userApi.getUsers(page.value, pageSize.value);
 if (res.code === 200) {
 users.value = res.data.list;
 total.value = res.data.total;
 }
 }
 catch (error: any) {
 ElMessage.error(error.message || '获取用户列表失败');
 }
};
const openEditDialog = (user: User) => {
 editUser.value = user;
 editForm.value = {
 nickname: user.nickname,
 status: user.status
 };
 showEditDialog.value = true;
};
const saveUser = async () => {
 if (!editUser.value)
 return;
 try {
 await userApi.updateUser(editUser.value.id, editForm.value);
 ElMessage.success('修改成功');
 showEditDialog.value = false;
 loadUsers();
 }
 catch (error: any) {
 ElMessage.error(error.message || '修改失败');
 }
};
const deleteUser = async (id: number) => {
 if (!confirm('确定要删除该用户吗？'))
 return;
 try {
 await userApi.deleteUser(id);
 ElMessage.success('删除成功');
 loadUsers();
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
 loadUsers();
};
const handlePageSizeChange = (newSize: number) => {
 pageSize.value = newSize;
 page.value = 1;
 loadUsers();
};
onMounted(() => {
 loadUsers();
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
            <h2 class="text-2xl font-bold text-gray-800">用户管理</h2>
            <p class="text-gray-500 mt-1">管理平台用户</p>
          </div>
        </header>

        <div class="bg-white rounded-2xl shadow-sm">
          <ElTable :data="users" border class="w-full">
            <ElTableColumn prop="id" label="ID" width="80" />
            <ElTableColumn prop="phone" label="手机号" />
            <ElTableColumn prop="nickname" label="昵称" />
            <ElTableColumn prop="status" label="状态">
              <template #default="scope">
                <span :class="scope.row.status === 1 ? 'px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm' : 'px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm'">
                  {{ scope.row.status === 1 ? '正常' : '禁用' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createdAt" label="注册时间">
              <template #default="scope">
                {{ new Date(scope.row.createdAt).toLocaleString('zh-CN') }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="180">
              <template #default="scope">
                <ElButton size="small" @click="openEditDialog(scope.row)">编辑</ElButton>
                <ElButton size="small" type="danger" @click="deleteUser(scope.row.id)">删除</ElButton>
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

        <ElDialog title="编辑用户" v-model="showEditDialog">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <ElInput v-model="editForm.nickname" placeholder="请输入昵称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <ElSelect v-model="editForm.status">
                <ElSelectOption :label="'\u6B63\u5E38'" :value="1" />
                <ElSelectOption :label="'\u7981\u7528'" :value="0" />
              </ElSelect>
            </div>
          </div>
          <template #footer>
            <ElButton @click="showEditDialog = false">取消</ElButton>
            <ElButton type="primary" @click="saveUser">保存</ElButton>
          </template>
        </ElDialog>
      </main>
    </div>
  </div>
</template>