import { describe, it, expect } from 'vitest'
import {
  isLoginRequest,
  isRefreshRequest,
  isLogoutRequest,
  isMfaResendOrVerifyRequest,
  isSessionCheckRequest,
  isUserRequest,
  isRefreshTokenNotFoundMessage,
  isAuthPage,
} from '@/shared/api/responsePredicates'

describe('responsePredicates', () => {
  describe('isLoginRequest', () => {
    it('should return true when url contains /Auth/login', () => {
      expect(isLoginRequest('/api/Auth/login')).toBe(true)
      expect(isLoginRequest('https://example.com/api/Auth/login')).toBe(true)
    })

    it('should return false when url does not contain /Auth/login', () => {
      expect(isLoginRequest('/api/Auth/refresh')).toBe(false)
      expect(isLoginRequest('/api/Users')).toBe(false)
    })

    it('should return false for undefined or empty url', () => {
      expect(isLoginRequest(undefined)).toBe(false)
      expect(isLoginRequest('')).toBe(false)
    })
  })

  describe('isRefreshRequest', () => {
    it('should return true when url contains /Auth/refresh', () => {
      expect(isRefreshRequest('/api/Auth/refresh')).toBe(true)
    })

    it('should return false when url does not contain /Auth/refresh', () => {
      expect(isRefreshRequest('/api/Auth/login')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isRefreshRequest(undefined)).toBe(false)
    })
  })

  describe('isLogoutRequest', () => {
    it('should return true when url contains /Auth/logout', () => {
      expect(isLogoutRequest('/api/Auth/logout')).toBe(true)
    })

    it('should return false when url does not contain /Auth/logout', () => {
      expect(isLogoutRequest('/api/Auth/login')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isLogoutRequest(undefined)).toBe(false)
    })
  })

  describe('isMfaResendOrVerifyRequest', () => {
    it('should return true for resend-otp url', () => {
      expect(isMfaResendOrVerifyRequest('/api/Auth/mfa/resend-otp')).toBe(true)
    })

    it('should return true for verify url', () => {
      expect(isMfaResendOrVerifyRequest('/api/Auth/mfa/verify')).toBe(true)
    })

    it('should return false for other auth mfa urls', () => {
      expect(isMfaResendOrVerifyRequest('/api/Auth/mfa/status')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isMfaResendOrVerifyRequest(undefined)).toBe(false)
    })
  })

  describe('isSessionCheckRequest', () => {
    it('should return true when url contains /Session/MySessions', () => {
      expect(isSessionCheckRequest('/api/Session/MySessions')).toBe(true)
    })

    it('should return false when url does not', () => {
      expect(isSessionCheckRequest('/api/Users')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isSessionCheckRequest(undefined)).toBe(false)
    })
  })

  describe('isUserRequest', () => {
    it('should return true when url contains /Users/', () => {
      expect(isUserRequest('/api/Users/123')).toBe(true)
      expect(isUserRequest('/api/Users')).toBe(false)
    })

    it('should return false when url does not contain /Users/', () => {
      expect(isUserRequest('/api/Grp')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUserRequest(undefined)).toBe(false)
    })
  })

  describe('isRefreshTokenNotFoundMessage', () => {
    it('should return true when message contains یافت نشد', () => {
      expect(isRefreshTokenNotFoundMessage('Refresh Token یافت نشد')).toBe(true)
    })

    it('should return true when message contains Refresh Token', () => {
      expect(isRefreshTokenNotFoundMessage('Refresh Token invalid')).toBe(true)
    })

    it('should return false for other messages', () => {
      expect(isRefreshTokenNotFoundMessage('Unauthorized')).toBe(false)
    })

    it('should return false for undefined or empty', () => {
      expect(isRefreshTokenNotFoundMessage(undefined)).toBe(false)
      expect(isRefreshTokenNotFoundMessage('')).toBe(false)
    })
  })

  describe('isAuthPage', () => {
    it('should return true for /login', () => {
      expect(isAuthPage('/login')).toBe(true)
      expect(isAuthPage('/login?redirect=/dashboard')).toBe(true)
    })

    it('should return true for /register and /forgot-password', () => {
      expect(isAuthPage('/register')).toBe(true)
      expect(isAuthPage('/forgot-password')).toBe(true)
    })

    it('should return false for dashboard and other routes', () => {
      expect(isAuthPage('/dashboard')).toBe(false)
      expect(isAuthPage('/users/list')).toBe(false)
    })
  })
})
