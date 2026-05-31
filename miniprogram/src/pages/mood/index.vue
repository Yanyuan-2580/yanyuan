<template>
  <view class="page">
    <view class="header">
      <text class="title">心情记录</text>
    </view>

    <view class="form">
      <text class="label">今天心情怎么样？</text>
      <view class="mood-grid">
        <view v-for="m in moods" :key="m.type" class="mood-cell"
          :class="{ active: selected?.type === m.type }" @tap="selected = m">
          <text class="mood-icon">{{ m.icon }}</text>
          <text class="mood-name">{{ m.label }}</text>
        </view>
      </view>

      <text class="label">心情评分: {{ score }}</text>
      <slider v-model="score" :min="1" :max="5" :step="1" activeColor="#6C9BD2" />

      <text class="label">原因（可选）</text>
      <textarea v-model="reason" class="textarea" placeholder="说说发生了什么..." />

      <button class="submit-btn" :disabled="!selected || submitting" @tap="submit">
        {{ submitting ? '记录中...' : '记录心情' }}
      </button>
    </view>

    <view class="history" v-if="history.length > 0">
      <text class="section-title">最近记录</text>
      <view v-for="r in history" :key="r.id" class="history-item">
        <text class="h-emoji">{{ getIcon(r.moodType) }}</text>
        <view class="h-info">
          <text class="h-date">{{ formatDate(r.createdAt) }}</text>
          <text v-if="r.reason" class="h-reason">{{ r.reason }}</text>
        </view>
        <text class="h-score">{{ r.moodScore }}分</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../../utils/request';

const moods = [
  { type: 'happy', label: '开心', icon: '😊' },
  { type: 'sad', label: '难过', icon: '😢' },
  { type: 'angry', label: '生气', icon: '😤' },
  { type: 'anxious', label: '焦虑', icon: '😰' },
  { type: 'calm', label: '平静', icon: '😌' }
];
const selected = ref(null);
const score = ref(3);
const reason = ref('');
const submitting = ref(false);
const history = ref([]);

const getIcon = (type) => moods.find(m => m.type === type)?.icon || '😐';
const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const submit = async () => {
  if (!selected.value || submitting.value) return;
  submitting.value = true;
  try {
    const res = await api.post('/mood/record', {
      moodType: selected.value.type,
      moodScore: score.value,
      reason: reason.value || undefined
    });
    if (res.code === 200) {
      uni.showToast({ title: '记录成功', icon: 'success' });
      selected.value = null;
      reason.value = '';
      score.value = 3;
      loadHistory();
    }
  } catch (e) { uni.showToast({ title: '记录失败', icon: 'error' }); }
  finally { submitting.value = false; }
};

const loadHistory = async () => {
  try {
    const res = await api.get('/mood/history');
    if (res.code === 200) history.value = (res.data || []).slice(0, 10);
  } catch (e) { console.error(e); }
};

import { onMounted } from 'vue';
onMounted(loadHistory);
</script>

<style scoped>
.page { padding: 24rpx; }
.header { padding: 40rpx 0 24rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; }
.form { background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 24rpx; }
.label { font-size: 28rpx; font-weight: 500; color: #334155; margin-bottom: 16rpx; display: block; margin-top: 20rpx; }
.mood-grid { display: flex; gap: 12rpx; }
.mood-cell { flex: 1; text-align: center; padding: 16rpx 8rpx; border-radius: 16rpx; background: #f8fafc; }
.mood-cell.active { background: #e8f0fe; }
.mood-icon { font-size: 40rpx; display: block; }
.mood-name { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.textarea { width: 100%; height: 140rpx; background: #f8fafc; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; box-sizing: border-box; }
.submit-btn { margin-top: 28rpx; background: #6C9BD2; color: #fff; border-radius: 20rpx; font-size: 30rpx; border: none; padding: 20rpx 0; }
.submit-btn[disabled] { opacity: 0.5; }
.section-title { font-size: 30rpx; font-weight: 600; color: #1e293b; display: block; margin-bottom: 16rpx; }
.history-item { display: flex; align-items: center; gap: 12rpx; background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 10rpx; }
.h-emoji { font-size: 36rpx; }
.h-info { flex: 1; }
.h-date { font-size: 26rpx; color: #334155; display: block; }
.h-reason { font-size: 24rpx; color: #94a3b8; margin-top: 4rpx; }
.h-score { font-size: 28rpx; font-weight: 600; color: #6C9BD2; }
</style>
