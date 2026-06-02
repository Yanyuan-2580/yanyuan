<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { ClipboardList } from 'lucide-vue-next';

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  category: string;
}

const router = useRouter();
const questionnaires = ref<Questionnaire[]>([]);
const isLoading = ref(true);
const showGuide = ref(!localStorage.getItem('assessment_guide_dismissed'));

const dismissGuide = () => {
  showGuide.value = false;
  localStorage.setItem('assessment_guide_dismissed', '1');
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/questionnaires');
    if (res.code === 200) {
      questionnaires.value = res.data.list || res.data || [];
    }
  } catch (e) {
    console.error('Failed to load questionnaires:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="心理测评" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6">
      <LoadingSpinner v-if="isLoading" message="加载问卷..." />

      <div v-else class="space-y-3">
        <!-- First-time Assessment Guide -->
        <div v-if="showGuide" class="bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl mb-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ClipboardList class="w-5 h-5" />
              </div>
              <div>
                <h2 class="font-bold text-lg">首次心理评估</h2>
                <p class="text-xs text-white/70">了解自己，是改变的第一步</p>
              </div>
            </div>
            <button class="text-white/60 hover:text-white text-2xl leading-none" @click="dismissGuide">&times;</button>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-4">
            <div class="text-center">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                <span class="text-sm font-bold">1</span>
              </div>
              <p class="text-xs text-white/80">选择测评</p>
            </div>
            <div class="text-center">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                <span class="text-sm font-bold">2</span>
              </div>
              <p class="text-xs text-white/80">完成答题</p>
            </div>
            <div class="text-center">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                <span class="text-sm font-bold">3</span>
              </div>
              <p class="text-xs text-white/80">获取建议</p>
            </div>
          </div>
        </div>

        <div
          v-for="q in questionnaires"
          :key="q.id"
          class="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          @click="router.push(`/questionnaire/${q.id}`)"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <ClipboardList class="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-800">{{ q.title }}</h4>
              <p class="text-xs text-gray-500 mt-1">{{ q.description }}</p>
              <span class="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 capitalize">{{ q.category }}</span>
            </div>
          </div>
        </div>

        <EmptyState
          v-if="questionnaires.length === 0"
          emoji="📋"
          title="暂无可用问卷"
          description="敬请期待更多专业心理测评"
        />
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
