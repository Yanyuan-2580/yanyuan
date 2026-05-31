<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { knowledgeApi } from '@/api';
import type { KnowledgeArticle, KnowledgeCategory } from '@/types';
import { BookOpen, Search, ChevronRight, Eye, Heart, Bookmark, Filter } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';

const router = useRouter();
const articles = ref<KnowledgeArticle[]>([]);
const categories = ref<KnowledgeCategory[]>([]);
const currentCategory = ref<number | undefined>(undefined);
const searchQuery = ref('');
const page = ref(1);
const hasMore = ref(true);
const isSearching = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const loadCategories = async () => {
  const res = await knowledgeApi.getCategories();
  if (res.code === 200) {
    categories.value = [{ id: 0, name: '全部', description: '' }, ...res.data];
  }
};

const loadArticles = async (resetPage = false) => {
  if (!hasMore.value) return;
  if (resetPage) {
    page.value = 1;
    articles.value = [];
    hasMore.value = true;
  }
  const res = await knowledgeApi.getArticles(page.value, 10, currentCategory.value || undefined);
  if (res.code === 200) {
    if (res.data.list.length < 10) {
      hasMore.value = false;
    }
    articles.value = [...articles.value, ...res.data.list];
    page.value++;
  }
};

const searchArticles = async (query: string) => {
  if (!query.trim()) {
    loadArticles(true);
    return;
  }
  isSearching.value = true;
  try {
    const res = await knowledgeApi.search(query, 1, 20);
    if (res.code === 200) {
      articles.value = res.data.list || [];
      hasMore.value = false;
    }
  } catch (e) {
    console.error('Search failed:', e);
  } finally {
    isSearching.value = false;
  }
};

// Debounced search
watch(searchQuery, (newVal) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchArticles(newVal);
  }, 300);
});

const selectCategory = (categoryId: number) => {
  currentCategory.value = categoryId === 0 ? undefined : categoryId;
  searchQuery.value = ''; // Clear search when switching categories
  loadArticles(true);
};

onMounted(async () => {
  await loadCategories();
  await loadArticles();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-calm-400 via-primary-500 to-warm-500 text-white p-6 rounded-b-3xl">
      <h1 class="text-2xl font-bold mb-2">心理健康知识库</h1>
      <p class="text-white/80">探索专业的心理健康知识</p>

      <div class="mt-4 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
    </header>

    <main class="p-6">
      <!-- Category filter (hidden when searching) -->
      <section v-if="!searchQuery" class="mb-6">
        <div class="flex items-center gap-2 mb-4">
          <Filter class="w-5 h-5 text-gray-500" />
          <span class="text-sm text-gray-600">分类筛选</span>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="category in categories"
            :key="category.id"
            class="px-4 py-2 rounded-full whitespace-nowrap transition-all"
            :class="currentCategory === (category.id === 0 ? undefined : category.id)
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </section>

      <section>
        <!-- Loading -->
        <div v-if="isSearching" class="text-center py-12">
          <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-sm text-gray-400">搜索中...</p>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article
            v-for="article in articles"
            :key="article.id"
            class="card flex gap-4 cursor-pointer hover:shadow-xl transition-shadow"
            @click="router.push(`/knowledge/${article.id}`)"
          >
            <div class="w-24 h-24 rounded-xl bg-gradient-to-br from-calm-100 to-primary-100 flex-shrink-0 flex items-center justify-center">
              <BookOpen class="w-10 h-10 text-calm-500" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-800 line-clamp-2">{{ article.title }}</h3>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ article.summary }}</p>
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <Eye class="w-4 h-4" />
                  {{ article.viewCount }}
                </span>
                <span class="flex items-center gap-1">
                  <Heart class="w-4 h-4" />
                  {{ article.likeCount }}
                </span>
                <span class="flex items-center gap-1">
                  <Bookmark class="w-4 h-4" />
                  {{ article.collectCount }}
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="tag in (article.tags || []).slice(0, 3)"
                  :key="tag"
                  class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 flex-shrink-0" />
          </article>
        </div>

        <div v-if="articles.length === 0 && !isSearching" class="text-center py-12">
          <BookOpen class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-500">{{ searchQuery ? '未找到相关文章' : '暂无文章' }}</p>
        </div>

        <div v-if="hasMore && !searchQuery" class="text-center mt-6">
          <button class="btn-outline" @click="loadArticles()">
            加载更多
          </button>
        </div>
      </section>
    </main>

    <BottomNavBar active-tab="knowledge" />
  </div>
</template>
