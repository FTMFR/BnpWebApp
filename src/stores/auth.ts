import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { setSentryUser, clearSentryUser } from '../../sentry.config'

export interface AuthUser {
  PublicId: string
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

export const STORAGE_KEYS = {
  Token: 'auth_token',
  publicId: 'auth_public_id',
} as const

/** Set when password was changed; 401 handler clears auth and redirects without calling refresh/logout. Cleared in clear(). */

export const useAuthStore = defineStore('auth', () => {
  const Token = ref<string | null>(null)
  const publicId = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!Token.value)

  function initialize() {
    try {
      const savedToken = sessionStorage.getItem(STORAGE_KEYS.Token)
      const savedPublicId = sessionStorage.getItem(STORAGE_KEYS.publicId)

      if (savedToken) Token.value = savedToken
      if (savedPublicId) publicId.value = savedPublicId
    } catch (error) {
      console.error('Failed to restore auth from sessionStorage:', error)
      clear()
    }
  }

  function setAuth(authToken: string, userPublicId: string, userData?: AuthUser) {
    Token.value = authToken
    publicId.value = userPublicId

    if (userData) {
      user.value = userData
      // Set Sentry user context
      // setSentryUser(userData.PublicId, userData.UserName, userData.Email, {
      //   firstName: userData.FirstName,
      //   lastName: userData.LastName,
      //   phone: userData.Phone,
      //   mobileNumber: userData.MobileNumber,
      //   userCode: userData.UserCode,
      // })
    }

    try {
      sessionStorage.setItem(STORAGE_KEYS.Token, authToken)
      sessionStorage.setItem(STORAGE_KEYS.publicId, userPublicId)

    } catch (error) {
      console.error('Failed to save auth to sessionStorage:', error)
    }
  }

  function clear() {
    Token.value = null
    publicId.value = null
    user.value = null

    // Clear Sentry user context
    // clearSentryUser()

    try {
      sessionStorage.removeItem(STORAGE_KEYS.Token)
      sessionStorage.removeItem(STORAGE_KEYS.publicId)
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error)
    }
  }

  return {
    Token,
    publicId,
    user,
    isAuthenticated,
    setAuth,
    clear,
    initialize,
  }
})
