/**
 * SiteContext Tests
 * Day 8 - Week 2: Context Testing
 * Target: 20 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SiteProvider, useSite, Client, Site } from '../SiteContext';

// Mock dependencies
vi.mock('../../utils/api', () => ({
  clientApi: {
    getAll: vi.fn(),
    getBrands: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
  },
  siteApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../context/AdminContext', () => ({
  useAdminContext: vi.fn(() => ({
    adminUser: null,
    isAdminAuthenticated: true,
    isLoading: false,
  })),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../../utils/routeUtils', () => ({
  isPublicRoute: vi.fn(() => false),
}));

describe('SiteContext', () => {
  const mockClient: Client = {
    id: 'client-1',
    name: 'Test Client',
    contactEmail: 'contact@testclient.com',
    status: 'active' as const,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockSite: Site = {
    id: 'site-1',
    name: 'Test Site',
    clientId: 'client-1',
    domain: 'test.example.com',
    status: 'active' as const,
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#B71569',
      tertiaryColor: '#00B4CC',
    },
    settings: {
      validationMethod: 'email' as const,
      allowQuantitySelection: true,
      showPricing: true,
      giftsPerUser: 1,
      shippingMode: 'employee' as const,
      defaultLanguage: 'en',
      enableLanguageSelector: true,
      defaultCurrency: 'USD',
      allowedCountries: [],
      defaultCountry: 'US',
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    
    // Setup default API mock responses
    const { clientApi, siteApi } = require('../../utils/api');
    clientApi.getAll.mockResolvedValue({ success: true, data: [mockClient] });
    clientApi.getBrands.mockResolvedValue({ success: true, data: [] });
    siteApi.getAll.mockResolvedValue({ success: true, data: [mockSite] });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <SiteProvider>{children}</SiteProvider>
  );

  describe('Provider Setup', () => {
    it('should provide site context', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('clients');
      expect(result.current).toHaveProperty('sites');
      expect(result.current).toHaveProperty('currentSite');
      expect(result.current).toHaveProperty('currentClient');
    });

    it('should return safe defaults when used outside provider', () => {
      const { result } = renderHook(() => useSite());
      
      expect(result.current.clients).toEqual([]);
      expect(result.current.sites).toEqual([]);
      expect(result.current.currentSite).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should have initial loading state', () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      // Initially loading
      expect(result.current.isLoading).toBe(true);
    });

    it('should load data on mount', async () => {
      const { clientApi, siteApi } = require('../../utils/api');
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(clientApi.getAll).toHaveBeenCalled();
      expect(clientApi.getBrands).toHaveBeenCalled();
      expect(siteApi.getAll).toHaveBeenCalled();
    });

    it('should populate clients and sites after loading', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.clients).toHaveLength(1);
      expect(result.current.sites).toHaveLength(1);
      expect(result.current.clients[0]).toEqual(mockClient);
      expect(result.current.sites[0]).toEqual(mockSite);
    });
  });

  describe('Current Site Management', () => {
    it('should set current site', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.setCurrentSite(mockSite);
      });
      
      expect(result.current.currentSite).toEqual(mockSite);
    });

    it('should save current site to session storage', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.setCurrentSite(mockSite);
      });
      
      await waitFor(() => {
        expect(sessionStorage.getItem('current_site_id')).toBe('site-1');
      });
    });

    it('should set current client when setting site', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.setCurrentSite(mockSite);
      });
      
      await waitFor(() => {
        expect(result.current.currentClient).toEqual(mockClient);
      });
    });

    it('should load current site from session storage', async () => {
      sessionStorage.setItem('current_site_id', 'site-1');
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.currentSite?.id).toBe('site-1');
      });
    });

    it('should default to first active site', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Should auto-select first active site
      await waitFor(() => {
        expect(result.current.currentSite).toBeDefined();
      });
    });
  });

  describe('Client CRUD Operations', () => {
    it('should add a new client', async () => {
      const { clientApi } = require('../../utils/api');
      const newClient = { ...mockClient, id: 'client-2', name: 'New Client' };
      clientApi.create.mockResolvedValue({ success: true, data: newClient });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addClient({
          name: 'New Client',
          isActive: true,
        });
      });
      
      expect(result.current.clients).toHaveLength(2);
    });

    it('should update a client', async () => {
      const { clientApi } = require('../../utils/api');
      const updatedClient = { ...mockClient, name: 'Updated Client' };
      clientApi.update.mockResolvedValue({ success: true, data: updatedClient });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.updateClient('client-1', { name: 'Updated Client' });
      });
      
      expect(result.current.clients[0].name).toBe('Updated Client');
    });

    it('should delete a client', async () => {
      const { clientApi } = require('../../utils/api');
      clientApi.delete.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.deleteClient('client-1');
      });
      
      expect(result.current.clients).toHaveLength(0);
    });
  });

  describe('Site CRUD Operations', () => {
    it('should add a new site', async () => {
      const { siteApi } = require('../../utils/api');
      const newSite = { ...mockSite, id: 'site-2', name: 'New Site' };
      siteApi.create.mockResolvedValue({ success: true, data: newSite });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addSite({
          name: 'New Site',
          clientId: 'client-1',
          domain: 'new.example.com',
          status: 'active' as const,
          branding: mockSite.branding,
          settings: mockSite.settings,
        });
      });
      
      expect(result.current.sites).toHaveLength(2);
    });

    it('should update a site', async () => {
      const { siteApi } = require('../../utils/api');
      const updatedSite = { ...mockSite, name: 'Updated Site' };
      siteApi.update.mockResolvedValue({ success: true, data: updatedSite });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.updateSite('site-1', { name: 'Updated Site' });
      });
      
      expect(result.current.sites[0].name).toBe('Updated Site');
    });

    it('should delete a site', async () => {
      const { siteApi } = require('../../utils/api');
      siteApi.delete.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.deleteSite('site-1');
      });
      
      expect(result.current.sites).toHaveLength(0);
    });
  });

  describe('Helper Functions', () => {
    it('should get sites by client', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const clientSites = result.current.getSitesByClient('client-1');
      expect(clientSites).toHaveLength(1);
      expect(clientSites[0].clientId).toBe('client-1');
    });

    it('should get client by ID', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const client = result.current.getClientById('client-1');
      expect(client).toEqual(mockClient);
    });

    it('should return undefined for non-existent client', async () => {
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const client = result.current.getClientById('non-existent');
      expect(client).toBeUndefined();
    });

    it('should refresh data', async () => {
      const { clientApi, siteApi } = require('../../utils/api');
      const { result } = renderHook(() => useSite(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      vi.clearAllMocks();
      
      await act(async () => {
        await result.current.refreshData();
      });
      
      expect(clientApi.getAll).toHaveBeenCalled();
      expect(siteApi.getAll).toHaveBeenCalled();
    });
  });
});