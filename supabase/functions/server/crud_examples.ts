/**
 * CRUD Factory Usage Examples
 * 
 * This file demonstrates how to use the CRUD factory to create
 * standardized API routes for different resources.
 * 
 * @module crud_examples
 * @created 2026-02-09
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
  normalizeWhitespace,
} from './crud_factory.ts';
import * as kv from './kv_store.tsx';

// ============================================
// Example 1: Simple CRUD - Clients
// ============================================

interface Client {
  name: string;
  email: string;
  phone?: string;
  website?: string;
}

export function setupClientRoutes(app: Hono): void {
  createCrudRoutes<Client>(app, {
    resourceName: 'clients',
    keyPrefix: 'client',
    
    validate: (data) => {
      // Check required fields
      const requiredError = validateRequired(data, ['name', 'email']);
      if (requiredError) return requiredError;
      
      // Validate email format
      const emailError = validateEmail(data.email);
      if (emailError) return emailError;
      
      // Validate name length
      const nameError = validateStringLength(data.name, 'name', 3, 100);
      if (nameError) return nameError;
      
      // Validate website if provided
      if (data.website) {
        const urlError = validateUrl(data.website);
        if (urlError) return urlError;
      }
      
      return null;
    },
    
    transform: (data) => ({
      ...data,
      name: sanitizeString(data.name),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim(),
    }),
    
    auditLogging: true,
    softDelete: false, // Hard delete for clients
    enablePagination: true,
    defaultPageSize: 50,
  });
}

// ============================================
// Example 2: Advanced CRUD - Products
// ============================================

interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  active?: boolean;
}

interface ProductStored extends ProductInput {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export function setupProductRoutes(app: Hono): void {
  createCrudRoutes<ProductInput, ProductStored>(app, {
    resourceName: 'products',
    keyPrefix: 'product',
    
    validate: (data) => {
      const required = validateRequired(data, ['name', 'price', 'category']);
      if (required) return required;
      
      if (typeof data.price !== 'number' || data.price <= 0) {
        return 'Price must be a positive number';
      }
      
      const nameLength = validateStringLength(data.name, 'name', 3, 200);
      if (nameLength) return nameLength;
      
      if (data.imageUrl) {
        const urlError = validateUrl(data.imageUrl);
        if (urlError) return 'Invalid image URL';
      }
      
      return null;
    },
    
    transform: (data) => ({
      ...data,
      name: sanitizeString(data.name),
      description: sanitizeString(data.description),
      slug: data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      price: parseFloat(data.price.toFixed(2)),
      active: data.active !== false, // Default to true
    }),
    
    postProcess: (data) => ({
      ...data,
      formattedPrice: `$${data.price.toFixed(2)}`,
      isAvailable: data.active,
    }),
    
    auditLogging: true,
    softDelete: true, // Soft delete for products (retain history)
    enablePagination: true,
    defaultPageSize: 20,
    maxPageSize: 100,
    additionalFilters: ['category', 'active'],
  });
}

// ============================================
// Example 3: Custom Access Control - User Posts
// ============================================

interface UserPost {
  title: string;
  content: string;
  published?: boolean;
  ownerId?: string; // Set by transform
}

export function setupUserPostRoutes(app: Hono): void {
  createCrudRoutes<UserPost>(app, {
    resourceName: 'posts',
    keyPrefix: 'post',
    
    validate: (data) => {
      const required = validateRequired(data, ['title', 'content']);
      if (required) return required;
      
      const titleLength = validateStringLength(data.title, 'title', 5, 200);
      if (titleLength) return titleLength;
      
      if (data.content.length < 10) {
        return 'Content must be at least 10 characters';
      }
      
      return null;
    },
    
    transform: (data) => ({
      ...data,
      title: normalizeWhitespace(sanitizeString(data.title)),
      content: sanitizeString(data.content),
      published: data.published || false,
    }),
    
    // Custom access control: users can only access their own posts
    accessControl: async (c: Context, resourceId?: string) => {
      const userId = c.get('userId');
      const userRole = c.get('userRole');
      
      // Admins have full access
      if (userRole === 'admin' || userRole === 'system_admin') {
        return true;
      }
      
      // Must be authenticated
      if (!userId) {
        return false;
      }
      
      // For specific resource, check ownership
      if (resourceId) {
        const environmentId = c.req.header('X-Environment-Id') || 'production';
        const key = `post:${environmentId}:${resourceId}`;
        const post = await kv.get<UserPost>(key);
        
        if (!post) {
          return false; // Will return 404 from main handler
        }
        
        return post.ownerId === userId;
      }
      
      // For listing, allow (can filter on frontend)
      return true;
    },
    
    auditLogging: true,
    softDelete: true,
    enablePagination: true,
    defaultPageSize: 10,
  });
}

// ============================================
// Example 4: Sequential IDs - Orders
// ============================================

interface Order {
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// Order counter (in production, use KV store to persist)
let orderCounter = 1000;

export function setupOrderRoutes(app: Hono): void {
  createCrudRoutes<Order>(app, {
    resourceName: 'orders',
    keyPrefix: 'order',
    
    // Custom ID generator for sequential order numbers
    generateId: () => {
      orderCounter++;
      const orderNumber = String(orderCounter).padStart(6, '0');
      return `ORD-${orderNumber}`;
    },
    
    validate: (data) => {
      const required = validateRequired(data, ['customerId', 'customerEmail', 'items']);
      if (required) return required;
      
      const emailError = validateEmail(data.customerEmail);
      if (emailError) return emailError;
      
      if (!Array.isArray(data.items) || data.items.length === 0) {
        return 'Order must have at least one item';
      }
      
      // Validate each item
      for (const item of data.items) {
        if (!item.productId || !item.quantity || !item.price) {
          return 'Invalid order item';
        }
        if (item.quantity <= 0) {
          return 'Item quantity must be greater than 0';
        }
        if (item.price < 0) {
          return 'Item price cannot be negative';
        }
      }
      
      if (typeof data.total !== 'number' || data.total <= 0) {
        return 'Total must be a positive number';
      }
      
      return null;
    },
    
    transform: (data) => ({
      ...data,
      status: data.status || 'pending',
      total: parseFloat(data.total.toFixed(2)),
      items: data.items.map(item => ({
        ...item,
        price: parseFloat(item.price.toFixed(2)),
      })),
    }),
    
    auditLogging: true,
    softDelete: true, // Never hard delete orders
    enablePagination: true,
    defaultPageSize: 25,
    additionalFilters: ['customerId', 'status'],
  });
}

// ============================================
// Example 5: Nested Resources - Site Configuration
// ============================================

interface SiteConfig {
  siteId: string;
  siteName: string;
  brandingConfig: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  validationConfig: {
    methods: string[];
    emailDomains?: string[];
  };
  features: {
    celebrations: boolean;
    giftSelection: boolean;
    notifications: boolean;
  };
}

export function setupSiteConfigRoutes(app: Hono): void {
  createCrudRoutes<SiteConfig>(app, {
    resourceName: 'site-configs',
    keyPrefix: 'site-config',
    
    validate: (data) => {
      const required = validateRequired(data, ['siteId', 'siteName']);
      if (required) return required;
      
      // Validate branding config
      if (!data.brandingConfig) {
        return 'Branding configuration is required';
      }
      
      const { primaryColor, secondaryColor } = data.brandingConfig;
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      if (!hexColorRegex.test(primaryColor)) {
        return 'Primary color must be a valid hex color';
      }
      
      if (!hexColorRegex.test(secondaryColor)) {
        return 'Secondary color must be a valid hex color';
      }
      
      // Validate validation config
      if (!data.validationConfig || !Array.isArray(data.validationConfig.methods)) {
        return 'Validation methods are required';
      }
      
      if (data.validationConfig.methods.length === 0) {
        return 'At least one validation method is required';
      }
      
      // Validate features
      if (!data.features) {
        return 'Features configuration is required';
      }
      
      return null;
    },
    
    transform: (data) => ({
      ...data,
      siteName: sanitizeString(data.siteName),
      brandingConfig: {
        ...data.brandingConfig,
        primaryColor: data.brandingConfig.primaryColor.toUpperCase(),
        secondaryColor: data.brandingConfig.secondaryColor.toUpperCase(),
      },
      validationConfig: {
        ...data.validationConfig,
        emailDomains: data.validationConfig.emailDomains?.map(d => d.toLowerCase()),
      },
    }),
    
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    additionalFilters: ['siteId'],
  });
}

// ============================================
// Example 6: Minimal Configuration - Tags
// ============================================

interface Tag {
  name: string;
  color?: string;
}

export function setupTagRoutes(app: Hono): void {
  createCrudRoutes<Tag>(app, {
    resourceName: 'tags',
    keyPrefix: 'tag',
    
    validate: (data) => {
      if (!data.name || data.name.trim().length === 0) {
        return 'Tag name is required';
      }
      return null;
    },
    
    transform: (data) => ({
      name: data.name.trim().toLowerCase(),
      color: data.color || '#gray',
    }),
  });
  // Uses all defaults:
  // - auditLogging: true
  // - softDelete: false
  // - enablePagination: true
  // - defaultPageSize: 50
  // - maxPageSize: 100
}

// ============================================
// Example 7: Read-Only Resource (Logs)
// ============================================

export function setupLogRoutes(app: Hono): void {
  // Only create GET routes by using a custom pattern
  // (Note: Full CRUD factory doesn't support this directly,
  // but you can create manual GET routes with similar structure)
  
  const basePath = '/make-server-6fcaeea3/logs';
  
  // GET all logs
  app.get(basePath, async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'production';
    const prefix = `log:${environmentId}:`;
    
    const logs = await kv.getByPrefix(prefix);
    
    // Sort by timestamp (newest first)
    logs.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return c.json({
      success: true,
      data: logs,
      meta: { total: logs.length },
    });
  });
  
  // GET log by ID
  app.get(`${basePath}/:id`, async (c) => {
    const environmentId = c.req.header('X-Environment-Id') || 'production';
    const logId = c.req.param('id');
    const key = `log:${environmentId}:${logId}`;
    
    const log = await kv.get(key);
    
    if (!log) {
      return c.json({ success: false, error: 'Log not found' }, 404);
    }
    
    return c.json({ success: true, data: log });
  });
}

// ============================================
// Setup All Example Routes
// ============================================

export function setupAllExampleRoutes(app: Hono): void {
  setupClientRoutes(app);
  setupProductRoutes(app);
  setupUserPostRoutes(app);
  setupOrderRoutes(app);
  setupSiteConfigRoutes(app);
  setupTagRoutes(app);
  setupLogRoutes(app);
}
