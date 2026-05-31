<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { diaryApi } from '@/api';
import type { CreateDiaryData } from '@/api/modules/diary';
import { ArrowLeft, Save } from 'lucide-vue-next';
import PageHeader from '@/components/PageHeader.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
import MoodEmoji from '@/components/MoodEmoji.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();
const diaryId = route.params.id as string;

const moodScore = ref<number>(3);
const moodTags = ref<string[]>([]);
const triggerEvent = ref('');
const bodyFeeling = ref('');
const sleepHours = ref('');
const content = ref('');
const isPublic = ref(0);
const isSaving = ref(false);
const isLoading = ref(true);

const moodOptions = [
  { score: 1, emoji: '😢', label: '非常难过' },
  { score: 2, emoji: '😔', label: '有点低落' },
  { score: 3, emoji: '😐', label: '一般' },
  { score: 4, emoji: '😊', label: '比较开心' },
  { score: 5, emoji: '😄', label: '非常开心' }
];

const availableTags = ['焦虑', '压力', '孤独', '疲惫', '烦躁', '开心', '平静', '感恩', '期待', '失落'];

const toggleTag = (tag: string) => {
  const index = moodTags.value.indexOf(tag);
  if (index > -1) {
    moodTags.value.splice(index, 1);
  } else {
    if (moodTags.value.length < 5) {
      moodTags.value.push(tag);
    }
  }
};

onMounted(async () => {
  try {
    const res = await diaryApi.get(parseInt(diaryId));
    if (res.code === 200 && res.data) {
      const diary = res.data;
      moodScore.value = diary.moodScore || 3;
      moodTags.value = diary.moodTags || [];
      triggerEvent.value = diary.triggerEvent || '';
      bodyFeeling.value = diary.bodyFeeling || '';
      sleepHours.value = diary.sleepHours?.toString() || '';
      content.value = diary.content || '';
      isPublic.value = diary.isPublic || 0;
    }
  } catch (error: any) {
    console.error('Failed to load diary:', error);
    alert('加载日记失败');
    router.back();
  } finally {
    isLoading.value = false;
  }
});

const handleSubmit = async () => {
  if (!moodScore.value) {
    alert('请选择今天的心情');
    return;
  }
  isSaving.value = true;
  try {
    const data: CreateDiaryData = {
      moodScore: moodScore.value,
      moodTags: moodTags.value.length > 0 ? moodTags.value : undefined,
      triggerEvent: triggerEvent.value || undefined,
      bodyFeeling: bodyFeeling.value || undefined,
      sleepHours: sleepHours.value ? parseInt(sleepHours.value) : undefined,
      content: content.value || undefined,
      isPublic: isPublic.value
    };
    const res = await diaryApi.update(parseInt(diaryId), data);
    if (res.code === 200) {
      router.push(`/diary/${diaryId}`);
    }
  } catch (error: any) {
    console.error('Failed to update diary:', error);
    alert(error.message || '保存失败');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-24">
    <PageHeader title="编辑日记" :show-back="true" />

    <LoadingSpinner v-if="isLoading" message="加载日记中..." />

    <div v-else class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Mood Score -->
      <section>
        <h2 class="text-sm font-medium text-gray-500 mb-3">今天的心情</h2>
        <div class="flex justify-between">
          <button
            v-for="option in moodOptions"
            :key="option.score"
            class="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
            :class="moodScore === option.score ? 'bg-primary-50 ring-2 ring-primary-500 scale-110' : 'hover:bg-gray-50'"
            @click="moodScore = option.score"
          >
            <span class="text-3xl">{{ option.emoji }}</span>
            <span class="text-xs text-gray-500">{{ option.label }}</span>
          </button>
        </div>
      </section>

      <!-- Mood Tags -->
      <section>
        <h2 class="text-sm font-medium text-gray-500 mb-3">心情标签（最多选5个）</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in availableTags"
            :key="tag"
            class="px-4 py-2 rounded-full text-sm transition-all"
            :class="moodTags.includes(tag) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </section>

      <!-- Trigger & Body -->
      <section class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">触发事件（可选）</label>
          <input
            v-model="triggerEvent"
            type="text"
            placeholder="是什么影响了你的心情？"
            class="input-field w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">身体感受（可选）</label>
          <input
            v-model="bodyFeeling"
            type="text"
            placeholder="身体有什么感受？"
            class="input-field w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500 block mb-2">睡眠时长（小时）</label>
          <input
            v-model="sleepHours"
            type="number"
            min="0"
            max="24"
            step="1"
            placeholder="昨晚睡了多久？（整数）"
            class="input-field w-full"
          />
        </div>
      </section>

      <!-- Diary Content -->
      <section>
        <h2 class="text-sm font-medium text-gray-500 mb-3">日记内容（可选）</h2>
        <textarea
          v-model="content"
          rows="6"
          placeholder="写下你想记录的内容..."
          class="input-field w-full resize-none"
        ></textarea>
      </section>

      <!-- Public Toggle -->
      <section class="flex items-center justify-between py-3">
        <div>
          <span class="text-sm font-medium text-gray-700">公开日记</span>
          <p class="text-xs text-gray-400 mt-1">公开后其他人可以看到你的日记</p>
        </div>
        <button
          class="relative w-12 h-7 rounded-full transition-colors"
          :class="isPublic ? 'bg-primary-500' : 'bg-gray-300'"
          @click="isPublic = isPublic ? 0 : 1"
        >
          <span
            class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
            :class="isPublic ? 'translate-x-5' : ''"
          ></span>
        </button>
      </section>

      <!-- Submit -->
      <button
        class="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        :disabled="isSaving"
        @click="handleSubmit"
      >
        <Save v-if="!isSaving" class="w-5 h-5" />
        {{ isSaving ? '保存中...' : '保存修改' }}
      </button>
    </div>

    <BottomNavBar active-tab="diary" />
  </div>
</template>
