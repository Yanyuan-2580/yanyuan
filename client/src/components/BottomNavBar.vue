<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-50">
    <div class="max-w-lg mx-auto flex justify-around">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors relative"
        :class="{ 'text-primary-500': isActive(item) }"
        @click="navigate(item.path)"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs">{{ item.label }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Heart, MessageCircle, Calendar, BookOpen, User } from 'lucide-vue-next';
import { request } from '@/api/request';

interface NavItem {
  path: string;
  label: string;
  icon: any;
  badge?: number;
}

const props = withDefaults(defineProps<{
  activeTab?: 'home' | 'chat' | 'diary' | 'knowledge' | 'user';
  notificationCount?: number;
}>(), {
  activeTab: 'home',
  notificationCount: 0
});

const router = useRouter();
const route = useRoute();

const unreadCount = ref(props.notificationCount);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const fetchUnreadCount = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const res = await request.get('/notifications/unread-count');
    if (res.data?.code === 200) {
      unreadCount.value = res.data.data?.count || 0;
    }
  } catch {
    // ignore poll errors
  }
};

onMounted(() => {
  fetchUnreadCount();
  // Poll every 30 seconds
  pollTimer = setInterval(fetchUnreadCount, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

const navItems = computed<NavItem[]>(() => [
  { path: '/', label: '首页', icon: Heart, badge: 0 },
  { path: '/chat', label: '咨询', icon: MessageCircle, badge: 0 },
  { path: '/diary', label: '日记', icon: Calendar, badge: 0 },
  { path: '/knowledge', label: '知识', icon: BookOpen, badge: 0 },
  { path: '/user', label: '我的', icon: User, badge: unreadCount.value }
]);

function isActive(item: NavItem): boolean {
  if (item.path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(item.path);
}

function navigate(path: string) {
  router.push(path);
}
</script>
