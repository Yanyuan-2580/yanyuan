<template>
  <view class="page">
    <view v-if="loading" class="loading-text">加载中...</view>
    <template v-else-if="article">
      <view class="article-card">
        <text class="article-title">{{ article.title }}</text>
        <view class="article-meta">
          <text>{{ formatDate(article.createdAt) }}</text>
          <text>👁 {{ article.viewCount || 0 }}</text>
        </view>
      </view>
      <view class="article-body">
        <rich-text :nodes="article.content || ''" />
      </view>
      <view class="actions">
        <button class="action-btn" @tap="toggleLike">
          {{ liked ? '❤️' : '🤍' }} {{ article.likeCount || 0 }}
        </button>
        <button class="action-btn" @tap="toggleCollect">
          {{ collected ? '⭐' : '☆' }} {{ article.collectCount || 0 }}
        </button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const loading = ref(true);
const article = ref(null);
const liked = ref(false);
const collected = ref(false);

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const toggleLike = async () => {
  try {
    await api.post(`/articles/${article.value.id}/like`);
    liked.value = !liked.value;
    article.value.likeCount += liked.value ? 1 : -1;
  } catch (e) { uni.showToast({ title: '操作失败', icon: 'none' }); }
};
const toggleCollect = async () => {
  try {
    await api.post(`/articles/${article.value.id}/collect`);
    collected.value = !collected.value;
    article.value.collectCount += collected.value ? 1 : -1;
  } catch (e) { uni.showToast({ title: '操作失败', icon: 'none' }); }
};

import { onLoad } from '@dcloudio/uni-app';
onLoad(async (opts: any) => {
  loading.value = true;
  try {
    const res = await api.get(`/articles/${opts.id}`);
    if (res.code === 200) {
      article.value = res.data;
      liked.value = res.data.isLiked;
      collected.value = res.data.isCollected;
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.page { padding: 24rpx; }
.loading-text { text-align: center; padding: 120rpx 0; color: #94a3b8; font-size: 28rpx; }
.article-card { background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 20rpx; }
.article-title { font-size: 34rpx; font-weight: 600; color: #1e293b; display: block; }
.article-meta { font-size: 24rpx; color: #94a3b8; margin-top: 12rpx; display: flex; gap: 20rpx; }
.article-body { background: #fff; border-radius: 20rpx; padding: 28rpx; font-size: 28rpx; line-height: 1.8; color: #334155; margin-bottom: 20rpx; }
.actions { display: flex; gap: 20rpx; }
.action-btn { flex: 1; background: #fff; border-radius: 20rpx; padding: 20rpx; font-size: 28rpx; border: none; text-align: center; }
</style>
