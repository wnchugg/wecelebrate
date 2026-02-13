/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
/**
 * Dashboard Service
 * 
 * Service layer for fetching real-time dashboard analytics.
 * Connects to the backend dashboard API endpoints implemented in Phase 1.
 * 
 * Features:
 * - Dashboard statistics with growth metrics
 * - Recent orders with enriched data
 * - Popular gifts analysis
 * - Error handling and retry logic
 * - Request timeout handling
 * - Environment-aware requests
 * 
 * @see /supabase/functions/server/DASHBOARD_API_DOCUMENTATION.md
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '../utils/api';
import { logger } from '../../utils/logger';

// ===== Type Definitions =====

/**
 * Time range options for dashboard analytics
 */
export type TimeRange = '7d' | '30d' | '90d' | '1y';

/**
 * Order status types
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Dashboard statistics with growth metrics
 */
export interface DashboardStats {
  // Current period metrics
  totalOrders: number;
  activeEmployees: number;
  giftsAvailable: number;
  pendingShipments: number;
  
  // Previous period metrics (for comparison)
  previousOrders: number;
  previousActiveEmployees: number;
  previousGiftsAvailable: number;
  previousPendingShipments: number;
  
  // Growth percentages
  orderGrowth: number;
  employeeGrowth: number;
  giftsChange: number;
  pendingChange: number;
}

/**
 * Dashboard stats API response
 */
export interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
  timeRange: TimeRange;
  generatedAt: string;
  error?: string;
}

/**
 * Recent order item
 */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  employeeEmail: string;
  giftName: string;
  status: OrderStatus;
  orderDate: string;
}

/**
 * Recent orders API response
 */
export interface RecentOrdersResponse {
  success: boolean;
  orders: RecentOrder[];
  total: number;
  error?: string;
}

/**
 * Popular gift item
 */
export interface PopularGift {
  giftId: string;
  giftName: string;
  orderCount: number;
  percentage: number;
}

/**
 * Popular gifts API response
 */
export interface PopularGiftsResponse {
  success: boolean;
  gifts: PopularGift[];
  totalOrders: number;
  error?: string;
}

/**
 * Service configuration
 */
interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

// ===== Dashboard Service Class =====

class DashboardService {
  private config: ServiceConfig;
  
  constructor() {
    this.config = {
      baseUrl: `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`,
      timeout: 30000, // 30 seconds
      maxRetries: 2,
      retryDelay: 1000, // 1 second
    };
  }
  
  /**
   * Get authorization headers for API requests
   */
  private getHeaders(environmentId: string = 'development'): HeadersInit {
    const token = getAccessToken();
    
    if (!token) {
      logger.warn('No access token found - request may fail', { service: 'DashboardService' } as any);
    }
    
    return {
      // CRITICAL: Send Supabase anon key for platform authorization
      'Authorization': `Bearer ${publicAnonKey}`,
      // CRITICAL: Send custom JWT token in X-Access-Token header
      'X-Access-Token': token || '',
      'X-Environment-ID': environmentId,
      'Content-Type': 'application/json',
    };
  }
  
  /**
   * Make a fetch request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = this.config.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Make a request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.debug(`Request attempt ${attempt + 1}/${retries + 1}`, { 
          service: 'DashboardService',
          url 
        });
        
        const response = await this.fetchWithTimeout(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'API request failed');
        }
        
        logger.debug('Request successful', { 
          service: 'DashboardService',
          url 
        });
        return data as T;
        
      } catch (error) {
        lastError = error as Error;
        logger.error(
          `Request failed (attempt ${attempt + 1}/${retries + 1})`,
          { service: 'DashboardService', error } as any
        );
        
        // Don't retry on client errors (4xx)
        if ((error as Error & { message?: string }).message?.includes('HTTP 4')) {
          throw error;
        }
        
        // Wait before retrying (with exponential backoff)
        if (attempt < retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          logger.debug(`Retrying after ${delay}ms`, { 
            service: 'DashboardService' 
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }
  
  /**
   * Get dashboard statistics for a site
   * 
   * @param siteId - The site ID to fetch stats for
   * @param timeRange - Time range for statistics (default: '30d')
   * @param environmentId - Environment ID (default: 'development')
   * @returns Dashboard statistics with growth metrics
   * 
   * @example
   * ```typescript
   * const stats = await dashboardService.getStats('site-123', '30d');
   * console.log(`Total orders: ${stats.totalOrders}`);
   * console.log(`Growth: ${stats.orderGrowth}%`);
   * ```
   */
  async getStats(
    siteId: string,
    timeRange: TimeRange = '30d',
    environmentId: string = 'development'
  ): Promise<DashboardStats> {
    logger.debug('Fetching dashboard stats', { 
      service: 'DashboardService',
      siteId, 
      timeRange 
    });
    
    const url = `${this.config.baseUrl}/dashboard/stats/${siteId}?timeRange=${timeRange}`;
    
    try {
      const response = await this.fetchWithRetry<DashboardStatsResponse>(
        url,
        {
          method: 'GET',
          headers: this.getHeaders(environmentId),
        }
      );
      
      logger.debug('Stats fetched successfully', { 
        service: 'DashboardService',
        stats: response.stats 
      });
      return response.stats;
      
    } catch (error) {
      console.error('[DashboardService] Failed to fetch stats:', error);
      
      // Return zero stats as fallback
      return {
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
      };
    }
  }
  
  /**
   * Get recent orders for a site
   * 
   * @param siteId - The site ID to fetch orders for
   * @param limit - Maximum number of orders to return (default: 5)
   * @param status - Optional status filter
   * @param environmentId - Environment ID (default: 'development')
   * @returns Array of recent orders with details
   * 
   * @example
   * ```typescript
   * const orders = await dashboardService.getRecentOrders('site-123', 10);
   * orders.forEach(order => {
   *   console.log(`${order.orderNumber}: ${order.giftName}`);
   * });
   * ```
   */
  async getRecentOrders(
    siteId: string,
    limit: number = 5,
    status?: OrderStatus,
    environmentId: string = 'development'
  ): Promise<RecentOrder[]> {
    logger.debug('Fetching recent orders', {
      service: 'DashboardService',
      siteId,
      limit,
      status: status || 'all'
    });
    
    let url = `${this.config.baseUrl}/dashboard/recent-orders/${siteId}?limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    try {
      const response = await this.fetchWithRetry<RecentOrdersResponse>(
        url,
        {
          method: 'GET',
          headers: this.getHeaders(environmentId),
        }
      );
      
      logger.debug('Recent orders fetched', {
        service: 'DashboardService',
        count: response.orders.length
      });
      return response.orders;
      
    } catch (error) {
      console.error('[DashboardService] Failed to fetch recent orders:', error);
      
      // Return empty array as fallback
      return [];
    }
  }
  
  /**
   * Get popular gifts for a site
   * 
   * @param siteId - The site ID to fetch popular gifts for
   * @param limit - Maximum number of gifts to return (default: 5)
   * @param timeRange - Time range for popularity calculation (default: '30d')
   * @param environmentId - Environment ID (default: 'development')
   * @returns Array of popular gifts with order counts
   * 
   * @example
   * ```typescript
   * const gifts = await dashboardService.getPopularGifts('site-123', 5, '30d');
   * gifts.forEach(gift => {
   *   console.log(`${gift.giftName}: ${gift.orderCount} orders (${gift.percentage}%)`);
   * });
   * ```
   */
  async getPopularGifts(
    siteId: string,
    limit: number = 5,
    timeRange: TimeRange = '30d',
    environmentId: string = 'development'
  ): Promise<PopularGift[]> {
    logger.debug('Fetching popular gifts', {
      service: 'DashboardService',
      siteId,
      limit,
      timeRange
    });
    
    const url = `${this.config.baseUrl}/dashboard/popular-gifts/${siteId}?limit=${limit}&timeRange=${timeRange}`;
    
    try {
      const response = await this.fetchWithRetry<PopularGiftsResponse>(
        url,
        {
          method: 'GET',
          headers: this.getHeaders(environmentId),
        }
      );
      
      logger.debug('Popular gifts fetched', {
        service: 'DashboardService',
        count: response.gifts.length
      });
      return response.gifts;
      
    } catch (error) {
      console.error('[DashboardService] Failed to fetch popular gifts:', error);
      
      // Return empty array as fallback
      return [];
    }
  }
  
  /**
   * Fetch all dashboard data at once (convenience method)
   * 
   * @param siteId - The site ID to fetch data for
   * @param timeRange - Time range for all queries (default: '30d')
   * @param environmentId - Environment ID (default: 'development')
   * @returns Object containing all dashboard data
   * 
   * @example
   * ```typescript
   * const dashboard = await dashboardService.getDashboardData('site-123', '30d');
   * console.log('Stats:', dashboard.stats);
   * console.log('Recent Orders:', dashboard.recentOrders);
   * console.log('Popular Gifts:', dashboard.popularGifts);
   * ```
   */
  async getDashboardData(
    siteId: string,
    timeRange: TimeRange = '30d',
    environmentId: string = 'development'
  ) {
    logger.debug('Fetching all dashboard data', {
      service: 'DashboardService',
      siteId
    });
    
    try {
      // Fetch all data in parallel for better performance
      const [stats, recentOrders, popularGifts] = await Promise.all([
        this.getStats(siteId, timeRange, environmentId),
        this.getRecentOrders(siteId, 5, undefined, environmentId),
        this.getPopularGifts(siteId, 5, timeRange, environmentId),
      ]);
      
      logger.debug('All dashboard data fetched successfully', {
        service: 'DashboardService'
      });
      
      return {
        stats,
        recentOrders,
        popularGifts,
      };
    } catch (error) {
      console.error('[DashboardService] Failed to fetch dashboard data:', error);
      throw error;
    }
  }
  
  /**
   * Update service configuration
   * Useful for testing or custom deployments
   */
  updateConfig(config: Partial<ServiceConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
    logger.debug('Configuration updated', {
      service: 'DashboardService',
      config: this.config
    });
  }
}

// ===== Export Singleton Instance =====

/**
 * Singleton instance of DashboardService
 * Use this to access all dashboard API methods
 */
export const dashboardService = new DashboardService();

/**
 * Export the class for testing purposes
 */
export { DashboardService };