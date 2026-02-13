/**
 * Orders Resource - Migrated to CRUD Factory
 * 
 * Order management with CRUD operations using the factory pattern.
 * 
 * @module resources/orders
 * @created 2026-02-09
 * @migrated Phase 3.2
 */

import type { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import {
  createCrudRoutes,
  validateRequired,
  validateEmail,
} from '../crud_factory.ts';
import * as kv from '../kv_env.ts';
import { logger } from '../logger.ts';

// ============================================
// Type Definitions
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

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed';

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

// ============================================
// Validation
// ============================================

function validateOrder(data: Partial<Order>): string | null {
  // Required fields
  const requiredError = validateRequired(data, ['siteId', 'employeeEmail', 'giftId']);
  if (requiredError) return requiredError;

  // Email validation
  const emailError = validateEmail(data.employeeEmail!);
  if (emailError) return 'Employee email: ' + emailError;

  // Status validation
  if (data.status) {
    const validStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'failed',
    ];

    if (!validStatuses.includes(data.status)) {
      return `Status must be one of: ${validStatuses.join(', ')}`;
    }
  }

  // Shipping address validation (if provided)
  if (data.shippingAddress) {
    const addr = data.shippingAddress;
    
    if (!addr.addressLine1) {
      return 'Shipping address line 1 is required';
    }
    if (!addr.city) {
      return 'Shipping city is required';
    }
    if (!addr.state) {
      return 'Shipping state/province is required';
    }
    if (!addr.postalCode) {
      return 'Shipping postal code is required';
    }
    if (!addr.country) {
      return 'Shipping country is required';
    }
  }

  return null;
}

// ============================================
// Transformation
// ============================================

let orderCounter = 100000; // Start from 100001

function transformOrder(data: Partial<Order>): Partial<Order> {
  return {
    ...data,
    employeeEmail: data.employeeEmail?.toLowerCase().trim(),
    status: data.status || 'pending',
  };
}

// ============================================
// Access Control
// ============================================

async function orderAccessControl(c: Context, resourceId?: string): Promise<boolean> {
  const userId = c.get('userId') || c.get('adminId');
  const userRole = c.get('userRole');

  logger.debug('orders', 'accessControl', {
    userId,
    userRole,
    resourceId,
    method: c.req.method,
  });

  // Read access: Admin or authenticated user (for their own orders)
  if (c.req.method === 'GET') {
    // Admins can view all orders
    if (userRole && ['admin', 'system_admin', 'super_admin', 'order_admin'].includes(userRole)) {
      return true;
    }

    // Users can view their own orders (if resourceId matches their order)
    if (userId && resourceId) {
      const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
      const order = await kv.get<Order>(`order:${environmentId}:${resourceId}`, environmentId);
      
      if (order && order.employeeId === userId) {
        return true;
      }
    }

    // For GET all, allow authenticated users (will filter on backend)
    if (!resourceId && userId) {
      return true;
    }

    return false;
  }

  // Write access: Admin only
  if (!userRole || !['admin', 'system_admin', 'super_admin', 'order_admin'].includes(userRole)) {
    logger.warn('orders', 'accessControl', {
      error: 'Insufficient permissions for write operation',
      userRole,
    });
    return false;
  }

  return true;
}

// ============================================
// Custom ID Generator
// ============================================

function generateOrderId(): string {
  orderCounter++;
  const orderNumber = String(orderCounter).padStart(8, '0');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${orderNumber}-${random}`;
}

// ============================================
// Setup Routes
// ============================================

export function setupOrderRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('orders', 'setupOrderRoutes', {
    message: 'Setting up Order CRUD routes',
    hasMiddleware: !!verifyAdminMiddleware,
  });

  // Create standard CRUD routes
  createCrudRoutes<Order>(app, {
    resourceName: 'orders',
    keyPrefix: 'order',
    
    validate: validateOrder,
    transform: transformOrder,
    accessControl: orderAccessControl,
    generateId: generateOrderId,
    middleware: verifyAdminMiddleware, // Apply admin auth middleware
    
    auditLogging: true,
    softDelete: true, // Soft delete orders (never permanently delete)
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 200,
    additionalFilters: ['siteId', 'status', 'employeeId'],
  });

  logger.info('orders', 'setupOrderRoutes', {
    message: 'Order CRUD routes created',
    routes: [
      'GET /make-server-6fcaeea3/orders',
      'GET /make-server-6fcaeea3/orders/:id',
      'POST /make-server-6fcaeea3/orders',
      'PUT /make-server-6fcaeea3/orders/:id',
      'DELETE /make-server-6fcaeea3/orders/:id (soft)',
    ],
  });

  // ============================================
  // Additional Custom Routes (Non-CRUD)
  // ============================================

  // Create order (public endpoint with session verification)
  app.post('/make-server-6fcaeea3/public/orders', async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'development';

    try {
      const orderData = await c.req.json();

      // Validate required fields
      const validationError = validateOrder(orderData);
      if (validationError) {
        return c.json({
          success: false,
          error: validationError,
        }, 400);
      }

      // Verify site exists and is active
      const site = await kv.get(`sites:${environmentId}:${orderData.siteId}`, environmentId);
      if (!site || site.status !== 'active') {
        return c.json({
          success: false,
          error: 'Site not found or not active',
        }, 404);
      }

      // Verify gift exists and is available
      const gift = await kv.get(`gift:${environmentId}:${orderData.giftId}`, environmentId);
      if (!gift || gift.status !== 'active' || gift.deleted) {
        return c.json({
          success: false,
          error: 'Gift not found or not available',
        }, 404);
      }

      // Check inventory if tracking is enabled
      if (gift.inventoryTracking) {
        if ((gift.inventoryQuantity || 0) <= 0) {
          return c.json({
            success: false,
            error: 'Gift is out of stock',
          }, 400);
        }

        // Decrement inventory
        gift.inventoryQuantity = (gift.inventoryQuantity || 0) - 1;
        await kv.set(`gift:${environmentId}:${orderData.giftId}`, gift, environmentId);
      }

      // Generate order ID and number
      const orderId = generateOrderId();

      // Create order
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

      logger.info('orders', 'createPublicOrder', {
        orderId,
        siteId: orderData.siteId,
        giftId: orderData.giftId,
        employeeEmail: orderData.employeeEmail,
        environmentId,
      });

      return c.json({
        success: true,
        data: order,
        message: 'Order created successfully',
      }, 201);
    } catch (error) {
      logger.error('orders', 'createPublicOrder', {
        error: error instanceof Error ? error.message : String(error),
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to create order',
      }, 500);
    }
  });

  // Update order status (admin only)
  app.patch('/make-server-6fcaeea3/orders/:id/status', async (c) => {
    const environmentId = c.get('environmentId') || c.req.header('X-Environment-Id') || 'development';
    const orderId = c.req.param('id');

    try {
      // Access control
      const hasAccess = await orderAccessControl(c, orderId);
      if (!hasAccess) {
        return c.json({ success: false, error: 'Access denied' }, 403);
      }

      const { status, trackingNumber } = await c.req.json();

      // Validate status
      const validStatuses: OrderStatus[] = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'failed',
      ];

      if (!validStatuses.includes(status)) {
        return c.json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        }, 400);
      }

      // Get existing order
      const order = await kv.get<Order>(`order:${environmentId}:${orderId}`, environmentId);

      if (!order) {
        return c.json({
          success: false,
          error: 'Order not found',
        }, 404);
      }

      // Update order
      order.status = status;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      order.updatedAt = new Date().toISOString();
      order.updatedBy = c.get('userId') || c.get('adminId');

      await kv.set(`order:${environmentId}:${orderId}`, order, environmentId);

      logger.info('orders', 'updateOrderStatus', {
        orderId,
        status,
        trackingNumber: trackingNumber || 'N/A',
        environmentId,
      });

      return c.json({
        success: true,
        data: order,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      logger.error('orders', 'updateOrderStatus', {
        error: error instanceof Error ? error.message : String(error),
        orderId,
        environmentId,
      });

      return c.json({
        success: false,
        error: 'Failed to update order status',
      }, 500);
    }
  });

  logger.info('orders', 'setupOrderRoutes', {
    message: 'Additional order routes created',
    routes: [
      'POST /make-server-6fcaeea3/public/orders',
      'PATCH /make-server-6fcaeea3/orders/:id/status',
    ],
  });
}