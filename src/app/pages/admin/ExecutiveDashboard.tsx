import { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Package, 
  Users 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { apiRequest } from '../../utils/api';
import { showErrorToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { useNavigate } from 'react-router';

interface DashboardData {
  orders: any[];
  clients: any[];
  sites: any[];
  employees: any[];
  gifts: any[];
  celebrations: any[];
}

const CHART_COLORS = {
  primary: '#D91C81',
  secondary: '#1B2A5E',
  tertiary: '#00B4CC',
  success: '#10B981',
  warning: '#F59E0B',
};

export function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    orders: [],
    clients: [],
    sites: [],
    employees: [],
    gifts: [],
    celebrations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonPeriod, setComparisonPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, clientsRes, sitesRes, employeesRes, giftsRes, celebrationsRes] = await Promise.all([
        apiRequest<{ data: any[] }>('/orders').catch(() => ({ data: [] as any[] })),
        apiRequest<{ data: any[] }>('/clients').catch(() => ({ data: [] as any[] })),
        apiRequest<{ data: any[] }>('/sites').catch(() => ({ data: [] as any[] })),
        apiRequest<{ data: any[] }>('/employees').catch(() => ({ data: [] as any[] })),
        apiRequest<{ data: any[] }>('/admin/gifts').catch(() => ({ data: [] as any[] })),
        apiRequest<{ data: any[] }>('/celebrations').catch(() => ({ data: [] as any[] }))
      ]);

      setData({
        orders: ordersRes.data || [],
        clients: clientsRes.data || [],
        sites: sitesRes.data || [],
        employees: employeesRes.data || [],
        gifts: giftsRes.data || [],
        celebrations: celebrationsRes.data || []
      });
    } catch (error: unknown) {
      showErrorToast('Failed to load dashboard data', error instanceof Error ? error.message : 'Unknown error');
      logger.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const kpis = useMemo(() => {
    const now = new Date();
    const currentPeriodDays = comparisonPeriod === 'week' ? 7 : comparisonPeriod === 'month' ? 30 : 90;
    const currentPeriodStart = new Date(now.getTime() - currentPeriodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - currentPeriodDays * 24 * 60 * 60 * 1000);

    const currentOrders = data.orders.filter(o => new Date(o.createdAt) >= currentPeriodStart);
    const previousOrders = data.orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= previousPeriodStart && date < currentPeriodStart;
    });

    const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const orderChange = previousOrders.length > 0 
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 
      : 0;

    const activeClients = data.clients.filter(c => c.status === 'active').length;
    const activeSites = data.sites.filter(s => s.status === 'active').length;
    const activeEmployees = data.employees.filter(e => e.status === 'active').length;

    const currentCelebrations = data.celebrations.filter(c => new Date(c.date) >= currentPeriodStart);
    const previousCelebrations = data.celebrations.filter(c => {
      const date = new Date(c.date);
      return date >= previousPeriodStart && date < currentPeriodStart;
    });
    const celebrationChange = previousCelebrations.length > 0 
      ? ((currentCelebrations.length - previousCelebrations.length) / previousCelebrations.length) * 100 
      : 0;

    const fulfillmentRate = currentOrders.length > 0
      ? (currentOrders.filter(o => o.status === 'delivered').length / currentOrders.length) * 100
      : 0;

    const participationRate = activeEmployees > 0
      ? (new Set(currentOrders.map(o => o.employeeEmail)).size / activeEmployees) * 100
      : 0;

    return {
      revenue: {
        current: currentRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? 'up' : 'down'
      },
      orders: {
        current: currentOrders.length,
        change: orderChange,
        trend: orderChange >= 0 ? 'up' : 'down'
      },
      celebrations: {
        current: currentCelebrations.length,
        change: celebrationChange,
        trend: celebrationChange >= 0 ? 'up' : 'down'
      },
      activeClients,
      activeSites,
      activeEmployees,
      fulfillmentRate,
      participationRate
    };
  }, [data, comparisonPeriod]);

  const revenueTrend = useMemo(() => {
    const last30Days: Record<string, number> = {};
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    data.orders
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
      .forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last30Days[date] = (last30Days[date] || 0) + (order.totalAmount || 0);
      });

    return Object.entries(last30Days)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14);
  }, [data.orders]);

  const ordersByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    data.orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }, [data.orders]);

  const topPerformingClients = useMemo(() => {
    const clientRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    
    data.orders.forEach(order => {
      const site = data.sites.find(s => s.id === order.siteId);
      if (site) {
        const client = data.clients.find(c => c.id === site.clientId);
        if (client) {
          if (!clientRevenue[client.id]) {
            clientRevenue[client.id] = { name: client.name, revenue: 0, orders: 0 };
          }
          clientRevenue[client.id].revenue += order.totalAmount || 0;
          clientRevenue[client.id].orders += 1;
        }
      }
    });

    return Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data.orders, data.sites, data.clients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            High-level overview of platform performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/admin/reports')}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white gap-2"
            size="sm"
          >
            Full Reports
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Comparison Period:</span>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <Button
                key={period}
                size="sm"
                variant={comparisonPeriod === period ? 'default' : 'outline'}
                onClick={() => setComparisonPeriod(period)}
                className={comparisonPeriod === period ? 'bg-[#D91C81] hover:bg-[#B01669]' : ''}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Revenue</p>
                <div className={`flex items-center gap-1 text-sm ${kpis.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.revenue.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(kpis.revenue.change).toFixed(1)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${kpis.revenue.current.toFixed(2)}</p>
              <p className="text-xs text-gray-500">vs previous {comparisonPeriod}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Orders</p>
                <div className={`flex items-center gap-1 text-sm ${kpis.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.orders.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(kpis.orders.change).toFixed(1)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpis.orders.current}</p>
              <p className="text-xs text-gray-500">vs previous {comparisonPeriod}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Celebrations</p>
                <div className={`flex items-center gap-1 text-sm ${kpis.celebrations.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.celebrations.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(kpis.celebrations.change).toFixed(1)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpis.celebrations.current}</p>
              <p className="text-xs text-gray-500">vs previous {comparisonPeriod}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Fulfillment Rate</p>
                <Badge className="bg-green-100 text-green-800">
                  {kpis.fulfillmentRate.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpis.participationRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Employee participation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <Building2 className="w-10 h-10 text-[#D91C81] mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{kpis.activeClients}</p>
              <p className="text-sm text-gray-600 mt-1">Active Clients</p>
              <p className="text-xs text-gray-500 mt-1">of {data.clients.length} total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Package className="w-10 h-10 text-[#1B2A5E] mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{kpis.activeSites}</p>
              <p className="text-sm text-gray-600 mt-1">Active Sites</p>
              <p className="text-xs text-gray-500 mt-1">of {data.sites.length} total</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
              <Users className="w-10 h-10 text-[#00B4CC] mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{kpis.activeEmployees}</p>
              <p className="text-sm text-gray-600 mt-1">Active Employees</p>
              <p className="text-xs text-gray-500 mt-1">of {data.employees.length} total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip {...({ formatter: (value: number) => `$${value.toFixed(2)}` } as any)} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  {...({ stroke: CHART_COLORS.primary } as any)}
                  {...({ fill: CHART_COLORS.primary } as any)}
                  {...({ fillOpacity: 0.3 } as any)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* @ts-expect-error recharts XAxis tick/angle props not in type defs */}
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={CHART_COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D91C81] text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.orders} orders</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">${client.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/admin/client-analytics')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Client Analytics</p>
                <p className="text-sm text-gray-600 mt-1">Detailed client insights</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/admin/celebration-analytics')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Celebration Analytics</p>
                <p className="text-sm text-gray-600 mt-1">Anniversary & awards</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/admin/reports')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Full Reports</p>
                <p className="text-sm text-gray-600 mt-1">Comprehensive analytics</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}