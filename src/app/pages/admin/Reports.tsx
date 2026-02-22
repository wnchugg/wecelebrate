import { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useSite } from '../../context/SiteContext';
import { useAdmin } from '../../context/AdminContext';
import { logger } from '../../utils/logger';
import { 
  Filter, 
  Globe, 
  Building2, 
  Download, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  BarChart3, 
  FileSpreadsheet, 
  PieChart as PieChartIcon, 
  Calendar, 
  Search,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
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
  ResponsiveContainer 
} from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

// SECURITY NOTE: This file only exports data to Excel (ExcelJS.writeBuffer).
// It does NOT import/parse external Excel files, so there are no security concerns.
// We migrated from xlsx to exceljs for better security and active maintenance.

interface Order {
  id: string;
  orderNumber: string;
  siteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  totalAmount: number;
  giftRedeemed: boolean;
  redemptionDate?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2026-001',
    siteId: 'site-001',
    siteName: 'TechCorp Holiday Gifts 2026',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'John Smith',
    customerEmail: 'john.smith@company.com',
    productName: 'Wireless Headphones Premium',
    quantity: 1,
    status: 'delivered',
    orderDate: '2026-01-15T10:30:00',
    deliveryDate: '2026-01-20T14:00:00',
    totalAmount: 149.99,
    giftRedeemed: true,
    redemptionDate: '2026-01-21T09:00:00',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-002',
    siteId: 'site-001',
    siteName: 'TechCorp Holiday Gifts 2026',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    productName: 'Smart Watch Series 5',
    quantity: 1,
    status: 'shipped',
    orderDate: '2026-01-18T09:15:00',
    totalAmount: 299.99,
    giftRedeemed: false,
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    }
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-003',
    siteId: 'site-002',
    siteName: 'TechCorp Employee Appreciation',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'Michael Brown',
    customerEmail: 'mbrown@company.com',
    productName: 'Coffee Maker Deluxe',
    quantity: 2,
    status: 'processing',
    orderDate: '2026-01-22T14:20:00',
    totalAmount: 179.98,
    giftRedeemed: false,
    shippingAddress: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    id: '4',
    orderNumber: 'ORD-2026-004',
    siteId: 'site-003',
    siteName: 'GlobalRetail Spring Rewards',
    clientId: 'client-002',
    clientName: 'GlobalRetail Group',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@company.com',
    productName: 'Yoga Mat Premium',
    quantity: 1,
    status: 'delivered',
    orderDate: '2026-01-10T11:45:00',
    deliveryDate: '2026-01-16T10:30:00',
    totalAmount: 49.99,
    giftRedeemed: false,
    shippingAddress: {
      street: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    }
  },
  {
    id: '5',
    orderNumber: 'ORD-2026-005',
    siteId: 'site-001',
    siteName: 'TechCorp Holiday Gifts 2026',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'David Wilson',
    customerEmail: 'dwilson@company.com',
    productName: 'Desk Lamp LED',
    quantity: 3,
    status: 'delivered',
    orderDate: '2026-01-12T08:30:00',
    deliveryDate: '2026-01-18T15:20:00',
    totalAmount: 119.97,
    giftRedeemed: true,
    redemptionDate: '2026-01-19T10:45:00',
    shippingAddress: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    }
  },
  {
    id: '6',
    orderNumber: 'ORD-2026-006',
    siteId: 'site-003',
    siteName: 'GlobalRetail Spring Rewards',
    clientId: 'client-002',
    clientName: 'GlobalRetail Group',
    customerName: 'Jennifer Martinez',
    customerEmail: 'jmartinez@company.com',
    productName: 'Water Bottle Insulated',
    quantity: 5,
    status: 'shipped',
    orderDate: '2026-01-25T16:00:00',
    totalAmount: 124.95,
    giftRedeemed: false,
    shippingAddress: {
      street: '987 Cedar Ln',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101',
      country: 'USA'
    }
  },
  {
    id: '7',
    orderNumber: 'ORD-2026-007',
    siteId: 'site-002',
    siteName: 'TechCorp Employee Appreciation',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'Robert Garcia',
    customerEmail: 'rgarcia@company.com',
    productName: 'Backpack Professional',
    quantity: 1,
    status: 'pending',
    orderDate: '2026-02-01T09:00:00',
    totalAmount: 89.99,
    giftRedeemed: false,
    shippingAddress: {
      street: '147 Birch Ave',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78201',
      country: 'USA'
    }
  },
  {
    id: '8',
    orderNumber: 'ORD-2026-008',
    siteId: 'site-004',
    siteName: 'HealthPlus Wellness Program',
    clientId: 'client-003',
    clientName: 'HealthPlus Medical',
    customerName: 'Lisa Anderson',
    customerEmail: 'landerson@company.com',
    productName: 'Wireless Headphones Premium',
    quantity: 2,
    status: 'processing',
    orderDate: '2026-02-02T13:30:00',
    totalAmount: 299.98,
    giftRedeemed: false,
    shippingAddress: {
      street: '258 Spruce St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'USA'
    }
  },
  {
    id: '9',
    orderNumber: 'ORD-2026-009',
    siteId: 'site-003',
    siteName: 'GlobalRetail Spring Rewards',
    clientId: 'client-002',
    clientName: 'GlobalRetail Group',
    customerName: 'James Taylor',
    customerEmail: 'jtaylor@company.com',
    productName: 'Smart Watch Series 5',
    quantity: 1,
    status: 'delivered',
    orderDate: '2026-01-08T10:15:00',
    deliveryDate: '2026-01-14T11:00:00',
    totalAmount: 299.99,
    giftRedeemed: true,
    redemptionDate: '2026-01-15T14:30:00',
    shippingAddress: {
      street: '369 Walnut Rd',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA'
    }
  },
  {
    id: '10',
    orderNumber: 'ORD-2026-010',
    siteId: 'site-001',
    siteName: 'TechCorp Holiday Gifts 2026',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'Patricia Thomas',
    customerEmail: 'pthomas@company.com',
    productName: 'Coffee Maker Deluxe',
    quantity: 1,
    status: 'delivered',
    orderDate: '2026-01-20T14:45:00',
    deliveryDate: '2026-01-25T09:30:00',
    totalAmount: 89.99,
    giftRedeemed: true,
    redemptionDate: '2026-01-26T08:15:00',
    shippingAddress: {
      street: '741 Ash Ct',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95101',
      country: 'USA'
    }
  },
  {
    id: '11',
    orderNumber: 'ORD-2026-011',
    siteId: 'site-002',
    siteName: 'TechCorp Employee Appreciation',
    clientId: 'client-001',
    clientName: 'TechCorp Inc.',
    customerName: 'Christopher Lee',
    customerEmail: 'clee@company.com',
    productName: 'Yoga Mat Premium',
    quantity: 2,
    status: 'shipped',
    orderDate: '2026-01-28T11:20:00',
    totalAmount: 99.98,
    giftRedeemed: false,
    shippingAddress: {
      street: '852 Poplar Ln',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    }
  },
  {
    id: '12',
    orderNumber: 'ORD-2026-012',
    siteId: 'site-004',
    siteName: 'HealthPlus Wellness Program',
    clientId: 'client-003',
    clientName: 'HealthPlus Medical',
    customerName: 'Mary White',
    customerEmail: 'mwhite@company.com',
    productName: 'Desk Lamp LED',
    quantity: 1,
    status: 'cancelled',
    orderDate: '2026-01-30T15:10:00',
    totalAmount: 39.99,
    giftRedeemed: false,
    shippingAddress: {
      street: '963 Hickory Dr',
      city: 'Jacksonville',
      state: 'FL',
      zipCode: '32099',
      country: 'USA'
    }
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const CHART_COLORS = ['#D91C81', '#1B2A5E', '#00B4CC', '#F59E0B', '#10B981', '#8B5CF6'];

export function Reports() {
  const { currentSite, clients, sites } = useSite();
  const { adminUser } = useAdmin();
  const [reportScope, setReportScope] = useState<'site' | 'client'>('site');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [giftRedeemedFilter, setGiftRedeemedFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string>('30');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Set initial selections based on current context
  useMemo(() => {
    if (currentSite && !selectedSiteId) {
      setSelectedSiteId(currentSite.id);
    }
  }, [currentSite, selectedSiteId]);

  // Get filtered data based on report scope
  const scopedOrders = useMemo(() => {
    if (reportScope === 'site') {
      const siteId = selectedSiteId || currentSite?.id;
      return siteId ? mockOrders.filter(order => order.siteId === siteId) : [];
    } else {
      return selectedClientId ? mockOrders.filter(order => order.clientId === selectedClientId) : [];
    }
  }, [reportScope, selectedClientId, selectedSiteId, currentSite]);

  // Get current scope name for display
  const scopeName = useMemo(() => {
    if (reportScope === 'site') {
      const site = sites.find(s => s.id === (selectedSiteId || currentSite?.id));
      return site?.name || 'Unknown Site';
    } else {
      const client = clients.find(c => c.id === selectedClientId);
      return client?.name || 'Unknown Client';
    }
  }, [reportScope, selectedClientId, selectedSiteId, currentSite, sites, clients]);

  // Get sites for selected client (for display in site-level view)
  const clientSites = useMemo(() => {
    if (reportScope === 'client' && selectedClientId) {
      return sites.filter(s => s.clientId === selectedClientId);
    }
    return [];
  }, [reportScope, selectedClientId, sites]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = scopedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const delivered = scopedOrders.filter(o => o.status === 'delivered').length;
    const pending = scopedOrders.filter(o => o.status === 'pending').length;
    const avgOrder = scopedOrders.length > 0 ? total / scopedOrders.length : 0;
    const totalQuantity = scopedOrders.reduce((sum, order) => sum + order.quantity, 0);
    const uniqueSites = new Set(scopedOrders.map(o => o.siteId)).size;

    return {
      totalRevenue: total,
      totalOrders: scopedOrders.length,
      deliveredOrders: delivered,
      pendingOrders: pending,
      averageOrderValue: avgOrder,
      totalProducts: totalQuantity,
      uniqueSites
    };
  }, [scopedOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return scopedOrders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesGiftRedeemed = giftRedeemedFilter === 'all' || (giftRedeemedFilter === 'redeemed' ? order.giftRedeemed : !order.giftRedeemed);
      
      const matchesDateRange = !startDate || !endDate || (new Date(order.orderDate) >= startDate && new Date(order.orderDate) <= endDate);
      
      return matchesSearch && matchesStatus && matchesGiftRedeemed && matchesDateRange;
    });
  }, [searchQuery, statusFilter, giftRedeemedFilter, startDate, endDate, scopedOrders]);

  // Prepare chart data
  const ordersByStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    scopedOrders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [scopedOrders]);

  const ordersByDate = useMemo(() => {
    const dateCount: Record<string, number> = {};
    scopedOrders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString();
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    return Object.entries(dateCount)
      .map(([date, count]) => ({ date, orders: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [scopedOrders]);

  const revenueByProduct = useMemo(() => {
    const productRevenue: Record<string, number> = {};
    scopedOrders.forEach(order => {
      productRevenue[order.productName] = (productRevenue[order.productName] || 0) + order.totalAmount;
    });
    return Object.entries(productRevenue)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
  }, [scopedOrders]);

  // Export to Excel
  const exportToExcel = () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Add headers
      worksheet.columns = [
        { header: 'Order Number', key: 'orderNumber', width: 15 },
        { header: 'Site', key: 'siteName', width: 25 },
        { header: 'Client', key: 'clientName', width: 25 },
        { header: 'Customer Name', key: 'customerName', width: 20 },
        { header: 'Customer Email', key: 'customerEmail', width: 30 },
        { header: 'Product', key: 'productName', width: 25 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Order Date', key: 'orderDate', width: 15 },
        { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Street', key: 'street', width: 30 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'State', key: 'state', width: 15 },
        { header: 'Zip Code', key: 'zipCode', width: 15 },
        { header: 'Country', key: 'country', width: 20 }
      ];

      // Add data
      filteredOrders.forEach(order => {
        worksheet.addRow({
          orderNumber: order.orderNumber,
          siteName: order.siteName,
          clientName: order.clientName,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          productName: order.productName,
          quantity: order.quantity,
          status: order.status,
          orderDate: new Date(order.orderDate).toLocaleDateString(),
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A',
          totalAmount: `$${order.totalAmount.toFixed(2)}`,
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country
        });
      });

      // Add summary sheet
      const summaryData = [
        { Metric: 'Report Scope', Value: reportScope === 'client' ? 'Client Level' : 'Site Level' },
        { Metric: reportScope === 'client' ? 'Client' : 'Site', Value: scopeName },
        { Metric: 'Total Revenue', Value: `$${metrics.totalRevenue.toFixed(2)}` },
        { Metric: 'Total Orders', Value: metrics.totalOrders },
        { Metric: 'Delivered Orders', Value: metrics.deliveredOrders },
        { Metric: 'Pending Orders', Value: metrics.pendingOrders },
        { Metric: 'Average Order Value', Value: `$${metrics.averageOrderValue.toFixed(2)}` },
        { Metric: 'Total Products Ordered', Value: metrics.totalProducts }
      ];
      
      if (reportScope === 'client') {
        summaryData.push({ Metric: 'Sites Included', Value: metrics.uniqueSites });
      }
      
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'Metric', width: 25 },
        { header: 'Value', key: 'Value', width: 25 }
      ];
      summaryData.forEach(data => {
        summarySheet.addRow(data);
      });

      const fileName = `${reportScope === 'client' ? 'Client' : 'Site'}_${scopeName.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([new Uint8Array(buffer as unknown as ArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully!');
      });
    } catch (error) {
      logger.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Report Scope Selector */}
      <Card className="border-2 border-[#D91C81]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#D91C81]" />
            Report Scope
          </CardTitle>
          <CardDescription>
            Choose whether to view reports at the client or site level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reporting Level
              </label>
              <Select value={reportScope} onValueChange={(value: 'site' | 'client') => setReportScope(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Site Level
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Client Level
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportScope === 'client' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Client
                </label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClientId && clientSites.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Includes data from {clientSites.length} site{clientSites.length !== 1 ? 's' : ''}: {clientSites.map(s => s.name).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Site
                </label>
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a site..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Only show reports if a scope is selected */}
      {((reportScope === 'site' && selectedSiteId) || (reportScope === 'client' && selectedClientId)) ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {reportScope === 'client' ? 'Client-Level' : 'Site-Level'} Reports & Analytics
              </h2>
              <p className="text-gray-600 mt-1">
                {reportScope === 'client' 
                  ? `Aggregated data across all sites for ${scopeName}`
                  : `Detailed metrics for ${scopeName}`
                }
              </p>
              {reportScope === 'client' && metrics.uniqueSites > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-[#00B4CC] text-white">
                    <Globe className="w-3 h-3 mr-1" />
                    {metrics.uniqueSites} Site{metrics.uniqueSites !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              onClick={exportToExcel}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              disabled={filteredOrders.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D91C81]" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#1B2A5E]" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#00B4CC]" />
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.deliveredOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.pendingOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#8B5CF6]" />
                  Avg Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.averageOrderValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F59E0B]" />
                  Products Ordered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalProducts}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Order Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-[#D91C81]" />
                      Order Status Distribution
                    </CardTitle>
                    <CardDescription>
                      Breakdown of orders by current status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          {...({ outerRadius: 100 } as any)}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Orders Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#1B2A5E]" />
                      Orders Over Time
                    </CardTitle>
                    <CardDescription>
                      Daily order volume (Last 7 days)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ordersByDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line {...({ type: "monotone", dataKey: "orders", stroke: "#D91C81", strokeWidth: 2 } as any)} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Revenue by Product */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#00B4CC]" />
                      Top 5 Products by Revenue
                    </CardTitle>
                    <CardDescription>
                      Best performing products in the current period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByProduct}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="product" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#00B4CC" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#D91C81]" />
                    Filter Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={giftRedeemedFilter} onValueChange={setGiftRedeemedFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Gift Redeemed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="redeemed">Redeemed</SelectItem>
                        <SelectItem value="not_redeemed">Not Redeemed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {startDate && endDate ? (
                            `${format(startDate, 'LLL dd, yyyy')} - ${format(endDate, 'LLL dd, yyyy')}`
                          ) : (
                            'Select Date Range'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex items-center space-x-1">
                          <CalendarComponent
                            mode="range"
                            selected={startDate && endDate ? { from: startDate, to: endDate } : undefined}
                            onSelect={(range) => {
                              if (range?.from) setStartDate(range.from);
                              if (range?.to) setEndDate(range.to);
                            }}
                            numberOfMonths={2}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#1B2A5E]" />
                      Order List
                    </span>
                    <Badge variant="secondary">
                      {filteredOrders.length} orders
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Order #</th>
                          {reportScope === 'client' && (
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Site</th>
                          )}
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Qty</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Redeemed</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </td>
                            {reportScope === 'client' && (
                              <td className="py-3 px-4 text-sm text-gray-700">
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-gray-400" />
                                  {order.siteName}
                                </div>
                              </td>
                            )}
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                <div className="text-xs text-gray-500">{order.customerEmail}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {order.productName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {order.quantity}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[order.status]}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {order.giftRedeemed ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-medium">Yes</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">No</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewOrderDetails(order)}
                                className="text-[#D91C81] hover:text-[#B01669] hover:bg-pink-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No orders found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Order Detail Modal */}
          <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Complete information for order {selectedOrder?.orderNumber}
                </DialogDescription>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6">
                  {reportScope === 'client' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#00B4CC]" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Site: {selectedOrder.siteName}</p>
                          <p className="text-xs text-gray-600">Client: {selectedOrder.clientName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Order #:</span> {selectedOrder.orderNumber}</p>
                        <p><span className="font-medium">Status:</span> <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge></p>
                        <p><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                        {selectedOrder.deliveryDate && (
                          <p><span className="font-medium">Delivered:</span> {new Date(selectedOrder.deliveryDate).toLocaleString()}</p>
                        )}
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Gift Redeemed:</span>
                          {selectedOrder.giftRedeemed ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500">
                              <XCircle className="w-4 h-4" />
                              No
                            </span>
                          )}
                        </p>
                        {selectedOrder.redemptionDate && (
                          <p><span className="font-medium">Redeemed:</span> {new Date(selectedOrder.redemptionDate).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Product Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{selectedOrder.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {selectedOrder.quantity}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Please select a report scope to view data.</p>
        </div>
      )}
    </div>
  );
}