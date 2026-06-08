<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVideoSignal, type OnlineUser } from '@/composables/useVideoSignal';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import { Phone, User } from 'lucide-vue-next';
import IncomingCallModal from './IncomingCallModal.vue';

const router = useRouter();
const signal = useVideoSignal();
const users = ref<OnlineUser[]>([]);
const showIncomingCall = ref(false);

onMounted(() => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    signal.connect(token);
  }

  // 刷新在线列表
  const fetchUsers = () => {
    if (signal.socket.value?.connected) {
      signal.socket.value.emit('online:list');
    }
  };
  fetchUsers();
  const timer = setInterval(fetchUsers, 10000);

  const onUsers = (list: OnlineUser[]) => {
    users.value = list.filter(u => {
      // 过滤自己
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const me = JSON.parse(stored);
          return u.userId !== me.id;
        }
      } catch { /* */ }
      return true;
    });
  };
  signal.socket.value?.on('user:online', onUsers);
  signal.socket.value?.on('online:list', onUsers);

  // 监听来电
  setInterval(() => {
    if (signal.incomingCall.value) {
      showIncomingCall.value = true;
    }
  }, 500);

  onUnmounted(() => {
    clearInterval(timer);
  });
});

const callUser = (user: OnlineUser) => {
  signal.callRequest(user.userId);
};

const acceptCall = () => {
  if (!signal.incomingCall.value) return;
  const { requestId, fromUserId } = signal.incomingCall.value;
  signal.callAccept(requestId, fromUserId);
  showIncomingCall.value = false;
};

const rejectCall = () => {
  if (!signal.incomingCall.value) return;
  const { requestId, fromUserId } = signal.incomingCall.value;
  signal.callReject(requestId, fromUserId);
  showIncomingCall.value = false;
};

// 监听 call accepted 跳转到视频通话
setInterval(() => {
  if (signal.callAccepted.value) {
    const { roomId, peerId } = signal.callAccepted.value;
    router.push(`/video/call/${roomId}?peerId=${peerId}`);
  }
}, 500);

onUnmounted(() => {
  signal.disconnect();
});
</script>

<template>
  <div class="min-h-screen pb-24 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader title="在线用户" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6">
      <p class="text-sm text-gray-400 mb-4">当前 {{ users.length }} 人在线，点击发起视频请求</p>

      <div v-if="users.length === 0" class="text-center py-16">
        <User class="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p class="text-gray-400 text-sm">暂无其他在线用户</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="user in users"
          :key="user.userId"
          class="bg-white rounded-2xl shadow-card border border-gray-50 p-4 flex items-center gap-4"
        >
          <div class="w-11 h-11 rounded-full bg-gradient-to-br from-calm-400 to-emerald-500 flex items-center justify-center text-white font-semibold shadow-sm">
            {{ user.nickname?.charAt(0) || '?' }}
          </div>
          <div class="flex-1">
            <p class="font-medium text-sm text-gray-800">{{ user.nickname }}</p>
            <p class="text-xs text-emerald-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              在线
            </p>
          </div>
          <button
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            @click="callUser(user)"
          >
            <Phone class="w-3.5 h-3.5" />
            呼叫
          </button>
        </div>
      </div>
    </div>

    <!-- 来电弹窗 -->
    <IncomingCallModal
      :visible="showIncomingCall"
      :caller="signal.incomingCall.value"
      @accept="acceptCall"
      @reject="rejectCall"
    />

    <BottomNavBar active-tab="chat" />
  </div>
</template>
