<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVideoSignal } from '@/composables/useVideoSignal';
import { useTextChat } from '@/composables/useTextChat';
import { request } from '@/api/request';
import { Send, Video, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const signal = useVideoSignal();
const chat = useTextChat();

const roomId = route.params.roomId as string;
const inputMsg = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const peerOnline = ref(false);
const peerId = ref(0);

const loadHistory = async () => {
  try {
    const res: any = await request.get(`/chat-history/messages/${roomId}`);
    if (res.code === 200 && res.data?.list) {
      for (const msg of res.data.list) {
        const myId = getMyId();
        chat.messages.value.push({
          content: msg.content,
          from: msg.senderId === myId ? 'me' : 'peer',
          timestamp: new Date(msg.createdAt).getTime(),
        });
        // 从第一条对方的消息中获取 peerId
        if (!peerId.value && msg.senderId !== myId) {
          peerId.value = msg.senderId;
        }
      }
    }
  } catch { /* */ }
};

// 检查对方是否在线
const checkPeerOnline = () => {
  if (!peerId.value) return;
  const found = signal.onlineUsers.value.some(u => u.userId === peerId.value);
  peerOnline.value = found;
};

const getMyId = (): number => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored).id || 0;
  } catch { /* */ }
  return 0;
};

onMounted(() => {
  const token = localStorage.getItem('accessToken');
  if (!token || !roomId) {
    router.push('/video');
    return;
  }
  signal.connect(token);

  const checkSocket = setInterval(() => {
    if (signal.socket.value?.connected) {
      clearInterval(checkSocket);
      chat.bindSocket(signal.socket.value, roomId);
      loadHistory();
      checkPeerOnline();
    }
  }, 300);
});

// 定期刷新在线状态
setInterval(checkPeerOnline, 5000);

const send = () => {
  if (!inputMsg.value.trim()) return;
  chat.sendMessage(inputMsg.value);
  inputMsg.value = '';
  scrollToBottom();
};

const formatMsgTime = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `${h}:${m}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${h}:${m}`;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
};

const handleInput = () => {
  chat.sendTyping();
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const leave = () => {
  chat.leaveChat();
  chat.unbind();
  signal.resetMatch();
  router.push('/video');
};

const requestVideo = () => {
  chat.requestUpgrade();
};

const blockPeer = () => {
  if (!peerId.value) return;
  signal.socket.value?.emit('block:add', { targetId: peerId.value });
  chat.messages.value.push({
    content: '你已拉黑该用户，不会再收到对方消息',
    from: 'system',
    timestamp: Date.now(),
  });
  // 同时保存到 localStorage
  const blocked = JSON.parse(localStorage.getItem('blocked_users') || '[]');
  if (!blocked.includes(peerId.value)) {
    blocked.push(peerId.value);
    localStorage.setItem('blocked_users', JSON.stringify(blocked));
  }
};

// 监听升级请求
setInterval(() => {
  if (chat.upgradeRequested.value) {
    // 弹窗询问（简化：自动跳转）
  }
}, 500);

onUnmounted(() => {
  chat.unbind();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30 flex flex-col">
    <!-- Header -->
    <header class="bg-white/85 backdrop-blur border-b border-calm-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
      <button class="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center" @click="leave">
        <ArrowLeft class="w-5 h-5 text-gray-600" />
      </button>
      <div class="flex-1">
        <p class="font-medium text-sm text-gray-800">匿名倾诉伙伴</p>
        <p class="text-xs" :class="peerOnline ? 'text-emerald-500' : 'text-gray-400'">{{ peerOnline ? '在线' : '离线' }}</p>
      </div>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
        @click="blockPeer"
      >
        拉黑
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-calm-50 text-calm-600 text-xs font-medium hover:bg-calm-100 transition-colors"
        @click="requestVideo"
      >
        <Video class="w-3.5 h-3.5" />
        视频
      </button>
    </header>

    <!-- Messages -->
    <main ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      <div
        v-for="(msg, idx) in chat.messages.value"
        :key="idx"
        class="flex"
        :class="msg.from === 'me' ? 'justify-end' : msg.from === 'system' ? 'justify-center' : 'justify-start'"
      >
        <div
          v-if="msg.from === 'system'"
          class="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500"
        >
          {{ msg.content }}
        </div>
        <div
          v-else
          class="max-w-[75%]"
        >
          <div
            class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
            :class="msg.from === 'me'
              ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white rounded-br-md'
              : 'bg-white text-gray-700 rounded-bl-md shadow-card border border-gray-50'"
          >
            {{ msg.content }}
          </div>
          <p class="text-[10px] mt-0.5 px-1"
            :class="msg.from === 'me' ? 'text-gray-400 text-right' : 'text-gray-300'"
          >{{ formatMsgTime(msg.timestamp) }}</p>
        </div>
      </div>

      <!-- 正在输入 -->
      <div v-if="chat.isPeerTyping.value" class="flex justify-start">
        <div class="px-4 py-2 bg-white rounded-2xl text-sm text-gray-400 italic">
          对方正在输入...
        </div>
      </div>

      <!-- 对方离开 -->
      <div v-if="chat.peerLeft.value" class="text-center py-8">
        <p class="text-gray-400 text-sm mb-4">对方已离开聊天</p>
        <button
          class="px-6 py-2.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-md"
          @click="leave"
        >
          返回首页
        </button>
      </div>

      <!-- 升级请求横幅 -->
      <div v-if="chat.upgradeRequested.value" class="flex justify-center">
        <div class="bg-calm-50 border border-calm-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Video class="w-5 h-5 text-calm-600" />
          <span class="text-sm text-calm-700">对方请求视频聊天</span>
          <button class="px-3 py-1 bg-calm-500 text-white rounded-lg text-xs font-medium" @click="chat.acceptUpgrade()">接受</button>
          <button class="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium" @click="chat.rejectUpgrade()">拒绝</button>
        </div>
      </div>
    </main>

    <!-- Input -->
    <footer class="bg-white/90 backdrop-blur border-t border-gray-50 p-4">
      <div class="flex items-end gap-3 max-w-lg mx-auto">
        <textarea
          v-model="inputMsg"
          rows="1"
          class="flex-1 resize-none rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 placeholder:text-gray-300"
          placeholder="说点什么..."
          :disabled="chat.peerLeft.value"
          @keydown="handleKeydown"
          @input="handleInput"
        ></textarea>
        <button
          class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
          :class="inputMsg.trim() && !chat.peerLeft.value ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
          :disabled="!inputMsg.trim() || chat.peerLeft.value"
          @click="send"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
    </footer>
  </div>
</template>
