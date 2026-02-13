import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { giftApi, siteApi } from '../utils/api';
import type { Gift as GlobalGift } from '../../types';

// Gift categories
export const GIFT_CATEGORIES = [
  'Apparel',
  'Accessories',
  'Electronics',
  'Home & Living',
  'Office Supplies',
  'Health & Wellness',
  'Food & Beverage',
  'Books & Media',
  'Toys & Games',
  'Sports & Outdoors',
  'Gift Cards',
  'Other'
];

// Extended Gift type for internal use (extends global Gift with inventory details)
export interface Gift extends GlobalGift {
  longDescription?: string;
  images?: string[];
  inventory?: {
    total: number;
    available: number;
    reserved: number;
  };
  attributes?: {
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    weight?: string;
  };
  features?: string[];
}

// Price level configuration
export interface PriceLevel {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

// Site-specific gift configuration
export interface SiteGiftConfiguration {
  siteId: string;
  assignmentStrategy: 'all' | 'price_levels' | 'exclusions' | 'explicit';
  
  // For price_levels strategy
  priceLevels?: PriceLevel[];
  selectedLevelId?: string; // Which level is active for this site
  
  // For exclusions strategy (all products EXCEPT these)
  excludedSkus?: string[];
  excludedCategories?: string[];
  
  // For explicit strategy (only these specific products)
  includedGiftIds?: string[];
}

export interface GiftContextType {
  // Global catalog management
  gifts: Gift[];
  addGift: (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGift: (id: string, updates: Partial<Gift>) => Promise<void>;
  deleteGift: (id: string) => Promise<void>;
  deleteMultipleGifts: (ids: string[]) => Promise<void>;
  
  // Site-specific gift configuration
  siteConfigurations: SiteGiftConfiguration[];
  getSiteConfiguration: (siteId: string) => SiteGiftConfiguration | undefined;
  updateSiteConfiguration: (config: SiteGiftConfiguration) => Promise<void>;
  getGiftsBySite: (siteId: string) => Promise<Gift[]>;
  
  // Loading state
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export function GiftProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [siteConfigurations, setSiteConfigurations] = useState<SiteGiftConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API on mount
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const { gifts: giftsData } = await giftApi.getAll();
      setGifts(giftsData);
    } catch (error) {
      // Don't log errors if user isn't authenticated - this is expected
      const hasToken = sessionStorage.getItem('jala_access_token');
      if (hasToken) {
        console.error('Failed to load gifts:', error);
      }
      // Don't throw - just log. This allows the context to work even when not authenticated.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only refresh data if we have an access token (user is likely authenticated)
    // This prevents errors when loading the login page
    const hasToken = sessionStorage.getItem('jala_access_token');
    if (hasToken) {
      refreshData();
    } else {
      setIsLoading(false);
    }

    // Listen for login success event to refresh data
    const handleLoginSuccess = () => {
      refreshData();
    };
    window.addEventListener('admin-login-success', handleLoginSuccess);

    return () => {
      window.removeEventListener('admin-login-success', handleLoginSuccess);
    };
  }, []);

  const addGift = async (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { gift } = await giftApi.create(giftData);
      setGifts(prev => [...prev, gift]);
    } catch (error: any) {
      console.error('Failed to create gift:', error);
      throw new Error(error.message || 'Failed to create gift');
    }
  };

  const updateGift = async (id: string, updates: Partial<Gift>) => {
    try {
      const { gift } = await giftApi.update(id, updates);
      setGifts(prev => prev.map(g => g.id === id ? gift : g));
    } catch (error: any) {
      console.error('Failed to update gift:', error);
      throw new Error(error.message || 'Failed to update gift');
    }
  };

  const deleteGift = async (id: string) => {
    try {
      await giftApi.delete(id);
      setGifts(prev => prev.filter(g => g.id !== id));
    } catch (error: any) {
      console.error('Failed to delete gift:', error);
      throw new Error(error.message || 'Failed to delete gift');
    }
  };

  const deleteMultipleGifts = async (ids: string[]) => {
    try {
      await giftApi.bulkDelete(ids);
      setGifts(prev => prev.filter(g => !ids.includes(g.id)));
    } catch (error: any) {
      console.error('Failed to delete gifts:', error);
      throw new Error(error.message || 'Failed to delete gifts');
    }
  };

  const getSiteConfiguration = (siteId: string) => {
    return siteConfigurations.find(config => config.siteId === siteId);
  };

  const updateSiteConfiguration = async (config: SiteGiftConfiguration) => {
    try {
      const { config: updatedConfig } = await siteApi.updateGiftConfig(config.siteId, config);
      
      setSiteConfigurations(prev => {
        const existing = prev.find(c => c.siteId === config.siteId);
        if (existing) {
          return prev.map(c => c.siteId === config.siteId ? updatedConfig : c);
        } else {
          return [...prev, updatedConfig];
        }
      });
    } catch (error: any) {
      console.error('Failed to update site configuration:', error);
      throw new Error(error.message || 'Failed to update site configuration');
    }
  };

  const getGiftsBySite = async (siteId: string): Promise<Gift[]> => {
    try {
      const config = getSiteConfiguration(siteId);
      if (!config) {
        return gifts; // If no configuration, return all gifts
      }
      
      // Filter gifts based on site configuration
      return gifts.filter(gift => {
        // Implementation of filtering logic based on assignment strategy
        return true; // Placeholder
      });
    } catch (error) {
      console.error('Failed to get gifts by site:', error);
      return [];
    }
  };

  return (
    <GiftContext.Provider
      value={{
        gifts,
        addGift,
        updateGift,
        deleteGift,
        deleteMultipleGifts,
        siteConfigurations,
        getSiteConfiguration,
        updateSiteConfiguration,
        getGiftsBySite,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
}

export function useGift() {
  const context = useContext(GiftContext);
  if (context === undefined) {
    throw new Error('useGift must be used within a GiftProvider');
  }
  return context;
}
