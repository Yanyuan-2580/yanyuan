<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { behaviorApi } from '@/api';
import type { BehaviorOverview, PageViewStat, DailyActive, EventDistribution } from '@/api/modules/behavior';
import { ElMessage } from 'element-plus';
import AdminLayout from '@/components/AdminLayout.vue';

const overview = ref<BehaviorOverview | null>(null);
const days = ref(7);

const loadData = async () => {
  try {
    const res = await behaviorApi.getOverview();
    if (res.code === 200) {
      overview.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取行为数据失败');
  }
};

const totalPageViews = () => {
  return overview.value?.pageViews?.reduce((sum, p) => sum + p.count, 0) || 0;
};

const maxPageViewCount = () => {
  return Math.max(...(overview.value?.pageViews?.map((p) => p.count) || [1]));
};

const maxDailyActive = () => {
  return Math.max(...(overview.value?.dailyActiveUsers?.map((d) => d.activeUsers) || [1]));
};

const totalEvents = () => {
  return overview.value?.eventDistribution?.reduce((sum, e) => sum + e.count, 0) || 0;
};

const pageLabelMap: Record<string, string> = {
  // 用户端页面
  '/': '首页',
  '/login': '登录页',
  '/register': '注册页',
  '/chat': 'AI对话',
  '/diary': '日记列表',
  '/diary/create': '写日记',
  '/diary/:id': '日记详情',
  '/knowledge': '知识库',
  '/knowledge/:id': '文章详情',
  '/mood': '心情记录',
  '/meditation': '冥想放松',
  '/user': '个人中心',
  '/user/settings': '用户设置',
  '/user/password': '修改密码',
  '/user/help': '帮助中心',
  '/user/about': '关于我们',
  '/notification': '通知中心',
  '/questionnaire': '问卷列表',
  '/questionnaire/:id': '问卷答题',
  '/questionnaire/result/:id': '问卷结果',
  '/video': '视频咨询',
  '/reminder': '提醒设置',
  // 用户端 API
  '/api/v1/users/login': '用户登录',
  '/api/v1/users/register': '用户注册',
  '/api/v1/users/profile': '获取个人信息',
  '/api/v1/users/refresh-token': '刷新Token',
  '/api/v1/users/logout': '退出登录',
  '/api/v1/users/password': '修改密码',
  '/api/v1/users/report': '用户报告',
  '/api/v1/users/send-code': '发送验证码',
  '/api/v1/users/code-login': '验证码登录',
  '/api/v1/users/forgot-password': '忘记密码',
  '/api/v1/users/reset-password': '重置密码',
  '/api/v1/users/wechat-login': '微信登录',
  '/api/v1/chat/sessions': 'AI会话列表',
  '/api/v1/chat/sessions/:id': 'AI会话详情',
  '/api/v1/chat/messages': 'AI消息',
  '/api/v1/chat/messages/stream': 'AI流式对话',
  '/api/v1/chat/messages/:sessionId': '获取聊天记录',
  '/api/v1/chat/stats/weekly-count': '聊天周统计',
  '/api/v1/diaries': '日记CRUD',
  '/api/v1/diaries/:id': '日记操作',
  '/api/v1/diaries/stats/:period': '日记统计',
  '/api/v1/diaries/public/list': '公开日记',
  '/api/v1/articles': '知识文章列表',
  '/api/v1/articles/:id': '文章详情',
  '/api/v1/articles/my': '我的文章',
  '/api/v1/articles/search': '文章搜索',
  '/api/v1/articles/:id/like': '文章点赞',
  '/api/v1/articles/:id/collect': '文章收藏',
  '/api/v1/articles/:articleId/comments': '文章评论',
  '/api/v1/categories': '文章分类',
  '/api/v1/mood/record': '心情记录',
  '/api/v1/mood/history': '心情历史',
  '/api/v1/mood/stats': '心情统计',
  '/api/v1/mood/weekly-report': '心情周报',
  '/api/v1/mood/daily-greeting': '每日问候',
  '/api/v1/mood/recommendations': '心情推荐',
  '/api/v1/meditation': '冥想列表',
  '/api/v1/meditation/:id': '冥想详情',
  '/api/v1/meditation/record': '冥想记录',
  '/api/v1/meditation/history': '冥想历史',
  '/api/v1/meditation/stats': '冥想统计',
  '/api/v1/meditation/admin/list': '冥想管理列表',
  '/api/v1/questionnaires': '问卷列表',
  '/api/v1/questionnaires/:id': '问卷详情',
  '/api/v1/questionnaires/:id/submit': '提交问卷',
  '/api/v1/questionnaires/results': '问卷结果',
  '/api/v1/questionnaires/admin/list': '问卷管理列表',
  '/api/v1/notifications': '通知列表',
  '/api/v1/notifications/unread-count': '未读通知数',
  '/api/v1/video/rooms': '视频房间',
  '/api/v1/reminders': '提醒设置',
  '/api/v1/health': '健康检查',
  // 归一化后的模块级路径
  '/api/v1/chat': 'AI对话',
  '/api/v1/diaries': '心情日记',
  '/api/v1/users': '用户相关',
  '/api/v1/mood': '心情记录',
  '/api/v1/video': '视频房间',
  '/api/v1/meditation': '冥想放松',
  '/api/v1/articles': '知识文章',
  '/api/v1/questionnaires': '心理测评',
  '/api/v1/notifications': '通知消息',
  // 管理端 API
  '/api/v1/admin/login': '管理端登录',
  '/api/v1/admin/register': '管理端注册',
  '/api/v1/admin/logout': '管理端退出',
  '/api/v1/admin/users': '用户管理',
  '/api/v1/admin/users/:id': '用户详情/编辑',
  '/api/v1/admin/users/:id/status': '修改用户状态',
  '/api/v1/admin/users/:id/risk-level': '修改用户风险',
  '/api/v1/admin/articles': '文章管理',
  '/api/v1/admin/articles/:id': '文章编辑',
  '/api/v1/admin/articles/:id/status': '修改文章状态',
  '/api/v1/admin/articles/:id/approve': '审核通过',
  '/api/v1/admin/articles/:id/reject': '驳回文章',
  '/api/v1/admin/articles/:id/publish': '发布文章',
  '/api/v1/admin/categories': '分类管理',
  '/api/v1/admin/chat/sessions': '会话管理(旧)',
  '/api/v1/admin/diaries': '日记管理(旧)',
  '/api/v1/admin/admins': '管理员管理',
  '/api/v1/admin/risk-records': '风险记录',
  '/api/v1/admin/risk-records-v2': '风险记录V2',
  '/api/v1/admin/risk-records-v2/stats': '风险统计',
  '/api/v1/admin/risk-records-v2/:id/resolve': '处理风险',
  '/api/v1/admin/risk-records-v2/:id/false-positive': '标记误报',
  '/api/v1/admin/audit-logs': '审计日志',
  '/api/v1/admin/export/:type': '数据导出',
  '/api/v1/admin/statistics': '统计概览',
  '/api/v1/admin/analytics/dashboard': '数据面板',
  '/api/v1/admin/analytics/overview': '数据总览',
  '/api/v1/admin/analytics/weekly-trend': '周趋势',
  '/api/v1/admin/analytics/weekly-distribution': '周分布',
  '/api/v1/admin/analytics/hourly-heatmap': '小时热力图',
  '/api/v1/admin/analytics/mood-distribution': '心情分布',
  '/api/v1/admin/behavior/overview': '行为分析总览',
  '/api/v1/admin/behavior/page-views': '页面访问统计',
  '/api/v1/admin/behavior/daily-active': '日活跃统计',
  '/api/v1/admin/behavior/event-distribution': '事件分布',
};

const getPageLabel = (page: string): string => {
  // 去掉 HTTP 方法前缀 (如 "GET:", "POST:")
  const cleanPage = page.replace(/^(GET|POST|PUT|DELETE|PATCH):/, '');
  // 精确匹配
  if (pageLabelMap[cleanPage]) return pageLabelMap[cleanPage];
  if (pageLabelMap[page]) return pageLabelMap[page];
  // 去掉路径参数 (:id, :period 等) 后匹配
  const withoutParams = cleanPage.replace(/\/:[a-zA-Z]+/g, '/:id');
  if (pageLabelMap[withoutParams]) return pageLabelMap[withoutParams];
  // 尝试匹配已知前缀
  for (const [key, label] of Object.entries(pageLabelMap)) {
    if (key.length > 8 && cleanPage.startsWith(key.replace(/\/:[a-zA-Z]+/g, ''))) {
      return label;
    }
  }
  // 降级显示简化路径
  return cleanPage.replace('/api/v1/', '').substring(0, 35) || page.substring(0, 35);
};

onMounted(() => loadData());
</script>

<template>
  <AdminLayout active-menu="behavior">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">行为分析</h2>
        <p class="text-gray-500 mt-1">用户行为日志与活跃度分析</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">统计周期：</span>
        <select
          v-model="days"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          @change="loadData"
        >
          <option :value="7">近 7 天</option>
          <option :value="14">近 14 天</option>
          <option :value="30">近 30 天</option>
        </select>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          @click="loadData"
        >
          刷新
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">总页面访问</p>
        <p class="text-3xl font-bold text-primary-600 mt-2">{{ totalPageViews() }}</p>
        <p class="text-xs text-gray-400 mt-1">近 {{ days }} 天</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">总事件数</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ totalEvents() }}</p>
        <p class="text-xs text-gray-400 mt-1">所有事件类型</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm">日均活跃用户</p>
        <p class="text-3xl font-bold text-orange-500 mt-2">
          {{ overview?.dailyActiveUsers?.length
            ? Math.round(overview!.dailyActiveUsers.reduce((s, d) => s + d.activeUsers, 0) / overview!.dailyActiveUsers.length)
            : 0 }}
        </p>
        <p class="text-xs text-gray-400 mt-1">近 {{ days }} 天均值</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Page Views -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">📄 页面访问排行</h3>
        <div v-if="overview?.pageViews?.length" class="space-y-3">
          <div v-for="pv in overview.pageViews.slice(0, 10)" :key="pv.page">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 truncate max-w-[250px]">{{ getPageLabel(pv.page) }}</span>
              <span class="text-gray-400">{{ pv.count }}</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-400 rounded-full transition-all"
                :style="{ width: (pv.count / maxPageViewCount() * 100) + '%' }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据</p>
      </div>

      <!-- Daily Active Users -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">📈 日活跃用户趋势</h3>
        <div v-if="overview?.dailyActiveUsers?.length" class="space-y-3">
          <div v-for="dau in overview.dailyActiveUsers" :key="dau.date">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">{{ dau.date }}</span>
              <span class="text-gray-400">{{ dau.activeUsers }} 人</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-400 rounded-full transition-all"
                :style="{ width: (dau.activeUsers / maxDailyActive() * 100) + '%' }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据</p>
      </div>
    </div>

    <!-- Event Distribution -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <h3 class="font-semibold text-gray-800 mb-4">📊 事件类型分布</h3>
      <div v-if="overview?.eventDistribution?.length" class="flex flex-wrap gap-4">
        <div
          v-for="event in overview.eventDistribution"
          :key="event.eventType"
          class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
        >
          <div class="w-3 h-3 rounded-full bg-primary-400" />
          <div>
            <p class="text-sm font-medium text-gray-700">{{ getPageLabel(event.eventType) }}</p>
            <p class="text-xs text-gray-500">{{ event.count }} 次</p>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-400 text-sm text-center py-8">暂无数据 — 用户使用后自动产生</p>
    </div>
  </AdminLayout>
</template>
