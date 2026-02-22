/**
 * React Hooks for Phase 5A Features
 * Provides easy-to-use hooks for brands, email templates, and site gift configuration
 */

import { useState, useEffect, useCallback } from 'react';
import { phase5aApi, Brand, EmailTemplate, SiteGiftConfig } from '../lib/apiClientPhase5A';

// ==================== BRANDS HOOKS ====================

/**
 * Hook to fetch and manage brands
 */
export function useBrands(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase5aApi.brands.list(filters);
      setBrands(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = async (input: any) => {
    try {
      const response = await phase5aApi.brands.create(input);
      await fetchBrands(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create brand');
    }
  };

  const updateBrand = async (id: string, updates: any) => {
    try {
      const response = await phase5aApi.brands.update(id, updates);
      await fetchBrands(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update brand');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      await phase5aApi.brands.delete(id);
      await fetchBrands(); // Refresh list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete brand');
    }
  };

  return {
    brands,
    total,
    loading,
    error,
    refresh: fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}

/**
 * Hook to fetch a single brand
 */
export function useBrand(id: string | null) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setBrand(null);
      setLoading(false);
      return;
    }

    const fetchBrand = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await phase5aApi.brands.get(id);
        setBrand(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch brand');
        console.error('Error fetching brand:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  return { brand, loading, error };
}

// ==================== EMAIL TEMPLATES HOOKS ====================

/**
 * Hook to fetch and manage email templates
 */
export function useEmailTemplates(filters?: {
  templateType?: string;
  eventType?: string;
  siteId?: string;
  clientId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase5aApi.emailTemplates.list(filters);
      setTemplates(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email templates');
      console.error('Error fetching email templates:', err);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.templateType,
    filters?.eventType,
    filters?.siteId,
    filters?.clientId,
    filters?.status,
    filters?.limit,
    filters?.offset,
  ]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (input: any) => {
    try {
      const response = await phase5aApi.emailTemplates.create(input);
      await fetchTemplates(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create email template');
    }
  };

  const updateTemplate = async (id: string, updates: any) => {
    try {
      const response = await phase5aApi.emailTemplates.update(id, updates);
      await fetchTemplates(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update email template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await phase5aApi.emailTemplates.delete(id);
      await fetchTemplates(); // Refresh list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete email template');
    }
  };

  return {
    templates,
    total,
    loading,
    error,
    refresh: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}

/**
 * Hook to fetch a single email template
 */
export function useEmailTemplate(id: string | null) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await phase5aApi.emailTemplates.get(id);
        setTemplate(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch email template');
        console.error('Error fetching email template:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  return { template, loading, error };
}

// ==================== SITE GIFT CONFIGURATION HOOKS ====================

/**
 * Hook to fetch and manage site gift configuration
 */
export function useSiteGiftConfig(siteId: string | null) {
  const [config, setConfig] = useState<SiteGiftConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!siteId) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await phase5aApi.siteGiftConfig.get(siteId);
      setConfig(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch site gift configuration');
      console.error('Error fetching site gift config:', err);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (updates: any) => {
    if (!siteId) {
      throw new Error('Site ID is required');
    }

    try {
      const response = await phase5aApi.siteGiftConfig.update(siteId, updates);
      setConfig(response.data);
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update site gift configuration');
    }
  };

  return {
    config,
    loading,
    error,
    refresh: fetchConfig,
    updateConfig,
  };
}

/**
 * Hook to fetch filtered gifts for a site
 */
export function useSiteGifts(
  siteId: string | null,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const [gifts, setGifts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    if (!siteId) {
      setGifts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await phase5aApi.siteGiftConfig.getGifts(siteId, filters);
      setGifts(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch site gifts');
      console.error('Error fetching site gifts:', err);
    } finally {
      setLoading(false);
    }
  }, [
    siteId,
    filters?.category,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.search,
    filters?.limit,
    filters?.offset,
  ]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  return {
    gifts,
    total,
    loading,
    error,
    refresh: fetchGifts,
  };
}
