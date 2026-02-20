import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Building2, 
  DollarSign, 
  Package, 
  Users, 
  Badge 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { useNavigate } from 'react-router';

interface Client {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Site {
  id: string;
  clientId: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface Order {
  id: string;
  siteId: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
}

interface Employee {
  id: string;
  clientId: string;
  status: string;
}

interface ClientMetrics {
  clientId: string;
  clientName: string;
  totalSites: number;
  activeSites: number;
  totalEmployees: number;
  activeEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  participationRate: number;
  costPerEmployee: number;
}

const CHART_COLORS = {
  primary: '#D91C81',
  secondary: '#1B2A5E',
  tertiary: '#00B4CC',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
};

export function ClientPerformanceAnalytics() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, sitesRes, ordersRes, employeesRes] = await Promise.all([
        apiRequest<{ data: Client[] }>('/v2/clients').catch(() => ({ data: [] as Client[] })),
        apiRequest<{ data: Site[] }>('/v2/sites').catch(() => ({ data: [] as Site[] })),
        apiRequest<{ data: Order[] }>('/v2/orders').catch(() => ({ data: [] as Order[] })),
        apiRequest<{ data: Employee[] }>('/v2/employees').catch(() => ({ data: [] as Employee[] }))
      ]);

      setClients(clientsRes.data || []);
      setSites(sitesRes.data || []);
      setOrders(ordersRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (error: unknown) {
      showErrorToast('Failed to load client analytics', error instanceof Error ? error.message : 'Unknown error');
      logger.error('Failed to load client analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clientMetrics = useMemo<ClientMetrics[]>(() => {
    return clients.map(client => {
      const clientSites = sites.filter(s => s.clientId === client.id);
      const activeSites = clientSites.filter(s => s.status === 'active');
      const siteIds = clientSites.map(s => s.id);
      
      const clientOrders = orders.filter(o => siteIds.includes(o.siteId));
      const totalRevenue = clientOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const avgOrderValue = clientOrders.length > 0 ? totalRevenue / clientOrders.length : 0;

      const clientEmployees = employees.filter(e => e.clientId === client.id);
      const activeEmployees = clientEmployees.filter(e => e.status === 'active');
      
      const uniqueEmployeesOrdered = new Set(clientOrders.map(o => o.id)).size;
      const participationRate = activeEmployees.length > 0 
        ? (uniqueEmployeesOrdered / activeEmployees.length) * 100 
        : 0;

      const costPerEmployee = activeEmployees.length > 0 
        ? totalRevenue / activeEmployees.length 
        : 0;

      return {
        clientId: client.id,
        clientName: client.name,
        totalSites: clientSites.length,
        activeSites: activeSites.length,
        totalEmployees: clientEmployees.length,
        activeEmployees: activeEmployees.length,
        totalOrders: clientOrders.length,
        totalRevenue,
        avgOrderValue,
        participationRate,
        costPerEmployee
      };
    });
  }, [clients, sites, orders, employees]);

  const topClientsByRevenue = useMemo(() => {
    return [...clientMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map(c => ({
        name: c.clientName.length > 20 ? c.clientName.substring(0, 20) + '...' : c.clientName,
        revenue: c.totalRevenue,
        orders: c.totalOrders
      }));
  }, [clientMetrics]);

  const topClientsByOrders = useMemo(() => {
    return [...clientMetrics]
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 10)
      .map(c => ({
        name: c.clientName.length > 20 ? c.clientName.substring(0, 20) + '...' : c.clientName,
        orders: c.totalOrders,
        employees: c.activeEmployees
      }));
  }, [clientMetrics]);

  const participationRateDistribution = useMemo(() => {
    const ranges = [
      { name: '0-20%', min: 0, max: 20, count: 0 },
      { name: '21-40%', min: 21, max: 40, count: 0 },
      { name: '41-60%', min: 41, max: 60, count: 0 },
      { name: '61-80%', min: 61, max: 80, count: 0 },
      { name: '81-100%', min: 81, max: 100, count: 0 }
    ];

    clientMetrics.forEach(c => {
      const range = ranges.find(r => c.participationRate >= r.min && c.participationRate <= r.max);
      if (range) range.count++;
    });

    return ranges.map((r, idx) => ({
      name: r.name,
      value: r.count,
      fill: Object.values(CHART_COLORS)[idx]
    }));
  }, [clientMetrics]);

  const handleExport = () => {
    try {
      const csv = [
        ['Client Performance Analytics'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Client', 'Total Sites', 'Active Sites', 'Total Employees', 'Active Employees', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Participation Rate', 'Cost per Employee'],
        ...clientMetrics.map(m => [
          m.clientName,
          m.totalSites,
          m.activeSites,
          m.totalEmployees,
          m.activeEmployees,
          m.totalOrders,
          `$${m.totalRevenue.toFixed(2)}`,
          `$${m.avgOrderValue.toFixed(2)}`,
          `${m.participationRate.toFixed(1)}%`,
          `$${m.costPerEmployee.toFixed(2)}`
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Client_Performance_${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-gray-600">Loading client analytics...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Performance Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Detailed insights by client organization
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#D91C81]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${clientMetrics.reduce((sum, c) => sum + c.totalRevenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-[#00B4CC]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clientMetrics.reduce((sum, c) => sum + c.totalOrders, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clientMetrics.reduce((sum, c) => sum + c.totalEmployees, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topClientsByRevenue} {...({ layout: "vertical" } as any)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis {...({ type: "number" } as any)} />
                <YAxis {...({ dataKey: "name", type: "category", width: 150 } as any)} />
                <Tooltip {...({ formatter: (value: number) => `$${value.toFixed(2)}` } as any)} />
                <Bar dataKey="revenue" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clients by Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topClientsByOrders} {...({ layout: "vertical" } as any)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis {...({ type: "number" } as any)} />
                <YAxis {...({ dataKey: "name", type: "category", width: 150 } as any)} />
                <Tooltip />
                <Bar dataKey="orders" fill={CHART_COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participation Rate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={participationRateDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {participationRateDistribution.map((entry, index) => (
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
            <CardTitle>Client Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Revenue per Client</span>
                <span className="text-lg font-bold text-gray-900">
                  ${clients.length > 0 
                    ? (clientMetrics.reduce((sum, c) => sum + c.totalRevenue, 0) / clients.length).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Orders per Client</span>
                <span className="text-lg font-bold text-gray-900">
                  {clients.length > 0 
                    ? Math.round(clientMetrics.reduce((sum, c) => sum + c.totalOrders, 0) / clients.length)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Employees per Client</span>
                <span className="text-lg font-bold text-gray-900">
                  {clients.length > 0 
                    ? Math.round(clientMetrics.reduce((sum, c) => sum + c.totalEmployees, 0) / clients.length)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Participation Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {clients.length > 0 
                    ? (clientMetrics.reduce((sum, c) => sum + c.participationRate, 0) / clients.length).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700">Client</th>
                  <th className="text-right p-3 font-medium text-gray-700">Sites</th>
                  <th className="text-right p-3 font-medium text-gray-700">Employees</th>
                  <th className="text-right p-3 font-medium text-gray-700">Orders</th>
                  <th className="text-right p-3 font-medium text-gray-700">Revenue</th>
                  <th className="text-right p-3 font-medium text-gray-700">Avg Order</th>
                  <th className="text-right p-3 font-medium text-gray-700">Participation</th>
                  <th className="text-right p-3 font-medium text-gray-700">Cost/Employee</th>
                </tr>
              </thead>
              <tbody>
                {clientMetrics
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map(metric => (
                    <tr key={metric.clientId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{metric.clientName}</td>
                      <td className="p-3 text-right text-gray-600">
                        {metric.activeSites}/{metric.totalSites}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {metric.activeEmployees}/{metric.totalEmployees}
                      </td>
                      <td className="p-3 text-right text-gray-600">{metric.totalOrders}</td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        ${metric.totalRevenue.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        ${metric.avgOrderValue.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <Badge 
                          className={
                            metric.participationRate >= 80 ? 'bg-green-100 text-green-800' :
                            metric.participationRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {metric.participationRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        ${metric.costPerEmployee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}