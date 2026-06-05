<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const props = withDefaults(defineProps<{
  data: number[][];
  days: string[];
  hours: string[];
  maxValue: number;
  cellSize?: number;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}>(), {
  cellSize: 28,
  loading: false,
});

const animated = ref(false);
const hoveredCell = ref<{ day: number; hour: number } | null>(null);

onMounted(() => {
  requestAnimationFrame(() => { animated.value = true; });
});

const padding = { top: 20, left: 36, right: 16, bottom: 10 };
const legendHeight = 30;
const totalWidth = computed(() => padding.left + 24 * props.cellSize + padding.right + 60);
const totalHeight = computed(() => padding.top + 7 * props.cellSize + legendHeight + padding.bottom);

const getHeatColor = (ratio: number): string => {
  if (ratio === 0) return '#f8fafc';
  // Cold blue #eff6ff → #3b82f6 → Hot violet #4c1d95
  const r = Math.round(239 + ratio * (76 - 239));    // ef → 4c
  const g = Math.round(246 + ratio * (29 - 246));     // f6 → 1d
  const b = Math.round(255 + ratio * (149 - 255));    // ff → 95
  return `rgb(${r},${g},${b})`;
};

const cellOpacity = computed(() => {
  const cells: Array<{ day: number; hour: number; ratio: number; color: string; value: number }> = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const value = props.data[d]?.[h] || 0;
      const ratio = props.maxValue > 0 ? value / props.maxValue : 0;
      cells.push({
        day: d,
        hour: h,
        ratio: animated.value ? 1 : 0,
        color: getHeatColor(ratio),
        value,
      });
    }
  }
  return cells;
});

const displayedHourLabels = computed(() => {
  return props.hours.filter((_, i) => i % 3 === 0);
});

const legendStops = computed(() => {
  const stops = [];
  for (let i = 0; i <= 10; i++) {
    stops.push({ ratio: i / 10, color: getHeatColor(i / 10) });
  }
  return stops;
});
</script>

<template>
  <div class="w-full">
    <div v-if="title" class="mb-4">
      <h3 class="font-semibold text-gray-800">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" :style="{ height: totalHeight + 20 + 'px' }" class="bg-gray-50 animate-pulse rounded-xl" />

    <!-- Heatmap -->
    <div v-else class="overflow-x-auto">
      <svg
        :viewBox="`0 0 ${totalWidth} ${totalHeight}`"
        :width="totalWidth"
        :height="totalHeight"
        class="block"
        style="max-width: 100%"
      >
        <!-- Day labels (Y-axis) -->
        <text
          v-for="(day, idx) in days"
          :key="'d-' + idx"
          :x="padding.left - 4"
          :y="padding.top + idx * cellSize + cellSize / 2 + 4"
          text-anchor="end"
          class="text-[10px] fill-gray-500"
        >{{ day }}</text>

        <!-- Hour labels (X-axis, every 3 hours) -->
        <text
          v-for="(h, idx) in displayedHourLabels"
          :key="'h-' + idx"
          :x="padding.left + idx * 3 * cellSize + cellSize / 2"
          :y="padding.top - 6"
          text-anchor="middle"
          class="text-[9px] fill-gray-400"
        >{{ h }}</text>

        <!-- Cells -->
        <g v-for="cell in cellOpacity" :key="`${cell.day}-${cell.hour}`">
          <rect
            :x="padding.left + cell.hour * cellSize + 1"
            :y="padding.top + cell.day * cellSize + 1"
            :width="cellSize - 2"
            :height="cellSize - 2"
            :rx="2"
            :fill="cell.color"
            :opacity="cell.ratio"
            style="transition: opacity 0.6s ease; cursor: pointer"
            @mouseenter="hoveredCell = { day: cell.day, hour: cell.hour }"
            @mouseleave="hoveredCell = null"
          />
          <!-- Highlight border -->
          <rect
            v-if="hoveredCell && hoveredCell.day === cell.day && hoveredCell.hour === cell.hour"
            :x="padding.left + cell.hour * cellSize + 1"
            :y="padding.top + cell.day * cellSize + 1"
            :width="cellSize - 2"
            :height="cellSize - 2"
            :rx="2"
            fill="none"
            stroke="#1e293b"
            stroke-width="2"
          />
        </g>

        <!-- Legend -->
        <g transform="translate(0, 0)">
          <text
            :x="padding.left"
            :y="padding.top + 7 * cellSize + 22"
            class="text-[9px] fill-gray-400"
          >低</text>
          <rect
            v-for="(stop, idx) in legendStops"
            :key="'leg-' + idx"
            :x="padding.left + 20 + idx * 14"
            :y="padding.top + 7 * cellSize + 12"
            :width="14"
            :height="14"
            :fill="stop.color"
          />
          <text
            :x="padding.left + 20 + 11 * 14"
            :y="padding.top + 7 * cellSize + 22"
            class="text-[9px] fill-gray-400"
          >高</text>
        </g>
      </svg>

      <!-- Tooltip -->
      <Teleport to="body">
        <div
          v-if="hoveredCell && data[hoveredCell.day]?.[hoveredCell.hour] !== undefined"
          class="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg"
          :style="{
            left: 'var(--tooltip-x)',
            top: 'var(--tooltip-y)',
            transform: 'translate(-50%, -120%)',
          }"
        >
          <div class="text-gray-400 text-[10px]">
            {{ days[hoveredCell.day] }} {{ hours[hoveredCell.hour] }}
          </div>
          <div class="font-medium">
            {{ data[hoveredCell.day][hoveredCell.hour] }} 次活动
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
