<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import ToastMessage from '@/components/ToastMessage.vue';

const userStore = useUserStore();

onMounted(() => {
  userStore.loadUser();
});
</script>

<template>
  <router-view />
  <ToastMessage />
</template>
