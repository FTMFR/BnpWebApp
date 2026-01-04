import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface AuthUser {
  PublicIdid: number
  UserName: string
  FirstName: string
  LastName: string | null
  Email: string
  Phone: string
  MobileNumber: string
  UserCode: string | null
  IpAddress: string | null
  ZamanInsert: string | null
  ZamanLastEdit: string | null
  IsActive: boolean
  PasswordLastChangedAt: string | null
  LastLoginAt: string | null
  MustChangePassword: boolean
}

const STORAGE_KEYS = {
  token: 'auth_token',
  publicId: 'auth_public_id',
} as const

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const publicId = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function initialize() {
    try {
      const savedToken = sessionStorage.getItem(STORAGE_KEYS.token)
      const savedPublicId = sessionStorage.getItem(STORAGE_KEYS.publicId)

      if (savedToken) token.value = savedToken
      if (savedPublicId) publicId.value = savedPublicId
    } catch (error) {
      console.error('Failed to restore auth from sessionStorage:', error)
      clear()
    }
  }

  function setAuth(authToken: string, userPublicId: string, userData?: AuthUser) {
    token.value = authToken
    publicId.value = userPublicId

    if (userData) {
      user.value = userData
    }

    try {
      sessionStorage.setItem(STORAGE_KEYS.token, authToken)
      sessionStorage.setItem(STORAGE_KEYS.publicId, userPublicId)

    } catch (error) {
      console.error('Failed to save auth to sessionStorage:', error)
    }
  }

  function clear() {
    token.value = null
    publicId.value = null
    user.value = null

    try {
      sessionStorage.removeItem(STORAGE_KEYS.token)
      sessionStorage.removeItem(STORAGE_KEYS.publicId)
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error)
    }
  }

  return {
    token,
    publicId,
    user,
    isAuthenticated,
    setAuth,
    clear,
    initialize,
  }
})
