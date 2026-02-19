/**
 * Unit tests for i18n configuration
 * 
 * Tests the DEFAULT_I18N_CONFIG constant and getI18nConfig utility function.
 * 
 * Requirements: 13.1-13.9
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_I18N_CONFIG, getI18nConfig } from '../i18n';
import type { I18nConfig } from '../../hooks/useSite';

describe('DEFAULT_I18N_CONFIG', () => {
  it('should have USD as default currency (Requirement 13.1)', () => {
    expect(DEFAULT_I18N_CONFIG.currency).toBe('USD');
  });

  it('should have symbol as default currency display format (Requirement 13.2)', () => {
    expect(DEFAULT_I18N_CONFIG.currencyDisplay).toBe('symbol');
  });

  it('should have 2 decimal places as default (Requirement 13.3)', () => {
    expect(DEFAULT_I18N_CONFIG.decimalPlaces).toBe(2);
  });

  it('should have America/New_York as default timezone (Requirement 13.4)', () => {
    expect(DEFAULT_I18N_CONFIG.timezone).toBe('America/New_York');
  });

  it('should have MDY as default date format (Requirement 13.5)', () => {
    expect(DEFAULT_I18N_CONFIG.dateFormat).toBe('MDY');
  });

  it('should have 12h as default time format (Requirement 13.6)', () => {
    expect(DEFAULT_I18N_CONFIG.timeFormat).toBe('12h');
  });

  it('should have western as default name order (Requirement 13.7)', () => {
    expect(DEFAULT_I18N_CONFIG.nameOrder).toBe('western');
  });

  it('should have casual as default name format (Requirement 13.8)', () => {
    expect(DEFAULT_I18N_CONFIG.nameFormat).toBe('casual');
  });

  it('should have all required fields defined', () => {
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('currency');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('currencyDisplay');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('decimalPlaces');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('timezone');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('dateFormat');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('timeFormat');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('nameOrder');
    expect(DEFAULT_I18N_CONFIG).toHaveProperty('nameFormat');
  });
});

describe('getI18nConfig', () => {
  it('should return DEFAULT_I18N_CONFIG when no site config provided (Requirement 13.9)', () => {
    const result = getI18nConfig();
    expect(result).toEqual(DEFAULT_I18N_CONFIG);
  });

  it('should return DEFAULT_I18N_CONFIG when undefined is provided (Requirement 13.9)', () => {
    const result = getI18nConfig(undefined);
    expect(result).toEqual(DEFAULT_I18N_CONFIG);
  });

  it('should merge partial site config with defaults (Requirement 13.9)', () => {
    const partialConfig: Partial<I18nConfig> = {
      currency: 'EUR',
      timezone: 'Europe/London',
    };

    const result = getI18nConfig(partialConfig);

    expect(result.currency).toBe('EUR');
    expect(result.timezone).toBe('Europe/London');
    // Other fields should use defaults
    expect(result.currencyDisplay).toBe('symbol');
    expect(result.decimalPlaces).toBe(2);
    expect(result.dateFormat).toBe('MDY');
    expect(result.timeFormat).toBe('12h');
    expect(result.nameOrder).toBe('western');
    expect(result.nameFormat).toBe('casual');
  });

  it('should override all defaults when full config provided (Requirement 13.9)', () => {
    const fullConfig: I18nConfig = {
      currency: 'JPY',
      currencyDisplay: 'code',
      decimalPlaces: 0,
      timezone: 'Asia/Tokyo',
      dateFormat: 'YMD',
      timeFormat: '24h',
      nameOrder: 'eastern',
      nameFormat: 'formal',
    };

    const result = getI18nConfig(fullConfig);

    expect(result).toEqual(fullConfig);
  });

  it('should handle empty object by using all defaults (Requirement 13.9)', () => {
    const result = getI18nConfig({});
    expect(result).toEqual(DEFAULT_I18N_CONFIG);
  });

  it('should handle null values in partial config by using defaults', () => {
    const partialConfig = {
      currency: 'GBP' as const,
      currencyDisplay: undefined,
      decimalPlaces: undefined,
    };

    const result = getI18nConfig(partialConfig);

    expect(result.currency).toBe('GBP');
    expect(result.currencyDisplay).toBe('symbol'); // Default
    expect(result.decimalPlaces).toBe(2); // Default
  });

  it('should preserve zero values (not treat as falsy)', () => {
    const partialConfig: Partial<I18nConfig> = {
      decimalPlaces: 0, // JPY uses 0 decimal places
    };

    const result = getI18nConfig(partialConfig);

    expect(result.decimalPlaces).toBe(0);
  });

  it('should handle all currency codes', () => {
    const currencies: Array<I18nConfig['currency']> = [
      'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MXN', 'BRL'
    ];

    currencies.forEach(currency => {
      const result = getI18nConfig({ currency });
      expect(result.currency).toBe(currency);
    });
  });

  it('should handle all currency display formats', () => {
    const displays: Array<I18nConfig['currencyDisplay']> = ['symbol', 'code', 'name'];

    displays.forEach(display => {
      const result = getI18nConfig({ currencyDisplay: display });
      expect(result.currencyDisplay).toBe(display);
    });
  });

  it('should handle all date formats', () => {
    const formats: Array<I18nConfig['dateFormat']> = ['MDY', 'DMY', 'YMD'];

    formats.forEach(format => {
      const result = getI18nConfig({ dateFormat: format });
      expect(result.dateFormat).toBe(format);
    });
  });

  it('should handle all time formats', () => {
    const formats: Array<I18nConfig['timeFormat']> = ['12h', '24h'];

    formats.forEach(format => {
      const result = getI18nConfig({ timeFormat: format });
      expect(result.timeFormat).toBe(format);
    });
  });

  it('should handle all name orders', () => {
    const orders: Array<I18nConfig['nameOrder']> = ['western', 'eastern'];

    orders.forEach(order => {
      const result = getI18nConfig({ nameOrder: order });
      expect(result.nameOrder).toBe(order);
    });
  });

  it('should handle all name formats', () => {
    const formats: Array<I18nConfig['nameFormat']> = ['formal', 'casual'];

    formats.forEach(format => {
      const result = getI18nConfig({ nameFormat: format });
      expect(result.nameFormat).toBe(format);
    });
  });
});
