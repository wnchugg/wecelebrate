/**
 * Security Middleware and Utilities
 * Provides rate limiting, input validation, and security headers
 */

// Rate limiting store (in-memory for edge functions)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @param keyGenerator - Function to generate rate limit key (default: IP address)
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number,
  keyGenerator?: (c: any) => string
) {
  return async (c: any, next: any) => {
    // Generate rate limit key (IP address or custom)
    const key = keyGenerator 
      ? keyGenerator(c) 
      : c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    
    const now = Date.now();
    const rateLimitKey = `ratelimit:${key}`;
    
    // Get or initialize rate limit data
    let limitData = rateLimitStore.get(rateLimitKey);
    
    if (!limitData || limitData.resetAt < now) {
      // Create new window
      limitData = {
        count: 0,
        resetAt: now + windowMs
      };
      rateLimitStore.set(rateLimitKey, limitData);
    }
    
    // Increment request count
    limitData.count++;
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - limitData.count).toString());
    c.header('X-RateLimit-Reset', new Date(limitData.resetAt).toISOString());
    
    // Check if limit exceeded
    if (limitData.count > maxRequests) {
      const retryAfter = Math.ceil((limitData.resetAt - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      
      // Log rate limit violation
      console.warn(`Rate limit exceeded for ${key}`, {
        path: c.req.path,
        count: limitData.count,
        limit: maxRequests
      });
      
      return c.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfter
      }, 429);
    }
    
    await next();
  };
}

/**
 * Security headers middleware
 * Adds comprehensive security headers to all responses
 */
export async function securityHeaders(c: any, next: any) {
  await next();
  
  // Get current environment
  const env = Deno.env.get('DENO_DEPLOYMENT_ID') ? 'production' : 'development';
  const isProduction = env === 'production';
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.unsplash.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ];
  
  c.header('Content-Security-Policy', cspDirectives.join('; '));
  
  // Strict Transport Security (HTTPS only)
  if (isProduction) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy, but still useful for older browsers)
  c.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ];
  c.header('Permissions-Policy', permissionsPolicy.join(', '));
  
  // Remove server fingerprinting
  c.header('Server', '');
  c.header('X-Powered-By', '');
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize string to prevent XSS
   */
  string(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers (FIXED: was on\\w+=)
      .trim()
      .slice(0, 10000); // Limit length
  },
  
  /**
   * Sanitize email
   */
  email(input: string): string {
    if (typeof input !== 'string') return '';
    
    const email = input.toLowerCase().trim().slice(0, 254);
    
    // More permissive email validation - allow common email formats
    // Matches: user@domain.com, user.name@domain.co.uk, user+tag@domain.com
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    return email;
  },
  
  /**
   * Sanitize URL
   */
  url(input: string): string {
    if (typeof input !== 'string') return '';
    
    try {
      const url = new URL(input);
      
      // Only allow http and https
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  },
  
  /**
   * Sanitize integer
   */
  integer(input: any, min?: number, max?: number): number {
    const num = parseInt(input, 10);
    
    if (isNaN(num)) {
      throw new Error('Invalid integer');
    }
    
    if (min !== undefined && num < min) {
      throw new Error(`Integer must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new Error(`Integer must be at most ${max}`);
    }
    
    return num;
  },
  
  /**
   * Sanitize boolean
   */
  boolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (input === 'true') return true;
    if (input === 'false') return false;
    throw new Error('Invalid boolean');
  },
  
  /**
   * Sanitize array
   */
  array(input: any, maxLength: number = 1000): any[] {
    if (!Array.isArray(input)) {
      throw new Error('Input must be an array');
    }
    
    if (input.length > maxLength) {
      throw new Error(`Array length exceeds maximum of ${maxLength}`);
    }
    
    return input;
  },
  
  /**
   * Sanitize object
   */
  object(input: any, allowedKeys?: string[]): any {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error('Input must be an object');
    }
    
    // If allowedKeys specified, filter object
    if (allowedKeys) {
      const sanitized: any = {};
      for (const key of allowedKeys) {
        if (key in input) {
          sanitized[key] = input[key];
        }
      }
      return sanitized;
    }
    
    return input;
  }
};

/**
 * Validation utilities
 */
export const validate = {
  /**
   * Validate email format
   */
  email(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // FIXED: was \.
    return emailRegex.test(email) && email.length <= 254;
  },
  
  /**
   * Validate password strength
   */
  password(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Validate UUID format
   */
  uuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  /**
   * Validate SKU format
   */
  sku(sku: string): boolean {
    // Allow alphanumeric, hyphens, and underscores, 3-50 characters
    const skuRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return skuRegex.test(sku);
  },
  
  /**
   * Validate phone number (basic international format)
   */
  phone(phone: string): boolean {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, ''); // FIXED: was /\\D/
    // Should be between 10 and 15 digits
    return digits.length >= 10 && digits.length <= 15;
  },
  
  /**
   * Validate file type
   */
  fileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }
};

/**
 * Request validation middleware
 * Validates request body against schema
 */
export function validateRequest(schema: {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    allowedValues?: any[];
  }
}) {
  return async (c: any, next: any) => {
    try {
      // Try to parse JSON - if it fails, provide better error message
      let body;
      try {
        const text = await c.req.text();
        console.log('Request body received (first 100 chars):', text.substring(0, 100));
        body = JSON.parse(text);
      } catch (jsonError: any) {
        console.error('JSON parsing error:', jsonError.message);
        return c.json({ 
          error: 'Invalid JSON in request body',
          details: 'The request body contains malformed JSON. Please check your input for special characters.'
        }, 400);
      }
      
      const errors: string[] = [];
      
      // Validate each field
      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];
        
        // Check required
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          continue;
        }
        
        // Skip validation if not required and not present
        if (!rules.required && (value === undefined || value === null)) {
          continue;
        }
        
        // Type validation
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${field} must be a string`);
            } else {
              if (rules.min && value.length < rules.min) {
                errors.push(`${field} must be at least ${rules.min} characters`);
              }
              if (rules.max && value.length > rules.max) {
                errors.push(`${field} must be at most ${rules.max} characters`);
              }
            }
            break;
            
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`${field} must be a number`);
            } else {
              if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
              }
              if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`);
              }
            }
            break;
            
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${field} must be a boolean`);
            }
            break;
            
          case 'email':
            if (!validate.email(value)) {
              errors.push(`${field} must be a valid email address`);
            }
            break;
            
          case 'url':
            try {
              new URL(value);
            } catch {
              errors.push(`${field} must be a valid URL`);
            }
            break;
            
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${field} must be an array`);
            } else {
              if (rules.max && value.length > rules.max) {
                errors.push(`${field} must contain at most ${rules.max} items`);
              }
            }
            break;
            
          case 'object':
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
              errors.push(`${field} must be an object`);
            }
            break;
        }
        
        // Allowed values validation
        if (rules.allowedValues && !rules.allowedValues.includes(value)) {
          errors.push(`${field} must be one of: ${rules.allowedValues.join(', ')}`);
        }
      }
      
      if (errors.length > 0) {
        return c.json({ 
          error: 'Validation failed',
          details: errors 
        }, 400);
      }
      
      // Store validated body for route handlers to use
      c.set('validatedBody', body);
      
      await next();
    } catch (error: any) {
      console.error('Request validation error:', error);
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
}

/**
 * Audit logging utility
 */
export async function auditLog(params: {
  action: string;
  userId?: string;
  email?: string;
  status: 'success' | 'failure' | 'warning';
  ip?: string;
  userAgent?: string;
  details?: any;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: params.action,
    userId: params.userId || 'anonymous',
    email: params.email || '',
    status: params.status,
    ip: params.ip || 'unknown',
    userAgent: params.userAgent || 'unknown',
    details: params.details || {},
  };
  
  // Log to console (in production, send to logging service)
  console.log('AUDIT LOG:', JSON.stringify(logEntry));
  
  // TODO: Store in database or send to logging service
  // await kv.set(`audit_logs:${Date.now()}`, logEntry);
}

/**
 * Error response helper
 */
export function errorResponse(c: any, error: any, statusCode: number = 500) {
  // Don't expose internal error details in production
  const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;
  
  const errorMessage = isProduction 
    ? 'An error occurred' 
    : error.message || 'Unknown error';
  
  // Log full error server-side
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: c.req.path,
    method: c.req.method
  });
  
  return c.json({ 
    error: errorMessage,
    ...(isProduction ? {} : { details: error.stack })
  }, statusCode);
}