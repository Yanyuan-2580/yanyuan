<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import { useTrtc } from '@/composables/useTrtc';
import PageHeader from '@/components/PageHeader.vue';
import { Phone, Mic, MicOff, Video, VideoOff, Users } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const roomId = ref((route.params.roomId as string) || '');
const isInCall = ref(false);
const isConnecting = ref(false);
const roomError = ref('');

const {
  isJoined,
  isMuted,
  isVideoOff,
  remoteUsers,
  error: trtcError,
  joinRoom: trtcJoin,
  leaveRoom: trtcLeave,
  toggleMute: trtcToggleMute,
  toggleVideo: trtcToggleVideo,
} = useTrtc();

const createRoom = async () => {
  isConnecting.value = true;
  roomError.value = '';
  try {
    const res = await request.post('/video/rooms');
    if (res.code === 200) {
      roomId.value = res.data.roomId;
      await startTrtcCall();
    }
  } catch (err: any) {
    roomError.value = err.message || '创建房间失败';
  } finally {
    isConnecting.value = false;
  }
};

const joinRoom = async () => {
  if (!roomId.value) return;
  isConnecting.value = true;
  roomError.value = '';
  try {
    await startTrtcCall();
  } catch (err: any) {
    roomError.value = err.message || '加入房间失败';
  } finally {
    isConnecting.value = false;
  }
};

const startTrtcCall = async () => {
  // 1. 从后端获取 TRTC 凭证
  const credRes = await request.post(`/video/rooms/${roomId.value}/credentials`);
  if (credRes.code !== 200) {
    throw new Error('获取TRTC凭证失败');
  }
  const { sdkAppId, userSig, userId, roomId: trtcRoomId } = credRes.data;

  // 2. 标记加入房间 (激活会话)
  await request.post(`/video/rooms/${roomId.value}/join`);

  // 3. 进入 TRTC 房间
  await trtcJoin({ sdkAppId, userId, userSig, roomId: trtcRoomId }, 'local-video');
  isInCall.value = true;
};

const endCall = async () => {
  try {
    await request.post(`/video/rooms/${roomId.value}/end`);
  } catch { /* ignore */ }
  await trtcLeave();
  isInCall.value = false;
  roomId.value = '';
};

onMounted(() => {
  if (roomId.value) {
    joinRoom();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col">
    <!-- Header -->
    <div class="relative z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <button
          class="text-white/70 hover:text-white flex items-center gap-2 text-sm transition"
          @click="router.back()"
        >
          ← 返回
        </button>
        <div class="flex items-center gap-2 text-white/50 text-xs">
          <Users class="w-3.5 h-3.5" />
          <span>{{ remoteUsers.length + 1 }} 人在线</span>
        </div>
        <div class="w-16" /><!-- spacer -->
      </div>
    </div>

    <!-- Video Area -->
    <div class="flex-1 flex flex-col items-center justify-center p-4 relative">
      <!-- TRTC Video Container -->
      <div v-if="isInCall" class="w-full max-w-3xl flex flex-col gap-3">
        <!-- Local Video (small, bottom-right overlay) -->
        <div class="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div id="remote-videos" class="absolute inset-0 flex flex-wrap">
            <!-- Remote videos injected here -->
          </div>
          <div v-if="remoteUsers.length === 0" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white/50">
              <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Users class="w-8 h-8" />
              </div>
              <p class="text-sm">等待对方加入...</p>
            </div>
          </div>

          <!-- Local video PiP -->
          <div class="absolute bottom-3 right-3 w-32 h-24 bg-slate-700 rounded-lg overflow-hidden shadow-lg border border-white/10">
            <div id="local-video" class="w-full h-full" />
            <div v-if="isVideoOff" class="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff class="w-5 h-5 text-white/40" />
            </div>
          </div>
        </div>

        <!-- Connection status -->
        <div class="flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="text-xs text-emerald-400">通话中 · {{ remoteUsers.length }} 位参与者</span>
        </div>

        <!-- Error display -->
        <p v-if="trtcError" class="text-xs text-center text-red-400">{{ trtcError }}</p>
      </div>

      <!-- Pre-call UI -->
      <div v-else class="w-full max-w-md">
        <div class="aspect-video bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
          <div class="text-center text-gray-400">
            <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Video class="w-8 h-8 text-white/30" />
            </div>
            <p class="text-sm text-white/40">输入房间号或创建新房间开始</p>
            <p class="text-xs text-white/30 mt-2">🔒 端到端加密 · TRTC 实时音视频</p>
          </div>
        </div>

        <!-- Room ID input -->
        <div class="space-y-3">
          <div class="relative">
            <input
              v-model="roomId"
              type="text"
              placeholder="输入房间号（可选，留空则创建新房间）"
              class="w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-calm-400/30 focus:border-calm-400/50 transition-all"
            />
          </div>
          <p v-if="roomError" class="text-xs text-center text-red-400">{{ roomError }}</p>
          <button
            class="w-full py-3.5 rounded-2xl font-medium text-sm transition-all duration-200"
            :class="isConnecting
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'"
            :disabled="isConnecting"
            @click="roomId ? joinRoom() : createRoom()"
          >
            {{ isConnecting ? '连接中...' : roomId ? '加入房间' : '创建新房间' }}
          </button>
        </div>
      </div>

      <!-- Call Controls -->
      <div v-if="isInCall" class="flex items-center gap-5 mt-6">
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
          :class="isMuted
            ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20'
            : 'bg-white/10 text-white/70 hover:bg-white/20'"
          @click="trtcToggleMute"
        >
          <MicOff v-if="isMuted" class="w-5 h-5" />
          <Mic v-else class="w-5 h-5" />
        </button>
        <button
          class="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all hover:-translate-y-0.5 active:scale-95"
          @click="endCall"
        >
          <Phone class="w-6 h-6 rotate-135" />
        </button>
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
          :class="isVideoOff
            ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20'
            : 'bg-white/10 text-white/70 hover:bg-white/20'"
          @click="trtcToggleVideo"
        >
          <VideoOff v-if="isVideoOff" class="w-5 h-5" />
          <Video v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rotate-135 {
  transform: rotate(135deg);
}
.remote-video-container {
  flex: 1 1 50%;
  min-width: 180px;
  min-height: 120px;
}
.remote-video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
#local-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
