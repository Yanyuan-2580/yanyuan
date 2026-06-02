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
  <div class="min-h-screen pb-24 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader title="账号设置" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-5">
      <!-- Avatar -->
      <section class="card">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-calm-50 flex items-center justify-center overflow-hidden border border-gray-100">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
            <UserIcon v-else class="w-8 h-8 text-calm-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800 mb-1.5">头像</p>
            <input
              v-model="avatarUrl"
              type="text"
              placeholder="输入头像URL地址"
              class="input-field"
            />
          </div>
        </div>
      </section>

      <!-- Profile -->
      <section class="card space-y-4">
        <div>
          <label class="text-[13px] font-medium text-gray-600 block mb-1.5 ml-1">昵称</label>
          <input
            v-model="nickname"
            type="text"
            maxlength="50"
            placeholder="设置你的昵称"
            class="input-field w-full"
          />
        </div>
        <div>
          <label class="text-[13px] font-medium text-gray-600 block mb-1.5 ml-1">邮箱</label>
          <div class="relative">
            <div class="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail class="w-4 h-4 text-gray-300" />
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="绑定邮箱"
              class="input-field w-full pl-11"
            />
          </div>
        </div>
      </section>

      <!-- Message -->
      <p v-if="message" class="text-sm text-center animate-fade-in"
        :class="message.includes('成功') ? 'text-emerald-500' : 'text-red-500'">
        {{ message }}
      </p>

      <!-- Save -->
      <button
        class="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
        :disabled="isSaving"
        @click="handleSave"
      >
        <Save class="w-4 h-4" />
        {{ isSaving ? '保存中...' : '保存设置' }}
      </button>

      <!-- Navigation -->
      <div class="space-y-2">
        <button
          class="w-full card flex items-center justify-between hover:border-calm-200 transition-all duration-200"
          @click="router.push('/user/change-password')"
        >
          <span class="text-sm font-medium text-gray-700">修改密码</span>
          <span class="text-gray-300 text-lg">›</span>
        </button>
        <button
          class="w-full card flex items-center justify-between hover:border-calm-200 transition-all duration-200"
          @click="router.push('/user/reminders')"
        >
          <span class="text-sm font-medium text-gray-700">提醒设置</span>
          <span class="text-gray-300 text-lg">›</span>
        </button>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
