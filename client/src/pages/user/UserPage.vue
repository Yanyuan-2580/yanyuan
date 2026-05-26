<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { diaryApi, knowledgeApi } from '@/api';
import type { User } from '@/types';
import { Calendar, BookOpen, MessageCircle, Settings, Shield, HelpCircle, LogOut, ChevronRight, Edit, Lock, User as UserIcon, Heart, Award } from 'lucide-vue-next';
import type { DiaryStats } from '@/api/modules/diary';
const router = useRouter();
const userStore = useUserStore();
const user = ref<User | null>(null);
const diaryStats = ref<DiaryStats | null>(null);
const showEditModal = ref(false);
const nickname = ref('');
const loadUser = async () => {
 try {
 await userStore.getProfile();
 user.value = userStore.user;
 nickname.value = user.value?.nickname || '';
 }
 catch (error) {
 console.error('Failed to load user:', error);
 }
};
const loadStats = async () => {
 try {
 const res = await diaryApi.stats('all');
 if (res.code === 200) {
 diaryStats.value = res.data;
 }
 }
 catch (error) {
 console.error('Failed to load stats:', error);
 }
};
const saveProfile = async () => {
 if (!nickname.value.trim())
 return;
 try {
 await userStore.updateProfile({ nickname: nickname.value });
 showEditModal.value = false;
 }
 catch (error) {
 console.error('Failed to update profile:', error);
 }
};
const handleLogout = async () => {
 if (!confirm('确定要退出登录吗？'))
 return;
 await userStore.logout();
 router.push('/login');
};
const menuItems = [
 { icon: Calendar, label: '我的日记', path: '/diary', badge: '记录心情' },
 { icon: MessageCircle, label: '咨询记录', path: '/chat', badge: 'AI对话' },
 { icon: BookOpen, label: '我的收藏', path: '/knowledge', badge: '知识文章' },
 { icon: Shield, label: '隐私设置', path: '/user/settings', badge: '保护隐私' },
 { icon: HelpCircle, label: '帮助中心', path: '/user/help', badge: '获取帮助' }
];
const settingsItems = [
 { icon: Settings, label: '账号设置', path: '/user/settings' },
 { icon: Lock, label: '修改密码', path: '/user/change-password' },
 { icon: Award, label: '关于我们', path: '/user/about' }
];
onMounted(async () => {
 await loadUser();
 await loadStats();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-primary-500 via-purple-500 to-warm-500 text-white p-6 rounded-b-3xl">
      <h1 class="text-xl font-semibold mb-6">我的</h1>
      
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <UserIcon class="w-10 h-10 text-white" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold">{{ user?.nickname || '用户' }}</h2>
            <button 
              class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
              @click="showEditModal = true"
            >
              <Edit class="w-3 h-3" />
            </button>
          </div>
          <p class="text-white/70 text-sm mt-1">{{ user?.phone }}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-3 gap-4 mt-6">
        <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <p class="text-2xl font-bold">{{ diaryStats?.total || 0 }}</p>
          <p class="text-xs text-white/70 mt-1">日记天数</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <p class="text-2xl font-bold">{{ diaryStats?.avgScore || '0' }}</p>
          <p class="text-xs text-white/70 mt-1">平均心情</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <p class="text-2xl font-bold">0</p>
          <p class="text-xs text-white/70 mt-1">咨询次数</p>
        </div>
      </div>
    </header>
    
    <main class="p-6">
      <section class="mb-6">
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart class="w-5 h-5 text-primary-500" />
            快捷入口
          </h3>
          <div class="space-y-2">
            <button
              v-for="item in menuItems"
              :key="item.label"
              class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
              @click="router.push(item.path)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <component :is="item.icon" class="w-5 h-5 text-primary-500" />
                </div>
                <span class="font-medium text-gray-800">{{ item.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ item.badge }}</span>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </section>
      
      <section class="mb-6">
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings class="w-5 h-5 text-gray-500" />
            设置与帮助
          </h3>
          <div class="space-y-2">
            <button
              v-for="item in settingsItems"
              :key="item.label"
              class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
              @click="router.push(item.path)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <component :is="item.icon" class="w-5 h-5 text-gray-500" />
                </div>
                <span class="font-medium text-gray-800">{{ item.label }}</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </section>
      
      <section>
        <button 
          class="w-full card flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
          @click="handleLogout"
        >
          <LogOut class="w-5 h-5" />
          <span class="font-medium">退出登录</span>
        </button>
      </section>
    </main>
    
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <div class="max-w-lg mx-auto flex justify-around">
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path === '/' }"
          @click="router.push('/')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
            <path d="M9 22V12h6v10" />
            <path d="M16 2H8a2 2 0 0 0-2 2v3" />
            <path d="M16 2h2a2 2 0 0 1 2 2v3" />
            <path d="M8 22h1" />
            <path d="M12 22h1" />
            <path d="M16 22h1" />
          </svg>
          <span class="text-xs">首页</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/chat') }"
          @click="router.push('/chat')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-xs">咨询</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/diary') }"
          @click="router.push('/diary')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="text-xs">日记</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/knowledge') }"
          @click="router.push('/knowledge')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span class="text-xs">知识</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/user') }"
          @click="router.push('/user')"
        >
          <span class="text-lg">👤</span>
          <span class="text-xs">我的</span>
        </button>
      </div>
    </nav>
    
    <Teleport to="body">
      <div 
        v-if="showEditModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        @click.self="showEditModal = false"
      >
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">修改昵称</h3>
          
          <input
            v-model="nickname"
            type="text"
            placeholder="请输入新昵称"
            class="input-field mb-4"
            maxlength="20"
          />
          
          <div class="flex gap-3">
            <button class="btn-outline flex-1" @click="showEditModal = false">
              取消
            </button>
            <button class="btn-primary flex-1" @click="saveProfile">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>