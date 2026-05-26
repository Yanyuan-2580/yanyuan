<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { knowledgeApi } from '@/api';
import type { KnowledgeArticle, KnowledgeCategory } from '@/types';
import { BookOpen, Search, ChevronRight, Eye, Heart, Bookmark, Filter } from 'lucide-vue-next';
const router = useRouter();
const articles = ref<KnowledgeArticle[]>([]);
const categories = ref<KnowledgeCategory[]>([]);
const currentCategory = ref<number | undefined>(undefined);
const searchQuery = ref('');
const page = ref(1);
const hasMore = ref(true);
const loadCategories = async () => {
 const res = await knowledgeApi.getCategories();
 if (res.code === 200) {
 categories.value = [{ id: 0, name: '全部', description: '' }, ...res.data];
 }
};
const loadArticles = async (resetPage = false) => {
 if (!hasMore.value)
 return;
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
const selectCategory = (categoryId: number) => {
 currentCategory.value = categoryId === 0 ? undefined : categoryId;
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
      <section class="mb-6">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  v-for="tag in article.tags.slice(0, 3)" 
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
        
        <div v-if="articles.length === 0" class="text-center py-12">
          <BookOpen class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-500">暂无文章</p>
        </div>
        
        <div v-if="hasMore" class="text-center mt-6">
          <button class="btn-outline" @click="loadArticles()">
            加载更多
          </button>
        </div>
      </section>
    </main>
    
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <div class="max-w-lg mx-auto flex justify-around">
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path === '/' }"
          @click="router.push('/')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
            <path d="M9 22V12h6v10" />
            <path d="M16 2H8a2 2 0 0 0-2 2v3" />
            <path d="M16 2h2a2 2 0 0 1 2 2v3" />
            <path d="M8 22h1" />
            <path d="M12 22h1" />
            <path d="M16 22h1" />
          </svg>
          <span class="text-xs">首页</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/chat') }"
          @click="router.push('/chat')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-xs">咨询</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/diary') }"
          @click="router.push('/diary')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="text-xs">日记</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/knowledge') }"
          @click="router.push('/knowledge')"
        >
          <BookOpen class="w-6 h-6" />
          <span class="text-xs">知识</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/user') }"
          @click="router.push('/user')"
        >
          <span class="text-lg">👤</span>
          <span class="text-xs">我的</span>
        </button>
      </div>
    </nav>
  </div>
</template>