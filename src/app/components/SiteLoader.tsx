import React, { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { logger } from '../utils/logger';

interface SiteLoaderProps {
  siteId: string;
  children: React.ReactNode;
}

export function SiteLoader({ siteId, children }: SiteLoaderProps) {
  const { sites, setCurrentSite } = useSite();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastLoadedSiteId, setLastLoadedSiteId] = useState<string | null>(null);

  // Load site data when siteId changes
  useEffect(() => {
    if (siteId && siteId !== lastLoadedSiteId) {
      logger.log('[SiteLoader] Loading site:', siteId);
      setIsInitialized(false);
      
      // Clear any stale localStorage site ID to prevent conflicts
      localStorage.removeItem('jala2_current_site_id');
      
      // Find the site from the sites array
      const site = sites.find(s => s.id === siteId);
      if (site) {
        setCurrentSite(site);
        logger.log('[SiteLoader] Site loaded successfully:', siteId);
        setIsInitialized(true);
        setLastLoadedSiteId(siteId);
        // Store site selection in session storage
        sessionStorage.setItem('selected_site_id', siteId);
      } else {
        logger.error('[SiteLoader] Site not found:', siteId);
        setIsInitialized(true);
        setLastLoadedSiteId(siteId);
      }
    } else if (!siteId) {
      logger.error('[SiteLoader] No siteId provided in URL');
      setIsInitialized(true);
    }
  }, [siteId, sites, setCurrentSite, lastLoadedSiteId]);

  // Show loading state while loading the site
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading site...</p>
        </div>
      </div>
    );
  }

  // Render child routes once site is loaded
  return <>{children}</>;
}