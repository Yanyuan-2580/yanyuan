<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import { Phone, Mic, MicOff, Video, VideoOff } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const roomId = ref(route.params.roomId as string || '');
const isInCall = ref(false);
const isMuted = ref(false);
const isVideoOff = ref(false);
const isConnecting = ref(false);

const createRoom = async () => {
  isConnecting.value = true;
  try {
    const res = await request.post('/video/rooms');
    if (res.code === 200) {
      roomId.value = res.data.roomId;
      isInCall.value = true;
    }
  } catch (e) {
    console.error('Failed to create room:', e);
  } finally {
    isConnecting.value = false;
  }
};

const joinRoom = async () => {
  if (!roomId.value) return;
  isConnecting.value = true;
  try {
    await request.post(`/video/rooms/${roomId.value}/join`);
    isInCall.value = true;
  } catch (e) {
    console.error('Failed to join room:', e);
  } finally {
    isConnecting.value = false;
  }
};

const endCall = async () => {
  try {
    await request.post(`/video/rooms/${roomId.value}/end`);
  } catch (e) { /* ignore */ }
  isInCall.value = false;
  roomId.value = '';
};

const toggleMute = () => { isMuted.value = !isMuted.value; };
const toggleVideo = () => { isVideoOff.value = !isVideoOff.value; };

onMounted(() => {
  if (roomId.value) {
    joinRoom();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30 flex flex-col">
    <!-- Header with decorative blob -->
    <div class="relative">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-calm-200/25 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -top-16 left-1/4 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <PageHeader title="视频咨询" :show-back="true" />
    </div>

    <div class="flex-1 flex flex-col items-center justify-center p-4 relative">
      <!-- Video Area (placeholder) -->
      <div class="w-full max-w-md aspect-video bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/50 shadow-2xl shadow-calm-900/10">
        <div v-if="!isInCall" class="text-center text-gray-400">
          <div class="w-16 h-16 rounded-full bg-calm-500/10 flex items-center justify-center mx-auto mb-4">
            <Video class="w-8 h-8 text-calm-400 opacity-70" />
          </div>
          <p class="text-sm text-gray-300">输入房间号或创建新房间开始</p>
        </div>
        <div v-else-if="isVideoOff" class="text-center text-gray-400">
          <div class="w-16 h-16 rounded-full bg-calm-500/10 flex items-center justify-center mx-auto mb-4">
            <VideoOff class="w-8 h-8 text-calm-400 opacity-70" />
          </div>
          <p class="text-sm text-gray-300">摄像头已关闭</p>
        </div>
        <div v-else class="text-center text-gray-400 px-4">
          <div class="w-4 h-4 rounded-full bg-emerald-500 animate-pulse mx-auto mb-3"></div>
          <p class="text-sm font-medium text-gray-200 mb-2">视频通话中...</p>
          <p class="text-xs text-gray-400">双方已连接，请保持良好的通话环境</p>
          <p class="text-xs text-gray-500 mt-2">💡 提示：集成腾讯TRTC SDK后可实现实时音视频通话</p>
        </div>
      </div>

      <!-- Room ID input -->
      <div v-if="!isInCall" class="w-full max-w-md space-y-3">
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">#</span>
          <input
            v-model="roomId"
            type="text"
            placeholder="输入房间号"
            class="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200 shadow-sm"
          />
        </div>
        <button
          class="w-full py-3.5 rounded-2xl font-medium text-sm transition-all duration-200"
          :class="isConnecting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'"
          :disabled="isConnecting"
          @click="roomId ? joinRoom() : createRoom()"
        >
          {{ isConnecting ? '连接中...' : roomId ? '加入房间' : '创建新房间' }}
        </button>
      </div>

      <!-- Call Controls -->
      <div v-if="isInCall" class="flex items-center gap-4 mt-6">
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
          :class="isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:shadow-md'"
          @click="toggleMute"
        >
          <MicOff v-if="isMuted" class="w-5 h-5" />
          <Mic v-else class="w-5 h-5" />
        </button>
        <button
          class="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all hover:-translate-y-0.5"
          @click="endCall"
        >
          <Phone class="w-6 h-6 rotate-135" />
        </button>
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
          :class="isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:shadow-md'"
          @click="toggleVideo"
        >
          <VideoOff v-if="isVideoOff" class="w-5 h-5" />
          <Video v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
