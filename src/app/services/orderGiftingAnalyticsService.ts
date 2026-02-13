// Order & Gifting Analytics Service - handles order and gift data analytics

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  orderGrowth: number;
  revenueGrowth: number;
  completionRate: number;
}

export interface GiftingMetrics {
  totalGifts: number;
  giftsSent: number;
  giftsDelivered: number;
  pendingGifts: number;
  cancelledGifts: number;
  deliveryRate: number;
  celebrationTypes: Record<string, number>;
  topGiftCategories: Array<{ category: string; count: number; revenue: number }>;
}

export interface OrderTimelineData {
  month: string;
  orders: number;
  revenue: number;
  gifts: number;
  avgOrderValue?: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CelebrationTypeData {
  name: string;
  value: number;
  percentage: number;
  avgGiftValue: number;
  color: string;
}

export interface GiftCategoryPerformance {
  category: string;
  orders: number;
  revenue: number;
  satisfaction: number;
  avgValue: number;
  growth: number;
}

export interface FulfillmentStage {
  stage: string;
  count: number;
  percentage: number;
  avgTime: string;
}

export interface TopRecipient {
  employeeId: string;
  name: string;
  department: string;
  gifts: number;
  totalValue: number;
  occasions: string[];
  lastGift: string;
}

export interface ShippingCarrierMetrics {
  carrier: string;
  orders: number;
  onTimeRate: number;
  avgDeliveryDays: number;
  cost: number;
  issues: number;
}

export interface OrderDetail {
  orderId: string;
  orderDate: string;
  customerName: string;
  items: number;
  total: number;
  status: string;
  celebrationType?: string;
  shippingCarrier?: string;
  deliveryDate?: string;
}

class OrderGiftingAnalyticsService {
  private baseUrl: string;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  /**
   * Fetch order metrics
   */
  async getOrderMetrics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<OrderMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order metrics:', error);
      return this.getMockOrderMetrics();
    }
  }

  /**
   * Fetch gifting metrics
   */
  async getGiftingMetrics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<GiftingMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/gifting/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gifting metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gifting metrics:', error);
      return this.getMockGiftingMetrics();
    }
  }

  /**
   * Fetch order timeline data
   */
  async getOrderTimeline(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<OrderTimelineData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/timeline?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order timeline');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order timeline:', error);
      return this.getMockOrderTimeline();
    }
  }

  /**
   * Fetch order status distribution
   */
  async getOrderStatusDistribution(): Promise<OrderStatusData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/status-distribution`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order status distribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order status distribution:', error);
      return this.getMockOrderStatusDistribution();
    }
  }

  /**
   * Fetch celebration type distribution
   */
  async getCelebrationTypeDistribution(): Promise<CelebrationTypeData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/gifting/celebration-types`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch celebration types');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching celebration types:', error);
      return this.getMockCelebrationTypes();
    }
  }

  /**
   * Fetch gift category performance
   */
  async getGiftCategoryPerformance(): Promise<GiftCategoryPerformance[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/gifting/category-performance`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gift category performance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gift category performance:', error);
      return this.getMockGiftCategoryPerformance();
    }
  }

  /**
   * Fetch fulfillment funnel data
   */
  async getFulfillmentFunnel(): Promise<FulfillmentStage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/fulfillment-funnel`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fulfillment funnel');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fulfillment funnel:', error);
      return this.getMockFulfillmentFunnel();
    }
  }

  /**
   * Fetch top gift recipients
   */
  async getTopRecipients(limit: number = 10): Promise<TopRecipient[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/gifting/top-recipients?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top recipients');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top recipients:', error);
      return this.getMockTopRecipients();
    }
  }

  /**
   * Fetch shipping carrier metrics
   */
  async getShippingCarrierMetrics(): Promise<ShippingCarrierMetrics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/shipping-carriers`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipping carrier metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shipping carrier metrics:', error);
      return this.getMockShippingCarriers();
    }
  }

  /**
   * Fetch order details
   */
  async getOrderDetails(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      celebrationType?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ orders: OrderDetail[]; total: number; page: number; pages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.celebrationType && { celebrationType: filters.celebrationType }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`${this.baseUrl}/analytics/orders/details?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        orders: this.getMockOrderDetails(),
        total: 2847,
        page: 1,
        pages: 143
      };
    }
  }

  /**
   * Export order and gifting report
   */
  async exportReport(
    format: 'csv' | 'pdf' | 'xlsx',
    timeRange: '7d' | '30d' | '90d' | '1y',
    includeGifting: boolean = true
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/orders/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, timeRange, includeGifting }),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Mock data methods

  private getMockOrderMetrics(): OrderMetrics {
    return {
      totalOrders: 2847,
      pendingOrders: 143,
      completedOrders: 2589,
      cancelledOrders: 115,
      processingOrders: 0,
      totalRevenue: 284592,
      avgOrderValue: 142.35,
      orderGrowth: 12.5,
      revenueGrowth: 15.3,
      completionRate: 90.9
    };
  }

  private getMockGiftingMetrics(): GiftingMetrics {
    return {
      totalGifts: 15234,
      giftsSent: 14890,
      giftsDelivered: 14102,
      pendingGifts: 788,
      cancelledGifts: 344,
      deliveryRate: 94.7,
      celebrationTypes: {
        'Work Anniversary': 6854,
        'Birthday': 4571,
        'Milestone': 2289,
        'Welcome': 1520
      },
      topGiftCategories: [
        { category: 'Electronics', count: 3245, revenue: 125400 },
        { category: 'Home & Living', count: 2847, revenue: 89300 },
        { category: 'Fashion', count: 2156, revenue: 78200 }
      ]
    };
  }

  private getMockOrderTimeline(): OrderTimelineData[] {
    return [
      { month: 'Jan', orders: 420, revenue: 59400, gifts: 1250 },
      { month: 'Feb', orders: 380, revenue: 53800, gifts: 1100 },
      { month: 'Mar', orders: 520, revenue: 73600, gifts: 1560 },
      { month: 'Apr', orders: 480, revenue: 67900, gifts: 1420 },
      { month: 'May', orders: 590, revenue: 83500, gifts: 1750 },
      { month: 'Jun', orders: 457, revenue: 64600, gifts: 1354 }
    ];
  }

  private getMockOrderStatusDistribution(): OrderStatusData[] {
    return [
      { name: 'Completed', value: 2589, percentage: 90.9, color: '#10b981' },
      { name: 'Pending', value: 143, percentage: 5.0, color: '#f59e0b' },
      { name: 'Processing', value: 0, percentage: 0, color: '#3b82f6' },
      { name: 'Cancelled', value: 115, percentage: 4.0, color: '#ef4444' }
    ];
  }

  private getMockCelebrationTypes(): CelebrationTypeData[] {
    return [
      { name: 'Work Anniversary', value: 6854, percentage: 45, avgGiftValue: 156.20, color: '#D91C81' },
      { name: 'Birthday', value: 4571, percentage: 30, avgGiftValue: 142.35, color: '#E94B9E' },
      { name: 'Milestone', value: 2289, percentage: 15, avgGiftValue: 189.50, color: '#F47BB6' },
      { name: 'Welcome', value: 1520, percentage: 10, avgGiftValue: 98.75, color: '#FF9ECE' }
    ];
  }

  private getMockGiftCategoryPerformance(): GiftCategoryPerformance[] {
    return [
      { category: 'Electronics', orders: 3245, revenue: 125400, satisfaction: 4.8, avgValue: 38.64, growth: 15.2 },
      { category: 'Home & Living', orders: 2847, revenue: 89300, satisfaction: 4.6, avgValue: 31.37, growth: 8.5 },
      { category: 'Fashion', orders: 2156, revenue: 78200, satisfaction: 4.5, avgValue: 36.27, growth: 12.3 },
      { category: 'Sports', orders: 1893, revenue: 67800, satisfaction: 4.7, avgValue: 35.82, growth: 5.7 },
      { category: 'Food & Beverage', orders: 1567, revenue: 45900, satisfaction: 4.4, avgValue: 29.29, growth: -2.1 }
    ];
  }

  private getMockFulfillmentFunnel(): FulfillmentStage[] {
    return [
      { stage: 'Ordered', count: 2847, percentage: 100, avgTime: '0h' },
      { stage: 'Processing', count: 2732, percentage: 96, avgTime: '4h' },
      { stage: 'Shipped', count: 2650, percentage: 93, avgTime: '24h' },
      { stage: 'Delivered', count: 2589, percentage: 91, avgTime: '72h' }
    ];
  }

  private getMockTopRecipients(): TopRecipient[] {
    return [
      { 
        employeeId: 'emp_001', 
        name: 'John Smith', 
        department: 'Engineering',
        gifts: 45, 
        totalValue: 6750, 
        occasions: ['Anniversary', 'Birthday'], 
        lastGift: '2026-02-10' 
      },
      { 
        employeeId: 'emp_002', 
        name: 'Sarah Johnson', 
        department: 'Marketing',
        gifts: 38, 
        totalValue: 5700, 
        occasions: ['Milestone', 'Welcome'], 
        lastGift: '2026-02-08' 
      },
      { 
        employeeId: 'emp_003', 
        name: 'Michael Brown', 
        department: 'Sales',
        gifts: 35, 
        totalValue: 5250, 
        occasions: ['Anniversary', 'Milestone'], 
        lastGift: '2026-02-05' 
      }
    ];
  }

  private getMockShippingCarriers(): ShippingCarrierMetrics[] {
    return [
      { carrier: 'UPS', orders: 1142, onTimeRate: 98.5, avgDeliveryDays: 2.1, cost: 34260, issues: 17 },
      { carrier: 'FedEx', orders: 876, onTimeRate: 97.8, avgDeliveryDays: 2.3, cost: 28980, issues: 19 },
      { carrier: 'USPS', orders: 542, onTimeRate: 95.2, avgDeliveryDays: 3.5, cost: 16260, issues: 26 },
      { carrier: 'DHL', orders: 287, onTimeRate: 96.8, avgDeliveryDays: 2.8, cost: 9480, issues: 9 }
    ];
  }

  private getMockOrderDetails(): OrderDetail[] {
    return [
      {
        orderId: 'ORD-2024-001',
        orderDate: '2026-02-14',
        customerName: 'John Smith',
        items: 3,
        total: 425.50,
        status: 'Delivered',
        celebrationType: 'Work Anniversary',
        shippingCarrier: 'UPS',
        deliveryDate: '2026-02-16'
      }
    ];
  }
}

// Export singleton instance
export const orderGiftingAnalyticsService = new OrderGiftingAnalyticsService();
