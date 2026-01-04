import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import LoginPage from '@/pages/auth/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/shared/composables/useAuth'
import apiClient from '@/shared/api/client'
import { createLoginResponse, createApiError } from '../../helpers/factories/auth.factory'
import { setupAuthGuard } from '@/router/guards/auth'

// Mock API client
vi.mock('@/shared/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('Login Flow Integration', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>
  let queryClient: QueryClient

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    sessionStorage.clear()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/login',
          name: 'login',
          component: LoginPage,
          meta: { requiresAuth: false },
        },
        {
          path: '/',
          name: 'dashboard',
          component: { template: '<div>Dashboard</div>' },
          meta: { requiresAuth: true },
        },
      ],
    })

    setupAuthGuard(router)
    vi.clearAllMocks()
  })

  describe('Complete login flow', () => {
    it('should complete full login flow from UI to store', async () => {
      const loginResponse = createLoginResponse()
      vi.mocked(apiClient.post).mockResolvedValue({
        data: loginResponse,
      } as any)

      const wrapper = mount(LoginPage, {
        global: {
          plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const store = useAuthStore()

      // Fill form
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await usernameInput.setValue('testuser')
      await passwordInput.setValue('password123')

      // Submit form
      await form.trigger('submit')

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify API was called
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/Auth/login'),
        {
          UserName: 'testuser',
          Password: 'password123',
        }
      )

      // Verify token was saved
      expect(store.token).toBe(loginResponse.Token)
      expect(store.isAuthenticated).toBe(true)
      expect(sessionStorage.getItem('auth_token')).toBe(loginResponse.Token)
    })

    it('should redirect to dashboard after successful login', async () => {
      const loginResponse = createLoginResponse()
      vi.mocked(apiClient.post).mockResolvedValue({
        data: loginResponse,
      } as any)

      const wrapper = mount(LoginPage, {
        global: {
          plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        },
      })

      await router.push('/login')
      await router.isReady()

      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await usernameInput.setValue('testuser')
      await passwordInput.setValue('password123')
      await form.trigger('submit')

      // Wait for navigation
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify redirect happened
      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('should redirect to original route when redirect query param exists', async () => {
      const loginResponse = createLoginResponse()
      vi.mocked(apiClient.post).mockResolvedValue({
        data: loginResponse,
      } as any)

      router = createRouter({
        history: createWebHistory(),
        routes: [
          {
            path: '/login',
            name: 'login',
            component: LoginPage,
            meta: { requiresAuth: false },
          },
          {
            path: '/customers',
            name: 'customers',
            component: { template: '<div>Customers</div>' },
            meta: { requiresAuth: true },
          },
        ],
      })

      setupAuthGuard(router)

      await router.push({ name: 'login', query: { redirect: '/customers' } })
      await router.isReady()

      const wrapper = mount(LoginPage, {
        global: {
          plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await usernameInput.setValue('testuser')
      await passwordInput.setValue('password123')
      await form.trigger('submit')

      // Wait for navigation
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should redirect to /customers
      expect(router.currentRoute.value.path).toBe('/customers')
    })
  })

  describe('Auth guard integration', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.query.redirect).toBe('/')
    })

    it('should allow access to protected route after login', async () => {
      const loginResponse = createLoginResponse()
      vi.mocked(apiClient.post).mockResolvedValue({
        data: loginResponse,
      } as any)

      const store = useAuthStore()
      store.setAuth(loginResponse.Token)

      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('should redirect to dashboard when accessing login page while authenticated', async () => {
      const store = useAuthStore()
      store.setAuth('existing-token')

      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })

  describe('Error handling in login flow', () => {
    it('should display error message on login failure', async () => {
      const error = createApiError(401, 'نام کاربری یا رمز عبور اشتباه است')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const wrapper = mount(LoginPage, {
        global: {
          plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await usernameInput.setValue('wronguser')
      await passwordInput.setValue('wrongpass')
      await form.trigger('submit')

      // Wait for error to be displayed
      await new Promise((resolve) => setTimeout(resolve, 100))

      const errorMessage = wrapper.find('#login-error')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('نام کاربری یا رمز عبور اشتباه است')

      // Verify user is not authenticated
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      const error = {
        request: {},
        config: {},
        message: 'Network Error',
        isAxiosError: true,
      }
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const wrapper = mount(LoginPage, {
        global: {
          plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await usernameInput.setValue('testuser')
      await passwordInput.setValue('password123')
      await form.trigger('submit')

      // Wait for error to be displayed
      await new Promise((resolve) => setTimeout(resolve, 100))

      const errorMessage = wrapper.find('#login-error')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('ارتباط با سرور برقرار نشد')
    })
  })

  describe('Session persistence', () => {
    it('should restore authentication state from sessionStorage', async () => {
      const token = 'persisted-token'
      sessionStorage.setItem('auth_token', token)

      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe(token)
      expect(store.isAuthenticated).toBe(true)

      // Should be able to access protected route
      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('should clear session on logout', async () => {
      const store = useAuthStore()
      store.setAuth('test-token')
      expect(store.isAuthenticated).toBe(true)

      const { logout } = useAuth()
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} } as any)

      await logout()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(sessionStorage.getItem('auth_token')).toBe(null)

      // Should redirect to login
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })
})

