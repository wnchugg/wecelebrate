/**
 * useSite Hook - Dynamic Site Configuration
 * 
 * Fetches site configuration from the backend API based on siteId.
 * Replaces hardcoded companyConfig with dynamic data.
 * 
 * Features:
 * - Automatic site detection from URL (query param, subdomain, or path)
 * - Client-side caching (1 hour TTL)
 * - Loading and error states
 * - Type-safe site configuration
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

// ===== Types =====

// Extended Site type with settings property
export interface SiteSettings {
  validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
  allowQuantitySelection: boolean;
  showPricing: boolean;
  giftsPerUser: number;
  shippingMode: 'company' | 'employee' | 'store';
  companyAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  defaultLanguage: string;
  enableLanguageSelector: boolean;
  defaultCurrency: string;
  allowedCountries: string[];
  defaultCountry: string;
  availabilityStartDate?: string;
  availabilityEndDate?: string;
  allowedDomains?: string[]; // For email domain validation
  maxGiftValue?: number;
  requireShippingAddress?: boolean;
}

// Currency code type for internationalization
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'CAD' | 'AUD' | 'MXN' | 'BRL';

// Internationalization configuration
export interface I18nConfig {
  // Currency settings
  currency: CurrencyCode;
  currencyDisplay: 'symbol' | 'code' | 'name';
  decimalPlaces: number;
  
  // Date and time settings
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')
  dateFormat: 'MDY' | 'DMY' | 'YMD';
  timeFormat: '12h' | '24h';
  
  // Name formatting settings
  nameOrder: 'western' | 'eastern';
  nameFormat: 'formal' | 'casual';
}

export interface SiteConfig {
  id: string;
  name: string;
  clientId: string;
  domain?: string;
  status: 'active' | 'inactive';
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    customCss?: string;
  };
  settings: SiteSettings;
  i18n?: I18nConfig; // Optional internationalization configuration
  siteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseSiteResult {
  site: SiteConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ===== Cache Management =====

interface CacheEntry {
  data: SiteConfig;
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const cache = new Map<string, CacheEntry>();

function getCachedSite(siteId: string): SiteConfig | null {
  const entry = cache.get(siteId);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(siteId);
    return null;
  }
  
  return entry.data;
}

function setCachedSite(siteId: string, data: SiteConfig): void {
  cache.set(siteId, {
    data,
    timestamp: Date.now()
  });
}

function clearSiteCache(siteId?: string): void {
  if (siteId) {
    cache.delete(siteId);
  } else {
    cache.clear();
  }
}

// ===== Site ID Detection =====

/**
 * Detects siteId from URL using multiple strategies:
 * 1. Query parameter: ?siteId=xxx
 * 2. Subdomain: client1.jala2.com -> client1
 * 3. Path: /site/client1 -> client1
 * 4. localStorage fallback (for development)
 */
export function detectSiteId(): string | null {
  // Strategy 1: Query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const queryParamSiteId = urlParams.get('siteId');
  if (queryParamSiteId) {
    return queryParamSiteId;
  }
  
  // Strategy 2: Subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Skip Figma preview URLs and localhost during development
  if (hostname.includes('figmaiframepreview') || hostname === 'localhost') {
    return null;
  }
  
  // Check if it's a subdomain (e.g., client1.jala2.com or client1.localhost)
  if (parts.length >= 3 || (parts.length === 2 && parts[1] === 'localhost')) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
      return subdomain;
    }
  }
  
  // Strategy 3: Path-based (e.g., /site/client1)
  const pathMatch = window.location.pathname.match(/^\/site\/([^/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // Strategy 4: localStorage fallback (useful for development/testing)
  // Skip this on admin pages
  if (!window.location.pathname.startsWith('/admin')) {
    const storedSiteId = localStorage.getItem('jala2_current_site_id');
    if (storedSiteId) {
      return storedSiteId;
    }
  }
  
  return null;
}

// ===== Hook Implementation =====

/**
 * Main hook for accessing site configuration
 * 
 * @param forceSiteId - Optional siteId to override detection
 * @returns Site configuration, loading state, error, and refetch function
 */
export function useSite(forceSiteId?: string): UseSiteResult {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSite = useCallback(async (siteId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first
      const cached = getCachedSite(siteId);
      if (cached) {
        setSite(cached);
        setIsLoading(false);
        return;
      }
      
      // Fetch from API
      const env = getCurrentEnvironment();
      const apiUrl = `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3`;
      
      const response = await fetch(`${apiUrl}/public/sites/${siteId}`, {
        headers: {
          'X-Environment-ID': env.id,
          // CRITICAL: Supabase Edge Functions requires Authorization header with anon key
          'Authorization': `Bearer ${env.supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Site "${siteId}" not found. Please check the site ID.`);
        }
        const errorText = response.statusText || `HTTP ${response.status}`;
        throw new Error(`Failed to load site configuration: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.site) {
        throw new Error('Invalid site data received from server');
      }
      
      // Validate site is active
      if (data.site.status !== 'active') {
        throw new Error('This site is currently inactive. Please contact support.');
      }
      
      // Cache the result
      setCachedSite(siteId, data.site);
      setSite(data.site);
      
    } catch (err: any) {
      // Don't log errors during initial load when no site ID is present
      const isMissingSiteId = !forceSiteId && !detectSiteId();
      
      // Only log actual fetch errors, not "no siteId" scenarios
      if (!isMissingSiteId) {
        // Check if this is a network/server error vs expected error (404, inactive)
        const isExpectedError = err.message?.includes('not found') || err.message?.includes('inactive');
        if (!isExpectedError) {
          console.error('[useSite] Site fetch error:', err);
        } else {
          console.warn('[useSite]', err.message);
        }
      }
      
      setError(err.message || 'Failed to load site configuration');
      setSite(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const refetch = useCallback(async () => {
    const siteId = forceSiteId || detectSiteId();
    if (siteId) {
      clearSiteCache(siteId);
      await fetchSite(siteId);
    }
  }, [forceSiteId, fetchSite]);
  
  useEffect(() => {
    // Skip site loading on admin pages (admin uses SiteContext instead)
    if (window.location.pathname.startsWith('/admin')) {
      setIsLoading(false);
      setError(null);
      setSite(null);
      return;
    }
    
    const siteId = forceSiteId || detectSiteId();
    
    if (!siteId) {
      // No site ID found - don't show error immediately, just log it
      console.warn('[useSite] No site ID detected. Add ?siteId=xxx to URL or configure subdomain routing.');
      setIsLoading(false);
      setError(null); // Don't set error for missing siteId during development
      setSite(null);
      return;
    }
    
    fetchSite(siteId);
  }, [forceSiteId, fetchSite]);
  
  return {
    site,
    isLoading,
    error,
    refetch
  };
}

// ===== Helper Functions =====

/**
 * Validates an email against site configuration
 */
export function validateEmailForSite(email: string, site: SiteConfig): boolean {
  if (!email) return false;
  
  const allowedDomains = site.settings.allowedDomains;
  if (!allowedDomains || allowedDomains.length === 0) {
    // If no domains specified, allow all valid emails
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some(d => d.toLowerCase() === domain);
}

/**
 * Get the primary color for the site
 */
export function getSitePrimaryColor(site: SiteConfig | null): string {
  return site?.branding?.primaryColor || '#D91C81';
}

/**
 * Get the currency symbol for the site
 */
export function getSiteCurrency(site: SiteConfig | null): string {
  return site?.settings?.defaultCurrency || 'USD';
}

/**
 * Check if site is within availability window
 */
export function isSiteAvailable(site: SiteConfig | null): boolean {
  if (!site) return false;
  
  const now = new Date();
  const { availabilityStartDate, availabilityEndDate } = site.settings;
  
  if (availabilityStartDate) {
    const startDate = new Date(availabilityStartDate);
    if (now < startDate) return false;
  }
  
  if (availabilityEndDate) {
    const endDate = new Date(availabilityEndDate);
    if (now > endDate) return false;
  }
  
  return true;
}

// Export cache utilities for testing/debugging
export const siteCache = {
  get: getCachedSite,
  set: setCachedSite,
  clear: clearSiteCache
};