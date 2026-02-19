/**
 * Proxy Login API Service
 * Handles proxy session creation, validation, and termination
 */

import { supabase } from '../lib/supabase';
import { ProxySession, ProxySessionRequest } from '../../types/advancedAuth';
import { logProxyLoginStart, logProxyLoginEnd } from './auditLogService';
import { hasPermission } from './permissionService';

/**
 * Create a new proxy session
 * Allows an admin to login as an employee for support purposes
 * Requires 'proxy_login' permission
 */
export async function createProxySession(
  request: ProxySessionRequest
): Promise<ProxySession> {
  // Check if user has proxy_login permission
  const hasProxyPermission = await hasPermission('proxy_login');
  
  if (!hasProxyPermission) {
    throw new Error('Insufficient permissions: proxy_login permission required');
  }
  
  const durationMinutes = request.durationMinutes || 30;
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const { data, error } = await supabase
    .from('proxy_sessions')
    .insert({
      admin_id: request.adminId,
      employee_id: request.employeeId,
      site_id: request.siteId,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create proxy session:', error);
    throw new Error('Failed to create proxy session');
  }

  // Log audit event
  await logProxyLoginStart(
    request.adminId,
    request.employeeId,
    request.siteId,
    data.id
  );

  return {
    id: data.id,
    adminId: data.admin_id,
    employeeId: data.employee_id,
    siteId: data.site_id,
    token: data.token,
    expiresAt: new Date(data.expires_at),
    createdAt: new Date(data.created_at),
  };
}

/**
 * Get current proxy session by token
 */
export async function getProxySession(token: string): Promise<ProxySession | null> {
  const { data, error } = await supabase
    .from('proxy_sessions')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    adminId: data.admin_id,
    employeeId: data.employee_id,
    siteId: data.site_id,
    token: data.token,
    expiresAt: new Date(data.expires_at),
    createdAt: new Date(data.created_at),
  };
}

/**
 * End a proxy session
 */
export async function endProxySession(sessionId: string): Promise<void> {
  // Get session details for audit logging
  const { data: session } = await supabase
    .from('proxy_sessions')
    .select('admin_id, employee_id, site_id, created_at')
    .eq('id', sessionId)
    .single();

  const { error } = await supabase
    .from('proxy_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to end proxy session:', error);
    throw new Error('Failed to end proxy session');
  }

  // Log audit event
  if (session) {
    const duration = Math.floor((Date.now() - new Date(session.created_at).getTime()) / 1000);
    await logProxyLoginEnd(
      session.admin_id,
      session.employee_id,
      session.site_id,
      sessionId,
      duration
    );
  }
}

/**
 * Get active proxy session for current user
 */
export async function getCurrentProxySession(): Promise<ProxySession | null> {
  // Get token from localStorage or sessionStorage
  const token = localStorage.getItem('proxy_session_token');
  
  if (!token) {
    return null;
  }

  return getProxySession(token);
}

/**
 * Validate if a proxy session is still active
 */
export async function validateProxySession(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('proxy_sessions')
    .select('id, expires_at, is_active')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    return false;
  }

  const isExpired = new Date(data.expires_at) < new Date();
  return data.is_active && !isExpired;
}
