<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { diaryApi } from '@/api';
import type { MoodDiary, PageResult } from '@/types';
import { Calendar, Plus, MessageCircle, BookOpen, Heart, ChevronRight, TrendingUp } from 'lucide-vue-next';
const router = useRouter();
const diaries = ref<MoodDiary[]>([]);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const moodOptions = [
 { score: 1, emoji: '😢', label: '非常难过', color: 'bg-blue-100' },
 { score: 2, emoji: '😔', label: '有点低落', color: 'bg-gray-100' },
 { score: 3, emoji: '😐', label: '一般', color: 'bg-yellow-100' },
 { score: 4, emoji: '😊', label: '比较开心', color: 'bg-green-100' },
 { score: 5, emoji: '😄', label: '非常开心', color: 'bg-green-200' }
];
const loadDiaries = async (pageNum: number = 1) => {
 loading.value = true;
 const res = await diaryApi.list(pageNum, pageSize);
 if (res.code === 200) {
 diaries.value = pageNum === 1 ? res.data.list : [...diaries.value, ...res.data.list];
 total.value = res.data.total;
 page.value = pageNum;
 }
 loading.value = false;
};
const loadMore = () => {
 if (loading.value)
 return;
 if (page.value * pageSize < total.value) {
 loadDiaries(page.value + 1);
 }
};
onMounted(() => {
 loadDiaries();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-warm-500 via-warm-600 to-primary-500 text-white p-6 rounded-b-3xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">情绪日记</h1>
          <p class="text-white/80 mt-1">记录每一天的心情变化</p>
        </div>
        <button 
          class="btn-primary"
          @click="router.push('/diary/new')"
        >
          <Plus class="w-5 h-5 inline-block mr-1" />
          写日记
        </button>
      </div>
      
      <div class="glass-card bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div class="flex items-center justify-around">
          <div class="text-center">
            <p class="text-white/70 text-sm">总记录</p>
            <p class="text-2xl font-bold">{{ total }}</p>
          </div>
          <div class="w-px h-10 bg-white/20"></div>
          <div class="text-center">
            <p class="text-white/70 text-sm">本周</p>
            <p class="text-2xl font-bold">{{ diaries.filter(d => {
              const date = new Date(d.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return date >= weekAgo;
            }).length }}</p>
          </div>
          <div class="w-px h-10 bg-white/20"></div>
          <div class="text-center">
            <p class="text-white/70 text-sm">本月</p>
            <p class="text-2xl font-bold">{{ diaries.filter(d => {
              const date = new Date(d.createdAt);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return date >= monthAgo;
            }).length }}</p>
          </div>
        </div>
      </div>
    </header>
    
    <main class="p-6">
      <div v-if="diaries.length === 0" class="card text-center py-12">
        <Calendar class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 class="text-lg font-semibold text-gray-800 mb-2">还没有日记记录</h2>
        <p class="text-gray-500 mb-6">开始记录你的第一篇情绪日记吧</p>
        <button class="btn-primary" @click="router.push('/diary/new')">
          <Plus class="w-5 h-5 inline-block mr-1" />
          写第一篇日记
        </button>
      </div>
      
      <div v-else class="space-y-4">
        <article
          v-for="diary in diaries"
          :key="diary.id"
          class="card cursor-pointer hover:shadow-xl transition-shadow"
          @click="router.push(`/diary/${diary.id}`)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <span :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl', moodOptions[diary.moodScore - 1]?.color]">
                {{ moodOptions[diary.moodScore - 1]?.emoji }}
              </span>
              <div>
                <p class="font-medium text-gray-800">{{ moodOptions[diary.moodScore - 1]?.label }}</p>
                <p class="text-sm text-gray-500">{{ new Date(diary.createdAt).toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                }) }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
          
          <p v-if="diary.content" class="text-gray-600 mb-3 line-clamp-2">{{ diary.content }}</p>
          
          <div v-if="diary.tags && diary.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
            <span 
              v-for="tag in diary.tags" 
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{{ tag }}
            </span>
          </div>
          
          <div v-if="diary.aiInsight" class="p-3 bg-calm-50 rounded-xl">
            <p class="text-sm text-calm-800 line-clamp-2">💡 {{ diary.aiInsight }}</p>
          </div>
        </article>
        
        <div v-if="page * pageSize < total" class="text-center py-4">
          <button 
            class="btn-outline"
            :disabled="loading"
            @click="loadMore"
          >
            <span v-if="loading">加载中...</span>
            <span v-else>加载更多</span>
          </button>
        </div>
      </div>
    </main>
    
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <div class="max-w-lg mx-auto flex justify-around">
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path === '/' }"
          @click="router.push('/')"
        >
          <Heart class="w-6 h-6" />
          <span class="text-xs">首页</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/chat') }"
          @click="router.push('/chat')"
        >
          <MessageCircle class="w-6 h-6" />
          <span class="text-xs">咨询</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/diary') }"
          @click="router.push('/diary')"
        >
          <Calendar class="w-6 h-6" />
          <span class="text-xs">日记</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/knowledge') }"
          @click="router.push('/knowledge')"
        >
          <BookOpen class="w-6 h-6" />
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
  </div>
</template>
