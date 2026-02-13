// Analytics Service - handles data fetching and aggregation for analytics dashboard

export interface AnalyticsMetrics {
  totalOrders: number;
  activeEmployees: number;
  giftsSent: number;
  totalRevenue: number;
  avgOrderValue: number;
  fulfillmentRate: number;
  orderGrowth: number;
  employeeGrowth: number;
  giftsGrowth: number;
  revenueGrowth: number;
  avgOrderGrowth: number;
  fulfillmentGrowth: number;
}

export interface TimeSeriesData {
  name: string;
  orders: number;
  revenue: number;
  gifts: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface ProductData {
  name: string;
  orders: number;
  revenue: number;
}

export interface CelebrationData {
  name: string;
  value: number;
  color: string;
}

export interface ClientActivityData {
  name: string;
  active: number;
  inactive: number;
}

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    // Get base URL from environment or use default
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  /**
   * Fetch key metrics for dashboard
   */
  async getMetrics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Return mock data as fallback
      return this.getMockMetrics();
    }
  }

  /**
   * Fetch time series data for charts
   */
  async getTimeSeriesData(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<TimeSeriesData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/timeseries?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time series data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return this.getMockTimeSeriesData();
    }
  }

  /**
   * Fetch category distribution
   */
  async getCategoryDistribution(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/categories`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category distribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      return this.getMockCategoryData();
    }
  }

  /**
   * Fetch top products
   */
  async getTopProducts(limit: number = 5): Promise<ProductData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/top-products?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top products:', error);
      return this.getMockTopProducts();
    }
  }

  /**
   * Fetch celebration types distribution
   */
  async getCelebrationTypes(): Promise<CelebrationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/celebrations`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch celebration data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching celebration data:', error);
      return this.getMockCelebrationData();
    }
  }

  /**
   * Fetch client activity data
   */
  async getClientActivity(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<ClientActivityData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/client-activity?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client activity');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client activity:', error);
      return this.getMockClientActivity();
    }
  }

  // Mock data methods (for development/fallback)

  private getMockMetrics(): AnalyticsMetrics {
    return {
      totalOrders: 2847,
      activeEmployees: 8432,
      giftsSent: 15234,
      totalRevenue: 284592,
      avgOrderValue: 142.35,
      fulfillmentRate: 98.4,
      orderGrowth: 12.5,
      employeeGrowth: 8.2,
      giftsGrowth: 15.3,
      revenueGrowth: -3.2,
      avgOrderGrowth: 5.7,
      fulfillmentGrowth: 2.1,
    };
  }

  private getMockTimeSeriesData(): TimeSeriesData[] {
    return [
      { name: 'Jan', orders: 420, revenue: 59400, gifts: 1250 },
      { name: 'Feb', orders: 380, revenue: 53800, gifts: 1100 },
      { name: 'Mar', orders: 520, revenue: 73600, gifts: 1560 },
      { name: 'Apr', orders: 480, revenue: 67900, gifts: 1420 },
      { name: 'May', orders: 590, revenue: 83500, gifts: 1750 },
      { name: 'Jun', orders: 457, revenue: 64600, gifts: 1354 },
    ];
  }

  private getMockCategoryData(): CategoryData[] {
    return [
      { name: 'Electronics', value: 3245, color: '#D91C81' },
      { name: 'Home & Living', value: 2847, color: '#E94B9E' },
      { name: 'Fashion', value: 2156, color: '#F47BB6' },
      { name: 'Sports', value: 1893, color: '#FF9ECE' },
      { name: 'Food & Beverage', value: 1567, color: '#FFC1E0' },
    ];
  }

  private getMockTopProducts(): ProductData[] {
    return [
      { name: 'Wireless Headphones', orders: 487, revenue: 48700 },
      { name: 'Smart Watch', orders: 423, revenue: 63450 },
      { name: 'Coffee Maker', orders: 392, revenue: 31360 },
      { name: 'Backpack', orders: 356, revenue: 28480 },
      { name: 'Desk Lamp', orders: 298, revenue: 14900 },
    ];
  }

  private getMockCelebrationData(): CelebrationData[] {
    return [
      { name: 'Work Anniversary', value: 45, color: '#D91C81' },
      { name: 'Birthday', value: 30, color: '#E94B9E' },
      { name: 'Milestone', value: 15, color: '#F47BB6' },
      { name: 'Welcome', value: 10, color: '#FF9ECE' },
    ];
  }

  private getMockClientActivity(): ClientActivityData[] {
    return [
      { name: 'Week 1', active: 23, inactive: 7 },
      { name: 'Week 2', active: 28, inactive: 5 },
      { name: 'Week 3', active: 25, inactive: 6 },
      { name: 'Week 4', active: 31, inactive: 4 },
    ];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
