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
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/auth/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/auth/RegisterPage.vue')
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
  
  if (to.path !== '/login' && to.path !== '/register' && !isLoggedIn) {
    next('/login');
    return;
  }
  
  if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    next('/');
    return;
  }
  
  next();
});

export default router;
