<template>
  <view class="page">
    <view class="header">
      <text class="title">知识库</text>
    </view>

    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else class="list">
      <view v-for="a in articles" :key="a.id" class="card" @tap="viewDetail(a.id)">
        <text class="card-title">{{ a.title }}</text>
        <text class="card-desc">{{ (a.summary || a.content || '').slice(0, 80) }}</text>
        <view class="card-meta">
          <text>👁 {{ a.viewCount || 0 }}</text>
          <text>❤ {{ a.likeCount || 0 }}</text>
        </view>
      </view>
    </view>

    <view v-if="!loading && articles.length === 0" class="empty">
      <text>暂无文章</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const articles = ref([]);
const loading = ref(true);

const viewDetail = (id) => uni.navigateTo({ url: `/pages/knowledge/detail?id=${id}` });

const load = async () => {
  loading.value = true;
  try {
    const res = await api.get('/articles', { page: 1, pageSize: 20 });
    if (res.code === 200) articles.value = res.data.list || [];
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
.loading-text { text-align: center; padding: 80rpx 0; color: #94a3b8; font-size: 28rpx; }
.empty { text-align: center; padding-top: 160rpx; font-size: 28rpx; color: #94a3b8; }
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.card-title { font-size: 30rpx; font-weight: 500; color: #1e293b; display: block; margin-bottom: 8rpx; }
.card-desc { font-size: 26rpx; color: #94a3b8; line-height: 1.5; display: block; }
.card-meta { display: flex; gap: 24rpx; margin-top: 12rpx; font-size: 24rpx; color: #cbd5e1; }
</style>
