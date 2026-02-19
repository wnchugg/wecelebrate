import { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp,
  Users,
  ShoppingCart,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  Gift,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Filter,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { useDateFormat } from '../../hooks/useDateFormat';

interface Order {
  id: string;
  siteId: string;
  siteName?: string;
  employeeId?: string;
  employeeEmail?: string;
  employeeName?: string;
  giftId: string;
  giftName?: string;
  giftCategory?: string;
  status: string;
  quantity?: number;
  totalAmount?: number;
  shippingAddress?: any;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Gift {
  id: string;
  name: string;
  category: string;
  price: number;
  msrp?: number;
  status: string;
  inventoryQuantity?: number;
  inventoryTracking?: boolean;
  createdAt?: string;
}

interface Employee {
  id: string;
  clientId: string;
  siteId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  department?: string;
  jobTitle?: string;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  status: string;
  startDate: string;
  endDate: string;
  validationMethods?: string[];
  createdAt?: string;
}

interface Client {
  id: string;
  name: string;
  status: string;
  contactEmail?: string;
  createdAt?: string;
}

interface Celebration {
  id: string;
  clientId: string;
  siteId?: string;
  employeeId?: string;
  type: string;
  date: string;
  status: string;
  createdAt?: string;
}

const CHART_COLORS = {
  primary: '#D91C81',
  secondary: '#1B2A5E',
  tertiary: '#00B4CC',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B'
};

const STATUS_COLORS: Record<string, string> = {
  pending: CHART_COLORS.warning,
  confirmed: CHART_COLORS.indigo,
  processing: CHART_COLORS.secondary,
  shipped: CHART_COLORS.purple,
  in_transit: CHART_COLORS.tertiary,
  out_for_delivery: CHART_COLORS.cyan,
  delivered: CHART_COLORS.success,
  cancelled: CHART_COLORS.danger,
  failed: CHART_COLORS.rose
};

export function ReportsAnalytics() {
  const { formatShortDate, formatDate } = useDateFormat();
  const [orders, setOrders] = useState<Order[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | '180' | '365' | 'all'>('30');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [comparisonMode, setComparisonMode] = useState<'none' | 'previous' | 'yoy'>('none');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, giftsRes, sitesRes, clientsRes, celebrationsRes] = await Promise.all([
        apiRequest<{ data: Order[] }>('/v2/orders').catch(() => ({ data: [] as Order[] })),
        apiRequest<{ data: Gift[] }>('/admin/gifts').catch(() => ({ data: [] as Gift[] })),
        apiRequest<{ data: Site[] }>('/v2/sites').catch(() => ({ data: [] as Site[] })),
        apiRequest<{ data: Client[] }>('/v2/clients').catch(() => ({ data: [] as Client[] })),
        apiRequest<{ data: Celebration[] }>('/celebrations').catch(() => ({ data: [] as Celebration[] }))
      ]);

      const ordersData = ordersRes.data || [];
      const giftsData = giftsRes.data || [];
      const sitesData = sitesRes.data || [];
      const clientsData = clientsRes.data || [];
      const celebrationsData = celebrationsRes.data || [];

      // Enrich orders with site/gift names
      const enrichedOrders = ordersData.map(order => {
        const site = sitesData.find(s => s.id === order.siteId);
        const gift = giftsData.find(g => g.id === order.giftId);
        return {
          ...order,
          siteName: site?.name,
          giftCategory: gift?.category,
          totalAmount: order.totalAmount || gift?.price || 0
        };
      });

      setOrders(enrichedOrders);
      setGifts(giftsData);
      setSites(sitesData);
      setClients(clientsData);
      setCelebrations(celebrationsData);

      // Load employees for all sites
      const employeePromises = sitesData.map(site =>
        apiRequest<{ data: Employee[] }>(`/employees?siteId=${site.id}`).catch(() => ({ data: [] as Employee[] }))
      );
      const employeeResults = await Promise.all(employeePromises);
      const allEmployees = employeeResults.flatMap(res => res.data || []);
      setEmployees(allEmployees);

    } catch (error: unknown) {
      showErrorToast('Failed to load analytics data', error instanceof Error ? error.message : 'Unknown error');
      logger.error('Failed to load analytics data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by all criteria
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= cutoffDate);
    }

    // Client filter
    if (selectedClient !== 'all') {
      const clientSites = sites.filter(s => s.clientId === selectedClient).map(s => s.id);
      filtered = filtered.filter(order => clientSites.includes(order.siteId));
    }

    // Site filter
    if (selectedSite !== 'all') {
      filtered = filtered.filter(order => order.siteId === selectedSite);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    return filtered;
  }, [orders, dateRange, selectedClient, selectedSite, selectedStatus, sites]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
      processing: filteredOrders.filter(o => o.status === 'processing').length,
      shipped: filteredOrders.filter(o => ['shipped', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      failed: filteredOrders.filter(o => o.status === 'failed').length
    };

    const completedOrders = statusCounts.delivered;
    const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    // Calculate average fulfillment time
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered');
    const avgFulfillmentDays = deliveredOrders.length > 0 
      ? deliveredOrders.reduce((sum, order) => {
          const created = new Date(order.createdAt);
          const updated = new Date(order.updatedAt || order.createdAt);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredOrders.length
      : 0;
    
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const activeSites = sites.filter(s => s.status === 'active').length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const activeGifts = gifts.filter(g => g.status === 'active').length;

    // Celebration metrics
    const totalCelebrations = celebrations.length;
    const activeCelebrations = celebrations.filter(c => c.status === 'active').length;

    // Calculate participation rate
    const uniqueEmployeesOrdered = new Set(filteredOrders.map(o => o.employeeEmail)).size;
    const participationRate = activeEmployees > 0 ? (uniqueEmployeesOrdered / activeEmployees) * 100 : 0;

    // Cost per employee
    const costPerEmployee = activeEmployees > 0 ? totalRevenue / activeEmployees : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      fulfillmentRate,
      avgFulfillmentDays,
      participationRate,
      costPerEmployee,
      uniqueEmployeesOrdered,
      ...statusCounts,
      activeEmployees,
      activeSites,
      activeClients,
      activeGifts,
      totalEmployees: employees.length,
      totalSites: sites.length,
      totalClients: clients.length,
      totalGifts: gifts.length,
      totalCelebrations,
      activeCelebrations
    };
  }, [filteredOrders, employees, sites, clients, gifts, celebrations]);

  // Order Status Distribution
  const orderStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    filteredOrders.forEach(order => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });
    
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      fill: STATUS_COLORS[name] || CHART_COLORS.secondary
    }));
  }, [filteredOrders]);

  // Orders Over Time (Daily)
  const ordersOverTime = useMemo(() => {
    const dailyOrders: Record<string, number> = {};
    const dailyRevenue: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      const date = formatShortDate(order.createdAt);
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.totalAmount || 0);
    });

    return Object.entries(dailyOrders)
      .map(([date, orders]) => ({
        date,
        orders,
        revenue: dailyRevenue[date] || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [filteredOrders, formatShortDate]);

  // Top Gifts by Orders
  const topGiftsByOrders = useMemo(() => {
    const giftCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    
    filteredOrders.forEach(order => {
      const giftId = order.giftId;
      const giftName = order.giftName || giftId;
      
      if (!giftCounts[giftId]) {
        giftCounts[giftId] = { name: giftName, count: 0, revenue: 0 };
      }
      
      giftCounts[giftId].count += 1;
      giftCounts[giftId].revenue += order.totalAmount || 0;
    });

    return Object.values(giftCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        orders: item.count,
        revenue: item.revenue
      }));
  }, [filteredOrders]);

  // Gift Category Distribution
  const categoryDistribution = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    
    gifts.forEach(gift => {
      categoryCounts[gift.category] = (categoryCounts[gift.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, value], index) => ({
        name,
        value,
        fill: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [gifts]);

  // Employee Growth
  const employeeGrowth = useMemo(() => {
    const monthlyEmployees: Record<string, number> = {};
    
    employees.forEach(emp => {
      const date = new Date(emp.createdAt);
      const month = formatDate(date, { year: 'numeric', month: 'short' });
      monthlyEmployees[month] = (monthlyEmployees[month] || 0) + 1;
    });

    return Object.entries(monthlyEmployees)
      .map(([month, count]) => ({ month, employees: count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  }, [employees, formatDate]);

  // Department Distribution
  const departmentDistribution = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [employees]);

  // Export to CSV
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const csv = [
        ['JALA 2 Analytics Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Date Range: Last ${dateRange} days${dateRange === 'all' ? ' (All Time)' : ''}`],
        [],
        ['KEY METRICS'],
        ['Total Orders', metrics.totalOrders],
        ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`],
        ['Average Order Value', `$${metrics.avgOrderValue.toFixed(2)}`],
        ['Fulfillment Rate', `${metrics.fulfillmentRate.toFixed(1)}%`],
        [],
        ['ORDER STATUS'],
        ['Pending', metrics.pending],
        ['Confirmed', metrics.confirmed],
        ['Processing', metrics.processing],
        ['Shipped', metrics.shipped],
        ['Delivered', metrics.delivered],
        ['Cancelled', metrics.cancelled],
        ['Failed', metrics.failed],
        [],
        ['PLATFORM STATS'],
        ['Total Clients', metrics.totalClients],
        ['Active Clients', metrics.activeClients],
        ['Total Sites', metrics.totalSites],
        ['Active Sites', metrics.activeSites],
        ['Total Gifts', metrics.totalGifts],
        ['Active Gifts', metrics.activeGifts],
        ['Total Employees', metrics.totalEmployees],
        ['Active Employees', metrics.activeEmployees],
        ['Total Celebrations', metrics.totalCelebrations],
        ['Active Celebrations', metrics.activeCelebrations]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JALA2_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccessToast('Report exported successfully');
    } catch (error) {
      showErrorToast('Failed to export report', error.message);
      logger.error('Failed to export report', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Comprehensive insights across your platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex gap-2">
            {(['7', '30', '90', '180', '365', 'all'] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={dateRange === range ? 'default' : 'outline'}
                onClick={() => setDateRange(range)}
                className={dateRange === range ? 'bg-[#D91C81] hover:bg-[#B01669]' : ''}
              >
                {range === 'all' ? 'All Time' : `${range} Days`}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#D91C81]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#00B4CC]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.avgOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fulfillment Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.fulfillmentRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#D91C81]" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <Building2 className="w-8 h-8 text-[#D91C81] mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{metrics.activeClients}</p>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-xs text-gray-500 mt-1">of {metrics.totalClients} total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Package className="w-8 h-8 text-[#1B2A5E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{metrics.activeSites}</p>
              <p className="text-sm text-gray-600">Active Sites</p>
              <p className="text-xs text-gray-500 mt-1">of {metrics.totalSites} total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
              <Gift className="w-8 h-8 text-[#00B4CC] mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{metrics.activeGifts}</p>
              <p className="text-sm text-gray-600">Active Gifts</p>
              <p className="text-xs text-gray-500 mt-1">of {metrics.totalGifts} total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{metrics.activeEmployees}</p>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-xs text-gray-500 mt-1">of {metrics.totalEmployees} total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="gifts" className="gap-2">
            <Gift className="w-4 h-4" />
            Gifts
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="w-4 h-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Status
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ordersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area {...({ type: "monotone", dataKey: "orders", stroke: CHART_COLORS.primary, fill: CHART_COLORS.primary, fillOpacity: 0.3 } as any)} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip {...({ formatter: (value: number) => `$${value.toFixed(2)}` } as any)} />
                    <Line {...({ type: "monotone", dataKey: "revenue", stroke: CHART_COLORS.success, strokeWidth: 2 } as any)} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gifts Tab */}
        <TabsContent value="gifts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Gifts by Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topGiftsByOrders} {...({ layout: "vertical" } as any)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis {...({ type: "number" } as any)} />
                    <YAxis {...({ dataKey: "name", type: "category", width: 120 } as any)} />
                    <Tooltip />
                    <Bar dataKey="orders" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gift Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      {...({ outerRadius: 80 } as any)}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Growth (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill={CHART_COLORS.tertiary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Departments by Size</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentDistribution} {...({ layout: "vertical" } as any)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis {...({ type: "number" } as any)} />
                    <YAxis {...({ dataKey: "name", type: "category", width: 100 } as any)} />
                    <Tooltip />
                    <Bar dataKey="value" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      {...({ outerRadius: 80 } as any)}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">{metrics.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Processing</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{metrics.processing}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Shipped</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">{metrics.shipped}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{metrics.delivered}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800">{metrics.cancelled}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}