<template>
  <view class="page">
    <!-- Session selector -->
    <view class="session-bar">
      <picker mode="selector" :range="sessionNames" @change="switchSession">
        <view class="session-picker">
          <text>{{ currentSessionTitle }}</text>
          <text class="arrow">▾</text>
        </view>
      </picker>
      <button class="new-session-btn" @tap="newSession">+ 新对话</button>
    </view>

    <scroll-view class="messages" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view v-if="messages.length === 0" class="welcome">
        <text class="welcome-text">💙 你好，我是你的心理陪伴助手</text>
        <text class="welcome-sub">我在这里倾听你，陪伴你</text>
      </view>
      <view v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="msg.role">
        <view class="msg-bubble" :class="msg.role">{{ msg.content }}</view>
      </view>
      <view v-if="loading" class="msg-row assistant">
        <view class="msg-bubble assistant typing">
          <text class="dot">●</text><text class="dot">●</text><text class="dot">●</text>
        </view>
      </view>
    </scroll-view>
    <view class="input-bar">
      <input
        v-model="input"
        class="msg-input"
        placeholder="说说你的感受..."
        confirm-type="send"
        :disabled="loading"
        @confirm="send"
      />
      <button class="send-btn" :disabled="!input.trim() || loading" @tap="send">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../utils/request';

const BASE_URL = 'http://localhost:3000/api/v1';

const messages = ref<Array<{ role: string; content: string }>>([]);
const input = ref('');
const loading = ref(false);
const scrollTop = ref(0);
const sessions = ref<Array<{ id: number; title: string }>>([]);
const currentSessionId = ref<number | null>(null);
const currentSessionTitle = ref('当前对话');
const sessionNames = ref<string[]>(['当前对话']);

const loadSessions = async () => {
  try {
    const res = await api.get('/chat/sessions');
    if (res.code === 200) {
      sessions.value = res.data.list || [];
      sessionNames.value = sessions.value.map((s) => s.title || `对话 ${s.id}`);
    }
  } catch { /* ignore */ }
};

const switchSession = async (e: any) => {
  const idx = e.detail.value;
  if (idx === 0) { currentSessionId.value = null; currentSessionTitle.value = '当前对话'; messages.value = []; return; }
  const session = sessions.value[idx - 1];
  if (!session) return;
  currentSessionId.value = session.id;
  currentSessionTitle.value = session.title || `对话 ${session.id}`;
  // Load messages for this session
  try {
    const res = await api.get(`/chat/messages/${session.id}`);
    if (res.code === 200) {
      messages.value = (res.data || []).map((m: any) => ({ role: m.role, content: m.content }));
    }
  } catch { /* ignore */ }
};

const newSession = () => {
  currentSessionId.value = null;
  currentSessionTitle.value = '新对话';
  messages.value = [];
};

const send = async () => {
  if (!input.value.trim() || loading.value) return;
  const content = input.value.trim();
  input.value = '';
  messages.value.push({ role: 'user', content });
  loading.value = true;

  try {
    // 尝试 SSE 流式请求
    const token = uni.getStorageSync('accessToken');
    const sseSupported = typeof uni.request !== 'undefined';

    if (sseSupported) {
      // 小程序内使用非流式回退 (reliable)
      const res = await api.post('/chat/messages', {
        sessionId: currentSessionId.value,
        content,
      });
      if (res.code === 200) {
        const reply = res.data?.message?.content || res.data?.content || '我听到了你的心声~';
        messages.value.push({ role: 'assistant', content: reply });
        if (!currentSessionId.value && res.data?.session?.id) {
          currentSessionId.value = res.data.session.id;
          currentSessionTitle.value = res.data.session.title || '对话';
          loadSessions();
        }
      }
    }
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，我现在无法回复。请检查网络后重试。我一直在这里等你 💙',
    });
  } finally {
    loading.value = false;
    scrollTop.value = 99999;
  }
};

onMounted(() => { loadSessions(); });
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.session-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; border-bottom: 1rpx solid #f1f5f9; gap: 12rpx; }
.session-picker { display: flex; align-items: center; gap: 6rpx; font-size: 26rpx; color: #475569; flex: 1; padding: 8rpx 0; }
.arrow { font-size: 20rpx; color: #94a3b8; }
.new-session-btn { font-size: 24rpx; background: #6C9BD2; color: #fff; border: none; padding: 10rpx 20rpx; border-radius: 20rpx; }

.messages { flex: 1; padding: 24rpx; }
.welcome { text-align: center; padding-top: 160rpx; }
.welcome-text { font-size: 34rpx; font-weight: 600; color: #1e293b; display: block; }
.welcome-sub { font-size: 26rpx; color: #94a3b8; margin-top: 10rpx; display: block; }
.msg-row { display: flex; margin-bottom: 20rpx; }
.msg-row.user { justify-content: flex-end; }
.msg-bubble { max-width: 80%; padding: 18rpx 26rpx; border-radius: 22rpx; font-size: 28rpx; line-height: 1.6; word-break: break-all; }
.msg-bubble.user { background: #6C9BD2; color: #fff; border-bottom-right-radius: 6rpx; }
.msg-bubble.assistant { background: #fff; color: #334155; border-bottom-left-radius: 6rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.typing { padding: 14rpx 40rpx; }
.dot { animation: blink 1.4s infinite; color: #94a3b8; margin: 0 2rpx; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 50% { opacity: 0.3; } 100% { opacity: 1; } }

.input-bar { display: flex; padding: 20rpx; background: #fff; border-top: 1rpx solid #f1f5f9; gap: 12rpx; }
.msg-input { flex: 1; height: 72rpx; background: #f8fafc; border-radius: 36rpx; padding: 0 28rpx; font-size: 28rpx; }
.send-btn { width: 120rpx; height: 72rpx; background: #6C9BD2; color: #fff; border-radius: 36rpx; font-size: 26rpx; border: none; }
.send-btn[disabled] { opacity: 0.5; }
</style>
