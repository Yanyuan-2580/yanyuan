<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Heart, MessageCircle, BookOpen, ClipboardList,
  ArrowRight, Users, Star,
  MapPin, PhoneCall,
  Headphones, Menu, X, Clock,
  UserCheck, Mic, QrCode, Zap, Cpu,
  Calendar, Smile, Music, Video, Phone, Shield
} from 'lucide-vue-next';

const router = useRouter();
const isLoggedIn = !!localStorage.getItem('accessToken');
const mobileMenuOpen = ref(false);

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── 导航菜单 ──
const navItems = [
  { label: 'AI 对话', path: '#ai-assistant' },
  { label: '情绪日记', path: '#diary' },
  { label: '心理知识', path: '#knowledge' },
  { label: '冥想疗愈', path: '#meditation' },
  { label: '心理测评', path: '#assessment' },
];

// ── 核心功能卡片 (8个) ──
const features = [
  { icon: MessageCircle, title: 'AI 心理陪伴', desc: 'DeepSeek 驱动的AI助手，24小时在线倾听与支持', color: 'bg-rose-50 text-rose-500', path: '/chat' },
  { icon: Calendar, title: '情绪日记', desc: '记录每日心情，AI 智能分析情绪变化趋势', color: 'bg-amber-50 text-amber-500', path: '/diary' },
  { icon: Smile, title: '心情追踪', desc: '快速记录情绪状态，可视化趋势图表洞察内心', color: 'bg-emerald-50 text-emerald-500', path: '/mood' },
  { icon: Music, title: '冥想疗愈', desc: '多种冥想练习引导，放松身心、改善睡眠', color: 'bg-calm-50 text-calm-500', path: '/meditation' },
  { icon: BookOpen, title: '心理知识库', desc: '丰富的心理健康科普文章与专业内容', color: 'bg-sky-50 text-sky-500', path: '/knowledge' },
  { icon: ClipboardList, title: '心理测评', desc: '专业量表 + AI 自动评分 + 个性化报告', color: 'bg-violet-50 text-violet-500', path: '/questionnaire' },
  { icon: Video, title: '视频咨询', desc: '线上一对一视频交流，面对面心理支持', color: 'bg-indigo-50 text-indigo-500', path: '/video' },
  { icon: Phone, title: '心理援助热线', desc: '全国心理危机干预热线汇总，免费保密24小时', color: 'bg-orange-50 text-orange-500', path: '/user/hotline' },
];

// ── 平台亮点 ──
const highlights = [
  { icon: Shield, title: '隐私安全', desc: '端到端加密，你的每一句话都严格保密', color: 'bg-calm-50 text-calm-500' },
  { icon: Cpu, title: 'AI 驱动', desc: 'DeepSeek 大模型，智能共情与情绪识别', color: 'bg-blue-50 text-blue-500' },
  { icon: Clock, title: '24h 陪伴', desc: '随时随地，无需预约，永远在线的倾听者', color: 'bg-amber-50 text-amber-500' },
  { icon: Heart, title: '温暖治愈', desc: '极简轻奢设计，给你一个安心的心灵空间', color: 'bg-rose-50 text-rose-500' },
];

// ── 统计数字 ──
const stats = [
  { number: 'AI 驱动', label: 'DeepSeek 大语言模型' },
  { number: '8 大', label: '心理健康功能模块' },
  { number: '24h', label: '全天候AI陪伴' },
  { number: '100%', label: '隐私数据加密保护' },
];
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <!-- ═══════════════════ 1. 顶部导航栏 ═══════════════════ -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-10">
          <!-- Logo -->
          <div class="flex items-center gap-2 cursor-pointer" @click="scrollTo('hero')">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-calm-400 to-calm-500 flex items-center justify-center">
              <Heart class="w-4 h-4 text-white" fill="white" />
            </div>
            <span class="text-lg font-bold text-gray-900 tracking-tight">心灵港湾</span>
          </div>

          <nav class="hidden lg:flex items-center gap-1">
            <a
              v-for="item in navItems"
              :key="item.label"
              class="px-3 py-2 text-sm text-gray-600 hover:text-calm-600 rounded-lg hover:bg-calm-50 transition-colors cursor-pointer"
              @click="scrollTo(item.path.replace('#', ''))"
            >{{ item.label }}</a>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isLoggedIn"
            class="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95"
            @click="router.push('/login')"
          >登录 / 注册</button>
          <button
            v-else
            class="px-5 py-2 bg-calm-500 text-white text-sm font-medium rounded-full hover:bg-calm-600 hover:shadow-lg transition-all active:scale-95"
            @click="router.push('/chat')"
          >进入对话</button>
          <button class="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" @click="mobileMenuOpen = !mobileMenuOpen">
            <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-100 bg-white px-6 py-3 space-y-1">
        <a v-for="item in navItems" :key="item.label"
          class="block px-3 py-2.5 text-sm text-gray-600 hover:text-calm-600 hover:bg-calm-50 rounded-lg transition-colors cursor-pointer"
          @click="scrollTo(item.path.replace('#', '')); mobileMenuOpen = false"
        >{{ item.label }}</a>
      </div>
    </header>

    <!-- ═══════════════════ 2. 首屏 Hero ═══════════════════ -->
    <section id="hero" class="relative overflow-hidden bg-gradient-to-br from-calm-50/60 via-white to-amber-50/40">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-calm-200/30 via-blue-200/20 to-amber-100/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/25 to-calm-200/15 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

      <div class="relative max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-28">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 bg-calm-50 text-calm-600 text-xs font-medium rounded-full px-4 py-1.5 mb-6">
              <Zap class="w-3.5 h-3.5" />
              AI 驱动 · 温暖陪伴
            </div>
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              心理健康<span class="text-calm-500">AI 助手</span>
            </h1>
            <p class="text-gray-500 text-base md:text-lg mb-2 leading-relaxed">
              温暖陪伴，专业支持
            </p>
            <p class="text-gray-400 text-sm max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              基于 DeepSeek 大模型的 AI 心理健康服务平台，提供情绪追踪、AI 对话、冥想疗愈、心理测评等全方位心理关怀
            </p>
            <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                class="px-8 py-3.5 bg-calm-500 text-white font-semibold rounded-full shadow-lg hover:bg-calm-600 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                @click="router.push(isLoggedIn ? '/chat' : '/login')"
              >{{ isLoggedIn ? '开始对话' : '免费开始' }}</button>
              <button
                class="px-8 py-3.5 bg-white text-gray-600 font-medium rounded-full border-2 border-gray-200 hover:border-calm-300 hover:text-calm-600 hover:shadow-md transition-all active:scale-95"
                @click="scrollTo('features')"
              >探索功能</button>
            </div>
          </div>

          <div class="relative flex justify-center">
            <div class="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <div class="absolute -inset-4 bg-gradient-to-br from-calm-300/40 via-blue-300/30 to-amber-200/30 rounded-[2rem] blur-sm" />
              <img src="/images/bg-hero.jpg" alt="温暖陪伴" class="relative w-full h-full object-cover rounded-3xl" />
              <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-calm-50 flex items-center justify-center">
                  <Shield class="w-5 h-5 text-calm-500" />
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-800">隐私安全保障</p>
                  <p class="text-[10px] text-gray-400">端到端数据加密</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 3. 数据统计栏 ═══════════════════ -->
    <section class="bg-charcoal-900 py-10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 tracking-tight">{{ stat.number }}</p>
            <p class="text-xs md:text-sm text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 4. 核心功能 ═══════════════════ -->
    <section id="features" class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 bg-calm-50 text-calm-600 text-xs font-medium rounded-full mb-4">核心功能</span>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">全方位心理健康服务</h2>
          <p class="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            涵盖 AI 情感陪伴、情绪追踪、冥想放松、心理测评、知识科普等功能，一站式守护你的心理健康
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          <div
            v-for="feature in features" :key="feature.title"
            class="group bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:border-calm-200 hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1"
            @click="router.push(feature.path)"
          >
            <div :class="[feature.color, 'w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform']">
              <component :is="feature.icon" class="w-5 h-5" />
            </div>
            <h3 class="font-semibold text-gray-800 text-sm md:text-base mb-1.5">{{ feature.title }}</h3>
            <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">{{ feature.desc }}</p>
            <div class="flex items-center gap-1 mt-3 text-xs font-medium text-calm-500 opacity-0 group-hover:opacity-100 transition-opacity">
              立即体验 <ArrowRight class="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 5. AI 对话核心模块 ═══════════════════ -->
    <section id="ai-assistant" class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-calm-500 via-calm-600 to-emerald-600 p-8 md:p-12">
          <div class="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div class="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-white text-xs font-medium mb-6">
                <Zap class="w-3.5 h-3.5" /> AI 智能对话
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">24 小时 AI 心理陪伴</h2>
              <p class="text-white/80 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                基于 DeepSeek 大语言模型，具备深度共情能力的 AI 心理助手。无论是深夜情绪低落、工作压力山大，还是只是想找人说说话，我都在这里陪着你。
              </p>
              <div class="flex items-center gap-3 justify-center md:justify-start">
                <button
                  class="flex items-center gap-2 px-6 py-3 bg-white text-calm-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                  @click="router.push('/chat')"
                >
                  <MessageCircle class="w-4 h-4" /> 文字对话
                </button>
                <button
                  class="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white font-medium rounded-full border border-white/30 hover:bg-white/30 transition-all active:scale-95"
                  @click="router.push('/chat')"
                >
                  <Mic class="w-4 h-4" /> 语音输入
                </button>
              </div>
            </div>

            <!-- 温暖插画占位 -->
            <div class="flex justify-center">
              <div class="relative w-48 h-48 md:w-56 md:h-56 bg-white/15 rounded-full flex items-center justify-center">
                <div class="text-6xl md:text-7xl">💬</div>
                <div class="absolute -bottom-2 right-0 text-3xl">❤️</div>
                <div class="absolute -top-2 left-0 text-3xl">🌟</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 心理评估板块 ── -->
        <div id="assessment" class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span class="inline-block px-3 py-1 bg-calm-50 text-calm-600 text-xs font-medium rounded-full mb-4">心理测评</span>
            <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">专业心理量表测评</h3>
            <div class="space-y-3 mb-6">
              <div v-for="item in [
                { title: '多维度自评量表', desc: '涵盖焦虑、抑郁、压力、睡眠等核心心理健康维度' },
                { title: 'AI 智能评分', desc: '自动评分 + AI 深度分析，生成个性化解读报告' },
                { title: '科学建议指导', desc: '基于评估结果提供专业改善建议与行动方案' },
                { title: '进度追踪', desc: '定期复测对比，可视化你的心理健康改善轨迹' },
              ]" :key="item.title" class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-calm-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-calm-500"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p class="text-sm text-gray-600"><strong>{{ item.title }}</strong> — {{ item.desc }}</p>
              </div>
            </div>
            <button
              class="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95"
              @click="router.push('/questionnaire')"
            >开始心理测评</button>
          </div>

          <!-- 手机界面示意 -->
          <div class="flex justify-center">
            <div class="relative w-56 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-b-2xl z-10" />
              <div class="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
                <div class="bg-calm-500 text-white text-xs font-medium text-center py-2.5">心理测评</div>
                <div class="flex-1 p-4 space-y-3">
                  <div class="h-3 bg-gray-100 rounded w-3/4" />
                  <div class="h-3 bg-gray-100 rounded w-1/2" />
                  <div class="h-20 bg-calm-50 rounded-xl mt-3 flex items-center justify-center text-calm-400 text-xs">📋 焦虑自评量表 (SAS)</div>
                  <div class="h-20 bg-amber-50 rounded-xl flex items-center justify-center text-amber-400 text-xs">📋 抑郁自评量表 (SDS)</div>
                  <div class="h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400 text-xs">📋 压力感知量表 (PSS)</div>
                  <div class="h-10 bg-calm-500 rounded-xl mt-4 flex items-center justify-center text-white text-xs font-medium">开始测评</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 6. 平台亮点 ═══════════════════ -->
    <section id="highlights" class="py-16 md:py-20 bg-charcoal-900">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 bg-white/10 text-white/70 text-xs font-medium rounded-full mb-4">为什么选择我们</span>
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">你的随身心理陪伴</h2>
          <p class="text-gray-400 text-sm max-w-xl mx-auto">
            不同于传统心理咨询，我们让心理健康关怀变得随时随地、触手可及
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="item in highlights" :key="item.title"
            class="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all text-center"
          >
            <div :class="[item.color, 'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4']">
              <component :is="item.icon" class="w-6 h-6" />
            </div>
            <h3 class="font-semibold text-white text-sm mb-2">{{ item.title }}</h3>
            <p class="text-gray-400 text-xs leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 7. 情绪日记 + 冥想 展示 ═══════════════════ -->
    <section id="diary" class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- 情绪日记 -->
          <div class="bg-gradient-to-br from-amber-50 to-rose-50 rounded-3xl p-8 md:p-10">
            <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5">
              <Calendar class="w-6 h-6 text-amber-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">情绪日记</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-6">
              每天花几分钟记录心情，AI 自动分析你的情绪变化趋势。通过长期追踪，发现影响情绪的关键因素，更好地了解自己的内心世界。
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">📝 富文本编辑</span>
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">📊 AI 情绪分析</span>
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">📈 趋势图表</span>
            </div>
            <button
              class="inline-flex items-center gap-2 text-amber-600 font-medium text-sm hover:gap-3 transition-all"
              @click="router.push('/diary')"
            >开始记录 <ArrowRight class="w-4 h-4" /></button>
          </div>

          <!-- 冥想疗愈 -->
          <div class="bg-gradient-to-br from-calm-50 to-blue-50 rounded-3xl p-8 md:p-10">
            <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5">
              <Music class="w-6 h-6 text-calm-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">冥想疗愈</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-6">
              多种场景冥想引导：晨间唤醒、睡前放松、压力舒缓、专注提升。跟随音频指导，在呼吸之间找回内心的平静与力量。
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">🧘 呼吸练习</span>
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">🎵 引导音频</span>
              <span class="bg-white rounded-full px-3 py-1 shadow-sm">⏱️ 计时追踪</span>
            </div>
            <button
              class="inline-flex items-center gap-2 text-calm-600 font-medium text-sm hover:gap-3 transition-all"
              @click="router.push('/meditation')"
            >开始冥想 <ArrowRight class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 8. 知识库 + 视频 ═══════════════════ -->
    <section id="knowledge" class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- 心理知识库 -->
          <div class="bg-white rounded-3xl p-8 md:p-10 shadow-card">
            <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-5">
              <BookOpen class="w-6 h-6 text-sky-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">心理知识库</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-6">
              涵盖情绪管理、人际交往、自我成长、亲密关系等主题的专业心理科普文章。由心理学专业人士撰写，用通俗易懂的方式传播心理健康知识。
            </p>
            <button
              class="inline-flex items-center gap-2 text-sky-600 font-medium text-sm hover:gap-3 transition-all"
              @click="router.push('/knowledge')"
            >浏览文章 <ArrowRight class="w-4 h-4" /></button>
          </div>

          <!-- 视频咨询 -->
          <div class="bg-white rounded-3xl p-8 md:p-10 shadow-card">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
              <Video class="w-6 h-6 text-indigo-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">视频咨询</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-6">
              当文字不够表达时，线上一对一视频交流为你提供更直接的支持。创建专属咨询房间，与心理咨询师进行面对面深度沟通。
            </p>
            <button
              class="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:gap-3 transition-all"
              @click="router.push('/video')"
            >进入咨询 <ArrowRight class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 9. 底部 CTA ═══════════════════ -->
    <section class="py-16 md:py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="relative rounded-3xl overflow-hidden shadow-lg">
          <img src="/images/bg-cta.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-br from-calm-600/85 via-calm-700/80 to-emerald-700/85" />
          <div class="relative p-10 md:p-14 text-white">
            <Heart class="w-10 h-10 mx-auto mb-5 text-white/80" fill="white" />
            <h2 class="text-2xl md:text-3xl font-bold mb-3">准备好开始心灵之旅了吗？</h2>
            <p class="text-white/70 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              无论你正在经历什么，这里有一个永远在线的倾听者，陪你一起走过
            </p>
            <button
              v-if="!isLoggedIn"
              class="px-10 py-3.5 bg-white text-calm-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
              @click="router.push('/login')"
            >免费开始使用</button>
            <button
              v-else
              class="px-10 py-3.5 bg-white text-calm-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
              @click="router.push('/chat')"
            >进入 AI 对话</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 10. 页脚 ═══════════════════ -->
    <footer class="bg-gray-50 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 class="font-semibold text-gray-800 text-sm mb-4">功能导航</h4>
            <div class="space-y-2.5">
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/chat')">AI 对话</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/diary')">情绪日记</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/mood')">心情追踪</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/knowledge')">心理知识库</a>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-800 text-sm mb-4">更多服务</h4>
            <div class="space-y-2.5">
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/meditation')">冥想疗愈</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/questionnaire')">心理测评</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/video')">视频咨询</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/user/hotline')">心理援助热线</a>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-800 text-sm mb-4">关于我们</h4>
            <div class="space-y-2.5">
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/user/about')">关于心灵港湾</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer" @click="router.push('/user/help')">帮助中心</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer">用户协议</a>
              <a class="block text-xs text-gray-400 hover:text-calm-600 transition-colors cursor-pointer">隐私政策</a>
            </div>
          </div>

          <div>
            <div class="flex gap-4 mb-4">
              <div class="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                <QrCode class="w-8 h-8 text-gray-400" />
              </div>
              <div class="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                <QrCode class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p class="text-xs text-gray-500 mb-2">扫码关注心灵港湾</p>
            <p class="text-xs text-gray-400">温暖陪伴，专业支持</p>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 py-6">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-md bg-gradient-to-br from-calm-400 to-calm-500 flex items-center justify-center">
              <Heart class="w-3 h-3 text-white" fill="white" />
            </div>
            <p class="text-xs text-gray-400">© 2024 心灵港湾 · 心理健康AI助手</p>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <a class="hover:text-gray-600 transition-colors cursor-pointer">隐私政策</a>
            <a class="hover:text-gray-600 transition-colors cursor-pointer">用户协议</a>
            <span>备案号：待备案</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
