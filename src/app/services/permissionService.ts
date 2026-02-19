/**
 * Permission Service
 * Handles permission checks and management for ADMIN USERS
 * 
 * IMPORTANT: This service is for admin_users (platform admins) only.
 * Site users (site_users table) have their own permission/role system.
 */

import { supabase } from '../lib/supabase';
import { logPermissionGrant, logPermissionRevoke } from './auditLogService';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'user_management' | 'proxy_login' | 'admin_bypass' | 'site_management' | 'client_management';
  createdAt: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  permission: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface UserPermissionDetail {
  permission: string;
  description: string;
  category: string;
  grantedAt: string;
  expiresAt?: string;
}

/**
 * Check if the current user (admin) has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase.rpc('admin_user_has_permission', {
      p_admin_user_id: user.id,
      p_permission: permission,
    });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a specific admin user has a permission
 */
export async function userHasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_user_has_permission', {
      p_admin_user_id: userId,
      p_permission: permission,
    });
    
    if (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get all available permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from('admin_permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
    
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      createdAt: p.created_at,
    }));
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

/**
 * Get all permissions for a specific admin user
 */
export async function getUserPermissions(userId: string): Promise<UserPermissionDetail[]> {
  try {
    const { data, error } = await supabase.rpc('get_admin_user_permissions', {
      p_admin_user_id: userId,
    });
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
    
    return (data || []).map((p: any) => ({
      permission: p.permission,
      description: p.description,
      category: p.category,
      grantedAt: p.granted_at,
      expiresAt: p.expires_at,
    }));
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Grant a permission to an admin user
 */
export async function grantPermission(
  userId: string,
  permission: string,
  expiresAt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const { data, error } = await supabase.rpc('grant_admin_permission', {
      p_admin_user_id: userId,
      p_permission: permission,
      p_granted_by: user.id,
      p_expires_at: expiresAt || null,
    });
    
    if (error) {
      console.error('Error granting permission:', error);
      return { success: false, error: error.message };
    }
    
    // Log audit event
    await logPermissionGrant(user.id, userId, permission, expiresAt);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error granting permission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke a permission from an admin user
 */
export async function revokePermission(
  userId: string,
  permission: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const { data, error } = await supabase.rpc('revoke_admin_permission', {
      p_admin_user_id: userId,
      p_permission: permission,
    });
    
    if (error) {
      console.error('Error revoking permission:', error);
      return { success: false, error: error.message };
    }
    
    // Log audit event
    await logPermissionRevoke(user.id, userId, permission);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error revoking permission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check multiple permissions at once
 */
export async function hasAnyPermission(permissions: string[]): Promise<boolean> {
  try {
    const results = await Promise.all(
      permissions.map(permission => hasPermission(permission))
    );
    
    return results.some(result => result === true);
  } catch (error) {
    console.error('Error checking multiple permissions:', error);
    return false;
  }
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(permissions: string[]): Promise<boolean> {
  try {
    const results = await Promise.all(
      permissions.map(permission => hasPermission(permission))
    );
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error checking multiple permissions:', error);
    return false;
  }
}

/**
 * Clean up expired permissions (admin function)
 */
export async function cleanupExpiredPermissions(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_admin_permissions');
    
    if (error) {
      console.error('Error cleaning up expired permissions:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, deletedCount: data };
  } catch (error: any) {
    console.error('Error cleaning up expired permissions:', error);
    return { success: false, error: error.message };
  }
}
