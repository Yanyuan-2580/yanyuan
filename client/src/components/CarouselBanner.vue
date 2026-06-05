<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const images = [
  { src: '/images/carousel/34099430_104159709107_2.jpg', alt: '心灵港湾 - 温暖陪伴' },
  { src: '/images/carousel/38981A7197C798AF0254C3DE1C3_98D8BA06_33050.jpg', alt: '心灵港湾 - 专业支持' },
  { src: '/images/carousel/jimeng-2026-06-02-4846-心理健康公益海报，主视觉为一个人坐在开满鲜花的草地上，面向远方的平静湖泊和远山，.png', alt: '心灵港湾 - 平静与希望' },
  { src: '/images/carousel/jimeng-2026-06-02-5663-水彩插画风格心理健康海报，画面中心是一只手轻轻托着一颗发光的植物嫩芽，嫩芽从土壤.png', alt: '心灵港湾 - 成长与疗愈' },
];

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
const isTransitioning = ref(false);

const next = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % images.length;
  setTimeout(() => { isTransitioning.value = false; }, 500);
};

const prev = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
  setTimeout(() => { isTransitioning.value = false; }, 500);
};

const goTo = (index: number) => {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => { isTransitioning.value = false; }, 500);
};

const startTimer = () => {
  stopTimer();
  timer = setInterval(next, 4000);
};

const stopTimer = () => {
  if (timer) { clearInterval(timer); timer = null; }
};

onMounted(startTimer);
onUnmounted(stopTimer);
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-3xl shadow-xl group/carousel"
    @mouseenter="stopTimer"
    @mouseleave="startTimer"
  >
    <!-- Carousel track -->
    <div class="relative aspect-[4/3] md:aspect-[16/9] bg-gray-200">
      <Transition name="fade" mode="out-in">
        <img
          :key="currentIndex"
          :src="images[currentIndex].src"
          :alt="images[currentIndex].alt"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </Transition>

      <!-- Gradient overlay for readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      <!-- Caption -->
      <div class="absolute bottom-6 left-8 md:left-12 text-white pointer-events-none">
        <p class="text-lg md:text-2xl font-bold drop-shadow-lg">{{ images[currentIndex].alt }}</p>
      </div>

      <!-- Left arrow -->
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-700 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
        @click="prev"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <!-- Right arrow -->
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-700 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
        @click="next"
      >
        <ChevronRight class="w-5 h-5" />
      </button>

      <!-- Dots indicator -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button
          v-for="(img, index) in images"
          :key="index"
          class="transition-all rounded-full"
          :class="[
            index === currentIndex
              ? 'w-7 h-2.5 bg-white shadow-md'
              : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
          ]"
          @click="goTo(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
