<template>
  <div class="flex flex-col items-center justify-center py-12" :class="fullPage ? 'min-h-screen' : ''">
    <div class="relative w-12 h-12">
      <div class="w-12 h-12 rounded-full border-4 border-gray-100 animate-pulse"></div>
      <div class="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
    </div>
    <p v-if="message" class="mt-4 text-sm text-gray-400">{{ message }}</p>
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
