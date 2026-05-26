<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-[#1E293B] mb-2">冥想疗愈</h1>
        <p class="text-[#64748B]">静下心来，找回内心的平静</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-[#4ECDC4]">{{ stats.totalSessions || 0 }}</div>
          <div class="text-sm text-[#64748B]">练习次数</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-[#F59E0B]">{{ formatDuration(stats.totalDuration) }}</div>
          <div class="text-sm text-[#64748B]">总时长</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-[#10B981]">{{ stats.completedCount || 0 }}</div>
          <div class="text-sm text-[#64748B]">完成次数</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-[#8B5CF6]">{{ stats.avgDuration || '0' }}分钟</div>
          <div class="text-sm text-[#64748B]">平均时长</div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            @click="selectedCategory = ''"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === ''
                ? 'bg-[#4ECDC4] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            ]"
          >
            全部
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === cat
                ? 'bg-[#4ECDC4] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 冥想课程列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="meditation in filteredMeditations"
          :key="meditation.id"
          @click="playMeditation(meditation)"
          class="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#45B7AA] rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              🧘
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-[#1E293B] truncate">{{ meditation.title }}</h3>
              <p class="text-sm text-[#64748B] mt-1">{{ meditation.description }}</p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-sm text-[#94A3B8]">⏱️ {{ meditation.duration }}分钟</span>
                <span class="text-sm px-2 py-1 bg-[#F1F5F9] rounded-full text-[#64748B]">{{ meditation.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放弹窗 -->
      <div
        v-if="playingMeditation"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="playingMeditation = null"
      >
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <div class="text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-[#4ECDC4] to-[#45B7AA] rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
              🧘
            </div>
            <h3 class="text-xl font-bold text-[#1E293B] mb-2">{{ playingMeditation.title }}</h3>
            <p class="text-[#64748B] mb-6">{{ playingMeditation.description }}</p>
            
            <!-- 进度条 -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-[#64748B] mb-2">
                <span>{{ formatTime(elapsedTime) }}</span>
                <span>{{ formatTime(playingMeditation.duration * 60) }}</span>
              </div>
              <div class="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#4ECDC4] to-[#45B7AA] transition-all duration-300"
                  :style="{ width: `${(elapsedTime / (playingMeditation.duration * 60)) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="flex justify-center gap-4">
              <button
                @click="togglePlay"
                class="w-14 h-14 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#45B7AA] text-white flex items-center justify-center text-2xl hover:shadow-lg transition-all duration-300"
              >
                {{ isPlaying ? '⏸️' : '▶️' }}
              </button>
            </div>

            <button
              @click="playingMeditation = null"
              class="mt-6 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { meditationApi } from '@/api/modules/meditation';

const categories = ['放松', '睡眠', '专注', '情绪调节'];
const selectedCategory = ref('');
const meditations = ref<any[]>([]);
const stats = ref<any>({});

// 播放状态
const playingMeditation = ref<any>(null);
const isPlaying = ref(false);
const elapsedTime = ref(0);
let timer: number | null = null;

const filteredMeditations = computed(() => {
  if (!selectedCategory.value) return meditations.value;
  return meditations.value.filter(m => m.category === selectedCategory.value);
});

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const playMeditation = (meditation: any) => {
  playingMeditation.value = meditation;
  isPlaying.value = true;
  elapsedTime.value = 0;
  
  timer = window.setInterval(() => {
    if (isPlaying.value && elapsedTime.value < meditation.duration * 60) {
      elapsedTime.value++;
    } else if (elapsedTime.value >= meditation.duration * 60) {
      stopPlayback();
    }
  }, 1000);
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
};

const stopPlayback = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isPlaying.value = false;
  
  if (playingMeditation.value) {
    meditationApi.recordMeditation(playingMeditation.value.id, elapsedTime.value);
  }
  
  playingMeditation.value = null;
  elapsedTime.value = 0;
};

const loadData = async () => {
  try {
    meditations.value = await meditationApi.getAllMeditations();
    stats.value = await meditationApi.getMeditationStats();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>