import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { clientApi, siteApi, apiRequest } from '../utils/api';
import { useAdmin } from './AdminContext';
import { logger } from '../utils/logger';
import { isPublicRoute } from '../utils/routeUtils';
import type { Client as GlobalClient, Site as GlobalSite } from '../../types';

// Extended Client type with additional UX customization
export interface Client extends GlobalClient {
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // NEW: UX Customization Configuration (defaults for all sites)
  headerFooterConfig?: import('../types/siteCustomization').HeaderFooterConfig;
  brandingAssets?: import('../types/siteCustomization').BrandingAssets;
}

export interface Brand {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  description?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extended Site type with complete settings
export interface Site extends Omit<GlobalSite, 'settings'> {
  brandId?: string;
  domain: string;
  // status is inherited from GlobalSite: 'active' | 'inactive' | 'pending' | 'draft'
  templateId?: string;
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    accentColor?: string; // Optional alias for tertiaryColor
    logo?: string;
  };
  settings: {
    validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
    ssoProvider?: 'google' | 'microsoft' | 'okta' | 'azure';
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: 'company' | 'employee' | 'store';
    defaultShippingAddress?: string;
    defaultLanguage: string;
    enableLanguageSelector: boolean;
    welcomeMessage?: string;
    // Landing Page Configuration
    skipLandingPage?: boolean; // If true, go directly to authentication page
    // Welcome Page Configuration
    enableWelcomePage?: boolean; // Show welcome page after authentication
    welcomePageContent?: {
      title?: string;
      message?: string;
      imageUrl?: string;
      authorName?: string; // e.g., "CEO John Smith"
      authorTitle?: string; // e.g., "Chief Executive Officer"
      videoUrl?: string; // Optional video instead of image
      ctaText?: string; // Call-to-action button text
    };
    // Review Order Page Configuration
    skipReviewPage?: boolean; // If true, skip review page and go directly to confirmation
    // Celebration Module Configuration
    celebrationModule?: {
      enabled: boolean;
      standalone: boolean; // If true, runs as standalone; if false, integrated
      allowPeerMessages: boolean;
      allowManagerMessages: boolean;
      allowExternalMessages: boolean;
      requireApproval: boolean; // Moderate messages before displaying
      messageCharLimit: number;
      allowPhotos: boolean;
      allowVideos: boolean;
      displayMode: 'wall' | 'carousel' | 'grid'; // How to display messages
    };
    // International settings
    defaultCurrency: string; // e.g., 'USD', 'EUR', 'GBP'
    allowedCountries: string[]; // ISO country codes, empty array = all countries
    defaultCountry: string; // ISO country code
    // Availability period
    availabilityStartDate?: string; // ISO date string
    availabilityEndDate?: string; // ISO date string
    expiredMessage?: string; // Custom message to show when period is over
    
    // ========== NEW: DEFAULT GIFT CONFIGURATION ==========
    /**
     * ID of gift to be automatically sent if user doesn't make a selection
     * @example "gift-abc123"
     */
    defaultGiftId?: string;
    
    /**
     * Number of days after site closes to send the default gift
     * @minimum 0
     * @maximum 365
     * @default 0 (send immediately when site closes)
     */
    defaultGiftDaysAfterClose?: number;
    
    // ========== NEW: HEADER/FOOTER CONFIGURATION ==========
    /**
     * Display header on all pages
     * @default true
     */
    showHeader?: boolean;
    
    /**
     * Display footer on all pages
     * @default true
     */
    showFooter?: boolean;
    
    /**
     * Header layout style
     * - left: Logo and nav left-aligned
     * - center: Logo centered, nav below
     * - split: Logo left, nav right
     * @default "left"
     */
    headerLayout?: 'left' | 'center' | 'split';
    
    /**
     * Show language selector in header
     * @default true
     */
    showLanguageSelector?: boolean;
    
    /**
     * Company name displayed in header next to logo
     * @maxLength 100
     */
    companyName?: string;
    
    /**
     * Footer text (copyright, legal notice, etc.)
     * @maxLength 500
     * @default "© 2026 All rights reserved."
     */
    footerText?: string;
    
    // ========== NEW: GIFT SELECTION UX CONFIGURATION ==========
    /**
     * Enable search functionality for gifts
     * @default true
     */
    enableSearch?: boolean;
    
    /**
     * Enable category and price range filters
     * @default true
     */
    enableFilters?: boolean;
    
    /**
     * Number of columns in gift grid (desktop)
     * @enum 2 | 3 | 4 | 6
     * @default 3
     */
    gridColumns?: 2 | 3 | 4 | 6;
    
    /**
     * Show gift description text on cards
     * @default true
     */
    showDescription?: boolean;
    
    /**
     * Available sort options for users
     * @minItems 1
     * @default ["name", "price", "popularity"]
     */
    sortOptions?: ('name' | 'price' | 'popularity' | 'newest')[];
    
    // SSO Configuration
    ssoConfig?: {
      enabled: boolean;
      provider: 'saml' | 'oauth2' | 'openid' | 'azure' | 'okta' | 'google' | 'custom';
      // SAML Configuration
      saml?: {
        entryPoint: string; // IdP SSO URL
        issuer: string; // SP Entity ID
        cert: string; // X.509 Certificate
        callbackUrl: string; // Assertion Consumer Service URL
        logoutUrl?: string; // Single Logout Service URL
        signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
        identifierFormat?: string; // Name ID format
      };
      // OAuth2/OpenID Configuration
      oauth?: {
        clientId: string;
        clientSecret: string;
        authorizationUrl: string;
        tokenUrl: string;
        userInfoUrl?: string;
        scope: string; // e.g., "openid profile email"
        redirectUri: string;
        responseType?: 'code' | 'token' | 'id_token';
      };
      // User Attribute Mapping
      attributeMapping?: {
        email?: string; // Attribute name for email
        firstName?: string; // Attribute name for first name
        lastName?: string; // Attribute name for last name
        employeeId?: string; // Attribute name for employee ID
        department?: string; // Attribute name for department
      };
      // Additional Settings
      autoProvision?: boolean; // Automatically create user accounts
      allowedDomains?: string[]; // Restrict to specific email domains
      sessionTimeout?: number; // Session timeout in minutes
      requireMFA?: boolean; // Require multi-factor authentication
    };
    // Address validation
    addressValidation?: {
      enabled: boolean;
      provider: 'none' | 'usps' | 'google' | 'smartystreets' | 'loqate' | 'here';
      apiKey?: string;
      apiSecret?: string;
      validationLevel: 'strict' | 'moderate' | 'lenient';
      autoCorrect: boolean;
      requireValidation: boolean; // Whether to block submission on validation failure
    };
  };
  
  // NEW: UX Customization Configuration
  headerFooterConfig?: import('../types/siteCustomization').HeaderFooterConfig;
  brandingAssets?: import('../types/siteCustomization').BrandingAssets;
  giftSelectionConfig?: import('../types/siteCustomization').GiftSelectionConfig;
  reviewScreenConfig?: import('../types/siteCustomization').ReviewScreenConfig;
  orderTrackingConfig?: import('../types/siteCustomization').OrderTrackingConfig;

  // ERP Integration
  siteCode?: string;
  siteErpIntegration?: string;
  siteErpInstance?: string;
  siteShipFromCountry?: string;
  siteHrisSystem?: string;

  // Site Management
  siteDropDownName?: string;
  siteCustomDomainUrl?: string;
  siteAccountManager?: string;
  siteAccountManagerEmail?: string;
  siteCelebrationsEnabled?: boolean;
  allowSessionTimeoutExtend?: boolean;
  enableEmployeeLogReport?: boolean;

  // Regional Client Info
  regionalClientInfo?: {
    officeName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;
    taxId?: string;
  };

  // Authentication
  disableDirectAccessAuth?: boolean;
  ssoProvider?: string;
  ssoClientOfficeName?: string;

  // Draft/Live Mode Flags
  _hasUnpublishedChanges?: boolean; // True when draft_settings is populated
  _draftSettings?: any; // Copy of draft_settings for reference

  createdAt: string;
  updatedAt: string;
}

export interface SiteContextType {
  clients: Client[];
  brands: Brand[];
  sites: Site[];
  currentSite: Site | null;
  currentClient: Client | null;
  isLoading: boolean;
  setCurrentSite: (site: Site | null) => void;
  setCurrentClient: (client: Client | null) => void;
  addClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addSite: (site: Partial<Site>) => Promise<Site>;
  updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
  saveSiteDraft: (id: string, updates: Partial<Site>) => Promise<void>;
  publishSite: (id: string) => Promise<void>;
  discardSiteDraft: (id: string) => Promise<void>;
  getSiteLive: (id: string) => Promise<Site>;
  deleteSite: (id: string) => Promise<void>;
  getSitesByClient: (clientId: string) => Site[];
  getClientById: (clientId: string) => Client | undefined;
  refreshData: () => Promise<void>;
  addBrand: (brand: Partial<Brand>) => Promise<Brand>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  getSitesByBrand: (brandId: string) => Site[];
}

export const SiteContext = createContext<SiteContextType | undefined>(undefined);

// ============================================================================
// SITE SELECTION PERSISTENCE UTILITIES
// ============================================================================

const SITE_SELECTION_STORAGE_KEY = 'admin_selected_site_id';

/**
 * Persist site ID to localStorage
 */
function persistSiteSelection(siteId: string): void {
  try {
    localStorage.setItem(SITE_SELECTION_STORAGE_KEY, siteId);
    logger.info('[SiteContext] Persisted site selection', { siteId });
  } catch (error) {
    logger.error('[SiteContext] Failed to persist site selection', { error });
    // Continue operation - persistence failure should not break functionality
  }
}

/**
 * Retrieve persisted site ID from localStorage
 */
function getPersistedSiteSelection(): string | null {
  try {
    return localStorage.getItem(SITE_SELECTION_STORAGE_KEY);
  } catch (error) {
    logger.error('[SiteContext] Failed to read persisted site selection', { error });
    return null;
  }
}

/**
 * Clear persisted site selection from localStorage
 */
function clearPersistedSiteSelection(): void {
  try {
    localStorage.removeItem(SITE_SELECTION_STORAGE_KEY);
    logger.info('[SiteContext] Cleared persisted site selection');
  } catch (error) {
    logger.error('[SiteContext] Failed to clear persisted site selection', { error });
  }
}

// ============================================================================

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.warn('[SiteProvider] Component rendering');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSiteState, setCurrentSiteState] = useState<Site | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdminAuthenticated, isLoading: adminLoading } = useAdmin();
  const hasLoadedRef = useRef(false);

  // Wrapped setCurrentSite with persistence logic
  const setCurrentSite = (site: Site | null) => {
    setCurrentSiteState(site);
    if (site) {
      persistSiteSelection(site.id);
    } else {
      clearPersistedSiteSelection();
    }
  };

  const currentSite = currentSiteState;

  console.warn('[SiteProvider] State:', {
    isAdminAuthenticated,
    adminLoading,
    hasLoadedRef: hasLoadedRef.current,
    sitesCount: sites.length,
    isLoading
  });

  // Reset hasLoadedRef when authentication state changes
  useEffect(() => {
    if (!isAdminAuthenticated) {
      hasLoadedRef.current = false;
      // Clear persisted site selection on logout
      clearPersistedSiteSelection();
      setCurrentSite(null);
      setCurrentClient(null);
    }
  }, [isAdminAuthenticated]);

  // Listen for admin login success event to trigger data load
  useEffect(() => {
    const handleLoginSuccess = () => {
      logger.info('[SiteContext] Admin login success event received, resetting hasLoadedRef');
      hasLoadedRef.current = false;
    };

    window.addEventListener('admin-login-success', handleLoginSuccess);
    return () => {
      window.removeEventListener('admin-login-success', handleLoginSuccess);
    };
  }, []);

  // Load sites and clients from API when admin is authenticated
  useEffect(() => {
    const loadData = async () => {
      logger.info('[SiteContext] useEffect triggered', {
        isAdminAuthenticated,
        adminLoading,
        hasLoadedRef: hasLoadedRef.current,
        currentPath: window.location.pathname,
        isPublic: isPublicRoute(window.location.pathname)
      });

      // Skip if on public route
      if (isPublicRoute(window.location.pathname)) {
        logger.info('[SiteContext] Skipping - on public route');
        setIsLoading(false);
        return;
      }

      // Wait for admin authentication to complete
      if (adminLoading) {
        logger.info('[SiteContext] Waiting for admin authentication to complete');
        return;
      }

      // Only load if authenticated and haven't loaded yet
      if (!isAdminAuthenticated) {
        logger.info('[SiteContext] Not authenticated, skipping data load');
        setIsLoading(false);
        return;
      }

      if (hasLoadedRef.current) {
        logger.info('[SiteContext] Data already loaded, skipping');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        logger.info('[SiteContext] Loading sites and clients from API');

        // Load sites and clients in parallel
        const [sitesResponse, clientsResponse] = await Promise.all([
          siteApi.getAll(),
          clientApi.getAll()
        ]);

        logger.info('[SiteContext] API responses received', {
          sitesResponse: sitesResponse,
          clientsResponse: clientsResponse,
          sitesSuccess: sitesResponse?.success,
          sitesDataLength: sitesResponse?.data?.length,
          sitesData: sitesResponse?.data,
          clientsSuccess: clientsResponse?.success,
          clientsDataLength: clientsResponse?.data?.length,
          clientsData: clientsResponse?.data
        });

        console.warn('[SiteContext] Setting sites and clients:', {
          sitesArray: sitesResponse.data,
          clientsArray: clientsResponse.data
        });

        setSites((sitesResponse.data || []) as Site[]);
        setClients((clientsResponse.data || []) as Client[]);

        // Try to restore persisted site selection first
        const persistedSiteId = getPersistedSiteSelection();
        let siteToSelect: Site | null = null;

        if (persistedSiteId && sitesResponse.data) {
          // Check if persisted site still exists in loaded sites
          const persistedSite = sitesResponse.data.find((s: Site) => s.id === persistedSiteId);
          if (persistedSite) {
            logger.info('[SiteContext] Restoring persisted site selection', { siteId: persistedSiteId });
            siteToSelect = persistedSite as Site;
          } else {
            logger.info('[SiteContext] Persisted site not found, clearing stale value', { siteId: persistedSiteId });
            clearPersistedSiteSelection();
          }
        }

        // Fall back to auto-selection if no valid persisted site
        if (!siteToSelect && sitesResponse.data && sitesResponse.data.length > 0) {
          logger.info('[SiteContext] No persisted site, auto-selecting first active site');
          siteToSelect = (sitesResponse.data.find((s: Site) => s.status === 'active') || sitesResponse.data[0]) as Site;
        }

        // Set the selected site (this will also persist it via the wrapped setter)
        if (siteToSelect) {
          console.warn('[SiteContext] Setting selected site:', {
            siteId: siteToSelect.id,
            siteName: siteToSelect.name,
            clientId: siteToSelect.clientId
          });
          setCurrentSite(siteToSelect);

          // Set corresponding client
          if (clientsResponse.data) {
            const siteClient = clientsResponse.data.find((c: Client) => c.id === siteToSelect!.clientId);
            console.warn('[SiteContext] Looking for client:', {
              lookingForClientId: siteToSelect.clientId,
              foundClient: siteClient ? { id: siteClient.id, name: siteClient.name } : null,
              availableClients: clientsResponse.data.map((c: Client) => ({ id: c.id, name: c.name }))
            });
            if (siteClient) {
              setCurrentClient(siteClient as Client);
            } else {
              console.error('[SiteContext] Client not found for site!', {
                siteClientId: siteToSelect.clientId,
                availableClientIds: clientsResponse.data.map((c: Client) => c.id)
              });
            }
          }
        }

        hasLoadedRef.current = true;
      } catch (error) {
        logger.error('[SiteContext] Failed to load data', { 
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAdminAuthenticated, adminLoading]); // Removed currentSite from dependencies

  const addClient = async (client: Partial<Client>): Promise<Client> => {
    const newClient = { ...client, id: Date.now().toString() } as Client;
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<void> => {
    try {
      // Make API call to update client in backend
      const response = await apiRequest(`/v2/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (!(response as Response).ok) {
        const error = await (response as Response).json();
        throw new Error(error.message || 'Failed to update client');
      }
      
      // Update local state
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      
      // Update currentClient if it's the one being updated
      if (currentClient?.id === id) {
        setCurrentClient(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addSite = async (site: Partial<Site>): Promise<Site> => {
    const newSite = { ...site, id: Date.now().toString() } as Site;
    setSites(prev => [...prev, newSite]);
    return newSite;
  };

  const updateSite = async (id: string, updates: Partial<Site>): Promise<void> => {
    try {
      // Make API call to update site in backend
      // apiRequest returns parsed JSON data, not a Response object
      const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(`/v2/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update site');
      }
      
      // Update local state with the returned data from backend
      setSites(prev => prev.map(s => s.id === id ? { ...s, ...result.data } : s));
      
      // Update currentSite if it's the one being updated
      if (currentSite?.id === id) {
        setCurrentSite({ ...currentSite, ...result.data });
      }
    } catch (error) {
      console.error('Failed to update site:', error);
      throw error;
    }
  };

  const saveSiteDraft = async (id: string, updates: Partial<Site>): Promise<void> => {
    try {
      // Save changes to draft_settings column
      const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(`/v2/sites/${id}/draft`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save draft');
      }
      
      // Update local state with merged draft data
      setSites(prev => prev.map(s => s.id === id ? { ...s, ...result.data } : s));
      
      // Update currentSite if it's the one being updated
      if (currentSite?.id === id) {
        setCurrentSite({ ...currentSite, ...result.data });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  };

  const publishSite = async (id: string): Promise<void> => {
    try {
      // Merge draft_settings into live columns and clear draft
      const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(`/v2/sites/${id}/publish`, {
        method: 'POST'
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to publish site');
      }
      
      // Update local state with published data
      setSites(prev => prev.map(s => s.id === id ? { ...s, ...result.data } : s));
      
      // Update currentSite if it's the one being published
      if (currentSite?.id === id) {
        setCurrentSite({ ...currentSite, ...result.data });
      }
    } catch (error) {
      console.error('Failed to publish site:', error);
      throw error;
    }
  };

  const discardSiteDraft = async (id: string): Promise<void> => {
    try {
      // Clear draft_settings column
      const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(`/v2/sites/${id}/draft`, {
        method: 'DELETE'
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to discard draft');
      }
      
      // Update local state with live-only data
      setSites(prev => prev.map(s => s.id === id ? { ...s, ...result.data } : s));
      
      // Update currentSite if it's the one being updated
      if (currentSite?.id === id) {
        setCurrentSite({ ...currentSite, ...result.data });
      }
    } catch (error) {
      console.error('Failed to discard draft:', error);
      throw error;
    }
  };

  const getSiteLive = async (id: string): Promise<Site> => {
    try {
      // Get only live data (no draft merged)
      const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(`/v2/sites/${id}/live`, {
        method: 'GET'
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get live site data');
      }
      
      return result.data;
    } catch (error) {
      console.error('Failed to get live site data:', error);
      throw error;
    }
  };

  const deleteSite = async (id: string): Promise<void> => {
    setSites(prev => prev.filter(s => s.id !== id));
  };

  const getSitesByClient = (clientId: string): Site[] => {
    return sites.filter(s => s.clientId === clientId);
  };

  const getClientById = (clientId: string): Client | undefined => {
    return clients.find(c => c.id === clientId);
  };

  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Implement data refresh logic
    } finally {
      setIsLoading(false);
    }
  };

  const addBrand = async (brand: Partial<Brand>): Promise<Brand> => {
    const newBrand = { ...brand, id: Date.now().toString() } as Brand;
    setBrands(prev => [...prev, newBrand]);
    return newBrand;
  };

  const updateBrand = async (id: string, updates: Partial<Brand>): Promise<void> => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBrand = async (id: string): Promise<void> => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const getSitesByBrand = (brandId: string): Site[] => {
    return sites.filter(s => s.brandId === brandId);
  };

  return (
    <SiteContext.Provider value={{ 
      clients, 
      brands, 
      sites,
      currentSite,
      currentClient,
      isLoading,
      setCurrentSite,
      setCurrentClient,
      addClient,
      updateClient,
      deleteClient,
      addSite,
      updateSite,
      saveSiteDraft,
      publishSite,
      discardSiteDraft,
      getSiteLive,
      deleteSite,
      getSitesByClient,
      getClientById,
      refreshData,
      addBrand,
      updateBrand,
      deleteBrand,
      getSitesByBrand
    }}>
      {children}
    </SiteContext.Provider>
  );
};

/**
 * Hook to access SiteContext
 */
export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};