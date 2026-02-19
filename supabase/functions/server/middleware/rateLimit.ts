/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per time window
 */

import { Context, Next } from 'npm:hono';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (c: Context) => string;  // Function to generate rate limit key
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;  // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or similar)
const store: RateLimitStore = {};

/**
 * Clean up expired entries from store
 */
function cleanupStore() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStore, 5 * 60 * 1000);

/**
 * Default key generator - uses IP address and user ID if available
 */
function defaultKeyGenerator(c: Context): string {
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || 
             c.req.header('x-real-ip') || 
             'unknown';
  
  return user ? `${user.id}:${ip}` : ip;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = store[key];

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', entry.resetTime.toString());
      c.header('Retry-After', retryAfter.toString());

      return c.json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }, 429);
    }

    // Increment counter (before request if not skipping)
    if (!skipSuccessfulRequests && !skipFailedRequests) {
      entry.count++;
    }

    // Set rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetTime.toString());

    // Execute request
    await next();

    // Increment counter after request if skipping certain types
    const statusCode = c.res.status;
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const isFailed = statusCode >= 400;

    if (skipSuccessfulRequests && isSuccess) {
      // Don't count this request
    } else if (skipFailedRequests && isFailed) {
      // Don't count this request
    } else if (skipSuccessfulRequests || skipFailedRequests) {
      // Count this request
      entry.count++;
    }
  };
}

/**
 * Preset rate limit configurations
 */
export const rateLimitPresets = {
  // Strict rate limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // Moderate rate limit for password operations
  password: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  
  // Lenient rate limit for general API
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Very strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
};

/**
 * Rate limit by user ID only (ignores IP)
 */
export function rateLimitByUser(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (c: Context) => {
      const user = c.get('user');
      return user ? user.id : 'anonymous';
    },
  });
}

/**
 * Rate limit by IP only (ignores user)
 */
export function rateLimitByIP(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (c: Context) => {
      return c.req.header('x-forwarded-for') || 
             c.req.header('x-real-ip') || 
             'unknown';
    },
  });
}
