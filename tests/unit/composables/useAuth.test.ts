import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/shared/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/shared/api/client'
import { createLoginResponse, createMfaLoginResponse, createApiError, createNetworkError } from '../../helpers/factories/auth.factory'
import { createMockRouter } from '../../helpers/mocks/router.mock'

// Mock dependencies
vi.mock('@/shared/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const mockRouter = createMockRouter()
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.clearAllMocks()
    vi.mocked(mockRouter.push).mockClear()
  })

  describe('login', () => {
    it('should successfully login and save token', async () => {
      const loginResponse = createLoginResponse()
      vi.mocked(apiClient.post).mockResolvedValue({
        data: loginResponse,
      } as any)

      const { loginAsync, isLoggingIn } = useAuth()
      const store = useAuthStore()

      expect(isLoggingIn.value).toBe(false)

      await loginAsync({
        UserName: 'testuser',
        Password: 'password123',
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/Auth/login'),
        {
          UserName: 'testuser',
          Password: 'password123',
        }
      )

      expect(store.token).toBe(loginResponse.Token)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should handle login errors with response data', async () => {
      const error = createApiError(401, 'نام کاربری یا رمز عبور اشتباه است')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { loginAsync } = useAuth()
      const store = useAuthStore()

      await expect(
        loginAsync({
          UserName: 'wronguser',
          Password: 'wrongpass',
        })
      ).rejects.toEqual(error)

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle network errors', async () => {
      const error = createNetworkError()
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { loginAsync } = useAuth()
      const store = useAuthStore()

      await expect(
        loginAsync({
          UserName: 'testuser',
          Password: 'password123',
        })
      ).rejects.toEqual(error)

      expect(store.token).toBe(null)
    })

    it('should handle 500 server errors', async () => {
      const error = createApiError(500, 'خطای سرور رخ داده است')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { loginAsync } = useAuth()

      await expect(
        loginAsync({
          UserName: 'testuser',
          Password: 'password123',
        })
      ).rejects.toEqual(error)
    })

    it('should handle 403 forbidden errors', async () => {
      const error = createApiError(403, 'شما دسترسی به این بخش را ندارید')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { loginAsync } = useAuth()

      await expect(
        loginAsync({
          UserName: 'testuser',
          Password: 'password123',
        })
      ).rejects.toEqual(error)
    })

    it('should handle MFA requirement', async () => {
      const mfaResponse = createMfaLoginResponse()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mfaResponse,
      } as any)

      const { loginAsync } = useAuth()
      const store = useAuthStore()

      await loginAsync({
        UserName: 'testuser',
        Password: 'password123',
      })

      expect(consoleSpy).toHaveBeenCalledWith('MFA required:', mfaResponse)
      expect(store.token).toBe(null) // Token should not be saved when MFA is required

      consoleSpy.mockRestore()
    })

    it('should set loading state during login', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      vi.mocked(apiClient.post).mockReturnValue(loginPromise as any)

      const { loginAsync, isLoggingIn } = useAuth()

      const loginTask = loginAsync({
        UserName: 'testuser',
        Password: 'password123',
      })

      // Check loading state is true
      expect(isLoggingIn.value).toBe(true)

      // Resolve the promise
      resolveLogin!({
        data: createLoginResponse(),
      })

      await loginTask

      // Check loading state is false after completion
      expect(isLoggingIn.value).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear auth and redirect to login', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} } as any)

      const { logout } = useAuth()
      const store = useAuthStore()
      store.setAuth('test-token')

      await logout()

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/Auth/logout')
      )
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('should clear auth even if logout API fails', async () => {
      const error = createApiError(500, 'Logout failed')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { logout } = useAuth()
      const store = useAuthStore()
      store.setAuth('test-token')

      await logout()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('should handle network errors during logout', async () => {
      const error = createNetworkError()
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { logout } = useAuth()
      const store = useAuthStore()
      store.setAuth('test-token')

      await logout()

      expect(store.token).toBe(null)
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  describe('token management', () => {
    it('should return current token', () => {
      const store = useAuthStore()
      store.setAuth('test-token')

      const { token } = useAuth()

      expect(token.value).toBe('test-token')
    })

    it('should return isAuthenticated state', () => {
      const store = useAuthStore()
      store.setAuth('test-token')

      const { isAuthenticated } = useAuth()

      expect(isAuthenticated.value).toBe(true)
    })

    it('should update reactively when token changes', () => {
      const { token, isAuthenticated } = useAuth()
      const store = useAuthStore()

      expect(token.value).toBe(null)
      expect(isAuthenticated.value).toBe(false)

      store.setAuth('new-token')

      expect(token.value).toBe('new-token')
      expect(isAuthenticated.value).toBe(true)

      store.clear()

      expect(token.value).toBe(null)
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('login mutation state', () => {
    it('should track login pending state', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      vi.mocked(apiClient.post).mockReturnValue(loginPromise as any)

      const { loginAsync, isLoggingIn } = useAuth()

      expect(isLoggingIn.value).toBe(false)

      const loginTask = loginAsync({
        UserName: 'testuser',
        Password: 'password123',
      })

      expect(isLoggingIn.value).toBe(true)

      resolveLogin!({
        data: createLoginResponse(),
      })

      await loginTask

      expect(isLoggingIn.value).toBe(false)
    })

    it('should reset pending state on error', async () => {
      const error = createApiError(401, 'Unauthorized')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const { loginAsync, isLoggingIn } = useAuth()

      expect(isLoggingIn.value).toBe(false)

      try {
        await loginAsync({
          UserName: 'wronguser',
          Password: 'wrongpass',
        })
      } catch {
        // Expected to throw
      }

      expect(isLoggingIn.value).toBe(false)
    })
  })
})

