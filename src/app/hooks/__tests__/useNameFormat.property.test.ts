/**
 * Property-Based Tests for useNameFormat Hook
 * 
 * These tests verify universal properties that should hold across all inputs
 * using the fast-check library for property-based testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useNameFormat } from '../useNameFormat';
import * as LanguageContext from '../../context/LanguageContext';

// Mock the LanguageContext
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useNameFormat - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: internationalization-improvements
   * Property 19: Asian locale name order is family-first
   * Validates: Requirements 8.2, 8.4
   */
  describe('Property 19: Asian locale name order is family-first', () => {
    it('should format names with family name first for Asian locales', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // firstName - use uuid to ensure uniqueness
          fc.uuid(), // lastName
          fc.constantFrom('ja', 'zh', 'zh-TW', 'ko'), // Asian locales
          (firstName, lastName, locale) => {
            // Mock the useLanguage hook to return the specified locale
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formatted = result.current.formatFullName(firstName, lastName);

            // For Asian locales, family name should come first
            // Expected format: "lastName firstName"
            expect(formatted).toBe(`${lastName} ${firstName}`);
            
            // Verify family name appears before given name
            const lastNameIndex = formatted.indexOf(lastName);
            const firstNameIndex = formatted.indexOf(firstName);
            expect(lastNameIndex).toBeLessThan(firstNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format names with middle name in family-middle-given order for Asian locales', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // firstName
          fc.uuid(), // lastName
          fc.uuid(), // middleName
          fc.constantFrom('ja', 'zh', 'zh-TW', 'ko'), // Asian locales
          (firstName, lastName, middleName, locale) => {
            // Mock the useLanguage hook
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formatted = result.current.formatFullName(firstName, lastName, middleName);

            // For Asian locales with middle name, expected format: "lastName middleName firstName"
            expect(formatted).toBe(`${lastName} ${middleName} ${firstName}`);
            
            // Verify order: family name, then middle name, then given name
            const lastNameIndex = formatted.indexOf(lastName);
            const middleNameIndex = formatted.indexOf(middleName);
            const firstNameIndex = formatted.indexOf(firstName);
            
            expect(lastNameIndex).toBeLessThan(middleNameIndex);
            expect(middleNameIndex).toBeLessThan(firstNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: internationalization-improvements
   * Property 20: Western locale name order is given-first
   * Validates: Requirements 8.3, 8.5
   */
  describe('Property 20: Western locale name order is given-first', () => {
    it('should format names with given name first for Western locales', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // firstName
          fc.uuid(), // lastName
          fc.constantFrom('en', 'en-GB', 'es', 'es-MX', 'fr', 'fr-CA', 'de', 'pt-BR', 'pt-PT', 'it', 'pl', 'ru', 'ar', 'he', 'ta', 'hi'), // Western locales
          (firstName, lastName, locale) => {
            // Mock the useLanguage hook to return the specified locale
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formatted = result.current.formatFullName(firstName, lastName);

            // For Western locales, given name should come first
            // Expected format: "firstName lastName"
            expect(formatted).toBe(`${firstName} ${lastName}`);
            
            // Verify given name appears before family name
            const firstNameIndex = formatted.indexOf(firstName);
            const lastNameIndex = formatted.indexOf(lastName);
            expect(firstNameIndex).toBeLessThan(lastNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format names with middle name in given-middle-family order for Western locales', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // firstName
          fc.uuid(), // lastName
          fc.uuid(), // middleName
          fc.constantFrom('en', 'en-GB', 'es', 'es-MX', 'fr', 'fr-CA', 'de', 'pt-BR', 'pt-PT', 'it', 'pl', 'ru', 'ar', 'he', 'ta', 'hi'), // Western locales
          (firstName, lastName, middleName, locale) => {
            // Mock the useLanguage hook
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formatted = result.current.formatFullName(firstName, lastName, middleName);

            // For Western locales with middle name, expected format: "firstName middleName lastName"
            expect(formatted).toBe(`${firstName} ${middleName} ${lastName}`);
            
            // Verify order: given name, then middle name, then family name
            const firstNameIndex = formatted.indexOf(firstName);
            const middleNameIndex = formatted.indexOf(middleName);
            const lastNameIndex = formatted.indexOf(lastName);
            
            expect(firstNameIndex).toBeLessThan(middleNameIndex);
            expect(middleNameIndex).toBeLessThan(lastNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: internationalization-improvements
   * Property 21: Formal name includes title
   * Validates: Requirements 8.6
   */
  describe('Property 21: Formal name includes title', () => {
    it('should prepend title to formatted full name', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }), // firstName
          fc.string({ minLength: 1, maxLength: 20 }), // lastName
          fc.string({ minLength: 1, maxLength: 10 }), // title
          fc.constantFrom('en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt-BR', 'ar', 'he'), // Various locales
          (firstName, lastName, title, locale) => {
            // Mock the useLanguage hook
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formalName = result.current.formatFormalName(firstName, lastName, title);
            const fullName = result.current.formatFullName(firstName, lastName);

            // Formal name should start with the title
            expect(formalName).toMatch(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} `));
            
            // Formal name should contain the full name after the title
            expect(formalName).toBe(`${title} ${fullName}`);
            
            // Title should appear before the full name
            const titleIndex = formalName.indexOf(title);
            const fullNameIndex = formalName.indexOf(fullName);
            expect(titleIndex).toBeLessThan(fullNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return full name without title when title is not provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }), // firstName
          fc.string({ minLength: 1, maxLength: 20 }), // lastName
          fc.constantFrom('en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt-BR', 'ar', 'he'), // Various locales
          (firstName, lastName, locale) => {
            // Mock the useLanguage hook
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formalName = result.current.formatFormalName(firstName, lastName);
            const fullName = result.current.formatFullName(firstName, lastName);

            // Without title, formal name should equal full name
            expect(formalName).toBe(fullName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect locale-specific name order even with title', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // firstName
          fc.uuid(), // lastName
          fc.uuid(), // title
          fc.constantFrom('ja', 'zh', 'zh-TW', 'ko'), // Asian locales
          (firstName, lastName, title, locale) => {
            // Mock the useLanguage hook
            (LanguageContext.useLanguage as any).mockReturnValue({
              currentLanguage: { code: locale }
            });

            const { result } = renderHook(() => useNameFormat());
            const formalName = result.current.formatFormalName(firstName, lastName, title);

            // For Asian locales, family name should still come before given name (after title)
            // Expected format: "title lastName firstName"
            expect(formalName).toBe(`${title} ${lastName} ${firstName}`);
            
            // Verify order: title, then family name, then given name
            const titleIndex = formalName.indexOf(title);
            const lastNameIndex = formalName.indexOf(lastName);
            const firstNameIndex = formalName.indexOf(firstName);
            
            expect(titleIndex).toBeLessThan(lastNameIndex);
            expect(lastNameIndex).toBeLessThan(firstNameIndex);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
