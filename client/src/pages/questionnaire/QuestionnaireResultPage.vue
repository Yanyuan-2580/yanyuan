<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { MessageCircle } from 'lucide-vue-next';

interface ScoringRange {
  min: number;
  max: number;
  level: 'low' | 'moderate' | 'high';
  label: string;
}
interface Result {
  id: number;
  totalScore: number;
  resultLevel: 'low' | 'moderate' | 'high';
  aiAdvice: string;
  createdAt: string;
  questionnaire?: {
    title: string;
    scoringRules?: ScoringRange[];
  };
}
const router = useRouter();
const route = useRoute();
const result = ref<Result | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  const resultId = route.query.resultId;
  try {
    const res = await request.get(`/questionnaires/results/${resultId}`);
    if (res.code === 200) {
      result.value = res.data;
    }
  } catch (e) {
    console.error('Failed to load result:', e);
  } finally {
    isLoading.value = false;
  }
});

const isCurrentRange = (range: ScoringRange) => {
  return result.value!.totalScore >= range.min && result.value!.totalScore <= range.max;
};
const isInAnyRange = computed(() => {
  if (!result.value?.questionnaire?.scoringRules) return false;
  return result.value.questionnaire.scoringRules.some(
    r => result.value!.totalScore >= r.min && result.value!.totalScore <= r.max
  );
});

const levelConfig = (level: string) => {
  switch (level) {
    case 'low': return { label: '状态良好', color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '😊' };
    case 'moderate': return { label: '需要关注', color: 'text-calm-600', bg: 'bg-calm-50', emoji: '🤔' };
    case 'high': return { label: '建议咨询', color: 'text-rose-500', bg: 'bg-rose-50', emoji: '😟' };
    default: return { label: '--', color: 'text-gray-500', bg: 'bg-gray-50', emoji: '😐' };
  }
};
</script>

<template>
  <div class="relative min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader title="测评结果" :show-back="true" />
    <!-- Decorative blob -->
    <div class="absolute top-20 right-0 -z-10 w-64 h-64 bg-calm-200/20 rounded-full blur-3xl pointer-events-none"></div>
    <LoadingSpinner v-if="isLoading" />

    <div v-else-if="result" class="max-w-lg mx-auto px-4 py-6 space-y-4">
      <!-- Score -->
      <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 hover:shadow-card-hover transition-shadow text-center">
        <p class="text-5xl mb-2">{{ levelConfig(result.resultLevel).emoji }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ result.totalScore }} <span class="text-sm text-gray-400">分</span></p>
        <p class="text-sm mt-2" :class="levelConfig(result.resultLevel).color">
          {{ levelConfig(result.resultLevel).label }}
        </p>
      </div>

      <!-- Scoring Guide -->
      <div v-if="result.questionnaire?.scoringRules?.length" class="bg-white rounded-2xl shadow-card border border-gray-50 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">评分说明</h3>
        <div class="space-y-2">
          <div
            v-for="(range, idx) in result.questionnaire.scoringRules"
            :key="idx"
            class="flex items-center gap-3 p-3 rounded-xl"
            :class="isCurrentRange(range) ? (range.level === 'low' ? 'bg-emerald-50 ring-1 ring-emerald-300' : range.level === 'moderate' ? 'bg-calm-50 ring-1 ring-calm-300' : 'bg-rose-50 ring-1 ring-rose-300') : 'bg-gray-50'"
          >
            <span class="text-lg">{{ levelConfig(range.level).emoji }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700">{{ range.min }}–{{ range.max }} 分</p>
              <p class="text-xs text-gray-500">{{ range.label }}</p>
            </div>
            <span v-if="isCurrentRange(range)" class="text-xs font-medium" :class="levelConfig(range.level).color">当前</span>
          </div>
        </div>
        <p v-if="!isInAnyRange" class="mt-3 text-xs text-gray-400 text-center">
          得分 {{ result.totalScore }} 分，{{ result.totalScore < result.questionnaire.scoringRules[0].min ? '低于标准参考区间' : '高于标准参考区间' }}
        </p>
      </div>

      <!-- AI Advice -->
      <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 hover:shadow-card-hover transition-shadow">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">AI 建议</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ result.aiAdvice }}</p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          class="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-xl transition-all duration-200 text-sm font-medium"
          @click="router.push('/chat')"
        >
          <MessageCircle class="w-5 h-5" />
          和 AI 聊聊感受
        </button>
        <button class="w-full py-3 text-sm bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600 rounded-xl transition-all duration-200" @click="router.push('/questionnaire')">
          返回问卷列表
        </button>
      </div>
    </div>
  </div>
</template>
