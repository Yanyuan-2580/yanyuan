<template>
  <div class="flex flex-col items-center justify-center py-20 px-4">
    <div class="text-6xl mb-4">{{ emoji }}</div>
    <h3 class="text-lg font-medium text-gray-600 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-400 text-center max-w-xs">{{ description }}</p>
    <slot name="action" />
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
