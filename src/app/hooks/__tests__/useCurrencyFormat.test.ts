/**
 * useCurrencyFormat Hook Test Suite
 * Tests for src/app/hooks/useCurrencyFormat.ts
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrencyFormat } from '../useCurrencyFormat';
import { useCurrency } from '../../components/CurrencyDisplay';

// Mock the useCurrency hook
vi.mock('../../components/CurrencyDisplay', () => ({
  useCurrency: vi.fn()
}));

describe('useCurrencyFormat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return currency code', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.currency).toBe('USD');
    });

    it('should return currency symbol', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('$');
    });

    it('should format price correctly', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(100)).toBe('$100.00');
    });

    it('should format price range correctly', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatRange(50, 100)).toBe('$50.00 - $100.00');
    });
  });

  describe('Currency Symbols', () => {
    it('should return correct symbol for USD', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('$');
    });

    it('should return correct symbol for EUR', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'EUR',
        format: (amount: number) => `€${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('€');
    });

    it('should return correct symbol for GBP', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'GBP',
        format: (amount: number) => `£${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('£');
    });

    it('should return correct symbol for JPY', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'JPY',
        format: (amount: number) => `¥${Math.round(amount)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('¥');
    });

    it('should return correct symbol for CNY', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'CNY',
        format: (amount: number) => `¥${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('¥');
    });

    it('should return correct symbol for INR', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'INR',
        format: (amount: number) => `₹${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('₹');
    });

    it('should return correct symbol for CAD', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'CAD',
        format: (amount: number) => `CA$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('CA$');
    });

    it('should return correct symbol for AUD', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'AUD',
        format: (amount: number) => `A$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('A$');
    });

    it('should return correct symbol for MXN', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'MXN',
        format: (amount: number) => `MX$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('MX$');
    });

    it('should return correct symbol for BRL', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'BRL',
        format: (amount: number) => `R$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('R$');
    });

    it('should return currency code for unknown currency', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'XYZ',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.symbol).toBe('XYZ');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(0)).toBe('$0.00');
    });

    it('should handle negative amount', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(-50)).toBe('$-50.00');
    });

    it('should handle very large amount', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(999999999.99)).toBe('$999999999.99');
    });

    it('should handle decimal amounts', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(99.99)).toBe('$99.99');
    });

    it('should handle range with same min and max', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatRange(100, 100)).toBe('$100.00 - $100.00');
    });

    it('should handle range with min greater than max', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Hook doesn't validate order, just formats both values
      expect(result.current.formatRange(100, 50)).toBe('$100.00 - $50.00');
    });
  });

  describe('Site ID Override', () => {
    it('should pass siteId to useCurrency', () => {
      const mockUseCurrency = vi.fn().mockReturnValue({
        currency: 'GBP',
        format: (amount: number) => `£${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });
      (useCurrency as any).mockImplementation(mockUseCurrency);

      renderHook(() => useCurrencyFormat('uk-site'));

      expect(mockUseCurrency).toHaveBeenCalledWith('uk-site');
    });

    it('should use different currency for different sites', () => {
      // First site - USD
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result: result1 } = renderHook(() => useCurrencyFormat('us-site'));
      expect(result1.current.currency).toBe('USD');
      expect(result1.current.symbol).toBe('$');

      // Second site - EUR
      (useCurrency as any).mockReturnValue({
        currency: 'EUR',
        format: (amount: number) => `€${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result: result2 } = renderHook(() => useCurrencyFormat('eu-site'));
      expect(result2.current.currency).toBe('EUR');
      expect(result2.current.symbol).toBe('€');
    });
  });

  describe('Integration with useCurrency', () => {
    it('should use format function from useCurrency', () => {
      const mockFormat = vi.fn((amount: number) => `$${amount.toFixed(2)}`);
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: mockFormat,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());
      result.current.formatPrice(100);

      expect(mockFormat).toHaveBeenCalledWith(100);
    });

    it('should use format function for both range values', () => {
      const mockFormat = vi.fn((amount: number) => `$${amount.toFixed(2)}`);
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: mockFormat,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());
      result.current.formatRange(50, 100);

      expect(mockFormat).toHaveBeenCalledWith(50);
      expect(mockFormat).toHaveBeenCalledWith(100);
      expect(mockFormat).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases - Advanced', () => {
    it('should handle very small decimal amounts', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(0.01)).toBe('$0.01');
      expect(result.current.formatPrice(0.001)).toBe('$0.00');
      expect(result.current.formatPrice(0.99)).toBe('$0.99');
    });

    it('should handle negative decimal amounts', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(-0.01)).toBe('$-0.01');
      expect(result.current.formatPrice(-99.99)).toBe('$-99.99');
    });

    it('should handle extremely large numbers', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(Number.MAX_SAFE_INTEGER)).toBe(`$${Number.MAX_SAFE_INTEGER.toFixed(2)}`);
      expect(result.current.formatPrice(1e15)).toBe('$1000000000000000.00');
    });

    it('should handle floating point precision edge cases', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Common floating point precision issues
      expect(result.current.formatPrice(0.1 + 0.2)).toBe('$0.30');
      // Note: 1.005 and 1.015 round down due to floating point representation
      expect(result.current.formatPrice(1.005)).toBe('$1.00');
      expect(result.current.formatPrice(1.016)).toBe('$1.02');
    });

    it('should handle zero-decimal currencies (JPY) with large numbers', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'JPY',
        format: (amount: number) => `¥${Math.round(amount).toLocaleString()}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatPrice(1000000)).toContain('1,000,000');
      expect(result.current.formatPrice(0)).toContain('0');
      expect(result.current.formatPrice(999999999)).toContain('999,999,999');
    });

    it('should handle negative ranges', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatRange(-100, -50)).toBe('$-100.00 - $-50.00');
      expect(result.current.formatRange(-50, 50)).toBe('$-50.00 - $50.00');
    });

    it('should handle zero in ranges', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatRange(0, 100)).toBe('$0.00 - $100.00');
      expect(result.current.formatRange(-100, 0)).toBe('$-100.00 - $0.00');
      expect(result.current.formatRange(0, 0)).toBe('$0.00 - $0.00');
    });

    it('should handle very large ranges', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'USD',
        format: (amount: number) => `$${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      expect(result.current.formatRange(1000000, 9999999)).toBe('$1000000.00 - $9999999.00');
    });
  });

  describe('Invalid Currency Code Fallback', () => {
    it('should fallback to currency code for unknown currency symbols', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'XYZ',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should return the currency code itself as the symbol
      expect(result.current.symbol).toBe('XYZ');
      expect(result.current.currency).toBe('XYZ');
    });

    it('should handle invalid currency code gracefully', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'INVALID',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should still format the price, using currency code as symbol
      expect(result.current.formatPrice(100)).toBe('100.00');
      expect(result.current.symbol).toBe('INVALID');
    });

    it('should handle empty currency code', () => {
      (useCurrency as any).mockReturnValue({
        currency: '',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should return empty string as symbol
      expect(result.current.symbol).toBe('');
      expect(result.current.currency).toBe('');
    });

    it('should handle undefined currency code', () => {
      (useCurrency as any).mockReturnValue({
        currency: undefined,
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should return undefined as symbol (fallback behavior)
      expect(result.current.symbol).toBeUndefined();
      expect(result.current.currency).toBeUndefined();
    });

    it('should format with unknown currency in ranges', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'ABC',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should still format the range correctly
      expect(result.current.formatRange(50, 100)).toBe('50.00 - 100.00');
      expect(result.current.symbol).toBe('ABC');
    });

    it('should handle special characters in currency code', () => {
      (useCurrency as any).mockReturnValue({
        currency: 'US$',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should return the currency code as-is
      expect(result.current.symbol).toBe('US$');
      expect(result.current.currency).toBe('US$');
    });

    it('should handle numeric currency code', () => {
      (useCurrency as any).mockReturnValue({
        currency: '123',
        format: (amount: number) => `${amount.toFixed(2)}`,
        convert: (amount: number) => amount
      });

      const { result } = renderHook(() => useCurrencyFormat());

      // Should return the numeric code as symbol
      expect(result.current.symbol).toBe('123');
      expect(result.current.currency).toBe('123');
    });
  });
});
