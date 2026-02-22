/**
 * Unit Tests for RTL Utilities
 * Feature: internationalization-improvements
 * 
 * These tests verify specific examples and edge cases for RTL detection.
 */

import { describe, it, expect } from 'vitest';
import { isRTL, getTextDirection, RTL_LANGUAGES } from '../rtl';

describe('RTL Utilities Unit Tests', () => {
  describe('isRTL', () => {
    /**
     * Requirement 9.2: When isRTL is called with Arabic language code, THE System SHALL return true
     */
    it('should return true for Arabic (ar)', () => {
      expect(isRTL('ar')).toBe(true);
    });

    /**
     * Requirement 9.3: When isRTL is called with Hebrew language code, THE System SHALL return true
     */
    it('should return true for Hebrew (he)', () => {
      expect(isRTL('he')).toBe(true);
    });

    /**
     * Requirement 9.4: When isRTL is called with any other language code, THE System SHALL return false
     */
    it('should return false for English', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('should return false for Spanish', () => {
      expect(isRTL('es')).toBe(false);
    });

    it('should return false for French', () => {
      expect(isRTL('fr')).toBe(false);
    });

    it('should return false for German', () => {
      expect(isRTL('de')).toBe(false);
    });

    it('should return false for Japanese', () => {
      expect(isRTL('ja')).toBe(false);
    });

    it('should return false for Chinese', () => {
      expect(isRTL('zh')).toBe(false);
    });

    it('should return false for Korean', () => {
      expect(isRTL('ko')).toBe(false);
    });

    it('should return false for Russian', () => {
      expect(isRTL('ru')).toBe(false);
    });

    it('should return false for Italian', () => {
      expect(isRTL('it')).toBe(false);
    });

    it('should return false for Portuguese', () => {
      expect(isRTL('pt')).toBe(false);
    });

    it('should return false for Polish', () => {
      expect(isRTL('pl')).toBe(false);
    });

    it('should return false for Hindi', () => {
      expect(isRTL('hi')).toBe(false);
    });

    it('should return false for Tamil', () => {
      expect(isRTL('ta')).toBe(false);
    });

    /**
     * Edge cases
     */
    it('should return false for empty string', () => {
      expect(isRTL('')).toBe(false);
    });

    it('should return false for undefined language code', () => {
      expect(isRTL(undefined as any)).toBe(false);
    });

    it('should return false for null language code', () => {
      expect(isRTL(null as any)).toBe(false);
    });

    it('should return false for invalid language code', () => {
      expect(isRTL('invalid')).toBe(false);
    });

    it('should be case-sensitive (uppercase AR should return false)', () => {
      expect(isRTL('AR')).toBe(false);
    });

    it('should be case-sensitive (uppercase HE should return false)', () => {
      expect(isRTL('HE')).toBe(false);
    });

    it('should return false for language codes with regions', () => {
      expect(isRTL('en-US')).toBe(false);
      expect(isRTL('es-MX')).toBe(false);
      expect(isRTL('fr-CA')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    /**
     * Requirement 9.6: When getTextDirection is called with an RTL language, THE System SHALL return 'rtl'
     */
    it('should return rtl for Arabic', () => {
      expect(getTextDirection('ar')).toBe('rtl');
    });

    it('should return rtl for Hebrew', () => {
      expect(getTextDirection('he')).toBe('rtl');
    });

    /**
     * Requirement 9.7: When getTextDirection is called with a non-RTL language, THE System SHALL return 'ltr'
     */
    it('should return ltr for English', () => {
      expect(getTextDirection('en')).toBe('ltr');
    });

    it('should return ltr for Spanish', () => {
      expect(getTextDirection('es')).toBe('ltr');
    });

    it('should return ltr for French', () => {
      expect(getTextDirection('fr')).toBe('ltr');
    });

    it('should return ltr for German', () => {
      expect(getTextDirection('de')).toBe('ltr');
    });

    it('should return ltr for Japanese', () => {
      expect(getTextDirection('ja')).toBe('ltr');
    });

    it('should return ltr for Chinese', () => {
      expect(getTextDirection('zh')).toBe('ltr');
    });

    it('should return ltr for Korean', () => {
      expect(getTextDirection('ko')).toBe('ltr');
    });

    it('should return ltr for Russian', () => {
      expect(getTextDirection('ru')).toBe('ltr');
    });

    it('should return ltr for Italian', () => {
      expect(getTextDirection('it')).toBe('ltr');
    });

    it('should return ltr for Portuguese', () => {
      expect(getTextDirection('pt')).toBe('ltr');
    });

    it('should return ltr for Polish', () => {
      expect(getTextDirection('pl')).toBe('ltr');
    });

    it('should return ltr for Hindi', () => {
      expect(getTextDirection('hi')).toBe('ltr');
    });

    it('should return ltr for Tamil', () => {
      expect(getTextDirection('ta')).toBe('ltr');
    });

    /**
     * Edge cases
     */
    it('should return ltr for empty string', () => {
      expect(getTextDirection('')).toBe('ltr');
    });

    it('should return ltr for undefined language code', () => {
      expect(getTextDirection(undefined as any)).toBe('ltr');
    });

    it('should return ltr for null language code', () => {
      expect(getTextDirection(null as any)).toBe('ltr');
    });

    it('should return ltr for invalid language code', () => {
      expect(getTextDirection('invalid')).toBe('ltr');
    });

    it('should be case-sensitive (uppercase AR should return ltr)', () => {
      expect(getTextDirection('AR')).toBe('ltr');
    });

    it('should be case-sensitive (uppercase HE should return ltr)', () => {
      expect(getTextDirection('HE')).toBe('ltr');
    });

    it('should return ltr for language codes with regions', () => {
      expect(getTextDirection('en-US')).toBe('ltr');
      expect(getTextDirection('es-MX')).toBe('ltr');
      expect(getTextDirection('fr-CA')).toBe('ltr');
    });

    /**
     * Consistency with isRTL
     */
    it('should be consistent with isRTL for Arabic', () => {
      const lang = 'ar';
      const isRtl = isRTL(lang);
      const direction = getTextDirection(lang);
      
      expect(isRtl).toBe(true);
      expect(direction).toBe('rtl');
    });

    it('should be consistent with isRTL for Hebrew', () => {
      const lang = 'he';
      const isRtl = isRTL(lang);
      const direction = getTextDirection(lang);
      
      expect(isRtl).toBe(true);
      expect(direction).toBe('rtl');
    });

    it('should be consistent with isRTL for English', () => {
      const lang = 'en';
      const isRtl = isRTL(lang);
      const direction = getTextDirection(lang);
      
      expect(isRtl).toBe(false);
      expect(direction).toBe('ltr');
    });
  });

  describe('RTL_LANGUAGES constant', () => {
    /**
     * Requirement 9.1: THE System SHALL provide an isRTL utility function that identifies RTL languages
     */
    it('should be an array', () => {
      expect(Array.isArray(RTL_LANGUAGES)).toBe(true);
    });

    it('should contain Arabic', () => {
      expect(RTL_LANGUAGES).toContain('ar');
    });

    it('should contain Hebrew', () => {
      expect(RTL_LANGUAGES).toContain('he');
    });

    it('should have exactly 2 elements', () => {
      expect(RTL_LANGUAGES).toHaveLength(2);
    });

    it('should only contain ar and he', () => {
      expect(RTL_LANGUAGES).toEqual(['ar', 'he']);
    });

    it('should be exported as a constant', () => {
      // The constant should be defined and accessible
      expect(RTL_LANGUAGES).toBeDefined();
      
      // It should be an array with the expected values
      expect(RTL_LANGUAGES).toEqual(['ar', 'he']);
    });
  });

  describe('Integration tests', () => {
    it('should correctly identify all RTL languages', () => {
      RTL_LANGUAGES.forEach((lang) => {
        expect(isRTL(lang)).toBe(true);
        expect(getTextDirection(lang)).toBe('rtl');
      });
    });

    it('should correctly identify common LTR languages', () => {
      const ltrLanguages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
        'hi', 'ta', 'pl', 'nl', 'sv', 'no', 'da', 'fi', 'tr', 'el'
      ];

      ltrLanguages.forEach((lang) => {
        expect(isRTL(lang)).toBe(false);
        expect(getTextDirection(lang)).toBe('ltr');
      });
    });

    it('should handle mixed case consistently', () => {
      // Lowercase should work
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('he')).toBe(true);

      // Uppercase should not work (case-sensitive)
      expect(isRTL('AR')).toBe(false);
      expect(isRTL('HE')).toBe(false);

      // Mixed case should not work
      expect(isRTL('Ar')).toBe(false);
      expect(isRTL('He')).toBe(false);
    });

    it('should handle language codes with regions', () => {
      // RTL languages with regions should still be detected as LTR
      // because we only check the exact code, not the base language
      expect(isRTL('ar-SA')).toBe(false);
      expect(isRTL('he-IL')).toBe(false);

      // LTR languages with regions should be LTR
      expect(isRTL('en-US')).toBe(false);
      expect(isRTL('en-GB')).toBe(false);
      expect(isRTL('es-MX')).toBe(false);
      expect(isRTL('fr-CA')).toBe(false);
    });
  });

  describe('Performance and consistency', () => {
    it('should return the same result for multiple calls', () => {
      const lang = 'ar';
      const result1 = isRTL(lang);
      const result2 = isRTL(lang);
      const result3 = isRTL(lang);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should be fast for repeated calls', () => {
      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        isRTL('ar');
        isRTL('en');
        getTextDirection('ar');
        getTextDirection('en');
      }

      const duration = Date.now() - start;

      // Should complete 4000 calls in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
