/**
 * API Utils Test Suite
 * Day 2 - Morning Session
 * Tests for src/app/utils/api.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  apiRequest,
  giftApi,
  siteApi,
  clientApi,
  setAccessToken,
  getAccessToken,
  clearAccessToken
} from '../api';
import type { Gift, Site, Client } from '../../../types';

// Mock dependencies
vi.mock('../../../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'test-anon-key'
}));

vi.mock('../config/deploymentEnvironments', () => ({
  getCurrentEnvironment: vi.fn(() => ({
    id: 'test',
    name: 'Test Environment',
    supabaseUrl: 'https://test-project.supabase.co',
    apiBaseUrl: 'https://test-project.supabase.co/functions/v1/make-server-6fcaeea3'
  }))
}));

vi.mock('../security', () => ({
  sanitizeInput: vi.fn((input) => input),
  checkSecureContext: vi.fn(() => true),
  logSecurityEvent: vi.fn()
}));

vi.mock('../csrfProtection', () => ({
  getOrCreateCSRFToken: vi.fn(() => 'test-csrf-token')
}));

vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

describe('API Utils', () => {
  // Helper to create mock response with proper headers
  const createMockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data
  });

  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    // Valid JWT format token for testing
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.test-signature';
    
    it('should store access token in sessionStorage', () => {
      setAccessToken(validToken);
      expect(getAccessToken()).toBe(validToken);
    });

    it('should retrieve stored access token', () => {
      sessionStorage.setItem('jala_access_token', validToken);
      expect(getAccessToken()).toBe(validToken);
    });

    it('should clear access token', () => {
      setAccessToken(validToken);
      clearAccessToken();
      expect(getAccessToken()).toBeNull();
    });

    it('should return null when no token exists', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('apiRequest', () => {
    it('should make GET request successfully', async () => {
      const mockData = { success: true, data: { test: 'value' } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      const result = await apiRequest('/test-endpoint', { method: 'GET' });
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should make POST request with data', async () => {
      const mockData = { success: true };
      const postData = { name: 'Test Item' };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      await apiRequest('/test-endpoint', { method: 'POST', body: JSON.stringify(postData) });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData)
        })
      );
    });

    it('should include authorization header when token exists', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.test-signature';
      setAccessToken(validToken);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      await apiRequest('/protected', { method: 'GET' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Access-Token': validToken
          })
        })
      );
    });

    it('should handle 401 unauthorized error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized' })
      });

      await expect(apiRequest('/protected', { method: 'GET' }))
        .rejects.toThrow();
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(apiRequest('/test', { method: 'GET' }))
        .rejects.toThrow('Network error');
    });

    it('should handle 404 not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Not found' })
      });

      await expect(apiRequest('/notfound', { method: 'GET' }))
        .rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Server error' })
      });

      await expect(apiRequest('/error', { method: 'GET' }))
        .rejects.toThrow();
    });
  });

  describe('giftApi', () => {
    const mockGifts = [
      {
        id: '1',
        name: 'Test Gift',
        description: 'Test Description',
        category: 'Electronics',
        price: 100,
        image: 'test.jpg',
        sku: 'TEST-001',
        status: 'active',
        inventory: { total: 10, available: 5, reserved: 5 },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ] as any as Gift[];

    it('should fetch all gifts', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, gifts: mockGifts })
      );

      const result = await giftApi.getAll();
      expect(result.gifts).toEqual(mockGifts);
    });

    it('should fetch gift by ID', async () => {
      const mockGift = mockGifts[0];
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ gift: mockGift })
      );

      const result = await giftApi.getById('1');
      expect(result.gift).toEqual(mockGift);
    });

    it('should create new gift', async () => {
      const newGift = {
        name: 'New Gift',
        description: 'New Description',
        category: 'Electronics',
        price: 150,
        sku: 'NEW-001',
        status: 'active' as const,
        inventory: { total: 10, available: 10, reserved: 0 }
      };

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ gift: { id: '2', ...newGift } })
      );

      const result = await giftApi.create(newGift);
      expect(result.gift).toBeDefined();
      expect(result.gift.id).toBe('2');
    });

    it('should update gift', async () => {
      const updates = { name: 'Updated Name' };
      
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ gift: { ...mockGifts[0], ...updates } })
      );

      const result = await giftApi.update('1', updates);
      expect(result.gift).toBeDefined();
      expect(result.gift.name).toBe('Updated Name');
    });

    it('should delete gift', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true })
      );

      const result = await giftApi.delete('1');
      expect(result.success).toBe(true);
    });
  });

  describe('siteApi', () => {
    const mockSites: Site[] = [
      {
        id: 'site-1',
        name: 'Test Site',
        clientId: 'client-1',
        domain: 'test.example.com',
        status: 'active' as const,
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#6366F1',
          accentColor: '#10B981'
        },
        settings: {
          validationMethod: 'email' as const,
          allowMultipleSelections: true,
          requireShipping: true,
          supportEmail: 'support@test.com',
          languages: ['en', 'es'],
          defaultLanguage: 'en'
        },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];

    it('should fetch all sites', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: mockSites })
      );

      const result = await siteApi.getAll();
      expect(result.data).toEqual(mockSites);
    });

    it('should fetch site by ID', async () => {
      const mockSite = mockSites[0];
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: mockSite })
      );

      const result = await siteApi.getById('1');
      expect(result.data).toEqual(mockSite);
    });

    it('should create new site', async () => {
      const newSite = {
        name: 'New Site',
        clientId: 'client-1',
        domain: 'new.example.com',
        status: 'active' as const,
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#6366F1',
          accentColor: '#10B981'
        },
        settings: {
          validationMethod: 'email' as const,
          allowMultipleSelections: true,
          requireShipping: true,
          supportEmail: 'support@new.com',
          languages: ['en'],
          defaultLanguage: 'en'
        }
      };

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: { id: '2', ...newSite } })
      );

      const result = await siteApi.create(newSite) as any;
      expect(result.success).toBe(true);
    });

    it('should update site', async () => {
      const updates = { name: 'Updated Site' };

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true })
      );

      const result = await siteApi.update('1', updates) as any;
      expect(result.success).toBe(true);
    });

    it('should delete site', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true })
      );

      const result = await siteApi.delete('1');
      expect(result.success).toBe(true);
    });
  });

  describe('clientApi', () => {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Test Client',
        contactEmail: 'contact@test.com',
        status: 'active',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];

    it('should fetch all clients', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: mockClients })
      );

      const result = await clientApi.getAll();
      expect(result.data).toEqual(mockClients);
    });

    it('should fetch client by ID', async () => {
      const mockClient = mockClients[0];
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: mockClient })
      );

      const result = await clientApi.getById('1');
      expect(result.data).toEqual(mockClient);
    });

    it('should create new client', async () => {
      const newClient = {
        name: 'New Client',
        contactEmail: 'new@test.com',
        status: 'active' as const
      };

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true, data: { id: '2', ...newClient } })
      );

      const result = await clientApi.create(newClient) as any;
      expect(result.success).toBe(true);
    });

    it('should update client', async () => {
      const updates = { name: 'Updated Client' };

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true })
      );

      const result = await clientApi.update('1', updates) as any;
      expect(result.success).toBe(true);
    });

    it('should delete client', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ success: true })
      );

      const result = await clientApi.delete('1');
      expect(result.success).toBe(true);
    });
  });
});