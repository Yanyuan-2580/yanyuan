<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import { Heart } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="关于我们" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Logo & Name -->
      <div class="text-center">
        <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <Heart class="w-10 h-10 text-primary-500" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">心理健康助手</h1>
        <p class="text-sm text-gray-400 mt-1">v1.0.0</p>
      </div>

      <!-- Description -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">关于我们</h2>
        <p class="text-sm text-gray-600 leading-relaxed">
          心理健康助手是一款温暖、安全的心理陪伴工具。我们致力于通过AI技术，为每一位用户提供便捷、可及的心理健康支持服务。
        </p>
        <p class="text-sm text-gray-600 leading-relaxed mt-3">
          我们相信，每个人都值得被温柔对待。无论是日常的情绪波动还是生活的迷茫困惑，我们都希望成为你忠实的朋友——倾听你、陪伴你、理解你。
        </p>
      </div>

      <!-- Disclaimer -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 class="text-amber-700 font-semibold text-sm mb-2">⚠️ 免责声明</h3>
        <p class="text-amber-600 text-xs leading-relaxed">
          心理健康助手是一款心理健康陪伴工具，旨在提供情绪支持和心理知识普及。本产品不提供医疗诊断、治疗方案或处方建议，不能替代专业的心理咨询和精神科诊疗。如果您正在经历严重的心理困扰，请立即寻求专业医疗帮助。
        </p>
      </div>

      <!-- Privacy -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">隐私保护</h2>
        <p class="text-sm text-gray-600 leading-relaxed">
          我们严格遵循《个人信息保护法》《网络安全法》《数据安全法》等法律法规，采用AES-256加密存储敏感数据，全程HTTPS加密传输。你的数据只属于你，未经授权，我们不会向任何第三方透露你的个人信息。
        </p>
        <div class="flex gap-2 mt-3">
          <button class="text-xs text-primary-500 hover:underline">隐私政策</button>
          <span class="text-gray-300">|</span>
          <button class="text-xs text-primary-500 hover:underline">用户协议</button>
        </div>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
