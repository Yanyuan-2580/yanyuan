<script setup lang="ts">import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { diaryApi } from '@/api';
import type { CreateDiaryData } from '@/api/modules/diary';
import { ArrowLeft, Save, Moon, CloudRain, Sun, Coffee, Smile } from 'lucide-vue-next';
const router = useRouter();
const moodScore = ref<number>(3);
const moodTags = ref<string[]>([]);
const triggerEvent = ref('');
const bodyFeeling = ref('');
const sleepHours = ref('');
const content = ref('');
const isPublic = ref(0);
const isSaving = ref(false);
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
 }
 else {
 if (moodTags.value.length < 5) {
 moodTags.value.push(tag);
 }
 }
};
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
 const res = await diaryApi.create(data);
 if (res.code === 200) {
 router.push('/diary');
 }
 }
 catch (error: any) {
 console.error('Failed to create diary:', error);
 alert(error.message || '保存失败');
 }
 finally {
 isSaving.value = false;
 }
};
</script>

<template>
  <div class="min-h-screen">
    <header class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
      <button 
        class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
        @click="router.back()"
      >
        <ArrowLeft class="w-5 h-5 text-gray-600" />
      </button>
      <h1 class="text-lg font-semibold text-gray-800">写日记</h1>
      <button 
        class="ml-auto btn-primary"
        :disabled="isSaving"
        @click="handleSubmit"
      >
        <Save class="w-4 h-4 inline-block mr-1" />
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </header>
    
    <main class="p-6 space-y-6">
      <section class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">今天的心情</h2>
        <div class="grid grid-cols-5 gap-4">
          <button
            v-for="option in moodOptions"
            :key="option.score"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
            :class="moodScore === option.score 
              ? 'bg-primary-50 ring-2 ring-primary-400 scale-105' 
              : 'bg-gray-50 hover:bg-gray-100'"
            @click="moodScore = option.score"
          >
            <span class="text-3xl">{{ option.emoji }}</span>
            <span class="text-xs text-gray-600">{{ option.label }}</span>
          </button>
        </div>
      </section>
      
      <section class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">情绪标签</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in availableTags"
            :key="tag"
            class="px-4 py-2 rounded-full text-sm transition-all"
            :class="moodTags.includes(tag) 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">最多选择5个标签</p>
      </section>
      
      <section class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">详细记录</h2>
        
        <div class="space-y-4">
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Coffee class="w-4 h-4" />
              触发事件
            </label>
            <textarea
              v-model="triggerEvent"
              placeholder="是什么事情让你有这样的感受？"
              rows="3"
              class="input-field"
            ></textarea>
          </div>
          
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Smile class="w-4 h-4" />
              身体感受
            </label>
            <textarea
              v-model="bodyFeeling"
              placeholder="身体有什么感觉？比如：头痛、胸闷、放松..."
              rows="3"
              class="input-field"
            ></textarea>
          </div>
          
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Moon class="w-4 h-4" />
              睡眠时长（小时）
            </label>
            <input
              v-model="sleepHours"
              type="number"
              min="0"
              max="24"
              step="1"
              placeholder="昨晚睡了几个小时（整数）"
              class="input-field"
            />
          </div>
          
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CloudRain class="w-4 h-4" />
              日记内容
            </label>
            <textarea
              v-model="content"
              placeholder="写下今天的心情故事..."
              rows="6"
              class="input-field"
            ></textarea>
          </div>
        </div>
      </section>
      
      <section class="card">
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="font-medium text-gray-800">设为公开</p>
            <p class="text-sm text-gray-500">其他用户可以看到这篇日记</p>
          </div>
          <button
            class="relative w-12 h-6 rounded-full transition-colors"
            :class="isPublic ? 'bg-primary-500' : 'bg-gray-300'"
            @click="isPublic = isPublic ? 0 : 1"
          >
            <span
              class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="isPublic ? 'translate-x-7' : 'translate-x-1'"
            ></span>
          </button>
        </label>
      </section>
    </main>
  </div>
</template>
