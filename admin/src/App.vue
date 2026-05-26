<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.loadAdmin();
});
</script>

<template>
  <router-view />
</template>
