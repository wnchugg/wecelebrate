/**
 * Rate Limiter Utility
 * Client-side rate limiting to prevent abuse and reduce server load
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.startCleanup();
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup() {
    if (typeof window === 'undefined') return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.limits.forEach((record, key) => {
        const windowExpired = now - record.firstAttemptTime > 60000; // 1 minute
        const blockExpired = record.blockedUntil && now > record.blockedUntil;

        if (windowExpired && !record.blockedUntil) {
          keysToDelete.push(key);
        } else if (blockExpired) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.limits.delete(key));
      
      if (keysToDelete.length > 0) {
        logger.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Check if an action is allowed
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.limits.get(key);

    // Check if blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      const remainingMs = record.blockedUntil - now;
      logger.warn(`[RateLimiter] Action blocked: ${key} (${Math.ceil(remainingMs / 1000)}s remaining)`);
      return false;
    }

    // If no record or window expired, start fresh
    if (!record || now - record.firstAttemptTime > config.windowMs) {
      this.limits.set(key, {
        attempts: 1,
        firstAttemptTime: now
      });
      return true;
    }

    // Increment attempts
    record.attempts++;

    // Check if limit exceeded
    if (record.attempts > config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs * 2;
      record.blockedUntil = now + blockDuration;
      
      logger.warn(
        `[RateLimiter] Rate limit exceeded: ${key} (${record.attempts}/${config.maxAttempts} attempts, blocked for ${blockDuration / 1000}s)`
      );
      return false;
    }

    this.limits.set(key, record);
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const record = this.limits.get(key);
    if (!record) return config.maxAttempts;

    const now = Date.now();
    
    // If blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return 0;
    }

    // If window expired
    if (now - record.firstAttemptTime > config.windowMs) {
      return config.maxAttempts;
    }

    return Math.max(0, config.maxAttempts - record.attempts);
  }

  /**
   * Get time until unblocked
   */
  getTimeUntilUnblocked(key: string): number {
    const record = this.limits.get(key);
    if (!record?.blockedUntil) return 0;

    const now = Date.now();
    return Math.max(0, record.blockedUntil - now);
  }

  /**
   * Check if currently blocked
   */
  isBlocked(key: string): boolean {
    const record = this.limits.get(key);
    if (!record?.blockedUntil) return false;

    const now = Date.now();
    return now < record.blockedUntil;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string) {
    this.limits.delete(key);
    logger.log(`[RateLimiter] Reset: ${key}`);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    const count = this.limits.size;
    this.limits.clear();
    logger.log(`[RateLimiter] Cleared all rate limits (${count} entries)`);
  }

  /**
   * Stop cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Authentication
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000 // 2 hours
  },
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour
  },
  
  // API Calls
  API_GENERAL: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  },
  API_WRITE: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  },
  API_HEAVY: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 10 * 60 * 1000 // 10 minutes
  },

  // User Actions
  FORM_SUBMISSION: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 2 * 60 * 1000 // 2 minutes
  },
  SEARCH: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000 // 1 minute
  },
  EXPORT: {
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  },
  UPLOAD: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  }
} as const;

/**
 * Helper function to create rate limit keys
 */
export const createRateLimitKey = (action: string, identifier?: string): string => {
  const base = `ratelimit:${action}`;
  if (!identifier) return base;
  return `${base}:${identifier}`;
};

/**
 * Check if action is rate limited
 */
export const checkRateLimit = (
  action: string,
  identifier?: string,
  customConfig?: RateLimitConfig
): boolean => {
  const key = createRateLimitKey(action, identifier);
  const config = customConfig || RATE_LIMITS.API_GENERAL;
  return rateLimiter.checkLimit(key, config);
};

/**
 * Get remaining attempts for action
 */
export const getRemainingAttempts = (
  action: string,
  identifier?: string,
  config?: RateLimitConfig
): number => {
  const key = createRateLimitKey(action, identifier);
  const limitConfig = config || RATE_LIMITS.API_GENERAL;
  return rateLimiter.getRemainingAttempts(key, limitConfig);
};

/**
 * Reset rate limit for action
 */
export const resetRateLimit = (action: string, identifier?: string) => {
  const key = createRateLimitKey(action, identifier);
  rateLimiter.reset(key);
};
