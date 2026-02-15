/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse and DoS attacks
 * Implements per-IP and per-user rate limiting
 */

import { Context, Next } from 'npm:hono';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  message?: string;  // Custom error message
  keyGenerator?: (c: Context) => string;  // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Get client IP address
 */
function getClientIP(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    keyGenerator = getClientIP,
  } = config;
  
  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return c.json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter,
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
      });
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', (max - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetTime.toString());
    
    await next();
  };
}

/**
 * Per-IP rate limiting
 * Default: 100 requests per 15 minutes
 */
export const ipRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

/**
 * Per-user rate limiting
 * Default: 1000 requests per hour
 */
export const userRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: 'Too many requests, please try again later',
  keyGenerator: (c: Context) => {
    const user = c.get('user');
    return user?.id || getClientIP(c);
  },
});

/**
 * Strict rate limiting for sensitive endpoints
 * Default: 10 requests per minute
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many requests to this endpoint, please try again later',
});

/**
 * API key rate limiting
 * Default: 10000 requests per hour
 */
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000,
  message: 'API key rate limit exceeded',
  keyGenerator: (c: Context) => {
    const apiKey = c.req.header('X-API-Key');
    return `apikey:${apiKey || 'unknown'}`;
  },
});
