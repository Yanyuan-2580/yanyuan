<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

const props = withDefaults(defineProps<{
  data: BarData[];
  orientation?: 'vertical' | 'horizontal';
  height?: number;
  barGap?: number;
  showValues?: boolean;
  showGrid?: boolean;
  colorScheme?: 'blue' | 'green' | 'purple' | 'mixed';
  maxValue?: number;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}>(), {
  orientation: 'vertical',
  height: 240,
  barGap: 8,
  showValues: false,
  showGrid: true,
  colorScheme: 'blue',
  loading: false,
});

const schemeColors: Record<string, { start: string; end: string }> = {
  blue: { start: '#3b82f6', end: '#93c5fd' },
  green: { start: '#10b981', end: '#6ee7b7' },
  purple: { start: '#8b5cf6', end: '#c4b5fd' },
};

const emit = defineEmits<{
  (e: 'barHover', item: BarData): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const svgWidth = ref(600);
const animated = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    animated.value = true;
  });
});

watch(() => props.data, () => {
  animated.value = false;
  requestAnimationFrame(() => {
    animated.value = true;
  });
});

const chartMaxValue = computed(() => {
  if (props.maxValue !== undefined) return props.maxValue;
  const max = Math.max(...props.data.map(d => d.value), 1);
  return max * 1.15 || 1;
});

const getBarColor = (item: BarData, index: number): { gradientId: string; start: string; end: string } => {
  if (props.colorScheme === 'mixed' && item.color) {
    return { gradientId: `bar-grad-${index}`, start: item.color, end: item.color + 'cc' };
  }
  const scheme = schemeColors[props.colorScheme] || schemeColors.blue;
  return { gradientId: `bar-grad-${index}`, start: scheme.start, end: scheme.end };
};

const getBarHeight = (value: number): number => {
  return Math.max((value / chartMaxValue.value) * (props.height - 40), 2);
};

// SVG dimensions
const svgViewBox = computed(() => {
  if (props.orientation === 'horizontal') {
    return `0 0 ${svgWidth.value} ${props.height + 20}`;
  }
  return `0 0 ${svgWidth.value} ${props.height + 40}`;
});

const gridLines = computed(() => {
  if (!props.showGrid) return [];
  const lines = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = props.height - (i / steps) * (props.height - 40);
    lines.push({ y, value: Math.round((chartMaxValue.value / steps) * i) });
  }
  return lines;
});

const hoveredBar = ref<number | null>(null);

const onBarEnter = (index: number) => {
  hoveredBar.value = index;
};
const onBarLeave = () => {
  hoveredBar.value = null;
};
</script>

<template>
  <div class="w-full" ref="containerRef">
    <!-- Title -->
    <div v-if="title" class="mb-4">
      <h3 class="font-semibold text-gray-800">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-2" :style="{ height: height + 'px' }">
      <div v-for="i in 4" :key="i" class="flex items-end gap-2 h-full">
        <div
          v-for="j in data.length || 7"
          :key="j"
          class="bg-gray-100 animate-pulse rounded-t flex-1"
          :style="{ height: (30 + Math.random() * 60) + '%' }"
        ></div>
      </div>
    </div>

    <!-- SVG Chart -->
    <div v-else class="relative" :style="{ height: (height + (orientation === 'vertical' ? 40 : 20)) + 'px' }">
      <svg
        :viewBox="svgViewBox"
        preserveAspectRatio="xMidYMid meet"
        class="w-full h-full"
      >
        <defs>
          <linearGradient
            v-for="(item, idx) in data"
            :key="idx"
            :id="getBarColor(item, idx).gradientId"
            x1="0" y1="0" x2="0" y2="1"
          >
            <stop offset="0%" :stop-color="getBarColor(item, idx).start" />
            <stop offset="100%" :stop-color="getBarColor(item, idx).end" />
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        <g v-if="showGrid">
          <line
            v-for="(gl, idx) in gridLines"
            :key="idx"
            :x1="0" :y1="gl.y" :x2="svgWidth" :y2="gl.y"
            stroke="#f1f5f9" stroke-width="1"
          />
          <text
            v-for="(gl, idx) in gridLines"
            :key="'t-' + idx"
            :x="svgWidth - 4" :y="gl.y - 4"
            text-anchor="end"
            class="text-[10px] fill-gray-300"
          >{{ gl.value }}</text>
        </g>

        <!-- Bars (vertical) -->
        <g v-if="orientation === 'vertical'">
          <g
            v-for="(item, idx) in data"
            :key="idx"
            @mouseenter="onBarEnter(idx)"
            @mouseleave="onBarLeave"
          >
            <!-- Bar -->
            <rect
              :x="(svgWidth / data.length) * idx + barGap"
              :y="height - (animated ? getBarHeight(item.value) : 0)"
              :width="Math.max((svgWidth / data.length) - barGap * 2, 4)"
              :height="animated ? getBarHeight(item.value) : 0"
              :rx="3"
              :fill="`url(#${getBarColor(item, idx).gradientId})`"
              :opacity="hoveredBar === null || hoveredBar === idx ? 1 : 0.5"
              style="transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease"
            />
            <!-- Value label -->
            <text
              v-if="showValues"
              :x="(svgWidth / data.length) * idx + svgWidth / data.length / 2"
              :y="height - getBarHeight(item.value) - 6"
              text-anchor="middle"
              class="text-[11px] fill-gray-600 font-medium"
            >{{ item.value }}</text>
            <!-- X-axis label -->
            <text
              :x="(svgWidth / data.length) * idx + svgWidth / data.length / 2"
              :y="height + 16"
              text-anchor="middle"
              class="text-[11px] fill-gray-400"
            >{{ item.label }}</text>
          </g>
        </g>

        <!-- Bars (horizontal) -->
        <g v-if="orientation === 'horizontal'">
          <g
            v-for="(item, idx) in data"
            :key="idx"
            @mouseenter="onBarEnter(idx)"
            @mouseleave="onBarLeave"
          >
            <text
              :x="0" :y="(height / data.length) * idx + height / data.length / 2 + 4"
              text-anchor="start"
              class="text-[11px] fill-gray-500"
            >{{ item.label }}</text>
            <rect
              :x="60"
              :y="(height / data.length) * idx + 4"
              :width="animated ? (item.value / chartMaxValue) * (svgWidth - 80) : 0"
              :height="Math.max((height / data.length) - 8, 4)"
              :rx="3"
              :fill="`url(#${getBarColor(item, idx).gradientId})`"
              :opacity="hoveredBar === null || hoveredBar === idx ? 1 : 0.5"
              style="transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease"
            />
            <text
              v-if="showValues"
              :x="60 + (item.value / chartMaxValue) * (svgWidth - 80) + 6"
              :y="(height / data.length) * idx + height / data.length / 2 + 4"
              class="text-[11px] fill-gray-600 font-medium"
            >{{ item.value }}</text>
          </g>
        </g>
      </svg>

      <!-- Tooltip -->
      <Teleport to="body">
        <div
          v-if="hoveredBar !== null && data[hoveredBar]"
          class="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg"
          :style="{
            left: 'var(--tooltip-x)',
            top: 'var(--tooltip-y)',
            transform: 'translate(-50%, -120%)',
          }"
        >
          <div class="font-medium">{{ data[hoveredBar].label }}</div>
          <div class="text-gray-300">{{ data[hoveredBar].value }}</div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
