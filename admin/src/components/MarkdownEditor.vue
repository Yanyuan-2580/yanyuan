<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isPreview = ref(false);

const content = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
});

// Simple markdown-to-HTML preview
const renderedHtml = computed(() => {
  let html = content.value || '';
  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  html = html.replace(/\n/g, '<br/>');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  // Wrap in paragraph if no tags
  if (!html.startsWith('<')) {
    html = `<p class="mb-2">${html}</p>`;
  }
  return html;
});

const insertFormat = (prefix: string, suffix: string = '') => {
  const textarea = document.querySelector('.markdown-editor-textarea') as HTMLTextAreaElement;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = content.value.substring(start, end);
  const newText = content.value.substring(0, start) + prefix + selected + suffix + content.value.substring(end);
  content.value = newText;
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  }, 0);
};
</script>

<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
      <button class="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="加粗" @click="insertFormat('**', '**')"><strong>B</strong></button>
      <button class="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="斜体" @click="insertFormat('*', '*')"><em>I</em></button>
      <button class="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="标题" @click="insertFormat('## ')">H2</button>
      <button class="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="列表" @click="insertFormat('- ')">•</button>
      <div class="flex-1" />
      <button
        class="px-3 py-1 text-sm rounded transition-colors"
        :class="isPreview ? 'bg-primary-500 text-white' : 'hover:bg-gray-200'"
        @click="isPreview = !isPreview"
      >
        {{ isPreview ? '编辑' : '预览' }}
      </button>
    </div>

    <!-- Editor -->
    <div v-if="!isPreview" class="p-0">
      <textarea
        class="markdown-editor-textarea w-full min-h-[300px] p-4 text-sm border-0 focus:outline-none resize-y"
        :value="content"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        placeholder="支持 Markdown 语法编写..."
      />
    </div>

    <!-- Preview -->
    <div v-else class="p-4 min-h-[300px] prose prose-sm max-w-none" v-html="renderedHtml" />
  </div>
</template>
