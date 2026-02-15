/**
 * Multi-Tenant Isolation Middleware
 * 
 * Enforces tenant-level data isolation
 * Automatically filters queries by tenant context
 */

import { Context, Next } from 'npm:hono';
import { AuthUser } from './auth.ts';

export interface TenantContext {
  client_id?: string;
  site_id?: string;
  enforce_isolation: boolean;
}

/**
 * Tenant isolation middleware
 * Ensures all queries are scoped to user's tenant
 */
export async function tenantIsolationMiddleware(c: Context, next: Next) {
  const user = c.get('user') as AuthUser;
  
  if (!user) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required for tenant isolation',
    }, 401);
  }
  
  // Set tenant context
  const tenantContext: TenantContext = {
    client_id: user.client_id,
    site_id: user.site_id,
    enforce_isolation: true,
  };
  
  c.set('tenantContext', tenantContext);
  
  // Log tenant access for audit
  console.log('[Tenant] Access:', {
    user_id: user.id,
    user_email: user.email,
    client_id: user.client_id,
    site_id: user.site_id,
    path: c.req.path,
    method: c.req.method,
  });
  
  await next();
}

/**
 * Validate tenant access
 * Ensures user has access to requested tenant resources
 */
export function validateTenantAccess(
  userContext: TenantContext,
  resourceClientId?: string,
  resourceSiteId?: string
): boolean {
  // Super admin can access all tenants
  if (!userContext.enforce_isolation) {
    return true;
  }
  
  // Check client-level access
  if (resourceClientId && userContext.client_id !== resourceClientId) {
    return false;
  }
  
  // Check site-level access
  if (resourceSiteId && userContext.site_id !== resourceSiteId) {
    return false;
  }
  
  return true;
}

/**
 * Apply tenant filters to query parameters
 */
export function applyTenantFilters(
  c: Context,
  filters: Record<string, any>
): Record<string, any> {
  const tenantContext = c.get('tenantContext') as TenantContext;
  
  if (!tenantContext || !tenantContext.enforce_isolation) {
    return filters;
  }
  
  const tenantFilters = { ...filters };
  
  // Add client_id filter if user has client context
  if (tenantContext.client_id) {
    tenantFilters.client_id = tenantContext.client_id;
  }
  
  // Add site_id filter if user has site context
  if (tenantContext.site_id) {
    tenantFilters.site_id = tenantContext.site_id;
  }
  
  return tenantFilters;
}

/**
 * Middleware to enforce client-level isolation
 */
export async function requireClientAccess(c: Context, next: Next) {
  const user = c.get('user') as AuthUser;
  const tenantContext = c.get('tenantContext') as TenantContext;
  
  if (!user || !tenantContext) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    }, 401);
  }
  
  if (!tenantContext.client_id) {
    return c.json({
      success: false,
      error: 'Forbidden',
      message: 'Client access required',
    }, 403);
  }
  
  await next();
}

/**
 * Middleware to enforce site-level isolation
 */
export async function requireSiteAccess(c: Context, next: Next) {
  const user = c.get('user') as AuthUser;
  const tenantContext = c.get('tenantContext') as TenantContext;
  
  if (!user || !tenantContext) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    }, 401);
  }
  
  if (!tenantContext.site_id) {
    return c.json({
      success: false,
      error: 'Forbidden',
      message: 'Site access required',
    }, 403);
  }
  
  await next();
}

/**
 * Audit log for tenant access
 */
export function logTenantAccess(
  c: Context,
  action: string,
  resourceType: string,
  resourceId: string,
  success: boolean
) {
  const user = c.get('user') as AuthUser;
  const tenantContext = c.get('tenantContext') as TenantContext;
  
  console.log('[Tenant Audit]', {
    timestamp: new Date().toISOString(),
    user_id: user?.id,
    user_email: user?.email,
    client_id: tenantContext?.client_id,
    site_id: tenantContext?.site_id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    success,
    ip_address: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    user_agent: c.req.header('user-agent'),
  });
}
