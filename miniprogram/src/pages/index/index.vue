<template>
  <view class="page">
    <view class="header">
      <text class="greeting">{{ greeting }}</text>
      <text class="subtitle">我在这里，随时倾听你 💙</text>
    </view>

    <!-- Quick Mood Check-in -->
    <view class="mood-check card">
      <text class="mood-title">今天心情怎么样？</text>
      <view class="mood-options">
        <view
          v-for="m in moods"
          :key="m.type"
          class="mood-item"
          :class="{ active: selectedMood === m.type }"
          @tap="quickRecordMood(m.type)"
        >
          <text class="mood-emoji">{{ m.emoji }}</text>
          <text class="mood-label">{{ m.label }}</text>
        </view>
      </view>
      <text v-if="moodMsg" class="mood-msg">{{ moodMsg }}</text>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view
        v-for="action in actions"
        :key="action.label"
        class="action-card"
        @tap="navigateTo(action.path)"
      >
        <text class="action-emoji">{{ action.emoji }}</text>
        <text class="action-label">{{ action.label }}</text>
      </view>
    </view>

    <!-- Recommended Articles -->
    <view class="section">
      <text class="section-title">📖 推荐阅读</text>
      <view
        v-for="article in articles"
        :key="article.id"
        class="article-item card"
        @tap="viewArticle(article.id)"
      >
        <text class="article-title">{{ article.title }}</text>
        <text class="article-desc">{{ article.summary || article.description?.substring(0, 60) || '点击阅读详情' }}</text>
        <view class="article-meta">
          <text class="article-views">{{ article.viewCount || 0 }} 次阅读</text>
        </view>
      </view>
      <view v-if="!articles.length" class="empty-hint">
        <text>暂无推荐文章</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../utils/request';

const greeting = ref('你好 👋');
const selectedMood = ref('');
const moodMsg = ref('');
const articles = ref([]);

const moods = [
  { type: 'happy', emoji: '😊', label: '开心' },
  { type: 'calm', emoji: '😌', label: '平静' },
  { type: 'anxious', emoji: '😰', label: '焦虑' },
  { type: 'sad', emoji: '😢', label: '难过' },
  { type: 'angry', emoji: '😤', label: '生气' },
];

const actions = [
  { label: 'AI咨询', emoji: '💬', path: '/pages/chat/index' },
  { label: '写日记', emoji: '📔', path: '/pages/diary/create' },
  { label: '心情记录', emoji: '💭', path: '/pages/mood/index' },
  { label: '知识库', emoji: '📚', path: '/pages/knowledge/index' },
];

// 个性化问候
const loadGreeting = async () => {
  try {
    const user = uni.getStorageSync('user');
    const nickname = user?.nickname || '';
    const res = await api.get('/mood/daily-greeting', { nickname });
    if (res.code === 200) {
      greeting.value = res.data.greeting;
    }
  } catch {
    const hour = new Date().getHours();
    if (hour < 12) greeting.value = '早上好 ☀️';
    else if (hour < 18) greeting.value = '下午好 🌤️';
    else greeting.value = '晚上好 🌙';
  }
};

// 快速心情记录
const quickRecordMood = async (type: string) => {
  selectedMood.value = type;
  try {
    const moodMap = { happy: 5, calm: 4, anxious: 2, sad: 1, angry: 2 };
    const res = await api.post('/mood/record', {
      moodType: type,
      moodScore: moodMap[type] || 3,
      reason: '',
    });
    if (res.code === 200) {
      moodMsg.value = '已记录！今天也要好好照顾自己哦~';
      setTimeout(() => { moodMsg.value = ''; }, 3000);
    }
  } catch {
    moodMsg.value = '记录失败，请稍后再试';
    setTimeout(() => { moodMsg.value = ''; }, 3000);
  }
};

const loadArticles = async () => {
  try {
    const res = await api.get('/articles', { page: 1, pageSize: 5 });
    if (res.code === 200) articles.value = res.data.list || [];
  } catch { /* ignore */ }
};

const navigateTo = (path: string) => uni.navigateTo({ url: path });
const viewArticle = (id: number) => uni.navigateTo({ url: `/pages/knowledge/detail?id=${id}` });

onMounted(() => {
  loadGreeting();
  loadArticles();
});
</script>

<style scoped>
.page { padding: 24rpx; padding-bottom: 80rpx; }
.header { padding: 40rpx 0 24rpx; }
.greeting { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; }
.subtitle { font-size: 26rpx; color: #94a3b8; margin-top: 6rpx; display: block; }

.mood-check { margin-bottom: 32rpx; padding: 24rpx; }
.mood-title { font-size: 28rpx; font-weight: 600; color: #475569; display: block; margin-bottom: 16rpx; }
.mood-options { display: flex; gap: 12rpx; flex-wrap: wrap; }
.mood-item { display: flex; flex-direction: column; align-items: center; padding: 16rpx 20rpx; border-radius: 20rpx; background: #f8fafc; transition: all 0.2s; }
.mood-item.active { background: #ecfdf5; transform: scale(1.05); }
.mood-emoji { font-size: 40rpx; }
.mood-label { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.mood-msg { font-size: 24rpx; color: #10b981; margin-top: 12rpx; display: block; }

.quick-actions { display: flex; gap: 16rpx; flex-wrap: wrap; margin-bottom: 36rpx; }
.action-card { flex: 1; min-width: 150rpx; background: #fff; border-radius: 24rpx; padding: 28rpx 20rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.action-emoji { font-size: 48rpx; display: block; margin-bottom: 8rpx; }
.action-label { font-size: 24rpx; color: #64748b; }

.section { margin-bottom: 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #1e293b; margin-bottom: 14rpx; display: block; }

.card { background: #fff; border-radius: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.article-item { padding: 22rpx; margin-bottom: 12rpx; }
.article-title { font-size: 28rpx; color: #334155; font-weight: 500; display: block; }
.article-desc { font-size: 24rpx; color: #94a3b8; margin-top: 4rpx; display: block; }
.article-meta { margin-top: 8rpx; }
.article-views { font-size: 22rpx; color: #cbd5e1; }
.empty-hint { text-align: center; padding: 40rpx 0; color: #94a3b8; font-size: 24rpx; }
</style>
