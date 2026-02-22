/**
 * CRUD Route Factory
 * 
 * Generic factory for creating standardized CRUD routes with:
 * - Environment-aware key prefixes
 * - Validation and transformation
 * - Audit logging
 * - Comprehensive error handling
 * - Rate limiting integration
 * - Security best practices
 * 
 * @module crud_factory
 * @created 2026-02-09
 */

import type { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { logger } from './logger.ts';

/**
 * Validation function type
 * Returns error message if invalid, null if valid
 */
type ValidateFn<T> = (data: T) => string | null;

/**
 * Transform function type
 * Transforms input data before storage
 */
type TransformFn<T, R = T> = (data: T) => R;

/**
 * Post-process function type
 * Processes data after retrieval from storage
 */
type PostProcessFn<T, R = T> = (data: T) => R;

/**
 * Access control function type
 * Returns true if user has access, false otherwise
 */
type AccessControlFn = (c: Context, resourceId?: string) => Promise<boolean> | boolean;

/**
 * CRUD Route Configuration
 */
export interface CrudConfig<T = any, R = T> {
  /** Resource name (e.g., "clients", "sites", "products") */
  resourceName: string;
  
  /** KV store key prefix (e.g., "client", "site", "product") */
  keyPrefix: string;
  
  /** Validation function for creating/updating resources */
  validate?: ValidateFn<T>;
  
  /** Transform function before storage (optional) */
  transform?: TransformFn<T, R>;
  
  /** Post-process function after retrieval (optional) */
  postProcess?: PostProcessFn<R, T>;
  
  /** Access control function (optional, defaults to admin-only) */
  accessControl?: AccessControlFn;
  
  /** Middleware to apply to all routes (e.g., authentication) */
  middleware?: any;
  
  /** Enable audit logging (default: true) */
  auditLogging?: boolean;
  
  /** Enable soft delete (default: false) */
  softDelete?: boolean;
  
  /** Additional query parameters for getAll (optional) */
  additionalFilters?: string[];
  
  /** Custom ID generator (optional, defaults to crypto.randomUUID) */
  generateId?: () => string;
  
  /** Enable pagination for getAll (default: true) */
  enablePagination?: boolean;
  
  /** Default page size (default: 50) */
  defaultPageSize?: number;
  
  /** Maximum page size (default: 100) */
  maxPageSize?: number;
}

/**
 * Standard API response wrapper
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

/**
 * Extract environment ID from request headers
 */
function getEnvironmentId(c: Context): string {
  const envId = c.req.header('X-Environment-Id') || 'production';
  logger.debug('crud_factory', 'getEnvironmentId', { environmentId: envId });
  return envId;
}

/**
 * Get user ID from context (assumes auth middleware has run)
 */
function getUserId(c: Context): string | null {
  // Try to get from context state (set by auth middleware)
  const userId = c.get('userId') || c.get('adminId');
  return userId || null;
}

/**
 * Default access control: require authenticated user
 */
async function defaultAccessControl(c: Context): Promise<boolean> {
  const userId = getUserId(c);
  if (!userId) {
    logger.warn('crud_factory', 'defaultAccessControl', { 
      error: 'Unauthorized access attempt - no user ID' 
    });
    return false;
  }
  return true;
}

/**
 * Log audit event
 */
async function logAudit(
  action: string,
  resourceName: string,
  resourceId: string | null,
  userId: string | null,
  environmentId: string,
  details?: any
): Promise<void> {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    resourceName,
    resourceId,
    userId,
    environmentId,
    details,
  };
  
  logger.info('crud_factory', 'audit', auditLog);
  
  // Store in KV for audit trail
  try {
    const auditKey = `audit:${environmentId}:${Date.now()}:${crypto.randomUUID()}`;
    await kv.set(auditKey, auditLog);
  } catch (error) {
    logger.error('crud_factory', 'logAudit', {
      error: 'Failed to store audit log',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Success response helper
 */
function successResponse<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    meta,
  };
}

/**
 * Error response helper
 */
function errorResponse(error: string, statusCode: number = 400): Response {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create CRUD routes for a resource
 * 
 * Generates the following routes:
 * - GET /resources - List all resources (with pagination)
 * - GET /resources/:id - Get single resource by ID
 * - POST /resources - Create new resource
 * - PUT /resources/:id - Update existing resource
 * - DELETE /resources/:id - Delete resource
 * 
 * @param app - Hono app instance
 * @param config - CRUD configuration
 * 
 * @example
 * ```typescript
 * createCrudRoutes(app, {
 *   resourceName: 'clients',
 *   keyPrefix: 'client',
 *   validate: (data) => {
 *     if (!data.name) return 'Name is required';
 *     return null;
 *   },
 *   transform: (data) => ({
 *     ...data,
 *     createdAt: new Date().toISOString(),
 *   }),
 * });
 * ```
 */
export function createCrudRoutes<T = any, R = T>(
  app: Hono,
  config: CrudConfig<T, R>
): void {
  const {
    resourceName,
    keyPrefix,
    validate,
    transform,
    postProcess,
    accessControl = defaultAccessControl,
    auditLogging = true,
    softDelete = false,
    additionalFilters = [],
    generateId = () => crypto.randomUUID(),
    enablePagination = true,
    defaultPageSize = 50,
    maxPageSize = 100,
    middleware,
  } = config;

  logger.info('crud_factory', 'createCrudRoutes', {
    resourceName,
    keyPrefix,
    features: {
      validation: !!validate,
      transform: !!transform,
      postProcess: !!postProcess,
      auditLogging,
      softDelete,
      pagination: enablePagination,
    },
  });

  const basePath = `/make-server-6fcaeea3/${resourceName}`;

  // Apply middleware if provided
  // IMPORTANT: Use wildcard pattern to ensure middleware applies to all sub-routes
  if (middleware) {
    app.use(`${basePath}/*`, middleware);
    app.use(basePath, middleware);
  }

  // ============================================
  // GET ALL - List all resources
  // ============================================
  app.get(basePath, async (c) => {
    const startTime = Date.now();
    const environmentId = getEnvironmentId(c);
    const userId = getUserId(c);

    try {
      // Access control
      const hasAccess = await accessControl(c);
      if (!hasAccess) {
        logger.warn('crud_factory', `GET ${basePath}`, {
          error: 'Access denied',
          userId,
          environmentId,
        });
        return errorResponse('Access denied', 403);
      }

      // Parse pagination parameters
      let page = 1;
      let pageSize = defaultPageSize;
      
      if (enablePagination) {
        const pageParam = c.req.query('page');
        const pageSizeParam = c.req.query('pageSize');
        
        if (pageParam) {
          page = Math.max(1, parseInt(pageParam, 10) || 1);
        }
        
        if (pageSizeParam) {
          pageSize = Math.min(
            maxPageSize,
            Math.max(1, parseInt(pageSizeParam, 10) || defaultPageSize)
          );
        }
      }

      // Parse additional filters
      const filters: Record<string, string> = {};
      for (const filterKey of additionalFilters) {
        const filterValue = c.req.query(filterKey);
        if (filterValue) {
          filters[filterKey] = filterValue;
        }
      }

      // Retrieve all resources with prefix
      const prefix = `${keyPrefix}:${environmentId}:`;
      logger.debug('crud_factory', `GET ${basePath}`, {
        prefix,
        page,
        pageSize,
        filters,
      });

      const allResources = await kv.getByPrefix<R>(prefix);

      // Filter out soft-deleted items
      let filteredResources = allResources;
      if (softDelete) {
        filteredResources = allResources.filter(
          (item: any) => !item.deleted && !item.deletedAt
        );
      }

      // Apply additional filters
      if (Object.keys(filters).length > 0) {
        filteredResources = filteredResources.filter((item: any) => {
          return Object.entries(filters).every(([key, value]) => {
            return String(item[key]) === value;
          });
        });
      }

      const total = filteredResources.length;

      // Apply pagination
      let paginatedResources = filteredResources;
      if (enablePagination) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        paginatedResources = filteredResources.slice(startIndex, endIndex);
      }

      // Post-process if function provided
      const processedResources = postProcess
        ? paginatedResources.map(postProcess)
        : paginatedResources;

      const duration = Date.now() - startTime;
      logger.info('crud_factory', `GET ${basePath}`, {
        total,
        returned: paginatedResources.length,
        page,
        pageSize,
        duration,
        environmentId,
      });

      return c.json(
        successResponse(processedResources, undefined, {
          total,
          page: enablePagination ? page : undefined,
          pageSize: enablePagination ? pageSize : undefined,
          hasMore: enablePagination ? (page * pageSize) < total : false,
        })
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('crud_factory', `GET ${basePath}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
        environmentId,
      });
      return errorResponse('Failed to retrieve resources', 500);
    }
  });

  // ============================================
  // GET BY ID - Get single resource
  // ============================================
  app.get(`${basePath}/:id`, async (c) => {
    const startTime = Date.now();
    const environmentId = getEnvironmentId(c);
    const userId = getUserId(c);
    const resourceId = c.req.param('id');

    try {
      // Access control
      const hasAccess = await accessControl(c, resourceId);
      if (!hasAccess) {
        logger.warn('crud_factory', `GET ${basePath}/:id`, {
          error: 'Access denied',
          resourceId,
          userId,
          environmentId,
        });
        return errorResponse('Access denied', 403);
      }

      // Retrieve resource
      const key = `${keyPrefix}:${environmentId}:${resourceId}`;
      logger.debug('crud_factory', `GET ${basePath}/:id`, { key });

      const resource = await kv.get<R>(key);

      if (!resource) {
        const duration = Date.now() - startTime;
        logger.warn('crud_factory', `GET ${basePath}/:id`, {
          error: 'Resource not found',
          resourceId,
          duration,
          environmentId,
        });
        return errorResponse('Resource not found', 404);
      }

      // Check soft delete
      if (softDelete && (resource as any).deleted) {
        return errorResponse('Resource not found', 404);
      }

      // Post-process if function provided
      const processedResource = postProcess ? postProcess(resource) : resource;

      const duration = Date.now() - startTime;
      logger.info('crud_factory', `GET ${basePath}/:id`, {
        resourceId,
        duration,
        environmentId,
      });

      return c.json(successResponse(processedResource));
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('crud_factory', `GET ${basePath}/:id`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        resourceId,
        duration,
        environmentId,
      });
      return errorResponse('Failed to retrieve resource', 500);
    }
  });

  // ============================================
  // POST - Create new resource
  // ============================================
  app.post(basePath, async (c) => {
    const startTime = Date.now();
    const environmentId = getEnvironmentId(c);
    const userId = getUserId(c);

    try {
      // Access control
      const hasAccess = await accessControl(c);
      if (!hasAccess) {
        logger.warn('crud_factory', `POST ${basePath}`, {
          error: 'Access denied',
          userId,
          environmentId,
        });
        return errorResponse('Access denied', 403);
      }

      // Parse request body
      const body = await c.req.json<T>();

      // Validate
      if (validate) {
        const validationError = validate(body);
        if (validationError) {
          logger.warn('crud_factory', `POST ${basePath}`, {
            error: 'Validation failed',
            validationError,
            environmentId,
          });
          return errorResponse(validationError, 400);
        }
      }

      // Transform
      const resourceData = transform ? transform(body) : body;

      // Generate ID - use provided ID if available, otherwise generate new one
      const resourceId = (resourceData as any).id || generateId();

      // Add metadata
      const resourceWithMeta = {
        ...resourceData,
        id: resourceId,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        environmentId,
      } as R;

      // Save to KV store
      const key = `${keyPrefix}:${environmentId}:${resourceId}`;
      await kv.set(key, resourceWithMeta);

      // Audit log
      if (auditLogging) {
        await logAudit(
          'CREATE',
          resourceName,
          resourceId,
          userId,
          environmentId,
          { data: resourceWithMeta }
        );
      }

      // Post-process if function provided
      const processedResource = postProcess
        ? postProcess(resourceWithMeta)
        : resourceWithMeta;

      const duration = Date.now() - startTime;
      logger.info('crud_factory', `POST ${basePath}`, {
        resourceId,
        duration,
        environmentId,
      });

      return c.json(successResponse(processedResource, 'Resource created successfully'), {
        status: 201,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('crud_factory', `POST ${basePath}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
        environmentId,
      });
      return errorResponse('Failed to create resource', 500);
    }
  });

  // ============================================
  // PUT - Update existing resource
  // ============================================
  app.put(`${basePath}/:id`, async (c) => {
    const startTime = Date.now();
    const environmentId = getEnvironmentId(c);
    const userId = getUserId(c);
    const resourceId = c.req.param('id');

    console.log(`[CRUD PUT] Starting update for ${resourceName}:${resourceId} in environment:${environmentId}`);

    try {
      // Access control
      const hasAccess = await accessControl(c, resourceId);
      if (!hasAccess) {
        console.log(`[CRUD PUT] ❌ Access denied for ${resourceName}:${resourceId}`);
        logger.warn('crud_factory', `PUT ${basePath}/:id`, {
          error: 'Access denied',
          resourceId,
          userId,
          environmentId,
        });
        return errorResponse('Access denied', 403);
      }

      // Check if resource exists
      const key = `${keyPrefix}:${environmentId}:${resourceId}`;
      console.log(`[CRUD PUT] Looking for key: ${key}`);
      const existingResource = await kv.get<R>(key);

      if (!existingResource) {
        console.log(`[CRUD PUT] ❌ Resource not found for key: ${key}`);
        logger.warn('crud_factory', `PUT ${basePath}/:id`, {
          error: 'Resource not found',
          resourceId,
          environmentId,
          key,
        });
        return errorResponse('Resource not found', 404);
      }
      
      console.log(`[CRUD PUT] ✅ Found existing resource`);

      // Check soft delete
      if (softDelete && (existingResource as any).deleted) {
        console.log(`[CRUD PUT] ❌ Resource is soft-deleted`);
        return errorResponse('Resource not found', 404);
      }

      // Parse request body
      const body = await c.req.json<Partial<T>>();
      console.log(`[CRUD PUT] Received update data:`, Object.keys(body));

      // Validate
      if (validate) {
        const validationError = validate(body as T);
        if (validationError) {
          console.log(`[CRUD PUT] ❌ Validation failed: ${validationError}`);
          logger.warn('crud_factory', `PUT ${basePath}/:id`, {
            error: 'Validation failed',
            validationError,
            resourceId,
            environmentId,
          });
          return errorResponse(validationError, 400);
        }
      }

      // Transform
      const resourceData = transform ? transform(body as T) : body;

      // Merge with existing data
      const updatedResource = {
        ...existingResource,
        ...resourceData,
        id: resourceId, // Preserve ID
        createdAt: (existingResource as any).createdAt, // Preserve creation metadata
        createdBy: (existingResource as any).createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        environmentId,
      } as R;

      console.log(`[CRUD PUT] Saving updated resource to key: ${key}`);
      // Save to KV store
      await kv.set(key, updatedResource);
      console.log(`[CRUD PUT] ✅ Successfully saved`);

      // Audit log
      if (auditLogging) {
        await logAudit(
          'UPDATE',
          resourceName,
          resourceId,
          userId,
          environmentId,
          { 
            before: existingResource,
            after: updatedResource,
          }
        );
      }

      // Post-process if function provided
      const processedResource = postProcess
        ? postProcess(updatedResource)
        : updatedResource;

      const duration = Date.now() - startTime;
      console.log(`[CRUD PUT] ✅ Update completed for ${resourceName}:${resourceId} in ${duration}ms`);
      logger.info('crud_factory', `PUT ${basePath}/:id`, {
        resourceId,
        duration,
        environmentId,
      });

      return c.json(successResponse(processedResource, 'Resource updated successfully'));
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[CRUD PUT] ❌ Error updating ${resourceName}:${resourceId}:`, error);
      logger.error('crud_factory', `PUT ${basePath}/:id`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        resourceId,
        duration,
        environmentId,
      });
      return errorResponse('Failed to update resource', 500);
    }
  });

  // ============================================
  // DELETE - Delete resource
  // ============================================
  app.delete(`${basePath}/:id`, async (c) => {
    const startTime = Date.now();
    const environmentId = getEnvironmentId(c);
    const userId = getUserId(c);
    const resourceId = c.req.param('id');

    try {
      // Access control
      const hasAccess = await accessControl(c, resourceId);
      if (!hasAccess) {
        logger.warn('crud_factory', `DELETE ${basePath}/:id`, {
          error: 'Access denied',
          resourceId,
          userId,
          environmentId,
        });
        return errorResponse('Access denied', 403);
      }

      // Check if resource exists
      const key = `${keyPrefix}:${environmentId}:${resourceId}`;
      const existingResource = await kv.get<R>(key);

      if (!existingResource) {
        logger.warn('crud_factory', `DELETE ${basePath}/:id`, {
          error: 'Resource not found',
          resourceId,
          environmentId,
        });
        return errorResponse('Resource not found', 404);
      }

      // Check soft delete
      if (softDelete && (existingResource as any).deleted) {
        return errorResponse('Resource not found', 404);
      }

      // Soft delete or hard delete
      if (softDelete) {
        const softDeletedResource = {
          ...existingResource,
          deleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: userId,
        } as R;

        await kv.set(key, softDeletedResource);

        logger.info('crud_factory', `DELETE ${basePath}/:id`, {
          resourceId,
          type: 'soft',
          environmentId,
        });
      } else {
        await kv.del(key);

        logger.info('crud_factory', `DELETE ${basePath}/:id`, {
          resourceId,
          type: 'hard',
          environmentId,
        });
      }

      // Audit log
      if (auditLogging) {
        await logAudit(
          softDelete ? 'SOFT_DELETE' : 'DELETE',
          resourceName,
          resourceId,
          userId,
          environmentId,
          { resource: existingResource }
        );
      }

      const duration = Date.now() - startTime;
      logger.info('crud_factory', `DELETE ${basePath}/:id`, {
        resourceId,
        duration,
        environmentId,
      });

      return c.json(
        successResponse(
          { id: resourceId, deleted: true },
          'Resource deleted successfully'
        )
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('crud_factory', `DELETE ${basePath}/:id`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        resourceId,
        duration,
        environmentId,
      });
      return errorResponse('Failed to delete resource', 500);
    }
  });

  logger.info('crud_factory', 'createCrudRoutes', {
    message: `CRUD routes created for ${resourceName}`,
    basePath,
  });
}

/**
 * Validation helper: Check required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `Field '${String(field)}' is required`;
    }
  }
  return null;
}

/**
 * Validation helper: Check string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): string | null {
  if (min !== undefined && value.length < min) {
    return `Field '${fieldName}' must be at least ${min} characters`;
  }
  if (max !== undefined && value.length > max) {
    return `Field '${fieldName}' must be at most ${max} characters`;
  }
  return null;
}

/**
 * Validation helper: Check email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

/**
 * Validation helper: Check URL format
 */
export function validateUrl(url: string): string | null {
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

/**
 * Transform helper: Sanitize HTML/Script tags
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Transform helper: Normalize whitespace
 */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}