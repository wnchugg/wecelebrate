import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * Audit Log Event Types
 */
export type AuditEventType = 
  | 'bypass_login_success'
  | 'bypass_login_failure'
  | 'bypass_login_2fa_required'
  | 'bypass_session_ended'
  | 'user_password_set'
  | 'user_edited'
  | 'user_created'
  | 'user_deleted'
  | 'user_status_changed'
  | 'proxy_login_started'
  | 'proxy_login_ended'
  | 'proxy_action'
  | 'permission_granted'
  | 'permission_revoked';

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  siteId?: string;
  targetUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Create Audit Log Entry
 * 
 * Creates an audit log entry for security-sensitive actions
 * 
 * @param entry - Audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    logger.info('[auditLogService] Creating audit log', { 
      eventType: entry.eventType,
      userId: entry.userId,
      siteId: entry.siteId
    });

    // Get client IP and user agent
    const ipAddress = entry.ipAddress || await getClientIP();
    const userAgent = entry.userAgent || navigator.userAgent;

    // Insert audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: entry.eventType,
        user_id: entry.userId,
        site_id: entry.siteId,
        target_user_id: entry.targetUserId,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: entry.details || {},
        severity: entry.severity || 'medium',
        created_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('[auditLogService] Error creating audit log:', error);
      // Don't throw - audit logging should not break the main flow
    } else {
      logger.info('[auditLogService] Audit log created successfully');
    }
  } catch (err) {
    logger.error('[auditLogService] Exception creating audit log:', err);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Log Bypass Login Attempt
 * 
 * @param siteId - Site ID
 * @param email - User email
 * @param success - Whether login was successful
 * @param requires2FA - Whether 2FA was required
 * @param failureReason - Reason for failure (if applicable)
 */
export async function logBypassLoginAttempt(
  siteId: string,
  email: string,
  success: boolean,
  requires2FA: boolean = false,
  failureReason?: string
): Promise<void> {
  const eventType: AuditEventType = success 
    ? 'bypass_login_success' 
    : requires2FA 
      ? 'bypass_login_2fa_required'
      : 'bypass_login_failure';

  await createAuditLog({
    eventType,
    siteId,
    details: {
      email,
      success,
      requires2FA,
      failureReason,
      timestamp: new Date().toISOString(),
    },
    severity: success ? 'medium' : 'high',
  });
}

/**
 * Log Bypass Session End
 * 
 * @param siteId - Site ID
 * @param userId - User ID
 */
export async function logBypassSessionEnd(
  siteId: string,
  userId: string
): Promise<void> {
  await createAuditLog({
    eventType: 'bypass_session_ended',
    userId,
    siteId,
    details: {
      timestamp: new Date().toISOString(),
    },
    severity: 'low',
  });
}

/**
 * Log User Password Set
 * 
 * @param adminUserId - Admin user ID who set the password
 * @param targetUserId - Target user ID whose password was set
 * @param siteId - Site ID
 * @param forceReset - Whether force reset was enabled
 */
export async function logUserPasswordSet(
  adminUserId: string,
  targetUserId: string,
  siteId: string,
  forceReset: boolean
): Promise<void> {
  await createAuditLog({
    eventType: 'user_password_set',
    userId: adminUserId,
    targetUserId,
    siteId,
    details: {
      forceReset,
      timestamp: new Date().toISOString(),
    },
    severity: 'medium',
  });
}

/**
 * Log User Edit
 * 
 * @param adminUserId - Admin user ID who edited the user
 * @param targetUserId - Target user ID who was edited
 * @param siteId - Site ID
 * @param changes - Changes made
 */
export async function logUserEdit(
  adminUserId: string,
  targetUserId: string,
  siteId: string,
  changes: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'user_edited',
    userId: adminUserId,
    targetUserId,
    siteId,
    details: {
      changes,
      timestamp: new Date().toISOString(),
    },
    severity: 'low',
  });
}

/**
 * Log Proxy Login Start
 * 
 * @param adminUserId - Admin user ID who initiated proxy login
 * @param employeeUserId - Employee user ID being proxied
 * @param siteId - Site ID
 * @param sessionId - Proxy session ID
 */
export async function logProxyLoginStart(
  adminUserId: string,
  employeeUserId: string,
  siteId: string,
  sessionId: string
): Promise<void> {
  await createAuditLog({
    eventType: 'proxy_login_started',
    userId: adminUserId,
    targetUserId: employeeUserId,
    siteId,
    details: {
      sessionId,
      timestamp: new Date().toISOString(),
    },
    severity: 'high',
  });
}

/**
 * Log Proxy Login End
 * 
 * @param adminUserId - Admin user ID who ended proxy login
 * @param employeeUserId - Employee user ID being proxied
 * @param siteId - Site ID
 * @param sessionId - Proxy session ID
 * @param duration - Session duration in seconds
 */
export async function logProxyLoginEnd(
  adminUserId: string,
  employeeUserId: string,
  siteId: string,
  sessionId: string,
  duration: number
): Promise<void> {
  await createAuditLog({
    eventType: 'proxy_login_ended',
    userId: adminUserId,
    targetUserId: employeeUserId,
    siteId,
    details: {
      sessionId,
      duration,
      timestamp: new Date().toISOString(),
    },
    severity: 'medium',
  });
}

/**
 * Get Client IP Address
 * 
 * Attempts to get the client's IP address
 * Note: This is a best-effort approach and may not work in all environments
 * 
 * @returns Client IP address or 'unknown'
 */
async function getClientIP(): Promise<string> {
  try {
    // In a real implementation, this would be handled by the backend
    // The backend would extract the IP from the request headers
    return 'client-side'; // Placeholder
  } catch {
    return 'unknown';
  }
}

/**
 * Get Audit Logs
 * 
 * Retrieves audit logs for a site
 * 
 * @param siteId - Site ID
 * @param limit - Maximum number of logs to retrieve
 * @param offset - Offset for pagination
 * @returns Audit logs
 */
export async function getAuditLogs(
  siteId: string,
  limit: number = 100,
  offset: number = 0
): Promise<Array<{
  id: string;
  eventType: string;
  userId?: string;
  targetUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  severity: string;
  createdAt: Date;
}>> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('[auditLogService] Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }

     
    return data.map(log => ({
      id: log.id as string,
      eventType: log.event_type as string,
      userId: log.user_id as string | undefined,
      targetUserId: log.target_user_id as string | undefined,
      ipAddress: log.ip_address as string | undefined,
      userAgent: log.user_agent as string | undefined,
      details: log.details as Record<string, unknown>,
      severity: log.severity as string,
      createdAt: new Date(log.created_at as string),
    }));
  } catch (err) {
    logger.error('[auditLogService] Exception fetching audit logs:', err);
    throw err;
  }
}

/**
 * Log User Creation
 * 
 * @param adminUserId - Admin user ID who created the user
 * @param targetUserId - Target user ID who was created
 * @param siteId - Site ID
 * @param userData - User data
 */
export async function logUserCreation(
  adminUserId: string,
  targetUserId: string,
  siteId: string,
  userData: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'user_created',
    userId: adminUserId,
    targetUserId,
    siteId,
    details: {
      userData,
      timestamp: new Date().toISOString(),
    },
    severity: 'medium',
  });
}

/**
 * Log User Deletion
 * 
 * @param adminUserId - Admin user ID who deleted the user
 * @param targetUserId - Target user ID who was deleted
 * @param siteId - Site ID
 */
export async function logUserDeletion(
  adminUserId: string,
  targetUserId: string,
  siteId: string
): Promise<void> {
  await createAuditLog({
    eventType: 'user_deleted',
    userId: adminUserId,
    targetUserId,
    siteId,
    details: {
      timestamp: new Date().toISOString(),
    },
    severity: 'high',
  });
}

/**
 * Log Permission Grant
 * 
 * @param adminUserId - Admin user ID who granted the permission
 * @param targetUserId - Target user ID who received the permission
 * @param permission - Permission name
 * @param expiresAt - Expiration date (if any)
 */
export async function logPermissionGrant(
  adminUserId: string,
  targetUserId: string,
  permission: string,
  expiresAt?: string
): Promise<void> {
  await createAuditLog({
    eventType: 'permission_granted',
    userId: adminUserId,
    targetUserId,
    details: {
      permission,
      expiresAt,
      timestamp: new Date().toISOString(),
    },
    severity: 'high',
  });
}

/**
 * Log Permission Revocation
 * 
 * @param adminUserId - Admin user ID who revoked the permission
 * @param targetUserId - Target user ID whose permission was revoked
 * @param permission - Permission name
 */
export async function logPermissionRevoke(
  adminUserId: string,
  targetUserId: string,
  permission: string
): Promise<void> {
  await createAuditLog({
    eventType: 'permission_revoked',
    userId: adminUserId,
    targetUserId,
    details: {
      permission,
      timestamp: new Date().toISOString(),
    },
    severity: 'high',
  });
}
