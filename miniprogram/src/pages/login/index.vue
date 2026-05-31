<template>
  <view class="page">
    <view class="logo-area">
      <text class="logo">🧠</text>
      <text class="app-name">心理健康助手</text>
      <text class="slogan">AI 驱动的心理陪伴伙伴</text>
    </view>

    <button class="wechat-btn" @tap="wechatLogin">
      <text class="wechat-icon">💚</text>
      <text>微信一键登录</text>
    </button>

    <view class="other-login">
      <navigator url="/pages/index/index" class="skip-link">暂不登录，先看看</navigator>
    </view>
  </view>
</template>

<script setup>
import { api } from '../../utils/request';

const wechatLogin = () => {
  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        // 获取用户信息
        uni.getUserInfo({
          success: async (infoRes) => {
            const { data } = await api.post('/users/wechat-login', {
              code: loginRes.code,
              nickname: infoRes.userInfo?.nickName,
              avatarUrl: infoRes.userInfo?.avatarUrl,
            });
            if (data?.accessToken) {
              uni.setStorageSync('accessToken', data.accessToken);
              uni.setStorageSync('user', JSON.stringify(data.user));
              uni.showToast({ title: '登录成功', icon: 'success' });
              setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 1000);
            }
          },
          fail: async () => {
            // 降级：仅用code登录
            const { data } = await api.post('/users/wechat-login', { code: loginRes.code });
            if (data?.accessToken) {
              uni.setStorageSync('accessToken', data.accessToken);
              uni.setStorageSync('user', JSON.stringify(data.user));
              uni.showToast({ title: '登录成功', icon: 'success' });
              setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 1000);
            }
          }
        });
      } catch (e) {
        uni.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '微信登录失败', icon: 'none' });
    }
  });
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在微信小程序中使用', icon: 'none' });
  // #endif
};
</script>

<style scoped>
.page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 48rpx; background: linear-gradient(180deg, #f0f4ff 0%, #fff 100%); }
.logo-area { text-align: center; margin-bottom: 80rpx; }
.logo { font-size: 100rpx; display: block; margin-bottom: 24rpx; }
.app-name { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; }
.slogan { font-size: 28rpx; color: #94a3b8; margin-top: 12rpx; display: block; }
.wechat-btn { display: flex; align-items: center; justify-content: center; gap: 12rpx; width: 100%; max-width: 500rpx; padding: 24rpx 0; background: #07c160; color: #fff; border-radius: 48rpx; font-size: 32rpx; border: none; }
.wechat-icon { font-size: 36rpx; }
.other-login { margin-top: 48rpx; }
.skip-link { font-size: 28rpx; color: #94a3b8; text-decoration: underline; }
</style>
