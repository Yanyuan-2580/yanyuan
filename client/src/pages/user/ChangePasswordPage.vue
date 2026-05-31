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
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="修改密码" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6">
      <div class="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">当前密码</label>
          <div class="relative">
            <input
              v-model="oldPassword"
              :type="showOld ? 'text' : 'password'"
              placeholder="输入当前密码"
              class="input-field w-full pr-10"
            />
            <button class="absolute right-3 top-1/2 -translate-y-1/2" @click="showOld = !showOld">
              <EyeOff v-if="showOld" class="w-4 h-4 text-gray-400" />
              <Eye v-else class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">新密码</label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="至少6位"
              class="input-field w-full pr-10"
            />
            <button class="absolute right-3 top-1/2 -translate-y-1/2" @click="showNew = !showNew">
              <EyeOff v-if="showNew" class="w-4 h-4 text-gray-400" />
              <Eye v-else class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">确认新密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="再次输入新密码"
            class="input-field w-full"
          />
        </div>

        <p v-if="message" class="text-sm text-center" :class="message.includes('成功') ? 'text-green-500' : 'text-red-500'">
          {{ message }}
        </p>

        <button
          class="btn-primary w-full py-3 flex items-center justify-center gap-2"
          :disabled="isSaving"
          @click="handleSubmit"
        >
          <Lock class="w-5 h-5" />
          {{ isSaving ? '修改中...' : '确认修改' }}
        </button>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
