import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useOrder } from '../context/OrderContext';
import { Gift } from '../context/GiftContext';
import { ArrowLeft, Check, Minus, Plus, ArrowRight } from 'lucide-react';
import { ConfigurableHeader } from '../components/layout/ConfigurableHeader';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { usePublicSite } from '../context/PublicSiteContext';
import { useSite } from '../context/SiteContext';

export function GiftDetail() {
  const { giftId, siteId } = useParams();
  const navigate = useNavigate();
  const { selectedGift, quantity, selectGift, setQuantity } = useOrder();
  const [localQuantity, setLocalQuantity] = useState(1);
  const { t } = useLanguage();
  const [gift, setGift] = useState<Gift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentSite: publicSite } = usePublicSite();
  const { currentSite } = useSite();

  // Get site settings - prefer publicSite (for public users) or currentSite (for admin preview)
  const site = publicSite || currentSite;
  const siteSettings = site?.settings as { allowQuantitySelection?: boolean; giftsPerUser?: number } | undefined;
  const allowQuantity = siteSettings?.allowQuantitySelection ?? false;
  const maxQuantity = siteSettings?.giftsPerUser ?? 1;

  // Load gift details
  useEffect(() => {
    const loadGift = async () => {
      if (!giftId) {
        void navigate('../gift-selection');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session token
        const sessionToken = sessionStorage.getItem('employee_session');
        
        if (!sessionToken) {
          toast.error('Session expired. Please log in again.');
          void navigate('../access');
          return;
        }
        
        // Fetch gift from backend
        const env = getCurrentEnvironment();
        const apiUrl = buildApiUrl(env);
        
        const response = await fetch(`${apiUrl}/public/gifts/${giftId}`, {
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'X-Environment-ID': env.id,
            'X-Session-Token': sessionToken
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load gift');
        }
        
        if (!data.gift) {
          setError('Gift not found');
          toast.error('Gift not found');
          setTimeout(() => navigate('../gift-selection'), 2000);
        } else {
          setGift(data.gift);
        }
      } catch (error: unknown) {
        logger.error('Failed to load gift:', error);
        setError(error instanceof Error ? error.message : 'Failed to load gift details');
        toast.error(error instanceof Error ? error.message : 'Failed to load gift');
        setTimeout(() => navigate('../gift-selection'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    void loadGift();
  }, [giftId, navigate]);

  useEffect(() => {
    // If this gift is already selected, use the existing quantity
    if (selectedGift?.id === giftId) {
      setLocalQuantity(quantity);
    } else {
      setLocalQuantity(1);
    }
  }, [selectedGift, giftId, quantity]);

  if (!gift) {
    return null;
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = localQuantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setLocalQuantity(newQuantity);
    }
  };

  const handleSelectGift = () => {
    selectGift(gift);
    setQuantity(localQuantity);
    // Use relative navigation to stay within site context
    void navigate('../shipping-information');
  };

  const isCurrentlySelected = selectedGift?.id === giftId;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-bold mb-4">{error}</p>
          <p className="text-gray-600">{t('common.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress Steps */}
      <ConfigurableHeader />

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('../gift-selection')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t('common.back')}</span>
          </button>

          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="relative h-96 md:h-full bg-gray-100">
                <img
                  src={gift.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'}
                  alt={gift.name}
                  className="w-full h-full object-cover"
                />
                {isCurrentlySelected && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg">
                    <Check className="w-5 h-5" />
                    {t('giftDetail.currentlySelected')}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-8 md:p-12 flex flex-col">
                <div className="flex-1">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-pink-100 text-[#D91C81] px-4 py-2 rounded-full text-sm font-semibold">
                      {gift.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {gift.name}
                  </h1>

                  {/* Description */}
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {gift.description}
                  </p>

                  {/* Quantity Selector (if enabled) */}
                  {allowQuantity && (
                    <div className="mb-8 border-t border-gray-200 pt-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        {t('giftDetail.selectQuantity')}
                      </label>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={localQuantity <= 1}
                          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="text-center min-w-[80px]">
                          <div className="text-4xl font-bold text-gray-900">{localQuantity}</div>
                          <div className="text-sm text-gray-500">
                            {localQuantity === 1 ? t('giftDetail.item') : t('giftDetail.items')}
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={localQuantity >= maxQuantity}
                          className="w-12 h-12 bg-gradient-to-r from-[#D91C81] to-[#B71569] rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        {t('giftDetail.maximumPerOrder')} {maxQuantity} {maxQuantity === 1 ? t('giftDetail.item') : t('giftDetail.items')} {t('giftDetail.perOrder')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mt-8">
                  <button
                    onClick={handleSelectGift}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
                    style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 28, 129, 0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 28, 129, 0.3)'}
                  >
                    {isCurrentlySelected ? t('giftDetail.updateSelection') : t('giftDetail.selectThisGift')}
                    <ArrowRight className="w-6 h-6" />
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    {t('giftDetail.reviewNotice')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Specifications */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            {/* Features */}
            {gift.features && gift.features.length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('giftDetail.features')}</h2>
                <ul className="space-y-3">
                  {gift.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {gift.specifications && Object.keys(gift.specifications).length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('giftDetail.specifications')}</h2>
                <dl className="space-y-3">
                  {Object.entries(gift.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                      <dt className="font-semibold text-gray-700">{key}</dt>
                      <dd className="text-gray-600 text-right">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Long Description */}
          <div className="mt-8 bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('giftDetail.description')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {gift.longDescription}
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-xl p-6">
            <h3 className="font-semibold text-[#1B2A5E] mb-2">{t('giftDetail.giftInfoTitle')}</h3>
            <p className="text-sm text-gray-700">
              {t('giftDetail.giftInfoDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}