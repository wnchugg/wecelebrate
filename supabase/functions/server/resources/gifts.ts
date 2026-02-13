/**
 * Gifts Resource - Migrated to CRUD Factory
 * 
 * Gift/Product management with CRUD operations using the factory pattern.
 * 
 * @module resources/gifts
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

// ============================================
// Validation
// ============================================

function validateGift(data: Partial<Gift>): string | null {
  // Required fields
  const requiredError = validateRequired(data, ['name']);
  if (requiredError) return requiredError;

  // Name validation
  const nameError = validateStringLength(data.name!, 'name', 2, 200);
  if (nameError) return nameError;

  // Price validation (if provided)
  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      return 'Price must be a non-negative number';
    }
  }

  // MSRP validation (if provided)
  if (data.msrp !== undefined) {
    if (typeof data.msrp !== 'number' || data.msrp < 0) {
      return 'MSRP must be a non-negative number';
    }
  }

  // Inventory validation (if tracking enabled)
  if (data.inventoryTracking) {
    if (data.inventoryQuantity === undefined) {
      return 'Inventory quantity is required when inventory tracking is enabled';
    }
    if (typeof data.inventoryQuantity !== 'number' || data.inventoryQuantity < 0) {
      return 'Inventory quantity must be a non-negative number';
    }
  }

  // Status validation
  if (data.status && !['active', 'inactive', 'discontinued'].includes(data.status)) {
    return 'Status must be one of: active, inactive, discontinued';
  }

  // Image URL validation (if provided)
  if (data.imageUrl) {
    const urlError = validateUrl(data.imageUrl);
    if (urlError) return 'Image URL: ' + urlError;
  }

  // Images validation (if provided)
  if (data.images && Array.isArray(data.images)) {
    for (const url of data.images) {
      const urlError = validateUrl(url);
      if (urlError) return `Image URL '${url}': ` + urlError;
    }
  }

  return null;
}

// ============================================
// Transformation
// ============================================

function transformGift(data: Partial<Gift>): Partial<Gift> {
  return {
    ...data,
    name: sanitizeString(data.name || ''),
    description: data.description ? sanitizeString(data.description) : undefined,
    category: data.category?.trim().toLowerCase(),
    price: data.price !== undefined ? parseFloat(data.price.toFixed(2)) : undefined,
    msrp: data.msrp !== undefined ? parseFloat(data.msrp.toFixed(2)) : undefined,
    sku: data.sku?.trim().toUpperCase(),
    status: data.status || 'active',
    inventoryTracking: data.inventoryTracking || false,
    inventoryQuantity: data.inventoryQuantity || 0,
    tags: data.tags?.map(tag => tag.trim().toLowerCase()) || [],
  };
}

// ============================================
// Access Control
// ============================================

async function giftAccessControl(c: Context, resourceId?: string): Promise<boolean> {
  const userId = c.get('userId') || c.get('adminId');
  const userRole = c.get('userRole');

  logger.debug('gifts', 'accessControl', {
    userId,
    userRole,
    resourceId,
    method: c.req.method,
  });

  // Must have admin role
  if (!userRole || !['admin', 'system_admin', 'super_admin', 'catalog_admin'].includes(userRole)) {
    logger.warn('gifts', 'accessControl', {
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

function generateGiftId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `gift-${timestamp}-${random}`;
}

// ============================================
// Setup Routes
// ============================================

export function setupGiftRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('gifts', 'setupGiftRoutes', {
    message: 'Setting up Gift CRUD routes',
    hasMiddleware: !!verifyAdminMiddleware,
  });

  // Create standard CRUD routes (admin only - /admin/gifts)
  createCrudRoutes<Gift>(app, {
    resourceName: 'admin/gifts',
    keyPrefix: 'gift',
    
    validate: validateGift,
    transform: transformGift,
    accessControl: giftAccessControl,
    generateId: generateGiftId,
    middleware: verifyAdminMiddleware, // Apply admin auth middleware
    
    auditLogging: true,
    softDelete: true, // Soft delete gifts to retain order history
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 200,
    additionalFilters: ['category', 'status', 'inventoryTracking'],
  });

  logger.info('gifts', 'setupGiftRoutes', {
    message: 'Gift CRUD routes created',
    routes: [
      'GET /make-server-6fcaeea3/admin/gifts',
      'GET /make-server-6fcaeea3/admin/gifts/:id',
      'POST /make-server-6fcaeea3/admin/gifts',
      'PUT /make-server-6fcaeea3/admin/gifts/:id',
      'DELETE /make-server-6fcaeea3/admin/gifts/:id (soft)',
    ],
  });

  // ============================================
  // Additional Custom Routes (Non-CRUD)
  // ============================================

  // Get gifts available for a specific site (public endpoint with session verification)
  app.get('/make-server-6fcaeea3/public/sites/:siteId/gifts', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      // Get site
      const site = await kv.get(`sites:${environmentId}:${siteId}`, environmentId);

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

      // Get all site-gift assignments for this site
      const assignments = await kv.getByPrefix(`site-gift-assignment:${siteId}:`, environmentId);

      if (!assignments || assignments.length === 0) {
        return c.json({
          success: true,
          data: [],
          site: { name: site.name, description: site.description },
        });
      }

      // Fetch full gift details for each assignment
      const giftsWithDetails = await Promise.all(
        assignments.map(async (assignment: any) => {
          const gift = await kv.get(`gift:${environmentId}:${assignment.giftId}`, environmentId);

          if (!gift || gift.status !== 'active' || gift.deleted) {
            return null;
          }

          // Check inventory
          const inventoryAvailable = gift.inventoryTracking
            ? (gift.inventoryQuantity || 0) > 0
            : true;

          return {
            ...gift,
            // Include site-specific assignment details
            assignmentId: assignment.id,
            displayOrder: assignment.displayOrder,
            available: inventoryAvailable,
          };
        })
      );

      // Filter out null values and sort by display order
      const availableGifts = giftsWithDetails
        .filter(g => g !== null)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      logger.info('gifts', 'getPublicSiteGifts', {
        siteId,
        assignmentCount: assignments.length,
        availableCount: availableGifts.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: availableGifts,
        site: { name: site.name, description: site.description },
        meta: { total: availableGifts.length },
      });
    } catch (error) {
      logger.error('gifts', 'getPublicSiteGifts', {
        error: error instanceof Error ? error.message : String(error),
        siteId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve site gifts',
      }, 500);
    }
  });

  // Get gifts for a site (admin endpoint)
  app.get('/make-server-6fcaeea3/sites/:siteId/gifts', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const siteId = c.req.param('siteId');

    try {
      // Access control
      const hasAccess = await giftAccessControl(c, siteId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      // Get all site-gift assignments for this site
      const assignments = await kv.getByPrefix(`site-gift-assignment:${siteId}:`, environmentId);

      if (!assignments || assignments.length === 0) {
        return c.json({
          success: true,
          data: [],
          meta: { total: 0 },
        });
      }

      // Fetch full gift details for each assignment
      const giftsWithDetails = await Promise.all(
        assignments.map(async (assignment: any) => {
          const gift = await kv.get(`gift:${environmentId}:${assignment.giftId}`, environmentId);

          if (!gift) {
            return null;
          }

          return {
            ...gift,
            assignmentId: assignment.id,
            displayOrder: assignment.displayOrder,
          };
        })
      );

      // Filter out null values and sort by display order
      const gifts = giftsWithDetails
        .filter(g => g !== null)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      logger.info('gifts', 'getSiteGifts', {
        siteId,
        giftCount: gifts.length,
        environmentId,
      });

      return c.json({
        success: true,
        data: gifts,
        meta: { total: gifts.length },
      });
    } catch (error) {
      logger.error('gifts', 'getSiteGifts', {
        error: error instanceof Error ? error.message : String(error),
        siteId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to retrieve site gifts',
      }, 500);
    }
  });

  logger.info('gifts', 'setupGiftRoutes', {
    message: 'Additional gift routes created',
    routes: [
      'GET /make-server-6fcaeea3/public/sites/:siteId/gifts',
      'GET /make-server-6fcaeea3/sites/:siteId/gifts',
    ],
  });
}