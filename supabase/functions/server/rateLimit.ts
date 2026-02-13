/**
 * Server-Side Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 * Phase 2.4: Security Hardening
 */

import type { Context, Next } from 'npm:hono';
import * as kv from './kv_env.ts';
import { logger } from './logger.ts';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  keyGenerator?: (c: Context) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(c: Context): string {
  // Try to get user ID from JWT
  const userId = c.get('userId');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             c.req.header('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    const identifier = config.keyGenerator ? config.keyGenerator(c) : getClientIdentifier(c);
    const path = c.req.path;
    const key = `ratelimit:${path}:${identifier}`;

    try {
      // Get current rate limit info
      const data = await kv.get(key);
      let info: RateLimitInfo = data ? JSON.parse(data) : null;

      // Check if blocked
      if (info?.blockedUntil && now < info.blockedUntil) {
        const remainingSec = Math.ceil((info.blockedUntil - now) / 1000);
        
        c.header('X-RateLimit-Blocked', 'true');
        c.header('Retry-After', String(remainingSec));
        
        logger.log(`[RateLimit] Blocked: ${identifier} on ${path} (${remainingSec}s remaining)`);
        
        return c.json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${remainingSec} seconds.`,
          retryAfter: remainingSec
        }, 429);
      }

      // Reset if window expired
      if (!info || now > info.resetTime) {
        info = {
          count: 1,
          resetTime: now + config.windowMs
        };
      } else {
        info.count++;
      }

      // Check if limit exceeded
      if (info.count > config.maxRequests) {
        const blockDuration = config.blockDurationMs || config.windowMs * 2;
        info.blockedUntil = now + blockDuration;
        
        await kv.set(key, JSON.stringify(info));
        
        const remainingSec = Math.ceil(blockDuration / 1000);
        
        c.header('X-RateLimit-Blocked', 'true');
        c.header('Retry-After', String(remainingSec));
        
        logger.log(`[RateLimit] Limit exceeded: ${identifier} on ${path} (blocked for ${remainingSec}s)`);
        
        return c.json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Blocked for ${remainingSec} seconds.`,
          retryAfter: remainingSec
        }, 429);
      }

      // Save updated info
      await kv.set(key, JSON.stringify(info));

      // Set rate limit headers
      const remaining = Math.max(0, config.maxRequests - info.count);
      const resetSec = Math.ceil((info.resetTime - now) / 1000);

      c.header('X-RateLimit-Limit', String(config.maxRequests));
      c.header('X-RateLimit-Remaining', String(remaining));
      c.header('X-RateLimit-Reset', String(resetSec));

      await next();
      
    } catch (error) {
      logger.error('[RateLimit] Error:', error);
      // On error, allow request to proceed (fail open)
      await next();
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  // Strict limits for authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  
  // Standard API endpoints
  API_READ: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  },
  
  // Write/mutation endpoints (stricter)
  API_WRITE: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  },
  
  // Heavy/expensive operations
  API_HEAVY: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 10 * 60 * 1000 // 10 minutes
  },

  // Very strict for sensitive operations
  SENSITIVE: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000 // 2 hours
  }
};

/**
 * Create custom rate limiter with identifier
 */
export function rateLimitByUser(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (c) => {
      const userId = c.get('userId');
      return userId ? `user:${userId}` : getClientIdentifier(c);
    }
  });
}

/**
 * Create IP-based rate limiter
 */
export function rateLimitByIP(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: getClientIdentifier
  });
}