<template>
  <span class="inline-flex items-center" :class="sizeClass">
    <span class="leading-none" :style="{ fontSize: emojiSize }">{{ moodEmoji }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  score: number;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  score: 3,
  size: 'md'
});

const moodEmoji = computed(() => {
  if (props.score >= 5) return '😄';
  if (props.score >= 4) return '🙂';
  if (props.score >= 3) return '😐';
  if (props.score >= 2) return '😔';
  return '😢';
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return '';
    case 'lg': return 'text-3xl';
    default: return 'text-xl';
  }
});

const emojiSize = computed(() => {
  switch (props.size) {
    case 'sm': return '1rem';
    case 'lg': return '2rem';
    default: return '1.5rem';
  }
});
</script>
