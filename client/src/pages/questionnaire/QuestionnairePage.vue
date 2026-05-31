<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

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

const router = useRouter();
const route = useRoute();
const questionnaire = ref<Questionnaire | null>(null);
const currentStep = ref(0);
const answers = ref<Record<number, number>>({});
const isLoading = ref(true);
const isSubmitting = ref(false);

onMounted(async () => {
  try {
    const res = await request.get(`/questionnaires/${route.params.id}`);
    if (res.data?.code === 200) {
      questionnaire.value = res.data.data;
    }
  } catch (e) {
    console.error('Failed to load questionnaire:', e);
  } finally {
    isLoading.value = false;
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
    if (res.data?.code === 200) {
      router.push(`/questionnaire/${route.params.id}/result?resultId=${res.data.data.id}`);
    }
  } catch (e) {
    console.error('Failed to submit:', e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader :title="questionnaire?.title || '心理测评'" :show-back="true" />
    <LoadingSpinner v-if="isLoading" />

    <div v-else-if="questionnaire" class="max-w-lg mx-auto px-4 py-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between text-xs text-gray-400 mb-2">
          <span>第 {{ currentStep + 1 }} / {{ questions().length }} 题</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-primary-500 rounded-full transition-all duration-300" :style="{ width: progress + '%' }" />
        </div>
      </div>

      <!-- Question -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-medium text-gray-800 mb-6">{{ currentQuestion()?.text }}</h3>
        <div class="space-y-3">
          <button
            v-for="opt in currentQuestion()?.options || []"
            :key="opt.value"
            class="w-full text-left p-4 rounded-xl border-2 transition-all text-sm"
            :class="answers[currentQuestion()?.id] === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'"
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
          class="px-6 py-2 text-sm text-gray-500 hover:text-gray-700"
          @click="currentStep--"
        >上一题</button>
        <div v-else />
        <button
          v-if="currentStep < questions().length - 1"
          class="px-6 py-2 text-sm text-primary-500"
          :disabled="answers[currentQuestion()?.id] === undefined"
          @click="currentStep++"
        >下一题</button>
        <button
          v-else
          class="btn-primary px-6 py-2 text-sm"
          :disabled="!allAnswered() || isSubmitting"
          @click="submit"
        >
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
