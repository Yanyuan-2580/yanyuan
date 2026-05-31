<template>
  <view class="page">
    <view class="header">
      <text class="title">设置</text>
    </view>
    <view class="menu">
      <view class="menu-item" @tap="changePassword">
        <text>🔒 修改密码</text><text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goAbout">
        <text>ℹ️ 关于</text><text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="clearCache">
        <text>🗑️ 清除缓存</text><text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const changePassword = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};
const goAbout = () => {
  uni.showModal({ title: '关于', content: '心理健康助手 v1.0\nAI驱动的心理陪伴应用', showCancel: false });
};
const clearCache = () => {
  uni.clearStorageSync();
  uni.showToast({ title: '缓存已清除', icon: 'success' });
};
</script>

<style scoped>
.page { padding: 24rpx; }
.header { padding: 40rpx 0 24rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; }
.menu { background: #fff; border-radius: 24rpx; overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; font-size: 28rpx; color: #334155; }
.arrow { font-size: 32rpx; color: #cbd5e1; }
</style>
