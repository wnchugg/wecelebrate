import { describe, it, expect } from 'vitest'
import { sanitizeInput, validateEmail, isValidUrl } from '../app/utils/frontendSecurity'

describe('Frontend Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script>Hello'
      const sanitized = sanitizeInput(malicious)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello')
    })

    it('should handle normal strings safely', () => {
      const normal = 'Hello World 123'
      const sanitized = sanitizeInput(normal)
      expect(sanitized).toBe(normal)
    })

    it('should remove on* event handlers', () => {
      const malicious = '<div onclick="alert()">Click</div>'
      const sanitized = sanitizeInput(malicious)
      expect(sanitized).not.toContain('onclick')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('notanemail')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:5173')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})