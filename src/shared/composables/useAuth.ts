import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useAuthStore, type AuthUser } from '@/stores/auth'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'

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

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(endpoints.auth.login, credentials)
      return response.data
    },
    onSuccess: async (loginData) => {
      if (loginData.RequiresMfa) {
        console.log('MFA required:', loginData)
        return
      }

      try {
        const userResponse = await apiClient.get<AuthUser>(endpoints.users.byId(loginData.PublicId))
        authStore.setAuth(loginData.Token, loginData.PublicId, userResponse.data)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    },
  })

  const userQuery = useQuery({
    queryKey: ['user', authStore.publicId],
    queryFn: async (): Promise<AuthUser> => {
      if (!authStore.publicId) throw new Error('PublicId not available')
      const response = await apiClient.get<AuthUser>(endpoints.users.byId(authStore.publicId))
      if (authStore.token) {
        authStore.setAuth(authStore.token, authStore.publicId, response.data)
      }
      return response.data
    },
    enabled: computed(() => !!authStore.publicId && !!authStore.token && !authStore.user),
  })

  const logout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout)
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      authStore.clear()
      router.push('/login')
    }
  }

  return {
    user: computed(() => authStore.user),
    publicId: computed(() => authStore.publicId),
    token: computed(() => authStore.token),
    isAuthenticated: computed(() => authStore.isAuthenticated),

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    logout,

    isLoadingUser: computed(() => userQuery.isLoading.value || userQuery.isFetching.value),
    fetchUser: userQuery.refetch,
  }
}
