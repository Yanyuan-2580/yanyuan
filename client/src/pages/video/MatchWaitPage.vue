<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVideoSignal } from '@/composables/useVideoSignal';
import { Shuffle, X } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const signal = useVideoSignal();

const mode = (route.query.mode as string) || 'text';
const isTextMode = mode === 'text';
const waitSeconds = ref(0);
let waitTimer: ReturnType<typeof setInterval> | null = null;
let matchWatchStop: ReturnType<typeof watch> | null = null;

onMounted(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) { router.push('/login'); return; }
  signal.connect(token);

  // 等连接成功 + 状态同步后开始匹配
  const unwatch = watch(() => signal.isConnected.value, (connected) => {
    if (connected) {
      unwatch();
      // 延迟确保 online:register + match:toggle 等服务端状态已同步
      setTimeout(() => {
        signal.joinMatch(mode as 'text' | 'video');
        waitTimer = setInterval(() => { waitSeconds.value++; }, 1000);
      }, 800);
    }
  }, { immediate: true });

  // 超时 60s
  setTimeout(() => {
    if (signal.isMatching.value) { signal.leaveMatch(); router.back(); }
  }, 60000);

  // 监听匹配结果
  matchWatchStop = watch(() => signal.matchResult.value, (result) => {
    if (result) {
      if (waitTimer) clearInterval(waitTimer);
      if (result.mode === 'text') {
        router.push(`/video/chat/${result.roomId}`);
      } else {
        router.push(`/video/call/${result.roomId}?peerId=${result.peerId}`);
      }
    }
  });
});


const cancel = () => {
  signal.leaveMatch();
  if (waitTimer) clearInterval(waitTimer);
  router.back();
};

onUnmounted(() => {
  if (waitTimer) clearInterval(waitTimer);
  if (matchWatchStop) matchWatchStop();
  signal.leaveMatch();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col items-center justify-center">
    <div class="text-center px-6">
      <!-- 动画 -->
      <div class="relative w-24 h-24 mx-auto mb-8">
        <div class="absolute inset-0 rounded-full bg-calm-500/30 animate-ping" />
        <div class="absolute inset-2 rounded-full bg-gradient-to-br from-calm-400 to-emerald-500 animate-pulse" />
        <div class="absolute inset-0 flex items-center justify-center">
          <Shuffle class="w-10 h-10 text-white animate-spin" style="animation-duration: 3s" />
        </div>
      </div>

      <h2 class="text-xl font-bold text-white mb-2">
        {{ isTextMode ? '正在寻找聊天伙伴...' : '正在寻找倾诉伙伴...' }}
      </h2>
      <p class="text-white/50 text-sm mb-6">
        {{ isTextMode ? '匹配成功后即可开始文字聊天' : '匹配成功后自动进入视频通话' }}
      </p>

      <div class="text-white/30 text-sm mb-8">
        已等待 {{ waitSeconds }} 秒
      </div>

      <button
        class="px-8 py-3 rounded-2xl bg-white/10 text-white/80 hover:bg-white/20 transition-all flex items-center gap-2 mx-auto"
        @click="cancel"
      >
        <X class="w-4 h-4" />
        取消匹配
      </button>

    </div>
  </div>
</template>
