<template>
  <view class="page">
    <view class="header">
      <text class="title">情绪日记</text>
      <text class="subtitle">记录每一天的心情变化</text>
    </view>

    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else-if="diaries.length === 0" class="empty">
      <text class="empty-emoji">📔</text>
      <text class="empty-text">还没有日记记录</text>
    </view>

    <view v-else class="list">
      <view v-for="d in diaries" :key="d.id" class="card" @tap="viewDetail(d.id)">
        <view class="card-head">
          <text class="mood-emoji">{{ getEmoji(d.moodScore) }}</text>
          <view class="card-info">
            <text class="card-label">{{ getLabel(d.moodScore) }}</text>
            <text class="card-date">{{ formatDate(d.createdAt) }}</text>
          </view>
        </view>
        <text v-if="d.content" class="card-content">{{ d.content.slice(0, 100) }}</text>
        <text v-if="d.aiInsight" class="ai-insight">💡 {{ d.aiInsight.slice(0, 80) }}</text>
      </view>
    </view>

    <button class="float-btn" @tap="goCreate">+ 写日记</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const diaries = ref([]);
const loading = ref(true);

const moodOpts = [
  { emoji: '😢', label: '非常难过' },
  { emoji: '😔', label: '有点低落' },
  { emoji: '😐', label: '一般' },
  { emoji: '😊', label: '比较开心' },
  { emoji: '😄', label: '非常开心' }
];
const getEmoji = (s) => moodOpts[s - 1]?.emoji || '😐';
const getLabel = (s) => moodOpts[s - 1]?.label || '';
const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
const viewDetail = (id) => uni.navigateTo({ url: `/pages/diary/detail?id=${id}` });
const goCreate = () => uni.navigateTo({ url: '/pages/diary/create' });

const load = async () => {
  loading.value = true;
  try {
    const res = await api.get('/diaries', { page: 1, pageSize: 20 });
    if (res.code === 200) diaries.value = res.data.list || [];
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

import { onMounted } from 'vue';
onMounted(load);
</script>

<style scoped>
.page { padding: 24rpx; }
.header { padding: 40rpx 0 24rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; }
.subtitle { font-size: 26rpx; color: #94a3b8; margin-top: 6rpx; }
.empty { text-align: center; padding-top: 160rpx; }
.empty-emoji { font-size: 80rpx; display: block; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #94a3b8; }
.loading-text { text-align: center; padding: 80rpx 0; color: #94a3b8; font-size: 28rpx; }
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.card-head { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; }
.mood-emoji { font-size: 40rpx; }
.card-label { font-size: 28rpx; font-weight: 500; color: #334155; }
.card-date { font-size: 24rpx; color: #94a3b8; }
.card-content { font-size: 26rpx; color: #64748b; line-height: 1.5; }
.ai-insight { font-size: 24rpx; color: #6C9BD2; margin-top: 8rpx; display: block; background: #f0f4ff; padding: 12rpx 16rpx; border-radius: 12rpx; }
.float-btn { position: fixed; bottom: 40rpx; right: 40rpx; background: #6C9BD2; color: #fff; border-radius: 48rpx; padding: 20rpx 36rpx; font-size: 28rpx; border: none; box-shadow: 0 4rpx 16rpx rgba(108,155,210,0.4); }
</style>
