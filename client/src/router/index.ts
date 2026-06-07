import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/home/HomePage.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/pages/chat/ChatPage.vue')
    },
    {
      path: '/chat/:sessionId',
      name: 'ChatSession',
      component: () => import('@/pages/chat/ChatPage.vue')
    },
    {
      path: '/diary',
      name: 'Diary',
      component: () => import('@/pages/diary/DiaryPage.vue')
    },
    {
      path: '/diary/new',
      name: 'DiaryCreate',
      component: () => import('@/pages/diary/DiaryCreatePage.vue')
    },
    {
      path: '/diary/:id/edit',
      name: 'DiaryEdit',
      component: () => import('@/pages/diary/DiaryEditPage.vue')
    },
    {
      path: '/diary/:id',
      name: 'DiaryDetail',
      component: () => import('@/pages/diary/DiaryDetailPage.vue')
    },
    {
      path: '/knowledge',
      name: 'Knowledge',
      component: () => import('@/pages/knowledge/KnowledgePage.vue')
    },
    {
      path: '/knowledge/new',
      name: 'ArticleCreate',
      component: () => import('@/pages/knowledge/ArticleCreatePage.vue')
    },
    {
      path: '/knowledge/:id',
      name: 'ArticleDetail',
      component: () => import('@/pages/knowledge/ArticleDetailPage.vue')
    },
    {
      path: '/mood',
      name: 'Mood',
      component: () => import('@/pages/mood/MoodPage.vue')
    },
    {
      path: '/meditation',
      name: 'Meditation',
      component: () => import('@/pages/meditation/MeditationPage.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('@/pages/user/UserPage.vue')
    },
    {
      path: '/user/settings',
      name: 'UserSettings',
      component: () => import('@/pages/user/UserSettingsPage.vue')
    },
    {
      path: '/user/change-password',
      name: 'ChangePassword',
      component: () => import('@/pages/user/ChangePasswordPage.vue')
    },
    {
      path: '/user/hotline',
      name: 'Hotline',
      component: () => import('@/pages/user/HotlinePage.vue')
    },
    {
      path: '/user/help',
      name: 'UserHelp',
      component: () => import('@/pages/user/UserHelpPage.vue')
    },
    {
      path: '/user/about',
      name: 'About',
      component: () => import('@/pages/user/AboutPage.vue')
    },
    {
      path: '/user/notifications',
      name: 'Notifications',
      component: () => import('@/pages/user/NotificationPage.vue')
    },
    {
      path: '/user/reminders',
      name: 'Reminders',
      component: () => import('@/pages/user/ReminderPage.vue')
    },
    {
      path: '/questionnaire',
      name: 'QuestionnaireList',
      component: () => import('@/pages/questionnaire/QuestionnaireListPage.vue')
    },
    {
      path: '/questionnaire/:id',
      name: 'Questionnaire',
      component: () => import('@/pages/questionnaire/QuestionnairePage.vue')
    },
    {
      path: '/questionnaire/:id/result',
      name: 'QuestionnaireResult',
      component: () => import('@/pages/questionnaire/QuestionnaireResultPage.vue')
    },
    {
      path: '/video/:roomId?',
      name: 'VideoCall',
      component: () => import('@/pages/video/VideoCallPage.vue')
    },
    {
      path: '/nav',
      name: 'Nav',
      component: () => import('@/pages/NavPage.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/auth/AuthPage.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/auth/AuthPage.vue')
    },
    {
      path: '/community',
      name: 'Community',
      component: () => import('@/pages/community/CommunityPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('accessToken');

  // Public routes
  const publicRoutes = ['/login', '/register', '/nav'];
  if (publicRoutes.includes(to.path)) {
    if (isLoggedIn) {
      next('/');
      return;
    }
    next();
    return;
  }

  // Protected routes
  if (!isLoggedIn) {
    next('/nav');
    return;
  }

  next();
});

export default router;
