/**
 * Catalog Validation Tests
 * Day 7 - Week 2: Business Logic Utils Testing
 * Target: 25 tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateCatalog,
  validateCatalogSource,
  validateCatalogSettings,
  CatalogValidationError,
} from '../catalog-validation';
import type { Catalog, CatalogSource, CatalogSettings } from '../../types/catalog';

describe('Catalog Validation', () => {
  const mockCatalogSource: CatalogSource = {
    type: 'api',
    sourceSystem: 'SAP',
    sourceId: 'SAP-001',
    apiConfig: {
      endpoint: 'https://api.example.com/catalog',
      authType: 'none',
      credentials: {},
      syncEndpoint: '',
    },
  };

  const mockCatalogSettings: CatalogSettings = {
    defaultCurrency: 'USD',
    priceMarkup: 10,
    autoSync: true,
    syncFrequency: 'daily',
    allowSiteOverrides: false,
    trackInventory: true,
  };

  describe('CatalogValidationError', () => {
    it('should create error with message', () => {
      const error = new CatalogValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('CatalogValidationError');
    });

    it('should create error with field', () => {
      const error = new CatalogValidationError('Test error', 'testField');
      expect(error.field).toBe('testField');
    });

    it('should create error with code', () => {
      const error = new CatalogValidationError('Test error', 'testField', 'TEST_CODE');
      expect(error.code).toBe('TEST_CODE');
    });
  });

  describe('validateCatalog', () => {
    it('should pass for valid catalog', () => {
      const catalog: Partial<Catalog> = {
        name: 'Test Catalog',
        type: 'erp',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).not.toThrow();
    });

    it('should throw for missing name', () => {
      const catalog: Partial<Catalog> = {
        type: 'erp',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow(CatalogValidationError);
      expect(() => validateCatalog(catalog)).toThrow('name is required');
    });

    it('should throw for empty name', () => {
      const catalog: Partial<Catalog> = {
        name: '   ',
        type: 'erp',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('name is required');
    });

    it('should throw for name too short', () => {
      const catalog: Partial<Catalog> = {
        name: 'AB',
        type: 'erp',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('minimum 3 characters');
    });

    it('should throw for name too long', () => {
      const catalog: Partial<Catalog> = {
        name: 'A'.repeat(101),
        type: 'erp',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('maximum 100 characters');
    });

    it('should throw for missing type', () => {
      const catalog: Partial<Catalog> = {
        name: 'Test Catalog',
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('type is required');
    });

    it('should throw for invalid type', () => {
      const catalog: Partial<Catalog> = {
        name: 'Test Catalog',
        type: 'invalid' as any,
        source: mockCatalogSource,
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('Invalid catalog type');
    });

    it('should accept valid catalog types', () => {
      const validTypes = ['erp', 'vendor', 'manual', 'dropship'];
      
      validTypes.forEach(type => {
        const catalog: Partial<Catalog> = {
          name: 'Test Catalog',
          type: type as any,
          source: mockCatalogSource,
          settings: mockCatalogSettings,
        };
        
        expect(() => validateCatalog(catalog)).not.toThrow();
      });
    });

    it('should throw for missing source', () => {
      const catalog: Partial<Catalog> = {
        name: 'Test Catalog',
        type: 'erp',
        settings: mockCatalogSettings,
      };

      expect(() => validateCatalog(catalog)).toThrow('source configuration is required');
    });

    it('should throw for missing settings', () => {
      const catalog: Partial<Catalog> = {
        name: 'Test Catalog',
        type: 'erp',
        source: mockCatalogSource,
      };

      expect(() => validateCatalog(catalog)).toThrow('settings are required');
    });
  });

  describe('validateCatalogSource', () => {
    it('should pass for valid source', () => {
      expect(() => validateCatalogSource(mockCatalogSource)).not.toThrow();
    });

    it('should throw for missing source type', () => {
      const source = { ...mockCatalogSource, type: undefined as any };
      expect(() => validateCatalogSource(source)).toThrow('Source type is required');
    });

    it('should throw for invalid source type', () => {
      const source = { ...mockCatalogSource, type: 'invalid' as any };
      expect(() => validateCatalogSource(source)).toThrow('Invalid source type');
    });

    it('should accept valid source types', () => {
      const validTypes = ['api', 'file', 'manual'];
      
      validTypes.forEach(type => {
        const source = { ...mockCatalogSource, type: type as any };
        expect(() => validateCatalogSource(source)).not.toThrow();
      });
    });

    it('should throw for missing sourceSystem', () => {
      const source = { ...mockCatalogSource, sourceSystem: '' };
      expect(() => validateCatalogSource(source)).toThrow('Source system name is required');
    });

    it('should throw for missing sourceId', () => {
      const source = { ...mockCatalogSource, sourceId: '' };
      expect(() => validateCatalogSource(source)).toThrow('Source ID is required');
    });

    it('should validate API endpoint for API sources', () => {
      const source: CatalogSource = {
        ...mockCatalogSource,
        type: 'api',
        apiConfig: {
          endpoint: '',
          authType: 'none',
          credentials: {},
          syncEndpoint: '',
        },
      };

      expect(() => validateCatalogSource(source)).toThrow('API endpoint is required');
    });

    it('should validate API endpoint URL format', () => {
      const source: CatalogSource = {
        ...mockCatalogSource,
        type: 'api',
        apiConfig: {
          endpoint: 'not-a-url',
          authType: 'none',
          credentials: {},
          syncEndpoint: '',
        },
      };

      expect(() => validateCatalogSource(source)).toThrow('Invalid API endpoint URL');
    });

    it('should validate sync endpoint URL if present', () => {
      const source: CatalogSource = {
        ...mockCatalogSource,
        type: 'api',
        apiConfig: {
          endpoint: 'https://api.example.com/catalog',
          authType: 'none',
          credentials: {},
          syncEndpoint: 'not-a-url',
        },
      };
      
      expect(() => validateCatalogSource(source)).toThrow('Invalid sync endpoint URL');
    });

    it('should validate file format for file sources', () => {
      const source: CatalogSource = {
        ...mockCatalogSource,
        type: 'file',
        fileConfig: {
          format: 'invalid' as any,
        },
      };
      
      expect(() => validateCatalogSource(source)).toThrow('Invalid file format');
    });

    it('should accept valid file formats', () => {
      const validFormats = ['csv', 'xlsx', 'json', 'xml'];
      
      validFormats.forEach(format => {
        const source: CatalogSource = {
          ...mockCatalogSource,
          type: 'file',
          fileConfig: {
            format: format as any,
          },
        };
        
        expect(() => validateCatalogSource(source)).not.toThrow();
      });
    });
  });

  describe('validateCatalogSettings', () => {
    it('should pass for valid settings', () => {
      expect(() => validateCatalogSettings(mockCatalogSettings)).not.toThrow();
    });

    it('should throw for missing currency', () => {
      const settings = { ...mockCatalogSettings, defaultCurrency: '' };
      expect(() => validateCatalogSettings(settings)).toThrow('Default currency is required');
    });

    it('should validate currency code format', () => {
      const settings = { ...mockCatalogSettings, defaultCurrency: 'US' };
      expect(() => validateCatalogSettings(settings)).toThrow('Invalid currency code');
    });

    it('should accept valid ISO 4217 currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
      
      validCurrencies.forEach(currency => {
        const settings = { ...mockCatalogSettings, defaultCurrency: currency };
        expect(() => validateCatalogSettings(settings)).not.toThrow();
      });
    });

    it('should throw for lowercase currency code', () => {
      const settings = { ...mockCatalogSettings, defaultCurrency: 'usd' };
      expect(() => validateCatalogSettings(settings)).toThrow('Invalid currency code');
    });

    it('should validate price markup type', () => {
      const settings = { ...mockCatalogSettings, priceMarkup: 'invalid' as any };
      expect(() => validateCatalogSettings(settings)).toThrow('Price markup must be a number');
    });

    it('should validate price markup range', () => {
      const settings = { ...mockCatalogSettings, priceMarkup: -5 };
      expect(() => validateCatalogSettings(settings)).toThrow('Price markup must be between 0 and 1000');
    });

    it('should reject price markup over 1000', () => {
      const settings = { ...mockCatalogSettings, priceMarkup: 1001 };
      expect(() => validateCatalogSettings(settings)).toThrow('Price markup must be between 0 and 1000');
    });

    it('should accept valid price markup', () => {
      const validMarkups = [0, 10, 50, 100, 1000];
      
      validMarkups.forEach(markup => {
        const settings = { ...mockCatalogSettings, priceMarkup: markup };
        expect(() => validateCatalogSettings(settings)).not.toThrow();
      });
    });

    it('should validate autoSync type', () => {
      const settings = { ...mockCatalogSettings, autoSync: 'true' as any };
      expect(() => validateCatalogSettings(settings)).toThrow('Auto sync setting must be a boolean');
    });

    it('should validate sync frequency', () => {
      const settings = { ...mockCatalogSettings, syncFrequency: 'invalid' as any };
      expect(() => validateCatalogSettings(settings)).toThrow('Invalid sync frequency');
    });

    it('should accept valid sync frequencies', () => {
      const validFrequencies = ['manual', 'hourly', 'daily', 'weekly'];
      
      validFrequencies.forEach(frequency => {
        const settings = { ...mockCatalogSettings, syncFrequency: frequency as any };
        expect(() => validateCatalogSettings(settings)).not.toThrow();
      });
    });

    it('should allow undefined priceMarkup', () => {
      const settings = { ...mockCatalogSettings, priceMarkup: undefined as number | undefined };
      expect(() => validateCatalogSettings(settings)).not.toThrow();
    });

    it('should allow null priceMarkup', () => {
      const settings = { ...mockCatalogSettings, priceMarkup: null as any };
      expect(() => validateCatalogSettings(settings)).not.toThrow();
    });
  });
});
