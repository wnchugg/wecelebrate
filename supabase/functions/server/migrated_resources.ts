/**
 * Migrated CRUD Resources (Consolidated)
 * 
 * All migrated resources consolidated into a single file for Supabase deployment.
 * This avoids subdirectory issues with Edge Functions.
 * 
 * @module migrated_resources
 * @created 2026-02-09
 * @migrated Phase 3.2 - Complete
 * 
 * Resources: 10
 * - Clients, Sites, Gifts, Orders
 * - Employees, Admin Users, Roles, Access Groups
 * - Celebrations, Email Templates
 */

import type { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import {
  createCrudRoutes,
  validateRequired,
  validateStringLength,
  validateEmail,
  validateUrl,
  sanitizeString,
} from './crud_factory.ts';
import * as kv from './kv_env.ts';
import { logger } from './logger.ts';
import { getCachedData, setCachedData, clearCache } from './index.tsx';

// ============================================
// CLIENTS RESOURCE
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
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateClient(data: Partial<Client>): string | null {
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  if (data.contactEmail) {
    const emailError = validateEmail(data.contactEmail);
    if (emailError) return 'Contact email: ' + emailError;
  }

  if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
    return 'Status must be one of: active, inactive, suspended';
  }

  return null;
}

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

async function clientAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'client_admin'].includes(userRole);
}

function generateClientId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupClientRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Client>(app, {
    resourceName: 'clients',
    keyPrefix: 'client', // FIXED: Changed from 'clients' to 'client' to match migration
    validate: validateClient,
    transform: transformClient,
    accessControl: clientAccessControl,
    generateId: generateClientId,
    middleware: verifyAdminMiddleware,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status'],
  });

  app.get('/make-server-6fcaeea3/clients/:clientId/sites', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const clientId = c.req.param('clientId');

    try {
      const hasAccess = await clientAccessControl(c);
      if (!hasAccess) return c.json({ success: false, error: 'Access denied' }, 403);

      const allSites = await kv.getByPrefix('site:', environmentId); // FIXED: Changed from 'sites:' to 'site:'
      const sites = allSites.filter((site: any) => site.clientId === clientId);
      return c.json({ success: true, data: sites, meta: { total: sites.length } });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to retrieve client sites' }, 500);
    }
  });

  app.get('/make-server-6fcaeea3/clients/:clientId/employees', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const clientId = c.req.param('clientId');

    try {
      const hasAccess = await clientAccessControl(c);
      if (!hasAccess) return c.json({ success: false, error: 'Access denied' }, 403);

      const allEmployees = await kv.getByPrefix('employees:', environmentId);
      const employees = allEmployees.filter((emp: any) => emp.clientId === clientId);
      return c.json({ success: true, data: employees, meta: { total: employees.length } });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to retrieve client employees' }, 500);
    }
  });
}

// ============================================
// SITES RESOURCE
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
  brandingConfig?: Record<string, any>;
  pageConfigurations?: any[];
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateSite(data: Partial<Site>): string | null {
  // For updates, only validate fields that are present
  // clientId, name, startDate, and endDate are only required for creation (full object)
  // During updates, these might not be in the partial data
  const isFullSite = 'clientId' in data && 'name' in data && 'startDate' in data && 'endDate' in data;
  
  // Only validate required fields if this looks like a full site creation
  if (isFullSite) {
    const requiredError = validateRequired(data, ['clientId', 'name', 'startDate', 'endDate']);
    if (requiredError) return requiredError;
  }

  // Validate name if present
  if (data.name) {
    const nameError = validateStringLength(data.name, 'name', 2, 200);
    if (nameError) return nameError;
  }

  // Validate dates if present
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) return 'Start date must be a valid date';
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) return 'End date must be a valid date';
  }

  // Validate date range if both dates are present
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate <= startDate) return 'End date must be after start date';
  }

  if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
    return 'Status must be one of: active, inactive, draft';
  }

  return null;
}

function transformSite(data: Partial<Site>): Partial<Site> {
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
  };
}

async function siteAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'client_admin', 'site_admin'].includes(userRole);
}

function generateSiteId(): string {
  return `site-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupSiteRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Site>(app, {
    resourceName: 'sites',
    keyPrefix: 'site', // FIXED: Changed from 'sites' to 'site' to match migration
    validate: validateSite,
    transform: transformSite,
    accessControl: siteAccessControl,
    generateId: generateSiteId,
    middleware: verifyAdminMiddleware,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['clientId', 'status'],
  });

  // Public endpoint: Get active sites (no auth required)
  app.get('/make-server-6fcaeea3/public/sites', async (c) => {
    const environmentId = c.req.header('X-Environment-ID') || 'development';

    try {
      const cacheKey = `sites:list:${environmentId}`;
      
      // Try cache first
      const cached = getCachedData<Site[]>(cacheKey);
      if (cached) {
        console.log('[Cache Hit] Returning cached sites');
        const activeSites = cached
          // Include sites with status 'active' OR undefined (for backward compatibility)
          .filter((site: Site) => !site.status || site.status === 'active')
          .map((site: Site) => ({
            id: site.id,
            name: site.name,
            clientId: site.clientId,
            domain: site.domain,
            status: site.status || 'active', // Default to 'active' if undefined
            branding: site.branding,
            settings: site.settings,
            createdAt: site.createdAt,
            updatedAt: site.updatedAt,
          }));
        return c.json({ sites: activeSites, cached: true });
      }
      
      // Cache miss - fetch from database with fast timeout
      console.log('[Cache Miss] Fetching sites from database with 5s timeout');
      
      // Race between database fetch and 5-second timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Fast timeout - graceful degradation')), 5000)
      );
      
      try {
        const allSites = await Promise.race([
          kv.getByPrefix('site:', environmentId),
          timeoutPromise
        ]);
        
        // Store in cache
        setCachedData(cacheKey, allSites || []);
        console.log('[Success] Sites fetched and cached');
        
        if (!allSites || allSites.length === 0) {
          return c.json({ sites: [] });
        }
        
        const activeSites = allSites
          // Include sites with status 'active' OR undefined (for backward compatibility)
          .filter((site: Site) => !site.status || site.status === 'active')
          .map((site: Site) => ({
            id: site.id,
            name: site.name,
            clientId: site.clientId,
            domain: site.domain,
            status: site.status || 'active', // Default to 'active' if undefined
            branding: site.branding,
            settings: site.settings,
            createdAt: site.createdAt,
            updatedAt: site.updatedAt,
          }));

        return c.json({ sites: activeSites });
      } catch (timeoutError: any) {
        // Fast timeout hit - return empty and try to fetch in background
        console.warn('[Fast Timeout] Returning empty sites, will cache in background');
        
        // Attempt background fetch (don't await)
        kv.getByPrefix('site:', environmentId)
          .then(sites => {
            if (sites && sites.length > 0) {
              setCachedData(cacheKey, sites);
              console.log('[Background Fetch] Sites cached for next request');
            }
          })
          .catch(err => console.error('[Background Fetch] Failed:', err.message));
        
        return c.json({ 
          sites: [], 
          warning: 'Database slow - loading in background' 
        });
      }
    } catch (error: any) {
      console.error('[Public API] Get sites error:', error);
      // Return empty array on connection errors for graceful degradation
      const isConnectionError = error?.message?.includes('connection failed') || 
                               error?.message?.includes('timeout') ||
                               error?.message?.includes('522');
      if (isConnectionError) {
        console.log('[Graceful Degradation] Returning empty sites list due to timeout');
        return c.json({ sites: [], warning: 'Database temporarily unavailable' });
      }
      return c.json({ error: 'Failed to retrieve active sites', sites: [] }, 500);
    }
  });

  // Public endpoint: Get specific site (no auth required)
  app.get('/make-server-6fcaeea3/public/sites/:siteId', async (c) => {
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    const siteId = c.req.param('siteId');

    try {
      console.log('[Public API] Getting site:', { siteId, environmentId, key: `site:${environmentId}:${siteId}` });
      
      const site = await kv.get<Site>(`site:${environmentId}:${siteId}`, environmentId);

      console.log('[Public API] Site found:', !!site, site ? { id: site.id, name: site.name, status: site.status } : 'null');

      if (!site) {
        return c.json({ error: 'Site not found' }, 404);
      }

      if (site.status !== 'active') {
        return c.json({ error: 'Site not available' }, 403);
      }

      return c.json({ site });
    } catch (error) {
      console.error('[Public API] Get site error:', error);
      return c.json({ error: 'Failed to retrieve site' }, 500);
    }
  });
}

// ============================================
// GIFTS RESOURCE
// ============================================

export interface Gift {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  msrp?: number;
  sku?: string;
  imageUrl?: string;
  images?: string[];
  status?: 'active' | 'inactive' | 'discontinued';
  inventoryTracking?: boolean;
  inventoryQuantity?: number;
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateGift(data: Partial<Gift>): string | null {
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    return 'Price must be a non-negative number';
  }

  if (data.status && !['active', 'inactive', 'discontinued'].includes(data.status)) {
    return 'Status must be one of: active, inactive, discontinued';
  }

  return null;
}

function transformGift(data: Partial<Gift>): Partial<Gift> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    category: data.category?.trim().toLowerCase(),
    price: data.price !== undefined ? parseFloat(data.price.toFixed(2)) : undefined,
    sku: data.sku?.trim().toUpperCase(),
    status: data.status || 'active',
    inventoryTracking: data.inventoryTracking || false,
    inventoryQuantity: data.inventoryQuantity || 0,
    tags: data.tags?.map(tag => tag.trim().toLowerCase()) || [],
  };
}

async function giftAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'catalog_admin'].includes(userRole);
}

function generateGiftId(): string {
  return `gift-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupGiftRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Gift>(app, {
    resourceName: 'admin/gifts',
    keyPrefix: 'gift',
    validate: validateGift,
    transform: transformGift,
    accessControl: giftAccessControl,
    generateId: generateGiftId,
    auditLogging: true,
    softDelete: true,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 200,
    additionalFilters: ['category', 'status'],
    middleware: verifyAdminMiddleware, // CRITICAL FIX: Pass middleware to ensure auth is required
  });

  // COMPATIBILITY: Add wrapper route to match frontend expectations
  // Frontend expects { gifts: [] } but CRUD factory returns { success: true, data: [] }
  // This route wraps the CRUD response to match the expected format
  app.get('/make-server-6fcaeea3/admin/gifts-list', verifyAdminMiddleware, async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    
    try {
      const allGifts = await kv.getByPrefix(`gift:${environmentId}:`, environmentId);
      
      // Filter out soft-deleted gifts
      const activeGifts = allGifts.filter((gift: any) => !gift.deleted && !gift.deletedAt);
      
      return c.json({ gifts: activeGifts });
    } catch (error) {
      return c.json({ gifts: [], error: 'Failed to load gifts' }, 500);
    }
  });

  app.get('/make-server-6fcaeea3/public/sites/:siteId/gifts', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      const site = await kv.get(`site:${environmentId}:${siteId}`, environmentId);
      if (!site || site.status !== 'active') {
        return c.json({ success: false, error: 'Site not found or not active' }, 404);
      }

      const assignments = await kv.getByPrefix(`site-gift-assignment:${siteId}:`, environmentId);
      if (!assignments || assignments.length === 0) {
        return c.json({ success: true, data: [], site: { name: site.name } });
      }

      const giftsWithDetails = await Promise.all(
        assignments.map(async (assignment: any) => {
          const gift = await kv.get(`gift:${environmentId}:${assignment.giftId}`, environmentId);
          if (!gift || gift.status !== 'active' || gift.deleted) return null;

          const inventoryAvailable = gift.inventoryTracking ? (gift.inventoryQuantity || 0) > 0 : true;

          return {
            ...gift,
            assignmentId: assignment.id,
            displayOrder: assignment.displayOrder,
            available: inventoryAvailable,
          };
        })
      );

      const availableGifts = giftsWithDetails
        .filter(g => g !== null)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      return c.json({ success: true, data: availableGifts, site: { name: site.name }, meta: { total: availableGifts.length } });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to retrieve site gifts' }, 500);
    }
  });
}

// ============================================
// ORDERS RESOURCE
// ============================================

export interface Order {
  id?: string;
  orderNumber?: string;
  siteId: string;
  employeeId?: string;
  employeeEmail: string;
  employeeName?: string;
  giftId: string;
  giftName?: string;
  status?: OrderStatus;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

export interface ShippingAddress {
  name?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

let orderCounter = 100000;

function validateOrder(data: Partial<Order>): string | null {
  const requiredError = validateRequired(data, ['siteId', 'employeeEmail', 'giftId']);
  if (requiredError) return requiredError;

  const emailError = validateEmail(data.employeeEmail!);
  if (emailError) return 'Employee email: ' + emailError;

  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];
  if (data.status && !validStatuses.includes(data.status)) {
    return `Status must be one of: ${validStatuses.join(', ')}`;
  }

  return null;
}

function transformOrder(data: Partial<Order>): Partial<Order> {
  return {
    ...data,
    employeeEmail: data.employeeEmail?.toLowerCase().trim(),
    status: data.status || 'pending',
  };
}

async function orderAccessControl(c: Context, resourceId?: string): Promise<boolean> {
  const userRole = c.get('userRole');
  const userId = c.get('userId');
  const method = c.req.method;
  
  // DEBUG: Log access control check
  console.log('[orderAccessControl] Checking access:', {
    method,
    userRole,
    userId,
    resourceId,
    hasUserRole: !!userRole,
    hasUserId: !!userId
  });
  
  if (c.req.method === 'GET') {
    if (userRole && ['admin', 'system_admin', 'super_admin', 'order_admin'].includes(userRole)) {
      console.log('[orderAccessControl] ✅ Access granted for GET (admin role)');
      return true;
    }
  }
  if (!userRole || !['admin', 'system_admin', 'super_admin', 'order_admin'].includes(userRole)) {
    console.log('[orderAccessControl] ❌ Access denied - invalid or missing role');
    return false;
  }
  console.log('[orderAccessControl] ✅ Access granted');
  return true;
}

function generateOrderId(): string {
  orderCounter++;
  const orderNumber = String(orderCounter).padStart(8, '0');
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${orderNumber}-${random}`;
}

function setupOrderRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Order>(app, {
    resourceName: 'orders',
    keyPrefix: 'order',
    validate: validateOrder,
    transform: transformOrder,
    accessControl: orderAccessControl,
    generateId: generateOrderId,
    middleware: verifyAdminMiddleware, // CRITICAL FIX: Added middleware parameter
    auditLogging: true,
    softDelete: true,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 200,
    additionalFilters: ['siteId', 'status', 'employeeId'],
  });

  app.post('/make-server-6fcaeea3/public/orders', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';

    try {
      const orderData = await c.req.json();
      const validationError = validateOrder(orderData);
      if (validationError) {
        return c.json({ success: false, error: validationError }, 400);
      }

      const site = await kv.get(`site:${environmentId}:${orderData.siteId}`, environmentId);
      if (!site || site.status !== 'active') {
        return c.json({ success: false, error: 'Site not found or not active' }, 404);
      }

      const gift = await kv.get(`gift:${environmentId}:${orderData.giftId}`, environmentId);
      if (!gift || gift.status !== 'active' || gift.deleted) {
        return c.json({ success: false, error: 'Gift not found or not available' }, 404);
      }

      if (gift.inventoryTracking && (gift.inventoryQuantity || 0) <= 0) {
        return c.json({ success: false, error: 'Gift is out of stock' }, 400);
      }

      if (gift.inventoryTracking) {
        gift.inventoryQuantity = (gift.inventoryQuantity || 0) - 1;
        await kv.set(`gift:${environmentId}:${orderData.giftId}`, gift, environmentId);
      }

      const orderId = generateOrderId();
      const order: Order = {
        ...transformOrder(orderData),
        id: orderId,
        orderNumber: orderId,
        giftName: gift.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`order:${environmentId}:${orderId}`, order, environmentId);

      return c.json({ success: true, data: order, message: 'Order created successfully' }, 201);
    } catch (error) {
      return c.json({ success: false, error: 'Failed to create order' }, 500);
    }
  });
}

// ============================================
// EMPLOYEES RESOURCE
// ============================================

export interface Employee {
  id?: string;
  clientId: string;
  siteId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateEmployee(data: Partial<Employee>): string | null {
  const requiredError = validateRequired(data, ['clientId', 'email']);
  if (requiredError) return requiredError;

  const emailError = validateEmail(data.email!);
  if (emailError) return emailError;

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return 'Status must be one of: active, inactive';
  }

  return null;
}

function transformEmployee(data: Partial<Employee>): Partial<Employee> {
  return {
    ...data,
    email: data.email?.toLowerCase().trim(),
    firstName: data.firstName ? sanitizeString(data.firstName) : undefined,
    lastName: data.lastName ? sanitizeString(data.lastName) : undefined,
    department: data.department?.trim(),
    jobTitle: data.jobTitle?.trim(),
    status: data.status || 'active',
  };
}

async function employeeAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'client_admin', 'hr_admin'].includes(userRole);
}

function generateEmployeeId(): string {
  return `emp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupEmployeeRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Employee>(app, {
    resourceName: 'employees',
    keyPrefix: 'employees',
    validate: validateEmployee,
    transform: transformEmployee,
    accessControl: employeeAccessControl,
    generateId: generateEmployeeId,
    middleware: verifyAdminMiddleware, // CRITICAL FIX: Pass middleware to ensure auth is required
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 100,
    maxPageSize: 500,
    additionalFilters: ['clientId', 'siteId', 'status', 'department'],
  });
}

// ============================================
// ADMIN USERS RESOURCE
// ============================================

export interface AdminUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateAdminUser(data: Partial<AdminUser>): string | null {
  const requiredError = validateRequired(data, ['email']);
  if (requiredError) return requiredError;

  const emailError = validateEmail(data.email!);
  if (emailError) return emailError;

  if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
    return 'Status must be one of: active, inactive, suspended';
  }

  return null;
}

function transformAdminUser(data: Partial<AdminUser>): Partial<AdminUser> {
  return {
    ...data,
    email: data.email?.toLowerCase().trim(),
    firstName: data.firstName ? sanitizeString(data.firstName) : undefined,
    lastName: data.lastName ? sanitizeString(data.lastName) : undefined,
    status: data.status || 'active',
    permissions: data.permissions || [],
  };
}

async function adminUserAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['system_admin', 'super_admin'].includes(userRole);
}

function generateAdminUserId(): string {
  return `admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupAdminUserRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<AdminUser>(app, {
    resourceName: 'admin/users',
    keyPrefix: 'admin_user',
    validate: validateAdminUser,
    transform: transformAdminUser,
    accessControl: adminUserAccessControl,
    generateId: generateAdminUserId,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status', 'role'],
  });
}

// ============================================
// ROLES RESOURCE
// ============================================

export interface Role {
  id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  isSystemRole?: boolean;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateRole(data: Partial<Role>): string | null {
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 100);
  if (nameError) return nameError;

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return 'Status must be one of: active, inactive';
  }

  return null;
}

function transformRole(data: Partial<Role>): Partial<Role> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    permissions: data.permissions || [],
    isSystemRole: data.isSystemRole || false,
    status: data.status || 'active',
  };
}

async function roleAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin'].includes(userRole);
}

function generateRoleId(): string {
  return `role-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupRoleRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Role>(app, {
    resourceName: 'roles',
    keyPrefix: 'role',
    validate: validateRole,
    transform: transformRole,
    accessControl: roleAccessControl,
    generateId: generateRoleId,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status', 'isSystemRole'],
  });
}

// ============================================
// ACCESS GROUPS RESOURCE
// ============================================

export interface AccessGroup {
  id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  siteId?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateAccessGroup(data: Partial<AccessGroup>): string | null {
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 100);
  if (nameError) return nameError;

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return 'Status must be one of: active, inactive';
  }

  return null;
}

function transformAccessGroup(data: Partial<AccessGroup>): Partial<AccessGroup> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    permissions: data.permissions || [],
    status: data.status || 'active',
  };
}

async function accessGroupAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin'].includes(userRole);
}

function generateAccessGroupId(): string {
  return `access-group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupAccessGroupRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<AccessGroup>(app, {
    resourceName: 'access-groups',
    keyPrefix: 'access_group',
    validate: validateAccessGroup,
    transform: transformAccessGroup,
    accessControl: accessGroupAccessControl,
    generateId: generateAccessGroupId,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status', 'siteId'],
  });
}

// ============================================
// CELEBRATIONS RESOURCE
// ============================================

export interface Celebration {
  id?: string;
  clientId: string;
  siteId?: string;
  employeeId?: string;
  type: string;
  date: string;
  title?: string;
  message?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateCelebration(data: Partial<Celebration>): string | null {
  const requiredError = validateRequired(data, ['clientId', 'type', 'date']);
  if (requiredError) return requiredError;

  const celebrationDate = new Date(data.date!);
  if (isNaN(celebrationDate.getTime())) {
    return 'Date must be a valid date';
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return 'Status must be one of: active, inactive';
  }

  return null;
}

function transformCelebration(data: Partial<Celebration>): Partial<Celebration> {
  return {
    ...data,
    type: data.type?.trim().toLowerCase(),
    title: data.title ? sanitizeString(data.title) : undefined,
    message: data.message ? sanitizeString(data.message) : undefined,
    status: data.status || 'active',
  };
}

async function celebrationAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'client_admin'].includes(userRole);
}

function generateCelebrationId(): string {
  return `celebration-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupCelebrationRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Celebration>(app, {
    resourceName: 'celebrations',
    keyPrefix: 'celebration',
    validate: validateCelebration,
    transform: transformCelebration,
    accessControl: celebrationAccessControl,
    generateId: generateCelebrationId,
    middleware: verifyAdminMiddleware, // CRITICAL FIX: Pass middleware to ensure auth is required
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 100,
    maxPageSize: 500,
    additionalFilters: ['clientId', 'siteId', 'type', 'status'],
  });
}

// ============================================
// EMAIL TEMPLATES RESOURCE
// ============================================

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  templateType?: string;
  language?: string;
  variables?: string[];
  status?: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateEmailTemplate(data: Partial<EmailTemplate>): string | null {
  const requiredError = validateRequired(data, ['name', 'subject', 'body']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 100);
  if (nameError) return nameError;

  if (data.status && !['active', 'inactive', 'draft'].includes(data.status)) {
    return 'Status must be one of: active, inactive, draft';
  }

  return null;
}

function transformEmailTemplate(data: Partial<EmailTemplate>): Partial<EmailTemplate> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    subject: sanitizeString(data.subject || ''),
    templateType: data.templateType?.trim().toLowerCase(),
    language: data.language?.trim().toLowerCase() || 'en',
    variables: data.variables || [],
    status: data.status || 'draft',
  };
}

async function emailTemplateAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin'].includes(userRole);
}

function generateEmailTemplateId(): string {
  return `email-template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupEmailTemplateRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<EmailTemplate>(app, {
    resourceName: 'email-templates',
    keyPrefix: 'email_template',
    validate: validateEmailTemplate,
    transform: transformEmailTemplate,
    accessControl: emailTemplateAccessControl,
    generateId: generateEmailTemplateId,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['templateType', 'language', 'status'],
  });
}

// ============================================
// BRANDS RESOURCE
// ============================================

export interface Brand {
  id?: string;
  clientId: string;
  clientName?: string;
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

function validateBrand(data: Partial<Brand>): string | null {
  const requiredError = validateRequired(data, ['clientId', 'name']);
  if (requiredError) return requiredError;

  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  if (data.contactEmail) {
    const emailError = validateEmail(data.contactEmail);
    if (emailError) return 'Contact email: ' + emailError;
  }

  if (data.websiteUrl) {
    const urlError = validateUrl(data.websiteUrl);
    if (urlError) return 'Website URL: ' + urlError;
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return 'Status must be one of: active, inactive';
  }

  return null;
}

function transformBrand(data: Partial<Brand>): Partial<Brand> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    clientName: data.clientName ? sanitizeString(data.clientName) : undefined,
    primaryColor: data.primaryColor || '#D91C81',
    secondaryColor: data.secondaryColor || '#1B2A5E',
    tertiaryColor: data.tertiaryColor || '#00B4CC',
    backgroundColor: data.backgroundColor || '#FFFFFF',
    textColor: data.textColor || '#000000',
    headingFont: data.headingFont || 'inter',
    bodyFont: data.bodyFont || 'inter',
    contactEmail: data.contactEmail?.toLowerCase().trim(),
    contactPhone: data.contactPhone?.trim(),
    status: data.status || 'active',
  };
}

async function brandAccessControl(c: Context): Promise<boolean> {
  const userRole = c.get('userRole');
  return userRole && ['admin', 'system_admin', 'super_admin', 'client_admin'].includes(userRole);
}

function generateBrandId(): string {
  return `brand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setupBrandRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<Brand>(app, {
    resourceName: 'brands',
    keyPrefix: 'brand',
    validate: validateBrand,
    transform: transformBrand,
    accessControl: brandAccessControl,
    generateId: generateBrandId,
    middleware: verifyAdminMiddleware, // CRITICAL FIX: Pass middleware to ensure auth is required
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['clientId', 'status'],
  });
}

// ============================================
// Setup All Migrated Resources
// ============================================

export function setupMigratedResources(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('migrated_resources', 'setup', { message: 'Setting up all migrated CRUD resources' });

  const startTime = Date.now();

  // Priority 1: Core Resources
  setupClientRoutes(app, verifyAdminMiddleware);
  setupSiteRoutes(app, verifyAdminMiddleware);
  setupGiftRoutes(app, verifyAdminMiddleware);
  setupOrderRoutes(app, verifyAdminMiddleware);

  // Priority 2: User Management
  setupEmployeeRoutes(app, verifyAdminMiddleware);
  setupAdminUserRoutes(app, verifyAdminMiddleware);
  setupRoleRoutes(app, verifyAdminMiddleware);
  setupAccessGroupRoutes(app, verifyAdminMiddleware);

  // Priority 3: Configuration
  setupCelebrationRoutes(app, verifyAdminMiddleware);
  setupEmailTemplateRoutes(app, verifyAdminMiddleware);
  setupBrandRoutes(app, verifyAdminMiddleware);

  const duration = Date.now() - startTime;

  logger.info('migrated_resources', 'setup', {
    message: 'All migrated CRUD resources setup complete',
    resources: 11,
    totalRoutes: 55, // 5 CRUD per resource
    additionalRoutes: 5, // Custom routes
    duration,
  });

  console.log('✅ Migrated CRUD Resources (11): clients, sites, gifts, orders, employees, admin-users, roles, access-groups, celebrations, email-templates, brands');
  console.log(`📊 Total Routes: ~60 (55 CRUD + 5 custom)`);
  console.log(`⚡ Setup Time: ${duration}ms`);
}