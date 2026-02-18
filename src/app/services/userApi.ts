import { supabase } from '../lib/supabase';
import { AdvancedAuthUser, EditUserRequest, SetPasswordRequest } from '../types/advancedAuth';

/**
 * Get all users for a site
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
 */
export async function updateUser(request: EditUserRequest): Promise<void> {
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
}

/**
 * Set temporary password for a user
 */
export async function setUserPassword(request: SetPasswordRequest): Promise<void> {
  // In a real implementation, this would:
  // 1. Hash the password
  // 2. Store it in the database
  // 3. Send an email to the user
  // 4. Set force_password_reset flag if requested
  
  const updates: Record<string, unknown> = {
    force_password_reset: request.forcePasswordReset,
    updated_at: new Date().toISOString(),
  };

  // Note: In production, password hashing should be done server-side
  // This is a placeholder for the client-side API call
  const { error } = await supabase
    .from('site_users')
    .update(updates)
    .eq('id', request.userId);

  if (error) {
    console.error('Error setting password:', error);
    throw new Error('Failed to set password');
  }

  // Send email notification (would be handled by backend)
  if (request.sendEmail) {
    // Call backend endpoint to send password email
    console.log('Sending password email to user:', request.userId);
  }
}

/**
 * Create a new user
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
 */
export async function deleteUser(userId: string): Promise<void> {
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
}
