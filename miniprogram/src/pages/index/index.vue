<template>
  <view class="page">
    <view class="header">
      <text class="greeting">{{ greeting }}</text>
      <text class="subtitle">我在这里，随时倾听你</text>
    </view>
    <view class="quick-actions">
      <view v-for="action in actions" :key="action.label" class="action-card" @tap="navigateTo(action.path)">
        <text class="action-emoji">{{ action.emoji }}</text>
        <text class="action-label">{{ action.label }}</text>
      </view>
    </view>
    <view class="section">
      <text class="section-title">推荐阅读</text>
      <view v-for="article in articles" :key="article.id" class="article-item" @tap="viewArticle(article.id)">
        <text class="article-title">{{ article.title }}</text>
        <text class="article-desc">{{ article.summary || '点击阅读' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const greeting = ref('你好 👋');
const actions = [
  { label: 'AI咨询', emoji: '💬', path: '/pages/chat/index' },
  { label: '写日记', emoji: '📔', path: '/pages/diary/create' },
  { label: '心情记录', emoji: '😊', path: '/pages/mood/index' },
  { label: '知识库', emoji: '📚', path: '/pages/knowledge/index' }
];
const articles = ref([]);

const loadArticles = async () => {
  try {
    const res = await api.get('/articles', { page: 1, pageSize: 5 });
    if (res.code === 200) articles.value = res.data.list || [];
  } catch (e) { /* ignore */ }
};

const navigateTo = (path) => uni.navigateTo({ url: path });
const viewArticle = (id) => uni.navigateTo({ url: `/pages/knowledge/detail?id=${id}` });

import { onMounted } from 'vue';
onMounted(() => { loadArticles(); });
</script>

<style scoped>
.page { padding: 24rpx; }
.header { padding: 40rpx 0 32rpx; }
.greeting { font-size: 44rpx; font-weight: 700; color: #1e293b; display: block; }
.subtitle { font-size: 28rpx; color: #94a3b8; margin-top: 8rpx; }
.quick-actions { display: flex; gap: 16rpx; flex-wrap: wrap; margin-bottom: 40rpx; }
.action-card { flex: 1; min-width: 150rpx; background: #fff; border-radius: 24rpx; padding: 28rpx 20rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.action-emoji { font-size: 48rpx; display: block; margin-bottom: 8rpx; }
.action-label { font-size: 26rpx; color: #64748b; }
.section { margin-bottom: 32rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #1e293b; margin-bottom: 16rpx; display: block; }
.article-item { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 12rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.article-title { font-size: 28rpx; color: #334155; font-weight: 500; }
.article-desc { font-size: 24rpx; color: #94a3b8; margin-top: 6rpx; }
</style>
