<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30 relative overflow-hidden">
    <!-- Decorative blobs -->
    <div class="fixed top-0 right-0 w-80 h-80 bg-gradient-to-bl from-calm-200/15 to-emerald-200/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
    <div class="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-calm-100/10 to-soft-100/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
    <div class="text-center relative z-10">
      <div class="w-36 h-36 mx-auto mb-6 rounded-full bg-gradient-to-br from-calm-50 to-calm-100 border border-calm-100 flex items-center justify-center shadow-card">
        <span class="text-6xl font-bold bg-gradient-to-r from-calm-500 to-emerald-500 bg-clip-text text-transparent">404</span>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">页面未找到</h1>
      <p class="text-gray-400 mb-8">抱歉，您访问的页面不存在</p>

      <button class="bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 px-6 py-3 rounded-xl font-medium transition-all" @click="router.push('/')">
        返回首页
      </button>
    </div>
  </div>
</template>