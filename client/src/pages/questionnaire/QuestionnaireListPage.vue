<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
