<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import { Plus, Bell, Trash2 } from 'lucide-vue-next';

interface Reminder {
  id: number;
  type: string;
  title: string;
  description?: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
}

const router = useRouter();
const reminders = ref<Reminder[]>([]);
const isLoading = ref(true);

const loadReminders = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/reminders');
    if (res.data?.code === 200) {
      reminders.value = res.data.data || [];
    }
  } catch (e) {
    console.error('Failed to load reminders:', e);
  } finally {
    isLoading.value = false;
  }
};

const toggleReminder = async (r: Reminder) => {
  try {
    await request.put(`/reminders/${r.id}`, { enabled: !r.enabled });
    r.enabled = !r.enabled;
  } catch (e) {
    console.error('Failed to toggle reminder:', e);
  }
};

const deleteReminder = async (id: number) => {
  if (!confirm('确认删除此提醒？')) return;
  try {
    await request.delete(`/reminders/${id}`);
    reminders.value = reminders.value.filter(r => r.id !== id);
  } catch (e) {
    console.error('Failed to delete reminder:', e);
  }
};

import { useRouter } from 'vue-router';
onMounted(loadReminders);

const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="提醒设置" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-3">
      <div
        v-for="r in reminders"
        :key="r.id"
        class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
      >
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-800">{{ r.title }}</h4>
          <p class="text-xs text-gray-400 mt-1">
            {{ r.time }} · {{ r.daysOfWeek?.map(d => '周' + dayLabels[d]).join(' ') }}
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button
            class="relative w-11 h-6 rounded-full transition-colors"
            :class="r.enabled ? 'bg-primary-500' : 'bg-gray-300'"
            @click="toggleReminder(r)"
          >
            <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" :class="r.enabled ? 'translate-x-5 left-0.5' : 'left-0.5'" />
          </button>
          <button class="p-1 text-gray-400 hover:text-red-500" @click="deleteReminder(r.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <EmptyState
        v-if="reminders.length === 0"
        emoji="⏰"
        title="暂无提醒"
        description="添加提醒，帮助养成好习惯"
      />

      <button
        class="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 text-sm text-gray-400 hover:text-primary-500 hover:border-primary-300 flex items-center justify-center gap-2"
        @click="/* TODO: add reminder dialog */"
      >
        <Plus class="w-5 h-5" />
        添加新提醒
      </button>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
