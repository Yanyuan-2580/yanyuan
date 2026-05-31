<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/api';
import { useUserStore } from '@/stores/user';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import { Save, Mail, User as UserIcon } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const nickname = ref(userStore.user?.nickname || '');
const email = ref(userStore.user?.email || '');
const avatarUrl = ref(userStore.user?.avatarUrl || '');
const isSaving = ref(false);
const message = ref('');

const handleSave = async () => {
  isSaving.value = true;
  message.value = '';
  try {
    const res = await userApi.updateProfile({ nickname: nickname.value, email: email.value, avatarUrl: avatarUrl.value });
    if (res.code === 200) {
      userStore.user = res.data;
      message.value = '保存成功';
      setTimeout(() => { message.value = ''; }, 3000);
    }
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    message.value = error.message || '保存失败';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="账号设置" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Avatar -->
      <section class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
            <UserIcon v-else class="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">头像</p>
            <input
              v-model="avatarUrl"
              type="text"
              placeholder="输入头像URL地址"
              class="input-field mt-1 text-sm"
            />
          </div>
        </div>
      </section>

      <!-- Profile -->
      <section class="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-1">昵称</label>
          <input
            v-model="nickname"
            type="text"
            maxlength="50"
            placeholder="设置你的昵称"
            class="input-field w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-1">邮箱</label>
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-gray-400" />
            <input
              v-model="email"
              type="email"
              placeholder="绑定邮箱"
              class="input-field w-full"
            />
          </div>
        </div>
      </section>

      <!-- Message -->
      <p v-if="message" class="text-sm text-center" :class="message.includes('成功') ? 'text-green-500' : 'text-red-500'">
        {{ message }}
      </p>

      <!-- Save -->
      <button
        class="btn-primary w-full py-3 flex items-center justify-center gap-2"
        :disabled="isSaving"
        @click="handleSave"
      >
        <Save class="w-5 h-5" />
        {{ isSaving ? '保存中...' : '保存设置' }}
      </button>

      <!-- Navigation -->
      <div class="space-y-1">
        <button
          class="w-full bg-white rounded-2xl p-4 text-left shadow-sm flex items-center justify-between hover:bg-gray-50"
          @click="router.push('/user/change-password')"
        >
          <span class="text-sm font-medium text-gray-700">修改密码</span>
          <span class="text-gray-400">›</span>
        </button>
        <button
          class="w-full bg-white rounded-2xl p-4 text-left shadow-sm flex items-center justify-between hover:bg-gray-50"
          @click="router.push('/user/reminders')"
        >
          <span class="text-sm font-medium text-gray-700">提醒设置</span>
          <span class="text-gray-400">›</span>
        </button>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
