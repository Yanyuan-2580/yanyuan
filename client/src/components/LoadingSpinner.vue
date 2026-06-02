<template>
  <div class="flex flex-col items-center justify-center py-16" :class="fullPage ? 'min-h-screen' : ''">
    <div class="relative w-10 h-10">
      <div class="w-10 h-10 rounded-full border-[3px] border-calm-100" />
      <div class="absolute top-0 left-0 w-10 h-10 rounded-full border-[3px] border-calm-500 border-t-transparent animate-spin" />
    </div>
    <p v-if="message" class="mt-5 text-sm text-gray-400 animate-pulse-soft">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string;
  fullPage?: boolean;
}>(), {
  message: '加载中...',
  fullPage: false
});
</script>
