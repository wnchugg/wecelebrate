import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  giftId: string;
  giftName?: string;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  trackingNumber?: string;
  carrier?: string;
  quantity?: number;
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
    description: 'Order received, awaiting processing'
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package,
    description: 'Order is being prepared'
  },
  shipped: { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
    description: 'Package has been shipped'
  },
  in_transit: { 
    label: 'In Transit', 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Truck,
    description: 'Package is on the way'
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Truck,
    description: 'Package is out for delivery'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Package delivered successfully'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Order has been cancelled'
  }
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { orders: loadedOrders } = await apiRequest<{ orders: Order[] }>('/orders');
      // Sort by createdAt desc (newest first)
      const sorted = (loadedOrders || []).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (error: unknown) {
      showErrorToast('Failed to load orders', error instanceof Error ? error.message : 'Unknown error');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status'], trackingNumber?: string, carrier?: string) => {
    try {
      const updates: Partial<Order> = { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      if (trackingNumber) updates.trackingNumber = trackingNumber;
      if (carrier) updates.carrier = carrier;

      await apiRequest(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      showSuccessToast(`Order ${orderId} updated to ${newStatus}`);
      loadOrders();
      setEditingOrder(null);
    } catch (error: unknown) {
      showErrorToast('Failed to update order', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleBulkStatusUpdate = async (status: Order['status']) => {
    if (!confirm(`Update ${selectedOrders.length} order(s) to ${status}?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map(orderId =>
          apiRequest(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, updatedAt: new Date().toISOString() })
          })
        )
      );
      
      showSuccessToast(`${selectedOrders.length} order(s) updated successfully`);
      setSelectedOrders([]);
      loadOrders();
    } catch (error: unknown) {
      showErrorToast('Failed to update orders', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Order ID', 'User Email', 'Gift', 'Status', 'Created Date', 'Tracking Number'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.userEmail || order.userId,
        order.giftName || order.giftId,
        order.status,
        new Date(order.createdAt).toLocaleString(),
        order.trackingNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccessToast('Orders exported successfully');
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.giftName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || order.status === filterStatus;
    
    let matchesDate = true;
    if (filterDateRange) {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      switch (filterDateRange) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        }
        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped' || o.status === 'in_transit' || o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-xs text-gray-600">Processing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              <p className="text-xs text-gray-600">Shipped</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-600">Delivered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-xs text-gray-600">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, user, or gift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#D91C81] text-white rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="font-medium">{selectedOrders.length} order(s) selected</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBulkStatusUpdate('processing')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Mark Processing
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBulkStatusUpdate('shipped')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Mark Shipped
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBulkStatusUpdate('delivered')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Mark Delivered
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedOrders([])}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No orders found</p>
              <p className="text-sm text-gray-500">
                {searchTerm || filterStatus || filterDateRange
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here when customers place them'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Gift</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status]?.icon || Package;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900 font-mono text-sm">{order.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.userEmail || order.userId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{order.giftName || order.giftId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingOrder(order)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                            title="Update Status"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? 'bg-[#D91C81] hover:bg-[#B01669]' : ''}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2 py-1 text-gray-500">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onStatusUpdate={(status, tracking, carrier) => {
          if (viewingOrder) {
            handleUpdateStatus(viewingOrder.id, status, tracking, carrier);
          }
        }}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdate={(status, tracking, carrier) => {
          if (editingOrder) {
            handleUpdateStatus(editingOrder.id, status, tracking, carrier);
          }
        }}
      />
    </div>
  );
}

// Order Detail Modal Component
function OrderDetailModal({ order, onClose, onStatusUpdate }: { order: Order | null, onClose: () => void, onStatusUpdate: (status: Order['status'], tracking?: string, carrier?: string) => void }) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View and update details for order {order.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{order.userEmail || order.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{order.giftName || order.giftId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Quantity: {order.quantity || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Total Amount: ${order.totalAmount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Shipping Address: {order.shippingAddress?.fullName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tracking Number: {order.trackingNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Carrier: {order.carrier || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Notes: {order.notes || 'N/A'}</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => onStatusUpdate('delivered')}
          >
            Mark Delivered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Status Update Modal Component
function StatusUpdateModal({ order, onClose, onUpdate }: { order: Order | null, onClose: () => void, onUpdate: (status: Order['status'], tracking?: string, carrier?: string) => void }) {
  // All hooks must be called unconditionally
  const [status, setStatus] = useState(order?.status || 'pending');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [carrier, setCarrier] = useState(order?.carrier || '');

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the status for order {order.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{order.userEmail || order.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{order.giftName || order.giftId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Quantity: {order.quantity || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Total Amount: ${order.totalAmount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Shipping Address: {order.shippingAddress?.fullName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tracking Number: {order.trackingNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Carrier: {order.carrier || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Notes: {order.notes || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Tracking Number</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Carrier</Label>
            <Input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => onUpdate(status, trackingNumber, carrier)}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}