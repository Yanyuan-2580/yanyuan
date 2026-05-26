<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { diaryApi, knowledgeApi } from '@/api';
import type { MoodDiary, KnowledgeArticle } from '@/types';
import { MessageCircle, BookOpen, Calendar, Heart, Star, ChevronRight, TrendingUp } from 'lucide-vue-next';
import type { DiaryStats } from '@/api/modules/diary';
const router = useRouter();
const userStore = useUserStore();
const todayMood = ref<number>(3);
const diaryStats = ref<DiaryStats | null>(null);
const recentDiary = ref<MoodDiary | null>(null);
const recentArticles = ref<KnowledgeArticle[]>([]);
const quickActions = [
 { icon: MessageCircle, label: 'AI咨询', path: '/chat', color: 'from-primary-400 to-primary-600' },
 { icon: Calendar, label: '情绪日记', path: '/diary', color: 'from-warm-400 to-warm-600' },
 { icon: Heart, label: '情绪记录', path: '/mood', color: 'from-pink-400 to-pink-600' },
 { icon: Star, label: '冥想疗愈', path: '/meditation', color: 'from-calm-400 to-calm-600' },
 { icon: BookOpen, label: '知识库', path: '/knowledge', color: 'from-blue-400 to-blue-600' }
];
const moodOptions = [
 { score: 1, emoji: '😢', label: '非常难过' },
 { score: 2, emoji: '😔', label: '有点低落' },
 { score: 3, emoji: '😐', label: '一般' },
 { score: 4, emoji: '😊', label: '比较开心' },
 { score: 5, emoji: '😄', label: '非常开心' }
];
const showMoodModal = ref(false);
const openMoodModal = () => {
 showMoodModal.value = true;
};
const selectMood = async (score: number) => {
 todayMood.value = score;
 showMoodModal.value = false;
 await diaryApi.create({ moodScore: score });
 await loadData();
};
const getScoreDistributionArray = () => {
 if (!diaryStats.value?.scoreDistribution) return [0, 0, 0, 0, 0];
 return [1, 2, 3, 4, 5].map(score => diaryStats.value.scoreDistribution[score] || 0);
};

const loadData = async () => {
 try {
 const [statsRes, diaryRes, articlesRes] = await Promise.all([
 diaryApi.stats('week'),
 diaryApi.list(1, 1),
 knowledgeApi.getArticles(1, 4)
 ]);
 if (statsRes.code === 200) {
 diaryStats.value = statsRes.data;
 }
 if (diaryRes.code === 200 && diaryRes.data.list.length > 0) {
 recentDiary.value = diaryRes.data.list[0];
 }
 if (articlesRes.code === 200) {
 recentArticles.value = articlesRes.data.list;
 }
 }
 catch (error) {
 console.error('Failed to load data:', error);
 }
};
onMounted(() => {
 loadData();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-primary-500 via-primary-600 to-warm-500 text-white p-6 rounded-b-3xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">你好，{{ userStore.user?.nickname || '朋友' }}</h1>
          <p class="text-white/80 mt-1">今天感觉怎么样？</p>
        </div>
        <button 
          class="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
          @click="router.push('/user')"
        >
          <span class="text-xl">👤</span>
        </button>
      </div>
      
      <div class="glass-card bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white/70 text-sm">本周平均心情</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="text-4xl">{{ moodOptions[Number(diaryStats?.avgScore) - 1]?.emoji || '😐' }}</span>
              <div>
                <span class="text-3xl font-bold">{{ diaryStats?.avgScore || '0' }}</span>
                <span class="text-white/70"> / 5</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-white/70 text-sm">日记记录</p>
            <p class="text-2xl font-bold">{{ diaryStats?.total || 0 }} 天</p>
          </div>
        </div>
      </div>
    </header>
    
    <main class="p-6">
      <section class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="card flex flex-col items-center p-6 hover:scale-105 transition-transform cursor-pointer"
          @click="action.action ? (this as any)[action.action]() : router.push(action.path)"
        >
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br text-white', action.color]">
            <component :is="action.icon" class="w-7 h-7" />
          </div>
          <span class="text-gray-700 font-medium">{{ action.label }}</span>
        </button>
      </section>
      
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star class="w-5 h-5 text-primary-500" />
            今日推荐
          </h2>
          <button class="text-primary-500 text-sm flex items-center gap-1" @click="router.push('/knowledge')">
            查看更多 <ChevronRight class="w-4 h-4" />
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article
            v-for="article in recentArticles"
            :key="article.id"
            class="card flex gap-4 cursor-pointer hover:shadow-xl transition-shadow"
            @click="router.push(`/knowledge/${article.id}`)"
          >
            <div class="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-100 to-warm-100 flex-shrink-0 flex items-center justify-center">
              <BookOpen class="w-10 h-10 text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-800 line-clamp-2">{{ article.title }}</h3>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span class="flex items-center gap-1">👁️ {{ article.viewCount }}</span>
                <span class="flex items-center gap-1">❤️ {{ article.likeCount }}</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <span 
                  v-for="tag in article.tags.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
      
      <section v-if="recentDiary" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-warm-500" />
            最近记录
          </h2>
          <button class="text-primary-500 text-sm flex items-center gap-1" @click="router.push('/diary')">
            查看全部 <ChevronRight class="w-4 h-4" />
          </button>
        </div>
        
        <div class="card">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ moodOptions[recentDiary.moodScore - 1]?.emoji }}</span>
              <div>
                <p class="font-medium text-gray-800">{{ moodOptions[recentDiary.moodScore - 1]?.label }}</p>
                <p class="text-sm text-gray-500">{{ new Date(recentDiary.createdAt).toLocaleDateString('zh-CN') }}</p>
              </div>
            </div>
            <TrendingUp class="w-5 h-5 text-gray-400" />
          </div>
          
          <p v-if="recentDiary.content" class="text-gray-600 mb-4 line-clamp-3">{{ recentDiary.content }}</p>
          
          <div v-if="recentDiary.aiInsight" class="p-4 bg-calm-50 rounded-xl border border-calm-200">
            <p class="text-sm text-calm-800">💡 AI洞察：{{ recentDiary.aiInsight }}</p>
          </div>
        </div>
      </section>
      
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">情绪趋势</h2>
        </div>
        
        <div class="card">
          <div class="flex items-end justify-between gap-2 h-32">
            <div 
              v-for="(count, index) in getScoreDistributionArray()" 
              :key="index"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div 
                class="w-full rounded-t-lg bg-gradient-to-t from-primary-400 to-primary-200 transition-all hover:from-primary-500 hover:to-primary-300"
                :style="{ height: `${(count / (diaryStats?.total || 1)) * 100}px` }"
              ></div>
              <span class="text-xs text-gray-500">{{ moodOptions[index]?.emoji }}</span>
            </div>
          </div>
        </div>
      </section>
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
    
    <Teleport to="body">
      <div 
        v-if="showMoodModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        @click.self="showMoodModal = false"
      >
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full animate-fadeIn">
          <h3 class="text-xl font-semibold text-center text-gray-800 mb-6">今天心情怎么样？</h3>
          
          <div class="grid grid-cols-5 gap-4 mb-6">
            <button
              v-for="option in moodOptions"
              :key="option.score"
              class="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
              :class="{ 'bg-primary-50 ring-2 ring-primary-400': todayMood === option.score }"
              @click="selectMood(option.score)"
            >
              <span class="text-3xl">{{ option.emoji }}</span>
              <span class="text-xs text-gray-600">{{ option.label }}</span>
            </button>
          </div>
          
          <button class="btn-secondary w-full" @click="showMoodModal = false">
            稍后再说
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
