import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema } from '@/shared/validation/schemas/user'

describe('user validation schemas', () => {
  describe('createUserSchema', () => {
    const validBase = {
      userName: 'newuser',
      password: 'password6',
      firstName: 'نام',
      lastName: 'خانوادگی',
      mobileNumber: '09123456789',
      grpPublicId: 'grp-1',
    }

    it('should accept valid data with all required fields', () => {
      const result = createUserSchema.safeParse(validBase)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userName).toBe('newuser')
        expect(result.data.mobileNumber).toBe('09123456789')
      }
    })

    it('should accept valid email when provided', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        email: 'user@example.com',
      })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.email).toBe('user@example.com')
    })

    it('should accept empty or undefined email (optional)', () => {
      const result = createUserSchema.safeParse(validBase)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.email).toBeUndefined()
    })

    it('should reject invalid email format', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('ایمیل'))).toBe(true)
      }
    })

    it('should reject mobileNumber not matching 09xxxxxxxxx', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        mobileNumber: '9123456789',
      })
      expect(result.success).toBe(false)
    })

    it('should reject mobileNumber with wrong length', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        mobileNumber: '0912345678',
      })
      expect(result.success).toBe(false)
    })

    it('should reject password shorter than 6 characters', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        password: 'short',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty userName', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        userName: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty grpPublicId', () => {
      const result = createUserSchema.safeParse({
        ...validBase,
        grpPublicId: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateUserSchema', () => {
    it('should accept valid data', () => {
      const result = updateUserSchema.safeParse({
        firstName: 'نام',
        lastName: 'خانوادگی',
        email: 'user@example.com',
        phone: '02112345678',
        mobileNumber: '09123456789',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = updateUserSchema.safeParse({
        firstName: 'نام',
        lastName: 'خانوادگی',
        email: 'invalid',
        phone: '',
        mobileNumber: '09123456789',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid mobileNumber', () => {
      const result = updateUserSchema.safeParse({
        firstName: 'نام',
        lastName: 'خانوادگی',
        email: 'a@b.com',
        phone: '',
        mobileNumber: '1234567890',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty firstName', () => {
      const result = updateUserSchema.safeParse({
        firstName: '',
        lastName: 'خانوادگی',
        email: 'a@b.com',
        phone: '',
        mobileNumber: '09123456789',
      })
      expect(result.success).toBe(false)
    })
  })
})
