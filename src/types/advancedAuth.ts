/**
 * Advanced Authentication Types
 * Types for user management in sites with Advanced Authentication (SSO)
 */

export interface AdvancedAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  role: UserRole;
  status: UserStatus;
  forcePasswordReset: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface SetPasswordRequest {
  userId: string;
  temporaryPassword: string;
  forcePasswordReset: boolean;
  sendEmail?: boolean;
}

export interface EditUserRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeId?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface ProxySessionRequest {
  adminId: string;
  employeeId: string;
  siteId: string;
  durationMinutes?: number;
}

export interface ProxySession {
  id: string;
  adminId: string;
  employeeId: string;
  siteId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
