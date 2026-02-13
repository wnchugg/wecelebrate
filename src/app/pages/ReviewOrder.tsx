import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Package, MapPin, User, CreditCard, Edit, CheckCircle } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

// Mock company config - in real app, load from site settings
const companyConfig = {
  allowQuantitySelection: true,
  maxQuantity: 5,
  shippingMethod: 'individual' // or 'company'
};

export function ReviewOrder() {
  const navigate = useNavigate();
  const { selectedGift, quantity, shippingAddress } = useOrder();
  const { userIdentifier } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const allowQuantity = companyConfig.allowQuantitySelection;

  useEffect(() => {
    if (!selectedGift || !shippingAddress) {
      navigate('/gift-selection');
    }
  }, [selectedGift, shippingAddress, navigate]);

  const handleSubmitOrder = async () => {
    if (!selectedGift || !shippingAddress) {
      setError('Missing required information');
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get session token
      const sessionToken = sessionStorage.getItem('employee_session');
      
      if (!sessionToken) {
        toast.error('Session expired. Please log in again.');
        navigate('/access');
        return;
      }
      
      // Call backend API to create order
      const env = getCurrentEnvironment();
      const apiUrl = buildApiUrl(env);
      
      const orderPayload = {
        siteId: env.id,
        userId: userIdentifier,
        giftId: selectedGift.id,
        quantity: quantity,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          addressLine1: shippingAddress.street,
          addressLine2: '', // No address2 in ShippingAddress interface
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'United States',
          phone: shippingAddress.phone || ''
        },
      };
      
      const response = await fetch(`${apiUrl}/public/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id,
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      // Order created successfully!
      toast.success('Order placed successfully! 🎉');
      
      setIsSubmitting(false);
      
      // Navigate to confirmation page with order ID
      navigate(`/confirmation/${data.order.id}`);
    } catch (error: unknown) {
      logger.error('Failed to submit order:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit order. Please try again.');
      toast.error(error instanceof Error ? error.message : 'Failed to submit order');
      setIsSubmitting(false);
    }
  };

  if (!selectedGift || !shippingAddress) {
    return null;
  }

  const isCompanyShipping = companyConfig.shippingMethod === 'company';

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-pink-100 text-[#D91C81] px-4 py-2 rounded-full mb-4">
            <p className="text-sm font-medium">{t('review.step')}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('review.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('review.reviewBeforeConfirm')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Selected Gift */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-7 h-7 text-[#D91C81]" />
                {t('review.selectedGift')}
              </h2>
              <button
                onClick={() => navigate('/gift-selection')}
                className="flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                {t('review.change')}
              </button>
            </div>

            <div className="flex gap-6">
              <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={selectedGift.image}
                  alt={selectedGift.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="inline-block bg-pink-100 text-[#D91C81] px-3 py-1 rounded-full text-sm font-medium">
                    {selectedGift.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedGift.name}
                </h3>
                <p className="text-gray-600 mb-4">{selectedGift.description}</p>
                {allowQuantity && (
                  <p className="text-lg font-semibold text-gray-900">{t('review.quantity')} {quantity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-7 h-7 text-[#00B4CC]" />
                {t('review.shippingInformation')}
              </h2>
              <button
                onClick={() => navigate('/shipping')}
                className="flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                {t('review.change')}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              {isCompanyShipping && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-[#00B4CC] mb-1">{t('review.companyDeliveryNotice')}</p>
                  <p className="text-sm text-gray-600">
                    {t('review.companyDeliveryDesc')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('review.recipient')}</p>
                  <p className="text-gray-900 font-semibold">{shippingAddress.fullName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">{t('review.deliveryAddress')}</p>
                  <p className="text-gray-900">{shippingAddress.street}</p>
                  <p className="text-gray-900">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-900">{shippingAddress.country}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">{t('review.phoneLabel')}</p>
                  <p className="text-gray-900">{shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Notice */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
            <h3 className="font-semibold text-[#1B2A5E] mb-2">{t('review.orderConfirmationTitle')}</h3>
            <p className="text-sm text-gray-700">
              {t('review.orderConfirmationDesc')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="flex items-center gap-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-12 py-5 rounded-xl font-bold text-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 28, 129, 0.4)')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 28, 129, 0.3)')}
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('review.processingOrder')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  {t('review.confirmOrder')}
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}