import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { publicSiteApi, PublicSite, PublicGift } from '../utils/api';

export interface PublicSiteContextType {
  site: PublicSite | null;
  currentSite: PublicSite | null; // Alias for compatibility
  gifts: PublicGift[];
  isLoading: boolean;
  error: string | null;
  refreshSite: () => Promise<void>;
  setSiteById: (siteId: string) => Promise<void>;
  setSiteBySlug: (slug: string) => Promise<void>;
  availableSites: PublicSite[];
}

const PublicSiteContext = createContext<PublicSiteContextType | undefined>(undefined);

export function PublicSiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<PublicSite | null>(null);
  const [gifts, setGifts] = useState<PublicGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSites, setAvailableSites] = useState<PublicSite[]>([]);

  const applyBranding = useCallback((branding: PublicSite['branding']) => {
    if (!branding) {
      console.warn('[PublicSiteContext] No branding provided');
      return;
    }
    
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', branding.secondaryColor);
    }
    if (branding.accentColor) {
      document.documentElement.style.setProperty('--color-accent', branding.accentColor);
    }
  }, []);

  const loadGiftsForSite = useCallback(async (siteId: string) => {
    try {
      const { gifts: siteGifts } = await publicSiteApi.getSiteGifts(siteId);
      setGifts(siteGifts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isSiteNotFound = errorMessage.includes('Site not found') || errorMessage.includes('404');
      
      // Don't log "Site not found" errors - this is expected when database isn't initialized
      if (!isSiteNotFound && !(err instanceof TypeError && errorMessage.includes('fetch'))) {
        console.error('[PublicSiteContext] Failed to load gifts:', err);
      }
      // Don't set error state - gifts are optional
      setGifts([]);
    }
  }, []);

  const loadSite = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load all available sites
      const { sites } = await publicSiteApi.getActiveSites();
      
      // Check if no sites were returned (database not initialized)
      if (!sites || sites.length === 0) {
        console.warn('[PublicSiteContext] No sites available - database may not be initialized');
        setError('DATABASE_NOT_INITIALIZED');
        setIsLoading(false);
        return;
      }
      
      setAvailableSites(sites);
      
      // Check if there's a saved site selection
      const savedSiteId = sessionStorage.getItem('selected_site_id');
      const savedSiteData = sessionStorage.getItem('selected_site_data');
      
      let selectedSite: PublicSite | null = null;
      
      // Try to use saved site first
      if (savedSiteId && savedSiteData) {
        try {
          const parsedSite = JSON.parse(savedSiteData);
          // Verify the site still exists in the available sites
          if (sites.find((s: PublicSite) => s.id === savedSiteId)) {
            selectedSite = parsedSite;
          }
        } catch (e) {
          console.error('[PublicSiteContext] Failed to parse saved site data:', e);
        }
      }
      
      // If no saved site, find the first active site
      if (!selectedSite) {
        selectedSite = sites.find((s: PublicSite) => s.status === 'active') || sites[0] || null;
      }
      
      if (selectedSite) {
        setSite(selectedSite);
        
        // Apply branding to the document
        applyBranding(selectedSite.branding);
        
        // Load gifts for this site
        await loadGiftsForSite(selectedSite.id);
      } else {
        console.warn('[PublicSiteContext] No sites available');
        setError('No sites available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isSiteNotFound = errorMessage.includes('Site not found') || errorMessage.includes('404');
      
      // Check if this is a fetch failure (backend not deployed)
      const isFetchError = err instanceof TypeError && String(err).includes('fetch');
      
      if (isSiteNotFound) {
        // Database not initialized - don't log as error, this is expected
        console.warn('[PublicSiteContext] Database not initialized - no sites found');
        setError('DATABASE_NOT_INITIALIZED');
      } else if (isFetchError) {
        // Backend not deployed - silently use fallback (no console message needed)
        console.warn('[PublicSiteContext] Backend not available');
        setError('BACKEND_NOT_AVAILABLE');
      } else if (import.meta.env.DEV) {
        // Only log in development mode
        console.warn('[PublicSiteContext] Using fallback site configuration');
      }
      
      // Create a default fallback site
      const fallbackSite: PublicSite = {
        id: 'fallback',
        name: 'JALA Gifting',
        clientId: 'default',
        domain: window.location.hostname,
        status: 'active',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          accentColor: '#00B4CC',
        },
        settings: {
          validationMethod: 'email',
          allowMultipleSelections: false,
          requireShipping: true,
          supportEmail: 'support@jala.com',
          languages: ['en'],
          defaultLanguage: 'en',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setSite(fallbackSite);
      applyBranding(fallbackSite.branding);
      setAvailableSites([fallbackSite]);
      
      // Clear error since we have a fallback site
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setSiteById = useCallback(async (siteId: string) => {
    setIsLoading(true);
    setError(null);
    
    console.warn('[PublicSiteContext] setSiteById called with:', siteId);
    
    try {
      const response = await publicSiteApi.getSiteById(siteId);
      
      console.warn('[PublicSiteContext] Full API response:', JSON.stringify(response, null, 2));
      console.warn('[PublicSiteContext] response.site:', response.site);
      
      const selectedSite = response?.site;
      
      if (!selectedSite) {
        console.error('[PublicSiteContext] Site is null/undefined in API response');
        console.error('[PublicSiteContext] Full response object:', response);
        setError(`Site "${siteId}" not found in current environment`);
        setIsLoading(false);
        return;
      }
      
      console.warn('[PublicSiteContext] Site data received:', {
        id: selectedSite.id,
        name: selectedSite.name,
        validationMethod: selectedSite.settings?.validationMethod,
        hasBranding: !!selectedSite.branding,
        primaryColor: selectedSite.branding?.primaryColor
      });
      
      setSite(selectedSite);
      
      // Save to session storage
      sessionStorage.setItem('selected_site_id', selectedSite.id);
      sessionStorage.setItem('selected_site_data', JSON.stringify(selectedSite));
      
      // Apply branding to the document
      applyBranding(selectedSite.branding);
      
      // Load gifts for this site
      await loadGiftsForSite(selectedSite.id);
      
      console.warn('[PublicSiteContext] Site loaded successfully:', selectedSite.name);
    } catch (err) {
      console.error('[PublicSiteContext] Error loading site:', err);
      console.error('[PublicSiteContext] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        siteId
      });
      
      // Check if this is a "Site not found" error (404)
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isSiteNotFound = errorMessage.includes('Site not found') || errorMessage.includes('404');
      
      // Check if this is a fetch failure (backend not deployed)
      const isFetchError = err instanceof TypeError && String(err).includes('fetch');
      
      if (isSiteNotFound) {
        console.error('[PublicSiteContext] Site not found - database may not be initialized');
        setError('Database not initialized. Please navigate to the homepage to initialize the database.');
      } else if (isFetchError) {
        console.error('[PublicSiteContext] Backend fetch failed - backend may not be deployed');
        setError('Backend server not available. Please check deployment.');
      } else if (import.meta.env.DEV) {
        console.warn('[PublicSiteContext] Using fallback site configuration');
      }
      
      // Create a default fallback site
      const fallbackSite: PublicSite = {
        id: 'fallback',
        name: 'JALA Gifting',
        clientId: 'default',
        domain: window.location.hostname,
        status: 'active',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          accentColor: '#00B4CC',
        },
        settings: {
          validationMethod: 'email',
          allowMultipleSelections: false,
          requireShipping: true,
          supportEmail: 'support@jala.com',
          languages: ['en'],
          defaultLanguage: 'en',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setSite(fallbackSite);
      applyBranding(fallbackSite.branding);
      
      // Clear error since we have a fallback site
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyBranding, loadGiftsForSite]); // useCallback dependencies for setSiteById

  const setSiteBySlug = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    
    console.warn('[PublicSiteContext] setSiteBySlug called with:', slug);
    
    try {
      const response = await publicSiteApi.getSiteBySlug(slug);
      
      console.warn('[PublicSiteContext] Full API response:', JSON.stringify(response, null, 2));
      console.warn('[PublicSiteContext] response.site:', response.site);
      console.warn('[PublicSiteContext] response.site.settings:', response.site?.settings);
      
      const selectedSite = response?.site;
      
      if (!selectedSite) {
        console.error('[PublicSiteContext] Site is null/undefined in API response');
        console.error('[PublicSiteContext] Full response object:', response);
        setError(`Site with slug "${slug}" not found in current environment`);
        setIsLoading(false);
        return;
      }
      
      console.warn('[PublicSiteContext] Site data received:', {
        id: selectedSite.id,
        name: selectedSite.name,
        slug: selectedSite.slug,
        validationMethod: selectedSite.settings?.validationMethod,
        skipLandingPage: selectedSite.settings?.skipLandingPage,
        hasBranding: !!selectedSite.branding,
        primaryColor: selectedSite.branding?.primaryColor
      });
      
      setSite(selectedSite);
      
      // Save to session storage
      sessionStorage.setItem('selected_site_id', selectedSite.id);
      sessionStorage.setItem('selected_site_data', JSON.stringify(selectedSite));
      
      // Apply branding to the document
      applyBranding(selectedSite.branding);
      
      // Load gifts for this site
      await loadGiftsForSite(selectedSite.id);
      
      console.warn('[PublicSiteContext] Site loaded successfully:', selectedSite.name);
    } catch (err) {
      console.error('[PublicSiteContext] Error loading site by slug:', err);
      console.error('[PublicSiteContext] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        slug
      });
      
      // Check if this is a "Site not found" error (404)
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isSiteNotFound = errorMessage.includes('Site not found') || errorMessage.includes('404');
      
      // Check if this is a fetch failure (backend not deployed)
      const isFetchError = err instanceof TypeError && String(err).includes('fetch');
      
      if (isSiteNotFound) {
        console.error('[PublicSiteContext] Site not found - database may not be initialized');
        setError('Site not found. Please check the URL and try again.');
      } else if (isFetchError) {
        console.error('[PublicSiteContext] Backend fetch failed - backend may not be deployed');
        setError('Backend server not available. Please check deployment.');
      } else if (import.meta.env.DEV) {
        console.warn('[PublicSiteContext] Using fallback site configuration');
      }
      
      // Create a default fallback site
      const fallbackSite: PublicSite = {
        id: 'fallback',
        name: 'JALA Gifting',
        clientId: 'default',
        domain: window.location.hostname,
        status: 'active',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          accentColor: '#00B4CC',
        },
        settings: {
          validationMethod: 'email',
          allowMultipleSelections: false,
          requireShipping: true,
          supportEmail: 'support@jala.com',
          languages: ['en'],
          defaultLanguage: 'en',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setSite(fallbackSite);
      applyBranding(fallbackSite.branding);
      
      // Clear error since we have a fallback site
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyBranding, loadGiftsForSite]); // useCallback dependencies for setSiteBySlug

  useEffect(() => {
    void loadSite();
  }, []);

  const refreshSite = async () => {
    await loadSite();
  };

  return (
    <PublicSiteContext.Provider value={{ site, currentSite: site, gifts, isLoading, error, refreshSite, setSiteById, setSiteBySlug, availableSites }}>
      {children}
    </PublicSiteContext.Provider>
  );
}

export function usePublicSite() {
  const context = useContext(PublicSiteContext);
  if (context === undefined) {
    throw new Error('usePublicSite must be used within a PublicSiteProvider');
  }
  return context;
}