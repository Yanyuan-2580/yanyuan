<template>
  <div class="flex flex-col items-center justify-center py-16 md:py-20 px-4 animate-fade-in">
    <div class="w-20 h-20 rounded-2xl bg-calm-50 flex items-center justify-center mb-5">
      <span class="text-4xl">{{ emoji }}</span>
    </div>
    <h3 class="text-base font-semibold text-gray-700 mb-1.5">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-400 text-center max-w-xs leading-relaxed">{{ description }}</p>
    <div class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  emoji?: string;
  title?: string;
  description?: string;
}>(), {
  emoji: '📭',
  title: '暂无内容',
  description: ''
});
</script>
