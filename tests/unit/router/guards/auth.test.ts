import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { setupAuthGuard } from '@/router/guards/auth'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/stores/auth'

describe('Auth Guard', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()

    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/login',
          name: 'login',
          component: { template: '<div>Login</div>' },
          meta: { requiresAuth: false },
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: { template: '<div>Dashboard</div>' },
          meta: { requiresAuth: true },
        },
        {
          path: '/users/list',
          name: 'users',
          component: { template: '<div>Users</div>' },
          meta: { requiresAuth: true },
        },
      ],
    })

    setupAuthGuard(router)
  })

  it('should redirect to login with redirect query when accessing protected route without auth', async () => {
    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('should include full path in redirect query', async () => {
    await router.push('/users/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/users/list')
  })

  it('should redirect to dashboard when accessing login page while authenticated', async () => {
    const store = useAuthStore()
    store.setAuth('test-token', 'user-public-id')

    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should allow access to protected route when authenticated', async () => {
    const store = useAuthStore()
    store.setAuth('test-token', 'user-public-id')

    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should allow access to login when not authenticated', async () => {
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('should restore auth from sessionStorage when auth_user is set and then allow protected route', async () => {
    sessionStorage.setItem(STORAGE_KEYS.Token, 'restored-token')
    sessionStorage.setItem(STORAGE_KEYS.publicId, 'restored-public-id')
    sessionStorage.setItem('auth_user', '{}')

    await router.push('/dashboard')
    await router.isReady()

    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
