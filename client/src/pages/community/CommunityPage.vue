<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();
const diaries = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const pageSize = 20;

const moodEmojis: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😤', anxious: '😰', calm: '😌',
};

const loadDiaries = async () => {
  loading.value = true;
  try {
    const res = await request.get('/diaries/public/list', {
      params: { page: page.value, pageSize },
    });
    if (res.data?.code === 200) {
      diaries.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch {
    // fallback
    diaries.value = [];
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  page.value++;
  try {
    const res = await request.get('/diaries/public/list', {
      params: { page: page.value, pageSize },
    });
    if (res.data?.code === 200) {
      diaries.value = [...diaries.value, ...res.data.data.list];
    }
  } catch { /* ignore */ }
};

onMounted(() => loadDiaries());
</script>

<template>
  <div class="min-h-screen pb-24 bg-soft-50 dark:bg-charcoal-900">
    <PageHeader title="心情社区" subtitle="看看大家的心情日记" />

    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <LoadingSpinner v-if="loading && !diaries.length" />

      <EmptyState
        v-else-if="!loading && !diaries.length"
        message="还没有公开日记，快来写第一篇吧~"
      />

      <article
        v-for="diary in diaries"
        :key="diary.id"
        class="card dark:bg-charcoal-800 dark:border-charcoal-700 cursor-pointer hover:shadow-card-hover transition-shadow"
        @click="router.push(`/community/diary/${diary.id}`)"
      >
        <div class="flex items-start gap-4">
          <div class="text-3xl">{{ moodEmojis[diary.moodTags?.[0]] || '💭' }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                {{ diary.author?.nickname || '匿名用户' }}
              </span>
              <span class="text-xs text-gray-400">
                {{ new Date(diary.createdAt).toLocaleDateString('zh-CN') }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {{ diary.content }}
            </p>
            <div class="flex gap-2 mt-2">
              <span
                v-for="tag in diary.moodTags"
                :key="tag"
                class="px-2 py-0.5 rounded-full text-xs bg-calm-50 dark:bg-calm-900/30 text-calm-600 dark:text-calm-400"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </article>

      <button
        v-if="diaries.length < total"
        class="w-full py-3 text-sm text-primary-500 hover:text-primary-600"
        @click="loadMore"
      >
        加载更多
      </button>
    </div>

    <BottomNavBar active-tab="community" />
  </div>
</template>
