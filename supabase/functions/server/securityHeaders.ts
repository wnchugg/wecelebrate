/**
 * Security Headers Middleware
 * Implements comprehensive HTTP security headers
 * Phase 2.4: Security Hardening
 */

import type { Context, Next } from 'npm:hono';
import { logger } from './logger.ts';

/**
 * Security headers middleware
 * Adds comprehensive security headers to all responses
 */
export async function securityHeaders(c: Context, next: Next) {
  await next();

  // Get environment
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['*'];

  // Strict-Transport-Security (HSTS)
  // Forces HTTPS for 1 year, includes subdomains
  if (!isDevelopment) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // X-Frame-Options
  // Prevents clickjacking attacks
  c.header('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  // Legacy XSS protection (mainly for older browsers)
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  // Controls how much referrer information is sent
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features can be used
  c.header('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '));

  // Content-Security-Policy (CSP)
  // Prevents XSS and other injection attacks
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.unsplash.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];

  // In development, relax CSP slightly
  if (isDevelopment) {
    c.header('Content-Security-Policy-Report-Only', cspDirectives.join('; '));
  } else {
    c.header('Content-Security-Policy', cspDirectives.join('; '));
  }

  // Cross-Origin-Embedder-Policy
  c.header('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin-Opener-Policy
  c.header('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Resource-Policy
  c.header('Cross-Origin-Resource-Policy', 'same-origin');

  // X-Permitted-Cross-Domain-Policies
  // Prevents Adobe Flash and PDF from loading content
  c.header('X-Permitted-Cross-Domain-Policies', 'none');

  // X-Download-Options
  // Prevents IE from executing downloads in site context
  c.header('X-Download-Options', 'noopen');

  // X-DNS-Prefetch-Control
  // Controls DNS prefetching
  c.header('X-DNS-Prefetch-Control', 'off');

  // Expect-CT (Certificate Transparency)
  if (!isDevelopment) {
    c.header('Expect-CT', 'max-age=86400, enforce');
  }

  // Custom security header for API version
  c.header('X-API-Version', '2.0');
  
  // Remove potentially sensitive headers
  c.header('Server', ''); // Hide server information
  c.header('X-Powered-By', ''); // Hide technology stack
}

/**
 * CORS middleware with security considerations
 */
export async function secureCORS(c: Context, next: Next) {
  const origin = c.req.header('Origin');
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['*'];
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

  // Check if origin is allowed
  const isAllowed = isDevelopment || 
                   allowedOrigins.includes('*') || 
                   (origin && allowedOrigins.includes(origin));

  if (isAllowed) {
    // Set CORS headers
    c.header('Access-Control-Allow-Origin', origin || '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Session-Token, X-Environment-ID, X-Access-Token');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', '86400'); // 24 hours
    c.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
  }

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}

/**
 * Request sanitization middleware
 * Removes potentially dangerous characters from input
 */
export async function sanitizeRequest(c: Context, next: Next) {
  // Get request body if present
  const contentType = c.req.header('Content-Type');
  
  if (contentType?.includes('application/json')) {
    try {
      const body = await c.req.json();
      
      // Check for common injection patterns
      const suspicious = checkForInjectionPatterns(JSON.stringify(body));
      
      if (suspicious.detected) {
        logger.log(`[Security] Suspicious request detected: ${suspicious.pattern}`);
        
        return c.json({
          error: 'Invalid request',
          message: 'Request contains potentially malicious content'
        }, 400);
      }
    } catch (e) {
      // Invalid JSON, let it fail naturally in the route handler
    }
  }

  await next();
}

/**
 * Check for common injection patterns
 */
function checkForInjectionPatterns(input: string): { detected: boolean; pattern?: string } {
  const patterns = [
    // SQL Injection
    { regex: /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/i, name: 'SQL Injection' },
    
    // NoSQL Injection
    { regex: /\$where|\$ne|\$gt|\$lt|\$regex/i, name: 'NoSQL Injection' },
    
    // XSS attempts
    { regex: /<script[^>]*>.*?<\/script>/i, name: 'XSS Script Tag' },
    { regex: /javascript:/i, name: 'JavaScript Protocol' },
    { regex: /on\w+\s*=\s*["'][^"']*["']/i, name: 'Event Handler' },
    
    // Command Injection
    { regex: /[;&|`$(){}[\]]/g, name: 'Command Injection Characters' },
    
    // Path Traversal
    { regex: /\.\.[\/\\]/g, name: 'Path Traversal' }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(input)) {
      return { detected: true, pattern: pattern.name };
    }
  }

  return { detected: false };
}

/**
 * Response sanitization middleware
 * Ensures responses don't leak sensitive information
 */
export async function sanitizeResponse(c: Context, next: Next) {
  await next();

  // Check if response is JSON
  const contentType = c.res.headers.get('Content-Type');
  
  if (contentType?.includes('application/json')) {
    try {
      const originalBody = await c.res.json();
      
      // Remove sensitive fields from error responses
      if (c.res.status >= 400 && originalBody.error) {
        const sanitized = {
          error: originalBody.error,
          message: originalBody.message || 'An error occurred'
          // Exclude: stack traces, internal details, database errors
        };
        
        // Log full error server-side
        if (originalBody.details || originalBody.stack) {
          logger.error('[Error Details]', {
            status: c.res.status,
            details: originalBody.details,
            stack: originalBody.stack
          });
        }
        
        return c.json(sanitized, c.res.status);
      }
    } catch (e) {
      // Not JSON or already consumed, continue
    }
  }
}

/**
 * Security headers for file uploads
 */
export function fileUploadSecurityHeaders(c: Context) {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Content-Disposition', 'attachment');
  c.header('X-Download-Options', 'noopen');
}