<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { History, TrendingUp } from 'lucide-vue-next';

interface Question {
  id: number;
  text: string;
  options: { value: number; label: string; score: number }[];
}
interface Questionnaire {
  id: number;
  title: string;
  description: string;
  category: string;
  questions: Question[];
}
interface PreviousResult {
  id: number;
  totalScore: number;
  resultLevel: 'low' | 'moderate' | 'high';
  createdAt: string;
}

const router = useRouter();
const route = useRoute();
const questionnaire = ref<Questionnaire | null>(null);
const currentStep = ref(0);
const answers = ref<Record<number, number>>({});
const isLoading = ref(true);
const isSubmitting = ref(false);
const previousResult = ref<PreviousResult | null>(null);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const prevLevelLabel = (level: string) => {
  switch (level) {
    case 'low': return '状态良好';
    case 'moderate': return '需要关注';
    case 'high': return '建议咨询';
    default: return '';
  }
};

const prevLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-emerald-600 bg-emerald-50';
    case 'moderate': return 'text-calm-600 bg-calm-50';
    case 'high': return 'text-rose-500 bg-rose-50';
    default: return 'text-gray-500 bg-gray-50';
  }
};

onMounted(async () => {
  try {
    const res = await request.get(`/questionnaires/${route.params.id}`);
    if (res.code === 200) {
      questionnaire.value = res.data;
    }
  } catch (e) {
    console.error('Failed to load questionnaire:', e);
  } finally {
    isLoading.value = false;
  }

  // 如果是已登录用户，获取上次测评分数
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      const prevRes = await request.get(`/questionnaires/${route.params.id}/latest-result`);
      if (prevRes.code === 200 && prevRes.data) {
        previousResult.value = prevRes.data;
      }
    } catch (e) {
      // 没有历史记录或其他错误，静默处理
    }
  }
});

const questions = () => questionnaire.value?.questions || [];
const currentQuestion = () => questions()[currentStep.value];
const progress = () => questions().length > 0 ? Math.round(((currentStep.value + 1) / questions().length) * 100) : 0;

const selectOption = (questionId: number, value: number) => {
  answers.value[questionId] = value;
  if (currentStep.value < questions().length - 1) {
    setTimeout(() => { currentStep.value++; }, 300);
  }
};

const allAnswered = () => questions().every(q => answers.value[q.id] !== undefined);

const submit = async () => {
  if (!allAnswered()) {
    alert('请回答所有问题');
    return;
  }
  isSubmitting.value = true;
  try {
    const answerData = Object.entries(answers.value).map(([qid, val]) => ({ questionId: parseInt(qid), selectedValue: val }));
    const res = await request.post(`/questionnaires/${route.params.id}/submit`, { answers: answerData });
    if (res.code === 200) {
      router.push(`/questionnaire/${route.params.id}/result?resultId=${res.data.id}`);
    }
  } catch (e) {
    console.error('Failed to submit:', e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader :title="questionnaire?.title || '心理测评'" :show-back="true" />
    <LoadingSpinner v-if="isLoading" />

    <div v-else-if="questionnaire" class="max-w-lg mx-auto px-4 py-6">
      <!-- Previous Result -->
      <div
        v-if="previousResult"
        class="mb-4 bg-white rounded-2xl border border-gray-50 p-4 shadow-card"
      >
        <div class="flex items-center gap-2 mb-2">
          <History class="w-4 h-4 text-gray-400" />
          <span class="text-xs text-gray-400">上次测评 · {{ formatDate(previousResult.createdAt) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-800">{{ previousResult.totalScore }}</span>
            <span class="text-sm text-gray-400">分</span>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium" :class="prevLevelColor(previousResult.resultLevel)">
            {{ prevLevelLabel(previousResult.resultLevel) }}
          </span>
        </div>
        <div class="mt-2 flex items-center gap-1 text-xs text-calm-500">
          <TrendingUp class="w-3.5 h-3.5" />
          <span>请根据近期真实感受作答，对比上次结果看变化</span>
        </div>
      </div>

      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between text-xs text-gray-400 mb-2">
          <span>第 {{ currentStep + 1 }} / {{ questions().length }} 题</span>
          <span>{{ progress() }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-calm-500 to-emerald-500 rounded-full transition-all duration-300" :style="{ width: progress() + '%' }" />
        </div>
      </div>

      <!-- Question -->
      <div class="bg-white rounded-2xl border border-gray-50 p-6 shadow-card">
        <h3 class="text-lg font-medium text-gray-800 mb-6">{{ currentQuestion()?.text }}</h3>
        <div class="space-y-3">
          <button
            v-for="opt in currentQuestion()?.options || []"
            :key="opt.value"
            class="w-full text-left p-4 rounded-xl border-2 transition-all text-sm"
            :class="answers[currentQuestion()?.id] === opt.value ? 'border-calm-500 bg-calm-50 text-calm-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'"
            @click="selectOption(currentQuestion()?.id, opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Nav -->
      <div class="flex justify-between mt-6">
        <button
          v-if="currentStep > 0"
          class="bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600 px-6 py-2 text-sm rounded-xl transition-all duration-200"
          @click="currentStep--"
        >上一题</button>
        <div v-else />
        <button
          v-if="currentStep < questions().length - 1"
          class="px-6 py-2 text-sm text-calm-500 hover:text-calm-600"
          :disabled="answers[currentQuestion()?.id] === undefined"
          @click="currentStep++"
        >下一题</button>
        <button
          v-else
          class="bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 px-6 py-2 text-sm rounded-xl font-medium transition-all duration-200"
          :disabled="!allAnswered() || isSubmitting"
          @click="submit"
        >
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
