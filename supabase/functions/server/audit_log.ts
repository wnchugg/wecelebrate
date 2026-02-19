/**
 * Audit Logging Utility
 * Centralized logging for security-sensitive actions
 */

import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
