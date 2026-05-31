<template>
  <header class="sticky top-0 bg-white z-40 border-b border-gray-100">
    <div class="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          class="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          @click="goBack"
        >
          <slot name="back-icon">
            <ArrowLeft class="w-5 h-5" />
          </slot>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
      </div>
      <div class="flex items-center gap-2">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<{
  title: string;
  showBack?: boolean;
}>(), {
  showBack: false
});

const router = useRouter();

function goBack() {
  router.back();
}
</script>
