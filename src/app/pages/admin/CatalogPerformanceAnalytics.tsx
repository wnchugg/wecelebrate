import { useState, useEffect } from 'react';
import { 
  Activity, 
  Package, 
  ArrowUpRight, 
  Box, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Download, 
  ShoppingBag, 
  Star 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { CurrencyDisplay } from '../../components/CurrencyDisplay';
import { useNumberFormat } from '../../hooks/useNumberFormat';

interface CatalogMetrics {
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

export default function CatalogPerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');
  const [selectedERPSource, setSelectedERPSource] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { formatInteger } = useNumberFormat();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange, selectedCatalog, selectedERPSource]);

  // Mock catalog metrics data
  const catalogMetrics: CatalogMetrics[] = [
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

  // Catalog comparison data
  const comparisonData = catalogMetrics.map(cat => ({
    name: cat.catalogName.split(' ')[0],
    orders: cat.totalOrders,
    revenue: cat.revenue / 1000,
    products: cat.activeProducts,
    conversion: cat.conversionRate
  }));

  // ERP Source distribution
  const erpSourceData = [
    { name: 'SAP', value: 42, color: '#D91C81' },
    { name: 'Oracle', value: 28, color: '#E94B9E' },
    { name: 'External Vendor', value: 20, color: '#F47BB6' },
    { name: 'Custom API', value: 10, color: '#FF9ECE' }
  ];

  // Product performance data
  const productPerformanceData = [
    { name: 'Top 10%', orders: 420, revenue: 58400 },
    { name: 'Mid 50%', orders: 680, revenue: 71200 },
    { name: 'Bottom 40%', orders: 180, revenue: 12800 }
  ];

  // Catalog health radar data
  const catalogHealthData = [
    { metric: 'Products', value: 85 },
    { metric: 'Orders', value: 78 },
    { metric: 'Revenue', value: 82 },
    { metric: 'Conversion', value: 72 },
    { metric: 'Views', value: 88 },
    { metric: 'Fulfillment', value: 95 }
  ];

  // Time-series data for catalog trends
  const trendData = [
    { month: 'Jan', electronics: 820, home: 650, fashion: 590, sports: 480 },
    { month: 'Feb', electronics: 780, home: 680, fashion: 610, sports: 450 },
    { month: 'Mar', electronics: 850, home: 720, fashion: 640, sports: 510 },
    { month: 'Apr', electronics: 870, home: 730, fashion: 635, sports: 505 },
    { month: 'May', electronics: 920, home: 750, fashion: 670, sports: 530 },
    { month: 'Jun', electronics: 892, home: 743, fashion: 654, sports: 521 }
  ];

  const COLORS = ['#D91C81', '#E94B9E', '#F47BB6', '#FF9ECE', '#FFC1E0'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights across all catalogs and ERP sources</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Catalog Filter */}
          <select
            value={selectedCatalog}
            onChange={(e) => setSelectedCatalog(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Catalogs</option>
            {catalogMetrics.map(cat => (
              <option key={cat.catalogId} value={cat.catalogId}>{cat.catalogName}</option>
            ))}
          </select>

          {/* ERP Filter */}
          <select
            value={selectedERPSource}
            onChange={(e) => setSelectedERPSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Sources</option>
            <option value="sap">SAP</option>
            <option value="oracle">Oracle</option>
            <option value="vendor">External Vendor</option>
            <option value="custom">Custom API</option>
          </select>

          {/* Time Range */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-[#D91C81] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range === '7d' && '7D'}
                {range === '30d' && '30D'}
                {range === '90d' && '90D'}
                {range === '1y' && '1Y'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Catalogs</h3>
            <Package className="w-5 h-5 text-[#D91C81]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">48</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+12%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
            <Box className="w-5 h-5 text-[#E94B9E]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">12,847</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+8.5%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Catalog Revenue</h3>
            <DollarSign className="w-5 h-5 text-[#F47BB6]" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CurrencyDisplay amount={360700} /></p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+15.2%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Avg Conversion</h3>
            <TrendingUp className="w-5 h-5 text-[#FF9ECE]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">21.1%</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+3.4%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Catalog Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Catalog Performance Breakdown</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed metrics for each catalog</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AOV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {catalogMetrics.map((catalog) => (
                <tr key={catalog.catalogId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-[#D91C81] mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{catalog.catalogName}</div>
                        <div className="text-xs text-gray-500">Synced {catalog.lastSync}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {catalog.erpSource}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {catalog.activeProducts} / {catalog.totalProducts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatInteger(catalog.totalOrders)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <CurrencyDisplay amount={catalog.revenue} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <CurrencyDisplay amount={catalog.avgOrderValue} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {catalog.conversionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {catalog.performance.orders > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        catalog.performance.orders > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {catalog.performance.orders > 0 ? '+' : ''}{catalog.performance.orders}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row 1: Comparison & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalog Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Catalog Comparison</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#D91C81" radius={[8, 8, 0, 0]} name="Orders" />
              <Bar dataKey="revenue" fill="#E94B9E" radius={[8, 8, 0, 0]} name="Revenue ($K)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Catalog Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Catalog Order Trends</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="electronics" stroke="#D91C81" strokeWidth={2} name="Electronics" />
              <Line type="monotone" dataKey="home" stroke="#E94B9E" strokeWidth={2} name="Home" />
              <Line type="monotone" dataKey="fashion" stroke="#F47BB6" strokeWidth={2} name="Fashion" />
              <Line type="monotone" dataKey="sports" stroke="#FF9ECE" strokeWidth={2} name="Sports" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: ERP & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ERP Source Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">ERP Source Distribution</h2>
            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={erpSourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {erpSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Product Performance Distribution</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#D91C81" radius={[8, 8, 0, 0]} name="Orders" />
              <Bar dataKey="revenue" fill="#E94B9E" radius={[8, 8, 0, 0]} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Catalog Health Radar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Overall Catalog Health</h2>
            <p className="text-sm text-gray-600 mt-1">Multi-dimensional performance analysis</p>
          </div>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={catalogHealthData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
            <Radar name="Health Score" dataKey="value" stroke="#D91C81" fill="#D91C81" fillOpacity={0.6} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Top Performer</h3>
          </div>
          <p className="text-2xl font-bold mb-2">Electronics Premium</p>
          <p className="text-sm opacity-90">Highest revenue and conversion rate. Consider expanding product range.</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Needs Attention</h3>
          </div>
          <p className="text-2xl font-bold mb-2">Sports & Outdoors</p>
          <p className="text-sm opacity-90">Declining orders. Review pricing and product selection.</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Rising Star</h3>
          </div>
          <p className="text-2xl font-bold mb-2">Fashion & Accessories</p>
          <p className="text-sm opacity-90">Strong revenue growth. Maintain momentum with seasonal updates.</p>
        </div>
      </div>
    </div>
  );
}