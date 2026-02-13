import { useState, useEffect, Suspense } from 'react';
import { useParams, Outlet } from 'react-router';
import { useSite } from '../context/SiteContext';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { publicAnonKey } from '../../../utils/supabase/info';
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
  const { sites, currentSite, setCurrentSite } = useSite();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSite() {
      if (!siteId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, try to find the site in the context (for authenticated admins)
        const contextSite = sites.find(s => s.id === siteId);
        if (contextSite) {
          setCurrentSite(contextSite);
          setIsLoading(false);
          return;
        }

        // If not in context, fetch it from the public API (for demo sites)
        logger.info('[SiteLoaderWrapper] Site not in context, fetching from API', { siteId });
        const env = getCurrentEnvironment();
        const response = await fetch(
          `${env.apiBaseUrl}/public/sites/${siteId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load site: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.site) {
          setCurrentSite(data.site);
        } else {
          setError('Site not found');
        }
      } catch (err) {
        console.error('[SiteLoaderWrapper] Error loading site:', err);
        setError(err instanceof Error ? err.message : 'Failed to load site');
      } finally {
        setIsLoading(false);
      }
    }

    loadSite();
  }, [siteId, sites, setCurrentSite]);

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
  if (!currentSite || currentSite.id !== siteId) {
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