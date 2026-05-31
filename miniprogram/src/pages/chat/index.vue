<template>
  <view class="page">
    <scroll-view class="messages" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view v-if="messages.length === 0" class="welcome">
        <text class="welcome-text">你好，我是你的心理陪伴助手</text>
        <text class="welcome-sub">我在这里倾听你，陪伴你</text>
      </view>
      <view v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="msg.role">
        <view class="msg-bubble" :class="msg.role">{{ msg.content }}</view>
      </view>
      <view v-if="streaming" class="msg-row assistant">
        <view class="msg-bubble assistant">
          {{ streamContent }}<text class="cursor">|</text>
        </view>
      </view>
    </scroll-view>
    <view class="input-bar">
      <input v-model="input" class="msg-input" placeholder="说说你的感受..." confirm-type="send" @confirm="send" :disabled="streaming"/>
      <button class="send-btn" :disabled="!input.trim() || streaming" @tap="send">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const messages = ref([]);
const input = ref('');
const streaming = ref(false);
const streamContent = ref('');
const scrollTop = ref(0);

const send = async () => {
  if (!input.value.trim() || streaming.value) return;
  const content = input.value.trim();
  input.value = '';
  messages.value.push({ role: 'user', content });
  streaming.value = true;
  streamContent.value = '';

  try {
    const token = uni.getStorageSync('accessToken');
    const task = uni.request({
      url: 'https://your-api-domain.com/api/v1/chat/messages/stream',
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      data: { content },
      enableChunked: true,
      success: (res) => { /* handled in chunks */ }
    });
    task.onChunkReceived((res) => {
      const text = new TextDecoder().decode(new Uint8Array(res.data));
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'chunk') streamContent.value += evt.data.content;
            if (evt.type === 'complete') {
              messages.value.push({ role: 'assistant', content: streamContent.value });
              streamContent.value = '';
              streaming.value = false;
            }
          } catch {}
        }
      }
    });
  } catch (e) { streaming.value = false; }
};
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; }
.messages { flex: 1; padding: 24rpx; }
.welcome { text-align: center; padding-top: 200rpx; }
.welcome-text { font-size: 36rpx; font-weight: 600; color: #1e293b; }
.welcome-sub { font-size: 28rpx; color: #94a3b8; margin-top: 12rpx; display: block; }
.msg-row { display: flex; margin-bottom: 24rpx; }
.msg-row.user { justify-content: flex-end; }
.msg-bubble { max-width: 80%; padding: 20rpx 28rpx; border-radius: 24rpx; font-size: 28rpx; line-height: 1.6; }
.msg-bubble.user { background: #6C9BD2; color: #fff; border-bottom-right-radius: 8rpx; }
.msg-bubble.assistant { background: #fff; color: #334155; border-bottom-left-radius: 8rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.cursor { color: #6C9BD2; animation: blink 1s infinite; }
.input-bar { display: flex; padding: 20rpx; background: #fff; border-top: 1rpx solid #f1f5f9; gap: 12rpx; }
.msg-input { flex: 1; height: 72rpx; background: #f8fafc; border-radius: 36rpx; padding: 0 28rpx; font-size: 28rpx; }
.send-btn { width: 120rpx; height: 72rpx; background: #6C9BD2; color: #fff; border-radius: 36rpx; font-size: 28rpx; border: none; }
.send-btn[disabled] { opacity: 0.5; }
</style>
