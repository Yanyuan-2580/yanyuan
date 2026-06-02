<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30 py-8 px-4 animate-page-enter">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="relative text-center mb-8 pt-6">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-calm-200/30 to-emerald-100/20 rounded-full blur-3xl pointer-events-none" />
        <h1 class="relative text-3xl font-bold text-gray-800 mb-2">冥想疗愈</h1>
        <p class="relative text-gray-500">静下心来，找回内心的平静</p>
      </div>

      <!-- 加载骨架 -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-card p-4 text-center animate-pulse">
            <div class="h-8 w-16 bg-gray-200 rounded mx-auto mb-1" />
            <div class="h-4 w-12 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-card p-4 mb-6 animate-pulse">
          <div class="flex gap-2">
            <div v-for="i in 5" :key="i" class="h-9 w-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-card p-6 animate-pulse">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-5 w-24 bg-gray-200 rounded" />
                <div class="h-4 w-full bg-gray-200 rounded" />
                <div class="flex gap-3">
                  <div class="h-4 w-16 bg-gray-200 rounded" />
                  <div class="h-5 w-12 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-calm-600">{{ stats.totalSessions || 0 }}</div>
          <div class="text-sm text-gray-500">练习次数</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-calm-600">{{ formatDuration(stats.totalDuration) }}</div>
          <div class="text-sm text-gray-500">总时长</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-emerald-500">{{ stats.completedCount || 0 }}</div>
          <div class="text-sm text-gray-500">完成次数</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-violet-500">{{ stats.avgDuration || '0' }}分钟</div>
          <div class="text-sm text-gray-500">平均时长</div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            @click="selectedCategory = ''"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === ''
                ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600'
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
                ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 冥想课程列表 -->
      <div v-if="filteredMeditations.length === 0" class="text-center py-16">
        <span class="text-5xl block mb-4">🧘</span>
        <p class="text-gray-500">该分类暂无冥想课程</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="meditation in filteredMeditations"
          :key="meditation.id"
          @click="playMeditation(meditation)"
          class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 cursor-pointer hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-calm-400 to-calm-500 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              🧘
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 truncate">{{ meditation.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ meditation.description }}</p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-sm text-gray-400">⏱️ {{ meditation.duration }}分钟</span>
                <span class="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-500">{{ meditation.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      </template>

      <!-- 播放弹窗 -->
      <div
        v-if="playingMeditation"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="playingMeditation = null"
      >
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 max-w-md w-full">
          <div class="text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-calm-400 to-calm-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
              🧘
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ playingMeditation.title }}</h3>
            <p class="text-gray-500 mb-6">{{ playingMeditation.description }}</p>
            
            <!-- 进度条 -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-500 mb-2">
                <span>{{ formatTime(elapsedTime) }}</span>
                <span>{{ formatTime(playingMeditation.duration * 60) }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-calm-500 to-emerald-500 transition-all duration-300"
                  :style="{ width: `${(elapsedTime / (playingMeditation.duration * 60)) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="flex justify-center gap-4">
              <button
                @click="togglePlay"
                class="w-14 h-14 rounded-full bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md flex items-center justify-center text-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {{ isPlaying ? '⏸️' : '▶️' }}
              </button>
            </div>

            <button
              @click="exitMeditation"
              class="mt-6 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
    <BottomNavBar active-tab="user" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { meditationApi } from '@/api/modules/meditation';
import BottomNavBar from '@/components/BottomNavBar.vue';

const categories = ['放松', '睡眠', '专注', '情绪调节'];
const selectedCategory = ref('');
const meditations = ref<any[]>([]);
const stats = ref<any>({});
const isLoading = ref(true);

// 播放状态
const playingMeditation = ref<any>(null);
const isPlaying = ref(false);
const elapsedTime = ref(0);
let timer: number | null = null;

const filteredMeditations = computed(() => {
  if (!selectedCategory.value) return meditations.value;
  return meditations.value.filter(m => m.category === selectedCategory.value);
});

// 服务端存储的 duration 单位是分钟
const formatDuration = (totalMinutes: number) => {
  if (!totalMinutes || totalMinutes <= 0) return '0分钟';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// elapsedTime 单位是秒，用于播放进度显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const playMeditation = (meditation: any) => {
  // Clear existing timer
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
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

  if (playingMeditation.value && elapsedTime.value > 0) {
    // Convert seconds to minutes for the API
    const durationMinutes = Math.round(elapsedTime.value / 60);
    meditationApi.recordMeditation(playingMeditation.value.id, durationMinutes);
  }

  playingMeditation.value = null;
  elapsedTime.value = 0;
};

const exitMeditation = () => {
  stopPlayback();
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const [medRes, statsRes] = await Promise.all([
      meditationApi.getAllMeditations(),
      meditationApi.getMeditationStats()
    ]);
    if (medRes.code === 200) {
      meditations.value = medRes.data || [];
    }
    if (statsRes.code === 200) {
      stats.value = statsRes.data || {};
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

onUnmounted(() => {
  stopPlayback();
});
</script>