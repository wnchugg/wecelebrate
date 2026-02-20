import { useState } from 'react';
import { usePrivacy } from '../context/PrivacyContext';
import { Cookie, Settings } from 'lucide-react';

export function CookieConsent() {
  const { showConsentBanner, acceptAll, rejectAll, updateConsent, preferences } = usePrivacy();
  const [showDetails, setShowDetails] = useState(false);
  const [customConsents, setCustomConsents] = useState(preferences.consents);

  if (!showConsentBanner) return null;

  const handleCustomize = () => {
    updateConsent(customConsents);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Cookie className="w-5 h-5 text-[#D91C81]" aria-hidden="true" />
            </div>
            <h2 id="cookie-consent-title" className="text-xl font-bold text-gray-900">
              Privacy & Cookie Preferences
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div id="cookie-consent-description">
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to provide you with a better experience. 
              By clicking "Accept All", you consent to the use of ALL cookies. However, you may 
              customize your preferences or reject non-essential cookies.
            </p>
            <p className="text-sm text-gray-600">
              We respect your privacy and are committed to protecting your personal data in 
              accordance with GDPR, CCPA, and other privacy regulations.
            </p>
          </div>

          {!showDetails ? (
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2 rounded-lg px-2 py-1"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Customize Settings
            </button>
          ) : (
            <div className="space-y-4 border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" aria-hidden="true" />
                Cookie Categories
              </h3>

              {/* Necessary Cookies */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  id="consent-necessary"
                  checked={true}
                  disabled
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  aria-describedby="necessary-description"
                />
                <div className="flex-1">
                  <label htmlFor="consent-necessary" className="font-medium text-gray-900 block">
                    Necessary Cookies <span className="text-xs text-gray-500">(Always Active)</span>
                  </label>
                  <p id="necessary-description" className="text-sm text-gray-600 mt-1">
                    Essential for the website to function. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  id="consent-functional"
                  checked={customConsents.functional}
                  onChange={(e) => setCustomConsents(prev => ({ ...prev, functional: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  aria-describedby="functional-description"
                />
                <div className="flex-1">
                  <label htmlFor="consent-functional" className="font-medium text-gray-900 block cursor-pointer">
                    Functional Cookies
                  </label>
                  <p id="functional-description" className="text-sm text-gray-600 mt-1">
                    Remember your preferences like language selection.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  id="consent-analytics"
                  checked={customConsents.analytics}
                  onChange={(e) => setCustomConsents(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  aria-describedby="analytics-description"
                />
                <div className="flex-1">
                  <label htmlFor="consent-analytics" className="font-medium text-gray-900 block cursor-pointer">
                    Analytics Cookies
                  </label>
                  <p id="analytics-description" className="text-sm text-gray-600 mt-1">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-marketing"
                  checked={customConsents.marketing}
                  onChange={(e) => setCustomConsents(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  aria-describedby="marketing-description"
                />
                <div className="flex-1">
                  <label htmlFor="consent-marketing" className="font-medium text-gray-900 block cursor-pointer">
                    Marketing Cookies
                  </label>
                  <p id="marketing-description" className="text-sm text-gray-600 mt-1">
                    Used to deliver personalized advertisements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a 
              href="#privacy-policy" 
              className="text-[#D91C81] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D91C81] rounded"
            >
              Privacy Policy
            </a>
            <a 
              href="#cookie-policy" 
              className="text-[#D91C81] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D91C81] rounded"
            >
              Cookie Policy
            </a>
            <a 
              href="#ccpa-rights" 
              className="text-[#D91C81] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D91C81] rounded"
            >
              Your Privacy Rights (CCPA)
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
          {showDetails ? (
            <>
              <button
                onClick={handleCustomize}
                className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="sm:w-auto px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <button
                onClick={acceptAll}
                className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 sm:flex-initial sm:w-auto px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Reject Non-Essential
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}