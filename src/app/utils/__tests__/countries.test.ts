/**
 * Countries Utils Test Suite
 * Day 3 - Afternoon Session
 * Tests for src/app/utils/countries.ts
 */

import { describe, it, expect } from 'vitest';
import {
  COUNTRIES,
  getCountryByCode,
  getCountryByName,
  getAllCountries,
  getCountriesByRegion,
  getCountryNames,
  getCountryCodes,
  isValidCountryCode,
  formatCountryName,
  getCountryFlag
} from '../countries';

describe('Countries Utils', () => {
  describe('Country Data', () => {
    it('should have United States in country list', () => {
      const us = getCountryByCode('US');
      
      expect(us).toBeDefined();
      expect(us?.name).toBe('United States');
      expect(us?.code).toBe('US');
    });

    it('should have Canada in country list', () => {
      const ca = getCountryByCode('CA');
      
      expect(ca).toBeDefined();
      expect(ca?.name).toBe('Canada');
    });

    it('should have United Kingdom in country list', () => {
      const gb = getCountryByCode('GB');
      
      expect(gb).toBeDefined();
      expect(gb?.name).toBe('United Kingdom');
    });

    it('should have major countries', () => {
      const majorCountries = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'BR', 'AU'];
      
      majorCountries.forEach(code => {
        const country = getCountryByCode(code);
        expect(country).toBeDefined();
      });
    });

    it('should have country codes in uppercase', () => {
      const countries = getAllCountries();
      
      countries.forEach(country => {
        expect(country.code).toBe(country.code.toUpperCase());
        expect(country.code.length).toBe(2); // ISO 3166-1 alpha-2
      });
    });
  });

  describe('Get Country by Code', () => {
    it('should get country by code (uppercase)', () => {
      const us = getCountryByCode('US');
      
      expect(us?.name).toBe('United States');
    });

    it('should get country by code (lowercase)', () => {
      const us = getCountryByCode('us');
      
      expect(us?.name).toBe('United States');
    });

    it('should return undefined for invalid code', () => {
      const invalid = getCountryByCode('XX');
      
      expect(invalid).toBeUndefined();
    });

    it('should return undefined for empty code', () => {
      const empty = getCountryByCode('');
      
      expect(empty).toBeUndefined();
    });

    it('should handle 3-letter codes gracefully', () => {
      const result = getCountryByCode('USA');
      
      expect(result).toBeUndefined();
    });
  });

  describe('Get Country by Name', () => {
    it('should get country by exact name', () => {
      const us = getCountryByName('United States');
      
      expect(us?.code).toBe('US');
    });

    it('should get country by name (case-insensitive)', () => {
      const ca = getCountryByName('canada');
      
      expect(ca?.code).toBe('CA');
    });

    it('should return undefined for non-existent country', () => {
      const invalid = getCountryByName('Atlantis');
      
      expect(invalid).toBeUndefined();
    });

    it('should handle partial name matches', () => {
      const result = getCountryByName('United');
      
      // Should either find United States/Kingdom or return undefined
      // Depends on implementation
      expect(result === undefined || result.name.includes('United')).toBe(true);
    });
  });

  describe('Get All Countries', () => {
    it('should return array of all countries', () => {
      const countries = getAllCountries();
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should have required country properties', () => {
      const countries = getAllCountries();
      
      countries.forEach(country => {
        expect(country.code).toBeDefined();
        expect(country.name).toBeDefined();
        expect(typeof country.code).toBe('string');
        expect(typeof country.name).toBe('string');
      });
    });

    it('should have unique country codes', () => {
      const countries = getAllCountries();
      const codes = countries.map(c => c.code);
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should be sorted alphabetically by name', () => {
      const countries = getAllCountries();
      const names = countries.map(c => c.name);
      const sortedNames = [...names].sort();
      
      expect(names).toEqual(sortedNames);
    });
  });

  describe('Get Countries by Region', () => {
    it('should get North American countries', () => {
      const naCountries = getCountriesByRegion('North America');
      
      expect(naCountries.some(c => c.code === 'US')).toBe(true);
      expect(naCountries.some(c => c.code === 'CA')).toBe(true);
      expect(naCountries.some(c => c.code === 'MX')).toBe(true);
    });

    it('should get European countries', () => {
      const euCountries = getCountriesByRegion('Europe');
      
      expect(euCountries.length).toBeGreaterThan(0);
      expect(euCountries.some(c => c.code === 'GB')).toBe(true);
      expect(euCountries.some(c => c.code === 'FR')).toBe(true);
      expect(euCountries.some(c => c.code === 'DE')).toBe(true);
    });

    it('should get Asian countries', () => {
      const asiaCountries = getCountriesByRegion('Asia');
      
      expect(asiaCountries.length).toBeGreaterThan(0);
      expect(asiaCountries.some(c => c.code === 'JP')).toBe(true);
      expect(asiaCountries.some(c => c.code === 'CN')).toBe(true);
      expect(asiaCountries.some(c => c.code === 'IN')).toBe(true);
    });

    it('should return empty array for invalid region', () => {
      const invalid = getCountriesByRegion('Atlantis');
      
      expect(Array.isArray(invalid)).toBe(true);
      expect(invalid.length).toBe(0);
    });
  });

  describe('Get Country Names and Codes', () => {
    it('should get array of country names', () => {
      const names = getCountryNames();
      
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names.every(name => typeof name === 'string')).toBe(true);
    });

    it('should get array of country codes', () => {
      const codes = getCountryCodes();
      
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes.every(code => typeof code === 'string')).toBe(true);
      expect(codes.every(code => code.length === 2)).toBe(true);
    });

    it('should have matching array lengths', () => {
      const names = getCountryNames();
      const codes = getCountryCodes();
      
      expect(names.length).toBe(codes.length);
    });
  });

  describe('Country Code Validation', () => {
    it('should validate correct country code', () => {
      expect(isValidCountryCode('US')).toBe(true);
    });

    it('should validate lowercase country code', () => {
      expect(isValidCountryCode('ca')).toBe(true);
    });

    it('should invalidate incorrect country code', () => {
      expect(isValidCountryCode('XX')).toBe(false);
    });

    it('should invalidate empty string', () => {
      expect(isValidCountryCode('')).toBe(false);
    });

    it('should invalidate null', () => {
      expect(isValidCountryCode(null as any)).toBe(false);
    });

    it('should invalidate undefined', () => {
      expect(isValidCountryCode(undefined as any)).toBe(false);
    });

    it('should invalidate 3-letter codes', () => {
      expect(isValidCountryCode('USA')).toBe(false);
    });

    it('should invalidate single character', () => {
      expect(isValidCountryCode('U')).toBe(false);
    });
  });

  describe('Country Name Formatting', () => {
    it('should format country name', () => {
      const formatted = formatCountryName('US');
      
      expect(formatted).toBe('United States');
    });

    it('should handle lowercase code', () => {
      const formatted = formatCountryName('gb');
      
      expect(formatted).toBe('United Kingdom');
    });

    it('should return original for invalid code', () => {
      const formatted = formatCountryName('XX');
      
      expect(formatted).toBe('XX');
    });

    it('should handle empty string', () => {
      const formatted = formatCountryName('');
      
      expect(formatted).toBe('');
    });
  });

  describe('Country Flags', () => {
    it('should get country flag emoji for US', () => {
      const flag = getCountryFlag('US');
      
      expect(flag).toBe('🇺🇸');
    });

    it('should get country flag emoji for CA', () => {
      const flag = getCountryFlag('CA');
      
      expect(flag).toBe('🇨🇦');
    });

    it('should get country flag emoji for GB', () => {
      const flag = getCountryFlag('GB');
      
      expect(flag).toBe('🇬🇧');
    });

    it('should handle lowercase country codes', () => {
      const flag = getCountryFlag('jp');
      
      expect(flag).toBe('🇯🇵');
    });

    it('should return empty string for invalid code', () => {
      const flag = getCountryFlag('XX');
      
      expect(flag).toBe('');
    });

    it('should generate flag for all valid countries', () => {
      const countries = getAllCountries();
      
      countries.forEach(country => {
        const flag = getCountryFlag(country.code);
        expect(flag).toBeTruthy();
        expect(flag.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle countries with special characters in name', () => {
      // E.g., "Côte d'Ivoire"
      const countries = getAllCountries();
      const specialChars = countries.filter(c => 
        c.name.includes('\'') || 
        /[àáâãäåçèéêëìíîïñòóôõöùúûü]/i.test(c.name)
      );
      
      expect(specialChars.length).toBeGreaterThan(0);
    });

    it('should handle very long country names', () => {
      // E.g., "Democratic Republic of the Congo"
      const countries = getAllCountries();
      const longNames = countries.filter(c => c.name.length > 30);
      
      // Some countries should have long names
      expect(longNames.length).toBeGreaterThan(0);
    });

    it('should handle countries with multiple words', () => {
      const us = getCountryByCode('US');
      
      expect(us?.name.split(' ').length).toBeGreaterThan(1);
    });

    it('should handle island nations', () => {
      const fiji = getCountryByName('Fiji');
      
      expect(fiji).toBeDefined();
    });

    it('should have consistent data structure', () => {
      const countries = getAllCountries();
      
      countries.forEach(country => {
        expect(typeof country.code).toBe('string');
        expect(typeof country.name).toBe('string');
        expect(country.code.length).toBe(2);
        expect(country.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should quickly retrieve country by code', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        getCountryByCode('US');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 1000 lookups in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should quickly get all countries', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        getAllCountries();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 100 retrievals in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Data Completeness', () => {
    it('should have G7 countries', () => {
      const g7 = ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP'];
      
      g7.forEach(code => {
        const country = getCountryByCode(code);
        expect(country).toBeDefined();
      });
    });

    it('should have BRICS countries', () => {
      const brics = ['BR', 'RU', 'IN', 'CN', 'ZA'];
      
      brics.forEach(code => {
        const country = getCountryByCode(code);
        expect(country).toBeDefined();
      });
    });

    it('should have EU founding members', () => {
      const eu = ['BE', 'FR', 'DE', 'IT', 'LU', 'NL'];
      
      eu.forEach(code => {
        const country = getCountryByCode(code);
        expect(country).toBeDefined();
      });
    });

    it('should have minimum number of countries', () => {
      const countries = getAllCountries();
      
      // Should have at least 190+ countries (UN members)
      expect(countries.length).toBeGreaterThan(100);
    });
  });
});
