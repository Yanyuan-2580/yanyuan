<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 pt-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
    <div class="max-w-lg mx-auto flex justify-around">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative"
        :class="isActive(item) ? 'text-calm-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
        @click="navigate(item.path)"
      >
        <component :is="item.icon" class="w-[22px] h-[22px] transition-transform duration-200"
          :class="{ 'scale-110': isActive(item) }" />
        <span class="text-[11px] font-medium">{{ item.label }}</span>
        <!-- Active indicator dot -->
        <span
          v-if="isActive(item)"
          class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-calm-500"
        />
        <span
          v-if="item.badge && item.badge > 0"
          class="absolute -top-0.5 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Heart, MessageCircle, Calendar, BookOpen, User } from 'lucide-vue-next';

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

const navItems = computed<NavItem[]>(() => [
  { path: '/', label: '首页', icon: Heart, badge: 0 },
  { path: '/chat', label: '咨询', icon: MessageCircle, badge: 0 },
  { path: '/diary', label: '日记', icon: Calendar, badge: 0 },
  { path: '/knowledge', label: '知识', icon: BookOpen, badge: 0 },
  { path: '/user', label: '我的', icon: User, badge: 0 }
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
