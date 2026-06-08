<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { chatApi } from '@/api';
import type { AiSession, ChatMessage } from '@/types';
import { Send, Plus, X, MessageCircle, BookOpen, Calendar, Heart, MoreVertical, Square, Mic, MicOff } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';

const route = useRoute();
const router = useRouter();
const currentSession = ref<AiSession | null>(null);
const sessions = ref<AiSession[]>([]);
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isSending = ref(false);
const isStreaming = ref(false);
const streamingContent = ref('');
const streamingSessionId = ref<number | null>(null);
let streamController: AbortController | null = null;
const showSessionList = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// ====== 语音输入 ======
const isVoiceSupported = ref(false);
const isListening = ref(false);
let recognition: any = null;

// 初始化语音识别（Web Speech API）
const initSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    isVoiceSupported.value = false;
    return;
  }
  isVoiceSupported.value = true;

  recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;   // 实时显示识别中间结果
  recognition.continuous = true;       // 持续识别直到手动停止
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    // 追加最终结果，中间结果显示在末尾
    if (final) {
      inputMessage.value = inputMessage.value ? inputMessage.value + final : final;
    }
    // 可以考虑显示 interim，但这里直接合并到输入框更简单
    if (interim && !final) {
      const base = inputMessage.value || '';
      // 把 interim 临时显示为灰色提示（简化：直接追加）
      // 更好的做法是用一个单独的 ref，但保持简单
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // 没有说话，静默处理
    } else if (event.error === 'aborted') {
      // 用户手动停止
    } else {
      // 其他错误
    }
    stopListening();
  };

  recognition.onend = () => {
    isListening.value = false;
    // 如果用户没有手动停止且还在语音模式，自动重启
    // （continuous 模式下通常不会自动结束，除非超时）
  };
};

const startListening = () => {
  if (!recognition) {
    initSpeechRecognition();
  }
  if (!recognition) return;

  try {
    isListening.value = true;
    recognition.start();
  } catch (e: any) {
    // 可能已经在识别中，先停止再开始
    try { recognition.stop(); } catch { /* */ }
    setTimeout(() => {
      try { recognition.start(); isListening.value = true; } catch { /* */ }
    }, 100);
  }
};

const stopListening = () => {
  if (recognition) {
    try { recognition.stop(); } catch { /* */ }
  }
  isListening.value = false;
};

const toggleVoice = () => {
  if (isListening.value) {
    stopListening();
  } else {
    startListening();
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const loadSessions = async () => {
  try {
    const res = await chatApi.getSessions();
    if (res && res.code === 200) {
      sessions.value = res.data || [];
    } else {
      sessions.value = [];
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    sessions.value = [];
  }
};

const loadMessages = async (sessionId: number) => {
  try {
    if (!sessionId || isNaN(sessionId)) return;
    const res = await chatApi.getMessages(sessionId.toString());
    if (res && res.code === 200) {
      if (res.data && Array.isArray(res.data)) {
        messages.value = res.data;
      } else {
        messages.value = [];
      }
      if (!currentSession.value) {
        currentSession.value = {
          id: sessionId,
          title: '历史会话',
          messageCount: messages.value.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as AiSession;
      }
      await scrollToBottom();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

const selectSession = async (session: AiSession) => {
  // Cancel any ongoing stream
  if (streamController) {
    streamController.abort();
    isStreaming.value = false;
  }
  currentSession.value = session;
  // Keep session list visible so user can navigate history
  showSessionList.value = false;
  await loadMessages(session.id);
  router.push(`/chat/${session.id}`);
};

const createNewSession = async () => {
  const res = await chatApi.createSession();
  if (res.code === 200) {
    await loadSessions();
    await selectSession(res.data);
    // Auto-open session list so user can see existing history
    showSessionList.value = true;
  }
};

const stopStreaming = () => {
  if (streamController) {
    streamController.abort();
    streamController = null;
  }
  isStreaming.value = false;
  // Save the partial response as a message
  if (streamingContent.value && streamingSessionId.value) {
    messages.value.push({
      sessionId: streamingSessionId.value.toString(),
      userId: 0,
      role: 'assistant',
      content: streamingContent.value + ' [已中断]',
      riskLevel: 0,
      createdAt: new Date().toISOString()
    });
  }
  streamingContent.value = '';
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isSending.value) return;

  // Stop any existing stream
  if (isStreaming.value) {
    stopStreaming();
    await new Promise(r => setTimeout(r, 100));
  }

  isSending.value = true;
  const content = inputMessage.value.trim();
  inputMessage.value = '';

  // Add user message immediately
  messages.value.push({
    sessionId: currentSession.value?.id?.toString() || 'new',
    userId: 0,
    role: 'user',
    content,
    riskLevel: 0,
    createdAt: new Date().toISOString()
  });
  await scrollToBottom();

  // Start streaming
  isStreaming.value = true;
  streamingContent.value = '';

  streamController = chatApi.sendMessageStream(
    {
      content,
      sessionId: currentSession.value?.id?.toString()
    },
    // onChunk
    (chunk: string) => {
      streamingContent.value += chunk;
      scrollToBottom();
    },
    // onComplete
    async (data: { sessionId: number; moodTag?: string }) => {
      isStreaming.value = false;
      isSending.value = false;
      streamController = null;

      // Save complete AI message
      messages.value.push({
        sessionId: data.sessionId.toString(),
        userId: 0,
        role: 'assistant',
        content: streamingContent.value,
        riskLevel: 0,
        createdAt: new Date().toISOString()
      });
      streamingContent.value = '';

      // Update session info
      streamingSessionId.value = data.sessionId;
      if (!currentSession.value) {
        currentSession.value = {
          id: data.sessionId,
          title: '新会话',
          messageCount: messages.value.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as AiSession;
        router.push(`/chat/${data.sessionId}`);
      }
      await loadSessions();
      await scrollToBottom();
    },
    // onError
    (error: string) => {
      isStreaming.value = false;
      isSending.value = false;
      streamController = null;
      // Show error message
      messages.value.push({
        sessionId: currentSession.value?.id?.toString() || 'error',
        userId: 0,
        role: 'assistant',
        content: `抱歉，${error}。请稍后再试。`,
        riskLevel: 0,
        createdAt: new Date().toISOString()
      });
      streamingContent.value = '';
    },
    // onStart
    (data: { sessionId: number }) => {
      streamingSessionId.value = data.sessionId;
    }
  );
};

// Keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

watch(() => route.params.sessionId, async (newSessionId) => {
  if (newSessionId) {
    const sessionId = parseInt(newSessionId as string);
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      await selectSession(session);
    } else {
      await loadMessages(sessionId);
    }
  }
});

// Categorized quick prompts
const emotionPrompts = ['我最近压力很大', '总是感到焦虑怎么办', '心情低落提不起劲', '最近容易发脾气'];
const lifePrompts = ['如何改善睡眠质量', '和家人的关系紧张', '工作倦怠没有动力', '社交中感到不自在'];
const growthPrompts = ['想了解自己的性格', '如何提升自信心', '想聊聊人际关系', '面对未来的迷茫'];

const getMoodEmoji = (tag: string) => {
  const map: Record<string, string> = {
    '焦虑': '😰', '抑郁': '😢', '压力': '😤', '平静': '😌', '开心': '😊', '愤怒': '😡', '悲伤': '😔'
  };
  return map[tag] || '💭';
};

onMounted(async () => {
  initSpeechRecognition();
  await loadSessions();
  if (route.params.sessionId) {
    const sessionId = parseInt(route.params.sessionId as string);
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      await selectSession(session);
    } else {
      await loadMessages(sessionId);
    }
  } else if (sessions.value.length > 0) {
    await selectSession(sessions.value[0]);
  }
});

onUnmounted(() => {
  stopListening();
});
</script>

<template>
  <div class="min-h-screen pb-24 flex flex-col bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <!-- Header -->
    <header class="bg-white/85 backdrop-blur border-b border-calm-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div class="flex items-center gap-3">
        <button
          v-if="currentSession"
          class="flex items-center gap-1 px-3 py-2 rounded-xl bg-calm-50 hover:bg-calm-100 text-sm text-calm-600 transition-colors"
          @click="showSessionList = !showSessionList"
        >
          <MessageCircle class="w-4 h-4" />
          <span class="text-xs font-medium">历史</span>
        </button>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-calm-500 to-emerald-500 flex items-center justify-center shadow-md">
            <span class="text-white font-semibold">AI</span>
          </div>
          <div>
            <h1 class="font-semibold text-gray-800">{{ currentSession?.title || 'AI心理咨询' }}</h1>
            <p class="text-xs text-gray-400">在线 · 随时倾听</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="isStreaming"
          class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200"
          title="停止生成"
          @click="stopStreaming"
        >
          <Square class="w-4 h-4 text-red-500" />
        </button>
        <button
          class="w-10 h-10 rounded-full bg-gradient-to-r from-calm-500 to-emerald-500 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          @click="createNewSession"
        >
          <Plus class="w-5 h-5 text-white" />
        </button>
      </div>
    </header>

    <!-- Session List Sidebar -->
    <div
      v-if="showSessionList"
      class="fixed inset-0 z-40"
      @click.self="showSessionList = false"
    >
      <div class="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl rounded-r-2xl p-6 overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-gray-800 text-lg">会话历史</h2>
          <button @click="showSessionList = false" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X class="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div class="space-y-2">
          <button
            v-for="session in sessions"
            :key="session.id"
            class="w-full text-left p-3 rounded-xl hover:bg-calm-50 transition-colors"
            :class="{ 'bg-calm-50 border border-calm-200': currentSession?.id === session.id }"
            @click="selectSession(session)"
          >
            <p class="font-medium text-sm text-gray-800 truncate">{{ session.title || '未命名会话' }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ session.messageCount }} 条消息 · {{ new Date(session.updatedAt || session.createdAt).toLocaleDateString('zh-CN') }}
            </p>
          </button>
        </div>
        <div v-if="sessions.length === 0" class="text-center py-12 text-gray-400">
          <MessageCircle class="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p class="text-sm">暂无历史会话</p>
        </div>
      </div>
      <div class="flex-1 bg-black/20" />
    </div>

    <!-- Messages -->
    <main ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <!-- Welcome Screen -->
      <div v-if="messages.length === 0 && !isStreaming" class="text-center py-8 px-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-calm-100 via-emerald-100 to-soft-100 flex items-center justify-center mx-auto mb-6 shadow-soft animate-float">
          <span class="text-5xl">🧘</span>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">你好，我是你的心理陪伴助手</h2>
        <p class="text-gray-400 mb-6 text-sm">我在这里倾听你，陪伴你。你可以：</p>
        <div class="space-y-3 max-w-sm mx-auto text-left">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">情绪支持</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="p in emotionPrompts" :key="p" class="p-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-600 hover:border-calm-200 hover:shadow-card transition-all" @click="inputMessage = p; sendMessage()">{{ p }}</button>
          </div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mt-3">日常困扰</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="p in lifePrompts" :key="p" class="p-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-600 hover:border-calm-200 hover:shadow-card transition-all" @click="inputMessage = p; sendMessage()">{{ p }}</button>
          </div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mt-3">自我探索</div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="p in growthPrompts" :key="p" class="p-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-600 hover:border-calm-200 hover:shadow-card transition-all" @click="inputMessage = p; sendMessage()">{{ p }}</button>
          </div>
        </div>
      </div>

      <!-- Messages List -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex gap-3"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <div
          class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-medium shadow-sm"
          :class="msg.role === 'user' ? 'bg-gradient-to-br from-calm-500 to-emerald-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'"
        >
          {{ msg.role === 'user' ? '我' : 'AI' }}
        </div>
        <div
          class="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed animate-message-in"
          :class="msg.role === 'user'
            ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white rounded-br-md'
            : 'bg-white text-gray-700 rounded-bl-md shadow-card border border-gray-50'"
        >
          {{ msg.content }}
          <!-- Mood tag -->
          <div v-if="msg.moodTag" class="mt-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-calm-50 text-calm-700 border border-calm-200">
              <span>{{ getMoodEmoji(msg.moodTag) }}</span>
              {{ msg.moodTag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Streaming message (typing indicator) -->
      <div v-if="isStreaming" class="flex gap-3">
        <div class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-medium bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
          AI
        </div>
        <div
          class="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed bg-white text-gray-700 shadow-card border border-gray-50"
        >
          {{ streamingContent || '' }}<span class="inline-block w-1.5 h-4 bg-calm-500 animate-pulse ml-0.5 align-middle"></span>
        </div>
      </div>
    </main>

    <!-- Input Area -->
    <footer class="bg-white/90 backdrop-blur border-t border-gray-50 p-4">
      <div class="max-w-lg mx-auto flex items-end gap-3">
        <!-- 语音按钮 -->
        <button
          v-if="isVoiceSupported"
          class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 relative"
          :class="isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          :disabled="isStreaming"
          @click="toggleVoice"
          :title="isListening ? '点击停止' : '语音输入'"
        >
          <Mic v-if="!isListening" class="w-5 h-5" />
          <MicOff v-else class="w-5 h-5" />
          <!-- 录音波纹指示 -->
          <span v-if="isListening" class="absolute inset-0 rounded-2xl ring-4 ring-red-300 animate-ping opacity-30"></span>
        </button>

        <textarea
          v-model="inputMessage"
          rows="1"
          class="flex-1 resize-none rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 max-h-32 transition-all duration-200 placeholder:text-gray-300"
          :placeholder="isListening ? '正在聆听...' : '说说你的感受...'"
          :disabled="isStreaming"
          @keydown="handleKeydown"
          @input="(e: any) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }"
        ></textarea>
        <button
          class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
          :class="inputMessage.trim() && !isStreaming ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
          :disabled="!inputMessage.trim() || isStreaming"
          @click="sendMessage"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
      <p class="text-center text-xs text-gray-400 mt-2">
        你的隐私很重要，我们不会记录你的对话内容
      </p>
    </footer>

    <!-- Bottom Nav -->
    <BottomNavBar active-tab="chat" />
  </div>
</template>
