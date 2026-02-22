import { Outlet, useLocation } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, ReactNode, Suspense } from 'react';
import { PublicSiteProvider, usePublicSite } from '../context/PublicSiteContext';
import { OrderProvider } from '../context/OrderContext';
import { CartProvider } from '../context/CartContext';
import { CookieConsent } from '../components/CookieConsent';
import { DatabaseNotInitialized } from '../components/DatabaseNotInitialized';
import { ConfigurableHeader } from '../components/layout/ConfigurableHeader';
import { ConfigurableFooter } from '../components/layout/ConfigurableFooter';
import { useSite } from '../context/SiteContext';
import { defaultHeaderFooterConfig } from '../types/siteCustomization';
import { mergeHeaderFooterConfig, shouldDisplayHeaderFooter } from '../utils/configMerge';

/**
 * Loading fallback for lazy-loaded child routes
 * Cache-bust: v2-cart-provider-added
 */
function RouteFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inner component that has access to PublicSiteContext and SiteContext
 */
function RootContent({ children }: { children?: ReactNode }) {
  const { error } = usePublicSite();
  const { currentSite, currentClient } = useSite();
  const location = useLocation();
  
  // Don't show database initialization message on these routes
  const excludedRoutes = ['/initialize-database', '/admin', '/system-status'];
  const isExcludedRoute = excludedRoutes.some(route => location.pathname.startsWith(route));
  
  // Show database initialization component if database is not initialized
  if (error === 'DATABASE_NOT_INITIALIZED' && !isExcludedRoute) {
    return <DatabaseNotInitialized error="Database has not been initialized yet." />;
  }
  
  // Merge configurations: Site overrides Client overrides Defaults
  const headerFooterConfig = mergeHeaderFooterConfig(
    defaultHeaderFooterConfig,
    currentClient?.headerFooterConfig,
    currentSite?.headerFooterConfig
  );
  
  // Check if header/footer should be displayed on this route
  const shouldShow = shouldDisplayHeaderFooter(location.pathname, headerFooterConfig.display);
  
  return (
    <>
      {shouldShow && (
        <ConfigurableHeader 
          config={headerFooterConfig.header}
          siteName={currentSite?.name}
          clientName={currentClient?.name}
        />
      )}
      <Suspense fallback={<RouteFallback />}>
        {children || <Outlet />}
      </Suspense>
      {shouldShow && (
        <ConfigurableFooter 
          config={headerFooterConfig.footer}
          siteName={currentSite?.name}
          clientName={currentClient?.name}
        />
      )}
      <CookieConsent />
    </>
  );
}

export function Root({ children }: { children?: ReactNode }) {
  const { currentLanguage } = useLanguage();
  
  useEffect(() => {
    // Update document language attribute for screen readers
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage.code]);

  return (
    <PublicSiteProvider>
      <OrderProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Skip to main content link for keyboard users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D91C81] focus:text-white focus:rounded-lg focus:shadow-lg"
            >
              Skip to main content
            </a>
            <main id="main-content" className="flex-1">
              <RootContent>{children}</RootContent>
            </main>
          </div>
        </CartProvider>
      </OrderProvider>
    </PublicSiteProvider>
  );
}