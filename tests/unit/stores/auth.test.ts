import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  describe('initialize', () => {
    it('should restore token from sessionStorage', () => {
      const testToken = 'test-token-12345'
      sessionStorage.setItem('auth_token', testToken)

      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe(testToken)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should not restore token if sessionStorage is empty', () => {
      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle corrupted sessionStorage gracefully', () => {
      // Mock sessionStorage.getItem to throw an error
      const originalGetItem = sessionStorage.getItem
      vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const store = useAuthStore()
      store.initialize()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)

      // Restore original implementation
      sessionStorage.getItem = originalGetItem
    })

    it('should clear store if initialization fails', () => {
      // Set a token first
      sessionStorage.setItem('auth_token', 'existing-token')
      const store = useAuthStore()
      store.setAuth('existing-token')

      // Mock sessionStorage.getItem to throw an error
      const originalGetItem = sessionStorage.getItem
      vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      store.initialize()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)

      // Restore original implementation
      sessionStorage.getItem = originalGetItem
    })
  })

  describe('setAuth', () => {
    it('should save token to store and sessionStorage', () => {
      const store = useAuthStore()
      const testToken = 'new-token-12345'

      store.setAuth(testToken)

      expect(store.token).toBe(testToken)
      expect(sessionStorage.getItem('auth_token')).toBe(testToken)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should overwrite existing token', () => {
      const store = useAuthStore()
      store.setAuth('old-token')
      store.setAuth('new-token')

      expect(store.token).toBe('new-token')
      expect(sessionStorage.getItem('auth_token')).toBe('new-token')
    })

    it('should handle sessionStorage errors gracefully', () => {
      const store = useAuthStore()
      const testToken = 'test-token'

      // Mock sessionStorage.setItem to throw an error
      const originalSetItem = sessionStorage.setItem
      vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw, but token should still be set in store
      expect(() => store.setAuth(testToken)).not.toThrow()
      expect(store.token).toBe(testToken)

      // Restore original implementation
      sessionStorage.setItem = originalSetItem
    })
  })

  describe('clear', () => {
    it('should remove token from store and sessionStorage', () => {
      const store = useAuthStore()
      store.setAuth('test-token')
      expect(store.isAuthenticated).toBe(true)

      store.clear()

      expect(store.token).toBe(null)
      expect(sessionStorage.getItem('auth_token')).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle sessionStorage errors gracefully', () => {
      const store = useAuthStore()
      store.setAuth('test-token')

      // Mock sessionStorage.removeItem to throw an error
      const originalRemoveItem = sessionStorage.removeItem
      vi.spyOn(sessionStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw, but token should still be cleared from store
      expect(() => store.clear()).not.toThrow()
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)

      // Restore original implementation
      sessionStorage.removeItem = originalRemoveItem
    })

    it('should work even if no token exists', () => {
      const store = useAuthStore()
      expect(store.token).toBe(null)

      expect(() => store.clear()).not.toThrow()
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when token is null', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return false when token is empty string', () => {
      const store = useAuthStore()
      store.setAuth('')
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return true when token exists', () => {
      const store = useAuthStore()
      store.setAuth('valid-token')
      expect(store.isAuthenticated).toBe(true)
    })

    it('should update reactively when token changes', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)

      store.setAuth('token')
      expect(store.isAuthenticated).toBe(true)

      store.clear()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('token persistence', () => {
    it('should persist token across store instances', () => {
      const store1 = useAuthStore()
      store1.setAuth('persistent-token')

      // Create a new store instance (simulating page reload)
      setActivePinia(createPinia())
      const store2 = useAuthStore()
      store2.initialize()

      expect(store2.token).toBe('persistent-token')
      expect(store2.isAuthenticated).toBe(true)
    })

    it('should clear token when clear is called', () => {
      const store1 = useAuthStore()
      store1.setAuth('token-to-clear')

      const store2 = useAuthStore()
      store2.clear()

      const store3 = useAuthStore()
      store3.initialize()

      expect(store3.token).toBe(null)
      expect(store3.isAuthenticated).toBe(false)
    })
  })
})

