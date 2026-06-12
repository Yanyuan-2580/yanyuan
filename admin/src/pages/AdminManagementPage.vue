<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminApi } from '@/api';
import type { Admin } from '@/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const admins = ref<Admin[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');

// Current admin info from store
const currentAdmin = computed(() => {
  const stored = localStorage.getItem('admin');
  return stored ? JSON.parse(stored) as Admin : null;
});

// Create dialog
const showCreateDialog = ref(false);
const createForm = ref({
  username: '',
  password: '',
  nickname: '',
  roles: ['admin'] as string[],
});

// Edit dialog
const showEditDialog = ref(false);
const editAdmin = ref<Admin | null>(null);
const editForm = ref({
  nickname: '',
  roles: ['admin'] as string[],
  status: 1,
});

const loadAdmins = async () => {
  try {
    const res = await adminApi.getAdmins(page.value, pageSize.value, searchKeyword.value || undefined);
    if (res.code === 200) {
      admins.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取管理员列表失败');
  }
};

const handleSearch = () => {
  page.value = 1;
  loadAdmins();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadAdmins();
};

// ---- Create ----
const toggleRole = (role: string) => {
  const idx = createForm.value.roles.indexOf(role);
  if (idx >= 0) {
    if (createForm.value.roles.length <= 1) {
      ElMessage.warning('至少保留一个角色');
      return;
    }
    createForm.value.roles.splice(idx, 1);
  } else {
    createForm.value.roles.push(role);
  }
};

const createAdmin = async () => {
  if (!createForm.value.username || !createForm.value.password) {
    ElMessage.warning('请填写用户名和密码');
    return;
  }
  try {
    await adminApi.createAdmin(createForm.value);
    ElMessage.success('管理员创建成功');
    showCreateDialog.value = false;
    createForm.value = { username: '', password: '', nickname: '', roles: ['admin'] };
    loadAdmins();
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败');
  }
};

// ---- Edit ----
const openEditDialog = (admin: Admin) => {
  editAdmin.value = admin;
  editForm.value = {
    nickname: admin.nickname,
    roles: [...(admin.roles || ['admin'])],
    status: admin.status ?? 1,
  };
  showEditDialog.value = true;
};

const toggleEditRole = (role: string) => {
  const idx = editForm.value.roles.indexOf(role);
  if (idx >= 0) {
    if (editForm.value.roles.length <= 1) {
      ElMessage.warning('至少保留一个角色');
      return;
    }
    editForm.value.roles.splice(idx, 1);
  } else {
    editForm.value.roles.push(role);
  }
};

const saveAdmin = async () => {
  if (!editAdmin.value) return;
  try {
    await adminApi.updateAdmin(editAdmin.value.id, editForm.value);
    ElMessage.success('保存成功');
    showEditDialog.value = false;
    loadAdmins();
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
};

// ---- Delete ----
const deleteAdmin = async (admin: Admin) => {
  if (currentAdmin.value && admin.id === currentAdmin.value.id) {
    ElMessage.error('不能删除自己');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除管理员「${admin.nickname}」吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await adminApi.deleteAdmin(admin.id);
    ElMessage.success('删除成功');
    loadAdmins();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// ---- Role tags ----
const getRoleLabel = (role: string) => {
  const map: Record<string, string> = { admin: '管理员', superadmin: '超级管理员' };
  return map[role] || role;
};

const getRoleClass = (role: string) => {
  return role === 'superadmin'
    ? 'bg-purple-100 text-purple-600'
    : 'bg-blue-100 text-blue-600';
};

onMounted(loadAdmins);
</script>

<template>
  <AdminLayout active-menu="admins">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">管理员管理</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系统管理员账号，共 {{ total }} 人</p>
      </div>
      <button class="btn-primary px-4 py-2 rounded-lg" @click="showCreateDialog = true">
        + 创建管理员
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索用户名或昵称..."
        class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-64"
        @keyup.enter="handleSearch"
      />
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="handleSearch">搜索</button>
    </div>

    <!-- Admin Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400 w-16">序号</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">用户名</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">昵称</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">角色</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</th>
            <th class="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(admin, idx) in admins" :key="admin.id" class="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="p-4 text-sm text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-4 text-sm text-gray-800">{{ admin.username }}</td>
            <td class="p-4 text-sm text-gray-800">{{ admin.nickname }}</td>
            <td class="p-4">
              <span
                v-for="role in (admin.roles || ['admin'])"
                :key="role"
                :class="['px-2 py-1 rounded-full text-xs mr-1', getRoleClass(role)]"
              >
                {{ getRoleLabel(role) }}
              </span>
            </td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs', (admin.status ?? 1) === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                {{ (admin.status ?? 1) === 1 ? '正常' : '禁用' }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-500">{{ admin.createdAt ? new Date(admin.createdAt).toLocaleString('zh-CN') : '-' }}</td>
            <td class="p-4 text-right">
              <button class="text-blue-500 text-sm hover:underline mr-3" @click="openEditDialog(admin)">编辑</button>
              <button class="text-red-500 text-sm hover:underline" @click="deleteAdmin(admin)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="p-4 flex justify-between items-center">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button
            v-for="p in Math.ceil(total / pageSize)"
            :key="p"
            class="w-8 h-8 rounded-lg text-sm"
            :class="page === p ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'"
            @click="handlePageChange(p)"
          >{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <el-dialog title="创建管理员" v-model="showCreateDialog" width="480px">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
          <el-input v-model="createForm.password" type="password" placeholder="至少6位" show-password />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <el-input v-model="createForm.nickname" placeholder="可选" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <div class="flex gap-3">
            <label
              class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors"
              :class="createForm.roles.includes('admin') ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="createForm.roles.includes('admin')"
                @change="toggleRole('admin')"
              />
              <span class="text-sm font-medium">管理员</span>
            </label>
            <label
              class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors"
              :class="createForm.roles.includes('superadmin') ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-500'"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="createForm.roles.includes('superadmin')"
                @change="toggleRole('superadmin')"
              />
              <span class="text-sm font-medium">超级管理员</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createAdmin">创建</el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog title="编辑管理员" v-model="showEditDialog" width="480px">
      <div class="space-y-4">
        <div v-if="editAdmin">
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <el-input :model-value="editAdmin.username" disabled />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <div class="flex gap-3">
            <label
              class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors"
              :class="editForm.roles.includes('admin') ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="editForm.roles.includes('admin')"
                @change="toggleEditRole('admin')"
              />
              <span class="text-sm font-medium">管理员</span>
            </label>
            <label
              class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors"
              :class="editForm.roles.includes('superadmin') ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-500'"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="editForm.roles.includes('superadmin')"
                @change="toggleEditRole('superadmin')"
              />
              <span class="text-sm font-medium">超级管理员</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="editForm.status" class="w-full">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAdmin">保存</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>
