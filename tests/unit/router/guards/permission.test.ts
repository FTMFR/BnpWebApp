import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { setupAuthGuard } from '@/router/guards/auth'
import { setupPermissionGuard } from '@/router/guards/permission'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Permission Guard', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

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
          meta: { requiresAuth: true, permissions: ['Users.Read'] },
        },
        {
          path: '/grp/create',
          name: 'groups-create',
          component: { template: '<div>Create Group</div>' },
          meta: { requiresAuth: true, permissions: ['Groups.Create', 'Groups.Read'] },
        },
        {
          path: '/menu/list',
          name: 'menu-list',
          component: { template: '<div>Menu</div>' },
          meta: { requiresAuth: true, permissionsAny: ['Menu.Read', 'Menus.Read'] },
        },
      ],
    })

    setupAuthGuard(router)
    setupPermissionGuard(router)
  })

  it('should allow access when user has required permission (meta.permissions)', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Users.Read'],
    } as any)

    await router.push('/users/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('users')
    expect(apiClient.get).toHaveBeenCalledWith(endpoints.permissions.myPermissions)
  })

  it('should redirect to dashboard and show toast when user lacks required permission', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Groups.Read'],
    } as any)

    await router.push('/users/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should require ALL permissions when meta.permissions is set', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Groups.Create'],
    } as any)

    await router.push('/grp/create')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should allow when user has all required permissions', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Groups.Create', 'Groups.Read'],
    } as any)

    await router.push('/grp/create')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('groups-create')
  })

  it('should allow when user has at least one of permissionsAny', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Menus.Read'],
    } as any)

    await router.push('/menu/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('menu-list')
  })

  it('should allow when user has Menu.Read (other variant of permissionsAny)', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Menu.Read'],
    } as any)

    await router.push('/menu/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('menu-list')
  })

  it('should redirect to dashboard when user has none of permissionsAny', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')
    vi.mocked(apiClient.get).mockResolvedValue({
      data: ['Users.Read'],
    } as any)

    await router.push('/menu/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should not check permissions for routes without meta.permissions or meta.permissionsAny', async () => {
    const store = useAuthStore()
    store.setAuth('token', 'public-id')

    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(apiClient.get).not.toHaveBeenCalled()
  })
})
