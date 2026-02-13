import { useState } from 'react';
import { useLanguage, languages } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { t } from '../i18n/translations';

// Translation key categories for testing
const testCategories = [
  {
    name: 'Common/Navigation',
    keys: [
      'common.welcome',
      'common.next',
      'common.previous',
      'common.submit',
      'common.cancel',
    ] as const
  },
  {
    name: 'Landing Page',
    keys: [
      'landing.hero.title',
      'landing.hero.subtitle',
      'landing.hero.cta',
      'landing.features.premium.title',
      'landing.features.premium.desc',
      'landing.features.secure.title',
      'landing.features.delivery.title',
      'landing.howItWorks.title',
    ] as const
  },
  {
    name: 'Validation Methods',
    keys: [
      'validation.title',
      'validation.subtitle',
      'validation.email.title',
      'validation.email.label',
      'validation.email.placeholder',
      'validation.employeeId.title',
      'validation.serialCard.title',
      'validation.magicLink.title',
      'validation.verifyAccess',
    ] as const
  },
  {
    name: 'Gift Selection',
    keys: [
      'gifts.title',
      'gifts.subtitle',
      'gifts.available',
      'gifts.outOfStock',
      'gifts.viewDetails',
      'gifts.selected',
      'gifts.loadingGifts',
      'gifts.curatedSelection',
      'gifts.noResults',
    ] as const
  },
  {
    name: 'Gift Details',
    keys: [
      'giftDetail.description',
      'giftDetail.features',
      'giftDetail.specifications',
      'giftDetail.backToSelection',
      'giftDetail.currentlySelected',
      'giftDetail.selectQuantity',
      'giftDetail.selectThisGift',
      'giftDetail.updateSelection',
      'giftDetail.reviewNotice',
      'giftDetail.giftInfoTitle',
      'giftDetail.giftInfoDesc',
    ] as const
  },
  {
    name: 'Shipping Information',
    keys: [
      'shipping.title',
      'shipping.subtitle',
      'shipping.step',
      'shipping.fullName',
      'shipping.firstName',
      'shipping.lastName',
      'shipping.email',
      'shipping.phone',
      'shipping.address',
      'shipping.city',
      'shipping.state',
      'shipping.zipCode',
      'shipping.country',
      'shipping.companyDelivery',
      'shipping.directDelivery',
      'shipping.deliveryAddress',
      'shipping.continueToReview',
    ] as const
  },
  {
    name: 'Review Order',
    keys: [
      'review.title',
      'review.subtitle',
      'review.step',
      'review.reviewBeforeConfirm',
      'review.giftSelection',
      'review.selectedGift',
      'review.shippingAddress',
      'review.shippingInformation',
      'review.edit',
      'review.change',
      'review.confirmOrder',
      'review.quantity',
      'review.companyDeliveryNotice',
      'review.recipient',
      'review.deliveryAddress',
      'review.orderConfirmationTitle',
      'review.orderConfirmationDesc',
      'review.processingOrder',
    ] as const
  },
  {
    name: 'Confirmation',
    keys: [
      'confirmation.title',
      'confirmation.subtitle',
      'confirmation.successMessage',
      'confirmation.message',
      'confirmation.orderNumber',
      'confirmation.expectedDelivery',
      'confirmation.trackingInfo',
      'confirmation.yourGift',
      'confirmation.shippingTo',
      'confirmation.quantity',
      'confirmation.whatsNext',
      'confirmation.emailConfirmationTitle',
      'confirmation.emailConfirmationDesc',
      'confirmation.shippingNotificationTitle',
      'confirmation.shippingNotificationDesc',
      'confirmation.deliveryUpdatesTitle',
      'confirmation.deliveryUpdatesDesc',
      'confirmation.returnHome',
      'confirmation.needHelp',
      'confirmation.contactSupportWithOrder',
    ] as const
  },
  {
    name: 'Errors',
    keys: [
      'error.general',
      'error.network',
      'error.notFound',
      'error.unauthorized',
      'error.validation',
    ] as const
  }
];

export function LanguageTest() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Common/Navigation']));
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(testCategories.map(cat => cat.name)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Test if a translation key returns a valid non-empty string
  const testTranslation = (key: string): boolean => {
    try {
      const result = t(key as any);
      return typeof result === 'string' && result.length > 0 && result !== key;
    } catch (e) {
      return false;
    }
  };

  // Calculate stats
  const totalKeys = testCategories.reduce((sum, cat) => sum + cat.keys.length, 0);
  const testedKeys = testCategories.flatMap(cat => cat.keys);
  const successCount = testedKeys.filter(key => testTranslation(key)).length;
  const failCount = testedKeys.filter(key => !testTranslation(key)).length;
  const successRate = totalKeys > 0 ? Math.round((successCount / totalKeys) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#2A3B6E] to-[#1B2A5E]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🌍 JALA 2 Language Testing Dashboard</h1>
              <p className="text-white/80 text-sm mt-1">Test all {totalKeys} translation keys across 20 languages (including 5 regional variants + 5 new languages with RTL support)</p>
            </div>
            <LanguageSelector variant="dark" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#D91C81]">{currentLanguage.flag}</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{currentLanguage.name}</div>
              <div className="text-sm text-gray-600">{currentLanguage.code.toUpperCase()}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalKeys}</div>
              <div className="mt-2 text-sm font-medium text-gray-700">Total Keys</div>
              <div className="text-xs text-gray-500">Translation strings</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{successCount}</div>
              <div className="mt-2 text-sm font-medium text-gray-700">Passing</div>
              <div className="text-xs text-gray-500">Valid translations</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${successRate === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {successRate}%
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700">Success Rate</div>
              <div className="text-xs text-gray-500">Coverage status</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Translation Coverage</span>
              <span className="text-sm text-gray-600">{successCount} / {totalKeys}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#D91C81] to-[#00B4CC] h-3 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-[#1B2A5E] text-white rounded-lg hover:bg-[#2A3B6E] transition-colors text-sm font-medium"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* All Languages Quick View */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Supported Languages</h2>
          <p className="text-sm text-gray-600 mb-4">Click on any language to switch and test its translations</p>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang)}
                className={`text-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  currentLanguage.code === lang.code
                    ? 'border-[#D91C81] bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-[#D91C81]/50 hover:bg-pink-50/30'
                }`}
                title={`Switch to ${lang.name}`}
              >
                <div className="text-3xl mb-1">{lang.flag}</div>
                <div className="text-xs font-semibold text-gray-900">{lang.code.toUpperCase()}</div>
                {currentLanguage.code === lang.code && (
                  <CheckCircle2 className="w-4 h-4 text-[#D91C81] mx-auto mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Categories */}
        <div className="space-y-4">
          {testCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const categorySuccess = category.keys.filter(key => testTranslation(key)).length;
            const categoryRate = Math.round((categorySuccess / category.keys.length) * 100);

            return (
              <div key={category.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.keys.length} translation keys</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${categoryRate === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {categoryRate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {categorySuccess}/{category.keys.length}
                      </div>
                    </div>
                    {categoryRate === 100 && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="space-y-3">
                      {category.keys.map((key) => {
                        const isValid = testTranslation(key);
                        const translation = t(key as any);

                        return (
                          <div
                            key={key}
                            className={`p-4 rounded-lg border-2 ${
                              isValid
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {isValid ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-red-600 flex-shrink-0" />
                                  )}
                                  <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded">
                                    {key}
                                  </code>
                                </div>
                                <div className="ml-6">
                                  <p className={`text-sm ${isValid ? 'text-gray-900' : 'text-red-700'}`}>
                                    {translation || <span className="italic">Missing translation</span>}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            {successRate === 100 ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Perfect! All Translations Passing!</h3>
                <p className="text-gray-600">
                  The <strong>{currentLanguage.name}</strong> language has 100% translation coverage across all {totalKeys} keys.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-orange-600 mb-2">Some Translations Need Attention</h3>
                <p className="text-gray-600">
                  Found {failCount} missing or invalid translation{failCount !== 1 ? 's' : ''} in <strong>{currentLanguage.name}</strong>.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}