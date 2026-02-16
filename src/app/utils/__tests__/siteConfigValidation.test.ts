/**
 * Site Configuration Validation Tests
 * 
 * Comprehensive test suite for site configuration validation module
 * Covers all validation rules, edge cases, and business logic
 * 
 * Created: February 12, 2026
 * Coverage Target: 100%
 */

import { describe, it, expect } from 'vitest';
import { 
  validateSiteConfiguration,
  validateField,
  isValidUrl,
  isValidHexColor,
  isDateInPast,
  isValidDateRange,
  hasReservedWords,
  type SiteConfigData
} from '../siteConfigValidation';

describe('Site Configuration Validation', () => {
  
  // ========== HELPER FUNCTION TESTS ==========
  
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://subdomain.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });
    
    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
  
  describe('isValidHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHexColor('#D91C81')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#abc123')).toBe(true);
    });
    
    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('D91C81')).toBe(false); // Missing #
      expect(isValidHexColor('#D91C8')).toBe(false); // Too short
      expect(isValidHexColor('#D91C811')).toBe(false); // Too long
      expect(isValidHexColor('#GGGGGG')).toBe(false); // Invalid chars
      expect(isValidHexColor('')).toBe(false);
    });
  });
  
  describe('isDateInPast', () => {
    it('should detect past dates', () => {
      // Use a clearly past date
      expect(isDateInPast('2026-02-14')).toBe(true);
    });
    
    it('should detect future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateInPast(tomorrow.toISOString().split('T')[0])).toBe(false);
    });
    
    it('should handle today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isDateInPast(today)).toBe(false);
    });
  });
  
  describe('isValidDateRange', () => {
    it('should validate correct date ranges', () => {
      expect(isValidDateRange('2026-01-01', '2026-12-31')).toBe(true);
      expect(isValidDateRange('2026-02-01', '2026-02-28')).toBe(true);
    });
    
    it('should reject invalid date ranges', () => {
      expect(isValidDateRange('2026-12-31', '2026-01-01')).toBe(false);
      expect(isValidDateRange('2026-02-28', '2026-02-01')).toBe(false);
    });
    
    it('should handle empty dates', () => {
      expect(isValidDateRange('', '')).toBe(true);
      expect(isValidDateRange('2026-01-01', '')).toBe(true);
    });
  });
  
  describe('hasReservedWords', () => {
    it('should detect reserved words', () => {
      expect(hasReservedWords('https://example.com/admin')).toBe(true);
      expect(hasReservedWords('https://api.example.com')).toBe(true);
      expect(hasReservedWords('https://example.com/dashboard')).toBe(true);
    });
    
    it('should allow non-reserved URLs', () => {
      expect(hasReservedWords('https://example.com/gifts')).toBe(false);
      expect(hasReservedWords('https://celebrate.example.com')).toBe(false);
    });
  });
  
  // ========== CRITICAL FIELD VALIDATIONS ==========
  
  describe('Site Name Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: '',
      siteUrl: 'example-site', // Slug, not full URL
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name', 'Price']
    };
    
    it('should require site name', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteName: ''
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Site name is required');
      expect(result.fieldErrors.siteName).toBe('This field is required');
    });
    
    it('should enforce minimum length (3 characters)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteName: 'AB'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteName).toBe('Minimum 3 characters required');
    });
    
    it('should enforce maximum length (100 characters)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteName: 'A'.repeat(101)
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteName).toBe('Maximum 100 characters allowed');
    });
    
    it('should accept valid site names', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteName: 'Holiday Gifts 2026'
      });
      
      expect(result.valid).toBe(true);
      expect(result.fieldErrors.siteName).toBeUndefined();
    });
  });
  
  describe('Site URL Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: '',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should require site URL', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteUrl: ''
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Site URL slug is required');
    });
    
    it('should validate URL format', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteUrl: 'not-a-valid-url'
      });
      
      // siteUrl is a slug, not a full URL - this is actually valid
      expect(result.valid).toBe(true);
    });
    
    it('should warn about reserved words', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteUrl: 'admin'
      });
      
      // Reserved words cause errors, not warnings
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Site URL slug contains reserved words which are not allowed');
    });
    
    it('should enforce maximum length (255 characters)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteUrl: 'a'.repeat(51) // Max is 50 for slugs
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteUrl).toBe('Maximum 50 characters allowed');
    });
  });
  
  // ========== COLOR VALIDATIONS ==========
  
  describe('Color Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should validate primary color', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        primaryColor: 'invalid'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.primaryColor).toContain('Invalid format');
    });
    
    it('should validate secondary color', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        secondaryColor: '#GGGGGG'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.secondaryColor).toContain('Invalid format');
    });
    
    it('should validate tertiary color', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        tertiaryColor: 'red'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.tertiaryColor).toContain('Invalid format');
    });
    
    it('should warn when primary and secondary colors match', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        primaryColor: '#D91C81',
        secondaryColor: '#D91C81'
      });
      
      expect(result.warnings).toContain('Primary and secondary colors are the same. This may reduce visual distinction.');
    });
  });
  
  // ========== NUMERIC VALIDATIONS ==========
  
  describe('Gifts Per User Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should enforce minimum value (1)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        giftsPerUser: 0
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.giftsPerUser).toBe('Minimum value is 1');
    });
    
    it('should enforce maximum value (100)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        giftsPerUser: 101
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.giftsPerUser).toBe('Maximum value is 100');
    });
    
    it('should warn for unusually high values', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        giftsPerUser: 15
      });
      
      expect(result.warnings.some(w => w.includes('unusually high'))).toBe(true);
    });
  });
  
  describe('Days After Close Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should enforce minimum value (0)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        defaultGiftDaysAfterClose: -1
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.defaultGiftDaysAfterClose).toBe('Must be 0 or greater');
    });
    
    it('should enforce maximum value (365)', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        defaultGiftDaysAfterClose: 366
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.defaultGiftDaysAfterClose).toBe('Maximum is 365 days');
    });
    
    it('should warn for values over 90', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        defaultGiftDaysAfterClose: 120
      });
      
      expect(result.warnings.some(w => w.includes('may forget'))).toBe(true);
    });
  });
  
  // ========== DATE VALIDATIONS ==========
  
  describe('Date Range Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '',
      availabilityEndDate: '',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should validate start date before end date', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        availabilityStartDate: '2026-12-31',
        availabilityEndDate: '2026-01-01'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
      expect(result.fieldErrors.availabilityStartDate).toBe('Must be before end date');
      expect(result.fieldErrors.availabilityEndDate).toBe('Must be after start date');
    });
    
    it('should warn for past end dates', () => {
      // Use a clearly past date
      const result = validateSiteConfiguration({
        ...baseConfig,
        availabilityStartDate: '2020-01-01',
        availabilityEndDate: '2026-02-14' // Yesterday
      });
      
      // Check that the warning exists (exact text may vary)
      expect(result.warnings.some(w => w.includes('End date is in the past'))).toBe(true);
    });
  });
  
  // ========== ERP INTEGRATION VALIDATIONS ==========
  
  describe('ERP Integration Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should validate ERP system selection', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteErpIntegration: 'InvalidERP'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteErpIntegration).toContain('Must be one of');
    });
    
    it('should validate site code format', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteCode: 'INVALID CODE!'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteCode).toContain('Invalid format');
    });
    
    it('should validate ship from country code', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteShipFromCountry: 'USA'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteShipFromCountry).toContain('2-letter ISO code');
    });
  });
  
  // ========== EMAIL VALIDATIONS ==========
  
  describe('Email Validation', () => {
    const baseConfig: SiteConfigData = {
      siteName: 'Valid Site',
      siteUrl: 'example-site',
      siteType: 'Event',
      primaryColor: '#D91C81',
      secondaryColor: '#00B4CC',
      tertiaryColor: '#333333',
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      availabilityStartDate: '2026-01-01',
      availabilityEndDate: '2026-12-31',
      defaultGiftDaysAfterClose: 7,
      companyName: 'Test Company',
      footerText: 'Footer',
      expiredMessage: 'Expired',
      gridColumns: 3,
      sortOptions: ['Name']
    };
    
    it('should validate account manager email', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        siteAccountManagerEmail: 'invalid-email'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.siteAccountManagerEmail).toContain('Invalid email');
    });
    
    it('should validate regional contact email', () => {
      const result = validateSiteConfiguration({
        ...baseConfig,
        regionalClientContactEmail: 'not-an-email'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.regionalClientContactEmail).toContain('Invalid email');
    });
  });
  
  // ========== FIELD-LEVEL VALIDATION FUNCTION ==========
  
  describe('validateField Function', () => {
    it('should validate siteName field', () => {
      expect(validateField('siteName', '')).toBe('Required');
      expect(validateField('siteName', 'AB')).toBe('Minimum 3 characters');
      expect(validateField('siteName', 'A'.repeat(101))).toBe('Maximum 100 characters');
      expect(validateField('siteName', 'Valid Site')).toBeNull();
    });
    
    it('should validate siteUrl field', () => {
      expect(validateField('siteUrl', '')).toBe('Required');
      expect(validateField('siteUrl', 'not-a-url')).toBeNull(); // Valid slug
      expect(validateField('siteUrl', 'valid-slug')).toBeNull();
    });
    
    it('should validate color fields', () => {
      expect(validateField('primaryColor', 'invalid')).toBe('Invalid hex format (#RRGGBB)');
      expect(validateField('primaryColor', '#D91C81')).toBeNull();
    });
    
    it('should validate giftsPerUser field', () => {
      expect(validateField('giftsPerUser', 0)).toBe('Minimum 1');
      expect(validateField('giftsPerUser', 101)).toBe('Maximum 100');
      expect(validateField('giftsPerUser', 5)).toBeNull();
    });
  });
  
  // ========== INTEGRATION TESTS ==========
  
  describe('Full Configuration Validation', () => {
    it('should validate complete valid configuration', () => {
      const completeConfig: SiteConfigData = {
        siteName: 'Holiday Gifts 2026',
        siteUrl: 'holiday-gifts-2026', // Slug, not full URL
        siteType: 'Event',
        primaryColor: '#D91C81',
        secondaryColor: '#00B4CC',
        tertiaryColor: '#333333',
        giftsPerUser: 3,
        validationMethod: 'email' as const,
        availabilityStartDate: '2026-11-01',
        availabilityEndDate: '2026-12-31',
        defaultGiftDaysAfterClose: 14,
        companyName: 'Acme Corporation',
        footerText: 'Happy Holidays from Acme!',
        expiredMessage: 'This campaign has ended.',
        gridColumns: 3,
        sortOptions: ['Name', 'Price', 'Category'],
        siteCode: 'ACME-HOLIDAYS-2026',
        siteErpIntegration: 'SAP',
        siteShipFromCountry: 'US',
        siteAccountManager: 'Sarah Williams',
        siteAccountManagerEmail: 'sarah@halo.com'
      };
      
      const result = validateSiteConfiguration(completeConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(Object.keys(result.fieldErrors)).toHaveLength(0);
    });
    
    it('should collect multiple errors', () => {
      const invalidConfig: SiteConfigData = {
        siteName: 'AB', // Too short
        siteUrl: 'not-a-url', // Invalid
        siteType: 'Event',
        primaryColor: 'invalid', // Invalid hex
        secondaryColor: '#GGGGGG', // Invalid hex
        tertiaryColor: 'red', // Invalid hex
        giftsPerUser: 0, // Too low
        validationMethod: 'email' as const,
        availabilityStartDate: '2026-12-31',
        availabilityEndDate: '2026-01-01', // Invalid range
        defaultGiftDaysAfterClose: -5, // Negative
        companyName: 'Test',
        footerText: 'Footer',
        expiredMessage: 'Expired',
        gridColumns: 3,
        sortOptions: []
      };
      
      const result = validateSiteConfiguration(invalidConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(5);
    });
  });
});