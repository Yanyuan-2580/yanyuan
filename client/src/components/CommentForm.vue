<template>
  <div class="flex gap-2.5">
    <textarea
      v-model="content"
      :placeholder="placeholder"
      rows="2"
      class="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
      maxlength="1000"
    ></textarea>
    <div class="flex flex-col gap-1.5">
      <button
        class="px-5 py-2.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white text-sm font-medium rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
        :disabled="!content.trim() || isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? '...' : '发送' }}
      </button>
      <button
        v-if="showCancel"
        class="px-4 py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        @click="$emit('cancel')"
      >取消</button>
    </div>
  </div>
  <p class="text-[11px] text-gray-400 mt-1.5 ml-1">{{ content.length }}/1000</p>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { request } from '@/api/request';

const props = withDefaults(defineProps<{
  articleId: number;
  parentId?: number;
  placeholder?: string;
  showCancel?: boolean;
}>(), {
  placeholder: '写下你的评论...',
  showCancel: false
});

const emit = defineEmits<{
  submitted: [];
  cancel: [];
}>();

const content = ref('');
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!content.value.trim() || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const res = await request.post(`/articles/${props.articleId}/comments`, {
      content: content.value.trim(),
      parentId: props.parentId || undefined
    });
    if (res.code === 200) {
      content.value = '';
      emit('submitted');
    }
  } catch (error: any) {
    console.error('Failed to submit comment:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
