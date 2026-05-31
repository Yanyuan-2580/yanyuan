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
  <div class="min-h-screen pb-24 bg-gray-50">
    <PageHeader title="发布文章" :show-back="true" />

    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-700 mb-2 block">标题</label>
        <input
          v-model="title"
          type="text"
          placeholder="输入文章标题..."
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 mb-2 block">分类</label>
        <select
          v-model="categoryId"
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 mb-2 block">标签（用逗号分隔）</label>
        <input
          v-model="tags"
          type="text"
          placeholder="如：焦虑, 放松, 冥想"
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 mb-2 block">内容</label>
        <textarea
          v-model="content"
          rows="12"
          placeholder="写下你想分享的内容..."
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <button
        @click="submit"
        :disabled="submitting"
        class="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
      >
        {{ submitting ? '提交中...' : '提交审核' }}
      </button>

      <p class="text-xs text-gray-400 text-center">
        提交后需要管理员审核通过才会公开展示
      </p>
    </div>
  </div>
</template>
