<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDarkMode } from '@/composables/useDarkMode';
import ToastMessage from '@/components/ToastMessage.vue';

const userStore = useUserStore();
useDarkMode(); // Initialize dark mode detection

onMounted(() => {
  userStore.loadUser();
});
</script>

<template>
  <div class="min-h-screen bg-soft-50 dark:bg-charcoal-900 dark:text-gray-100 transition-colors duration-300">
    <router-view />
    <ToastMessage />
  </div>
</template>
