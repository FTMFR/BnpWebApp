import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from './guards/auth'
import { setupMenuPermissionGuard } from './guards/menu-permission'
import LoginPage from '@/pages/auth/LoginPage.vue'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        requiresAuth: false,
        layout: 'auth',
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      meta: {
        requiresAuth: false,
        layout: 'auth',
      },
    },
    // {
    //   path: '/mfa/verify',
    //   name: 'mfa-verify',
    //   component: () => import('@/pages/auth/MfaVerifyPage.vue'),
    //   meta: {
    //     requiresAuth: false,
    //     layout: 'auth',
    //   },
    // },
    // {
    //   path: '/mfa/setup',
    //   name: 'mfa-setup',
    //   component: () => import('@/pages/auth/MfaSetupPage.vue'),
    //   meta: {
    //     requiresAuth: true,
    //     layout: 'dashboard',
    //   },
    // },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
      },
    },
    {
      path: '/users/list',
      name: 'users',
      component: () => import('@/pages/users/UsersListPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
      },
    },
    {
      path: '/users/create',
      name: 'users-create',
      component: () => import('@/pages/users/UserCreatePage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
      },
    },
  ],
})

// Setup guards
setupAuthGuard(router)
setupMenuPermissionGuard(router)

export default router
