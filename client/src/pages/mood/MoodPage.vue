<template>
  <div class="min-h-screen bg-[#faf8f5] py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-[#1E293B] mb-2">情绪记录</h1>
        <p class="text-[#64748B]">记录你的每一天，了解自己的情绪变化</p>
      </div>

      <!-- 今日情绪记录卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1E293B] mb-4">今日心情</h2>
        
        <!-- 情绪选择 -->
        <div class="grid grid-cols-5 gap-4 mb-4">
          <button
            v-for="mood in moods"
            :key="mood.type"
            @click="selectMood(mood)"
            :class="[
              'flex flex-col items-center p-4 rounded-xl transition-all duration-300',
              selectedMood?.type === mood.type
                ? 'bg-[#4ECDC4] text-white shadow-lg scale-105'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            ]"
          >
            <span class="text-3xl mb-2">{{ mood.icon }}</span>
            <span class="text-sm">{{ mood.label }}</span>
          </button>
        </div>

        <!-- 心情评分 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-[#64748B] mb-2">心情评分</label>
          <div class="flex items-center gap-2">
            <input
              type="range"
              v-model="moodScore"
              min="1"
              max="5"
              class="flex-1 h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#4ECDC4]"
            />
            <span class="text-lg font-semibold text-[#4ECDC4]">{{ moodScore }}</span>
          </div>
          <div class="flex justify-between text-xs text-[#94A3B8] mt-1">
            <span>很糟</span>
            <span>一般</span>
            <span>很好</span>
          </div>
        </div>

        <!-- 原因输入 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-[#64748B] mb-2">今天的心情是因为什么？（可选）</label>
          <textarea
            v-model="reason"
            rows="3"
            class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent resize-none"
            placeholder="说说今天发生了什么..."
          ></textarea>
        </div>

        <!-- 提交按钮 -->
        <button
          @click="submitMood"
          :disabled="!selectedMood || isSubmitting"
          :class="[
            'w-full py-3 rounded-xl font-medium transition-all duration-300',
            selectedMood && !isSubmitting
              ? 'bg-gradient-to-r from-[#4ECDC4] to-[#45B7AA] text-white hover:shadow-lg hover:scale-[1.02]'
              : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
          ]"
        >
          {{ isSubmitting ? '记录中...' : '记录心情' }}
        </button>
      </div>

      <!-- 情绪统计 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1E293B] mb-4">本周情绪统计</h2>
        
        <div v-if="stats" class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-[#F8FAFC] rounded-xl">
            <div class="text-2xl font-bold text-[#4ECDC4]">{{ stats.total }}</div>
            <div class="text-sm text-[#64748B]">记录天数</div>
          </div>
          <div class="text-center p-4 bg-[#F8FAFC] rounded-xl">
            <div class="text-2xl font-bold text-[#F59E0B]">{{ stats.avgScore }}</div>
            <div class="text-sm text-[#64748B]">平均评分</div>
          </div>
          <div class="text-center p-4 bg-[#F8FAFC] rounded-xl">
            <div class="text-2xl font-bold" :class="trendColor">{{ trendText }}</div>
            <div class="text-sm text-[#64748B]">趋势</div>
          </div>
        </div>

        <!-- 情绪分布 -->
        <div v-if="stats" class="mt-6">
          <h3 class="text-sm font-medium text-[#64748B] mb-3">情绪分布</h3>
          <div class="flex gap-2">
            <div
              v-for="(count, mood) in stats.moodDistribution"
              :key="mood"
              class="flex-1 bg-[#F1F5F9] rounded-lg p-3"
            >
              <div class="text-center">
                <span class="text-lg">{{ getMoodIcon(mood as string) }}</span>
                <div class="text-xs text-[#64748B] mt-1">{{ count }}次</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 情绪历史 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-[#1E293B] mb-4">情绪历史</h2>
        
        <div class="space-y-3">
          <div
            v-for="record in moodHistory"
            :key="record.id"
            class="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl"
          >
            <div class="flex items-center gap-4">
              <span class="text-2xl">{{ getMoodIcon(record.moodType) }}</span>
              <div>
                <div class="font-medium text-[#1E293B]">{{ formatDate(record.createdAt) }}</div>
                <div v-if="record.reason" class="text-sm text-[#64748B] truncate max-w-xs">{{ record.reason }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-[#4ECDC4]">{{ record.moodScore }}分</div>
            </div>
          </div>
        </div>

        <div v-if="moodHistory.length === 0" class="text-center py-8 text-[#94A3B8]">
          <span class="text-4xl block mb-2">📝</span>
          <p>还没有记录心情，开始记录吧</p>
        </div>
      </div>
    </div>
    <BottomNavBar active-tab="user" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { moodApi } from '@/api/modules/mood';
import { getToast } from '@/composables/useToast';
import BottomNavBar from '@/components/BottomNavBar.vue';

const toast = getToast();

const moods = [
  { type: 'happy', label: '开心', icon: '😊' },
  { type: 'sad', label: '难过', icon: '😢' },
  { type: 'angry', label: '生气', icon: '😤' },
  { type: 'anxious', label: '焦虑', icon: '😰' },
  { type: 'calm', label: '平静', icon: '😌' }
];

const selectedMood = ref<{ type: string; label: string; icon: string } | null>(null);
const moodScore = ref(3);
const reason = ref('');
const stats = ref<any>(null);
const moodHistory = ref<any[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);

const trendColor = computed(() => {
  if (!stats.value?.trend) return 'text-[#64748B]';
  switch (stats.value.trend) {
    case 'up': return 'text-[#10B981]';
    case 'down': return 'text-[#EF4444]';
    default: return 'text-[#64748B]';
  }
});

const trendText = computed(() => {
  if (!stats.value?.trend) return '-';
  switch (stats.value.trend) {
    case 'up': return '📈 上升';
    case 'down': return '📉 下降';
    default: return '➡️ 稳定';
  }
});

const selectMood = (mood: typeof moods[0]) => {
  selectedMood.value = mood;
};

const getMoodIcon = (moodType: string) => {
  const mood = moods.find(m => m.type === moodType);
  return mood?.icon || '😐';
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const submitMood = async () => {
  if (!selectedMood.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const res = await moodApi.recordMood({
      moodScore: moodScore.value,
      moodType: selectedMood.value.type as any,
      reason: reason.value || undefined
    });

    if (res.code === 200) {
      toast.success('心情记录成功！');
      selectedMood.value = null;
      moodScore.value = 3;
      reason.value = '';
      await loadData();
    }
  } catch (error: any) {
    toast.error(error?.message || '记录失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const [statsRes, historyRes] = await Promise.all([
      moodApi.getMoodStats(),
      moodApi.getMoodHistory()
    ]);
    if (statsRes.code === 200) {
      stats.value = statsRes.data || {};
    }
    if (historyRes.code === 200) {
      moodHistory.value = historyRes.data || [];
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>