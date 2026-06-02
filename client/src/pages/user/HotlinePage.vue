<template>
  <div class="min-h-screen pb-24 animate-page-enter bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <!-- Header -->
    <header class="bg-gradient-to-br from-calm-400 via-calm-500 to-emerald-500 text-white px-6 pt-10 pb-8 rounded-b-3xl">
      <div class="flex items-center gap-3 mb-3">
        <button class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" @click="router.back()">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <h1 class="text-xl font-bold">心理援助</h1>
      </div>
      <p class="text-sm text-white/80">你并不孤单，我们在这里陪伴你</p>
    </header>

    <main class="px-6 py-6 space-y-6">
      <!-- Crisis Helplines -->
      <section class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 hover:shadow-card-hover transition-shadow">
        <h2 class="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <Phone class="w-4 h-4 text-calm-600" />
          全国心理援助热线
        </h2>
        <p class="text-xs text-gray-400 mb-4">以下热线提供24小时免费、保密的心理支持</p>
        <div class="space-y-3">
          <div v-for="hotline in hotlines" :key="hotline.name"
               class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800">{{ hotline.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ hotline.org }}</p>
            </div>
            <a :href="'tel:' + hotline.phone"
               class="px-4 py-2 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap flex-shrink-0">
              {{ hotline.phone }}
            </a>
          </div>
        </div>
      </section>

      <!-- Talk to Someone -->
      <section class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 hover:shadow-card-hover transition-shadow">
        <h2 class="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <MessageCircle class="w-4 h-4 text-calm-600" />
          倾诉与支持
        </h2>
        <div class="grid grid-cols-2 gap-3">
          <button class="p-4 rounded-xl bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-left shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                  @click="router.push('/chat')">
            <MessageCircle class="w-6 h-6 mb-2" />
            <p class="text-sm font-semibold">AI即时倾诉</p>
            <p class="text-xs text-white/70 mt-1">24小时在线</p>
          </button>
          <button class="p-4 rounded-xl bg-white border border-gray-200 text-left hover:shadow-md hover:border-calm-200 hover:text-calm-600 transition-all active:scale-95"
                  @click="router.push('/diary')">
            <Calendar class="w-6 h-6 mb-2 text-calm-600" />
            <p class="text-sm font-semibold text-gray-800">情绪日记</p>
            <p class="text-xs text-gray-400 mt-1">记录与反思</p>
          </button>
        </div>
      </section>

      <!-- FAQ -->
      <section class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 hover:shadow-card-hover transition-shadow">
        <h2 class="text-base font-semibold text-gray-800 mb-4">常见问题</h2>
        <div class="space-y-2">
          <div v-for="(faq, i) in faqs" :key="i" class="border border-gray-100 rounded-xl overflow-hidden">
            <button class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    @click="faq.open = !faq.open">
              <span class="text-sm font-medium text-gray-800 pr-4">{{ faq.q }}</span>
              <ChevronRight class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0" :class="{ 'rotate-90': faq.open }" />
            </button>
            <div v-if="faq.open" class="px-4 pb-4">
              <p class="text-sm text-gray-500 leading-relaxed">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Disclaimer -->
      <div class="p-4 rounded-2xl bg-calm-50 border border-calm-100">
        <p class="text-xs text-calm-700 leading-relaxed">
          <span class="font-medium">⚠️ 重要提示：</span>AI心理支持和心理援助热线不能替代专业的心理诊断和治疗。如果你正在经历严重的心理困扰，请务必寻求专业心理医生或精神科医生的帮助。
        </p>
      </div>
    </main>

    <BottomNavBar active-tab="user" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Phone, MessageCircle, Calendar, ChevronRight } from 'lucide-vue-next';
import BottomNavBar from '@/components/BottomNavBar.vue';

const router = useRouter();

const hotlines = [
  { name: '全国心理危机干预热线', phone: '400-161-9995', org: '北京心理危机研究与干预中心' },
  { name: '希望24热线', phone: '400-161-9995', org: '生命教育与危机干预中心' },
  { name: '北京心理援助热线', phone: '010-82951332', org: '北京安定医院' },
  { name: '上海心理援助热线', phone: '021-12320-5', org: '上海市精神卫生中心' },
  { name: '青少年心理咨询热线', phone: '12355', org: '共青团中央' }
];

const faqs = ref([
  {
    q: '心理咨询和看心理医生有什么区别？',
    a: '心理咨询主要由心理咨询师提供，侧重于通过谈话帮助解决日常生活、情绪、人际关系等心理困扰。心理医生（精神科医生）是具有医学背景的医生，可以进行诊断和开具药物。简单的理解：咨询师侧重"谈话疗愈"，心理医生侧重"医学治疗"。',
    open: false
  },
  {
    q: '什么情况下应该寻求心理帮助？',
    a: '当你感到情绪持续低落、焦虑不安、睡眠质量明显下降、人际关系紧张、工作学习效率下降，或者经历重大生活变故（如失恋、丧失亲人等）时，都可以寻求心理帮助。寻求帮助不是软弱，而是关爱自己的表现。',
    open: false
  },
  {
    q: 'AI心理支持能替代专业咨询吗？',
    a: 'AI心理支持可以提供情绪陪伴、心理知识科普和轻度的情绪疏导，但不能替代专业的心理咨询和治疗。对于严重的心理问题，如重度抑郁、自杀念头等，请立即拨打心理援助热线或前往医院就诊。',
    open: false
  },
  {
    q: '心理热线是免费的吗？',
    a: '本页面列出的心理援助热线均为公益性质，提供免费的、保密的心理支持服务。它们由专业机构运营，接线员经过专业培训。',
    open: false
  },
  {
    q: '我的隐私会受到保护吗？',
    a: '是的。我们非常重视你的隐私。本平台的AI对话不会保存可识别个人身份的信息。拨打心理援助热线时，你的通话内容也是保密的。请放心寻求帮助。',
    open: false
  }
]);
</script>
