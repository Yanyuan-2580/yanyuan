<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVideoSignal } from '@/composables/useVideoSignal';
import { request } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import { MessageCircle, Video, Shuffle, Users, Phone, Clock } from 'lucide-vue-next';

const router = useRouter();
const signal = useVideoSignal();
const onlineCount = ref(0);

onMounted(() => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    signal.connect(token);
    // 延迟获取在线人数
    setTimeout(() => {
      signal.socket.value?.emit('online:list');
    }, 1000);
  }
  // 监听在线用户更新
  signal.socket.value?.on('user:online', (users: any[]) => {
    onlineCount.value = users.length;
  });
  loadChatHistory();
});

const startRandomText = () => {
  router.push('/video/match?mode=text');
};

const startRandomVideo = () => {
  router.push('/video/match?mode=video');
};

const goToOnlineUsers = () => {
  router.push('/video/users');
};

// 聊天历史
const chatSessions = ref<any[]>([]);
const loadChatHistory = async () => {
  try {
    const res: any = await request.get('/chat-history/sessions');
    if (res.code === 200) chatSessions.value = res.data || [];
  } catch { /* */ }
};

const toggleMatchable = () => {
  signal.toggleMatchable(!signal.matchable.value);
};

// 监听被动邀请 — 自动导航或显示弹窗
watch(() => signal.matchInvite.value, (invite) => {
  if (invite) {
    // 直接显示邀请（用 matchInvite 的 reactive 状态在模板里处理）
  }
});

watch(() => signal.matchResult.value, (result) => {
  if (result) {
    if (result.mode === 'text') router.push(`/video/chat/${result.roomId}`);
    else router.push(`/video/call/${result.roomId}?peerId=${result.peerId}`);
  }
});

const openChat = (roomId: string) => router.push(`/video/chat/${roomId}`);

const deleteSession = async (roomId: string, event: Event) => {
  event.stopPropagation();
  if (!confirm('确定删除该聊天记录？删除后无法恢复。')) return;
  try {
    const res: any = await request.delete(`/chat-history/sessions/${roomId}`);
    if (res.code === 200) {
      chatSessions.value = chatSessions.value.filter(s => s.roomId !== roomId);
    }
  } catch { /* */ }
};

const formatChatTime = (t: string) => {
  if (!t) return '';
  const d = new Date(t);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return `今天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (diff < 172800000) return '昨天';
  return `${d.getMonth()+1}/${d.getDate()}`;
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <PageHeader title="心声交流" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-5">
      <!-- 页面描述 -->
      <div class="text-center mb-2">
        <p class="text-sm text-gray-500">匿名、安全的倾诉空间，随时找到愿意倾听的人</p>
      </div>

      <!-- 可匹配开关 -->
      <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-4 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">接受随机匹配</p>
          <p class="text-xs text-gray-400 mt-0.5">开启后，别人随机匹配时可能找到你</p>
        </div>
        <button
          class="relative w-12 h-7 rounded-full transition-colors duration-200"
          :class="signal.matchable.value ? 'bg-emerald-500' : 'bg-gray-300'"
          @click="toggleMatchable"
        >
          <span class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200"
            :class="signal.matchable.value ? 'translate-x-5' : ''"
          />
        </button>
      </div>

      <!-- 随机文字聊天 -->
      <div
        class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 cursor-pointer hover:shadow-card-hover transition-all hover:-translate-y-1"
        @click="startRandomText"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <MessageCircle class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 text-base">随机文字聊天</h3>
            <p class="text-sm text-gray-400 mt-0.5">匿名匹配，打字聊聊心事</p>
          </div>
          <span class="text-gray-300 text-lg">›</span>
        </div>
      </div>

      <!-- 随机视频聊天 -->
      <div
        class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 cursor-pointer hover:shadow-card-hover transition-all hover:-translate-y-1"
        @click="startRandomVideo"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-calm-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Video class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 text-base">随机视频聊天</h3>
            <p class="text-sm text-gray-400 mt-0.5">面对面聊聊，更真实的陪伴</p>
          </div>
          <span class="text-gray-300 text-lg">›</span>
        </div>
      </div>

      <!-- 定向请求 -->
      <div
        class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 cursor-pointer hover:shadow-card-hover transition-all hover:-translate-y-1"
        @click="goToOnlineUsers"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Phone class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 text-base">发起视频请求</h3>
            <p class="text-sm text-gray-400 mt-0.5">
              选择在线用户发送视频邀请
              <span class="inline-flex items-center gap-1 ml-1 text-emerald-500">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ onlineCount }} 人在线
              </span>
            </p>
          </div>
          <span class="text-gray-300 text-lg">›</span>
        </div>
      </div>

      <!-- 聊天历史 -->
      <div v-if="chatSessions.length > 0" class="bg-white rounded-2xl shadow-card border border-gray-50 p-5">
        <h3 class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock class="w-4 h-4 text-gray-400" />
          聊天记录
        </h3>
        <div class="space-y-2">
          <div
            v-for="s in chatSessions"
            :key="s.roomId"
            class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
            @click="openChat(s.roomId)"
          >
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-calm-400 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {{ s.peerId }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-700 truncate">匿名用户 #{{ s.peerId }}</p>
                <span class="text-xs text-gray-400">{{ formatChatTime(s.updatedAt) }}</span>
              </div>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ s.lastMessage || '暂无消息' }}</p>
            </div>
            <button
              class="w-6 h-6 rounded-full hover:bg-red-50 flex items-center justify-center flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
              @click="deleteSession(s.roomId, $event)"
              title="删除"
            >×</button>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="bg-calm-50/50 rounded-2xl p-4 text-center">
        <p class="text-xs text-gray-400 mb-1">
          🔒 匿名保护 · 随时离开 · 友善交流 · 24小时倾听
        </p>
      </div>
    </div>

    <!-- 被动匹配邀请弹窗 -->
    <Teleport to="body">
      <div
        v-if="signal.matchInvite.value"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      >
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
          <div class="text-5xl mb-4">💬</div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">有人想和你聊天</h3>
          <p class="text-sm text-gray-500 mb-2">
            匿名用户想和你{{ signal.matchInvite.value?.preference === 'video' ? '视频' : '文字' }}聊天
          </p>
          <p class="text-xs text-gray-400 mb-8">接受后进入匿名聊天，可随时离开</p>
          <div class="flex justify-center gap-4">
            <button
              class="px-8 py-3 rounded-2xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              @click="signal.rejectInvite()"
            >拒绝</button>
            <button
              class="px-8 py-3 rounded-2xl bg-gradient-to-r from-calm-500 to-emerald-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
              @click="signal.acceptInvite()"
            >接受</button>
          </div>
        </div>
      </div>
    </Teleport>

    <BottomNavBar active-tab="chat" />
  </div>
</template>
