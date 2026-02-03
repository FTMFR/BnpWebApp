import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from './guards/auth'
import { setupPermissionGuard } from './guards/permission'
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
        permissions: ['Users.Read'],
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
        permissions: ['Users.Create']
      },
    },
    {
      path: '/users/:id',
      name: 'user-update',
      component: () => import('@/pages/users/UserViewPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Users.Update'],
      },
    },
    {
      path: '/grp/list',
      name: 'groups',
      component: () => import('@/pages/groups/GroupsListPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Groups.Read'],
      },
    },
    {
      path: '/grp/create',
      name: 'groups-create',
      component: () => import('@/pages/groups/GroupCreatePage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Groups.Create'],
      },
    },
    {
      path: '/grp/:id',
      name: 'groups-update',
      component: () => import('@/pages/groups/GroupViewPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Groups.Update'],
      },
    },
    {
      path: '/Menu/List',
      name: 'menus',
      component: () => import('@/pages/menus/MenuListPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Menus.Read'],
      },
    },
    {
      path: '/menu/create',
      name: 'menu-create-404',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
      },
    },
    {
      path: '/menu/:id',
      name: 'menu-update',
      component: () => import('@/pages/menus/MenuViewPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Menus.Update'],
      },
    },
    {
      path: '/Permission/List',
      name: 'permission-create',
      component: () => import('@/pages/access/AccessListPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Permissions.Read'],
      },
    },
    {
      path: '/Permission/Assign',
      name: 'permission-group-access',
      component: () => import('@/pages/access/GroupAccessPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        permissions: ['Permissions.Read'],
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/UserProfile.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard'
      }
    },
    {
      path: '/carts',
      name: 'carts',
      component: () => import('@/pages/PlaceholderPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        title: 'کارت ها'
      }
    },
    {
      path: '/profits',
      name: 'profits',
      component: () => import('@/pages/PlaceholderPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
        title: 'حساب ها'
      }
    },
    // 404 – must be last; still shows header + bottom bar via DashboardLayout
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'dashboard',
      }
    },
  ],
})

setupAuthGuard(router)
setupPermissionGuard(router)
setupMenuPermissionGuard(router)

export default router
