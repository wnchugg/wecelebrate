import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useOrder } from '../context/OrderContext';
import { CheckCircle, Package, MapPin, Calendar, Home, Sparkles, Loader2 } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { useDateFormat } from '../hooks/useDateFormat';
import { translateWithParams } from '../utils/translationHelpers';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
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
  trackingNumber?: string;
}

// Mock company config - in real app, load from site settings
const companyConfig = {
  allowQuantitySelection: true,
  maxQuantity: 5
};

export function Confirmation() {
  const { orderId, siteId } = useParams();
  const navigate = useNavigate();
  const { clearOrder } = useOrder();
  const { t } = useLanguage();
  const { formatDate } = useDateFormat();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allowQuantity = companyConfig.allowQuantitySelection;

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        navigate('../gift-selection');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session token
        const sessionToken = sessionStorage.getItem('employee_session');
        
        if (!sessionToken) {
          toast.error('Session expired. Please log in again.');
          navigate('../access');
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
        
        // Clear order context since order is now placed
        clearOrder();
      } catch (error: unknown) {
        logger.error('Failed to load order:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details');
        toast.error(error instanceof Error ? error.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrder();
  }, [orderId, navigate, clearOrder]);

  // Calculate estimated delivery date (7 business days from order date)
  const getEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return formatDate(deliveryDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D91C81] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg font-bold mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('../gift-selection')}
            className="text-[#D91C81] hover:text-[#B71569] font-medium"
          >
            Return to Gift Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-[88px]">
              <Logo />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation Banner */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Sparkles className="w-32 h-32 text-[#D91C81] animate-pulse" />
            </div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-2xl animate-bounce">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('confirmation.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {t('confirmation.successMessage')}
            </p>
            
            {/* Estimated Delivery Banner */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00B4CC] to-[#00E5A0] text-white px-6 py-3 rounded-full shadow-lg">
              <Calendar className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-bold">{translateWithParams(t, 'shipping.estimatedDelivery', { date: getEstimatedDelivery(order.createdAt) })}</p>
              </div>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            {/* Order Number */}
            <div className="text-center pb-6 mb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">{t('confirmation.orderNumber')}</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</p>
            </div>

            {/* Gift Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {t('confirmation.yourGift')}
              </h3>
              <div className="flex gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={order.giftImageUrl}
                    alt={order.giftName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{order.giftName}</p>
                  <p className="text-sm text-gray-600">{order.giftCategory}</p>
                  {allowQuantity && (
                    <p className="text-sm text-gray-700 font-medium mt-2">
                      {t('confirmation.quantity')} {order.quantity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {t('confirmation.shippingTo')}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="text-gray-700 text-sm mt-1">{order.shippingAddress.addressLine1}</p>
                <p className="text-gray-700 text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-700 text-sm">{order.shippingAddress.country}</p>
                <p className="text-gray-700 text-sm mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to={`/order-tracking/${orderId}`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4CC] to-[#00E5A0] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Package className="w-5 h-5" />
              Track This Order
            </Link>
            <Link
              to="/my-orders"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              View All Orders
            </Link>
            <Link
              to="/"
              onClick={() => clearOrder()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>{t('confirmation.needHelp')}</p>
            <p className="mt-1">
              {t('confirmation.contactSupportWithOrder')}{' '}
              <span className="font-mono font-semibold text-gray-900">{orderId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}