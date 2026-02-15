/**
 * Security Event Logger
 * Tracks security-related events and anomalies
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';

export enum SecurityEventType {
  // Authentication
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_INVALID = 'token_invalid',
  
  // Authorization
  ACCESS_DENIED = 'access_denied',
  PERMISSION_VIOLATION = 'permission_violation',
  RBAC_VIOLATION = 'rbac_violation',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  RATE_LIMIT_WARNING = 'rate_limit_warning',
  
  // Input Validation
  VALIDATION_FAILURE = 'validation_failure',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_VIOLATION = 'csrf_violation',
  
  // Suspicious Activity
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  MULTIPLE_FAILURES = 'multiple_failures',
  UNUSUAL_ACCESS = 'unusual_access',
  IP_BLOCKED = 'ip_blocked',
  
  // Data Security
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  BULK_OPERATION = 'bulk_operation',
  
  // System
  SECURITY_CONFIG_CHANGE = 'security_config_change',
  SECURITY_ERROR = 'security_error'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: number;
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: any;
  success: boolean;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events in memory
  private alertThresholds: Map<SecurityEventType, number> = new Map();
  private eventCounts: Map<string, number> = new Map(); // For tracking repeated events

  constructor() {
    this.initializeThresholds();
  }

  /**
   * Initialize alert thresholds
   */
  private initializeThresholds() {
    this.alertThresholds.set(SecurityEventType.LOGIN_FAILURE, 5);
    this.alertThresholds.set(SecurityEventType.ACCESS_DENIED, 10);
    this.alertThresholds.set(SecurityEventType.RATE_LIMIT_EXCEEDED, 3);
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, 1);
  }

  /**
   * Log a security event
   */
  logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    details?: any,
    success: boolean = true
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      username: this.getCurrentUsername(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      details,
      success
    };

    // Add to events array
    this.events.push(event);

    // Trim events if exceeding max
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Track event count
    this.trackEventCount(type, event.userId || event.ipAddress || 'unknown');

    // Log to console
    this.logToConsole(event);

    // Check if alert should be triggered
    this.checkAlertThreshold(type, event);

    // In production, send to backend
    if (severity === SecuritySeverity.HIGH || severity === SecuritySeverity.CRITICAL) {
      this.sendToBackend(event);
    }
  }

  /**
   * Track event counts for anomaly detection
   */
  private trackEventCount(type: SecurityEventType, identifier: string) {
    const key = `${type}:${identifier}`;
    const count = (this.eventCounts.get(key) || 0) + 1;
    this.eventCounts.set(key, count);

    // Clean up old counts periodically
    if (this.eventCounts.size > 1000) {
      const keys = Array.from(this.eventCounts.keys()).slice(0, 500);
      keys.forEach(k => this.eventCounts.delete(k));
    }
  }

  /**
   * Check if alert threshold is exceeded
   */
  private checkAlertThreshold(type: SecurityEventType, event: SecurityEvent) {
    const threshold = this.alertThresholds.get(type);
    if (!threshold) return;

    const identifier = event.userId || event.ipAddress || 'unknown';
    const key = `${type}:${identifier}`;
    const count = this.eventCounts.get(key) || 0;

    if (count >= threshold) {
      this.triggerAlert(type, event, count);
    }
  }

  /**
   * Trigger security alert
   */
  private triggerAlert(type: SecurityEventType, event: SecurityEvent, count: number) {
    logger.warn(`[SecurityAlert] ${type} threshold exceeded (${count} times)`, event);
    
    // In production, send alert to monitoring system
    // Could integrate with services like Sentry, Datadog, etc.
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID from storage
   */
  private getCurrentUserId(): string | undefined {
    try {
      return localStorage.getItem('user_id') || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get current username from storage
   */
  private getCurrentUsername(): string | undefined {
    try {
      return localStorage.getItem('username') || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get client IP (approximation)
   */
  private getClientIP(): string | undefined {
    // In browser, we can't directly get IP
    // This would be handled server-side
    return 'client';
  }

  /**
   * Get user agent
   */
  private getUserAgent(): string | undefined {
    return typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
  }

  /**
   * Log event to console
   */
  private logToConsole(event: SecurityEvent) {
    const color = this.getSeverityColor(event.severity);
    const message = `[Security:${event.type}] ${event.severity.toUpperCase()}`;
    
    logger.log(message, event);
  }

  /**
   * Get console color for severity
   */
  private getSeverityColor(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL: return '#FF0000';
      case SecuritySeverity.HIGH: return '#FF6600';
      case SecuritySeverity.MEDIUM: return '#FFAA00';
      case SecuritySeverity.LOW: return '#00AA00';
    }
  }

  /**
   * Send event to backend (for production)
   */
  private async sendToBackend(event: SecurityEvent) {
    // In production, send to backend API
    logger.log('[SecurityLogger] Would send to backend:', event);
    
    // Example:
    // try {
    //   await fetch('/api/security/log', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(event)
    //   });
    // } catch (e) {
    //   logger.error('[SecurityLogger] Failed to send event to backend:', e);
    // }
  }

  /**
   * Get all security events
   */
  getEvents(filters?: {
    type?: SecurityEventType;
    severity?: SecuritySeverity;
    userId?: string;
    startTime?: number;
    endTime?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.startTime) {
        filtered = filtered.filter(e => e.timestamp >= filters.startTime);
      }
      if (filters.endTime) {
        filtered = filtered.filter(e => e.timestamp <= filters.endTime);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get security summary
   */
  getSummary(timeWindow: number = 24 * 60 * 60 * 1000): {
    totalEvents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    criticalEvents: SecurityEvent[];
  } {
    const now = Date.now();
    const recentEvents = this.events.filter(e => now - e.timestamp < timeWindow);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    recentEvents.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    });

    const criticalEvents = recentEvents.filter(
      e => e.severity === SecuritySeverity.CRITICAL
    ).slice(0, 10);

    return {
      totalEvents: recentEvents.length,
      byType,
      bySeverity,
      criticalEvents
    };
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThan: number = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThan;
    const before = this.events.length;
    this.events = this.events.filter(e => e.timestamp > cutoff);
    const removed = before - this.events.length;
    
    if (removed > 0) {
      logger.log(`[SecurityLogger] Cleared ${removed} old events`);
    }
  }

  /**
   * Clear all events
   */
  clearAll() {
    const count = this.events.length;
    this.events = [];
    this.eventCounts.clear();
    logger.log(`[SecurityLogger] Cleared all ${count} events`);
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

// Export convenience functions
export const logSecurityEvent = (
  type: SecurityEventType,
  severity: SecuritySeverity,
  details?: any,
  success: boolean = true
) => securityLogger.logEvent(type, severity, details, success);

export const getSecurityEvents = (filters?: any) => securityLogger.getEvents(filters);
export const getSecuritySummary = (timeWindow?: number) => securityLogger.getSummary(timeWindow);
export const clearSecurityEvents = () => securityLogger.clearAll();
