import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { 
  Package, 
  CheckCircle, 
  Truck, 
  Home, 
  AlertCircle, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { useDateFormat } from '../hooks/useDateFormat';
import { translateWithParams } from '../utils/translationHelpers';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  employeeName: string;
  employeeEmail: string;
  giftName: string;
  giftDescription: string;
  giftCategory: string;
  giftImageUrl: string;
  quantity: number;
  totalValue: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
}

export function OrderTracking() {
  const { orderId, siteId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatDate, formatShortDate, formatTime } = useDateFormat();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        void navigate('../gift-selection');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session token
        const sessionToken = sessionStorage.getItem('employee_session');
        
        if (!sessionToken) {
          toast.error(t('notification.error.sessionExpired'));
          void navigate('../access');
          return;
        }
        
        // Fetch order from backend
        const env = getCurrentEnvironment();
        const apiUrl = buildApiUrl(env);
        
        const response = await fetch(`${apiUrl}/public/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'X-Environment-ID': env.id,
            'X-Session-Token': sessionToken
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load order');
        }
        
        setOrder(data.order);
      } catch (error: any) {
        logger.error('Failed to load order:', error);
        setError(error.message || 'Failed to load order details');
        toast.error(error.message || t('notification.error.failedToLoadOrder'));
      } finally {
        setIsLoading(false);
      }
    };
    
    void loadOrder();
  }, [orderId, navigate]);

  // Calculate estimated delivery date (7 business days from order date)
  const getEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return formatDate(deliveryDate);
  };

  // Define order status timeline
  const getStatusTimeline = (order: Order) => {
    const statuses = [
      {
        key: 'pending',
        label: 'Order Placed',
        description: 'Your order has been received',
        icon: Package,
        completed: true,
        active: order.status === 'pending',
        date: order.createdAt
      },
      {
        key: 'confirmed',
        label: 'Order Confirmed',
        description: 'Your order has been confirmed',
        icon: CheckCircle,
        completed: ['confirmed', 'shipped', 'delivered'].includes(order.status),
        active: order.status === 'confirmed',
        date: order.updatedAt
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'Your order is on the way',
        icon: Truck,
        completed: ['shipped', 'delivered'].includes(order.status),
        active: order.status === 'shipped',
        date: order.shippedAt
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Your order has been delivered',
        icon: Home,
        completed: order.status === 'delivered',
        active: order.status === 'delivered',
        date: order.deliveredAt
      }
    ];
    
    return statuses;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-bold mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => void navigate('/')}
            className="text-[#D91C81] hover:text-[#B71569] font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const timeline = getStatusTimeline(order);
  const estimatedDelivery = getEstimatedDelivery(order.createdAt);

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
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Order Number: <span className="font-mono font-bold text-[#D91C81]">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(order.createdAt, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200">
                <div 
                  className="bg-gradient-to-b from-[#D91C81] to-[#00B4CC] transition-all duration-500"
                  style={{ 
                    height: `${(timeline.filter(s => s.completed).length - 1) * 33.33}%`,
                    width: '100%'
                  }}
                />
              </div>

              {/* Timeline Steps */}
              <div className="space-y-8 relative">
                {timeline.map((status, index) => {
                  const Icon = status.icon;
                  return (
                    <div key={status.key} className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10
                        transition-all duration-300
                        ${status.completed 
                          ? 'bg-gradient-to-br from-[#D91C81] to-[#B71569] text-white shadow-lg' 
                          : status.active
                          ? 'bg-white border-4 border-[#D91C81] text-[#D91C81] animate-pulse'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold text-lg ${
                              status.completed || status.active ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {status.label}
                            </h3>
                            <p className={`text-sm ${
                              status.completed || status.active ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {status.description}
                            </p>
                            {status.date && status.completed && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatShortDate(status.date)} {formatTime(status.date)}
                              </p>
                            )}
                          </div>
                          
                          {status.active && (
                            <span className="bg-[#D91C81] text-white text-xs px-3 py-1 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>

                        {/* Tracking Number */}
                        {status.key === 'shipped' && order.trackingNumber && status.completed && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900 font-medium mb-1">{translateWithParams(t, 'shipping.trackingNumber', { number: order.trackingNumber })}</p>
                            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 underline">
                              Track with carrier
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.status !== 'delivered' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#00B4CC]/10 to-[#00E5A0]/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[#00B4CC]" />
                    <div>
                      <p className="font-bold text-gray-900">{translateWithParams(t, 'shipping.estimatedDelivery', { date: estimatedDelivery })}</p>
                    </div>
                  </div>
                  {order.status === 'shipped' && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                      On Time
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Delivered Banner */}
            {order.status === 'delivered' && order.deliveredAt && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Delivered Successfully!</p>
                      <p className="text-sm text-green-700">
                        {formatDate(order.deliveredAt, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gift Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D91C81]" />
                Gift Details
              </h3>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={order.giftImageUrl}
                    alt={order.giftName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.giftName}</p>
                  <p className="text-sm text-gray-600 mb-2">{order.giftCategory}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Quantity:</span> {order.quantity}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Value:</span> <CurrencyDisplay amount={order.totalValue} />
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00B4CC]" />
                Shipping Address
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              <Package className="w-5 h-5" />
              Print Order Details
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Need help with your order?</p>
            <p className="mt-1">
              Contact support with order number{' '}
              <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}