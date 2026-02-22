/**
 * Unit Tests for useNumberFormat Hook
 * Feature: internationalization-improvements
 * 
 * These tests verify specific examples and edge cases for number formatting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNumberFormat } from '../useNumberFormat';
import * as LanguageContext from '../../context/LanguageContext';

// Mock the LanguageContext
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useNumberFormat Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatNumber', () => {
    it('should format zero correctly', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatNumber(0)).toBe('0');
    });

    it('should format negative numbers correctly', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should format very large numbers correctly', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatNumber(999999999)).toBe('999,999,999');
    });

    it('should use en-US locale formatting', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      // en-US uses comma for thousands, period for decimals
      expect(result.current.formatNumber(1234.56)).toBe('1,234.56');
    });

    it('should use fr-FR locale formatting', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr-FR' }
      });

      const { result } = renderHook(() => useNumberFormat());
      // fr-FR uses space for thousands, comma for decimals
      const formatted = result.current.formatNumber(1234.56);
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('56');
    });

    it('should use de-DE locale formatting', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de-DE' }
      });

      const { result } = renderHook(() => useNumberFormat());
      // de-DE uses period for thousands, comma for decimals
      const formatted = result.current.formatNumber(1234.56);
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('56');
    });
  });

  describe('formatInteger', () => {
    it('should format zero as integer', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatInteger(0)).toBe('0');
    });

    it('should round decimals to nearest integer', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatInteger(1234.4)).toBe('1,234');
      expect(result.current.formatInteger(1234.5)).toBe('1,235');
      expect(result.current.formatInteger(1234.6)).toBe('1,235');
    });

    it('should format negative integers correctly', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatInteger(-1234.56)).toBe('-1,235');
    });

    it('should not include decimal places', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      const formatted = result.current.formatInteger(1234.99);
      expect(formatted).not.toMatch(/\./);
      expect(formatted).toBe('1,235');
    });
  });

  describe('formatDecimal', () => {
    it('should format with default 2 decimal places', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatDecimal(1234.5)).toBe('1,234.50');
    });

    it('should format with specified decimal places', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatDecimal(1234.5, 0)).toBe('1,235');
      expect(result.current.formatDecimal(1234.5, 1)).toBe('1,234.5');
      expect(result.current.formatDecimal(1234.5, 3)).toBe('1,234.500');
      expect(result.current.formatDecimal(1234.5, 4)).toBe('1,234.5000');
    });

    it('should round to specified decimal places', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatDecimal(1234.5678, 2)).toBe('1,234.57');
      expect(result.current.formatDecimal(1234.5678, 3)).toBe('1,234.568');
    });

    it('should format zero with decimal places', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatDecimal(0, 2)).toBe('0.00');
      expect(result.current.formatDecimal(0, 3)).toBe('0.000');
    });

    it('should format negative numbers with decimals', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatDecimal(-1234.5, 2)).toBe('-1,234.50');
    });
  });

  describe('formatPercent', () => {
    it('should format zero percent', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatPercent(0)).toBe('0.0%');
    });

    it('should format whole number percentages', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatPercent(50)).toBe('50.0%');
      expect(result.current.formatPercent(100)).toBe('100.0%');
    });

    it('should format decimal percentages', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatPercent(45.5)).toBe('45.5%');
      expect(result.current.formatPercent(12.3)).toBe('12.3%');
    });

    it('should round to 1 decimal place', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatPercent(45.56)).toBe('45.6%');
      expect(result.current.formatPercent(45.54)).toBe('45.5%');
    });

    it('should format very small percentages', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatPercent(0.1)).toBe('0.1%');
    });
  });

  describe('formatCompact', () => {
    it('should format thousands with K', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatCompact(1000)).toBe('1K');
      expect(result.current.formatCompact(5000)).toBe('5K');
      expect(result.current.formatCompact(12000)).toBe('12K');
    });

    it('should format millions with M', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatCompact(1000000)).toBe('1M');
      expect(result.current.formatCompact(5000000)).toBe('5M');
      expect(result.current.formatCompact(1234567)).toBe('1.2M');
    });

    it('should format billions with B', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatCompact(1000000000)).toBe('1B');
      expect(result.current.formatCompact(5000000000)).toBe('5B');
    });

    it('should format numbers less than 1000 without suffix', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatCompact(999)).toBe('999');
      expect(result.current.formatCompact(500)).toBe('500');
    });

    it('should format zero', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatCompact(0)).toBe('0');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid locale gracefully', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'invalid-locale' }
      });

      const { result } = renderHook(() => useNumberFormat());
      // Should not throw, should return some formatted value
      expect(() => result.current.formatNumber(1234)).not.toThrow();
    });
  });

  describe('Locale-specific formatting', () => {
    it('should format numbers correctly for en-US', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNumberFormat());
      expect(result.current.formatNumber(1234567.89)).toBe('1,234,567.89');
    });

    it('should format numbers correctly for fr-FR', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr-FR' }
      });

      const { result } = renderHook(() => useNumberFormat());
      const formatted = result.current.formatNumber(1234567.89);
      // fr-FR uses non-breaking space for thousands and comma for decimals
      expect(formatted).toMatch(/1[\s\u00A0]234[\s\u00A0]567[,.]89/);
    });

    it('should format numbers correctly for de-DE', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de-DE' }
      });

      const { result } = renderHook(() => useNumberFormat());
      const formatted = result.current.formatNumber(1234567.89);
      // de-DE uses period for thousands and comma for decimals
      expect(formatted).toMatch(/1\.234\.567,89/);
    });
  });
});
