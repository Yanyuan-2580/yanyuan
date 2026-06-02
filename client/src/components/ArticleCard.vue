<template>
  <article
    class="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-50"
    @click="goToArticle"
  >
    <div v-if="article.coverUrl" class="overflow-hidden">
      <img
        :src="article.coverUrl"
        :alt="article.title"
        class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div class="p-4" :class="{ 'pt-4': !article.coverUrl }">
      <h3 class="text-[15px] font-semibold text-gray-800 mb-1.5 line-clamp-2 group-hover:text-calm-600 transition-colors">
        {{ article.title }}
      </h3>
      <p v-if="showSummary && article.content" class="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">
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
        <div v-if="article.tags && article.tags.length > 0" class="flex gap-1.5">
          <span
            v-for="tag in article.tags.slice(0, 2)"
            :key="tag"
            class="px-2.5 py-0.5 bg-calm-50 text-calm-600 rounded-full text-[11px] font-medium"
          >
            {{ tag }}
          </span>
        </div>
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
