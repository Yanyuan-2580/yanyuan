<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { knowledgeApi } from '@/api';
import { request } from '@/api/request';
import type { KnowledgeArticle } from '@/types';
import { ArrowLeft, Eye, Heart, Bookmark, Share2, Calendar, User } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';
import CommentList from '@/components/CommentList.vue';
import CommentForm from '@/components/CommentForm.vue';

const route = useRoute();
const router = useRouter();
const article = ref<KnowledgeArticle | null>(null);
const isLiked = ref(false);
const isCollected = ref(false);
const likeCount = ref(0);
const collectCount = ref(0);

// Comments
const comments = ref<any[]>([]);
const commentsTotal = ref(0);
const commentsPage = ref(1);
const commentsHasMore = ref(false);

const articleId = () => parseInt(route.params.id as string);

const loadArticle = async () => {
  const id = articleId();
  try {
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
    if (likedRes.code === 200) isLiked.value = likedRes.data;
    if (collectedRes.code === 200) isCollected.value = collectedRes.data;
  } catch (e) {
    console.error('Failed to load article:', e);
  }
};

const loadComments = async (resetPage = false) => {
  if (resetPage) {
    commentsPage.value = 1;
    comments.value = [];
  }
  try {
    const res = await request.get(`/articles/${articleId()}/comments`, {
      params: { page: commentsPage.value, pageSize: 20 }
    });
    if (res.code === 200) {
      const data = res.data;
      if (resetPage) {
        comments.value = data.list || [];
      } else {
        comments.value = [...comments.value, ...(data.list || [])];
      }
      commentsTotal.value = data.total || 0;
      commentsHasMore.value = comments.value.length < commentsTotal.value;
    }
  } catch (e) {
    console.error('Failed to load comments:', e);
  }
};

const loadMoreComments = () => {
  commentsPage.value++;
  loadComments(false);
};

const handleLike = async () => {
  const id = articleId();
  const res = await knowledgeApi.like(id);
  if (res.code === 200) {
    isLiked.value = res.data.liked;
    likeCount.value = res.data.count;
  }
};

const handleCollect = async () => {
  const id = articleId();
  const res = await knowledgeApi.collect(id);
  if (res.code === 200) {
    isCollected.value = res.data.collected;
    collectCount.value = res.data.count;
  }
};

const shareArticle = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value?.title,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板');
    });
  }
};

onMounted(async () => {
  await loadArticle();
  await loadComments(true);
});
</script>

<template>
  <div class="min-h-screen pb-24">
    <header class="bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-400 text-white p-6">
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

    <main v-if="article" class="p-6 space-y-6">
      <!-- Article -->
      <article class="card">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ article.title }}</h2>

        <div class="flex items-center gap-6 mb-6 text-sm text-gray-500">
          <span class="flex items-center gap-2">
            <User class="w-4 h-4" />
            {{ article.author || '管理员' }}
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

        <div class="flex flex-wrap gap-2 mb-6" v-if="article.tags?.length">
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

      <!-- Like / Collect / Share -->
      <div class="card">
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

          <button
            class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
            @click="shareArticle"
          >
            <Share2 class="w-5 h-5" />
            <span class="text-sm font-medium">分享</span>
          </button>
        </div>
      </div>

      <!-- Comment Form -->
      <div class="card">
        <CommentForm
          :article-id="articleId()"
          @submitted="loadComments(true)"
        />
      </div>

      <!-- Comments -->
      <div class="card">
        <CommentList
          :comments="comments"
          :total="commentsTotal"
          :has-more="commentsHasMore"
          :article-id="articleId()"
          @load-more="loadMoreComments"
          @submitted="loadComments(true)"
        />
      </div>
    </main>

    <BottomNavBar active-tab="knowledge" />
  </div>
</template>
