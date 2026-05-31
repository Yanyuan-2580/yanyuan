
<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: '心理健康助手是什么？',
    answer: '心理健康助手是一款温暖的心理陪伴工具，提供AI情感对话、情绪记录、心理健康知识、冥想放松等功能。请注意，我们是陪伴工具而非医疗产品，不能替代专业的心理咨询与精神科诊疗。'
  },
  {
    question: '可以和AI聊什么？',
    answer: '你可以和AI分享任何让你开心或烦恼的事情——工作压力、人际困惑、情绪波动、日常感悟等。AI会以温暖、包容的态度倾听和陪伴你。'
  },
  {
    question: '对话记录安全吗？',
    answer: '你的对话记录仅你自己可见，我们采用加密存储。我们的隐私政策严格保护你的个人信息，未经授权不会向第三方透露。'
  },
  {
    question: '情绪记录有什么作用？',
    answer: '情绪记录可以帮助你觉察自己的情绪变化规律，了解哪些因素会影响你的心情。长期坚持记录，你可以更深入地理解自己，更好地管理情绪。'
  },
  {
    question: '冥想课程如何使用？',
    answer: '选择你喜欢的冥想课程，找到一个安静舒适的地方，跟随引导进行即可。初学者建议从短时间的冥想开始，逐步增加时长。'
  },
  {
    question: '我需要帮助怎么办？',
    answer: '如果你正处于严重的心理困扰中，请务必寻求专业帮助：\n- 全国心理援助热线：400-161-9995\n- 北京心理危机研究与干预中心：010-82951332\n- 希望24热线：400-161-9995\n请记住，寻求帮助是勇敢的表现。'
  }
];

const expandedIndex = ref<number | null>(null);

const toggleFaq = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index;
};
</script>

<template>
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="帮助中心" :show-back="true" />

    <div class="max-w-lg mx-auto px-4 py-6 space-y-4">
      <!-- Crisis Hotline -->
      <div class="bg-red-50 border border-red-200 rounded-2xl p-4">
        <h3 class="text-red-700 font-semibold text-sm mb-2">🆘 紧急求助热线</h3>
        <p class="text-red-600 text-xs">如果你正处于紧急危机中，请立即拨打：</p>
        <div class="mt-2 space-y-1 text-sm text-red-700">
          <p>📞 全国心理援助热线：400-161-9995</p>
          <p>📞 北京心理危机干预中心：010-82951332</p>
          <p>📞 希望24热线：400-161-9995</p>
        </div>
      </div>

      <!-- FAQ -->
      <h2 class="text-lg font-semibold text-gray-800 pt-2">常见问题</h2>
      <div class="space-y-2">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <button
            class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
            @click="toggleFaq(index)"
          >
            <span class="text-sm font-medium text-gray-700">{{ faq.question }}</span>
            <span class="text-gray-400 transition-transform" :class="expandedIndex === index ? 'rotate-180' : ''">▾</span>
          </button>
          <div
            v-if="expandedIndex === index"
            class="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="bg-white rounded-2xl p-4 shadow-sm text-center">
        <p class="text-sm text-gray-600">还有其他问题？</p>
        <p class="text-xs text-gray-400 mt-1">请联系客服邮箱：support@mentalhealth.app</p>
      </div>
    </div>

    <BottomNavBar active-tab="user" />
  </div>
</template>
