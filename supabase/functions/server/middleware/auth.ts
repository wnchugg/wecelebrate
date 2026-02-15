/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and extracts user context
 * Implements role-based access control (RBAC)
 */

import { Context, Next } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  client_id?: string;
  site_id?: string;
  permissions: string[];
}

/**
 * Extract and verify JWT token from Authorization header
 */
async function verifyToken(authHeader: string): Promise<AuthUser | null> {
  try {
    // Extract token from "Bearer <token>" format
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('[Auth] Token verification failed:', error?.message);
      return null;
    }
    
    // Extract user metadata
    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};
    
    return {
      id: user.id,
      email: user.email || '',
      role: appMetadata.role || 'user',
      client_id: metadata.client_id,
      site_id: metadata.site_id,
      permissions: appMetadata.permissions || [],
    };
  } catch (error) {
    console.error('[Auth] Token verification error:', error);
    return null;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header is required',
    }, 401);
  }
  
  const user = await verifyToken(authHeader);
  
  if (!user) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    }, 401);
  }
  
  // Add user to context
  c.set('user', user);
  
  // Add tenant context
  c.set('tenantContext', {
    client_id: user.client_id,
    site_id: user.site_id,
  });
  
  await next();
}

/**
 * Optional authentication middleware
 * Adds user to context if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader) {
    const user = await verifyToken(authHeader);
    if (user) {
      c.set('user', user);
      c.set('tenantContext', {
        client_id: user.client_id,
        site_id: user.site_id,
      });
    }
  }
  
  await next();
}

/**
 * Role-based access control middleware
 * Requires user to have specific role
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser;
    
    if (!user) {
      return c.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      }, 401);
    }
    
    if (!allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      }, 403);
    }
    
    await next();
  };
}

/**
 * Permission-based access control middleware
 * Requires user to have specific permission
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser;
    
    if (!user) {
      return c.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      }, 401);
    }
    
    const hasPermission = requiredPermissions.some(permission =>
      user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return c.json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      }, 403);
    }
    
    await next();
  };
}

/**
 * API key authentication middleware
 * For service-to-service communication
 */
export async function apiKeyMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header('X-API-Key');
  
  if (!apiKey) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'API key is required',
    }, 401);
  }
  
  // Verify API key against environment variable or database
  const validApiKey = Deno.env.get('API_KEY');
  
  if (apiKey !== validApiKey) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid API key',
    }, 401);
  }
  
  // Add service context
  c.set('isServiceAccount', true);
  
  await next();
}

/**
 * Get authenticated user from context
 */
export function getAuthUser(c: Context): AuthUser | null {
  return c.get('user') || null;
}

/**
 * Get tenant context from context
 */
export function getTenantContext(c: Context): { client_id?: string; site_id?: string } {
  return c.get('tenantContext') || {};
}

/**
 * Check if user has permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

/**
 * Check if user has role
 */
export function hasRole(user: AuthUser, role: string): boolean {
  return user.role === role || user.role === 'super_admin';
}
