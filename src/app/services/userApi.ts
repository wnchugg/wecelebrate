import { supabase } from '../lib/supabase';
import { AdvancedAuthUser, EditUserRequest, SetPasswordRequest } from '../../types/advancedAuth';
import { hasPermission } from './permissionService';
import { logUserEdit, logUserPasswordSet, logUserCreation, logUserDeletion } from './auditLogService';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

/**
 * Get all users for a site
 * No permission check needed - viewing users is allowed for admins
 */
export async function getUsers(siteId: string): Promise<AdvancedAuthUser[]> {
  const { data, error } = await supabase
    .from('site_users')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

   
  return data.map(user => ({
    id: user.id as string,
    email: user.email as string,
    firstName: user.first_name as string,
    lastName: user.last_name as string,
    employeeId: user.employee_id as string | undefined,
    role: user.role as AdvancedAuthUser['role'],
    status: user.status as AdvancedAuthUser['status'],
    forcePasswordReset: (user.force_password_reset as boolean) || false,
    lastLogin: user.last_login ? new Date(user.last_login as string) : undefined,
    createdAt: new Date(user.created_at as string),
    updatedAt: new Date(user.updated_at as string),
    metadata: user.metadata as Record<string, unknown> | undefined,
  }));
}

/**
 * Update user information
 * Requires 'user_edit' or 'user_management' permission
 */
export async function updateUser(request: EditUserRequest): Promise<void> {
  // Check permissions
  const hasEditPermission = await hasPermission('user_edit');
  const hasManagementPermission = await hasPermission('user_management');
  
  if (!hasEditPermission && !hasManagementPermission) {
    throw new Error('Insufficient permissions: user_edit or user_management permission required');
  }
  
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (request.firstName !== undefined) updates.first_name = request.firstName;
  if (request.lastName !== undefined) updates.last_name = request.lastName;
  if (request.email !== undefined) updates.email = request.email;
  if (request.employeeId !== undefined) updates.employee_id = request.employeeId;
  if (request.role !== undefined) updates.role = request.role;
  if (request.status !== undefined) updates.status = request.status;

  const { error } = await supabase
    .from('site_users')
    .update(updates)
    .eq('id', request.userId);

  if (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }

  // Log audit event
  const { data: { user } } = await supabase.auth.getUser();
  if (user && request.siteId) {
    await logUserEdit(
      user.id,
      request.userId,
      request.siteId,
      updates
    );
  }
}

/**
 * Set temporary password for a user
 * Requires 'user_password_set' or 'user_management' permission
 */
export async function setUserPassword(request: SetPasswordRequest): Promise<void> {
  // Check permissions
  const hasPasswordPermission = await hasPermission('user_password_set');
  const hasManagementPermission = await hasPermission('user_management');
  
  if (!hasPasswordPermission && !hasManagementPermission) {
    throw new Error('Insufficient permissions: user_password_set or user_management permission required');
  }
  
  // Call backend API to set password (includes hashing and validation)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  // Get Supabase URL from environment
  const env = getCurrentEnvironment();
  const apiUrl = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3`;
  
  const response = await fetch(`${apiUrl}/password-management/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      userId: request.userId,
      siteId: request.siteId,
      temporaryPassword: request.temporaryPassword,
      forcePasswordReset: request.forcePasswordReset,
      sendEmail: request.sendEmail,
      expiresInHours: 48, // Default 48 hours
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set password');
  }
  
  // Audit logging is handled by the backend
}

/**
 * Create a new user
 * Requires 'user_management' permission
 */
export async function createUser(
  siteId: string,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    role: string;
    status: string;
  }
): Promise<AdvancedAuthUser> {
  // Check permissions
  const hasManagementPermission = await hasPermission('user_management');
  
  if (!hasManagementPermission) {
    throw new Error('Insufficient permissions: user_management permission required');
  }
  
  const { data, error } = await supabase
    .from('site_users')
    .insert({
      site_id: siteId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      employee_id: userData.employeeId,
      role: userData.role,
      status: userData.status,
      force_password_reset: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }

  // Log audit event
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logUserCreation(
      user.id,
      data.id as string,
      siteId,
      {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: userData.status,
      }
    );
  }

  return {
    id: data.id as string,
    email: data.email as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    employeeId: data.employee_id as string | undefined,
    role: data.role as AdvancedAuthUser['role'],
    status: data.status as AdvancedAuthUser['status'],
    forcePasswordReset: data.force_password_reset as boolean,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
    metadata: data.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * Delete (deactivate) a user
 * Requires 'user_delete' or 'user_management' permission
 */
export async function deleteUser(userId: string): Promise<void> {
  // Check permissions
  const hasDeletePermission = await hasPermission('user_delete');
  const hasManagementPermission = await hasPermission('user_management');
  
  if (!hasDeletePermission && !hasManagementPermission) {
    throw new Error('Insufficient permissions: user_delete or user_management permission required');
  }
  
  const { error } = await supabase
    .from('site_users')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }

  // Log audit event
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Get site_id from the user being deleted
    const { data: deletedUser } = await supabase
      .from('site_users')
      .select('site_id')
      .eq('id', userId)
      .single();
    
    if (deletedUser) {
      await logUserDeletion(
        user.id,
        userId,
        deletedUser.site_id as string
      );
    }
  }
}
