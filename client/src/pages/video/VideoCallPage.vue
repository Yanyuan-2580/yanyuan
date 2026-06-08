<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { request } from '@/api/request';
import { useTrtc } from '@/composables/useTrtc';
import { useVideoSignal } from '@/composables/useVideoSignal';
import { Phone, Mic, MicOff, Video, VideoOff, Users } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const signal = useVideoSignal();
const roomId = ref((route.params.roomId as string) || '');
const peerId = ref(Number(route.query.peerId || 0));
const isInCall = ref(false);
const isConnecting = ref(false);
const callDuration = ref(0);
let durationTimer: ReturnType<typeof setInterval> | null = null;

const {
  isMuted,
  isVideoOff,
  remoteUsers,
  error: trtcError,
  joinRoom: trtcJoin,
  leaveRoom: trtcLeave,
  toggleMute: trtcToggleMute,
  toggleVideo: trtcToggleVideo,
} = useTrtc();

const startTrtcCall = async () => {
  isConnecting.value = true;
  try {
    const credRes: any = await request.post(`/video/rooms/${roomId.value}/credentials`);
    if (credRes.code !== 200) throw new Error('获取凭证失败');
    const { sdkAppId, userSig, userId, roomId: trtcRoomId } = credRes.data;
    await request.post(`/video/rooms/${roomId.value}/join`).catch(() => {});
    await trtcJoin({ sdkAppId, userId, userSig, roomId: trtcRoomId }, 'local-video');
    isInCall.value = true;
    durationTimer = setInterval(() => { callDuration.value++; }, 1000);
  } catch (err: any) {
    console.error('Video error:', err);
  } finally {
    isConnecting.value = false;
  }
};

const endCall = async () => {
  if (durationTimer) clearInterval(durationTimer);
  try { await request.post(`/video/rooms/${roomId.value}/end`).catch(() => {}); } catch { /* */ }
  if (peerId.value) signal.hangup(roomId.value, peerId.value);
  await trtcLeave();
  router.push('/video');
};

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

onMounted(() => {
  if (roomId.value) startTrtcCall();
  setInterval(() => { if (signal.peerHungUp.value) endCall(); }, 1000);
});

onUnmounted(() => {
  if (durationTimer) clearInterval(durationTimer);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col">
    <!-- Header -->
    <div class="relative z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <button class="text-white/70 hover:text-white flex items-center gap-2 text-sm transition" @click="endCall">
          ← 挂断
        </button>
        <div class="flex items-center gap-3 text-white/50 text-xs">
          <span>{{ formatDuration(callDuration) }}</span>
          <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" />{{ remoteUsers.length + 1 }}</span>
        </div>
        <div class="w-16" />
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

      <!-- Connecting -->
      <div v-else-if="isConnecting" class="text-center">
        <div class="w-20 h-20 rounded-full bg-calm-500/30 animate-pulse flex items-center justify-center mx-auto mb-4">
          <Video class="w-10 h-10 text-white/70" />
        </div>
        <p class="text-white/60 text-sm">正在连接...</p>
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
