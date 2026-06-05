<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';

interface PointData {
  label: string;
  value: number;
}

const props = withDefaults(defineProps<{
  data: PointData[];
  height?: number;
  lineColor?: string;
  areaColor?: string;
  showPoints?: boolean;
  showGrid?: boolean;
  pointRadius?: number;
  lineWidth?: number;
  smooth?: boolean;
  maxValue?: number;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}>(), {
  height: 240,
  lineColor: '#3b82f6',
  areaColor: 'rgba(59, 130, 246, 0.08)',
  showPoints: true,
  showGrid: true,
  pointRadius: 4,
  lineWidth: 2.5,
  smooth: true,
  loading: false,
});

const animated = ref(false);
const hoveredPoint = ref<number | null>(null);
const svgWidth = 600;
const padding = { top: 20, right: 20, bottom: 30, left: 10 };
const chartWidth = svgWidth - padding.left - padding.right;
const chartHeight = props.height - padding.top - padding.bottom;

onMounted(() => {
  requestAnimationFrame(() => { animated.value = true; });
});

watch(() => props.data, () => {
  animated.value = false;
  requestAnimationFrame(() => { animated.value = true; });
});

const chartMaxValue = computed(() => {
  if (props.maxValue !== undefined) return props.maxValue;
  const max = Math.max(...props.data.map(d => d.value), 1);
  return max * 1.2 || 1;
});

const points = computed(() => {
  if (props.data.length < 2) return [];
  return props.data.map((d, i) => ({
    x: padding.left + (i / Math.max(props.data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - (d.value / chartMaxValue.value) * chartHeight,
    ...d,
  }));
});

const smoothPath = computed(() => {
  if (points.value.length < 2) return '';
  let d = `M ${points.value[0].x} ${points.value[0].y}`;
  for (let i = 0; i < points.value.length - 1; i++) {
    const curr = points.value[i];
    const next = points.value[i + 1];
    const cpX = (curr.x + next.x) / 2;
    d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
});

const linePath = computed(() => {
  if (points.value.length < 2) return '';
  if (props.smooth) return smoothPath.value;
  let d = `M ${points.value[0].x} ${points.value[0].y}`;
  for (let i = 1; i < points.value.length; i++) {
    d += ` L ${points.value[i].x} ${points.value[i].y}`;
  }
  return d;
});

const areaPath = computed(() => {
  if (points.value.length < 2) return '';
  const bottom = padding.top + chartHeight;
  return `${linePath.value} L ${points.value[points.value.length - 1].x} ${bottom} L ${points.value[0].x} ${bottom} Z`;
});

const gridLines = computed(() => {
  if (!props.showGrid) return [];
  const lines = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + (i / steps) * chartHeight;
    lines.push({ y, value: Math.round((chartMaxValue.value / steps) * (steps - i)) });
  }
  return lines;
});

const dashLength = computed(() => {
  let len = 0;
  for (let i = 0; i < points.value.length - 1; i++) {
    const dx = points.value[i + 1].x - points.value[i].x;
    const dy = points.value[i + 1].y - points.value[i].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
});
</script>

<template>
  <div class="w-full">
    <div v-if="title" class="mb-4">
      <h3 class="font-semibold text-gray-800">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" :style="{ height: height + 'px' }" class="bg-gray-50 animate-pulse rounded-xl" />

    <!-- Chart -->
    <div v-else class="relative" :style="{ height: height + 'px' }">
      <svg
        :viewBox="`0 0 ${svgWidth} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        class="w-full h-full"
      >
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="lineColor" stop-opacity="0.3" />
            <stop offset="100%" :stop-color="lineColor" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Grid -->
        <g v-if="showGrid">
          <line
            v-for="(gl, idx) in gridLines"
            :key="idx"
            :x1="padding.left" :y1="gl.y"
            :x2="svgWidth - padding.right" :y2="gl.y"
            stroke="#f1f5f9" stroke-width="1"
          />
          <text
            v-for="(gl, idx) in gridLines"
            :key="'t-' + idx"
            :x="svgWidth - padding.right + 4" :y="gl.y + 4"
            class="text-[10px] fill-gray-300"
          >{{ gl.value }}</text>
        </g>

        <!-- Area fill -->
        <path
          v-if="animated && areaPath"
          :d="areaPath"
          fill="url(#area-grad)"
        />

        <!-- Line -->
        <path
          v-if="linePath"
          :d="animated ? linePath : ''"
          fill="none"
          :stroke="lineColor"
          :stroke-width="lineWidth"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{
            strokeDasharray: dashLength,
            strokeDashoffset: animated ? 0 : dashLength,
            transition: `stroke-dashoffset 1.2s ease`,
          }"
        />

        <!-- Points -->
        <g v-if="showPoints && points.length">
          <circle
            v-for="(p, idx) in points"
            :key="idx"
            :cx="p.x" :cy="p.y"
            :r="hoveredPoint === idx ? pointRadius + 3 : pointRadius"
            :fill="hoveredPoint === idx ? lineColor : '#fff'"
            :stroke="lineColor"
            :stroke-width="2"
            :opacity="hoveredPoint === null || hoveredPoint === idx ? 1 : 0.4"
            style="transition: r 0.2s ease, opacity 0.2s ease; cursor: pointer"
            @mouseenter="hoveredPoint = idx"
            @mouseleave="hoveredPoint = null"
          />
          <circle
            v-for="(p, idx) in points"
            :key="'hit-' + idx"
            :cx="p.x" :cy="p.y"
            :r="12"
            fill="transparent"
            style="cursor: pointer"
            @mouseenter="hoveredPoint = idx"
            @mouseleave="hoveredPoint = null"
          />
        </g>

        <!-- X-axis labels -->
        <g v-if="data.length > 0">
          <text
            v-for="(p, idx) in points"
            :key="'xl-' + idx"
            :x="p.x"
            :y="height - 4"
            text-anchor="middle"
            class="text-[10px] fill-gray-400"
          >{{ p.label }}</text>
        </g>
      </svg>

      <!-- Tooltip -->
      <Teleport to="body">
        <div
          v-if="hoveredPoint !== null && points[hoveredPoint]"
          class="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg"
          :style="{
            left: 'var(--tooltip-x)',
            top: 'var(--tooltip-y)',
            transform: 'translate(-50%, -130%)',
          }"
        >
          <div class="text-gray-400 text-[10px]">{{ points[hoveredPoint].label }}</div>
          <div class="font-medium">{{ points[hoveredPoint].value }}</div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
