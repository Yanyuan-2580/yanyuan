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
    if (res.data?.code === 200) {
      roomId.value = res.data.data.roomId;
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
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <PageHeader title="视频咨询" :show-back="true" />

    <div class="flex-1 flex flex-col items-center justify-center p-4">
      <!-- Video Area (placeholder) -->
      <div class="w-full max-w-md aspect-video bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
        <div v-if="!isInCall" class="text-center text-gray-400">
          <Video class="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p class="text-sm">输入房间号或创建新房间开始</p>
        </div>
        <div v-else-if="isVideoOff" class="text-center text-gray-400">
          <VideoOff class="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p class="text-sm">摄像头已关闭</p>
        </div>
        <div v-else class="text-center text-gray-400">
          <p class="text-sm">视频画面区域</p>
          <small>(需集成 TRTC SDK)</small>
        </div>
      </div>

      <!-- Room ID input -->
      <div v-if="!isInCall" class="w-full max-w-md space-y-3">
        <input
          v-model="roomId"
          type="text"
          placeholder="输入房间号"
          class="input-field w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500"
        />
        <button
          class="btn-primary w-full py-3"
          :disabled="isConnecting"
          @click="roomId ? joinRoom() : createRoom()"
        >
          {{ isConnecting ? '连接中...' : roomId ? '加入房间' : '创建新房间' }}
        </button>
      </div>

      <!-- Call Controls -->
      <div v-if="isInCall" class="flex items-center gap-4 mt-6">
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'"
          @click="toggleMute"
        >
          <MicOff v-if="isMuted" class="w-5 h-5" />
          <Mic v-else class="w-5 h-5" />
        </button>
        <button
          class="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center"
          @click="endCall"
        >
          <Phone class="w-6 h-6 rotate-135" />
        </button>
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'"
          @click="toggleVideo"
        >
          <VideoOff v-if="isVideoOff" class="w-5 h-5" />
          <Video v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
