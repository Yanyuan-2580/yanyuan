<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { MessageCircle } from 'lucide-vue-next';

interface Result {
  id: number;
  totalScore: number;
  resultLevel: 'low' | 'moderate' | 'high';
  aiAdvice: string;
  createdAt: string;
}
const router = useRouter();
const route = useRoute();
const result = ref<Result | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  const resultId = route.query.resultId;
  try {
    const res = await request.get(`/questionnaires/results/${resultId}`);
    if (res.data?.code === 200) {
      result.value = res.data.data;
    }
  } catch (e) {
    console.error('Failed to load result:', e);
  } finally {
    isLoading.value = false;
  }
});

const levelConfig = (level: string) => {
  switch (level) {
    case 'low': return { label: '状态良好', color: 'text-green-600', bg: 'bg-green-50', emoji: '😊' };
    case 'moderate': return { label: '需要关注', color: 'text-amber-600', bg: 'bg-amber-50', emoji: '🤔' };
    case 'high': return { label: '建议咨询', color: 'text-red-600', bg: 'bg-red-50', emoji: '😟' };
    default: return { label: '--', color: 'text-gray-600', bg: 'bg-gray-50', emoji: '😐' };
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader title="测评结果" :show-back="true" />
    <LoadingSpinner v-if="isLoading" />

    <div v-else-if="result" class="max-w-lg mx-auto px-4 py-6 space-y-4">
      <!-- Score -->
      <div class="bg-white rounded-2xl p-6 shadow-sm text-center">
        <p class="text-5xl mb-2">{{ levelConfig(result.resultLevel).emoji }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ result.totalScore }} <span class="text-sm text-gray-400">分</span></p>
        <p class="text-sm mt-2" :class="levelConfig(result.resultLevel).color">
          {{ levelConfig(result.resultLevel).label }}
        </p>
      </div>

      <!-- AI Advice -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">AI 建议</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ result.aiAdvice }}</p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          class="btn-primary w-full py-3 flex items-center justify-center gap-2"
          @click="router.push('/chat')"
        >
          <MessageCircle class="w-5 h-5" />
          和 AI 聊聊感受
        </button>
        <button class="w-full py-3 text-sm text-gray-500" @click="router.push('/questionnaire')">
          返回问卷列表
        </button>
      </div>
    </div>
  </div>
</template>
