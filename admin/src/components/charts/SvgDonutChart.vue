<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface Segment {
  label: string;
  value: number;
  color: string;
}

const props = withDefaults(defineProps<{
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  centerSubLabel?: string;
  showLegend?: boolean;
  loading?: boolean;
}>(), {
  size: 200,
  thickness: 32,
  showLegend: true,
  loading: false,
});

const animated = ref(false);
const hoveredSegment = ref<number | null>(null);

onMounted(() => {
  requestAnimationFrame(() => { animated.value = true; });
});

const total = computed(() => props.segments.reduce((sum, s) => sum + s.value, 0) || 1);

const radius = computed(() => (props.size - props.thickness) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const segmentPaths = computed(() => {
  let accumulatedAngle = -Math.PI / 2; // Start from top
  return props.segments.map((s, i) => {
    const ratio = s.value / total.value;
    const angle = ratio * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const x1 = props.size / 2 + radius.value * Math.cos(startAngle);
    const y1 = props.size / 2 + radius.value * Math.sin(startAngle);
    const x2 = props.size / 2 + radius.value * Math.cos(endAngle);
    const y2 = props.size / 2 + radius.value * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArc} 1 ${x2} ${y2}`;

    const dashLen = circumference.value * ratio;
    const dashOffset = circumference.value * (1 - ratio * i - ratio); // simplified

    return { d, dashLen, ratio, color: s.color, label: s.label, value: s.value, index: i };
  });
});

// Calculate stroke-dasharray offsets for circle-based approach
const circleSegments = computed(() => {
  let offset = 0;
  const halfCirc = circumference.value / 2;
  return props.segments.map((s, i) => {
    const ratio = s.value / total.value;
    const dashArray = `${(circumference.value * ratio)} ${circumference.value * (1 - ratio)}`;
    const result = {
      dashArray,
      dashOffset: animated.value ? -(offset * circumference.value) : -circumference.value,
      color: s.color,
      label: s.label,
      value: s.value,
      ratio,
      index: i,
    };
    offset += ratio;
    return result;
  });
});
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Loading -->
    <div v-if="loading" class="relative">
      <div
        class="rounded-full bg-gray-100 animate-pulse"
        :style="{ width: size + 'px', height: size + 'px' }"
      />
    </div>

    <!-- Chart -->
    <div v-else class="flex items-start gap-6">
      <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
        <svg
          :viewBox="`0 0 ${size} ${size}`"
          class="w-full h-full transform -rotate-90"
        >
          <!-- Background ring -->
          <circle
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            fill="none"
            stroke="#f1f5f9"
            :stroke-width="thickness"
          />

          <!-- Segments -->
          <circle
            v-for="(seg, idx) in circleSegments"
            :key="idx"
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            fill="none"
            :stroke="seg.color"
            :stroke-width="hoveredSegment === idx ? thickness + 4 : thickness"
            :stroke-dasharray="seg.dashArray"
            :stroke-dashoffset="seg.dashOffset"
            stroke-linecap="butt"
            :opacity="hoveredSegment === null || hoveredSegment === idx ? 1 : 0.6"
            style="transition: stroke-dashoffset 1s ease, stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer"
            @mouseenter="hoveredSegment = idx"
            @mouseleave="hoveredSegment = null"
          />
        </svg>

        <!-- Center text (positioned over SVG) -->
        <div class="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
          <span v-if="centerValue !== undefined" class="text-2xl font-bold text-gray-800">
            {{ centerValue }}
          </span>
          <span v-if="centerLabel" class="text-xs text-gray-500 mt-0.5">{{ centerLabel }}</span>
          <span v-if="centerSubLabel" class="text-[10px] text-gray-400">{{ centerSubLabel }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div v-if="showLegend" class="flex flex-col gap-2 py-2">
        <div
          v-for="(seg, idx) in segments"
          :key="idx"
          class="flex items-center gap-2 text-sm cursor-pointer"
          :class="hoveredSegment === null || hoveredSegment === idx ? 'opacity-100' : 'opacity-50'"
          @mouseenter="hoveredSegment = idx"
          @mouseleave="hoveredSegment = null"
        >
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: seg.color }"
          />
          <span class="text-gray-600">{{ seg.label }}</span>
          <span class="text-gray-800 font-medium ml-auto">{{ seg.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
