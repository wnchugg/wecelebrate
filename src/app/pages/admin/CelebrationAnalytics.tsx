import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  PartyPopper, 
  Award, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { useNavigate } from 'react-router';
import { useDateFormat } from '../../hooks/useDateFormat';

interface Celebration {
  id: string;
  clientId: string;
  siteId?: string;
  employeeId?: string;
  type: string;
  date: string;
  status: string;
  metadata?: any;
  createdAt: string;
}

interface Order {
  id: string;
  siteId: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  metadata?: any;
}

interface Employee {
  id: string;
  clientId: string;
  status: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

const CHART_COLORS = {
  primary: '#D91C81',
  secondary: '#1B2A5E',
  tertiary: '#00B4CC',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B'
};

export function CelebrationAnalytics() {
  const navigate = useNavigate();
  const { formatDate } = useDateFormat();
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30' | '90' | '180' | '365' | 'all'>('90');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [celebrationsRes, ordersRes, employeesRes, clientsRes] = await Promise.all([
        apiRequest<{ data: Celebration[] }>('/celebrations').catch(() => ({ data: [] as Celebration[] })),
        apiRequest<{ data: Order[] }>('/v2/orders').catch(() => ({ data: [] as Order[] })),
        apiRequest<{ data: Employee[] }>('/v2/employees').catch(() => ({ data: [] as Employee[] })),
        apiRequest<{ data: Client[] }>('/v2/clients').catch(() => ({ data: [] as Client[] }))
      ]);

      setCelebrations(celebrationsRes.data || []);
      setOrders(ordersRes.data || []);
      setEmployees(employeesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error: unknown) {
      showErrorToast('Failed to load celebration analytics', error instanceof Error ? error.message : 'Unknown error');
      logger.error('Failed to load celebration analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCelebrations = useMemo(() => {
    if (dateRange === 'all') return celebrations;
    
    const now = new Date();
    const days = parseInt(dateRange);
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return celebrations.filter(c => new Date(c.date) >= cutoffDate);
  }, [celebrations, dateRange]);

  const metrics = useMemo(() => {
    const totalCelebrations = filteredCelebrations.length;
    const activeCelebrations = filteredCelebrations.filter(c => c.status === 'active').length;
    
    // Group by type
    const typeBreakdown: Record<string, number> = {};
    filteredCelebrations.forEach(c => {
      typeBreakdown[c.type] = (typeBreakdown[c.type] || 0) + 1;
    });

    // Calculate conversion rate (celebrations that led to orders)
    const celebrationsWithOrders = filteredCelebrations.filter(c => 
      orders.some(o => o.metadata?.celebrationId === c.id)
    ).length;
    const conversionRate = totalCelebrations > 0 
      ? (celebrationsWithOrders / totalCelebrations) * 100 
      : 0;

    // Upcoming celebrations (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingCelebrations = celebrations.filter(c => {
      const date = new Date(c.date);
      return date >= now && date <= thirtyDaysFromNow && c.status === 'active';
    }).length;

    return {
      totalCelebrations,
      activeCelebrations,
      typeBreakdown,
      conversionRate,
      upcomingCelebrations,
      celebrationsWithOrders
    };
  }, [filteredCelebrations, orders, celebrations]);

  const celebrationsByType = useMemo(() => {
    return Object.entries(metrics.typeBreakdown)
      .map(([type, count], index) => ({
        name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
        fill: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [metrics.typeBreakdown]);

  const celebrationTrend = useMemo(() => {
    const monthly: Record<string, number> = {};
    
    filteredCelebrations.forEach(c => {
      const date = new Date(c.date);
      const month = formatDate(date, { year: 'numeric', month: 'short' });
      monthly[month] = (monthly[month] || 0) + 1;
    });

    return Object.entries(monthly)
      .map(([month, count]) => ({ month, celebrations: count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12);
  }, [filteredCelebrations, formatDate]);

  const celebrationsByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    
    celebrations.forEach(c => {
      const date = new Date(c.date);
      const month = formatDate(date, { month: 'long' });
      months[month] = (months[month] || 0) + 1;
    });

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    return monthOrder.map(month => ({
      month: month.substring(0, 3),
      count: months[month] || 0
    }));
  }, [celebrations, formatDate]);

  const yearlyMilestones = useMemo(() => {
    const milestones: Record<string, number> = {};
    
    filteredCelebrations.forEach(c => {
      if (c.type.includes('anniversary') || c.type.includes('year')) {
        const years = c.metadata?.years || 'Unknown';
        const key = `${years} Year${years !== 1 ? 's' : ''}`;
        milestones[key] = (milestones[key] || 0) + 1;
      }
    });

    return Object.entries(milestones)
      .map(([milestone, count]) => ({ milestone, count }))
      .sort((a, b) => {
        const aNum = parseInt(a.milestone);
        const bNum = parseInt(b.milestone);
        return aNum - bNum;
      })
      .slice(0, 10);
  }, [filteredCelebrations]);

  const handleExport = () => {
    try {
      const csv = [
        ['Celebration Analytics Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Date Range: Last ${dateRange} days`],
        [],
        ['SUMMARY METRICS'],
        ['Total Celebrations', metrics.totalCelebrations],
        ['Active Celebrations', metrics.activeCelebrations],
        ['Upcoming (30 days)', metrics.upcomingCelebrations],
        ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`],
        [],
        ['CELEBRATIONS BY TYPE'],
        ...celebrationsByType.map(t => [t.name, t.value])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Celebration_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccessToast('Report exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorToast('Failed to export report', errorMessage);
      logger.error('Failed to export report', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading celebration analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/reports')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Celebration Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Anniversary celebrations and award recognition insights
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          className="bg-[#D91C81] hover:bg-[#B01669] text-white gap-2"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex gap-2">
            {(['30', '90', '180', '365', 'all'] as const).map((range) => (
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
                <PartyPopper className="w-6 h-6 text-[#D91C81]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Celebrations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCelebrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeCelebrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming (30 days)</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.upcomingCelebrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Celebrations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={celebrationsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {celebrationsByType.map((entry, index) => (
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
            <CardTitle>Celebration Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={celebrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="celebrations" 
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
            <CardTitle>Celebrations by Calendar Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={celebrationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.tertiary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anniversary Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyMilestones} {...({ layout: "vertical" } as any)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis {...({ type: "number" } as any)} />
                <YAxis {...({ dataKey: "milestone", type: "category", width: 80 } as any)} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.purple} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Celebration Type Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {celebrationsByType.map((type, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ borderLeftWidth: '4px', borderLeftColor: type.fill }}
              >
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500">
                    {((type.value / metrics.totalCelebrations) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <p className="text-2xl font-bold" style={{ color: type.fill }}>
                  {type.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Award className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Recognition Impact</p>
                <p className="text-sm text-gray-600">
                  {metrics.conversionRate.toFixed(1)}% of celebrations result in gift orders, showing strong engagement with the recognition program.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Upcoming Opportunities</p>
                <p className="text-sm text-gray-600">
                  {metrics.upcomingCelebrations} celebrations scheduled in the next 30 days. Plan ahead for gift fulfillment and personalization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Program Growth</p>
                <p className="text-sm text-gray-600">
                  {celebrationTrend.length > 1 && celebrationTrend[celebrationTrend.length - 1].celebrations > celebrationTrend[0].celebrations
                    ? 'Celebration volume is trending upward, indicating growing program adoption.'
                    : 'Monitor celebration trends to optimize recognition program timing and resources.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}