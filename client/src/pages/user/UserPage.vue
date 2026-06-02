<script setup lang="ts">import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { diaryApi, chatApi } from '@/api';
import type { User } from '@/types';
import { Calendar, BookOpen, MessageCircle, Settings, Shield, HelpCircle, LogOut, ChevronRight, Edit, Lock, User as UserIcon, Heart, Award, Phone, TrendingUp } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';
import type { DiaryStats } from '@/api/modules/diary';
import type { WeeklyChatCount } from '@/api/modules/chat';
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const user = ref<User | null>(null);
const diaryStats = ref<DiaryStats | null>(null);
const weeklyChatCount = ref<WeeklyChatCount | null>(null);
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
 console.error('Failed to load diary stats:', error);
 }
};
const loadChatStats = async () => {
 try {
 const res = await chatApi.getWeeklyChatCount();
 console.log('loadChatStats response:', JSON.stringify(res));
 if (res.code === 200) {
 weeklyChatCount.value = res.data;
 console.log('weeklyChatCount.value:', weeklyChatCount.value);
 }
 }
 catch (error) {
 console.error('Failed to load chat stats:', error);
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
 { icon: Phone, label: '心理援助热线', path: '/user/hotline', badge: '寻求帮助' },
 { icon: HelpCircle, label: '帮助中心', path: '/user/help', badge: '获取帮助' }
];
const growthStats = computed(() => {
  const totalDays = diaryStats.value?.total || 0;
  // Calculate simple streak from diary stats
  const streak = Math.min(totalDays, 7); // Simplified: capped at 7 for demo
  const questionnaireCount = parseInt(localStorage.getItem('questionnaire_count') || '0');
  return { totalDays, streak, questionnaireCount };
});

const badges = computed(() => [
  { name: '初次记录', emoji: '🌱', earned: (diaryStats.value?.total || 0) >= 1 },
  { name: '坚持7天', emoji: '🔥', earned: (diaryStats.value?.total || 0) >= 7 },
  { name: '探索自我', emoji: '🔍', earned: growthStats.value.questionnaireCount >= 1 },
  { name: '冥想新手', emoji: '🧘', earned: (parseInt(localStorage.getItem('meditation_count') || '0')) >= 1 },
  { name: '月度记录', emoji: '📅', earned: (diaryStats.value?.total || 0) >= 30 },
  { name: '成长之星', emoji: '⭐', earned: growthStats.value.totalDays >= 14 },
]);

const settingsItems = [
 { icon: Settings, label: '账号设置', path: '/user/settings' },
 { icon: Lock, label: '修改密码', path: '/user/change-password' },
 { icon: Award, label: '关于我们', path: '/user/about' }
];
onMounted(async () => {
 await loadUser();
 await loadStats();
 await loadChatStats();
});

watch(() => route.fullPath, async () => {
 await loadChatStats();
}, { immediate: false });
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white p-6 rounded-b-3xl">
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
      
      <div class="grid grid-cols-4 gap-3 mt-6">
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-xl font-bold">{{ diaryStats?.total || 0 }}</p>
          <p class="text-xs text-white/70 mt-1">日记天数</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-xl font-bold">{{ diaryStats?.avgScore || '0' }}</p>
          <p class="text-xs text-white/70 mt-1">平均心情</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-xl font-bold">{{ weeklyChatCount?.weeklyCount || 0 }}</p>
          <p class="text-xs text-white/70 mt-1">本周咨询</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-xl font-bold">{{ weeklyChatCount?.totalCount || 0 }}</p>
          <p class="text-xs text-white/70 mt-1">总咨询次数</p>
        </div>
      </div>

      <!-- Growth Trajectory -->
      <div class="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3">
          <TrendingUp class="w-4 h-4" />
          <span class="text-sm font-medium">成长轨迹</span>
        </div>
        <div class="flex items-end gap-4">
          <div>
            <p class="text-xs text-white/60">累计使用</p>
            <p class="text-lg font-bold">{{ growthStats.totalDays }} 天</p>
          </div>
          <div>
            <p class="text-xs text-white/60">连续记录</p>
            <p class="text-lg font-bold">{{ growthStats.streak }} 天</p>
          </div>
          <div>
            <p class="text-xs text-white/60">完成测评</p>
            <p class="text-lg font-bold">{{ growthStats.questionnaireCount }} 次</p>
          </div>
        </div>
      </div>
    </header>

    <main class="p-6">
      <!-- Achievement Badges -->
      <section class="mb-6">
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award class="w-5 h-5 text-warm-500" />
            成就徽章
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="badge in badges" :key="badge.name"
                 class="text-center p-3 rounded-xl"
                 :class="badge.earned ? 'bg-primary-50' : 'bg-gray-50 opacity-40'">
              <span class="text-2xl">{{ badge.emoji }}</span>
              <p class="text-xs mt-1 font-medium" :class="badge.earned ? 'text-primary-700' : 'text-gray-400'">{{ badge.name }}</p>
            </div>
          </div>
        </div>
      </section>

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
    
    <BottomNavBar active-tab="user" />

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