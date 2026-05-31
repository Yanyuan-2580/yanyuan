<template>
  <article
    class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-50"
    @click="goToArticle"
  >
    <div v-if="article.coverUrl" class="mb-3 -mx-4 -mt-4">
      <img
        :src="article.coverUrl"
        :alt="article.title"
        class="w-full h-36 object-cover rounded-t-2xl"
      />
    </div>
    <h3 class="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
      {{ article.title }}
    </h3>
    <p v-if="showSummary && article.content" class="text-sm text-gray-500 mb-3 line-clamp-2">
      {{ stripHtml(article.content) }}
    </p>
    <div class="flex items-center justify-between text-xs text-gray-400">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <Eye class="w-3.5 h-3.5" /> {{ article.viewCount || 0 }}
        </span>
        <span class="flex items-center gap-1">
          <Heart class="w-3.5 h-3.5" /> {{ article.likeCount || 0 }}
        </span>
        <span class="flex items-center gap-1">
          <Bookmark class="w-3.5 h-3.5" /> {{ article.collectCount || 0 }}
        </span>
      </div>
      <div v-if="article.tags && article.tags.length > 0" class="flex gap-1">
        <span
          v-for="tag in article.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Eye, Heart, Bookmark } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  article: {
    id: number;
    title: string;
    content?: string;
    coverUrl?: string;
    tags?: string[];
    viewCount?: number;
    likeCount?: number;
    collectCount?: number;
  };
  showSummary?: boolean;
}>(), {
  showSummary: true
});

const router = useRouter();

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/[#*_~`]/g, '').substring(0, 120);
}

function goToArticle() {
  router.push(`/knowledge/${props.article.id}`);
}
</script>
