/**
 * Session Manager
 * Secure session handling with timeout and activity tracking
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';
import { clearTokens } from './tokenManager';
import { clearCSRFToken } from './csrfProtection';
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from './securityLogger';

interface SessionConfig {
  timeoutMs: number; // Session timeout in milliseconds
  warningMs: number; // Warning before timeout
  checkIntervalMs: number; // How often to check for timeout
}

type SessionTimeoutCallback = (remainingMs: number) => void;
type SessionExpiredCallback = () => void;

class SessionManager {
  private config: SessionConfig;
  private lastActivityTime: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private warningCallback: SessionTimeoutCallback | null = null;
  private expiredCallback: SessionExpiredCallback | null = null;
  private warningShown: boolean = false;

  constructor(config?: Partial<SessionConfig>) {
    this.config = {
      timeoutMs: 30 * 60 * 1000, // 30 minutes default
      warningMs: 5 * 60 * 1000, // 5 minutes warning
      checkIntervalMs: 10 * 1000, // Check every 10 seconds
      ...config
    };
  }

  /**
   * Start session monitoring
   */
  start(): void {
    this.lastActivityTime = Date.now();
    this.warningShown = false;

    // Set up activity listeners
    this.setupActivityListeners();

    // Start timeout checker
    this.startTimeoutChecker();

    logger.log('[SessionManager] Session started');
  }

  /**
   * Stop session monitoring
   */
  stop(): void {
    this.removeActivityListeners();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    logger.log('[SessionManager] Session stopped');
  }

  /**
   * Update last activity time
   */
  private updateActivity(): void {
    this.lastActivityTime = Date.now();
    this.warningShown = false; // Reset warning flag
  }

  /**
   * Setup activity listeners
   */
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Remove activity listeners
   */
  private removeActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    this.updateActivity();
  };

  /**
   * Start timeout checker
   */
  private startTimeoutChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTimeout();
    }, this.config.checkIntervalMs);
  }

  /**
   * Check if session has timed out
   */
  private checkTimeout(): void {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;
    const remainingTime = this.config.timeoutMs - inactiveTime;

    // Session expired
    if (remainingTime <= 0) {
      this.handleSessionExpired();
      return;
    }

    // Show warning if approaching timeout
    if (remainingTime <= this.config.warningMs && !this.warningShown) {
      this.handleSessionWarning(remainingTime);
      this.warningShown = true;
    }
  }

  /**
   * Handle session warning
   */
  private handleSessionWarning(remainingMs: number): void {
    logger.warn(`[SessionManager] Session expiring in ${Math.round(remainingMs / 1000)}s`);

    if (this.warningCallback) {
      this.warningCallback(remainingMs);
    }

    logSecurityEvent(
      SecurityEventType.SESSION_EXPIRED,
      SecuritySeverity.MEDIUM,
      { remainingMs, warning: true }
    );
  }

  /**
   * Handle session expired
   */
  private handleSessionExpired(): void {
    logger.warn('[SessionManager] Session expired');

    // Stop monitoring
    this.stop();

    // Clear all auth data
    clearTokens();
    clearCSRFToken();

    // Log security event
    logSecurityEvent(
      SecurityEventType.SESSION_EXPIRED,
      SecuritySeverity.MEDIUM,
      { reason: 'inactivity' }
    );

    // Call expired callback
    if (this.expiredCallback) {
      this.expiredCallback();
    }
  }

  /**
   * Register warning callback
   */
  onSessionWarning(callback: SessionTimeoutCallback): void {
    this.warningCallback = callback;
  }

  /**
   * Register expired callback
   */
  onSessionExpired(callback: SessionExpiredCallback): void {
    this.expiredCallback = callback;
  }

  /**
   * Extend session (reset inactivity timer)
   */
  extend(): void {
    this.updateActivity();
    logger.log('[SessionManager] Session extended');
  }

  /**
   * Get remaining session time
   */
  getRemainingTime(): number {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;
    return Math.max(0, this.config.timeoutMs - inactiveTime);
  }

  /**
   * Get last activity time
   */
  getLastActivity(): Date {
    return new Date(this.lastActivityTime);
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.getRemainingTime() > 0;
  }

  /**
   * Manually end session
   */
  endSession(): void {
    logger.log('[SessionManager] Session ended manually');
    this.handleSessionExpired();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart checker with new config
    if (this.checkInterval) {
      this.stop();
      this.start();
    }

    logger.log('[SessionManager] Configuration updated');
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Export convenience functions
export const startSession = () => sessionManager.start();
export const stopSession = () => sessionManager.stop();
export const extendSessionActivity = () => sessionManager.extend();
export const getRemainingSessionTime = () => sessionManager.getRemainingTime();
export const isSessionActive = () => sessionManager.isActive();
export const endSession = () => sessionManager.endSession();
export const onSessionWarning = (callback: SessionTimeoutCallback) => 
  sessionManager.onSessionWarning(callback);
export const onSessionExpired = (callback: SessionExpiredCallback) => 
  sessionManager.onSessionExpired(callback);

// Additional session storage functions for testing
import * as storage from './storage';

interface SessionData {
  sessionId: string;
  userId: string;
  email?: string;
  role?: string;
  createdAt: string;
  expiresAt: number;
  lastActivity?: string;
  [key: string]: any;
}

const SESSION_KEY = 'user_session';
const DEFAULT_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Creates a new session with user data
 */
export function createSession(userData: any, metadata?: any): SessionData {
  const sessionId = generateSessionId();
  const now = new Date().toISOString();
  const expiresAt = Date.now() + DEFAULT_SESSION_DURATION;
  
  const session: SessionData = {
    sessionId,
    userId: userData.id || userData.userId, // Support both id and userId
    email: userData.email,
    role: userData.role,
    createdAt: now,
    lastActivity: now,
    expiresAt,
    ...(metadata && { metadata }), // Only add metadata if provided
  };
  
  storage.setEncrypted(SESSION_KEY, session);
  return session;
}

/**
 * Generates a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Retrieves the current session
 */
export function getSession(): SessionData | null {
  const session = storage.getEncrypted<SessionData>(SESSION_KEY);
  
  if (!session) return null;
  
  // Parse expiresAt - could be number or string
  const expiresAt = typeof session.expiresAt === 'string' 
    ? new Date(session.expiresAt).getTime() 
    : session.expiresAt;
  
  // Check if expired
  if (Date.now() >= expiresAt) {
    destroySession();
    return null;
  }
  
  return session;
}

/**
 * Checks if session is valid
 */
export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null;
}

/**
 * Updates session data
 */
export function updateSession(updates: Partial<SessionData>): boolean {
  const session = getSession();
  
  if (!session) return false;
  
  const updatedSession = {
    ...session,
    ...updates,
    lastActivity: new Date().toISOString(),
  };
  
  storage.setEncrypted(SESSION_KEY, updatedSession);
  return true;
}

/**
 * Destroys the current session
 */
export function destroySession(): void {
  storage.removeItem(SESSION_KEY);
}

/**
 * Refreshes the session expiration time
 */
export function refreshSession(): boolean {
  const session = getSession();
  
  if (!session) return false;
  
  // Check if already expired
  if (Date.now() >= session.expiresAt) {
    destroySession();
    return false;
  }
  
  const newExpiresAt = Date.now() + DEFAULT_SESSION_DURATION;
  return updateSession({ expiresAt: newExpiresAt });
}

/**
 * Gets time until session expires
 */
export function getSessionTimeout(): number {
  const session = getSession();
  
  if (!session) return 0;
  
  const remaining = session.expiresAt - Date.now();
  return Math.max(0, remaining);
}

/**
 * Extends session by additional time
 */
export function extendSession(additionalMs: number): boolean {
  const session = getSession();
  
  if (!session) return false;
  
  // Don't extend expired sessions
  if (Date.now() >= session.expiresAt) {
    destroySession();
    return false;
  }
  
  const newExpiresAt = session.expiresAt + additionalMs;
  return updateSession({ expiresAt: newExpiresAt });
}