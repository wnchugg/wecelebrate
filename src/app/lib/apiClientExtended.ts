/**
 * API Client Extensions
 * Additional convenience methods for the API client
 */

import { apiClient } from '../lib/apiClient';
import type { Gift, Event, Order, Employee, Site, Client } from '../types';
import type { User } from '../context/AuthContext';

/**
 * Extended API client with convenience methods
 */
export const apiClientExtended = {
  /**
   * Get all clients (unpaginated)
   */
  async getClients(): Promise<Client[]> {
    const response = await apiClient.clients.list({ page: 1, limit: 1000 });
    return response.data;
  },

  /**
   * Get single client
   */
  async getClient(clientId: string): Promise<Client> {
    return await apiClient.clients.get(clientId);
  },

  /**
   * Get all sites (unpaginated)
   */
  async getSites(): Promise<Site[]> {
    const response = await apiClient.sites.list({ page: 1, limit: 1000 });
    return response.data;
  },

  /**
   * Get sites by client
   */
  async getSitesByClient(clientId: string): Promise<Site[]> {
    return await apiClient.sites.getByClient(clientId);
  },

  /**
   * Get single site
   */
  async getSite(siteId: string): Promise<Site> {
    return await apiClient.sites.get(siteId);
  },

  /**
   * Get gifts with filters
   */
  async getGifts(options?: {
    siteId?: string;
    category?: string;
    search?: string;
    limit?: number;
  }): Promise<Gift[]> {
    const params: Record<string, unknown> = { page: 1, limit: options?.limit || 1000 };
    
    // Note: The actual filtering would need to be implemented in the backend
    // For now, we'll fetch all and filter client-side
    const response = await apiClient.gifts.list(params);
    let gifts = response.data;
    
    if (options?.category) {
      gifts = gifts.filter(g => g.category === options.category);
    }
    
    if (options?.search) {
      const search = options.search.toLowerCase();
      gifts = gifts.filter(g =>
        g.name.toLowerCase().includes(search) ||
        g.description?.toLowerCase().includes(search)
      );
    }
    
    return gifts;
  },

  /**
   * Get single gift
   */
  async getGift(giftId: string): Promise<Gift> {
    return await apiClient.gifts.get(giftId);
  },

  /**
   * Get employees for a site
   */
  async getEmployees(siteId: string): Promise<Employee[]> {
    const response = await apiClient.employees.list(siteId, { page: 1, limit: 1000 });
    return response.data;
  },

  /**
   * Get single employee
   */
  async getEmployee(employeeId: string): Promise<Employee> {
    return await apiClient.employees.get(employeeId);
  },

  /**
   * Get orders with filters
   */
  async getOrders(options?: {
    siteId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Order[]> {
    const params: Record<string, unknown> = { page: 1, limit: options?.limit || 1000 };
    
    const response = await apiClient.orders.list(params);
    let orders = response.data;
    
    // Client-side filtering
    if (options?.status) {
      orders = orders.filter(o => o.status === options.status);
    }
    
    if (options?.userId) {
      orders = orders.filter(o => o.employeeId === options.userId);
    }
    
    if (options?.startDate) {
      const startDate = new Date(options.startDate);
      orders = orders.filter(o => new Date(o.createdAt) >= startDate);
    }
    
    if (options?.endDate) {
      const endDate = new Date(options.endDate);
      orders = orders.filter(o => new Date(o.createdAt) <= endDate);
    }
    
    return orders;
  },

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<Order> {
    return await apiClient.orders.get(orderId);
  },

  /**
   * Get events with filters
   * Note: This is a placeholder - events might not be in the backend yet
   */
  async getEvents(options?: {
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<Event[]> {
    // Placeholder - would need to implement events API
    // For now, return empty array or mock data
    console.warn('Events API not implemented yet');
    return [];
  },

  /**
   * Get single event
   * Note: This is a placeholder - events might not be in the backend yet
   */
  async getEvent(eventId: string): Promise<Event> {
    // Placeholder - would need to implement events API
    console.warn('Events API not implemented yet');
    throw new Error('Events API not implemented');
  },

  /**
   * Get current user
   * Note: This would need to be implemented in the backend
   */
  async getCurrentUser(): Promise<User | null> {
    // Placeholder - would need to implement user profile API
    console.warn('getCurrentUser API not implemented yet');
    return null;
  },

  /**
   * Search across multiple entities
   */
  async search(query: string): Promise<{
    gifts: Gift[];
    sites: Site[];
    clients: Client[];
  }> {
    const [gifts, sites, clients] = await Promise.all([
      this.getGifts({ search: query }),
      this.getSites().then((allSites: Site[]) =>
        allSites.filter((s: Site) =>
          s.name.toLowerCase().includes(query.toLowerCase())
        )
      ),
      this.getClients().then((allClients: Client[]) =>
        allClients.filter((c: Client) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        )
      ),
    ]);
    
    return { gifts, sites, clients };
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalClients: number;
    totalSites: number;
    totalGifts: number;
    totalOrders: number;
    recentOrders: Order[];
  }> {
    const [clients, sites, gifts, orders] = await Promise.all([
      this.getClients(),
      this.getSites(),
      this.getGifts(),
      this.getOrders({ limit: 10 }),
    ]);
    
    return {
      totalClients: clients.length,
      totalSites: sites.length,
      totalGifts: gifts.length,
      totalOrders: orders.length,
      recentOrders: orders.slice(0, 5),
    };
  },

  /**
   * Validate gift availability
   */
  async validateGiftAvailability(giftId: string, quantity: number = 1): Promise<{
    available: boolean;
    remaining: number;
  }> {
    const gift = await this.getGift(giftId);
    
    const inventory = gift.availableQuantity ?? 0;
    return {
      available: inventory >= quantity,
      remaining: inventory - quantity,
    };
  },

  /**
   * Get gift recommendations
   */
  async getGiftRecommendations(options?: {
    category?: string;
    priceRange?: [number, number];
    limit?: number;
  }): Promise<Gift[]> {
    let gifts = await this.getGifts({ category: options?.category });
    
    if (options?.priceRange) {
      const [min, max] = options.priceRange;
      gifts = gifts.filter((g: Gift) => g.price >= min && g.price <= max);
    }
    
    // Sort by popularity or rating (if available)
    // For now, just shuffle
    gifts = gifts.sort(() => Math.random() - 0.5);
    
    if (options?.limit) {
      gifts = gifts.slice(0, options.limit);
    }
    
    return gifts;
  },

  /**
   * Get order statistics for date range
   */
  async getOrderStatistics(startDate: string, endDate: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  }> {
    const orders = await this.getOrders({ startDate, endDate });
    
    const totalRevenue = orders.reduce((sum: number, o: Order) => sum + ((o.gift?.price ?? 0) * (o.quantity ?? 1)), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const ordersByStatus = orders.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
    };
  },
};

// Re-export apiClient for convenience
export { apiClient };

// Create a merged API client with both original and extended methods
export const api = {
  ...apiClient,
  ...apiClientExtended,
};

export default api;
