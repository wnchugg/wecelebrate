/**
 * GiftContext Tests
 * Day 9 - Week 2: Remaining Contexts Testing
 * Target: 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { GiftProvider, useGift, Gift, GIFT_CATEGORIES } from '../GiftContext';
import { mockGift, createMock } from '@/test/helpers';

// Mock APIs
vi.mock('../../utils/api', () => ({
  giftApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
  },
  siteApi: {
    updateGiftConfig: vi.fn(),
    getGifts: vi.fn(),
  },
}));

describe('GiftContext', () => {
  const testGift: Gift = createMock(mockGift as Gift, {
    id: 'gift-1',
    name: 'Test Gift',
    description: 'Test description',
    category: 'Electronics',
    image: 'test.jpg',
    sku: 'TEST-001',
    price: 100,
    inventory: {
      total: 10,
      available: 10,
      reserved: 0,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    
    // Setup default mock responses
    const { giftApi } = require('../../utils/api');
    giftApi.getAll.mockResolvedValue({ gifts: [testGift] });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <GiftProvider>{children}</GiftProvider>
  );

  describe('Constants', () => {
    it('should export gift categories', () => {
      expect(GIFT_CATEGORIES).toBeDefined();
      expect(Array.isArray(GIFT_CATEGORIES)).toBe(true);
      expect(GIFT_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should include common categories', () => {
      expect(GIFT_CATEGORIES).toContain('Electronics');
      expect(GIFT_CATEGORIES).toContain('Apparel');
      expect(GIFT_CATEGORIES).toContain('Home & Living');
    });
  });

  describe('Provider Setup', () => {
    it('should provide gift context', async () => {
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('gifts');
      expect(result.current).toHaveProperty('addGift');
      expect(result.current).toHaveProperty('updateGift');
      expect(result.current).toHaveProperty('deleteGift');
      expect(result.current).toHaveProperty('deleteMultipleGifts');
    });

    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useGift());
      }).toThrow('useGift must be used within a GiftProvider');
      
      consoleSpy.mockRestore();
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useGift(), { wrapper });
      
      expect(result.current.isLoading).toBe(true);
    });

    it('should load gifts when authenticated', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.gifts).toHaveLength(1);
      expect(result.current.gifts[0]).toEqual(testGift);
    });

    it('should not load gifts when not authenticated', async () => {
      const { giftApi } = require('../../utils/api');
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(giftApi.getAll).not.toHaveBeenCalled();
    });
  });

  describe('Gift CRUD Operations', () => {
    it('should add a new gift', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { giftApi } = require('../../utils/api');
      const newGift = { ...testGift, id: 'gift-2', name: 'New Gift' };
      giftApi.create.mockResolvedValue({ gift: newGift });
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addGift({
          name: 'New Gift',
          description: 'New description',
          category: 'Electronics',
          image: 'new.jpg',
          sku: 'NEW-001',
          price: 150,
          inventory: { total: 5, available: 5, reserved: 0 },
          status: 'active' as const,
        });
      });
      
      expect(result.current.gifts).toHaveLength(2);
    });

    it('should update a gift', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { giftApi } = require('../../utils/api');
      const updatedGift = { ...testGift, name: 'Updated Gift' };
      giftApi.update.mockResolvedValue({ gift: updatedGift });
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.updateGift('gift-1', { name: 'Updated Gift' });
      });
      
      expect(result.current.gifts[0].name).toBe('Updated Gift');
    });

    it('should delete a gift', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { giftApi } = require('../../utils/api');
      giftApi.delete.mockResolvedValue({});
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.deleteGift('gift-1');
      });
      
      expect(result.current.gifts).toHaveLength(0);
    });

    it('should delete multiple gifts', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { giftApi } = require('../../utils/api');
      const gifts = [testGift, { ...testGift, id: 'gift-2' }, { ...testGift, id: 'gift-3' }];
      giftApi.getAll.mockResolvedValue({ gifts });
      giftApi.bulkDelete.mockResolvedValue({});
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.gifts).toHaveLength(3);
      });
      
      await act(async () => {
        await result.current.deleteMultipleGifts(['gift-1', 'gift-2']);
      });
      
      expect(result.current.gifts).toHaveLength(1);
      expect(result.current.gifts[0].id).toBe('gift-3');
    });
  });

  describe('Site Configuration', () => {
    it('should get site configuration', async () => {
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const config = result.current.getSiteConfiguration('site-1');
      expect(config).toBeUndefined(); // No configs initially
    });

    it('should update site configuration', async () => {
      const { siteApi } = require('../../utils/api');
      const config = {
        siteId: 'site-1',
        assignmentStrategy: 'all' as const,
      };
      siteApi.updateGiftConfig.mockResolvedValue({ config });
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.updateSiteConfiguration(config);
      });
      
      const savedConfig = result.current.getSiteConfiguration('site-1');
      expect(savedConfig).toEqual(config);
    });

    it('should get gifts by site', async () => {
      const { siteApi } = require('../../utils/api');
      const siteGifts = [testGift];
      siteApi.getGifts.mockResolvedValue({ gifts: siteGifts });
      
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let gifts: Gift[] = [];
      await act(async () => {
        gifts = await result.current.getGiftsBySite('site-1');
      });
      
      expect(gifts).toEqual(siteGifts);
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { giftApi } = require('../../utils/api');
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      vi.clearAllMocks();
      giftApi.getAll.mockResolvedValue({ gifts: [] });
      
      await act(async () => {
        await result.current.refreshData();
      });
      
      expect(giftApi.getAll).toHaveBeenCalled();
    });

    it('should update loading state during refresh', async () => {
      sessionStorage.setItem('jala_access_token', 'test-token');
      const { result } = renderHook(() => useGift(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.refreshData();
      });
      
      expect(result.current.isLoading).toBe(true);
    });
  });
});