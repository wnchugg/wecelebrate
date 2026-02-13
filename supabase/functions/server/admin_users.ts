/**
 * Admin User Management Module
 * Handles CRUD operations for admin users with role-based access control
 */

import * as kv from "./kv_env.ts";
import { sanitize, validate } from "./security.ts";
import type { Context } from "npm:hono@4.0.2";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'site_manager' | 'content_editor' | 'viewer';
  status: 'active' | 'inactive';
  clientAccess: 'all' | string[]; // 'all' or array of client IDs
  siteAccess: 'all' | string[]; // 'all' or array of site IDs
  requirePasswordChange: boolean; // Force password change on next login
  lastLogin?: string;
  lastPasswordChange?: string;
  createdAt: string;
  createdBy: string;
  supabaseUserId?: string; // Link to Supabase Auth user
}

/**
 * Get all admin users
 */
export async function getAllAdminUsers(environmentId: string): Promise<AdminUser[]> {
  try {
    const users = await kv.getByPrefix('admin_users:', environmentId);
    console.log(`[Admin Users] Found ${users?.length || 0} admin users in ${environmentId} environment`);
    return (users || []) as AdminUser[];
  } catch (error) {
    console.error('[Admin Users] Error fetching admin users:', error);
    // Return empty array instead of throwing to allow UI to render
    return [];
  }
}

/**
 * Get a single admin user by ID
 */
export async function getAdminUserById(userId: string, environmentId: string): Promise<AdminUser | null> {
  try {
    const user = await kv.get(`admin_users:${userId}`, environmentId);
    return user as AdminUser | null;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    throw new Error('Failed to fetch admin user');
  }
}

/**
 * Get admin user by email
 */
export async function getAdminUserByEmail(email: string, environmentId: string): Promise<AdminUser | null> {
  try {
    const allUsers = await getAllAdminUsers(environmentId);
    return allUsers.find(user => user.email === email) || null;
  } catch (error) {
    console.error('Error fetching admin user by email:', error);
    throw new Error('Failed to fetch admin user');
  }
}

/**
 * Create a new admin user
 */
export async function createAdminUser(
  userData: {
    username: string;
    email: string;
    password: string;
    role: AdminUser['role'];
    status: AdminUser['status'];
    clientAccess: AdminUser['clientAccess'];
    siteAccess: AdminUser['siteAccess'];
    requirePasswordChange: boolean;
  },
  createdBy: string,
  environmentId: string,
  supabase: any
): Promise<AdminUser> {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitize.email(userData.email);
    const sanitizedUsername = sanitize.string(userData.username);

    // Validate password strength
    const passwordValidation = validate.password(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(`Password does not meet security requirements: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await getAdminUserByEmail(sanitizedEmail, environmentId);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: sanitizedEmail,
      password: userData.password,
      user_metadata: { 
        username: sanitizedUsername, 
        role: userData.role,
        isAdminUser: true
      },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Supabase Auth error creating admin user:', error);
      throw new Error(`Failed to create user in auth system: ${error.message}`);
    }

    // Create admin user record
    const userId = data.user.id;
    const adminUser: AdminUser = {
      id: userId,
      username: sanitizedUsername,
      email: sanitizedEmail,
      role: userData.role,
      status: userData.status,
      clientAccess: userData.clientAccess,
      siteAccess: userData.siteAccess,
      requirePasswordChange: userData.requirePasswordChange,
      lastPasswordChange: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy,
      supabaseUserId: userId,
    };

    // Store in KV store
    await kv.set(`admin_users:${userId}`, adminUser, environmentId);

    console.log(`✅ Admin user created: ${sanitizedEmail} (${userData.role})`);

    return adminUser;
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Update an existing admin user
 */
export async function updateAdminUser(
  userId: string,
  updates: {
    username?: string;
    email?: string;
    role?: AdminUser['role'];
    status?: AdminUser['status'];
    clientAccess?: AdminUser['clientAccess'];
    siteAccess?: AdminUser['siteAccess'];
    requirePasswordChange?: boolean;
  },
  environmentId: string,
  supabase: any
): Promise<AdminUser> {
  try {
    // Get existing user
    const existingUser = await getAdminUserById(userId, environmentId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Sanitize inputs if provided
    const sanitizedUpdates: any = {};
    if (updates.username) {
      sanitizedUpdates.username = sanitize.string(updates.username);
    }
    if (updates.email) {
      sanitizedUpdates.email = sanitize.email(updates.email);
      
      // Check if new email already exists
      const userWithEmail = await getAdminUserByEmail(sanitizedUpdates.email, environmentId);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error('Another user with this email already exists');
      }
    }
    if (updates.role) {
      sanitizedUpdates.role = updates.role;
    }
    if (updates.status) {
      sanitizedUpdates.status = updates.status;
    }
    if (updates.clientAccess !== undefined) {
      sanitizedUpdates.clientAccess = updates.clientAccess;
    }
    if (updates.siteAccess) {
      sanitizedUpdates.siteAccess = updates.siteAccess;
    }
    if (updates.requirePasswordChange !== undefined) {
      sanitizedUpdates.requirePasswordChange = updates.requirePasswordChange;
    }

    // Update user metadata in Supabase Auth if email or username changed
    if (sanitizedUpdates.email || sanitizedUpdates.username || sanitizedUpdates.role) {
      const authUpdates: any = {};
      
      if (sanitizedUpdates.email) {
        authUpdates.email = sanitizedUpdates.email;
      }
      
      // Always update user_metadata with latest values
      authUpdates.user_metadata = {
        username: sanitizedUpdates.username || existingUser.username,
        role: sanitizedUpdates.role || existingUser.role,
        isAdminUser: true
      };

      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        authUpdates
      );

      if (error) {
        console.error('Supabase Auth error updating admin user:', error);
        throw new Error(`Failed to update user in auth system: ${error.message}`);
      }
    }

    // Merge updates with existing user
    const updatedUser: AdminUser = {
      ...existingUser,
      ...sanitizedUpdates,
    };

    // Store updated user
    await kv.set(`admin_users:${userId}`, updatedUser, environmentId);

    console.log(`✅ Admin user updated: ${updatedUser.email}`);

    return updatedUser;
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    throw error;
  }
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(
  userId: string,
  environmentId: string,
  supabase: any
): Promise<void> {
  try {
    // Get existing user
    const existingUser = await getAdminUserById(userId, environmentId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Don't allow deleting the last super_admin
    const allUsers = await getAllAdminUsers(environmentId);
    const superAdmins = allUsers.filter(u => u.role === 'super_admin' && u.status === 'active');
    if (superAdmins.length === 1 && existingUser.role === 'super_admin' && existingUser.status === 'active') {
      throw new Error('Cannot delete the last active super admin');
    }

    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Supabase Auth error deleting admin user:', error);
      // Continue with deletion even if auth fails (user might already be deleted)
    }

    // Delete from KV store
    await kv.del(`admin_users:${userId}`, environmentId);

    console.log(`✅ Admin user deleted: ${existingUser.email}`);
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
}

/**
 * Reset admin user password
 */
export async function resetAdminUserPassword(
  userId: string,
  newPassword: string,
  environmentId: string,
  supabase: any,
  requireChangeOnNextLogin: boolean = false
): Promise<void> {
  try {
    // Get existing user
    const existingUser = await getAdminUserById(userId, environmentId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate password strength
    const passwordValidation = validate.password(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password does not meet security requirements: ${passwordValidation.errors.join(', ')}`);
    }

    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.error('Supabase Auth error resetting password:', error);
      throw new Error(`Failed to reset password: ${error.message}`);
    }

    // Update password change metadata in KV store
    existingUser.lastPasswordChange = new Date().toISOString();
    existingUser.requirePasswordChange = requireChangeOnNextLogin;
    await kv.set(`admin_users:${userId}`, existingUser, environmentId);

    console.log(`✅ Password reset for admin user: ${existingUser.email}`);
  } catch (error: any) {
    console.error('Error resetting admin user password:', error);
    throw error;
  }
}

/**
 * Mark user as requiring password change on next login
 */
export async function requirePasswordChangeOnNextLogin(userId: string, environmentId: string): Promise<void> {
  try {
    const user = await getAdminUserById(userId, environmentId);
    if (user) {
      user.requirePasswordChange = true;
      await kv.set(`admin_users:${userId}`, user, environmentId);
      console.log(`✅ Password change required for: ${user.email}`);
    }
  } catch (error) {
    console.error('Error setting password change requirement:', error);
    throw error;
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string, environmentId: string): Promise<void> {
  try {
    const user = await getAdminUserById(userId, environmentId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      await kv.set(`admin_users:${userId}`, user, environmentId);
    }
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: AdminUser['role'], requiredRole: AdminUser['role']): boolean {
  const roleHierarchy: AdminUser['role'][] = ['viewer', 'content_editor', 'site_manager', 'super_admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if user has access to a specific site
 */
export function hasSiteAccess(user: AdminUser, siteId: string): boolean {
  if (user.siteAccess === 'all') {
    return true;
  }
  return user.siteAccess.includes(siteId);
}

/**
 * Check if user has access to a specific client
 */
export function hasClientAccess(user: AdminUser, clientId: string): boolean {
  if (user.clientAccess === 'all') {
    return true;
  }
  return user.clientAccess.includes(clientId);
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(email: string, environmentId: string): Promise<string | null> {
  try {
    // Find user by email
    const allUsers = await getAllAdminUsers(environmentId);
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // For security, don't reveal if email exists
      console.log('[Password Reset] User not found for email:', email);
      return null;
    }

    // Generate token (random string + timestamp)
    const token = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store token with 1 hour expiration
    const resetData = {
      userId: user.id,
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      createdAt: new Date().toISOString(),
      used: false
    };
    
    await kv.set(`password_reset:${token}`, resetData, environmentId);
    
    console.log('[Password Reset] Token generated for user:', user.id);
    return token;
  } catch (error) {
    console.error('[Password Reset] Error generating token:', error);
    return null;
  }
}

/**
 * Validate password reset token
 */
export async function validateResetToken(token: string, environmentId: string): Promise<boolean> {
  try {
    const resetData = await kv.get(`password_reset:${token}`, environmentId);
    
    if (!resetData) {
      return false;
    }

    // Check if token is expired
    if (new Date(resetData.expiresAt) < new Date()) {
      return false;
    }

    // Check if token was already used
    if (resetData.used) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Password Reset] Error validating token:', error);
    return false;
  }
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  environmentId: string,
  supabaseClient: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get reset data
    const resetData = await kv.get(`password_reset:${token}`, environmentId);
    
    if (!resetData) {
      return { success: false, error: 'Invalid reset token' };
    }

    // Check if token is expired
    if (new Date(resetData.expiresAt) < new Date()) {
      return { success: false, error: 'Reset token has expired' };
    }

    // Check if token was already used
    if (resetData.used) {
      return { success: false, error: 'Reset token has already been used' };
    }

    // Get user
    const user = await getAdminUserById(resetData.userId, environmentId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Update password in Supabase Auth if user has supabaseUserId
    if (user.supabaseUserId && supabaseClient) {
      const { error: supabaseError } = await supabaseClient.auth.admin.updateUserById(
        user.supabaseUserId,
        { password: newPassword }
      );

      if (supabaseError) {
        console.error('[Password Reset] Supabase password update error:', supabaseError);
        return { success: false, error: 'Failed to update password' };
      }
    }

    // Update user record
    user.lastPasswordChange = new Date().toISOString();
    user.requirePasswordChange = false;
    await kv.set(`admin_users:${user.id}`, user, environmentId);

    // Mark token as used
    resetData.used = true;
    resetData.usedAt = new Date().toISOString();
    await kv.set(`password_reset:${token}`, resetData, environmentId);

    console.log('[Password Reset] Password successfully reset for user:', user.id);
    return { success: true };
  } catch (error) {
    console.error('[Password Reset] Error resetting password:', error);
    return { success: false, error: 'An error occurred while resetting password' };
  }
}