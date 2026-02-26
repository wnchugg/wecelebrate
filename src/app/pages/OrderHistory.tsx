import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { Package, ArrowLeft, Calendar, Eye, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { useDateFormat } from '../hooks/useDateFormat';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  giftName: string;
  giftImageUrl: string;
  quantity: number;
  totalValue: number;
  createdAt: string;
}

export function OrderHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatShortDate } = useDateFormat();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session token and employee ID
        const sessionToken = sessionStorage.getItem('employee_session');
        const employeeId = sessionStorage.getItem('employee_id');
        
        if (!sessionToken || !employeeId) {
          toast.error(t('notification.error.sessionExpired'));
          void navigate('/access');
          return;
        }
        
        // For now, we'll fetch orders from the backend
        // In a real implementation, you'd have a dedicated endpoint
        // GET /public/orders?employeeId={employeeId}
        
        // Placeholder: Return empty array for now
        // TODO: Implement backend endpoint to get orders by employee ID
        setOrders([]);
        
        toast.info(t('notification.info.orderHistoryComingSoon'));
      } catch (error: any) {
        logger.error('Failed to load orders:', error);
        setError(error.message || 'Failed to load order history');
        toast.error(error.message || t('notification.error.failedToLoadOrders'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-8 w-[88px]" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>

        <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-10 w-64 mx-auto mb-2" />
              <Skeleton className="h-6 w-48 mx-auto" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => void navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-8 w-[88px]">
                <Logo />
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Order History
            </h1>
            <p className="text-lg text-gray-600">
              View all your past orders
            </p>
          </div>

          {/* Empty State */}
          {orders.length === 0 && !error && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start browsing our gift catalog!
              </p>
              <Link
                to="/gift-selection"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Package className="w-5 h-5" />
                Browse Gifts
              </Link>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Gift Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={order.giftImageUrl}
                        alt={order.giftName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {order.giftName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order #{order.orderNumber}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatShortDate(order.createdAt)}
                        </div>
                        <div>
                          Quantity: {order.quantity}
                        </div>
                        <div>
                          Total: <CurrencyDisplay amount={order.totalValue} />
                        </div>
                      </div>

                      <Link
                        to={`/order-tracking/${order.id}`}
                        className="inline-flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details & Track Order
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}