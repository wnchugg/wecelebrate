/**
 * API Client for Phase 5A Endpoints
 * Provides type-safe access to brands, email templates, and site gift configuration
 */

import { apiRequest } from '../utils/api';

// ==================== TYPES ====================

export interface Brand {
  id: string;
  name: string;
  clientId?: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  bodyTextColorDark?: string;
  bodyTextColorLight?: string;
  accentColor1?: string;
  accentColor2?: string;
  status: 'active' | 'inactive';
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandInput {
  name: string;
  clientId?: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  bodyTextColorDark?: string;
  bodyTextColorLight?: string;
  accentColor1?: string;
  accentColor2?: string;
  status?: 'active' | 'inactive';
  settings?: Record<string, any>;
}

export type UpdateBrandInput = Partial<CreateBrandInput>;

export interface EmailTemplate {
  id: string;
  siteId?: string;
  clientId?: string;
  name: string;
  description?: string;
  templateType: 'global' | 'site' | 'client';
  eventType: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables: string[];
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  status: 'active' | 'inactive' | 'draft';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateInput {
  siteId?: string;
  clientId?: string;
  name: string;
  description?: string;
  templateType: 'global' | 'site' | 'client';
  eventType: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: string[];
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  status?: 'active' | 'inactive' | 'draft';
  isDefault?: boolean;
}

export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

export interface SiteGiftConfig {
  id?: string;
  siteId: string;
  assignmentStrategy: 'all' | 'selected' | 'excluded' | 'categories' | 'custom';
  selectedProductIds: string[];
  excludedProductIds: string[];
  includedCategories: string[];
  excludedCategories: string[];
  minPrice?: number;
  maxPrice?: number;
  filters?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSiteGiftConfigInput {
  assignmentStrategy?: 'all' | 'selected' | 'excluded' | 'categories' | 'custom';
  selectedProductIds?: string[];
  excludedProductIds?: string[];
  includedCategories?: string[];
  excludedCategories?: string[];
  minPrice?: number;
  maxPrice?: number;
  filters?: Record<string, any>;
}

// ==================== BRANDS API ====================

export const brandsApi = {
  /**
   * Get all brands
   */
  async list(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ success: boolean; data: Brand[]; total: number }>(`/v2/brands${query}`);
  },

  /**
   * Get brand by ID
   */
  async get(id: string) {
    return apiRequest<{ success: boolean; data: Brand }>(`/v2/brands/${id}`);
  },

  /**
   * Create new brand
   */
  async create(input: CreateBrandInput) {
    return apiRequest<{ success: boolean; data: Brand }>('/v2/brands', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update brand
   */
  async update(id: string, updates: UpdateBrandInput) {
    return apiRequest<{ success: boolean; data: Brand }>(`/v2/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete brand
   */
  async delete(id: string) {
    return apiRequest<{ success: boolean; message: string }>(`/v2/brands/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== EMAIL TEMPLATES API ====================

export const emailTemplatesApi = {
  /**
   * Get all email templates
   */
  async list(filters?: {
    templateType?: string;
    eventType?: string;
    siteId?: string;
    clientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.templateType) params.append('templateType', filters.templateType);
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.siteId) params.append('siteId', filters.siteId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ success: boolean; data: EmailTemplate[]; total: number }>(`/v2/email-templates${query}`);
  },

  /**
   * Get email template by ID
   */
  async get(id: string) {
    return apiRequest<{ success: boolean; data: EmailTemplate }>(`/v2/email-templates/${id}`);
  },

  /**
   * Create new email template
   */
  async create(input: CreateEmailTemplateInput) {
    return apiRequest<{ success: boolean; data: EmailTemplate }>('/v2/email-templates', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update email template
   */
  async update(id: string, updates: UpdateEmailTemplateInput) {
    return apiRequest<{ success: boolean; data: EmailTemplate }>(`/v2/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete email template
   */
  async delete(id: string) {
    return apiRequest<{ success: boolean; message: string }>(`/v2/email-templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SITE GIFT CONFIGURATION API ====================

export const siteGiftConfigApi = {
  /**
   * Get site gift configuration
   */
  async get(siteId: string) {
    return apiRequest<{ success: boolean; data: SiteGiftConfig }>(`/v2/sites/${siteId}/gift-config`);
  },

  /**
   * Update site gift configuration
   */
  async update(siteId: string, updates: UpdateSiteGiftConfigInput) {
    return apiRequest<{ success: boolean; data: SiteGiftConfig }>(`/v2/sites/${siteId}/gift-config`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Get filtered gifts for a site (PUBLIC)
   */
  async getGifts(siteId: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ success: boolean; data: any[]; total: number }>(`/v2/sites/${siteId}/gifts${query}`);
  },
};

// ==================== EXPORT ALL ====================

export const phase5aApi = {
  brands: brandsApi,
  emailTemplates: emailTemplatesApi,
  siteGiftConfig: siteGiftConfigApi,
};

export default phase5aApi;
