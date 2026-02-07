import { describe, it, expect } from 'vitest'
import { loginSchema, changeMyPasswordSchema } from '@/shared/validation/schemas/auth'

describe('auth validation schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid userName and password', () => {
      const result = loginSchema.safeParse({
        userName: 'testuser',
        password: 'secret123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userName).toBe('testuser')
        expect(result.data.password).toBe('secret123')
      }
    })

    it('should trim whitespace', () => {
      const result = loginSchema.safeParse({
        userName: '  user  ',
        password: '  pass  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userName).toBe('user')
        expect(result.data.password).toBe('pass')
      }
    })

    it('should reject empty userName', () => {
      const result = loginSchema.safeParse({
        userName: '',
        password: 'password',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('نام کاربری'))).toBe(true)
      }
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        userName: 'user',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('رمز عبور'))).toBe(true)
      }
    })

    it('should reject missing userName', () => {
      const result = loginSchema.safeParse({
        password: 'password',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        userName: 'user',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('changeMyPasswordSchema', () => {
    it('should accept valid data when newPassword equals confirmNewPassword', () => {
      const result = changeMyPasswordSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpass6',
        confirmNewPassword: 'newpass6',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.newPassword).toBe('newpass6')
        expect(result.data.confirmNewPassword).toBe('newpass6')
      }
    })

    it('should reject newPassword shorter than 6 characters', () => {
      const result = changeMyPasswordSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'short',
        confirmNewPassword: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('۶ کاراکتر'))).toBe(true)
      }
    })

    it('should reject when newPassword and confirmNewPassword do not match', () => {
      const result = changeMyPasswordSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpass6',
        confirmNewPassword: 'otherpass6',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const refineError = result.error.issues.find(
          (i) => i.path.includes('confirmNewPassword') || i.message.includes('یکسان')
        )
        expect(refineError).toBeDefined()
      }
    })

    it('should reject empty currentPassword', () => {
      const result = changeMyPasswordSchema.safeParse({
        currentPassword: '',
        newPassword: 'newpass6',
        confirmNewPassword: 'newpass6',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty confirmNewPassword', () => {
      const result = changeMyPasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'newpass6',
        confirmNewPassword: '',
      })
      expect(result.success).toBe(false)
    })
  })
})
