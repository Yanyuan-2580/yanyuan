<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { diaryApi } from '@/api';
import type { MoodDiary } from '@/types';
import { ArrowLeft, Calendar, Sun, Activity, Tag, Edit2, Trash2 } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';
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
    <header class="bg-gradient-to-br from-rose-300 via-pink-400 to-orange-300 text-white p-6">
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
          <div v-if="diary.triggerEvent" class="p-4 bg-warm-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Tag class="w-4 h-4 text-warm-500" />
              <span class="text-sm font-medium text-gray-600">触发因素</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.triggerEvent }}</p>
          </div>

          <div v-if="diary.bodyFeeling" class="p-4 bg-calm-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Activity class="w-4 h-4 text-calm-500" />
              <span class="text-sm font-medium text-gray-600">身体感受</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.bodyFeeling }}</p>
          </div>
        </div>

        <div class="mb-6">
          <div class="p-4 bg-yellow-50 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <Sun class="w-4 h-4 text-yellow-500" />
              <span class="text-sm font-medium text-gray-600">睡眠时长</span>
            </div>
            <p class="text-sm text-gray-700">{{ diary.sleepHours ? diary.sleepHours + ' 小时' : '未记录' }}</p>
          </div>
        </div>

        <div v-if="diary.moodTags && diary.moodTags.length > 0" class="mb-6">
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
    
    <BottomNavBar active-tab="diary" />
  </div>
</template>