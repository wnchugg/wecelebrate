import { useState, useEffect, Suspense } from 'react';
import { useParams, Outlet } from 'react-router';
import { usePublicSite } from '../context/PublicSiteContext';
import { logger } from '../utils/logger';

/**
 * Loading fallback for lazy-loaded routes within SiteLoaderWrapper
 */
function SiteRouteFallback() {
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
 * SiteLoaderWrapper - Loads a specific site based on the URL parameter
 * Used for routes like /site/:siteId to allow viewing different sites
 */
export function SiteLoaderWrapper() {
  const { siteId } = useParams<{ siteId: string }>();
  const { setSiteById, site, isLoading, error } = usePublicSite();

  useEffect(() => {
    if (siteId) {
      logger.info('[SiteLoaderWrapper] Loading site', { siteId });
      setSiteById(siteId);
    }
  }, [siteId, setSiteById]);

  // Show loading state while site is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading site...</p>
        </div>
      </div>
    );
  }

  // Show error state if site failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01666] transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // Show error if site doesn't match (shouldn't happen, but just in case)
  if (!site || site.id !== siteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading site...</p>
        </div>
      </div>
    );
  }

  // Render child routes once site is loaded
  return (
    <Suspense fallback={<SiteRouteFallback />}>
      <Outlet />
    </Suspense>
  );
}

export default SiteLoaderWrapper;