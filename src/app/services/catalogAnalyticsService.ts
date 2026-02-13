// Catalog Analytics Service - handles catalog performance data fetching and analysis

export interface CatalogMetrics {
  catalogId: string;
  catalogName: string;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
  viewCount: number;
  erpSource: string;
  lastSync: string;
  performance: {
    orders: number;
    revenue: number;
    views: number;
    conversion: number;
  };
}

export interface CatalogComparison {
  name: string;
  orders: number;
  revenue: number;
  products: number;
  conversion: number;
}

export interface ERPSourceData {
  name: string;
  value: number;
  color: string;
  catalogs: number;
  products: number;
  revenue: number;
}

export interface ProductPerformance {
  catalogId: string;
  catalogName: string;
  topProducts: Array<{
    productId: string;
    productName: string;
    orders: number;
    revenue: number;
    views: number;
    conversionRate: number;
  }>;
  lowPerformers: Array<{
    productId: string;
    productName: string;
    orders: number;
    views: number;
    reason: string;
  }>;
}

export interface CatalogHealthMetrics {
  metric: string;
  value: number;
  benchmark: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

export interface CatalogTrendData {
  month: string;
  [catalogKey: string]: string | number;
}

class CatalogAnalyticsService {
  private baseUrl: string;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  /**
   * Fetch all catalog metrics
   */
  async getCatalogMetrics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<CatalogMetrics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog metrics:', error);
      return this.getMockCatalogMetrics();
    }
  }

  /**
   * Fetch metrics for a specific catalog
   */
  async getCatalogById(catalogId: string, timeRange: '7d' | '30d' | '90d' | '1y'): Promise<CatalogMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/${catalogId}?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog details:', error);
      return this.getMockCatalogMetrics()[0];
    }
  }

  /**
   * Fetch catalog comparison data
   */
  async getCatalogComparison(catalogIds?: string[]): Promise<CatalogComparison[]> {
    try {
      const queryParams = catalogIds ? `?ids=${catalogIds.join(',')}` : '';
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/comparison${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog comparison');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog comparison:', error);
      return this.getMockComparisonData();
    }
  }

  /**
   * Fetch ERP source distribution
   */
  async getERPSourceDistribution(): Promise<ERPSourceData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/erp-sources`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ERP source distribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ERP source distribution:', error);
      return this.getMockERPSourceData();
    }
  }

  /**
   * Fetch product performance within catalog
   */
  async getProductPerformance(catalogId: string): Promise<ProductPerformance> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/${catalogId}/products`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product performance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product performance:', error);
      return this.getMockProductPerformance();
    }
  }

  /**
   * Fetch catalog health metrics
   */
  async getCatalogHealth(catalogId?: string): Promise<CatalogHealthMetrics[]> {
    try {
      const url = catalogId 
        ? `${this.baseUrl}/analytics/catalogs/${catalogId}/health`
        : `${this.baseUrl}/analytics/catalogs/health`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog health');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog health:', error);
      return this.getMockCatalogHealth();
    }
  }

  /**
   * Fetch catalog trend data
   */
  async getCatalogTrends(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<CatalogTrendData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/trends?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog trends');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog trends:', error);
      return this.getMockTrendData();
    }
  }

  /**
   * Get catalog insights and recommendations
   */
  async getCatalogInsights(): Promise<{
    topPerformer: CatalogMetrics;
    needsAttention: CatalogMetrics;
    risingStar: CatalogMetrics;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/insights`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalog insights:', error);
      const metrics = this.getMockCatalogMetrics();
      return {
        topPerformer: metrics[0],
        needsAttention: metrics[3],
        risingStar: metrics[2],
        recommendations: [
          'Expand Electronics Premium product range',
          'Review Sports & Outdoors pricing strategy',
          'Maintain Fashion & Accessories momentum with seasonal updates'
        ]
      };
    }
  }

  /**
   * Export catalog analytics report
   */
  async exportCatalogReport(
    catalogIds: string[],
    format: 'csv' | 'pdf' | 'xlsx',
    timeRange: '7d' | '30d' | '90d' | '1y'
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/catalogs/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catalogIds, format, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Failed to export catalog report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting catalog report:', error);
      throw error;
    }
  }

  // Mock data methods (for development/fallback)

  private getMockCatalogMetrics(): CatalogMetrics[] {
    return [
      {
        catalogId: 'cat_001',
        catalogName: 'Electronics Premium',
        totalProducts: 245,
        activeProducts: 238,
        totalOrders: 892,
        revenue: 125400,
        avgOrderValue: 140.58,
        conversionRate: 24.5,
        viewCount: 3642,
        erpSource: 'SAP',
        lastSync: '2 hours ago',
        performance: { orders: 15, revenue: 12, views: 8, conversion: 5 }
      },
      {
        catalogId: 'cat_002',
        catalogName: 'Home & Living Essentials',
        totalProducts: 187,
        activeProducts: 182,
        totalOrders: 743,
        revenue: 89300,
        avgOrderValue: 120.19,
        conversionRate: 21.3,
        viewCount: 3487,
        erpSource: 'Oracle',
        lastSync: '1 hour ago',
        performance: { orders: 8, revenue: 5, views: 12, conversion: -3 }
      },
      {
        catalogId: 'cat_003',
        catalogName: 'Fashion & Accessories',
        totalProducts: 312,
        activeProducts: 298,
        totalOrders: 654,
        revenue: 78200,
        avgOrderValue: 119.57,
        conversionRate: 18.7,
        viewCount: 3498,
        erpSource: 'External Vendor',
        lastSync: '30 minutes ago',
        performance: { orders: 12, revenue: 18, views: 5, conversion: 8 }
      },
      {
        catalogId: 'cat_004',
        catalogName: 'Sports & Outdoors',
        totalProducts: 156,
        activeProducts: 149,
        totalOrders: 521,
        revenue: 67800,
        avgOrderValue: 130.13,
        conversionRate: 19.8,
        viewCount: 2631,
        erpSource: 'SAP',
        lastSync: '4 hours ago',
        performance: { orders: -5, revenue: -8, views: 3, conversion: -2 }
      }
    ];
  }

  private getMockComparisonData(): CatalogComparison[] {
    return [
      { name: 'Electronics', orders: 892, revenue: 125.4, products: 238, conversion: 24.5 },
      { name: 'Home', orders: 743, revenue: 89.3, products: 182, conversion: 21.3 },
      { name: 'Fashion', orders: 654, revenue: 78.2, products: 298, conversion: 18.7 },
      { name: 'Sports', orders: 521, revenue: 67.8, products: 149, conversion: 19.8 }
    ];
  }

  private getMockERPSourceData(): ERPSourceData[] {
    return [
      { name: 'SAP', value: 42, color: '#D91C81', catalogs: 18, products: 4235, revenue: 156000 },
      { name: 'Oracle', value: 28, color: '#E94B9E', catalogs: 12, products: 2847, revenue: 98000 },
      { name: 'External Vendor', value: 20, color: '#F47BB6', catalogs: 10, products: 3156, revenue: 78000 },
      { name: 'Custom API', value: 10, color: '#FF9ECE', catalogs: 8, products: 2609, revenue: 28700 }
    ];
  }

  private getMockProductPerformance(): ProductPerformance {
    return {
      catalogId: 'cat_001',
      catalogName: 'Electronics Premium',
      topProducts: [
        { productId: 'prod_001', productName: 'Wireless Headphones Pro', orders: 487, revenue: 48700, views: 1250, conversionRate: 38.9 },
        { productId: 'prod_002', productName: 'Smart Watch Elite', orders: 423, revenue: 63450, views: 980, conversionRate: 43.2 },
        { productId: 'prod_003', productName: 'Bluetooth Speaker Max', orders: 392, revenue: 31360, views: 1120, conversionRate: 35.0 },
      ],
      lowPerformers: [
        { productId: 'prod_045', productName: 'Basic Cable Set', orders: 8, views: 234, reason: 'Low conversion rate' },
        { productId: 'prod_067', productName: 'USB Adapter', orders: 12, views: 189, reason: 'Limited visibility' },
      ]
    };
  }

  private getMockCatalogHealth(): CatalogHealthMetrics[] {
    return [
      { metric: 'Products', value: 85, benchmark: 80, status: 'excellent' },
      { metric: 'Orders', value: 78, benchmark: 75, status: 'good' },
      { metric: 'Revenue', value: 82, benchmark: 80, status: 'good' },
      { metric: 'Conversion', value: 72, benchmark: 70, status: 'good' },
      { metric: 'Views', value: 88, benchmark: 85, status: 'excellent' },
      { metric: 'Fulfillment', value: 95, benchmark: 90, status: 'excellent' }
    ];
  }

  private getMockTrendData(): CatalogTrendData[] {
    return [
      { month: 'Jan', electronics: 820, home: 650, fashion: 590, sports: 480 },
      { month: 'Feb', electronics: 780, home: 680, fashion: 610, sports: 450 },
      { month: 'Mar', electronics: 850, home: 720, fashion: 640, sports: 510 },
      { month: 'Apr', electronics: 870, home: 730, fashion: 635, sports: 505 },
      { month: 'May', electronics: 920, home: 750, fashion: 670, sports: 530 },
      { month: 'Jun', electronics: 892, home: 743, fashion: 654, sports: 521 }
    ];
  }
}

// Export singleton instance
export const catalogAnalyticsService = new CatalogAnalyticsService();
