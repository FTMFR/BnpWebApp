import { describe, it, expect } from 'vitest'
import { normalizePath } from '@/shared/composables/useMenu'

describe('normalizePath', () => {
  it('should strip /api prefix and ensure leading slash', () => {
    expect(normalizePath('/api/Users')).toBe('/users')
    expect(normalizePath('/api/Menu/list')).toBe('/menu/list')
  })

  it('should strip api/ prefix (no leading slash)', () => {
    expect(normalizePath('api/Menu')).toBe('/menu')
    expect(normalizePath('api/grp/list')).toBe('/grp/list')
  })

  it('should add leading slash when missing', () => {
    expect(normalizePath('dashboard')).toBe('/dashboard')
    expect(normalizePath('Grp/list')).toBe('/grp/list')
  })

  it('should convert to lowercase', () => {
    expect(normalizePath('/Dashboard')).toBe('/dashboard')
    expect(normalizePath('/Menu/List')).toBe('/menu/list')
  })

  it('should leave path unchanged when already normalized', () => {
    expect(normalizePath('/users')).toBe('/users')
    expect(normalizePath('/profile')).toBe('/profile')
  })

  it('should handle empty string', () => {
    expect(normalizePath('')).toBe('/')
  })

  it('should handle root path', () => {
    expect(normalizePath('/')).toBe('/')
  })
})
