<template>
  <view class="page">
    <view class="header">
      <text class="title">写日记</text>
    </view>

    <view class="form">
      <text class="label">今天心情怎么样？</text>
      <view class="mood-picker">
        <view v-for="m in moods" :key="m.score" class="mood-item"
          :class="{ active: moodScore === m.score }" @tap="moodScore = m.score">
          <text class="mood-emoji">{{ m.emoji }}</text>
          <text class="mood-label">{{ m.label }}</text>
        </view>
      </view>

      <text class="label">心情标签</text>
      <view class="tag-list">
        <view v-for="t in tagOptions" :key="t" class="tag"
          :class="{ active: tags.includes(t) }" @tap="toggleTag(t)">#{{ t }}</view>
      </view>

      <text class="label">日记内容</text>
      <textarea v-model="content" class="textarea" placeholder="写下今天的感受..." />

      <button class="submit-btn" :disabled="submitting" @tap="submit">
        {{ submitting ? '保存中...' : '保存日记' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const moods = [
  { score: 1, emoji: '😢', label: '难过' },
  { score: 2, emoji: '😔', label: '低落' },
  { score: 3, emoji: '😐', label: '一般' },
  { score: 4, emoji: '😊', label: '开心' },
  { score: 5, emoji: '😄', label: '很棒' }
];
const tagOptions = ['工作', '家庭', '社交', '学业', '健康', '感情', '自我成长', '其他'];
const moodScore = ref(3);
const tags = ref([]);
const content = ref('');
const submitting = ref(false);

const toggleTag = (t) => {
  const idx = tags.value.indexOf(t);
  if (idx >= 0) tags.value.splice(idx, 1);
  else tags.value.push(t);
};

const submit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const res = await api.post('/diaries', {
      moodScore: moodScore.value,
      tags: tags.value,
      content: content.value
    });
    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1000);
    }
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'error' });
  } finally { submitting.value = false; }
};
</script>

<style scoped>
.page { padding: 24rpx; }
.header { padding: 20rpx 0 16rpx; }
.title { font-size: 36rpx; font-weight: 700; color: #1e293b; }
.form { background: #fff; border-radius: 24rpx; padding: 28rpx; }
.label { font-size: 28rpx; font-weight: 500; color: #334155; margin-bottom: 16rpx; display: block; margin-top: 24rpx; }
.mood-picker { display: flex; gap: 12rpx; flex-wrap: wrap; }
.mood-item { flex: 1; min-width: 100rpx; text-align: center; padding: 16rpx 8rpx; border-radius: 16rpx; background: #f8fafc; }
.mood-item.active { background: #e8f0fe; }
.mood-emoji { font-size: 40rpx; display: block; }
.mood-label { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.tag-list { display: flex; gap: 12rpx; flex-wrap: wrap; }
.tag { padding: 8rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; background: #f1f5f9; color: #64748b; }
.tag.active { background: #6C9BD2; color: #fff; }
.textarea { width: 100%; height: 240rpx; background: #f8fafc; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; box-sizing: border-box; }
.submit-btn { margin-top: 32rpx; background: #6C9BD2; color: #fff; border-radius: 20rpx; font-size: 30rpx; border: none; padding: 20rpx 0; }
.submit-btn[disabled] { opacity: 0.5; }
</style>
