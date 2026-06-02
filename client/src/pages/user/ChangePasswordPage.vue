<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/api';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import { Lock, Eye, EyeOff } from 'lucide-vue-next';

const router = useRouter();
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isSaving = ref(false);
const message = ref('');
const showOld = ref(false);
const showNew = ref(false);

const handleSubmit = async () => {
  message.value = '';
  if (!oldPassword.value) {
    message.value = '请输入当前密码';
    return;
  }
  if (newPassword.value.length < 6) {
    message.value = '新密码至少6位';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    message.value = '两次输入的新密码不一致';
    return;
  }

  isSaving.value = true;
  try {
    const res = await userApi.changePassword(oldPassword.value, newPassword.value);
    if (res.code === 200) {
      message.value = '密码修改成功';
      setTimeout(() => router.push('/user/settings'), 1500);
    }
  } catch (error: any) {
    message.value = error.message || '修改失败';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader title="修改密码" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6">
      <div class="card space-y-4">
        <div>
          <label class="text-[13px] font-medium text-gray-600 block mb-1.5 ml-1">当前密码</label>
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
              <Lock class="w-[18px] h-[18px]" />
            </div>
            <input
              v-model="oldPassword"
              :type="showOld ? 'text' : 'password'"
              placeholder="输入当前密码"
              class="input-field w-full pl-11 pr-10"
            />
            <button class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" @click="showOld = !showOld">
              <EyeOff v-if="showOld" class="w-[18px] h-[18px]" />
              <Eye v-else class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div>
          <label class="text-[13px] font-medium text-gray-600 block mb-1.5 ml-1">新密码</label>
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
              <Lock class="w-[18px] h-[18px]" />
            </div>
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="至少6位新密码"
              class="input-field w-full pl-11 pr-10"
            />
            <button class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" @click="showNew = !showNew">
              <EyeOff v-if="showNew" class="w-[18px] h-[18px]" />
              <Eye v-else class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div>
          <label class="text-[13px] font-medium text-gray-600 block mb-1.5 ml-1">确认新密码</label>
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-calm-400 transition-colors">
              <Lock class="w-[18px] h-[18px]" />
            </div>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              class="input-field w-full pl-11"
            />
          </div>
        </div>

        <p v-if="message" class="text-sm text-center animate-fade-in"
          :class="message.includes('成功') ? 'text-emerald-500' : 'text-red-500'">
          {{ message }}
        </p>

        <button
          class="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
          :disabled="isSaving"
          @click="handleSubmit"
        >
          <Lock class="w-4 h-4" />
          {{ isSaving ? '修改中...' : '确认修改' }}
        </button>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
