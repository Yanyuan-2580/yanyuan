<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80">
    <div class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-calm-300/20 to-transparent" />
    <div class="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          class="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
          @click="goBack"
        >
          <slot name="back-icon">
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </slot>
        </button>
        <h1 class="text-lg font-bold text-gray-900 tracking-tight">{{ title }}</h1>
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
