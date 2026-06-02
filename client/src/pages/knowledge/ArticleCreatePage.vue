<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '@/api/request';
import PageHeader from '@/components/PageHeader.vue';
import { Save, ArrowLeft } from 'lucide-vue-next';
import { getToast } from '@/composables/useToast';

const router = useRouter();
const toast = getToast();

const title = ref('');
const content = ref('');
const categoryId = ref<number>(1);
const tags = ref('');
const submitting = ref(false);

const categories = [
  { id: 1, name: '情绪管理' },
  { id: 2, name: '人际关系' },
  { id: 3, name: '自我成长' },
  { id: 4, name: '睡眠改善' },
  { id: 5, name: '压力应对' },
];

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    toast.warning('请填写标题和内容');
    return;
  }
  submitting.value = true;
  try {
    const res: any = await post('/articles', {
      title: title.value.trim(),
      content: content.value.trim(),
      categoryId: categoryId.value,
      tags: tags.value ? tags.value.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    if (res?.code === 200) {
      toast.success('文章已提交，等待管理员审核');
      setTimeout(() => router.push('/knowledge'), 1000);
    }
  } catch (e: any) {
    toast.error(e?.message || '提交失败');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30">
    <!-- Decorative blobs -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-calm-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
    <div class="absolute top-20 left-0 w-48 h-48 bg-soft-200/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />

    <PageHeader title="发布文章" :show-back="true" />

    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div class="card">
        <label class="text-sm font-medium text-gray-700 mb-2 block">标题</label>
        <input
          v-model="title"
          type="text"
          placeholder="输入文章标题..."
          class="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
        />
      </div>

      <div class="card">
        <label class="text-sm font-medium text-gray-700 mb-2 block">分类</label>
        <select
          v-model="categoryId"
          class="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
        >
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="card">
        <label class="text-sm font-medium text-gray-700 mb-2 block">标签（用逗号分隔）</label>
        <input
          v-model="tags"
          type="text"
          placeholder="如：焦虑, 放松, 冥想"
          class="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200"
        />
      </div>

      <div class="card">
        <label class="text-sm font-medium text-gray-700 mb-2 block">内容</label>
        <textarea
          v-model="content"
          rows="12"
          placeholder="写下你想分享的内容..."
          class="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-calm-200/50 focus:border-calm-300 transition-all duration-200 resize-none"
        ></textarea>
      </div>

      <button
        @click="submit"
        :disabled="submitting"
        class="w-full py-3.5 bg-gradient-to-r from-calm-500 to-emerald-500 text-white rounded-2xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {{ submitting ? '提交中...' : '提交审核' }}
      </button>

      <p class="text-xs text-gray-400 text-center">
        提交后需要管理员审核通过才会公开展示
      </p>
    </div>
  </div>
</template>
