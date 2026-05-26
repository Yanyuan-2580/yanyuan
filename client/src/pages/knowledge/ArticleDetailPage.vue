<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { knowledgeApi } from '@/api';
import type { KnowledgeArticle } from '@/types';
import { ArrowLeft, Eye, Heart, Bookmark, Share2, Calendar, User } from 'lucide-vue-next';
const route = useRoute();
const router = useRouter();
const article = ref<KnowledgeArticle | null>(null);
const isLiked = ref(false);
const isCollected = ref(false);
const likeCount = ref(0);
const collectCount = ref(0);
const loadArticle = async () => {
 const id = parseInt(route.params.id as string);
 const [articleRes, likedRes, collectedRes] = await Promise.all([
 knowledgeApi.getArticle(id),
 knowledgeApi.isLiked(id),
 knowledgeApi.isCollected(id)
 ]);
 if (articleRes.code === 200) {
 article.value = articleRes.data;
 likeCount.value = articleRes.data.likeCount;
 collectCount.value = articleRes.data.collectCount;
 }
 if (likedRes.code === 200) {
 isLiked.value = likedRes.data;
 }
 if (collectedRes.code === 200) {
 isCollected.value = collectedRes.data;
 }
};
const handleLike = async () => {
 const id = parseInt(route.params.id as string);
 const res = await knowledgeApi.like(id);
 if (res.code === 200) {
 isLiked.value = res.data.liked;
 likeCount.value = res.data.count;
 }
};
const handleCollect = async () => {
 const id = parseInt(route.params.id as string);
 const res = await knowledgeApi.collect(id);
 if (res.code === 200) {
 isCollected.value = res.data.collected;
 collectCount.value = res.data.count;
 }
};
onMounted(async () => {
 await loadArticle();
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-calm-400 via-primary-500 to-warm-500 text-white p-6">
      <div class="flex items-center gap-4">
        <button 
          class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
          @click="router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-lg font-semibold">文章详情</h1>
        </div>
      </div>
    </header>
    
    <main v-if="article" class="p-6">
      <article class="card">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ article.title }}</h2>
        
        <div class="flex items-center gap-6 mb-6 text-sm text-gray-500">
          <span class="flex items-center gap-2">
            <User class="w-4 h-4" />
            {{ article.author }}
          </span>
          <span class="flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            {{ new Date(article.createdAt).toLocaleDateString('zh-CN') }}
          </span>
          <span class="flex items-center gap-2">
            <Eye class="w-4 h-4" />
            {{ article.viewCount }}
          </span>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <span 
            v-for="tag in article.tags" 
            :key="tag"
            class="px-3 py-1 bg-primary-100 text-primary-600 text-sm rounded-full"
          >
            {{ tag }}
          </span>
        </div>
        
        <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          <p v-html="article.content"></p>
        </div>
      </article>
      
      <div class="card mt-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <button 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              :class="isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500'"
              @click="handleLike"
            >
              <Heart class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" />
              <span class="text-sm font-medium">{{ likeCount }}</span>
            </button>
            
            <button 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              :class="isCollected ? 'bg-primary-50 text-primary-500' : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-500'"
              @click="handleCollect"
            >
              <Bookmark class="w-5 h-5" :fill="isCollected ? 'currentColor' : 'none'" />
              <span class="text-sm font-medium">{{ collectCount }}</span>
            </button>
          </div>
          
          <button class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all">
            <Share2 class="w-5 h-5" />
            <span class="text-sm font-medium">分享</span>
          </button>
        </div>
      </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
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