import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeText } from '@/shared/utils/sanitize'

describe('sanitize', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe tags (b, i, em, strong, a, p, br, ul, ol, li)', () => {
      expect(sanitizeHtml('<p>Hello</p>')).toBe('<p>Hello</p>')
      expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>')
      expect(sanitizeHtml('<a href="/link">link</a>')).toContain('<a')
      expect(sanitizeHtml('<a href="/link">link</a>')).toContain('href')
    })

    it('should strip script tags and dangerous content', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('')
      expect(sanitizeHtml('<p>Safe</p><script>evil()</script>')).not.toContain('script')
    })

    it('should strip onclick and other event handlers', () => {
      const result = sanitizeHtml('<a href="#" onclick="alert(1)">click</a>')
      expect(result).not.toContain('onclick')
    })

    it('should allow href and target on links', () => {
      const result = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>')
      expect(result).toContain('href')
      expect(result).toContain('target')
    })
  })

  describe('sanitizeText', () => {
    it('should strip all HTML and return plain text', () => {
      expect(sanitizeText('<p>Hello</p>')).toBe('Hello')
      expect(sanitizeText('<b>bold</b>')).toBe('bold')
      expect(sanitizeText('<script>alert(1)</script>')).toBe('')
    })

    it('should preserve text content only', () => {
      expect(sanitizeText('<div><span>Only text</span></div>')).toBe('Only text')
    })

    it('should handle empty string', () => {
      expect(sanitizeText('')).toBe('')
    })
  })
})
