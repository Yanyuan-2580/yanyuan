import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue')
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: () => import('@/pages/UserManagementPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/articles',
      name: 'ArticleManagement',
      component: () => import('@/pages/ArticleManagementPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/risk',
      name: 'RiskManagement',
      component: () => import('@/pages/RiskManagementPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/audit-logs',
      name: 'AuditLogs',
      component: () => import('@/pages/AuditLogPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue')
    }
  ]
});

router.beforeEach((to, _, next) => {
  const isLoggedIn = !!localStorage.getItem('adminToken');
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  }
  
  if (to.path === '/login' && isLoggedIn) {
    next('/');
    return;
  }
  
  next();
});

export default router;
