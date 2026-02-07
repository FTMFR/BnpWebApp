import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useAuthStore, type AuthUser } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permission'
import { useToastStore } from '@/stores/toast'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { MySessionsResponse, Session } from '@/shared/api/types'
import { AxiosError } from 'axios'

export interface LogoutAllResponse {
  Success: boolean
  Message: string
}

export interface LoginCredentials {
  UserName: string
  Password: string
}

export interface LoginResponse {
  Token: string
  ExpiresAt: string
  UserName: string
  Roles: string[]
  RequiresMfa: boolean
  MfaToken: string | null
  OtpExpirySeconds: number | null
  MaskedMobileNumber: string | null
  CaptchaId: string | null
  CaptchaImage: string | null
  UserId: number
  PublicId: string
  FullName: string
}

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Session management state
  const maxSessionReached = ref()
  const sessions = ref<Session[]>([]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(endpoints.auth.login, credentials)
      return response.data
    },
    onSuccess: async (loginData: LoginResponse) => {
      if (loginData.RequiresMfa) {
        return
      }
      // Set token and publicId, but don't fetch user yet
      // User fetching will be handled in LoginForm after session check
      authStore.setAuth(loginData.Token, loginData.PublicId)
      const permissionStore = usePermissionsStore()
      await permissionStore.fetchPermissions()
    },
    onError: (error: unknown) => {
      console.error('Login error:', error)
    },
    // onSettled: () => {
    // },
  })

  const userQuery = useQuery({
    queryKey: ['user', authStore.publicId],
    queryFn: async (): Promise<AuthUser> => {
      if (!authStore.publicId) throw new Error('PublicId not available')
      const response = await apiClient.get<AuthUser>(endpoints.users.byId(authStore.publicId))
      if (authStore.Token) {
        authStore.setAuth(authStore.Token, authStore.publicId, response.data)
      }
      return response.data
    },
    // enabled: computed(() => !!authStore.publicId && !!authStore.Token && !authStore.user),
  })

  const checkSessions = async (): Promise<MySessionsResponse | null> => {
    try {
      const response = await apiClient.get<MySessionsResponse>(endpoints.session.mySessions)
      sessions.value = response.data.sessions
      maxSessionReached.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      return null
    }
  }

  const revokeSession = async (sessionPublicId: string): Promise<boolean> => {
    try {
      await apiClient.delete(endpoints.session.revokeSession(sessionPublicId))
      // Refresh sessions after revoke
      await checkSessions()
      return true
    } catch (error) {
      console.error('Failed to revoke session:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout)
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      authStore.clear()
      usePermissionsStore().clearPermissions()
      router.push('/login')
    }
  }

  const logoutAll = async () => {
    const toastStore = useToastStore()
    try {
      const response = await apiClient.post<LogoutAllResponse>(endpoints.auth.logoutAll)
      const message = response.data?.Message || 'از همه دستگاه‌ها خارج شدید.'
      toastStore.showToast(message, 'success', 5000)
    } catch (error) {
      console.error('LogoutAll API error:', error)
      const msg =
        error instanceof AxiosError
          ? (error.response?.data as { Message?: string })?.Message || 'خروج از همه دستگاه‌ها ناموفق بود.'
          : 'خروج از همه دستگاه‌ها ناموفق بود.'
      toastStore.showToast(msg, 'error', 6000)
    } finally {
      authStore.clear()
      usePermissionsStore().clearPermissions()
      router.push('/login')
    }
  }

  /** True when user has Admin role (from verify/user API). Use for UI that only admins should see (e.g. Help center "بخش‌های اصلی سیستم"). */
  const isAdmin = computed(
    () => authStore.user?.Roles?.some((r) => r.toLowerCase() === 'admin') ?? false
  )

  return {
    user: computed(() => authStore.user),
    publicId: computed(() => authStore.publicId),
    token: computed(() => authStore.Token),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isLoading,
    logout,
    logoutAll,

    isLoadingUser: computed(() => userQuery.isLoading.value || userQuery.isLoading.value),
    fetchUser: userQuery.refetch,
    // Session management
    sessions: computed(() => sessions.value),
    maxSessionReached: computed(() => maxSessionReached.value),
    checkSessions,
    revokeSession,
  }
}
