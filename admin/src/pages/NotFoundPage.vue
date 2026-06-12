<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
        <span class="text-6xl text-gray-600">404</span>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-2">页面未找到</h1>
      <p class="text-gray-500 mb-6">抱歉，您访问的页面不存在</p>
      
      <button 
        class="px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all"
        @click="router.push('/')"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
