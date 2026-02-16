/**
 * Config Import/Export Tests
 * Day 7 - Week 2: Business Logic Utils Testing
 * Target: 18 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  exportGlobalConfiguration,
  exportClientConfiguration,
  importConfiguration,
  exportSiteConfiguration,
  parseImportData,
  type ExportData,
} from '../configImportExport';
import type { GlobalConfig } from '../../config/globalConfig';
import type { Client, Site } from '../../context/SiteContext';

describe('Config Import/Export', () => {
  let mockGlobalConfig: GlobalConfig;
  let mockClient: Client;
  let mockSite: Site;
  let mockSites: Site[];

  beforeEach(() => {
    // Mock Date to have consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));

    mockGlobalConfig = {
      version: '2.0.0',
      applicationName: 'Test App',
      companyName: 'Test Company',
      supportEmail: 'support@test.com',
      defaultLanguage: 'en',
    } as unknown as GlobalConfig;

    mockClient = {
      id: 'client-1',
      name: 'Test Client',
      slug: 'test-client',
    } as unknown as Client;

    mockSite = {
      id: 'site-1',
      clientId: 'client-1',
      name: 'Test Site',
      subdomain: 'test-site',
      settings: {},
    } as unknown as Site;

    mockSites = [
      mockSite,
      {
        id: 'site-2',
        clientId: 'client-1',
        name: 'Another Site',
        subdomain: 'another-site',
        settings: {},
      } as unknown as Site,
      {
        id: 'site-3',
        clientId: 'client-2',
        name: 'Other Client Site',
        subdomain: 'other-site',
        settings: {},
      } as unknown as Site,
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('exportGlobalConfiguration', () => {
    it('should export global configuration as JSON string', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include export type', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.type).toBe('global');
    });

    it('should include version', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.version).toBe('2.0.0');
    });

    it('should include exportedAt timestamp', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedAt).toBe('2026-02-15T12:00:00.000Z');
    });

    it('should include exportedBy if provided', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig, 'admin@test.com');
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBe('admin@test.com');
    });

    it('should not include exportedBy if not provided', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBeUndefined();
    });

    it('should include global config data', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.data.global).toEqual(mockGlobalConfig);
    });

    it('should format JSON with indentation', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      
      expect(result).toContain('\n');
      expect(result).toContain('  '); // 2-space indentation
    });
  });

  describe('exportClientConfiguration', () => {
    it('should export client configuration as JSON string', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include export type', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.type).toBe('client');
    });

    it('should include version', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.version).toBe('2.0.0');
    });

    it('should include exportedAt timestamp', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedAt).toBe('2026-02-15T12:00:00.000Z');
    });

    it('should include exportedBy if provided', () => {
      const result = exportClientConfiguration(mockClient, mockSites, 'admin@test.com');
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBe('admin@test.com');
    });

    it('should not include exportedBy if not provided', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBeUndefined();
    });

    it('should include client and site data', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.data.clients).toEqual([mockClient]);
      // Only includes sites for this client
      expect(parsed.data.sites).toHaveLength(2);
      expect(parsed.data.sites?.every(s => s.clientId === mockClient.id)).toBe(true);
    });

    it('should format JSON with indentation', () => {
      const result = exportClientConfiguration(mockClient, mockSites);
      
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should handle sites with complex settings', () => {
      const complexSites = [
        {
          ...mockSite,
          settings: {
            theme: 'dark',
            features: ['feature1', 'feature2'],
            nested: { key: 'value' },
          },
        },
        {
          id: 'site-2',
          clientId: 'client-1',
          name: 'Another Site',
          subdomain: 'another-site',
          settings: {},
        } as unknown as Site,
        {
          id: 'site-3',
          clientId: 'client-2',
          name: 'Other Client Site',
          subdomain: 'other-site',
          settings: {},
        } as unknown as Site,
      ];

      const result = exportClientConfiguration(mockClient, complexSites as Site[]);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.data.sites?.[0].settings).toEqual(complexSites[0].settings);
    });
  });

  describe('importConfiguration', () => {
    it('should import global configuration from JSON string', () => {
      const exportResult = exportGlobalConfiguration(mockGlobalConfig);
      const importResult = importConfiguration(exportResult);
      
      expect(importResult.success).toBe(true);
      expect(importResult.imported?.global).toBe(true);
    });

    it('should handle invalid JSON string', () => {
      const invalidJson = 'invalid json string';
      const importResult = importConfiguration(invalidJson);
      
      expect(importResult.success).toBe(false);
      expect(importResult.errors).toBeDefined();
    });

    it('should handle missing data', () => {
      const exportResult = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(exportResult);
      delete parsed.data.global;
      const importResult = importConfiguration(JSON.stringify(parsed));
      
      expect(importResult.success).toBe(false);
      expect(importResult.errors).toContain('Global configuration data is missing');
    });

    it('should handle incorrect type', () => {
      const exportResult = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(exportResult);
      parsed.type = 'client';
      const importResult = importConfiguration(JSON.stringify(parsed));
      
      expect(importResult.success).toBe(false);
      expect(importResult.errors).toContain('Client configuration data is missing');
    });

    it('should handle incorrect version', () => {
      const exportResult = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(exportResult);
      parsed.version = '1.0.0';
      const importResult = importConfiguration(JSON.stringify(parsed));
      
      // Version is not validated - import succeeds but may have warnings
      expect(importResult.success).toBe(true);
    });
  });

  describe('exportSiteConfiguration', () => {
    it('should export site configuration as JSON string', () => {
      const result = exportSiteConfiguration(mockSite);
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include export type', () => {
      const result = exportSiteConfiguration(mockSite);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.type).toBe('site');
    });

    it('should include site data', () => {
      const result = exportSiteConfiguration(mockSite);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.data.sites).toHaveLength(1);
      expect(parsed.data.sites?.[0]).toEqual(mockSite);
    });

    it('should include exportedBy if provided', () => {
      const result = exportSiteConfiguration(mockSite, 'admin@test.com');
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBe('admin@test.com');
    });

    it('should not include exportedBy if not provided', () => {
      const result = exportSiteConfiguration(mockSite);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.exportedBy).toBeUndefined();
    });

    it('should include version and timestamp', () => {
      const result = exportSiteConfiguration(mockSite);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.version).toBe('2.0.0');
      expect(parsed.exportedAt).toBe('2026-02-15T12:00:00.000Z');
    });

    it('should format JSON with indentation', () => {
      const result = exportSiteConfiguration(mockSite);
      
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should handle site with complex settings', () => {
      const complexSite = {
        ...mockSite,
        settings: {
          theme: 'dark',
          features: ['feature1', 'feature2'],
          nested: { key: 'value' },
        },
      };

      const result = exportSiteConfiguration(complexSite as unknown as Site);
      const parsed: ExportData = JSON.parse(result);
      
      expect(parsed.data.sites?.[0].settings).toEqual(complexSite.settings);
    });
  });

  describe('parseImportData', () => {
    it('should parse valid JSON string', () => {
      const exportResult = exportGlobalConfiguration(mockGlobalConfig);
      const parsed = parseImportData(exportResult);
      
      expect(parsed).toEqual(JSON.parse(exportResult));
    });

    it('should handle invalid JSON string', () => {
      const invalidJson = 'invalid json string';
      const parsed = parseImportData(invalidJson);
      
      expect(parsed).toBeNull();
    });
  });

  describe('Export Data Structure', () => {
    it('should have consistent structure across all export types', () => {
      const globalExport = JSON.parse(exportGlobalConfiguration(mockGlobalConfig));
      const clientExport = JSON.parse(exportClientConfiguration(mockClient, mockSites));
      const siteExport = JSON.parse(exportSiteConfiguration(mockSite));

      const exports = [globalExport, clientExport, siteExport];

      exports.forEach(exp => {
        expect(exp).toHaveProperty('type');
        expect(exp).toHaveProperty('version');
        expect(exp).toHaveProperty('exportedAt');
        expect(exp).toHaveProperty('data');
      });
    });

    it('should use same version for all exports', () => {
      const globalExport = JSON.parse(exportGlobalConfiguration(mockGlobalConfig));
      const clientExport = JSON.parse(exportClientConfiguration(mockClient, mockSites));
      const siteExport = JSON.parse(exportSiteConfiguration(mockSite));

      expect(globalExport.version).toBe('2.0.0');
      expect(clientExport.version).toBe('2.0.0');
      expect(siteExport.version).toBe('2.0.0');
    });

    it('should have valid ISO date timestamps', () => {
      const result = exportGlobalConfiguration(mockGlobalConfig);
      const parsed: ExportData = JSON.parse(result);
      
      const date = new Date(parsed.exportedAt);
      expect(date.toISOString()).toBe(parsed.exportedAt);
    });
  });
});