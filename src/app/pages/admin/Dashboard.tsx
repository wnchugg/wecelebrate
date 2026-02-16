import { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { Link } from 'react-router';
import { PublicSitePreview } from '../../components/admin/PublicSitePreview';
import { DeployedDomainBanner } from '../../components/admin/DeployedDomainBanner';
import { Package, Users, ShoppingCart, TrendingUp, TrendingDown, Calendar, MapPin, Globe, Building2, ArrowRight, Clock, Settings, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { dashboardService, type TimeRange, type DashboardStats, type RecentOrder, type PopularGift } from '../../services/dashboardService';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { parseError } from '../../utils/apiErrors';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function Dashboard() {
  const { currentSite, sites, isLoading: sitesLoading } = useSite();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularGifts, setPopularGifts] = useState<PopularGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async (showLoader = true) => {
    if (!currentSite?.id) {
      console.warn('[Dashboard] No current site selected');
      // Only show error if we have sites available but none selected
      if (!sitesLoading && sites.length > 0) {
        setError('No site selected. Please select a site from the dropdown.');
      } else if (!sitesLoading && sites.length === 0) {
        setError('No sites available. Please create a site first.');
      }
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      console.warn('[Dashboard] Fetching data for site:', currentSite.id, 'timeRange:', timeRange);
      
      const environment = getCurrentEnvironment();
      const data = await dashboardService.getDashboardData(
        currentSite.id,
        timeRange,
        environment.id
      );

      console.warn('[Dashboard] Data fetched successfully:', data);
      
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setPopularGifts(data.popularGifts);
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
      
      // Provide more helpful error messages
      const errorMessage = parseError(err);
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Authentication required. Please log in again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Access denied. You do not have permission to view this dashboard.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when dependencies change
  useEffect(() => {
    fetchDashboardData();
  }, [currentSite?.id, timeRange]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.warn('[Dashboard] Auto-refreshing data...');
      fetchDashboardData(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentSite?.id, timeRange]);

  // Manual refresh handler
  const handleRefresh = () => {
    console.warn('[Dashboard] Manual refresh triggered');
    fetchDashboardData(false);
  };

  // Time range options
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  // Format stats for display
  const getFormattedStats = () => {
    if (!stats) {
      return [
        { name: 'Total Orders', value: '0', change: '0%', trend: 'up' as const, icon: ShoppingCart, color: 'bg-blue-500' },
        { name: 'Active Users', value: '0', change: '0%', trend: 'up' as const, icon: Users, color: 'bg-[#D91C81]' },
        { name: 'Gifts Available', value: '0', change: '0', trend: 'up' as const, icon: Package, color: 'bg-[#00B4CC]' },
        { name: 'Pending Shipments', value: '0', change: '0%', trend: 'up' as const, icon: Package, color: 'bg-amber-500' },
      ];
    }

    return [
      {
        name: 'Total Orders',
        value: stats.totalOrders.toLocaleString(),
        change: `${stats.orderGrowth >= 0 ? '+' : ''}${stats.orderGrowth.toFixed(1)}%`,
        trend: stats.orderGrowth >= 0 ? 'up' as const : 'down' as const,
        icon: ShoppingCart,
        color: 'bg-blue-500',
      },
      {
        name: 'Active Users',
        value: stats.activeEmployees.toLocaleString(),
        change: `${stats.employeeGrowth >= 0 ? '+' : ''}${stats.employeeGrowth.toFixed(1)}%`,
        trend: stats.employeeGrowth >= 0 ? 'up' as const : 'down' as const,
        icon: Users,
        color: 'bg-[#D91C81]',
      },
      {
        name: 'Gifts Available',
        value: stats.giftsAvailable.toLocaleString(),
        change: stats.giftsChange >= 0 ? `+${stats.giftsChange}` : `${stats.giftsChange}`,
        trend: stats.giftsChange >= 0 ? 'up' as const : 'down' as const,
        icon: Package,
        color: 'bg-[#00B4CC]',
      },
      {
        name: 'Pending Shipments',
        value: stats.pendingShipments.toLocaleString(),
        change: `${stats.pendingChange >= 0 ? '+' : ''}${stats.pendingChange.toFixed(1)}%`,
        trend: stats.pendingChange >= 0 ? 'up' as const : 'down' as const,
        icon: Package,
        color: 'bg-amber-500',
      },
    ];
  };

  const formattedStats = getFormattedStats();

  // Show dashboard with loading states for individual sections
  // This allows users to see the UI and navigate away if needed
  const showDashboard = !sitesLoading || currentSite !== null;

  // Loading state - show skeleton UI instead of blocking
  if (!showDashboard) {
    return (
      <div className="space-y-6">
        <DeployedDomainBanner />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your site's performance and activity</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#D91C81] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading sites...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <DeployedDomainBanner />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your site's performance and activity</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deployed Domain Configuration Banner */}
      <DeployedDomainBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your site's performance and activity</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            to="/admin/site-configuration"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {formattedStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 border border-gray-200 relative"
              style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
            >
              {loading && (
                <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#D91C81] animate-spin" />
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Site Preview */}
        <PublicSitePreview />
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 relative" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{order.employeeEmail}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 font-medium">{order.giftName}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Gifts */}
        <div className="bg-white rounded-xl border border-gray-200 relative" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Popular Gifts</h2>
              <Link to="/admin/analytics" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
                View analytics →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading gifts...</p>
              </div>
            ) : popularGifts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No popular gifts data</p>
              </div>
            ) : (
              popularGifts.map((gift) => (
                <div key={gift.giftId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{gift.giftName}</span>
                    <span className="text-sm text-gray-600">{gift.orderCount} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#D91C81] h-2 rounded-full transition-all"
                      style={{ width: `${gift.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/gifts"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] hover:bg-pink-50 transition-all group"
          >
            <Package className="w-8 h-8 text-[#D91C81]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#D91C81]">Add New Gift</p>
              <p className="text-xs text-gray-600">Expand catalog</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#00B4CC] hover:bg-cyan-50 transition-all group"
          >
            <Clock className="w-8 h-8 text-[#00B4CC]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#00B4CC]">Process Orders</p>
              <p className="text-xs text-gray-600">Review pending</p>
            </div>
          </Link>

          <Link
            to="/admin/site-configuration?tab=access"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#1B2A5E] hover:bg-blue-50 transition-all group"
          >
            <Users className="w-8 h-8 text-[#1B2A5E]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#1B2A5E]">Manage Access</p>
              <p className="text-xs text-gray-600">User permissions</p>
            </div>
          </Link>

          <Link
            to="/admin/site-configuration"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
          >
            <Settings className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-amber-500">Site Settings</p>
              <p className="text-xs text-gray-600">Configure portal</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}