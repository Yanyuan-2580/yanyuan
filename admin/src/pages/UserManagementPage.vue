<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi } from '@/api';
import type { User } from '@/types';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const users = ref<User[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const showEditDialog = ref(false);
const showCreateDialog = ref(false);
const editUser = ref<User | null>(null);
const editForm = ref({ nickname: '', status: 1, riskLevel: 0 });
const createForm = ref({ username: '', password: '', nickname: '' });
const searchKeyword = ref('');
const filterStatus = ref<number | undefined>(undefined);
const filterRiskLevel = ref<number | undefined>(undefined);

const loadUsers = async () => {
  try {
    const params: any = {};
    if (filterStatus.value !== undefined) params.status = filterStatus.value;
    if (filterRiskLevel.value !== undefined) params.riskLevel = filterRiskLevel.value;
    if (searchKeyword.value) params.keyword = searchKeyword.value;
    const res = await userApi.getUsers(page.value, pageSize.value, params);
    if (res.code === 200) {
      users.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败');
  }
};

const openEditDialog = (user: User) => {
  editUser.value = user;
  editForm.value = { nickname: user.nickname, status: user.status, riskLevel: user.riskLevel || 0 };
  showEditDialog.value = true;
};

const saveUser = async () => {
  if (!editUser.value) return;
  try {
    await userApi.updateUser(editUser.value.id, editForm.value);
    ElMessage.success('修改成功');
    showEditDialog.value = false;
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '修改失败');
  }
};

const createUser = async () => {
  if (!createForm.value.username || !createForm.value.password) {
    ElMessage.warning('请填写用户名和密码');
    return;
  }
  try {
    await userApi.createUser(createForm.value);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    createForm.value = { username: '', password: '', nickname: '' };
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败');
  }
};

const deleteUser = async (id: number) => {
  if (!confirm('确定要删除该用户吗？')) return;
  try {
    await userApi.deleteUser(id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
};

const handleSearch = () => {
  page.value = 1;
  loadUsers();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadUsers();
};

onMounted(loadUsers);
</script>

<template>
  <AdminLayout active-menu="users">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">用户管理</h2>
        <p class="text-gray-500 mt-1">管理平台用户，共 {{ total }} 人</p>
      </div>
      <button class="btn-primary px-4 py-2 rounded-lg" @click="showCreateDialog = true">
        + 创建用户
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索用户名或昵称..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
        @keyup.enter="handleSearch"
      />
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部状态</option>
        <option :value="1">正常</option>
        <option :value="0">禁用</option>
      </select>
      <select v-model="filterRiskLevel" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" @change="handleSearch">
        <option :value="undefined">全部风险等级</option>
        <option :value="0">正常</option>
        <option :value="1">关注</option>
        <option :value="2">高危</option>
      </select>
      <button class="btn-primary px-4 py-2 text-sm rounded-lg" @click="handleSearch">搜索</button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-2xl shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left p-4 text-sm font-medium text-gray-500 w-16">序号</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">用户名</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">昵称</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">状态</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">风险等级</th>
            <th class="text-left p-4 text-sm font-medium text-gray-500">注册时间</th>
            <th class="text-right p-4 text-sm font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users" :key="user.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="p-4 text-sm text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-4 text-sm text-gray-800">{{ user.username }}</td>
            <td class="p-4 text-sm text-gray-800">{{ user.nickname }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs', user.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                {{ user.status === 1 ? '正常' : '禁用' }}
              </span>
            </td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-full text-xs',
                user.riskLevel === 2 ? 'bg-red-100 text-red-600' :
                user.riskLevel === 1 ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              ]">
                {{ user.riskLevel === 2 ? '高危' : user.riskLevel === 1 ? '关注' : '正常' }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-500">{{ new Date(user.createdAt).toLocaleString('zh-CN') }}</td>
            <td class="p-4 text-right">
              <button class="text-blue-500 text-sm hover:underline mr-3" @click="openEditDialog(user)">编辑</button>
              <button class="text-red-500 text-sm hover:underline" @click="deleteUser(user.id)">删除</button>
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
            :class="page === p ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="handlePageChange(p)"
          >{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <el-dialog title="编辑用户" v-model="showEditDialog">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="editForm.status" class="w-full">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">风险等级</label>
          <el-select v-model="editForm.riskLevel" class="w-full">
            <el-option label="正常" :value="0" />
            <el-option label="关注" :value="1" />
            <el-option label="高危" :value="2" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- Create Dialog -->
    <el-dialog title="创建用户" v-model="showCreateDialog">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
          <el-input v-model="createForm.password" type="password" placeholder="至少6位" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <el-input v-model="createForm.nickname" placeholder="可选" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createUser">创建</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>
