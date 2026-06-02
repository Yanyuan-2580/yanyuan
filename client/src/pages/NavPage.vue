<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Heart, MessageCircle, Calendar, BookOpen, Smile, ClipboardList, Music, Phone, Video, ArrowRight, Shield, Zap, Users } from 'lucide-vue-next';

const router = useRouter();

const features = [
  {
    icon: MessageCircle,
    title: 'AI心理陪伴',
    desc: '24小时在线的AI助手，随时倾听你的心声，提供温暖专业的情感支持',
    color: 'from-amber-400 to-orange-400',
    bg: 'from-amber-50 to-orange-50',
    path: '/chat'
  },
  {
    icon: Calendar,
    title: '情绪日记',
    desc: '记录每日心情，AI智能分析情绪变化，帮你更好地了解自己',
    color: 'from-rose-400 to-pink-400',
    bg: 'from-rose-50 to-pink-50',
    path: '/diary'
  },
  {
    icon: Smile,
    title: '心情追踪',
    desc: '快速记录情绪状态，可视化趋势图表，洞察内心的情绪规律',
    color: 'from-emerald-400 to-teal-400',
    bg: 'from-emerald-50 to-teal-50',
    path: '/mood'
  },
  {
    icon: Music,
    title: '冥想疗愈',
    desc: '多种冥想练习引导，帮助放松身心、提升专注力、改善睡眠质量',
    color: 'from-calm-400 to-calm-500',
    bg: 'from-calm-50 to-emerald-50',
    path: '/meditation'
  },
  {
    icon: BookOpen,
    title: '心理知识库',
    desc: '丰富的心理健康科普文章，涵盖情绪管理、人际交往、自我成长等主题',
    color: 'from-sky-400 to-blue-400',
    bg: 'from-sky-50 to-blue-50',
    path: '/knowledge'
  },
  {
    icon: ClipboardList,
    title: '心理测评',
    desc: '专业心理量表，科学的评分体系，AI生成个性化评估报告和建议',
    color: 'from-violet-400 to-purple-400',
    bg: 'from-violet-50 to-purple-50',
    path: '/questionnaire'
  },
  {
    icon: Phone,
    title: '心理援助热线',
    desc: '全国心理危机干预热线汇总，免费、保密、24小时可拨打',
    color: 'from-rose-500 to-red-500',
    bg: 'from-rose-50 to-red-50',
    path: '/user/hotline'
  },
  {
    icon: Video,
    title: '视频咨询',
    desc: '线上一对一视频交流，与专业心理咨询师面对面沟通',
    color: 'from-indigo-400 to-blue-500',
    bg: 'from-indigo-50 to-blue-50',
    path: '/video'
  }
];

const isLoggedIn = !!localStorage.getItem('accessToken');
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-100/60 via-orange-50/40 to-rose-100/50" />
      <div class="absolute top-20 right-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
      <div class="absolute bottom-10 left-10 w-48 h-48 bg-rose-200/20 rounded-full blur-3xl" />

      <div class="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <!-- Logo -->
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-700">
          <Heart class="w-10 h-10 text-white" fill="white" />
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3 tracking-tight">
          心理健康AI助手
        </h1>
        <p class="text-gray-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-2">
          温暖陪伴，专业支持
        </p>
        <p class="text-gray-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
          基于AI技术的心理健康服务平台，提供情绪追踪、AI对话、冥想疗愈、心理测评等全方位心理关怀
        </p>

        <!-- CTA Buttons -->
        <div class="flex items-center justify-center gap-3">
          <button
            v-if="!isLoggedIn"
            class="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            @click="router.push('/login')"
          >
            开始使用
          </button>
          <button
            v-else
            class="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            @click="router.push('/chat')"
          >
            进入对话
          </button>
          <button
            class="px-8 py-3 bg-white text-gray-600 font-medium rounded-2xl border border-gray-200 hover:border-amber-200 hover:text-amber-600 hover:shadow-md transition-all active:scale-95"
            @click="router.push('/user/hotline')"
          >
            心理援助
          </button>
        </div>
      </div>
    </section>

    <!-- Trust Indicators -->
    <section class="max-w-3xl mx-auto px-6 -mt-2 pb-8">
      <div class="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-card grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-calm-50 flex items-center justify-center">
            <Shield class="w-5 h-5 text-calm-500" />
          </div>
          <p class="text-sm font-medium text-gray-700">隐私保护</p>
          <p class="text-xs text-gray-400">数据加密安全</p>
        </div>
        <div class="text-center">
          <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-warm-50 flex items-center justify-center">
            <Zap class="w-5 h-5 text-warm-500" />
          </div>
          <p class="text-sm font-medium text-gray-700">AI驱动</p>
          <p class="text-xs text-gray-400">智能情绪分析</p>
        </div>
        <div class="text-center">
          <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-50 flex items-center justify-center">
            <Users class="w-5 h-5 text-primary-500" />
          </div>
          <p class="text-sm font-medium text-gray-700">专业支持</p>
          <p class="text-xs text-gray-400">温暖陪伴</p>
        </div>
      </div>
    </section>

    <!-- Feature Navigation -->
    <section class="max-w-4xl mx-auto px-6 pb-12">
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-2">探索功能</h2>
        <p class="text-sm text-gray-400">选择你需要的服务，开始心灵之旅</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1"
          @click="router.push(feature.path)"
        >
          <div :class="[feature.bg, 'w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform']">
            <component :is="feature.icon" class="w-6 h-6 text-amber-500" />
          </div>
          <h3 class="font-semibold text-gray-800 text-sm mb-1.5">{{ feature.title }}</h3>
          <p class="text-xs text-gray-400 leading-relaxed line-clamp-3">{{ feature.desc }}</p>
          <div class="flex items-center gap-1 mt-3 text-xs font-medium text-amber-500">
            立即体验 <ArrowRight class="w-3 h-3" />
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="max-w-2xl mx-auto px-6 pb-16 text-center">
      <div class="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-8 text-white shadow-lg">
        <h2 class="text-xl font-bold mb-2">准备好开始了吗？</h2>
        <p class="text-white/80 text-sm mb-6">无论你正在经历什么，我们都在这里陪伴你</p>
        <button
          v-if="!isLoggedIn"
          class="px-8 py-3 bg-white text-amber-600 font-semibold rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          @click="router.push('/login')"
        >
          免费开始
        </button>
        <button
          v-else
          class="px-8 py-3 bg-white text-amber-600 font-semibold rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          @click="router.push('/chat')"
        >
          去聊天
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-100 py-6 text-center">
      <p class="text-xs text-gray-400">
        心理健康AI助手 · 温暖陪伴，专业支持
      </p>
      <p class="text-xs text-gray-300 mt-1">
        AI心理支持不能替代专业诊断和治疗 · 如有严重困扰请寻求专业帮助
      </p>
    </footer>
  </div>
</template>
