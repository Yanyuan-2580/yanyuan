<script setup lang="ts">import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { chatApi } from '@/api';
import type { AiSession, ChatMessage } from '@/types';
import { Send, Plus, X, MessageCircle, BookOpen, Calendar, Heart, MoreVertical } from 'lucide-vue-next';
const route = useRoute();
const router = useRouter();
const currentSession = ref<AiSession | null>(null);
const sessions = ref<AiSession[]>([]);
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isSending = ref(false);
const showSessionList = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const scrollToBottom = async () => {
 await nextTick();
 if (messagesContainer.value) {
 messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
 }
};
const loadSessions = async () => {
 try {
 console.log('loadSessions called');
 const res = await chatApi.getSessions();
 console.log('loadSessions response:', JSON.stringify(res));
 if (res && res.code === 200) {
 sessions.value = res.data || [];
 console.log('sessions.value after load:', sessions.value.length, 'items');
 } else {
 sessions.value = [];
 console.log('loadSessions failed or no data');
 }
 } catch (error) {
 console.error('Error loading sessions:', error);
 sessions.value = [];
 }
};
const loadMessages = async (sessionId: number) => {
 try {
 console.log('loadMessages called with sessionId:', sessionId);
 if (!sessionId || isNaN(sessionId)) {
 console.error('Invalid sessionId:', sessionId);
 return;
 }
 const res = await chatApi.getMessages(sessionId.toString());
 console.log('API Response:', JSON.stringify(res));
 
 if (res && res.code === 200) {
 console.log('Messages data received:', res.data);
 console.log('Data length:', res.data?.length || 0);
 
 if (res.data && Array.isArray(res.data)) {
 messages.value = res.data;
 console.log('messages.value after assignment:', messages.value.length, 'items');
 } else {
 messages.value = [];
 console.log('res.data is not an array');
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
 await nextTick();
 await scrollToBottom();
 } else {
 console.log('API response error:', res?.code, res?.message);
 }
 } catch (error) {
 console.error('Error loading messages:', error);
 }
};
const selectSession = async (session: AiSession) => {
 currentSession.value = session;
 showSessionList.value = false;
 await loadMessages(session.id);
 router.push(`/chat/${session.id}`);
};
const createNewSession = async () => {
 const res = await chatApi.createSession();
 if (res.code === 200) {
 await loadSessions();
 await selectSession(res.data);
 }
};
const sendMessage = async () => {
 if (!inputMessage.value.trim() || isSending.value)
 return;
 isSending.value = true;
 const content = inputMessage.value.trim();
 inputMessage.value = '';
 try {
 const res = await chatApi.sendMessage({
 content,
 sessionId: currentSession.value?.id?.toString()
 });
 if (res.code === 200) {
 if (!currentSession.value) {
 currentSession.value = res.data.session;
 await loadSessions();
 }
 messages.value.push({
 sessionId: res.data.message.sessionId,
 userId: res.data.message.userId,
 role: 'user',
 content,
 createdAt: new Date().toISOString(),
 riskLevel: 0
 });
 messages.value.push(res.data.message);
 await scrollToBottom();
 await loadSessions();
 }
 }
 catch (error: any) {
 console.error('Failed to send message:', error);
 }
 finally {
 isSending.value = false;
 }
};
watch(() => route.params.sessionId, async (newSessionId) => {
 if (newSessionId) {
 const sessionId = parseInt(newSessionId);
 const session = sessions.value.find(s => s.id === sessionId);
 if (session) {
 await selectSession(session);
 } else {
 await loadMessages(sessionId);
 }
 }
});
onMounted(async () => {
 console.log('onMounted called');
 console.log('Current route:', JSON.stringify(route.params));
 
 await loadSessions();
 console.log('Sessions loaded:', sessions.value.length);
 
 if (route.params.sessionId) {
 const sessionId = parseInt(route.params.sessionId as string);
 console.log('Found sessionId in route:', sessionId);
 
 const session = sessions.value.find(s => s.id === sessionId);
 if (session) {
 console.log('Found session in list:', session.title);
 await selectSession(session);
 } else {
 console.log('Session not in list, loading messages directly');
 await loadMessages(sessionId);
 }
 } else if (sessions.value.length > 0) {
 console.log('No sessionId in route, selecting first session:', sessions.value[0].title);
 await selectSession(sessions.value[0]);
 } else {
 console.log('No sessions found, showing welcome screen');
 }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button 
          v-if="currentSession"
          class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          @click="showSessionList = !showSessionList"
        >
          <MessageCircle class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center">
            <span class="text-white font-semibold">AI</span>
          </div>
          <div>
            <h1 class="font-semibold text-gray-800">{{ currentSession?.title || 'AI心理助手' }}</h1>
            <p class="text-xs text-gray-500">在线 - 随时为你服务</p>
          </div>
        </div>
      </div>
      <button class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
        <MoreVertical class="w-5 h-5 text-gray-600" />
      </button>
    </header>
    
    <div 
      v-if="showSessionList" 
      class="absolute top-14 left-0 right-0 bg-white shadow-lg z-10 border-b border-gray-100"
    >
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-800">消息列表</h2>
        <button 
          class="btn-primary text-sm px-4 py-1.5"
          @click="createNewSession"
        >
          新建会话
        </button>
      </div>
      
      <div class="max-h-80 overflow-y-auto">
        <button
          v-for="session in sessions"
          :key="session.id"
          class="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-primary-50': currentSession?.id === session.id }"
          @click="selectSession(session)"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center flex-shrink-0">
            <MessageCircle class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 text-left">
            <p class="font-medium text-gray-800 truncate">{{ session.title || '新会话' }}</p>
            <p class="text-sm text-gray-500">{{ session.messageCount }} 条消息</p>
          </div>
          <span class="text-xs text-gray-400">{{ new Date(session.updatedAt).toLocaleDateString() }}</span>
        </button>
        
        <div v-if="sessions.length === 0" class="p-8 text-center text-gray-500">
          <MessageCircle class="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无会话，开始你的第一次对话吧</p>
        </div>
      </div>
    </div>
    
    <main 
      ref="messagesContainer"
      class="flex-1 p-4 overflow-y-auto"
    >
      <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-warm-400 flex items-center justify-center mb-4">
          <MessageCircle class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">你好，我是你的AI心理助手</h2>
        <p class="text-gray-500 mb-6 max-w-xs">有什么想聊的吗？我在这里倾听你的心声。</p>
        
        <div class="grid grid-cols-2 gap-3 w-full max-w-sm">
          <button 
            class="p-3 bg-primary-50 rounded-xl text-left hover:bg-primary-100 transition-colors"
            @click="inputMessage = '我最近感觉很焦虑'"
          >
            <p class="text-sm font-medium text-primary-700">我最近感觉很焦虑</p>
          </button>
          <button 
            class="p-3 bg-warm-50 rounded-xl text-left hover:bg-warm-100 transition-colors"
            @click="inputMessage = '如何缓解压力？'"
          >
            <p class="text-sm font-medium text-warm-700">如何缓解压力？</p>
          </button>
          <button 
            class="p-3 bg-calm-50 rounded-xl text-left hover:bg-calm-100 transition-colors"
            @click="inputMessage = '我觉得很孤独'"
          >
            <p class="text-sm font-medium text-calm-700">我觉得很孤独</p>
          </button>
          <button 
            class="p-3 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
            @click="inputMessage = '给我一些正能量'"
          >
            <p class="text-sm font-medium text-purple-700">给我一些正能量</p>
          </button>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex gap-3 animate-fadeIn"
          :class="message.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="message.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gradient-to-br from-primary-400 to-warm-400 text-white'"
          >
            <span v-if="message.role === 'user'" class="text-sm">👤</span>
            <MessageCircle v-else class="w-5 h-5" />
          </div>
          
          <div 
            class="max-w-[75%] px-4 py-3 rounded-2xl"
            :class="message.role === 'user' 
              ? 'bg-primary-500 text-white rounded-tr-md' 
              : 'bg-white text-gray-800 rounded-tl-md shadow-sm'"
          >
            <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            <p 
              class="text-xs mt-1 opacity-70"
              :class="message.role === 'user' ? 'text-white' : 'text-gray-400'"
            >
              {{ new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="bg-white border-t border-gray-100 p-4 pb-20">
      <div class="flex items-end gap-3">
        <button class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Plus class="w-5 h-5 text-gray-600" />
        </button>
        
        <div class="flex-1 relative">
          <textarea
            v-model="inputMessage"
            placeholder="输入你想说的话..."
            rows="1"
            class="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
            @keydown.enter.exact.prevent="sendMessage"
          ></textarea>
        </div>
        
        <button 
          class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-colors"
          :disabled="!inputMessage.trim() || isSending"
          @click="sendMessage"
        >
          <svg v-if="isSending" class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <Send v-else class="w-5 h-5 text-white" />
        </button>
      </div>
      
      <p class="text-center text-xs text-gray-400 mt-2">
        你的隐私很重要，我们不会记录你的对话内容
      </p>
    </footer>
    
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <div class="max-w-lg mx-auto flex justify-around">
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path === '/' }"
          @click="router.push('/')"
        >
          <Heart class="w-6 h-6" />
          <span class="text-xs">首页</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/chat') }"
          @click="router.push('/chat')"
        >
          <MessageCircle class="w-6 h-6" />
          <span class="text-xs">咨询</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/diary') }"
          @click="router.push('/diary')"
        >
          <Calendar class="w-6 h-6" />
          <span class="text-xs">日记</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/knowledge') }"
          @click="router.push('/knowledge')"
        >
          <BookOpen class="w-6 h-6" />
          <span class="text-xs">知识</span>
        </button>
        <button 
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          :class="{ 'text-primary-500': router.currentRoute.value.path.startsWith('/user') }"
          @click="router.push('/user')"
        >
          <span class="text-lg">👤</span>
          <span class="text-xs">我的</span>
        </button>
      </div>
    </nav>
  </div>
</template>
