import { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ShoppingCart, 
  Users, 
  Gift, 
  DollarSign, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Activity, 
  Calendar,
  PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// Types
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface ChartData {
  name: string;
  [key: string]: string | number;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  
  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  // Metric Cards Data
  const metrics: MetricCard[] = [
    {
      title: 'Total Orders',
      value: '2,847',
      change: 12.5,
      trend: 'up',
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      title: 'Active Employees',
      value: '8,432',
      change: 8.2,
      trend: 'up',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Gifts Sent',
      value: '15,234',
      change: 15.3,
      trend: 'up',
      icon: <Gift className="w-6 h-6" />
    },
    {
      title: 'Total Revenue',
      value: '$284,592',
      change: -3.2,
      trend: 'down',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Avg Order Value',
      value: '$142.35',
      change: 5.7,
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Fulfillment Rate',
      value: '98.4%',
      change: 2.1,
      trend: 'up',
      icon: <Package className="w-6 h-6" />
    }
  ];

  // Orders Over Time Data
  const ordersData: ChartData[] = [
    { name: 'Jan', orders: 420, revenue: 59400 },
    { name: 'Feb', orders: 380, revenue: 53800 },
    { name: 'Mar', orders: 520, revenue: 73600 },
    { name: 'Apr', orders: 480, revenue: 67900 },
    { name: 'May', orders: 590, revenue: 83500 },
    { name: 'Jun', orders: 457, revenue: 64600 }
  ];

  // Category Distribution Data
  const categoryData: ChartData[] = [
    { name: 'Electronics', value: 3245, color: '#D91C81' },
    { name: 'Home & Living', value: 2847, color: '#E94B9E' },
    { name: 'Fashion', value: 2156, color: '#F47BB6' },
    { name: 'Sports', value: 1893, color: '#FF9ECE' },
    { name: 'Food & Beverage', value: 1567, color: '#FFC1E0' }
  ];

  // Top Products Data
  const topProducts: ChartData[] = [
    { name: 'Wireless Headphones', orders: 487, revenue: 48700 },
    { name: 'Smart Watch', orders: 423, revenue: 63450 },
    { name: 'Coffee Maker', orders: 392, revenue: 31360 },
    { name: 'Backpack', orders: 356, revenue: 28480 },
    { name: 'Desk Lamp', orders: 298, revenue: 14900 }
  ];

  // Celebration Types Data
  const celebrationData: ChartData[] = [
    { name: 'Work Anniversary', value: 45, color: '#D91C81' },
    { name: 'Birthday', value: 30, color: '#E94B9E' },
    { name: 'Milestone', value: 15, color: '#F47BB6' },
    { name: 'Welcome', value: 10, color: '#FF9ECE' }
  ];

  // Client Activity Data
  const clientActivityData: ChartData[] = [
    { name: 'Week 1', active: 23, inactive: 7 },
    { name: 'Week 2', active: 28, inactive: 5 },
    { name: 'Week 3', active: 25, inactive: 6 },
    { name: 'Week 4', active: 31, inactive: 4 }
  ];

  const COLORS = ['#D91C81', '#E94B9E', '#F47BB6', '#FF9ECE', '#FFC1E0'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform metrics and insights</p>
        </div>
        
        {/* Time Range Selector */}
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
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === '90d' && 'Last 90 Days'}
              {range === '1y' && 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg text-[#D91C81]">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Orders & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Orders Over Time</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ordersData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D91C81" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D91C81" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#D91C81" 
                {...({ fillOpacity: 1 } as any)}
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
                {...({ formatter: (value: number) => `$${value.toLocaleString()}` } as any)}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#D91C81" 
                strokeWidth={3}
                dot={{ fill: '#D91C81', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Categories & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Category Distribution</h2>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} {...({ layout: "vertical" } as any)}>
              <CartesianGrid strokeDasharray="3 3" {...({ stroke: "#f0f0f0" } as any)} />
              <XAxis {...({ type: "number" } as any)} stroke="#9ca3af" />
              <YAxis {...({ dataKey: "name", type: "category" } as any)} stroke="#9ca3af" width={150} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="orders" fill="#D91C81" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Celebrations & Client Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Celebration Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Celebration Types</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={celebrationData}>
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
              <Bar dataKey="value" fill="#D91C81" radius={[8, 8, 0, 0]}>
                {celebrationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Client Activity</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
              <Bar dataKey="active" fill="#D91C81" radius={[8, 8, 0, 0]} name="Active" />
              <Bar dataKey="inactive" fill="#FFC1E0" radius={[8, 8, 0, 0]} name="Inactive" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Conversion Rate</h3>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">24.8%</p>
          <p className="text-sm opacity-75 mt-2">+3.2% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Repeat Orders</h3>
            <ShoppingCart className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">42.3%</p>
          <p className="text-sm opacity-75 mt-2">+5.7% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Satisfaction Score</h3>
            <Activity className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">4.8/5</p>
          <p className="text-sm opacity-75 mt-2">Based on 1,234 reviews</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Active Catalogs</h3>
            <Package className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">48</p>
          <p className="text-sm opacity-75 mt-2">Across 12 clients</p>
        </div>
      </div>
    </div>
  );
}