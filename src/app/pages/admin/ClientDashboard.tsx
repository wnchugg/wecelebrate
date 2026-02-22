import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Gift, Users, Package, Globe, Building2, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { Link } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Mock data for client-level metrics
const mockClientStats = {
  'client-001': {
    totalOrders: 2847,
    totalOrdersChange: '+15.3%',
    activeUsers: 1842,
    activeUsersChange: '+12.1%',
    totalSites: 3,
    totalSitesChange: '+1',
    totalRevenue: 284750,
    totalRevenueChange: '+18.7%',
    giftsRedeemed: 2134,
    giftsRedeemedChange: '+14.2%',
    pendingShipments: 156,
    pendingShipmentsChange: '-8.3%',
  },
  'client-002': {
    totalOrders: 1523,
    totalOrdersChange: '+9.8%',
    activeUsers: 987,
    activeUsersChange: '+6.4%',
    totalSites: 2,
    totalSitesChange: '0',
    totalRevenue: 152300,
    totalRevenueChange: '+11.2%',
    giftsRedeemed: 1145,
    giftsRedeemedChange: '+10.1%',
    pendingShipments: 89,
    pendingShipmentsChange: '-5.2%',
  },
  'client-003': {
    totalOrders: 945,
    totalOrdersChange: '+7.2%',
    activeUsers: 612,
    activeUsersChange: '+4.8%',
    totalSites: 1,
    totalSitesChange: '0',
    totalRevenue: 94500,
    totalRevenueChange: '+8.5%',
    giftsRedeemed: 708,
    giftsRedeemedChange: '+7.9%',
    pendingShipments: 47,
    pendingShipmentsChange: '-3.1%',
  },
};

const mockSitePerformance = {
  'client-001': [
    { siteId: 'site-001', siteName: 'TechCorp Holiday Gifts 2026', orders: 1284, users: 856, status: 'active', performance: 92 },
    { siteId: 'site-002', siteName: 'TechCorp Employee Appreciation', orders: 987, users: 645, status: 'active', performance: 88 },
    { siteId: 'site-005', siteName: 'TechCorp Spring Recognition', orders: 576, users: 341, status: 'active', performance: 75 },
  ],
  'client-002': [
    { siteId: 'site-003', siteName: 'GlobalRetail Spring Rewards', orders: 892, users: 587, status: 'active', performance: 85 },
    { siteId: 'site-006', siteName: 'GlobalRetail Q1 Incentives', orders: 631, users: 400, status: 'active', performance: 78 },
  ],
  'client-003': [
    { siteId: 'site-004', siteName: 'HealthPlus Wellness Program', orders: 945, users: 612, status: 'active', performance: 90 },
  ],
};

const mockRecentActivity = {
  'client-001': [
    { id: '1', action: 'New site created', site: 'TechCorp Spring Recognition', timestamp: '2 hours ago', type: 'site' },
    { id: '2', action: 'Large order batch', site: 'TechCorp Holiday Gifts 2026', timestamp: '5 hours ago', type: 'order' },
    { id: '3', action: 'User access updated', site: 'TechCorp Employee Appreciation', timestamp: '1 day ago', type: 'user' },
    { id: '4', action: 'Product assignment modified', site: 'TechCorp Holiday Gifts 2026', timestamp: '2 days ago', type: 'product' },
    { id: '5', action: 'Email template updated', site: 'All Sites', timestamp: '3 days ago', type: 'email' },
  ],
  'client-002': [
    { id: '1', action: 'Order spike detected', site: 'GlobalRetail Spring Rewards', timestamp: '1 hour ago', type: 'order' },
    { id: '2', action: 'Shipping configuration changed', site: 'GlobalRetail Q1 Incentives', timestamp: '6 hours ago', type: 'shipping' },
    { id: '3', action: 'New products added', site: 'GlobalRetail Spring Rewards', timestamp: '1 day ago', type: 'product' },
    { id: '4', action: 'Site branding updated', site: 'GlobalRetail Q1 Incentives', timestamp: '2 days ago', type: 'site' },
  ],
  'client-003': [
    { id: '1', action: 'Monthly report generated', site: 'HealthPlus Wellness Program', timestamp: '3 hours ago', type: 'report' },
    { id: '2', action: 'Bulk user import completed', site: 'HealthPlus Wellness Program', timestamp: '1 day ago', type: 'user' },
    { id: '3', action: 'Campaign launched', site: 'HealthPlus Wellness Program', timestamp: '3 days ago', type: 'campaign' },
  ],
};

const mockTopProducts = {
  'client-001': [
    { name: 'Wireless Headphones Premium', orders: 342, revenue: 51300 },
    { name: 'Smart Watch Series 5', orders: 298, revenue: 89400 },
    { name: 'Coffee Maker Deluxe', orders: 256, revenue: 23040 },
    { name: 'Desk Lamp LED', orders: 234, revenue: 9360 },
    { name: 'Backpack Professional', orders: 189, revenue: 16983 },
  ],
  'client-002': [
    { name: 'Yoga Mat Premium', orders: 187, revenue: 9350 },
    { name: 'Water Bottle Insulated', orders: 165, revenue: 4125 },
    { name: 'Smart Watch Series 5', orders: 142, revenue: 42600 },
    { name: 'Wireless Speaker', orders: 128, revenue: 12800 },
    { name: 'Fitness Tracker', orders: 98, revenue: 9800 },
  ],
  'client-003': [
    { name: 'Wireless Headphones Premium', orders: 156, revenue: 23400 },
    { name: 'Desk Lamp LED', orders: 134, revenue: 5360 },
    { name: 'Ergonomic Mouse', orders: 112, revenue: 5600 },
    { name: 'Yoga Mat Premium', orders: 98, revenue: 4900 },
    { name: 'Water Bottle Insulated', orders: 87, revenue: 2175 },
  ],
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'site':
      return <Globe className="w-4 h-4 text-[#D91C81]" />;
    case 'order':
      return <ShoppingCart className="w-4 h-4 text-[#00B4CC]" />;
    case 'user':
      return <Users className="w-4 h-4 text-[#1B2A5E]" />;
    case 'product':
      return <Package className="w-4 h-4 text-purple-600" />;
    case 'shipping':
      return <Package className="w-4 h-4 text-amber-600" />;
    case 'email':
      return <Gift className="w-4 h-4 text-green-600" />;
    case 'report':
      return <BarChart3 className="w-4 h-4 text-blue-600" />;
    case 'campaign':
      return <TrendingUp className="w-4 h-4 text-pink-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getPerformanceColor = (performance: number) => {
  if (performance >= 85) return 'text-green-600';
  if (performance >= 70) return 'text-amber-600';
  return 'text-red-600';
};

const getPerformanceBg = (performance: number) => {
  if (performance >= 85) return 'bg-green-500';
  if (performance >= 70) return 'bg-amber-500';
  return 'bg-red-500';
};

export function ClientDashboard() {
  const { clients, sites, currentClient, setCurrentClient } = useSite();
  const [selectedClientId, setSelectedClientId] = useState<string>(currentClient?.id || clients[0]?.id || '');

  // Update current client when selection changes
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCurrentClient(client);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientSites = sites.filter(s => s.clientId === selectedClientId);
  const stats = mockClientStats[selectedClientId as keyof typeof mockClientStats];
  const sitePerformance = mockSitePerformance[selectedClientId as keyof typeof mockSitePerformance] || [];
  const recentActivity = mockRecentActivity[selectedClientId as keyof typeof mockRecentActivity] || [];
  const topProducts = mockTopProducts[selectedClientId as keyof typeof mockTopProducts] || [];

  const statCards = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        name: 'Total Revenue',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        change: stats.totalRevenueChange,
        trend: stats.totalRevenueChange.startsWith('+') ? 'up' : 'down',
        icon: BarChart3,
        color: 'bg-[#D91C81]',
      },
      {
        name: 'Total Orders',
        value: stats.totalOrders.toLocaleString(),
        change: stats.totalOrdersChange,
        trend: stats.totalOrdersChange.startsWith('+') ? 'up' : 'down',
        icon: ShoppingCart,
        color: 'bg-blue-500',
      },
      {
        name: 'Active Sites',
        value: stats.totalSites.toString(),
        change: stats.totalSitesChange,
        trend: stats.totalSitesChange.startsWith('+') ? 'up' : stats.totalSitesChange === '0' ? 'neutral' : 'down',
        icon: Globe,
        color: 'bg-[#00B4CC]',
      },
      {
        name: 'Active Users',
        value: stats.activeUsers.toLocaleString(),
        change: stats.activeUsersChange,
        trend: stats.activeUsersChange.startsWith('+') ? 'up' : 'down',
        icon: Users,
        color: 'bg-[#1B2A5E]',
      },
      {
        name: 'Gifts Redeemed',
        value: stats.giftsRedeemed.toLocaleString(),
        change: stats.giftsRedeemedChange,
        trend: stats.giftsRedeemedChange.startsWith('+') ? 'up' : 'down',
        icon: CheckCircle,
        color: 'bg-green-500',
      },
      {
        name: 'Pending Shipments',
        value: stats.pendingShipments.toString(),
        change: stats.pendingShipmentsChange,
        trend: stats.pendingShipmentsChange.startsWith('+') ? 'up' : 'down',
        icon: Package,
        color: 'bg-amber-500',
      },
    ];
  }, [stats]);

  if (!selectedClient) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Building2 className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Client Selected</h2>
          <p className="text-gray-600 mb-4">Please select a client to view the dashboard.</p>
          <Link
            to="/admin/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01669] transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Manage Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Selector & Info Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-6 border border-pink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: '#D91C81' }}
            >
              {selectedClient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
              <p className="text-sm text-gray-600">Client Dashboard • {clientSites.length} Active Sites</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                  Active
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">
                  <Globe className="w-3 h-3 inline mr-1" />
                  {clientSites.map(s => s.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <Select value={selectedClientId} onValueChange={handleClientChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link 
              to="/admin/clients"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
            >
              <Building2 className="w-4 h-4" />
              Manage Clients
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 border border-gray-200"
              style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Performance */}
        <Card className="border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00B4CC]" />
                Site Performance
              </CardTitle>
              <Link to="/admin/sites" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
                Manage Sites →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {sitePerformance.map((site) => (
                <div key={site.siteId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{site.siteName}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          <ShoppingCart className="w-3 h-3 inline mr-1" />
                          {site.orders} orders
                        </span>
                        <span className="text-sm text-gray-600">
                          <Users className="w-3 h-3 inline mr-1" />
                          {site.users} users
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getPerformanceColor(site.performance)}`}>
                          {site.performance}%
                        </div>
                        <div className="text-xs text-gray-500">Performance</div>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${site.performance * 1.76} 176`}
                            className={getPerformanceColor(site.performance)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${getPerformanceColor(site.performance)}`}>
                            {site.performance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`${getPerformanceBg(site.performance)} h-2 rounded-full transition-all`}
                      style={{ width: `${site.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1B2A5E]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{activity.site}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D91C81]" />
              Top Products Across All Sites
            </CardTitle>
            <Link to="/admin/reports" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
              View Reports →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D91C81] text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{product.orders} orders</span>
                    <span className="text-sm font-bold text-gray-900">${product.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#D91C81] h-2 rounded-full transition-all"
                    style={{ width: `${(product.orders / topProducts[0].orders) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/sites"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] hover:bg-pink-50 transition-all group"
            >
              <Globe className="w-8 h-8 text-[#D91C81]" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#D91C81]">Manage Sites</p>
                <p className="text-xs text-gray-600">View all sites</p>
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#00B4CC] hover:bg-cyan-50 transition-all group"
            >
              <BarChart3 className="w-8 h-8 text-[#00B4CC]" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#00B4CC]">View Reports</p>
                <p className="text-xs text-gray-600">Analytics & data</p>
              </div>
            </Link>

            <Link
              to="/admin/gifts"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#1B2A5E] hover:bg-blue-50 transition-all group"
            >
              <Gift className="w-8 h-8 text-[#1B2A5E]" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#1B2A5E]">Product Catalog</p>
                <p className="text-xs text-gray-600">Manage products</p>
              </div>
            </Link>

            <Link
              to="/admin/clients"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <Building2 className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-amber-500">Client Settings</p>
                <p className="text-xs text-gray-600">Configure client</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}