/**
 * Unit tests for translation helper utilities
 * 
 * Tests the translateWithParams function with specific examples and edge cases.
 */

import { describe, it, expect } from 'vitest';
import { translateWithParams } from '../translationHelpers';
import { TranslationKey } from '../../i18n/translations';

// Mock translation function for testing
const mockTranslations: Record<string, string> = {
  'shipping.freeShippingThreshold': 'Free shipping on orders over {amount}',
  'shipping.estimatedDelivery': 'Estimated delivery: {date}',
  'shipping.trackingNumber': 'Tracking number: {number}',
  'currency.priceRange': '{min} - {max}',
  'date.createdOn': 'Created on {date}',
  'test.multipleParams': 'Order {orderId} for {amount} will arrive on {date}',
  'test.noParams': 'This has no parameters',
};

const mockT = (key: TranslationKey): string => {
  return mockTranslations[key] || key;
};

describe('translateWithParams', () => {
  describe('single placeholder replacement', () => {
    it('should replace a single placeholder with a string value', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        { amount: '$50' }
      );
      expect(result).toBe('Free shipping on orders over $50');
    });

    it('should replace a single placeholder with a number value', () => {
      const result = translateWithParams(
        mockT,
        'shipping.trackingNumber' as TranslationKey,
        { number: 123456789 }
      );
      expect(result).toBe('Tracking number: 123456789');
    });

    it('should replace a single placeholder with a date string', () => {
      const result = translateWithParams(
        mockT,
        'shipping.estimatedDelivery' as TranslationKey,
        { date: 'December 25, 2024' }
      );
      expect(result).toBe('Estimated delivery: December 25, 2024');
    });
  });

  describe('multiple placeholder replacement', () => {
    it('should replace multiple placeholders in a single translation', () => {
      const result = translateWithParams(
        mockT,
        'currency.priceRange' as TranslationKey,
        { min: '$10', max: '$50' }
      );
      expect(result).toBe('$10 - $50');
    });

    it('should replace all placeholders when there are three or more', () => {
      const result = translateWithParams(
        mockT,
        'test.multipleParams' as TranslationKey,
        { orderId: '12345', amount: '$99.99', date: 'Dec 25' }
      );
      expect(result).toBe('Order 12345 for $99.99 will arrive on Dec 25');
    });
  });

  describe('missing parameters', () => {
    it('should leave placeholder unchanged when parameter is not provided', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        {}
      );
      expect(result).toBe('Free shipping on orders over {amount}');
    });

    it('should replace provided parameters and leave missing ones unchanged', () => {
      const result = translateWithParams(
        mockT,
        'currency.priceRange' as TranslationKey,
        { min: '$10' }
      );
      expect(result).toBe('$10 - {max}');
    });

    it('should handle partially missing parameters in multi-param translations', () => {
      const result = translateWithParams(
        mockT,
        'test.multipleParams' as TranslationKey,
        { orderId: '12345', date: 'Dec 25' }
      );
      expect(result).toBe('Order 12345 for {amount} will arrive on Dec 25');
    });
  });

  describe('edge cases', () => {
    it('should handle empty parameter object', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        {}
      );
      expect(result).toBe('Free shipping on orders over {amount}');
    });

    it('should handle translation with no placeholders', () => {
      const result = translateWithParams(
        mockT,
        'test.noParams' as TranslationKey,
        { unused: 'value' }
      );
      expect(result).toBe('This has no parameters');
    });

    it('should handle zero as a parameter value', () => {
      const result = translateWithParams(
        mockT,
        'shipping.trackingNumber' as TranslationKey,
        { number: 0 }
      );
      expect(result).toBe('Tracking number: 0');
    });

    it('should handle empty string as a parameter value', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        { amount: '' }
      );
      expect(result).toBe('Free shipping on orders over ');
    });

    it('should convert number parameters to strings', () => {
      const result = translateWithParams(
        mockT,
        'currency.priceRange' as TranslationKey,
        { min: 10, max: 50 }
      );
      expect(result).toBe('10 - 50');
    });

    it('should handle parameters with special characters', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        { amount: '$100.00 (USD)' }
      );
      expect(result).toBe('Free shipping on orders over $100.00 (USD)');
    });
  });

  describe('requirements validation', () => {
    it('validates requirement 7.1: provides translateWithParams utility function', () => {
      expect(typeof translateWithParams).toBe('function');
    });

    it('validates requirement 7.2: replaces placeholder tokens with parameter values', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        { amount: '$50' }
      );
      expect(result).not.toContain('{amount}');
      expect(result).toContain('$50');
    });

    it('validates requirement 7.3: handles multiple placeholders', () => {
      const result = translateWithParams(
        mockT,
        'test.multipleParams' as TranslationKey,
        { orderId: '123', amount: '$50', date: 'Dec 25' }
      );
      expect(result).not.toContain('{orderId}');
      expect(result).not.toContain('{amount}');
      expect(result).not.toContain('{date}');
      expect(result).toContain('123');
      expect(result).toContain('$50');
      expect(result).toContain('Dec 25');
    });

    it('validates requirement 7.4: leaves placeholders unchanged when parameter not found', () => {
      const result = translateWithParams(
        mockT,
        'shipping.freeShippingThreshold' as TranslationKey,
        { wrongParam: 'value' }
      );
      expect(result).toContain('{amount}');
    });
  });
});
