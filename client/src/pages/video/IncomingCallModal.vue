<script setup lang="ts">
import { Phone, PhoneOff } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
  caller: { fromUserId: number; fromNickname: string; requestId: string } | null;
}>();

const emit = defineEmits<{
  accept: [];
  reject: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && caller"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-calm-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white text-2xl font-bold">{{ caller?.fromNickname?.charAt(0) || '?' }}</span>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">视频通话请求</h3>
        <p class="text-sm text-gray-500 mb-8">{{ caller?.fromNickname }} 想和你视频聊天</p>

        <div class="flex justify-center gap-6">
          <button
            class="w-14 h-14 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 flex items-center justify-center hover:bg-red-600 transition-all active:scale-95"
            @click="emit('reject')"
          >
            <PhoneOff class="w-6 h-6" />
          </button>
          <button
            class="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95 animate-pulse"
            @click="emit('accept')"
          >
            <Phone class="w-6 h-6" />
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-4">拒绝 · 接听</p>
      </div>
    </div>
  </Teleport>
</template>
