import { Outlet, useLocation } from 'react-router';
import { Suspense, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EmailTemplateProvider } from '../../context/EmailTemplateContext';
import { ShippingConfigProvider } from '../../context/ShippingConfigContext';
import { GiftProvider } from '../../context/GiftContext';
import { CookieConsent } from '../../components/CookieConsent';

/**
 * Loading fallback for admin routes
 */
function AdminRouteFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading admin...</p>
      </div>
    </div>
  );
}

/**
 * AdminRoot component
 * Provides admin-specific context providers and layout structure
 * Separate from public Root to avoid unnecessary PublicSiteProvider API calls
 */
export function AdminRoot() {
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  
  useEffect(() => {
    // Update document language attribute for screen readers
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage.code]);

  // Log route changes for debugging (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[AdminRoot] Route changed:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <GiftProvider>
      <EmailTemplateProvider>
        <ShippingConfigProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Skip to main content link for keyboard users */}
            <a
              href="#admin-main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D91C81] focus:text-white focus:rounded-lg focus:shadow-lg"
            >
              Skip to admin content
            </a>
            <main id="admin-main-content" className="flex-1">
              <Suspense fallback={<AdminRouteFallback />}>
                <Outlet />
              </Suspense>
            </main>
          </div>
          <CookieConsent />
        </ShippingConfigProvider>
      </EmailTemplateProvider>
    </GiftProvider>
  );
}

export default AdminRoot;