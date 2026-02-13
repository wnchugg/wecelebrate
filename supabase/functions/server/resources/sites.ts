/**
 * Sites Resource - Migrated to CRUD Factory
 * 
 * Site management with CRUD operations using the factory pattern.
 * 
 * @module resources/sites
 * @created 2026-02-09
 * @migrated Phase 3.2
 */

import type { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import {
  createCrudRoutes,
  validateRequired,
  validateStringLength,
  validateUrl,
  sanitizeString,
} from '../crud_factory.ts';
import * as kv from '../kv_env.ts';
import { logger } from '../logger.ts';

// ============================================
// Type Definitions
// ============================================

export interface Site {
  id?: string;
  clientId: string;
  name: string;
  description?: string;
  slug?: string;
  status?: 'active' | 'inactive' | 'draft';
  startDate: string;
  endDate: string;
  validationMethods?: string[];
  brandingConfig?: SiteBranding;
  pageConfigurations?: any[];
  settings?: SiteSettings;
  
  // NEW: UX Customization Configuration
  headerFooterConfig?: any; // HeaderFooterConfig from frontend
  brandingAssets?: any; // BrandingAssets from frontend
  giftSelectionConfig?: any; // GiftSelectionConfig from frontend
  reviewScreenConfig?: any; // ReviewScreenConfig from frontend
  orderTrackingConfig?: any; // OrderTrackingConfig from frontend
  
  // Phase 1: ERP Integration Fields (CRITICAL for ERP sync)
  site_code?: string;                      // Unique code for ERP sync
  site_erp_integration?: string;           // ERP system: NAJ, Fourgen, Netsuite, GRS
  site_erp_instance?: string;              // Specific ERP instance identifier
  site_ship_from_country?: string;         // Country products are shipped from
  site_hris_system?: string;               // HR information system
  
  // Phase 2: Site Management Fields
  site_drop_down_name?: string;            // Display name in multi-site dropdown
  site_custom_domain_url?: string;         // Custom domain if configured
  site_account_manager?: string;           // HALO account manager assigned
  site_account_manager_email?: string;     // AM email for notifications
  site_celebrations_enabled?: boolean;     // Enable celebration feature (default: false)
  allow_session_timeout_extend?: boolean;  // Allow 4-hour timeout (default: false)
  enable_employee_log_report?: boolean;    // Enable employee activity logging (default: false)
  
  // Phase 3: Regional Client Information
  regional_client_info?: {
    office_name?: string;                  // Regional office name
    contact_name?: string;                 // Client contact at regional office
    contact_email?: string;                // Regional contact email
    contact_phone?: string;                // Regional contact phone
    address_line_1?: string;               // Regional office address
    address_line_2?: string;
    address_line_3?: string;
    city?: string;
    country_state?: string;                // Country/State
    tax_id?: string;                       // Tax/VAT ID
  };
  
  // Phase 4: Advanced Authentication
  disable_direct_access_auth?: boolean;    // Disable direct access, SSO only (default: false)
  sso_provider?: string;                   // SSO provider name
  sso_client_office_name?: string;         // SSO configuration identifier
  
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SiteBranding {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  logo?: string;
  favicon?: string;
  customCSS?: string;
}

export interface SiteSettings {
  allowMultipleSelections?: boolean;
  requireValidation?: boolean;
  emailDomains?: string[];
  maxSelections?: number;
  [key: string]: any;
}

// ============================================
// Validation
// ============================================

function validateSite(data: Partial<Site>): string | null {
  // Required fields
  const requiredError = validateRequired(data, ['clientId', 'name', 'startDate', 'endDate']);
  if (requiredError) return requiredError;

  // Name validation
  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  // Date validation
  const startDate = new Date(data.startDate!);
  const endDate = new Date(data.endDate!);

  if (isNaN(startDate.getTime())) {
    return 'Start date must be a valid date';
  }

  if (isNaN(endDate.getTime())) {
    return 'End date must be a valid date';
  }

  if (endDate <= startDate) {
    return 'End date must be after start date';
  }

  // Status validation
  if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
    return 'Status must be one of: active, inactive, draft';
  }

  // Branding validation (if provided)
  if (data.brandingConfig) {
    const { primaryColor, secondaryColor, tertiaryColor } = data.brandingConfig;
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return 'Primary color must be a valid hex color (e.g., #D91C81)';
    }

    if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
      return 'Secondary color must be a valid hex color';
    }

    if (tertiaryColor && !hexColorRegex.test(tertiaryColor)) {
      return 'Tertiary color must be a valid hex color';
    }

    if (data.brandingConfig.logo) {
      const urlError = validateUrl(data.brandingConfig.logo);
      if (urlError) return 'Logo URL: ' + urlError;
    }

    if (data.brandingConfig.favicon) {
      const urlError = validateUrl(data.brandingConfig.favicon);
      if (urlError) return 'Favicon URL: ' + urlError;
    }
  }

  return null;
}

// ============================================
// Transformation
// ============================================

function transformSite(data: Partial<Site>): Partial<Site> {
  // Generate slug from name if not provided
  const slug = data.slug || data.name?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    slug,
    status: data.status || 'draft',
    validationMethods: data.validationMethods || ['email'],
    brandingConfig: data.brandingConfig ? {
      ...data.brandingConfig,
      primaryColor: data.brandingConfig.primaryColor?.toUpperCase(),
      secondaryColor: data.brandingConfig.secondaryColor?.toUpperCase(),
      tertiaryColor: data.brandingConfig.tertiaryColor?.toUpperCase(),
    } : undefined,
  };
}

// ============================================
// Access Control
// ============================================

async function siteAccessControl(c: Context, resourceId?: string): Promise<boolean> {
  const userId = c.get('userId') || c.get('adminId');
  const userRole = c.get('userRole');

  logger.debug('sites', 'accessControl', {
    userId,
    userRole,
    resourceId,
    method: c.req.method,
  });

  // Must have admin role
  if (!userRole || !['admin', 'system_admin', 'super_admin', 'client_admin', 'site_admin'].includes(userRole)) {
    logger.warn('sites', 'accessControl', {
      error: 'Insufficient permissions',
      userRole,
    });
    return false;
  }

  return true;
}

// ============================================
// Custom ID Generator
// ============================================

function generateSiteId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `site-${timestamp}-${random}`;
}

// ============================================
// Setup Routes
// ============================================

export function setupSiteRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('sites', 'setupSiteRoutes', {
    message: 'Setting up Site CRUD routes',
    hasMiddleware: !!verifyAdminMiddleware,
  });

  // Create standard CRUD routes
  createCrudRoutes<Site>(app, {
    resourceName: 'sites',
    keyPrefix: 'site', // FIXED: Should be singular to match seed data pattern site:dev:id
    
    validate: validateSite,
    transform: transformSite,
    accessControl: siteAccessControl,
    generateId: generateSiteId,
    middleware: verifyAdminMiddleware, // Apply admin auth middleware
    
    auditLogging: true,
    softDelete: false, // Hard delete sites
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['clientId', 'status'],
  });

  logger.info('sites', 'setupSiteRoutes', {
    message: 'Site CRUD routes created',
    routes: [
      'GET /make-server-6fcaeea3/sites',
      'GET /make-server-6fcaeea3/sites/:id',
      'POST /make-server-6fcaeea3/sites',
      'PUT /make-server-6fcaeea3/sites/:id',
      'DELETE /make-server-6fcaeea3/sites/:id',
    ],
  });

  // ============================================
  // Additional Custom Routes (Non-CRUD)
  // ============================================

  // Get active sites (public endpoint - no auth required)
  app.get('/make-server-6fcaeea3/public/sites', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';

    try {
      const allSites = await kv.getByPrefix('sites:', environmentId);
      
      // Filter to only active sites within date range
      const now = new Date();
      const activeSites = allSites.filter((site: Site) => {
        if (site.status !== 'active') return false;
        
        const startDate = new Date(site.startDate);
        const endDate = new Date(site.endDate);
        
        return now >= startDate && now <= endDate;
      });

      logger.info('sites', 'getPublicSites', {
        total: allSites.length,
        active: activeSites.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: activeSites,
        meta: { total: activeSites.length },
      });
    } catch (error) {
      logger.error('sites', 'getPublicSites', {
        error: error instanceof Error ? error.message : String(error),
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve active sites',
      }, 500);
    }
  });

  // Get a specific site by ID (public endpoint - no auth required)
  app.get('/make-server-6fcaeea3/public/sites/:siteId', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      const site = await kv.get<Site>(`sites:${environmentId}:${siteId}`, environmentId);

      if (!site) {
        return c.json({
          success: false,
          error: 'Site not found',
        }, 404);
      }

      if (site.status !== 'active') {
        return c.json({
          success: false,
          error: 'Site is not active',
        }, 403);
      }

      // Check if site is within selection period
      const now = new Date();
      const startDate = new Date(site.startDate);
      const endDate = new Date(site.endDate);

      if (now < startDate) {
        return c.json({
          success: false,
          error: 'Selection period has not started yet',
          startDate: site.startDate,
        }, 403);
      }

      if (now > endDate) {
        return c.json({
          success: false,
          error: 'Selection period has ended',
          endDate: site.endDate,
        }, 403);
      }

      logger.info('sites', 'getPublicSite', {
        siteId,
        siteName: site.name,
        environmentId,
      });

      return c.json({
        success: true,
        data: site,
      });
    } catch (error) {
      logger.error('sites', 'getPublicSite', {
        error: error instanceof Error ? error.message : String(error),
        siteId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve site',
      }, 500);
    }
  });

  // Get employees for a site
  app.get('/make-server-6fcaeea3/sites/:siteId/employees', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      // Access control
      const hasAccess = await siteAccessControl(c, siteId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      const allEmployees = await kv.getByPrefix('employees:', environmentId);
      const employees = allEmployees.filter((emp: any) => emp.siteId === siteId);

      logger.info('sites', 'getSiteEmployees', {
        siteId,
        employeeCount: employees.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: employees,
        meta: { total: employees.length },
      });
    } catch (error) {
      logger.error('sites', 'getSiteEmployees', {
        error: error instanceof Error ? error.message : String(error),
        siteId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve site employees',
      }, 500);
    }
  });

  // Get gift configuration for a site
  app.get('/make-server-6fcaeea3/sites/:siteId/gift-config', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      // Access control
      const hasAccess = await siteAccessControl(c, siteId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      const config = await kv.get(`site_gift_config:${siteId}`, environmentId);

      logger.info('sites', 'getSiteGiftConfig', {
        siteId,
        hasConfig: !!config,
        environmentId,
      });

      return c.json({
        success: true,
        data: config || null,
      });
    } catch (error) {
      logger.error('sites', 'getSiteGiftConfig', {
        error: error instanceof Error ? error.message : String(error),
        siteId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve gift configuration',
      }, 500);
    }
  });

  logger.info('sites', 'setupSiteRoutes', {
    message: 'Additional site routes created',
    routes: [
      'GET /make-server-6fcaeea3/public/sites',
      'GET /make-server-6fcaeea3/public/sites/:siteId',
      'GET /make-server-6fcaeea3/sites/:siteId/employees',
      'GET /make-server-6fcaeea3/sites/:siteId/gift-config',
    ],
  });
}