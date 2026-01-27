import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isAuthenticated = (): boolean => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const savedUser = sessionStorage.getItem('auth_user')
    if (savedUser) {
      try {
        authStore.initialize()
      } catch (error) {
        console.error('Failed to restore user from sessionStorage in guard:', error)
        sessionStorage.removeItem('auth_user')
      }
    }
  }

  return authStore.isAuthenticated
}

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, _, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !isAuthenticated()) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    } else if (to.name === 'login' && isAuthenticated()) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })
}
