<template>
  <view class="page">
    <view class="profile-card">
      <view class="avatar">👤</view>
      <text class="nickname">{{ nickname || '未登录' }}</text>
    </view>
    <view class="menu-list">
      <view v-for="item in menus" :key="item.label" class="menu-item" @tap="navigateTo(item.path)">
        <text class="menu-emoji">{{ item.emoji }}</text>
        <text class="menu-label">{{ item.label }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    <button class="logout-btn" @tap="logout">退出登录</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const nickname = ref('');

const menus = [
  { label: '我的日记', emoji: '📔', path: '/pages/diary/index' },
  { label: '心情记录', emoji: '😊', path: '/pages/mood/index' },
  { label: '设置', emoji: '⚙️', path: '/pages/user/settings' }
];

const loadProfile = async () => {
  try {
    const res = await api.get('/users/profile');
    if (res.code === 200) nickname.value = res.data.nickname || res.data.phone;
  } catch {}
};

const navigateTo = (path) => uni.navigateTo({ url: path });

const logout = () => {
  uni.removeStorageSync('accessToken');
  uni.reLaunch({ url: '/pages/index/index' });
};

import { onMounted } from 'vue';
onMounted(loadProfile);
</script>

<style scoped>
.page { padding: 24rpx; }
.profile-card { background: #fff; border-radius: 24rpx; padding: 40rpx; text-align: center; margin-bottom: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.avatar { font-size: 80rpx; margin-bottom: 16rpx; }
.nickname { font-size: 32rpx; font-weight: 600; color: #1e293b; }
.menu-list { background: #fff; border-radius: 24rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.menu-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.menu-emoji { font-size: 36rpx; margin-right: 16rpx; }
.menu-label { flex: 1; font-size: 28rpx; color: #334155; }
.menu-arrow { font-size: 32rpx; color: #cbd5e1; }
.logout-btn { margin-top: 48rpx; background: #fff; color: #ef4444; border: 1rpx solid #fecaca; border-radius: 20rpx; font-size: 28rpx; }
</style>
