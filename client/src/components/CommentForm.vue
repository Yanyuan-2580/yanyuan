<template>
  <div class="flex gap-2">
    <textarea
      v-model="content"
      :placeholder="placeholder"
      rows="2"
      class="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      maxlength="1000"
    ></textarea>
    <div class="flex flex-col gap-1">
      <button
        class="px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 disabled:opacity-50 whitespace-nowrap"
        :disabled="!content.trim() || isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? '...' : '发送' }}
      </button>
      <button
        v-if="showCancel"
        class="px-4 py-1 text-xs text-gray-400 hover:text-gray-600"
        @click="$emit('cancel')"
      >取消</button>
    </div>
  </div>
  <p class="text-xs text-gray-400 mt-1">{{ content.length }}/1000</p>
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
