<script setup lang="ts">
import SvgBarChart from './SvgBarChart.vue';
import { computed } from 'vue';

interface Dataset {
  label: string;
  color: string;
  data: number[];
}

const props = withDefaults(defineProps<{
  labels: string[];
  datasets: Dataset[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}>(), {
  loading: false,
});

const barData = computed(() => {
  if (!props.labels.length || !props.datasets.length) return [];
  const result: Array<{ label: string; value: number; color?: string }> = [];
  for (const label of props.labels) {
    for (const ds of props.datasets) {
      const idx = props.labels.indexOf(label);
      result.push({
        label: ds.label,
        value: ds.data[idx] ?? 0,
        color: ds.color,
      });
    }
  }
  return result;
});

const maxVal = computed(() => {
  let max = 0;
  for (const ds of props.datasets) {
    for (const v of ds.data) {
      if (v > max) max = v;
    }
  }
  return max;
});
</script>

<template>
  <div class="w-full">
    <div v-if="title" class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-800">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <!-- Legend -->
      <div v-if="datasets.length" class="flex items-center gap-4">
        <div
          v-for="ds in datasets"
          :key="ds.label"
          class="flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: ds.color }" />
          {{ ds.label }}
        </div>
      </div>
    </div>

    <SvgBarChart
      v-if="!loading"
      :data="labels.flatMap((label, i) => datasets.map(ds => ({
        label,
        value: ds.data[i] ?? 0,
        color: ds.color,
      })))"
      :maxValue="maxVal * 1.15 || 1"
      colorScheme="mixed"
      orientation="vertical"
      :height="260"
      :barGap="4"
      :showGrid="true"
      :loading="false"
    />

    <!-- Loading -->
    <div v-else :style="{ height: '280px' }" class="bg-gray-50 animate-pulse rounded-xl" />
  </div>
</template>
