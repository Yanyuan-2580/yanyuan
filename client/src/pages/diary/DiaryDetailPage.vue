<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { diaryApi } from '@/api';
import type { MoodDiary } from '@/types';
import { ArrowLeft, Calendar, Sun, Moon, Activity, Tag, Edit2, Trash2 } from 'lucide-vue-next';
const route = useRoute();
const router = useRouter();
const diary = ref<MoodDiary | null>(null);
const moodOptions = [
 { score: 1, emoji: '😢', label: '非常难过', color: 'text-red-500' },
 { score: 2, emoji: '😔', label: '有点低落', color: 'text-orange-400' },
 { score: 3, emoji: '😐', label: '一般', color: 'text-gray-500' },
 { score: 4, emoji: '😊', label: '比较开心', color: 'text-yellow-500' },
 { score: 5, emoji: '😄', label: '非常开心', color: 'text-green-500' }
];
const loadDiary = async () => {
 const id = parseInt(route.params.id as string);
 const res = await diaryApi.get(id);
 if (res.code === 200) {
 diary.value = res.data;
 }
};
const deleteDiary = async () => {
 if (!confirm('确定要删除这篇日记吗？')) return;
 const id = parseInt(route.params.id as string);
 const res = await diaryApi.delete(id);
 if (res.code === 200) {
 router.push('/diary');
 }
};
onMounted(async () => {
 await loadDiary();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-warm-400 via-primary-500 to-pink-400 text-white p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
            @click="router.back()"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-lg font-semibold">日记详情</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
            @click="router.push(`/diary/${diary?.id}/edit`)"
          >
            <Edit2 class="w-5 h-5" />
          </button>
          <button 
            class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
            @click="deleteDiary"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
    
    <main v-if="diary" class="p-6">
      <div class="card mb-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ moodOptions[diary.moodScore - 1]?.emoji }}</span>
            <div>
              <h2 class="text-xl font-semibold text-gray-800">{{ moodOptions[diary.moodScore - 1]?.label }}</h2>
              <p class="text-gray-500">{{ new Date(diary.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="diary.content" class="mb-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">今日心情记录</h3>
          <p class="text-gray-700 leading-relaxed">{{ diary.content }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div v-if="diary.triggers" class="p-4 bg-warm-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Tag class="w-4 h-4 text-warm-500" />
              <span class="text-sm font-medium text-gray-600">触发因素</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.triggers }}</p>
          </div>
          
          <div v-if="diary.physicalSensations" class="p-4 bg-calm-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Activity class="w-4 h-4 text-calm-500" />
              <span class="text-sm font-medium text-gray-600">身体感受</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.physicalSensations }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-yellow-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Sun class="w-4 h-4 text-yellow-500" />
              <span class="text-sm font-medium text-gray-600">睡眠时长</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.sleepHours || '未记录' }} 小时</p>
          </div>
          
          <div class="p-4 bg-indigo-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Moon class="w-4 h-4 text-indigo-500" />
              <span class="text-sm font-medium text-gray-600">睡眠质量</span>
            </div>
            <p class="text-sm text-gray-700">
              <span v-if="diary.sleepQuality === 1">差</span>
              <span v-else-if="diary.sleepQuality === 2">一般</span>
              <span v-else-if="diary.sleepQuality === 3">良好</span>
              <span v-else>未记录</span>
            </p>
          </div>
        </div>
        
        <div v-if="diary.tags && diary.tags.length > 0" class="mb-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">标签</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in diary.tags" 
              :key="tag"
              class="px-3 py-1 bg-primary-100 text-primary-600 text-sm rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div v-if="diary.aiInsight" class="p-4 bg-gradient-to-r from-calm-50 to-primary-50 rounded-xl border border-calm-200">
          <h3 class="text-sm font-medium text-calm-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            AI洞察
          </h3>
          <p class="text-sm text-gray-700">{{ diary.aiInsight }}</p>
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
  </div>
</template>