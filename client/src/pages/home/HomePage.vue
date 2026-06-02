<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { diaryApi, knowledgeApi } from '@/api';
import type { MoodDiary, KnowledgeArticle } from '@/types';
import { MessageCircle, BookOpen, Calendar, Heart, Star, ChevronRight, TrendingUp, Smile, Lightbulb, Zap, Phone, Music, ClipboardList } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';
import type { DiaryStats } from '@/api/modules/diary';

const router = useRouter();
const userStore = useUserStore();
const isPageLoading = ref(true);
const todayMood = ref<number>(3);
const diaryStats = ref<DiaryStats | null>(null);
const recentDiary = ref<MoodDiary | null>(null);
const recentArticles = ref<KnowledgeArticle[]>([]);

const quickActions = [
  { icon: MessageCircle, label: 'AI咨询', path: '/chat', bg: 'bg-gradient-to-br from-amber-400 to-orange-400', desc: '随时陪伴' },
  { icon: Calendar, label: '情绪日记', path: '/diary', bg: 'bg-gradient-to-br from-rose-300 to-pink-400', desc: '记录心情' },
  { icon: Lightbulb, label: '冥想疗愈', path: '/meditation', bg: 'bg-gradient-to-br from-emerald-300 to-teal-400', desc: '放松身心' },
  { icon: Zap, label: '心理测评', path: '/questionnaire', bg: 'bg-gradient-to-br from-violet-300 to-purple-400', desc: '了解自己' },
  { icon: BookOpen, label: '知识库', path: '/knowledge', bg: 'bg-gradient-to-br from-sky-300 to-blue-400', desc: '学习成长' },
];

const moodOptions = [
  { score: 1, emoji: '😢', label: '非常难过' },
  { score: 2, emoji: '😔', label: '有点低落' },
  { score: 3, emoji: '😐', label: '一般' },
  { score: 4, emoji: '😊', label: '比较开心' },
  { score: 5, emoji: '😄', label: '非常开心' }
];

const showMoodModal = ref(false);
const showAssessmentCta = ref(!localStorage.getItem('assessment_completed'));

const selectMood = async (score: number) => {
  todayMood.value = score;
  showMoodModal.value = false;
  try {
    await diaryApi.create({ moodScore: score });
    await loadDiaryData();
  } catch (e) { /* ignore */ }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

const getScoreDistributionArray = () => {
  if (!diaryStats.value?.scoreDistribution) return [0, 0, 0, 0, 0];
  return [1, 2, 3, 4, 5].map(score => diaryStats.value.scoreDistribution[score] || 0);
};

const loadArticles = async () => {
  try {
    const res = await knowledgeApi.getArticles(1, 4);
    if (res.code === 200) {
      recentArticles.value = res.data.list;
    }
  } catch (e) { /* ignore */ }
};

const loadDiaryData = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  try {
    const [statsRes, diaryRes] = await Promise.allSettled([
      diaryApi.stats('week'),
      diaryApi.list(1, 1)
    ]);
    if (statsRes.status === 'fulfilled' && statsRes.value.code === 200) {
      diaryStats.value = statsRes.value.data;
    }
    if (diaryRes.status === 'fulfilled' && diaryRes.value.code === 200 && diaryRes.value.data.list.length > 0) {
      recentDiary.value = diaryRes.value.data.list[0];
    }
  } catch (e) { /* ignore */ }
};

const recommendations = computed(() => {
  const avgScore = diaryStats.value?.avgScore ? Number(diaryStats.value.avgScore) : 3;
  const recs: { title: string; desc: string; path: string; icon: any; bg: string }[] = [];

  if (avgScore <= 2.5) {
    recs.push(
      { title: '5分钟呼吸放松', desc: '帮助缓解焦虑和压力', path: '/meditation', icon: Music, bg: 'bg-gradient-to-br from-calm-400 to-calm-500' },
      { title: '情绪管理自评量表', desc: '了解当前情绪状态', path: '/questionnaire', icon: ClipboardList, bg: 'bg-gradient-to-br from-primary-400 to-warm-400' },
      { title: '与AI聊聊你的感受', desc: '24小时倾听，无评判的陪伴', path: '/chat', icon: Zap, bg: 'bg-gradient-to-br from-amber-400 to-orange-400' }
    );
  } else {
    recs.push(
      { title: '正念冥想练习', desc: '提升专注力和幸福感', path: '/meditation', icon: Music, bg: 'bg-gradient-to-br from-calm-400 to-calm-500' },
      { title: '性格优势测评', desc: '发现你的内在力量', path: '/questionnaire', icon: ClipboardList, bg: 'bg-gradient-to-br from-primary-400 to-warm-400' },
      { title: '保持你的好心情', desc: '与AI分享今天的快乐', path: '/chat', icon: Zap, bg: 'bg-gradient-to-br from-amber-400 to-orange-400' }
    );
  }
  return recs;
});

onMounted(async () => {
  await loadArticles();
  await loadDiaryData();
  isPageLoading.value = false;
});
</script>

<template>
  <div class="min-h-screen pb-24 animate-page-enter">
    <!-- Header -->
    <header class="bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 px-6 pt-10 pb-8 rounded-b-3xl">
      <!-- Top bar -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-amber-700 text-sm font-medium">{{ getGreeting() }} 👋</p>
          <h1 class="text-2xl font-bold text-gray-800 mt-1">{{ userStore.user?.nickname || '朋友' }}</h1>
        </div>
        <button
          class="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-all"
          @click="router.push('/user')"
        >
          <Smile class="w-6 h-6 text-amber-500" />
        </button>
      </div>

      <!-- Mood Card -->
      <div class="bg-white/60 backdrop-blur rounded-2xl p-5 shadow-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">本周心情指数</p>
            <div class="flex items-end gap-2 mt-1">
              <span class="text-4xl">{{ diaryStats?.avgScore ? moodOptions[Math.min(Math.max(Math.round(Number(diaryStats.avgScore)) - 1, 0), 4)]?.emoji : '😐' }}</span>
              <span class="text-3xl font-bold text-gray-800">{{ diaryStats?.avgScore || '--' }}</span>
              <span class="text-gray-400 text-sm mb-1">/ 5</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">本周记录</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ diaryStats?.total ?? '0' }} <span class="text-sm text-gray-400 font-normal">天</span></p>
          </div>
        </div>
        <!-- Quick mood record -->
        <button
          class="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
          @click="showMoodModal = true"
        >
          ✨ 记录今日心情
        </button>
      </div>

      <!-- Quick Help Banner -->
      <div class="mt-3 bg-gradient-to-r from-rose-100 via-amber-50 to-orange-50 rounded-2xl p-4 border border-rose-100/50 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Heart class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800">需要即时帮助？</p>
          <p class="text-xs text-gray-400 mt-0.5">点击与AI助手对话，或查看心理援助热线</p>
        </div>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-white rounded-xl text-sm font-medium text-rose-600 shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
            @click="router.push('/chat')"
          >
            立即倾诉
          </button>
          <button
            class="px-4 py-2 bg-white/50 rounded-xl text-sm font-medium text-rose-500 hover:bg-white hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
            @click="router.push('/user/hotline')"
          >
            援助热线
          </button>
        </div>
      </div>
    </header>

    <main class="px-6 -mt-2">
      <!-- Quick Actions -->
      <section class="py-6">
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="flex flex-col items-center gap-2 group"
            @click="router.push(action.path)"
          >
            <div :class="[action.bg, 'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-soft group-hover:shadow-md transition-all group-active:scale-95']">
              <component :is="action.icon" class="w-6 h-6" />
            </div>
            <span class="text-xs font-medium text-gray-600">{{ action.label }}</span>
          </button>
        </div>
      </section>

      <!-- Assessment CTA (new users) -->
      <section v-if="showAssessmentCta" class="mb-6">
        <div class="bg-gradient-to-br from-violet-400 via-purple-400 to-indigo-500 rounded-2xl p-5 text-white shadow-soft">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold">了解你的心理状态</h2>
              <p class="text-sm text-white/80 mt-1">完成首次心理评估，获取个性化建议</p>
            </div>
            <button
              class="px-5 py-2.5 bg-white/20 backdrop-blur rounded-xl text-sm font-semibold hover:bg-white/30 transition-all active:scale-95 flex-shrink-0"
              @click="router.push('/questionnaire')"
            >
              开始评估
            </button>
          </div>
        </div>
      </section>

      <!-- AI Recommendations -->
      <section v-if="diaryStats?.avgScore" class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Zap class="w-4 h-4 text-purple-500" />
            为你推荐
          </h2>
          <span class="text-xs text-gray-400">基于你的情绪状态</span>
        </div>
        <div class="space-y-3">
          <div v-for="rec in recommendations" :key="rec.label"
               class="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-all hover-lift"
               @click="router.push(rec.path)">
            <div :class="[rec.bg, 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0']">
              <component :is="rec.icon" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-800 text-sm">{{ rec.title }}</h3>
              <p class="text-xs text-gray-400 mt-0.5">{{ rec.desc }}</p>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0" />
          </div>
        </div>
      </section>

      <!-- Recommended Articles -->
      <section class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Star class="w-4 h-4 text-amber-500" />
            今日推荐
          </h2>
          <button class="text-amber-600 text-sm flex items-center gap-1 font-medium" @click="router.push('/knowledge')">
            更多 <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Loading skeletons -->
        <div v-if="isPageLoading" class="space-y-3">
          <div v-for="i in 2" :key="i" class="bg-white rounded-2xl p-4 flex gap-4 animate-pulse">
            <div class="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 w-3/4 bg-gray-100 rounded-lg" />
              <div class="h-3 w-1/2 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>

        <!-- Article cards -->
        <div v-else-if="recentArticles.length > 0" class="space-y-3">
          <article
            v-for="article in recentArticles"
            :key="article.id"
            class="bg-white rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-card-hover transition-all hover-lift"
            @click="router.push(`/knowledge/${article.id}`)"
          >
            <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0 flex items-center justify-center">
              <BookOpen class="w-8 h-8 text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-800 text-sm line-clamp-2 leading-snug">{{ article.title }}</h3>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>👁️ {{ article.viewCount }}</span>
                <span>❤️ {{ article.likeCount }}</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="tag in (article.tags || []).slice(0, 2)"
                  :key="tag"
                  class="tag text-[10px]"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty state -->
        <div v-else class="bg-white rounded-2xl p-8 text-center">
          <BookOpen class="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p class="text-sm text-gray-400">暂无推荐文章</p>
        </div>
      </section>

      <!-- Recent Diary -->
      <section v-if="recentDiary" class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Calendar class="w-4 h-4 text-rose-500" />
            最近记录
          </h2>
          <button class="text-amber-600 text-sm flex items-center gap-1 font-medium" @click="router.push('/diary')">
            全部 <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="bg-white rounded-2xl p-5 hover:shadow-card-hover transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ moodOptions[recentDiary.moodScore - 1]?.emoji }}</span>
              <div>
                <p class="font-medium text-gray-800 text-sm">{{ moodOptions[recentDiary.moodScore - 1]?.label }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ new Date(recentDiary.createdAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }) }}</p>
              </div>
            </div>
          </div>
          <p v-if="recentDiary.content" class="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{{ recentDiary.content }}</p>
          <div v-if="recentDiary.aiInsight" class="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p class="text-xs text-amber-800 leading-relaxed"><span class="font-medium">💡 AI洞察：</span>{{ recentDiary.aiInsight }}</p>
          </div>
        </div>
      </section>

      <!-- Mood Trend -->
      <section>
        <h2 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-amber-500" />
          情绪趋势
        </h2>
        <div class="bg-white rounded-2xl p-5">
          <div class="flex items-end justify-between gap-3 h-28">
            <div
              v-for="(count, index) in getScoreDistributionArray()"
              :key="index"
              class="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                class="w-full rounded-t-lg transition-all duration-500"
                :class="index === 0 ? 'bg-gradient-to-t from-blue-300 to-blue-200' :
                        index === 1 ? 'bg-gradient-to-t from-indigo-300 to-indigo-200' :
                        index === 2 ? 'bg-gradient-to-t from-amber-300 to-amber-200' :
                        index === 3 ? 'bg-gradient-to-t from-orange-300 to-orange-200' :
                                     'bg-gradient-to-t from-rose-300 to-rose-200'"
                :style="{ height: `${Math.max((count / (diaryStats?.total || 1)) * 100, 6)}px` }"
              ></div>
              <span class="text-sm">{{ moodOptions[index]?.emoji }}</span>
            </div>
          </div>
          <div class="flex justify-between mt-3 text-[10px] text-gray-400">
            <span>难过</span>
            <span>开心</span>
          </div>
        </div>
      </section>
    </main>

    <BottomNavBar active-tab="home" />

    <!-- Mood Modal -->
    <Teleport to="body">
      <div
        v-if="showMoodModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        @click.self="showMoodModal = false"
      >
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
          <h3 class="text-xl font-semibold text-center text-gray-800 mb-2">今天心情怎么样？</h3>
          <p class="text-sm text-gray-400 text-center mb-6">记录此刻的感受</p>
          <div class="grid grid-cols-5 gap-3 mb-6">
            <button
              v-for="option in moodOptions"
              :key="option.score"
              class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:bg-gray-50"
              :class="{ 'bg-amber-50 ring-2 ring-amber-400 scale-110': todayMood === option.score }"
              @click="selectMood(option.score)"
            >
              <span class="text-3xl">{{ option.emoji }}</span>
              <span class="text-[10px] text-gray-500">{{ option.label }}</span>
            </button>
          </div>
          <button class="w-full py-3 text-sm text-gray-400 hover:text-gray-600 font-medium" @click="showMoodModal = false">
            稍后再说
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
