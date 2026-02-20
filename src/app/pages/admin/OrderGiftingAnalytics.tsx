import { useState, useEffect } from 'react';
import { 
  ShoppingCart,
  Gift,
  TrendingUp,
  Package,
  Truck,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  Download,
  Award
} from 'lucide-react';
import { 
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
  ResponsiveContainer 
} from 'recharts';

interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface GiftingMetrics {
  totalGifts: number;
  giftsSent: number;
  giftsDelivered: number;
  pendingGifts: number;
  celebrationTypes: Record<string, number>;
  topGiftCategories: Array<{ category: string; count: number }>;
}

export default function OrderGiftingAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [orderStatus, setOrderStatus] = useState<string>('all');
  const [celebrationType, setCelebrationType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange, orderStatus, celebrationType]);

  // Order metrics
  const orderMetrics: OrderMetrics = {
    totalOrders: 2847,
    pendingOrders: 143,
    completedOrders: 2589,
    cancelledOrders: 115,
    totalRevenue: 284592,
    avgOrderValue: 142.35,
    orderGrowth: 12.5,
    revenueGrowth: 15.3
  };

  // Gifting metrics
  const giftingMetrics: GiftingMetrics = {
    totalGifts: 15234,
    giftsSent: 14890,
    giftsDelivered: 14102,
    pendingGifts: 788,
    celebrationTypes: {
      'Work Anniversary': 6854,
      'Birthday': 4571,
      'Milestone': 2289,
      'Welcome': 1520
    },
    topGiftCategories: [
      { category: 'Electronics', count: 3245 },
      { category: 'Home & Living', count: 2847 },
      { category: 'Fashion', count: 2156 }
    ]
  };

  // Order timeline data
  const orderTimelineData = [
    { month: 'Jan', orders: 420, revenue: 59400, gifts: 1250 },
    { month: 'Feb', orders: 380, revenue: 53800, gifts: 1100 },
    { month: 'Mar', orders: 520, revenue: 73600, gifts: 1560 },
    { month: 'Apr', orders: 480, revenue: 67900, gifts: 1420 },
    { month: 'May', orders: 590, revenue: 83500, gifts: 1750 },
    { month: 'Jun', orders: 457, revenue: 64600, gifts: 1354 }
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Completed', value: 2589, color: '#10b981' },
    { name: 'Pending', value: 143, color: '#f59e0b' },
    { name: 'Processing', value: 0, color: '#3b82f6' },
    { name: 'Cancelled', value: 115, color: '#ef4444' }
  ];

  // Celebration type distribution
  const celebrationData = [
    { name: 'Work Anniversary', value: 6854, color: '#D91C81' },
    { name: 'Birthday', value: 4571, color: '#E94B9E' },
    { name: 'Milestone', value: 2289, color: '#F47BB6' },
    { name: 'Welcome', value: 1520, color: '#FF9ECE' }
  ];

  // Shipping & fulfillment data
  const fulfillmentData = [
    { stage: 'Ordered', count: 2847, percentage: 100 },
    { stage: 'Processing', count: 2732, percentage: 96 },
    { stage: 'Shipped', count: 2650, percentage: 93 },
    { stage: 'Delivered', count: 2589, percentage: 91 }
  ];

  // Gift category performance
  const giftCategoryData = [
    { category: 'Electronics', orders: 3245, revenue: 125400, satisfaction: 4.8 },
    { category: 'Home & Living', orders: 2847, revenue: 89300, satisfaction: 4.6 },
    { category: 'Fashion', orders: 2156, revenue: 78200, satisfaction: 4.5 },
    { category: 'Sports', orders: 1893, revenue: 67800, satisfaction: 4.7 },
    { category: 'Food & Beverage', orders: 1567, revenue: 45900, satisfaction: 4.4 }
  ];

  // Top recipients data
  const topRecipientsData = [
    { name: 'John Smith', gifts: 45, value: 6750, occasions: 'Anniversary, Birthday' },
    { name: 'Sarah Johnson', gifts: 38, value: 5700, occasions: 'Milestone, Welcome' },
    { name: 'Michael Brown', gifts: 35, value: 5250, occasions: 'Anniversary, Milestone' },
    { name: 'Emily Davis', gifts: 32, value: 4800, occasions: 'Birthday, Welcome' },
    { name: 'David Wilson', gifts: 28, value: 4200, occasions: 'Anniversary, Birthday' }
  ];

  // Shipping performance
  const shippingData = [
    { carrier: 'UPS', orders: 1142, onTime: 98.5, avgDays: 2.1 },
    { carrier: 'FedEx', orders: 876, onTime: 97.8, avgDays: 2.3 },
    { carrier: 'USPS', orders: 542, onTime: 95.2, avgDays: 3.5 },
    { carrier: 'DHL', orders: 287, onTime: 96.8, avgDays: 2.8 }
  ];

  const COLORS = ['#D91C81', '#E94B9E', '#F47BB6', '#FF9ECE', '#FFC1E0'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Order & Gifting Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into orders, gifts, and fulfillment</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Order Status Filter */}
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Orders</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Celebration Type Filter */}
          <select
            value={celebrationType}
            onChange={(e) => setCelebrationType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Celebrations</option>
            <option value="anniversary">Work Anniversary</option>
            <option value="birthday">Birthday</option>
            <option value="milestone">Milestone</option>
            <option value="welcome">Welcome</option>
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

          {/* Export */}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <ShoppingCart className="w-5 h-5 text-[#D91C81]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{orderMetrics.totalOrders.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+{orderMetrics.orderGrowth}%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-[#E94B9E]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${(orderMetrics.totalRevenue / 1000).toFixed(1)}K</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+{orderMetrics.revenueGrowth}%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
            <BarChart3 className="w-5 h-5 text-[#F47BB6]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${orderMetrics.avgOrderValue.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+5.7%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed Orders</h3>
            <CheckCircle className="w-5 h-5 text-[#FF9ECE]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{orderMetrics.completedOrders.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-medium text-green-600">
              {((orderMetrics.completedOrders / orderMetrics.totalOrders) * 100).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">completion rate</span>
          </div>
        </div>
      </div>

      {/* Gifting Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Total Gifts Sent</h3>
            <Gift className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{giftingMetrics.giftsSent.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">Across all celebrations</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Gifts Delivered</h3>
            <Package className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{giftingMetrics.giftsDelivered.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">
            {((giftingMetrics.giftsDelivered / giftingMetrics.giftsSent) * 100).toFixed(1)}% delivery rate
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Pending Gifts</h3>
            <Clock className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{giftingMetrics.pendingGifts.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">In transit or processing</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Celebrations</h3>
            <Award className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{Object.keys(giftingMetrics.celebrationTypes).length}</p>
          <p className="text-sm opacity-75 mt-2">Different celebration types</p>
        </div>
      </div>

      {/* Charts Row 1: Orders & Revenue Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order & Revenue Timeline</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderTimelineData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="month" {...({ stroke: "#9ca3af" } as any)} />
              <YAxis {...({ stroke: "#9ca3af" } as any)} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#D91C81" {...({ radius: [8, 8, 0, 0] } as any)} name="Orders" />
              <Bar dataKey="revenue" fill="#E94B9E" {...({ radius: [8, 8, 0, 0] } as any)} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order Status Distribution</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
      </div>

      {/* Charts Row 2: Celebrations & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Celebration Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Celebration Types</h2>
            <Gift className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={celebrationData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="name" {...({ stroke: "#9ca3af" } as any)} />
              <YAxis {...({ stroke: "#9ca3af" } as any)} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="value" {...({ radius: [8, 8, 0, 0] } as any)} name="Gifts">
                {celebrationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gift Category Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gift Category Performance</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={giftCategoryData} {...({ layout: "vertical" } as any)}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis {...({ type: "number", stroke: "#9ca3af" } as any)} />
              <YAxis {...({ dataKey: "category", type: "category", stroke: "#9ca3af", width: 120 } as any)} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#D91C81" {...({ radius: [0, 8, 8, 0] } as any)} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fulfillment Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fulfillment Funnel</h2>
            <p className="text-sm text-gray-600 mt-1">Order journey from placement to delivery</p>
          </div>
          <Truck className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fulfillmentData} {...({ layout: "vertical" } as any)}>
            <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
            <XAxis {...({ type: "number", stroke: "#9ca3af" } as any)} />
            <YAxis {...({ dataKey: "stage", type: "category", stroke: "#9ca3af", width: 100 } as any)} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Bar dataKey="count" fill="#D91C81" {...({ radius: [0, 8, 8, 0] } as any)} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables Row: Top Recipients & Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recipients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Gift Recipients</h2>
            <p className="text-sm text-gray-600 mt-1">Most celebrated employees</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gifts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topRecipientsData.map((recipient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-[#D91C81] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{recipient.name}</div>
                          <div className="text-xs text-gray-500">{recipient.occasions}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.gifts}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${recipient.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Shipping Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Carrier metrics and delivery times</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On-Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Days</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippingData.map((carrier, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-[#D91C81] mr-3" />
                        <span className="text-sm font-medium text-gray-900">{carrier.carrier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrier.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        carrier.onTime >= 98 ? 'text-green-600' : carrier.onTime >= 96 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {carrier.onTime}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrier.avgDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}