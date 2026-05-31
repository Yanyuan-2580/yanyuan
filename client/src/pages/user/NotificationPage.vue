<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { Bell, Check } from 'lucide-vue-next';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

const router = useRouter();
const notifications = ref<Notification[]>([]);
const isLoading = ref(true);
const unreadOnly = ref(false);

const loadNotifications = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/notifications', {
      params: { page: 1, pageSize: 50, unreadOnly: unreadOnly.value }
    });
    if (res.data?.code === 200) {
      notifications.value = res.data.data.list || [];
    }
  } catch (e) {
    console.error('Failed to load notifications:', e);
  } finally {
    isLoading.value = false;
  }
};

const markAsRead = async (id: number) => {
  try {
    await request.put(`/notifications/${id}/read`);
    const n = notifications.value.find(x => x.id === id);
    if (n) n.isRead = true;
  } catch (e) {
    console.error('Failed to mark as read:', e);
  }
};

const markAllAsRead = async () => {
  try {
    await request.put('/notifications/read-all');
    notifications.value.forEach(n => { n.isRead = true; });
  } catch (e) {
    console.error('Failed to mark all as read:', e);
  }
};

onMounted(loadNotifications);
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="消息通知">
      <template #right>
        <button class="text-xs text-primary-500" @click="markAllAsRead">全部已读</button>
      </template>
    </PageHeader>

    <div class="max-w-lg mx-auto px-4 py-2">
      <button
        class="text-xs px-3 py-1 rounded-full mb-3 transition-colors"
        :class="unreadOnly ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'"
        @click="unreadOnly = !unreadOnly; loadNotifications()"
      >
        {{ unreadOnly ? '仅看未读' : '显示全部' }}
      </button>
    </div>

    <LoadingSpinner v-if="isLoading" message="加载通知..." />

    <div v-else class="max-w-lg mx-auto px-4 space-y-2">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-colors"
        :class="{ 'border-l-4 border-primary-500 bg-primary-50': !n.isRead }"
        @click="markAsRead(n.id)"
      >
        <div class="flex items-start gap-3">
          <span class="text-lg mt-0.5">{{ n.type === 'risk' ? '🔴' : n.type === 'chat' ? '💬' : '📢' }}</span>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-800">{{ n.title }}</h4>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ n.content }}</p>
            <p class="text-xs text-gray-300 mt-2">{{ new Date(n.createdAt).toLocaleString('zh-CN') }}</p>
          </div>
          <Check v-if="n.isRead" class="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
        </div>
      </div>

      <EmptyState
        v-if="notifications.length === 0"
        emoji="🔔"
        title="暂无通知"
        description="当有新的消息时，会在这里显示"
      />
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
