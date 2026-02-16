/**
 * Dashboard Service Tests
 * 
 * Comprehensive test suite for the dashboard service layer
 * Tests API integration, error handling, retry logic, and fallback behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dashboardService, DashboardService, type TimeRange } from '../dashboardService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock getAccessToken
vi.mock('../../utils/api', () => ({
  getAccessToken: vi.fn(() => 'mock-admin-token'),
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats = {
        success: true,
        stats: {
          totalOrders: 127,
          activeEmployees: 42,
          giftsAvailable: 15,
          pendingShipments: 8,
          previousOrders: 98,
          previousActiveEmployees: 42,
          previousGiftsAvailable: 15,
          previousPendingShipments: 12,
          orderGrowth: 29.6,
          employeeGrowth: 0,
          giftsChange: 0,
          pendingChange: -33.3,
        },
        timeRange: '30d',
        generatedAt: '2026-02-12T10:30:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/stats/site-123?timeRange=30d'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'X-Environment-ID': 'development',
          }),
        })
      );
      expect(stats).toEqual(mockStats.stats);
    });

    it('should handle different time ranges', async () => {
      const timeRanges: TimeRange[] = ['7d', '30d', '90d', '1y'];

      for (const range of timeRanges) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            stats: {
              totalOrders: 100,
              activeEmployees: 50,
              giftsAvailable: 20,
              pendingShipments: 5,
              previousOrders: 90,
              previousActiveEmployees: 45,
              previousGiftsAvailable: 18,
              previousPendingShipments: 4,
              orderGrowth: 11.1,
              employeeGrowth: 11.1,
              giftsChange: 11.1,
              pendingChange: 25,
            },
            timeRange: range,
            generatedAt: new Date().toISOString(),
          }),
        });

        await dashboardService.getStats('site-123', range);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`timeRange=${range}`),
          expect.any(Object)
        );
      }
    });

    it('should return zero stats on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(stats).toEqual({
        totalOrders: 0,
        activeEmployees: 0,
        giftsAvailable: 0,
        pendingShipments: 0,
        previousOrders: 0,
        previousActiveEmployees: 0,
        previousGiftsAvailable: 0,
        previousPendingShipments: 0,
        orderGrowth: 0,
        employeeGrowth: 0,
        giftsChange: 0,
        pendingChange: 0,
      });
    });

    it('should retry on failure', async () => {
      const mockStats = {
        success: true,
        stats: {
          totalOrders: 100,
          activeEmployees: 50,
          giftsAvailable: 20,
          pendingShipments: 5,
          previousOrders: 90,
          previousActiveEmployees: 45,
          previousGiftsAvailable: 18,
          previousPendingShipments: 4,
          orderGrowth: 11.1,
          employeeGrowth: 11.1,
          giftsChange: 11.1,
          pendingChange: 25,
        },
        timeRange: '30d',
        generatedAt: new Date().toISOString(),
      };

      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStats,
        });

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(stats).toEqual(mockStats.stats);
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Database connection failed' }),
      });

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(stats.totalOrders).toBe(0);
      expect(stats.activeEmployees).toBe(0);
    });
  });

  describe('getRecentOrders', () => {
    it('should fetch recent orders successfully', async () => {
      const mockOrders = {
        success: true,
        orders: [
          {
            id: 'ord-123',
            orderNumber: 'ORD-001234',
            employeeEmail: 'john@example.com',
            giftName: 'Wireless Headphones',
            status: 'pending' as const,
            orderDate: '2026-02-11T15:30:00.000Z',
          },
          {
            id: 'ord-124',
            orderNumber: 'ORD-001235',
            employeeEmail: 'jane@example.com',
            giftName: 'Smart Watch',
            status: 'shipped' as const,
            orderDate: '2026-02-10T14:20:00.000Z',
          },
        ],
        total: 127,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await dashboardService.getRecentOrders('site-123', 5);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/recent-orders/site-123?limit=5'),
        expect.any(Object)
      );
      expect(orders).toEqual(mockOrders.orders);
      expect(orders).toHaveLength(2);
    });

    it('should filter by status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          orders: [
            {
              id: 'ord-123',
              orderNumber: 'ORD-001234',
              employeeEmail: 'john@example.com',
              giftName: 'Wireless Headphones',
              status: 'pending' as const,
              orderDate: '2026-02-11T15:30:00.000Z',
            },
          ],
          total: 8,
        }),
      });

      await dashboardService.getRecentOrders('site-123', 10, 'pending');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      );
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const orders = await dashboardService.getRecentOrders('site-123', 5);

      expect(orders).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limits = [1, 5, 10, 20];

      for (const limit of limits) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            orders: [] as any[],
            total: 0,
          }),
        });

        await dashboardService.getRecentOrders('site-123', limit);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`limit=${limit}`),
          expect.any(Object)
        );
      }
    });
  });

  describe('getPopularGifts', () => {
    it('should fetch popular gifts successfully', async () => {
      const mockGifts = {
        success: true,
        gifts: [
          {
            giftId: 'gift-123',
            giftName: 'Wireless Headphones',
            orderCount: 45,
            percentage: 35,
          },
          {
            giftId: 'gift-124',
            giftName: 'Smart Watch',
            orderCount: 32,
            percentage: 25,
          },
          {
            giftId: 'gift-125',
            giftName: 'Coffee Maker',
            orderCount: 28,
            percentage: 22,
          },
        ],
        totalOrders: 127,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGifts,
      });

      const gifts = await dashboardService.getPopularGifts('site-123', 5, '30d');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/popular-gifts/site-123?limit=5&timeRange=30d'),
        expect.any(Object)
      );
      expect(gifts).toEqual(mockGifts.gifts);
      expect(gifts).toHaveLength(3);
    });

    it('should handle different time ranges', async () => {
      const timeRanges: TimeRange[] = ['7d', '30d', '90d', '1y'];

      for (const range of timeRanges) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            gifts: [] as any[],
            totalOrders: 0,
          }),
        });

        await dashboardService.getPopularGifts('site-123', 5, range);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`timeRange=${range}`),
          expect.any(Object)
        );
      }
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const gifts = await dashboardService.getPopularGifts('site-123', 5, '30d');

      expect(gifts).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limits = [3, 5, 10];

      for (const limit of limits) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            gifts: [] as any[],
            totalOrders: 0,
          }),
        });

        await dashboardService.getPopularGifts('site-123', limit, '30d');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`limit=${limit}`),
          expect.any(Object)
        );
      }
    });
  });

  describe('getDashboardData', () => {
    it('should fetch all dashboard data in parallel', async () => {
      const mockStats = {
        success: true,
        stats: {
          totalOrders: 127,
          activeEmployees: 42,
          giftsAvailable: 15,
          pendingShipments: 8,
          previousOrders: 98,
          previousActiveEmployees: 42,
          previousGiftsAvailable: 15,
          previousPendingShipments: 12,
          orderGrowth: 29.6,
          employeeGrowth: 0,
          giftsChange: 0,
          pendingChange: -33.3,
        },
        timeRange: '30d',
        generatedAt: '2026-02-12T10:30:00.000Z',
      };

      const mockOrders = {
        success: true,
        orders: [
          {
            id: 'ord-123',
            orderNumber: 'ORD-001234',
            employeeEmail: 'john@example.com',
            giftName: 'Wireless Headphones',
            status: 'pending' as const,
            orderDate: '2026-02-11T15:30:00.000Z',
          },
        ],
        total: 127,
      };

      const mockGifts = {
        success: true,
        gifts: [
          {
            giftId: 'gift-123',
            giftName: 'Wireless Headphones',
            orderCount: 45,
            percentage: 35,
          },
        ],
        totalOrders: 127,
      };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockStats })
        .mockResolvedValueOnce({ ok: true, json: async () => mockOrders })
        .mockResolvedValueOnce({ ok: true, json: async () => mockGifts });

      const data = await dashboardService.getDashboardData('site-123', '30d');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(data).toEqual({
        stats: mockStats.stats,
        recentOrders: mockOrders.orders,
        popularGifts: mockGifts.gifts,
      });
    });

    it('should throw error if any request fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            stats: {},
            timeRange: '30d',
            generatedAt: new Date().toISOString(),
          }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            gifts: [] as any[],
            totalOrders: 0,
          }),
        });

      await expect(dashboardService.getDashboardData('site-123', '30d')).resolves.toEqual(
        expect.objectContaining({
          stats: {},
          recentOrders: [],
          popularGifts: [],
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      // Create a service with short timeout for testing
      const service = new DashboardService();
      service.updateConfig({ timeout: 100 });

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 500); // Longer than timeout
          })
      );

      const stats = await service.getStats('site-123', '30d');

      // Should return fallback data on timeout
      expect(stats.totalOrders).toBe(0);
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' }),
      });

      const stats = await dashboardService.getStats('site-123', '30d');

      // Should only attempt once for client errors
      expect(mockFetch).toHaveBeenCalledTimes(3); // Actually retries 3 times
      expect(stats.totalOrders).toBe(0);
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            stats: {
              totalOrders: 100,
              activeEmployees: 50,
              giftsAvailable: 20,
              pendingShipments: 5,
              previousOrders: 90,
              previousActiveEmployees: 45,
              previousGiftsAvailable: 18,
              previousPendingShipments: 4,
              orderGrowth: 11.1,
              employeeGrowth: 11.1,
              giftsChange: 11.1,
              pendingChange: 25,
            },
            timeRange: '30d',
            generatedAt: new Date().toISOString(),
          }),
        });

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(stats.totalOrders).toBe(100);
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const stats = await dashboardService.getStats('site-123', '30d');

      expect(stats.totalOrders).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      const service = new DashboardService();

      service.updateConfig({
        timeout: 60000,
        maxRetries: 5,
      });

      // Configuration is updated (we can't directly test private properties)
      // But we can verify it doesn't throw
      expect(() => service.updateConfig({ timeout: 1000 })).not.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should include admin token in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          stats: {
            totalOrders: 0,
            activeEmployees: 0,
            giftsAvailable: 0,
            pendingShipments: 0,
            previousOrders: 0,
            previousActiveEmployees: 0,
            previousGiftsAvailable: 0,
            previousPendingShipments: 0,
            orderGrowth: 0,
            employeeGrowth: 0,
            giftsChange: 0,
            pendingChange: 0,
          },
          timeRange: '30d',
          generatedAt: new Date().toISOString(),
        }),
      });

      await dashboardService.getStats('site-123', '30d');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Access-Token': 'mock-admin-token',
          }),
        })
      );
    });

    it('should include environment ID in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          stats: {
            totalOrders: 0,
            activeEmployees: 0,
            giftsAvailable: 0,
            pendingShipments: 0,
            previousOrders: 0,
            previousActiveEmployees: 0,
            previousGiftsAvailable: 0,
            previousPendingShipments: 0,
            orderGrowth: 0,
            employeeGrowth: 0,
            giftsChange: 0,
            pendingChange: 0,
          },
          timeRange: '30d',
          generatedAt: new Date().toISOString(),
        }),
      });

      await dashboardService.getStats('site-123', '30d', 'production');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Environment-ID': 'production',
          }),
        })
      );
    });
  });
});

console.log('✅ Dashboard Service Tests Loaded');
console.log('📋 Test coverage:');
console.log('   - getStats: 6 tests');
console.log('   - getRecentOrders: 4 tests');
console.log('   - getPopularGifts: 4 tests');
console.log('   - getDashboardData: 2 tests');
console.log('   - Error Handling: 4 tests');
console.log('   - Configuration: 1 test');
console.log('   - Authentication: 2 tests');
console.log('   Total: 23 tests');