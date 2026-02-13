/**
 * Clients Resource - Migrated to CRUD Factory
 * 
 * Client management with CRUD operations using the factory pattern.
 * 
 * @module resources/clients
 * @created 2026-02-09
 * @migrated Phase 3.2
 */

import type { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import {
  createCrudRoutes,
  validateRequired,
  validateStringLength,
  validateEmail,
  sanitizeString,
  normalizeWhitespace,
} from '../crud_factory.ts';
import * as kv from '../kv_env.ts';
import { logger } from '../logger.ts';

// ============================================
// Type Definitions
// ============================================

export interface Client {
  id?: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: ClientSettings;
  
  // NEW: UX Customization Configuration (defaults for all sites)
  headerFooterConfig?: any; // HeaderFooterConfig from frontend
  brandingAssets?: any; // BrandingAssets from frontend
  
  // Client Settings (from spreadsheet)
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  clientTaxId?: string;
  
  // Client Address
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  
  // Account Settings
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  // Client App Settings
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  
  // Client Billing Settings
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  
  // Client Integrations
  clientErpSystem?: string;
  clientSso?: string;
  clientHrisSystem?: string;
  
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ClientSettings {
  timezone?: string;
  locale?: string;
  currency?: string;
  dateFormat?: string;
  [key: string]: any;
}

// ============================================
// Validation
// ============================================

function validateClient(data: Partial<Client>): string | null {
  // Required fields
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  // Name validation
  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  // Email validation (if provided)
  if (data.contactEmail) {
    const emailError = validateEmail(data.contactEmail);
    if (emailError) return 'Contact email: ' + emailError;
  }

  // Status validation
  if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
    return 'Status must be one of: active, inactive, suspended';
  }

  return null;
}

// ============================================
// Transformation
// ============================================

function transformClient(data: Partial<Client>): Partial<Client> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    contactEmail: data.contactEmail?.toLowerCase().trim(),
    contactName: data.contactName ? sanitizeString(data.contactName) : undefined,
    contactPhone: data.contactPhone?.trim(),
    status: data.status || 'active',
  };
}

// ============================================
// Access Control
// ============================================

async function clientAccessControl(c: Context, resourceId?: string): Promise<boolean> {
  const userId = c.get('userId') || c.get('adminId');
  const userRole = c.get('userRole');

  logger.debug('clients', 'accessControl', {
    userId,
    userRole,
    resourceId,
    method: c.req.method,
  });

  // Must have admin role
  if (!userRole || !['admin', 'system_admin', 'super_admin', 'client_admin'].includes(userRole)) {
    logger.warn('clients', 'accessControl', {
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

function generateClientId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `client-${timestamp}-${random}`;
}

// ============================================
// Setup Routes
// ============================================

export function setupClientRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('clients', 'setupClientRoutes', {
    message: 'Setting up Client CRUD routes',
    hasMiddleware: !!verifyAdminMiddleware,
  });

  // Create standard CRUD routes
  createCrudRoutes<Client>(app, {
    resourceName: 'clients',
    keyPrefix: 'client', // FIXED: Should be singular to match seed data pattern client:dev:id
    
    validate: validateClient,
    transform: transformClient,
    accessControl: clientAccessControl,
    generateId: generateClientId,
    middleware: verifyAdminMiddleware, // Apply admin auth middleware
    
    auditLogging: true,
    softDelete: false, // Hard delete clients (after checking dependencies)
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status'],
  });

  logger.info('clients', 'setupClientRoutes', {
    message: 'Client CRUD routes created',
    routes: [
      'GET /make-server-6fcaeea3/clients',
      'GET /make-server-6fcaeea3/clients/:id',
      'POST /make-server-6fcaeea3/clients',
      'PUT /make-server-6fcaeea3/clients/:id',
      'DELETE /make-server-6fcaeea3/clients/:id',
    ],
  });

  // ============================================
  // Additional Custom Routes (Non-CRUD)
  // ============================================

  // Get sites for a client
  app.get('/make-server-6fcaeea3/clients/:clientId/sites', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const clientId = c.req.param('clientId');

    try {
      // Access control
      const hasAccess = await clientAccessControl(c, clientId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      const allSites = await kv.getByPrefix('sites:', environmentId);
      const sites = allSites.filter((site: any) => site.clientId === clientId);

      logger.info('clients', 'getClientSites', {
        clientId,
        siteCount: sites.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: sites,
        meta: { total: sites.length },
      });
    } catch (error) {
      logger.error('clients', 'getClientSites', {
        error: error instanceof Error ? error.message : String(error),
        clientId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve client sites',
      }, 500);
    }
  });

  // Get employees for a client
  app.get('/make-server-6fcaeea3/clients/:clientId/employees', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const clientId = c.req.param('clientId');

    try {
      // Access control
      const hasAccess = await clientAccessControl(c, clientId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      const allEmployees = await kv.getByPrefix('employees:', environmentId);
      const employees = allEmployees.filter((emp: any) => emp.clientId === clientId);

      logger.info('clients', 'getClientEmployees', {
        clientId,
        employeeCount: employees.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: employees,
        meta: { total: employees.length },
      });
    } catch (error) {
      logger.error('clients', 'getClientEmployees', {
        error: error instanceof Error ? error.message : String(error),
        clientId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve client employees',
      }, 500);
    }
  });

  logger.info('clients', 'setupClientRoutes', {
    message: 'Additional client routes created',
    routes: [
      'GET /make-server-6fcaeea3/clients/:clientId/sites',
      'GET /make-server-6fcaeea3/clients/:clientId/employees',
    ],
  });
}