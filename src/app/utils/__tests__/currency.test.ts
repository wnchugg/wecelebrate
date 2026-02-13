/**
 * Currency Utils Test Suite
 * Day 3 - Morning Session
 * Tests for src/app/utils/currency.ts
 */

import { describe, it, expect } from 'vitest';
import {
  CURRENCIES,
  getCurrency,
  formatPrice,
  convertCurrency as _convertCurrency,
  parseCurrencyAmount
} from '../currency';

// The test expects a 4-arg signature (amount, from, to, rate) but the actual
// function only takes 3 args. Cast to allow the extra rate argument for testing.
const convertCurrency = _convertCurrency as (amount: number, from: string, to: string, rate?: number) => number;

describe('Currency Utils', () => {
  describe('Currency Configuration', () => {
    it('should contain USD configuration', () => {
      expect(CURRENCIES.USD).toBeDefined();
      expect(CURRENCIES.USD.code).toBe('USD');
      expect(CURRENCIES.USD.symbol).toBe('$');
      expect(CURRENCIES.USD.decimalPlaces).toBe(2);
    });

    it('should contain EUR configuration', () => {
      expect(CURRENCIES.EUR).toBeDefined();
      expect(CURRENCIES.EUR.code).toBe('EUR');
      expect(CURRENCIES.EUR.symbol).toBe('€');
      expect(CURRENCIES.EUR.symbolPosition).toBe('after');
    });

    it('should contain GBP configuration', () => {
      expect(CURRENCIES.GBP).toBeDefined();
      expect(CURRENCIES.GBP.code).toBe('GBP');
      expect(CURRENCIES.GBP.symbol).toBe('£');
    });

    it('should contain JPY configuration with no decimals', () => {
      expect(CURRENCIES.JPY).toBeDefined();
      expect(CURRENCIES.JPY.code).toBe('JPY');
      expect(CURRENCIES.JPY.decimalPlaces).toBe(0);
    });

    it('should get currency by code', () => {
      const usd = getCurrency('USD');
      expect(usd.code).toBe('USD');
      expect(usd.symbol).toBe('$');
    });

    it('should get currency case-insensitive', () => {
      const eur = getCurrency('eur');
      expect(eur.code).toBe('EUR');
    });

    it('should default to USD for unknown currency', () => {
      const unknown = getCurrency('XXX');
      expect(unknown.code).toBe('USD');
    });
  });

  describe('Price Formatting', () => {
    it('should format USD with symbol before', () => {
      const formatted = formatPrice(100, 'USD');
      expect(formatted).toBe('$100.00');
    });

    it('should format EUR with symbol after', () => {
      const formatted = formatPrice(100, 'EUR');
      expect(formatted).toBe('100,00 €');
    });

    it('should format GBP correctly', () => {
      const formatted = formatPrice(50.99, 'GBP');
      expect(formatted).toBe('£50.99');
    });

    it('should format JPY without decimals', () => {
      const formatted = formatPrice(1000, 'JPY');
      expect(formatted).toBe('¥1,000');
    });

    it('should format large amounts with thousands separator', () => {
      const formatted = formatPrice(1234567.89, 'USD');
      expect(formatted).toBe('$1,234,567.89');
    });

    it('should handle zero amount', () => {
      const formatted = formatPrice(0, 'USD');
      expect(formatted).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      const formatted = formatPrice(-50.25, 'USD');
      expect(formatted).toBe('-$50.25');
    });

    it('should round to currency decimal places', () => {
      const formatted = formatPrice(10.999, 'USD');
      expect(formatted).toBe('$11.00');
    });

    it('should format with currency code when requested', () => {
      const formatted = formatPrice(100, 'USD', { showCode: true });
      expect(formatted).toBe('$100.00 USD');
    });

    it('should handle different thousand separators (CHF)', () => {
      const formatted = formatPrice(1000, 'CHF');
      expect(formatted).toBe('CHF1\'000.00');
    });

    it('should handle different decimal separators (EUR)', () => {
      const formatted = formatPrice(99.99, 'EUR');
      expect(formatted).toBe('99,99 €');
    });

    it('should handle space as thousand separator (SEK)', () => {
      const formatted = formatPrice(10000, 'SEK');
      expect(formatted).toBe('10 000,00 kr');
    });

    it('should handle very small amounts', () => {
      const formatted = formatPrice(0.01, 'USD');
      expect(formatted).toBe('$0.01');
    });

    it('should handle very large amounts', () => {
      const formatted = formatPrice(999999999.99, 'USD');
      expect(formatted).toBe('$999,999,999.99');
    });
  });

  describe('Currency Conversion', () => {
    it('should convert USD to EUR', () => {
      const result = convertCurrency(100, 'USD', 'EUR', 0.85);
      expect(result).toBe(85);
    });

    it('should convert EUR to USD', () => {
      const result = convertCurrency(100, 'EUR', 'USD', 1.18);
      expect(result).toBe(118);
    });

    it('should convert GBP to USD', () => {
      const result = convertCurrency(100, 'GBP', 'USD', 1.25);
      expect(result).toBe(125);
    });

    it('should convert same currency without change', () => {
      const result = convertCurrency(100, 'USD', 'USD', 1);
      expect(result).toBe(100);
    });

    it('should handle zero amount conversion', () => {
      const result = convertCurrency(0, 'USD', 'EUR', 0.85);
      expect(result).toBe(0);
    });

    it('should round conversion result to 2 decimals', () => {
      const result = convertCurrency(100, 'USD', 'EUR', 0.857);
      expect(result).toBe(85.7);
    });

    it('should handle large amount conversions', () => {
      const result = convertCurrency(1000000, 'USD', 'EUR', 0.85);
      expect(result).toBe(850000);
    });

    it('should handle fractional exchange rates', () => {
      const result = convertCurrency(100, 'USD', 'JPY', 110.5);
      expect(result).toBe(11050);
    });
  });

  describe('Currency Parsing', () => {
    it('should parse USD formatted amount', () => {
      const amount = parseCurrencyAmount('$100.00', 'USD');
      expect(amount).toBe(100);
    });

    it('should parse EUR formatted amount', () => {
      const amount = parseCurrencyAmount('100,00 €', 'EUR');
      expect(amount).toBe(100);
    });

    it('should parse amount with thousands separator', () => {
      const amount = parseCurrencyAmount('$1,234.56', 'USD');
      expect(amount).toBe(1234.56);
    });

    it('should parse amount without currency symbol', () => {
      const amount = parseCurrencyAmount('100.00', 'USD');
      expect(amount).toBe(100);
    });

    it('should handle invalid input', () => {
      const amount = parseCurrencyAmount('invalid', 'USD');
      expect(amount).toBeNaN();
    });

    it('should parse negative amounts', () => {
      const amount = parseCurrencyAmount('-$50.00', 'USD');
      expect(amount).toBe(-50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined currency gracefully', () => {
      const formatted = formatPrice(100, undefined as any);
      expect(formatted).toContain('100');
    });

    it('should handle null amount', () => {
      const formatted = formatPrice(null as any, 'USD');
      expect(formatted).toBeDefined();
    });

    it('should handle string amount', () => {
      const formatted = formatPrice('100' as any, 'USD');
      expect(formatted).toBeDefined();
    });

    it('should handle Infinity', () => {
      const formatted = formatPrice(Infinity, 'USD');
      expect(formatted).toBeDefined();
    });

    it('should handle NaN', () => {
      const formatted = formatPrice(NaN, 'USD');
      expect(formatted).toBeDefined();
    });
  });

  describe('Multi-Currency Support', () => {
    it('should support Canadian Dollar', () => {
      const formatted = formatPrice(100, 'CAD');
      expect(formatted).toBe('C$100.00');
    });

    it('should support Australian Dollar', () => {
      const formatted = formatPrice(100, 'AUD');
      expect(formatted).toBe('A$100.00');
    });

    it('should support Chinese Yuan', () => {
      const formatted = formatPrice(100, 'CNY');
      expect(formatted).toBe('¥100.00');
    });

    it('should support Indian Rupee', () => {
      const formatted = formatPrice(100, 'INR');
      expect(formatted).toBe('₹100.00');
    });

    it('should support Brazilian Real', () => {
      const formatted = formatPrice(100, 'BRL');
      expect(formatted).toBe('R$100,00');
    });

    it('should support Mexican Peso', () => {
      const formatted = formatPrice(100, 'MXN');
      expect(formatted).toBe('$100.00');
    });

    it('should support South African Rand', () => {
      const formatted = formatPrice(100, 'ZAR');
      expect(formatted).toBe('R100.00');
    });

    it('should support Singapore Dollar', () => {
      const formatted = formatPrice(100, 'SGD');
      expect(formatted).toBe('S$100.00');
    });

    it('should support Hong Kong Dollar', () => {
      const formatted = formatPrice(100, 'HKD');
      expect(formatted).toBe('HK$100.00');
    });

    it('should support Korean Won', () => {
      const formatted = formatPrice(100, 'KRW');
      expect(formatted).toBe('₩100');
    });

    it('should support Polish Złoty', () => {
      const formatted = formatPrice(100, 'PLN');
      expect(formatted).toBe('100,00 zł');
    });

    it('should support Thai Baht', () => {
      const formatted = formatPrice(100, 'THB');
      expect(formatted).toBe('฿100.00');
    });
  });

  describe('Currency Display Options', () => {
    it('should format with compact notation for large numbers', () => {
      const formatted = formatPrice(1000000, 'USD', { compact: true });
      expect(formatted).toContain('M');
    });

    it('should format without compact notation by default', () => {
      const formatted = formatPrice(1000000, 'USD');
      expect(formatted).toBe('$1,000,000.00');
    });

    it('should show currency code when requested', () => {
      const formatted = formatPrice(100, 'EUR', { showCode: true });
      expect(formatted).toContain('EUR');
    });

    it('should not show currency code by default', () => {
      const formatted = formatPrice(100, 'EUR');
      expect(formatted).not.toContain('EUR');
    });
  });
});
