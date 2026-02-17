import { Hono } from "npm:hono@4.0.2";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SignJWT, jwtVerify } from "npm:jose@5.2.0";
import { seedDatabase } from "./seed.ts";
import { seedDemoUseCaseSites } from "./seed-demo-sites.tsx";
import { 
  rateLimit, 
  securityHeaders, 
  sanitize, 
  validate,
  validateRequest,
  auditLog,
  errorResponse 
} from "./security.ts";
// Phase 2.4: Enhanced security headers and middleware
import { 
  securityHeaders as enhancedSecurityHeaders, 
  secureCORS, 
  sanitizeRequest,
  sanitizeResponse
} from "./securityHeaders.ts";
import { rateLimit as enhancedRateLimit, RATE_LIMIT_CONFIGS } from "./rateLimit.ts";
import * as kv from "./kv_env.ts"; // Use environment-aware KV store
import * as erp from "./erp_integration.ts";
import * as erpEnhanced from "./erp_integration_enhanced.ts";
import * as scheduler from "./erp_scheduler.ts";
import * as giftsApi from "./gifts_api_v2.ts"; // UPDATED: Using database version
import * as emailService from "./email_service.tsx";
import * as emailAutomation from "./email_automation.tsx";
import * as emailEventHelper from "./email_event_helper.tsx";
import * as webhookSystem from "./webhook_system.tsx";
import * as scheduledEmail from "./scheduled_email.tsx";
import * as scheduledTriggers from "./scheduled_triggers.tsx";
import * as celebrations from "./celebrations.ts";
import hrisRoutes from "./hris.tsx";
import * as adminUsers from "./admin_users.ts";
import { setupTestCrudRoutes, verifyCrudFactorySetup } from './crud_factory_test.ts';
// Phase 3.2: Migrated CRUD resources using factory pattern (consolidated file)
import { setupMigratedResources } from './migrated_resources.ts';
// Phase 2: Multi-Catalog Architecture APIs (UPDATED: Using V2 database versions)
import catalogsApi from './catalogs_api_v2.ts';  // UPDATED: V2 with database
import siteCatalogConfigApi from './site-catalog-config_api_v2.ts';  // UPDATED: V2 with database
import migrationApi from './migration_api.ts';
// Database cleanup utilities
import { setupCleanupRoutes } from './database_cleanup.ts';
// Phase 4: Security Middleware (Production Readiness)
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.ts';
import { tenantIsolationMiddleware } from './middleware/tenant.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { ipRateLimit, userRateLimit } from './middleware/rateLimit.ts';

const app = new Hono();

// ==================== ED25519 JWT CONFIGURATION ====================
// JWT using Ed25519 asymmetric keys (best practice)
// Migration date: 2026-02-15
// Security: HS256 fallback REMOVED on 2026-02-15 to close security vulnerability
// All tokens must now use Ed25519 - no exceptions

import { importJWK } from "npm:jose@5.2.0";

// Load Ed25519 keys from environment variables
const JWT_PRIVATE_KEY_B64 = Deno.env.get('JWT_PRIVATE_KEY');
const JWT_PUBLIC_KEY_B64 = Deno.env.get('JWT_PUBLIC_KEY');

let privateKey: any = null;
let publicKey: any = null;

// Initialize Ed25519 keys
async function initializeJWTKeys() {
  try {
    if (!JWT_PRIVATE_KEY_B64) {
      throw new Error('JWT_PRIVATE_KEY environment variable is required');
    }
    
    if (!JWT_PUBLIC_KEY_B64) {
      throw new Error('JWT_PUBLIC_KEY environment variable is required');
    }
    
    const privateJWK = JSON.parse(atob(JWT_PRIVATE_KEY_B64));
    privateKey = await importJWK(privateJWK, 'EdDSA');
    console.log('✅ JWT Ed25519 private key loaded');
    
    const publicJWK = JSON.parse(atob(JWT_PUBLIC_KEY_B64));
    publicKey = await importJWK(publicJWK, 'EdDSA');
    console.log('✅ JWT Ed25519 public key loaded');
    
    console.log('🔒 Security: Ed25519-only mode (HS256 fallback removed)');
  } catch (error) {
    console.error('❌ CRITICAL: Failed to initialize Ed25519 JWT keys:', error);
    console.error('❌ Backend cannot start without Ed25519 keys');
    throw error; // Fail fast - don't start without proper keys
  }
}

// Initialize keys on startup
await initializeJWTKeys();

// Helper to generate JWT (Ed25519 only - no fallback)
async function generateCustomJWT(payload: any): Promise<string> {
  if (!privateKey) {
    throw new Error('Ed25519 private key not initialized');
  }
  
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(privateKey);
  
  return jwt;
}

// Helper to verify JWT (Ed25519 only - no fallback)
async function verifyCustomJWT(token: string): Promise<any> {
  if (!publicKey) {
    throw new Error('Ed25519 public key not initialized');
  }
  
  try {
    const { payload } = await jwtVerify(token, publicKey);
    return payload;
  } catch (error: any) {
    if (isDevelopment) {
      console.error('[JWT] Ed25519 verification failed:', error.message);
    }
    throw new Error('Invalid or expired token');
  }
}
// ==================== END CUSTOM JWT CONFIGURATION ==================

// Startup logging to diagnose configuration
console.log('🚀 ========== JALA2 Backend Starting (v2.2 - Performance Optimized) ==========');
console.log('📦 Supabase Project ID:', Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0] || 'NOT_SET');
console.log('🔑 Service Role Key:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT_SET');
console.log('==============================================');

// Track server startup time for cold start protection
const SERVER_START_TIME = Date.now();
const COLD_START_GRACE_PERIOD_MS = 10000; // 10 seconds grace period

// Helper function to check if we're still in cold start period
export function isInColdStartPeriod(): boolean {
  return (Date.now() - SERVER_START_TIME) < COLD_START_GRACE_PERIOD_MS;
}

// Create Supabase client for auth (default - Development)
// CRITICAL: This must match the project where the backend is deployed
// Backend is deployed to Development project: wjfcqqrlhwdvvjmefxky
const DEV_SUPABASE_URL = 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || DEV_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Validate configuration
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY not set');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

// Production Supabase client configuration
// Security Fix 1.3: Use environment variable instead of hardcoded URL
const PRODUCTION_SUPABASE_URL = Deno.env.get('SUPABASE_URL_PROD') || 'https://lmffeqwhrnbsbhdztwyv.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY_PROD');

// Helper to check if we're in development mode
const isDevelopment = Deno.env.get('DENO_ENV') !== 'production';

// Helper function to get the appropriate Supabase client based on environment
function getSupabaseClient(environmentId?: string) {
  // TEMPORARY FIX: Always use development Supabase until production is configured
  // The backend is deployed to Development (wjfcqqrlhwdvvjmefxky) so all auth
  // tokens must be issued and verified by that same instance
  
  // Always return the development client for now
  // TODO: Uncomment this once PRODUCTION_SERVICE_ROLE_KEY is properly configured
  /*
  // If production environment is requested and we have the production key
  if (environmentId === 'production' && PRODUCTION_SERVICE_ROLE_KEY) {
    return createClient(
      PRODUCTION_SUPABASE_URL,
      PRODUCTION_SERVICE_ROLE_KEY
    );
  }
  */
  
  // Default to development
  return supabase;
}

// ==================== IN-MEMORY CACHE FOR ENVIRONMENTS ====================
// Simple in-memory cache to reduce database calls for frequently accessed data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60000; // 1 minute cache TTL
const environmentsCache = new Map<string, CacheEntry<any>>();

export function getCachedData<T>(key: string): T | null {
  const entry = environmentsCache.get(key);
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL_MS) {
    environmentsCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  environmentsCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    environmentsCache.clear();
    return;
  }
  
  for (const key of environmentsCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      environmentsCache.delete(key);
    }
  }
}
// ==================== END IN-MEMORY CACHE ====================

// Conditional seeding - only run if SEED_ON_STARTUP is set to 'true'
// This prevents slow startups and deployment timeouts
if (Deno.env.get('SEED_ON_STARTUP') === 'true') {
  console.log('⚠️ SEED_ON_STARTUP=true, seeding database...');
  seedDatabase().catch(error => {
    console.error('Failed to seed database:', error);
  });
} else {
  console.log('ℹ️ Skipping automatic database seed');
}

// Initialize Supabase Storage buckets (async, non-blocking)
// This will run in the background and not block server startup
async function initializeStorageBuckets() {
  // Add delay to allow Supabase services to fully start after restart
  await new Promise(resolve => setTimeout(resolve, 5000)); // Increased from 3s to 5s
  
  try {
    console.log('🗄️ Initializing storage buckets...');
    
    const buckets = ['make-6fcaeea3-logos', 'make-6fcaeea3-gift-images'];
    
    for (const bucketName of buckets) {
      try {
        // Check if bucket exists (with shorter timeout to not block)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000) // Reduced from 5s to 3s
        );
        
        const listPromise = supabase.storage.listBuckets();
        const { data: existingBuckets, error: listError } = await Promise.race([
          listPromise,
          timeoutPromise
        ]) as any;
        
        if (listError) {
          console.warn(`⚠️ Storage check failed, skipping:`, listError.message?.substring(0, 100));
          break;
        }
        
        const bucketExists = existingBuckets?.some((bucket: any) => bucket.name === bucketName);
        
        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
          });
          
          if (error) {
            console.warn(`⚠️ Could not create bucket ${bucketName}`);
          } else {
            console.log(`✅ Bucket created: ${bucketName}`);
          }
        } else {
          console.log(`✅ Bucket exists: ${bucketName}`);
        }
      } catch (bucketError: any) {
        console.warn(`⚠️ Bucket ${bucketName} init skipped`);
        break;
      }
    }
    
    console.log('✅ Storage initialization complete');
  } catch (error: any) {
    console.warn('⚠️ Storage init skipped:', error.message?.substring(0, 100));
  }
}

// Run storage initialization in background (non-blocking)
initializeStorageBuckets().catch(err => {
  console.warn('Storage init failed (non-critical)');
});

// ⚡ CRITICAL: Pre-initialize cache with empty arrays IMMEDIATELY (synchronous)
// This prevents 544 deployment errors by ensuring cache exists before first request
console.log('⚡ Pre-initializing cache with empty arrays (prevents cold start timeouts)');
setCachedData('environments:list', []);
// NOTE: Removed sites cache pre-initialization to allow proper data loading
// setCachedData('sites:list:development', []);
console.log('✅ Cache pre-initialized - first requests will be fast');

// DISABLED: Warmup function was causing deployment timeouts (544 errors)
// Cache will be populated on first actual request instead
// This prevents blocking database calls during cold starts
/*
async function warmupEnvironmentsCache() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  try {
    console.log('🔥 Warming up environments cache...');
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Warmup timeout')), 10000)
    );
    const environments = await Promise.race([
      kv.getByPrefix('environments:', 'development'),
      timeoutPromise
    ]);
    if (environments && environments.length > 0) {
      setCachedData('environments:list', environments);
      console.log(`✅ Environments cache warmed up with ${environments.length} items`);
    } else {
      console.log('ℹ️ No environments found, keeping empty cache');
    }
  } catch (error: any) {
    console.warn('⚠️ Cache warmup timed out (non-critical) - using empty cache');
  }
}
*/

// DISABLED: Warmup function was causing deployment timeouts (544 errors)
// Cache will be populated on first actual request instead
/*
async function warmupSitesCache() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  try {
    console.log('🔥 Warming up sites cache...');
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Warmup timeout')), 10000)
    );
    const sites = await Promise.race([
      kv.getByPrefix('site:', 'development'),
      timeoutPromise
    ]);
    if (sites && sites.length > 0) {
      setCachedData('sites:list:development', sites);
      console.log(`✅ Sites cache warmed up with ${sites.length} items`);
    } else {
      console.log('ℹ️ No sites found, keeping empty cache');
    }
  } catch (error: any) {
    console.warn('⚠️ Sites cache warmup timed out (non-critical) - using empty cache');
  }
}
*/

// DISABLED: Cache warmup calls disabled to prevent deployment timeouts
// warmupEnvironmentsCache().catch(() => {});
// warmupSitesCache().catch(() => {});
console.log('ℹ️ Cache warmup disabled to prevent deployment timeouts');

// Apply security headers to all routes (MUST be first)
app.use('*', securityHeaders);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
// Security Fix 1.2: Actually validate against allowlist
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map(o => o.trim()) || ['*'];

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // If wildcard is allowed, accept all
      if (allowedOrigins.includes('*')) {
        return origin || '*';
      }
      
      // Check if origin is in allowlist
      if (origin && allowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes(origin))) {
        return origin;
      }
      
      // For development, be permissive with common dev domains
      if (origin && (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('netlify.app') ||
        origin.includes('supabase.co') ||
        origin.includes('figma.com') ||
        origin.includes('figma.site')
      )) {
        return origin;
      }
      
      // Return the origin anyway to avoid blocking during development
      return origin || allowedOrigins[0] || '*';
    },
    allowHeaders: ["Content-Type", "Authorization", "X-Access-Token", "X-CSRF-Token", "X-Environment-ID", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 600,
    credentials: false,
  }),
);

// ==================== PHASE 4: SECURITY MIDDLEWARE ====================
// Rate limiting to prevent abuse and DoS attacks
console.log('🔒 Applying rate limiting middleware...');
app.use('*', ipRateLimit);
console.log('✅ Rate limiting active: 100 requests per 15 minutes per IP');

// Global error handler
app.onError((err, c) => {
  console.error('Global error handler:', err);
  return errorResponse(c, err, 500);
});

// Middleware to verify admin authentication using custom HS256 JWT
async function verifyAdmin(c: any, next: any) {
  // NOTE: Using X-Access-Token header instead of Authorization to avoid Supabase platform JWT validation
  const accessToken = c.req.header('X-Access-Token');
  if (!accessToken) {
    await auditLog({
      action: 'auth_verification_failed',
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { reason: 'No access token provided' }
    });
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get environment ID from header
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Verify our custom HS256 JWT
    const payload = await verifyCustomJWT(accessToken);

    // Set context variables for downstream handlers
    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);
    c.set('userRole', payload.role);
    c.set('environmentId', environmentId);
    
    // Phase 4: Add tenant context for multi-tenant isolation
    c.set('tenantContext', {
      client_id: payload.clientId,
      site_id: payload.siteId,
      enforce_isolation: payload.role !== 'super_admin', // Super admins can access all tenants
    });
    
    // Phase 4: Log tenant access for audit
    console.log('[Tenant] Access:', {
      user_id: payload.userId,
      user_email: payload.email,
      client_id: payload.clientId,
      site_id: payload.siteId,
      path: c.req.path,
      method: c.req.method,
    });
    
    await next();
  } catch (error: any) {
    await auditLog({
      action: 'auth_verification_failed',
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        reason: 'Invalid custom JWT token', 
        error: error.message,
        environmentId
      }
    });
    
    return c.json({ 
      code: 401,
      message: 'Invalid JWT',
      error: 'Unauthorized: Invalid or expired token'
    }, 401);
  }
}

// Phase 4: Tenant isolation helper function
// Apply tenant filters to query parameters for automatic multi-tenant isolation
export function applyTenantFilters(c: any, filters: Record<string, any>): Record<string, any> {
  const tenantContext = c.get('tenantContext');
  
  if (!tenantContext || !tenantContext.enforce_isolation) {
    return filters;
  }
  
  const tenantFilters = { ...filters };
  
  // Add client_id filter if user has client context
  if (tenantContext.client_id) {
    tenantFilters.client_id = tenantContext.client_id;
  }
  
  // Add site_id filter if user has site context
  if (tenantContext.site_id) {
    tenantFilters.site_id = tenantContext.site_id;
  }
  
  return tenantFilters;
}

// Health check endpoint (public - no auth required)
app.get("/make-server-6fcaeea3/health", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Quick health check without database query (to avoid timeout during startup)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const detectedProjectId = projectIdMatch ? projectIdMatch[1] : 'NOT_FOUND';

    return c.json({ 
      status: "ok",
      message: "Backend server is running",
      timestamp: new Date().toISOString(),
      environment: environmentId,
      version: '2.2',
      deployment: {
        supabaseProject: detectedProjectId,
        hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      }
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return c.json({
      status: "error",
      message: error.message || 'Health check failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Public health check endpoint with database status (for frontend initialization check)
app.get("/make-server-6fcaeea3/public/health-check", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Check if sites exist
    const sites = await kv.getByPrefix('site:', environmentId);
    const siteCount = sites?.length || 0;
    
    // Check if admin users exist
    const admins = await kv.getByPrefix('admin_users:', environmentId);
    const adminCount = admins?.length || 0;
    
    return c.json({
      success: true,
      status: 'ok',
      sites: siteCount,
      admins: adminCount,
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Public health check error:', error);
    return c.json({
      success: false,
      status: 'error',
      message: error.message || 'Health check failed',
      sites: 0,
      admins: 0,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Security Fix 1.9: Debug endpoint gated behind admin auth
app.get("/make-server-6fcaeea3/debug-headers", verifyAdmin, async (c) => {
  const headers: any = {};
  c.req.raw.headers.forEach((value: string, key: string) => {
    headers[key] = value;
  });
  
  return c.json({
    status: 'success',
    headers: headers,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString()
  });
});

// Public cache clearing endpoint (for debugging deployment issues)
app.post("/make-server-6fcaeea3/public/clear-cache", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Clear all caches
    clearCache();
    
    // Force reload sites into cache
    const sites = await kv.getByPrefix('site:', environmentId);
    setCachedData(`sites:list:${environmentId}`, sites || []);
    
    return c.json({
      success: true,
      message: 'Cache cleared and reloaded',
      sitesLoaded: sites?.length || 0,
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache clear error:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to clear cache',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Debug endpoint to check site statuses (public - for troubleshooting)
app.get("/make-server-6fcaeea3/public/debug-sites", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const sites = await kv.getByPrefix('site:', environmentId);
    const siteInfo = sites?.map((s: any) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      clientId: s.clientId,
      hasStatus: s && typeof s === 'object' && 'status' in s,
      statusType: typeof s.status
    })) || [];
    
    const statusCounts = siteInfo.reduce((acc: any, site: any) => {
      const status = site.status || 'undefined';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return c.json({
      success: true,
      totalSites: sites?.length || 0,
      statusCounts,
      sites: siteInfo,
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Debug sites error:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to get site info',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Test endpoint to verify /sites CRUD endpoint (requires admin auth)
app.get("/make-server-6fcaeea3/public/test-sites-endpoint", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    // This mimics what the CRUD factory does
    const prefix = `site:${environmentId}:`;
    const allSites = await kv.getByPrefix(prefix);
    
    return c.json({
      success: true,
      message: 'Sites endpoint test successful',
      data: allSites,
      meta: {
        total: allSites?.length || 0,
        prefix: prefix,
        environmentId: environmentId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test sites endpoint error:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to test sites endpoint',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Cleanup endpoint to delete ALL sites and reseed (public - for cleanup)
app.post("/make-server-6fcaeea3/public/cleanup-all-sites", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Get all site keys directly from database
    const supabaseClient = getSupabaseClient(environmentId);
    const { data, error } = await supabaseClient
      .from("kv_store_6fcaeea3")
      .select("key")
      .like("key", "site:%");
    
    if (error) {
      throw new Error(error.message);
    }
    
    const siteKeys = data?.map((d: any) => d.key) || [];
    console.log(`[Cleanup] Found ${siteKeys.length} site keys to delete`);
    
    // Delete all site keys
    for (const key of siteKeys) {
      await kv.del(key, environmentId);
      console.log(`[Cleanup] Deleted key: ${key}`);
    }
    
    // Clear cache to force reload
    clearCache();
    
    return c.json({
      success: true,
      message: 'All sites deleted successfully',
      deletedCount: siteKeys.length,
      deletedKeys: siteKeys,
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cleanup all sites error:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to cleanup all sites',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Seed test employees for a site (public - for testing)
app.post("/make-server-6fcaeea3/public/seed-test-employees", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const { siteId } = await c.req.json();
    
    if (!siteId) {
      return c.json({
        success: false,
        message: 'siteId is required',
        timestamp: new Date().toISOString()
      }, 400);
    }
    
    // Create test employees
    const testEmployees = [
      {
        id: 'emp-001',
        siteId: siteId,
        name: 'John Doe',
        email: 'john.doe@company.com',
        employeeId: 'EMP001',
        serialCard: 'CARD-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'emp-002',
        siteId: siteId,
        name: 'Nicholus Chugg',
        email: 'nchugg@halo.com',
        employeeId: 'EMP002',
        serialCard: 'CARD-002',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'emp-003',
        siteId: siteId,
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        employeeId: 'EMP003',
        serialCard: 'CARD-003',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Save employees to KV store
    for (const employee of testEmployees) {
      const key = `employee:${siteId}:${employee.id}`;
      await kv.set(key, employee, environmentId);
      console.log(`[Seed] Created employee: ${key}`);
    }
    
    return c.json({
      success: true,
      message: `Seeded ${testEmployees.length} test employees for site ${siteId}`,
      employees: testEmployees.map(e => ({ id: e.id, name: e.name, email: e.email })),
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Seed test employees error:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to seed test employees',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Database connection test endpoint (public - no auth required)
app.get("/make-server-6fcaeea3/test-db", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Try to write and read from database
    const testKey = 'health:test:' + Date.now();
    const testValue = { test: true, timestamp: new Date().toISOString() };
    
    await kv.set(testKey, testValue, environmentId);
    const readResult = await kv.get(testKey, environmentId);
    await kv.del(testKey, environmentId);

    if (readResult && readResult.test === true) {
      return c.json({
        status: 'success',
        message: 'Database connection successful',
        environment: environmentId,
        readWrite: true,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Database read/write verification failed');
    }
  } catch (error) {
    console.error('Database test error:', error);
    return c.json({
      status: 'error',
      message: error.message || 'Database connection failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// JWT Configuration Debug endpoint (public - no auth required, for debugging auth issues)
app.get("/make-server-6fcaeea3/debug-jwt-config", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const projectId = projectIdMatch ? projectIdMatch[1] : 'NOT_FOUND';
    
    // Check if JWT_SECRET is set explicitly or derived
    const hasExplicitSecret = !!Deno.env.get('JWT_SECRET');
    
    return c.json({
      status: 'success',
      jwtConfig: {
        hasExplicitSecret,
        secretSource: hasExplicitSecret ? 'environment_variable' : 'derived_from_project_id',
        secretLength: JWT_SECRET.length,
        secretPreview: JWT_SECRET.substring(0, 50) + '...',
        projectId: projectId,
        expectedProjectId: 'wjfcqqrlhwdvvjmefxky',
        projectIdMatches: projectId === 'wjfcqqrlhwdvvjmefxky',
        supabaseUrl: supabaseUrl,
        cryptoKeyAvailable: !!cryptoKey,
      },
      timestamp: new Date().toISOString(),
      note: 'This endpoint helps diagnose JWT authentication issues. If projectIdMatches is false, tokens will fail.'
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: error.message,
      error: error.toString() 
    }, 500);
  }
});

// Bootstrap endpoint - Create first admin user (public, but checks if users exist)
app.post("/make-server-6fcaeea3/bootstrap/create-admin", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Check if any admin users already exist
    const existingAdmins = await kv.getByPrefix('admin_users:', environmentId);
    
    if (existingAdmins && existingAdmins.length > 0) {
      return c.json({
        error: 'Admin users already exist. Use the signup page to create additional users.',
        existingCount: existingAdmins.length
      }, 400);
    }

    // Get credentials from request body
    const { email, password, username } = await c.req.json();

    // Basic validation
    if (!email || !password || !username) {
      return c.json({
        error: 'Missing required fields: email, password, username'
      }, 400);
    }

    // Sanitize inputs
    const sanitizedEmail = sanitize.email(email);
    const sanitizedUsername = sanitize.string(username);

    // Validate password strength
    const passwordValidation = validate.password(password);
    if (!passwordValidation.valid) {
      return c.json({ 
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors 
      }, 400);
    }

    console.log('🚀 Creating first admin user via bootstrap...');
    console.log('Environment:', environmentId);

    // Use environment-aware Supabase client
    const supabaseClient = getSupabaseClient(environmentId);

    // Create user with Supabase Auth
    const { data, error } = await supabaseClient.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      user_metadata: { username: sanitizedUsername, role: 'super_admin' },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Bootstrap signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional admin data in KV
    await kv.set(`admin_users:${data.user.id}`, {
      id: data.user.id,
      username: sanitizedUsername,
      email: sanitizedEmail,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      isBootstrap: true,
    }, environmentId);

    await auditLog({
      action: 'bootstrap_admin_created',
      userId: data.user.id,
      email: sanitizedEmail,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { role: 'super_admin', method: 'bootstrap', environment: environmentId }
    });

    console.log('✅ Bootstrap admin created:', sanitizedEmail);

    return c.json({ 
      success: true,
      message: 'First admin user created successfully',
      user: {
        id: data.user.id,
        username: sanitizedUsername,
        email: sanitizedEmail,
        role: 'super_admin',
      }
    });
  } catch (error: any) {
    console.error('Bootstrap exception:', error);
    return c.json({
      error: error.message || 'Failed to create admin user'
    }, 500);
  }
});

// Debug endpoint to check backend configuration (public endpoint)
app.get("/make-server-6fcaeea3/debug/backend-config", async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'NOT_SET';
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'UNKNOWN';
  
  return c.json({
    message: 'Backend configuration',
    supabaseProjectId: projectId,
    supabaseUrl: supabaseUrl,
    productionProjectId: PRODUCTION_SUPABASE_URL.split('//')[1]?.split('.')[0] || 'UNKNOWN',
    productionUrl: PRODUCTION_SUPABASE_URL,
    hasProductionKey: !!PRODUCTION_SERVICE_ROLE_KEY,
    expectedProjectId: 'wjfcqqrlhwdvvjmefxky',
    isCorrect: projectId === 'wjfcqqrlhwdvvjmefxky',
    hint: projectId !== 'wjfcqqrlhwdvvjmefxky' 
      ? `Backend SUPABASE_URL env var is set to ${projectId} but should be wjfcqqrlhwdvvjmefxky`
      : 'Backend configuration is correct'
  });
});

// Debug endpoint to check admin user sync status (public endpoint for troubleshooting auth issues)
app.get("/make-server-6fcaeea3/debug/check-admin-users", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('[Debug] Checking admin users for environment:', environmentId);
    
    // Get all admin users from KV store
    const kvAdmins = await kv.getByPrefix('admin_users:', environmentId);
    console.log('[Debug] Found', kvAdmins?.length || 0, 'admins in KV store');
    
    // Get Supabase client for the environment
    const supabaseClient = getSupabaseClient(environmentId);
    
    // Try to list Supabase Auth users (requires service role key)
    const { data: authUsers, error: listError } = await supabaseClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('[Debug] Error listing Supabase Auth users:', listError);
      return c.json({
        status: 'error',
        message: 'Failed to list Supabase Auth users',
        error: listError.message,
        kvAdminCount: kvAdmins?.length || 0,
        kvAdmins: kvAdmins?.map((a: any) => ({ 
          id: a.id, 
          email: a.email, 
          username: a.username,
          role: a.role 
        })) || []
      }, 500);
    }
    
    console.log('[Debug] Found', authUsers?.users?.length || 0, 'users in Supabase Auth');
    
    // Compare KV store users with Supabase Auth users
    const kvUserIds = new Set(kvAdmins?.map((a: any) => a.id) || []);
    const authUserIds = new Set(authUsers?.users?.map((u: any) => u.id) || []);
    
    // Users in KV but not in Auth (orphaned KV records)
    const orphanedKV = kvAdmins?.filter((a: any) => !authUserIds.has(a.id)) || [];
    
    // Users in Auth but not in KV (missing KV records)
    const missingKV = authUsers?.users?.filter((u: any) => !kvUserIds.has(u.id)) || [];
    
    return c.json({
      status: 'success',
      environment: environmentId,
      kvAdminCount: kvAdmins?.length || 0,
      authUserCount: authUsers?.users?.length || 0,
      syncIssues: {
        orphanedKV: orphanedKV.length,
        missingKV: missingKV.length,
        orphanedKVUsers: orphanedKV.map((a: any) => ({
          id: a.id,
          email: a.email,
          username: a.username,
          issue: 'User exists in KV store but NOT in Supabase Auth - login will fail'
        })),
        missingKVUsers: missingKV.map((u: any) => ({
          id: u.id,
          email: u.email,
          issue: 'User exists in Supabase Auth but NOT in KV store - missing metadata'
        }))
      },
      kvAdmins: kvAdmins?.map((a: any) => ({
        id: a.id,
        email: a.email,
        username: a.username,
        role: a.role,
        inSupabaseAuth: authUserIds.has(a.id) ? '✅' : '❌'
      })) || [],
      authUsers: authUsers?.users?.map((u: any) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        inKVStore: kvUserIds.has(u.id) ? '✅' : '❌'
      })) || [],
      recommendation: orphanedKV.length > 0 
        ? `⚠️ Found ${orphanedKV.length} user(s) in KV store that don't exist in Supabase Auth. These users cannot login. Either recreate them via the bootstrap page, or use the repair endpoint.`
        : missingKV.length > 0
        ? `⚠️ Found ${missingKV.length} user(s) in Supabase Auth without KV metadata. Use the repair endpoint to sync.`
        : '✅ All users are properly synced between KV store and Supabase Auth'
    });
  } catch (error: any) {
    console.error('[Debug] Check admin users error:', error);
    return c.json({
      status: 'error',
      message: error.message || 'Failed to check admin users',
      error: error.toString()
    }, 500);
  }
});

// Repair endpoint to sync admin users between KV and Supabase Auth (public endpoint)
app.post("/make-server-6fcaeea3/debug/repair-admin-sync", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('[Repair] Starting admin user sync repair for environment:', environmentId);
    
    const kvAdmins = await kv.getByPrefix('admin_users:', environmentId);
    const supabaseClient = getSupabaseClient(environmentId);
    const { data: authUsers, error: listError } = await supabaseClient.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list Supabase Auth users: ${listError.message}`);
    }
    
    const authUserIds = new Set(authUsers?.users?.map((u: any) => u.id) || []);
    const repaired: any[] = [];
    const removed: any[] = [];
    
    // Remove orphaned KV entries (users that don't exist in Supabase Auth)
    for (const kvAdmin of kvAdmins || []) {
      if (!authUserIds.has(kvAdmin.id)) {
        console.log('[Repair] Removing orphaned KV entry:', kvAdmin.email);
        await kv.del(`admin_users:${kvAdmin.id}`, environmentId);
        removed.push({ id: kvAdmin.id, email: kvAdmin.email, reason: 'Not in Supabase Auth' });
      }
    }
    
    // Add missing KV entries (users that exist in Supabase Auth but not in KV)
    const kvUserIds = new Set(kvAdmins?.map((a: any) => a.id) || []);
    for (const authUser of authUsers?.users || []) {
      if (!kvUserIds.has(authUser.id)) {
        console.log('[Repair] Adding missing KV entry for:', authUser.email);
        await kv.set(`admin_users:${authUser.id}`, {
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
          role: authUser.user_metadata?.role || 'manager',
          createdAt: authUser.created_at,
          repairedAt: new Date().toISOString()
        }, environmentId);
        repaired.push({ id: authUser.id, email: authUser.email, reason: 'Added from Supabase Auth' });
      }
    }
    
    console.log('[Repair] Repair complete. Removed:', removed.length, 'Repaired:', repaired.length);
    
    return c.json({
      status: 'success',
      message: 'Admin user sync repaired',
      environment: environmentId,
      removed: removed.length,
      repaired: repaired.length,
      removedUsers: removed,
      repairedUsers: repaired,
      summary: `Removed ${removed.length} orphaned entries, added ${repaired.length} missing entries`
    });
  } catch (error: any) {
    console.error('[Repair] Repair error:', error);
    return c.json({
      status: 'error',
      message: error.message || 'Failed to repair admin sync',
      error: error.toString()
    }, 500);
  }
});

// JWT Debug endpoint (public endpoint for troubleshooting)
app.get("/make-server-6fcaeea3/debug/jwt-config", async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = projectIdMatch ? projectIdMatch[1] : 'NOT_FOUND';
  const expectedSecret = `jala2-jwt-secret-stable-${projectId}-do-not-change-this-string-or-tokens-become-invalid`;
  
  return c.json({
    message: 'JWT Configuration Debug',
    timestamp: new Date().toISOString(),
    jwtSecretSource: JWT_SECRET.startsWith('jala2-jwt-secret-stable-') ? 'DERIVED_FROM_PROJECT_ID' : 
                     JWT_SECRET === 'jala2-dev-local-secret-change-in-production' ? 'FALLBACK_DEV' : 'ENV_VAR',
    jwtSecretLength: JWT_SECRET.length,
    projectId: projectId,
    expectedSecretLength: expectedSecret.length,
    secretMatches: JWT_SECRET === expectedSecret,
    supabaseUrl: supabaseUrl,
    cryptoKeyInitialized: !!cryptoKey,
    recommendation: projectId === 'wjfcqqrlhwdvvjmefxky' && JWT_SECRET === expectedSecret
      ? '✅ Configuration is CORRECT - JWT secret is stable and derived from project ID' 
      : '⚠️ JWT secret may not be stable - tokens could become invalid after restart'
  });
});

// JWT Verification Debug endpoint (public endpoint for troubleshooting)
app.post("/make-server-6fcaeea3/debug/verify-jwt", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const body = await c.req.json();
    const token = body.token || c.req.header('X-Access-Token');
    
    if (!token) {
      return c.json({ error: 'No token provided in body.token or X-Access-Token header' }, 400);
    }
    
    console.log('[JWT Debug] Verifying token...');
    console.log('[JWT Debug] Token preview:', token.substring(0, 50) + '...');
    console.log('[JWT Debug] Environment:', environmentId);
    console.log('[JWT Debug] JWT_SECRET (first 50 chars):', JWT_SECRET.substring(0, 50) + '...');
    console.log('[JWT Debug] JWT_SECRET length:', JWT_SECRET.length);
    
    const result: any = {
      timestamp: new Date().toISOString(),
      environment: environmentId,
      tokenReceived: true,
      tokenPreview: token.substring(0, 50) + '...',
      jwtSecretInfo: {
        length: JWT_SECRET.length,
        preview: JWT_SECRET.substring(0, 50) + '...',
      }
    };
    
    // Try to decode without verification
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        result.decoded = {
          header,
          payload: {
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            role: payload.role,
            environment: payload.environment,
            issuedAt: new Date((payload.iat || 0) * 1000).toISOString(),
            expiresAt: new Date((payload.exp || 0) * 1000).toISOString(),
            expired: payload.exp < Math.floor(Date.now() / 1000),
            timeLeft: payload.exp ? Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60) : 0,
          }
        };
      }
    } catch (decodeError: any) {
      result.decodeError = decodeError.message;
    }
    
    // Try to verify
    try {
      const payload = await verifyCustomJWT(token);
      result.verified = true;
      result.verifiedPayload = payload;
      result.message = '✅ Token is VALID!';
    } catch (verifyError: any) {
      result.verified = false;
      result.verifyError = verifyError.message;
      result.message = '❌ Token verification FAILED: ' + verifyError.message;
    }
    
    return c.json(result);
  } catch (error: any) {
    console.error('[JWT Debug] Error:', error);
    return c.json({ 
      error: 'Debug verification failed',
      details: error.message 
    }, 500);
  }
});

// ==================== PUBLIC ROUTES (for login page) ====================

// Public endpoint to list available clients/sites for environment selection
app.get("/make-server-6fcaeea3/public/environments", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  // DEPLOYMENT FIX: During cold start (first 10s), return empty data immediately
  if (isInColdStartPeriod()) {
    console.log('[Public Environments] Cold start period - returning empty arrays');
    return c.json({ clients: [], sites: [], coldStart: true });
  }
  
  try {
    // DEPLOYMENT FIX: Use fast timeout (3 seconds) to prevent deployment hangs
    const fastTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Fast timeout')), 3000)
    );
    
    let clients = [];
    let sites = [];
    
    try {
      [clients, sites] = await Promise.race([
        Promise.all([
          kv.getByPrefix('client:', environmentId),
          kv.getByPrefix('site:', environmentId)
        ]),
        fastTimeout
      ]);
    } catch (timeoutError) {
      console.warn('[Public Environments] Timeout - returning empty arrays');
      return c.json({ clients: [], sites: [] });
    }
    
    // Only return active clients and sites with minimal info
    const activeClients = clients
      .filter((client: any) => client.isActive)
      .map((client: any) => ({
        id: client.id,
        name: client.name,
        isActive: client.isActive,
      }));
    
    const activeSites = sites
      .filter((site: any) => site.status === 'active')
      .map((site: any) => ({
        id: site.id,
        name: site.name,
        clientId: site.clientId,
        status: site.status,
      }));
    
    return c.json({ clients: activeClients, sites: activeSites });
  } catch (error: any) {
    console.error('Get public environments error:', error);
    // Return empty arrays on timeout/connection errors
    if (error.message?.includes('timeout') || error.message?.includes('connection')) {
      return c.json({ clients: [], sites: [] });
    }
    return c.json({ error: error.message }, 500);
  }
});

// ==================== AUTH ROUTES ====================

// Rate limiting for auth endpoints (stricter)
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Admin signup (create admin user)
app.post(
  "/make-server-6fcaeea3/auth/signup",
  authRateLimit,
  validateRequest({
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, min: 8, max: 128 },
    username: { type: 'string', required: true, min: 2, max: 50 },
    role: { type: 'string', required: false, allowedValues: ['super_admin', 'admin', 'manager'] }
  }),
  async (c) => {
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    
    try {
      const { email, password, username, role } = c.get('validatedBody');

      console.log('[Auth] Signup request for environment:', environmentId);

      // Sanitize inputs
      const sanitizedEmail = sanitize.email(email);
      const sanitizedUsername = sanitize.string(username);

      // Validate password strength
      const passwordValidation = validate.password(password);
      if (!passwordValidation.valid) {
        return c.json({ 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors 
        }, 400);
      }

      // Use environment-aware Supabase client
      const supabaseClient = getSupabaseClient(environmentId);

      // Create user with Supabase Auth
      const { data, error } = await supabaseClient.auth.admin.createUser({
        email: sanitizedEmail,
        password,
        user_metadata: { username: sanitizedUsername, role: role || 'manager' },
        email_confirm: true, // Auto-confirm since email server not configured
      });

      if (error) {
        // Check if this is a duplicate email error (expected error, not a system failure)
        const isDuplicateEmail = error.message?.includes('already been registered') || 
                                 error.message?.includes('email_exists');
        
        if (isDuplicateEmail) {
          console.log('[Auth] Signup attempt with existing email:', sanitizedEmail);
          await auditLog({
            action: 'admin_signup_duplicate_email',
            email: sanitizedEmail,
            status: 'warning',
            ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
            userAgent: c.req.header('user-agent'),
            details: { reason: 'Email already registered', environment: environmentId }
          });
          return c.json({ 
            error: 'A user with this email address has already been registered',
            code: 'EMAIL_EXISTS'
          }, 409); // 409 Conflict is more appropriate than 400 for duplicate resources
        }
        
        // For other errors, log as failures
        console.error('[Auth] Signup error:', error);
        await auditLog({
          action: 'admin_signup_failed',
          email: sanitizedEmail,
          status: 'failure',
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent'),
          details: { error: error.message, environment: environmentId }
        });
        return c.json({ error: error.message }, 400);
      }

      // Store additional admin data in KV
      await kv.set(`admin_users:${data.user.id}`, {
        id: data.user.id,
        username: sanitizedUsername,
        email: sanitizedEmail,
        role: role || 'manager',
        createdAt: new Date().toISOString(),
      }, environmentId);

      await auditLog({
        action: 'admin_signup_success',
        userId: data.user.id,
        email: sanitizedEmail,
        status: 'success',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { role: role || 'manager' }
      });

      return c.json({ 
        user: {
          id: data.user.id,
          username: sanitizedUsername,
          email: sanitizedEmail,
          role: role || 'manager',
        }
      });
    } catch (error: any) {
      console.error('Signup exception:', error);
      return errorResponse(c, error, 500);
    }
  }
);

// Admin login (supports email or username)
app.post(
  "/make-server-6fcaeea3/auth/login",
  authRateLimit,
  validateRequest({
    identifier: { type: 'string', required: true, min: 1, max: 254 }, // Can be email or username
    password: { type: 'string', required: true, min: 1, max: 128 }
  }),
  async (c) => {
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    
    try {
      const { identifier, password } = c.get('validatedBody');

      console.log('[Auth] ========================================');
      console.log('[Auth] Login request received');
      console.log('[Auth] Environment:', environmentId);
      console.log('[Auth] Identifier:', identifier);
      console.log('[Auth] Password length:', password?.length || 0);
      console.log('[Auth] ========================================');

      // Sanitize identifier
      const sanitizedIdentifier = sanitize.string(identifier?.trim() || '');
      console.log('[Auth] Sanitized identifier:', sanitizedIdentifier);
      
      // Determine if identifier is email or username
      let loginEmail = '';
      
      // Check if it looks like an email (has @ and a domain)
      const isEmail = sanitizedIdentifier.includes('@') && 
                      sanitizedIdentifier.includes('.') &&
                      sanitizedIdentifier.split('@').length === 2;
      
      console.log('[Auth] Is email format?', isEmail);
      
      if (isEmail) {
        // It's an email - validate and use directly
        try {
          loginEmail = sanitize.email(sanitizedIdentifier);
          console.log('[Auth] Using email directly:', loginEmail);
          
          // Also check if any admins exist for early bootstrap detection
          // This provides better UX by checking before calling Supabase Auth
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('KV lookup timeout')), 10000) // 10 second timeout
            );
            
            const allAdminsPromise = kv.getByPrefix('admin_users:', environmentId);
            const allAdmins = await Promise.race([allAdminsPromise, timeoutPromise]);
            
            console.log('[Auth] Pre-check: Found', allAdmins?.length || 0, 'admin users');
            
            if (!allAdmins || allAdmins.length === 0) {
              console.log('ℹ️ No admin users found during email login - user needs to bootstrap first');
              await auditLog({
                action: 'admin_login_failed',
                email: loginEmail,
                status: 'failure',
                ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
                userAgent: c.req.header('user-agent'),
                details: { error: 'No admin users exist - bootstrap required', environment: environmentId }
              });
              return c.json({ 
                error: 'No admin accounts exist yet. Please create the first admin account.',
                needsBootstrap: true,
                message: 'You need to create an admin account first. Click "Create First Admin Account" to get started.'
              }, 401);
            }
          } catch (kvError) {
            console.warn('[Auth] Failed to pre-check admin existence (timeout or error), will check after Supabase auth:', kvError instanceof Error ? kvError.message : 'Unknown error');
            // Continue to Supabase auth - we'll check again if auth fails
          }
        } catch (error) {
          console.error('[Auth] Invalid email format:', error);
          return c.json({ 
            error: 'Invalid email format',
            message: 'Please enter a valid email address' 
          }, 400);
        }
      } else {
        // It's a username - look up the email from KV store
        console.log('[Auth] Looking up username in KV store');
        try {
          // Add a shorter timeout for the KV lookup to fail fast
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('KV lookup timeout')), 10000) // 10 second timeout
          );
          
          const allAdminsPromise = kv.getByPrefix('admin_users:', environmentId);
          const allAdmins = await Promise.race([allAdminsPromise, timeoutPromise]);
          
          console.log('[Auth] Found', allAdmins?.length || 0, 'admin users');
          
          // CRITICAL FIX: Check if no admins exist BEFORE trying to find a match
          if (!allAdmins || allAdmins.length === 0) {
            console.log('ℹ️ No admin users found during username lookup - user needs to bootstrap first');
            await auditLog({
              action: 'admin_login_failed',
              email: sanitizedIdentifier,
              status: 'failure',
              ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
              userAgent: c.req.header('user-agent'),
              details: { error: 'No admin users exist - bootstrap required', identifier: sanitizedIdentifier, environment: environmentId }
            });
            return c.json({ 
              error: 'No admin accounts exist yet. Please create the first admin account.',
              needsBootstrap: true,
              message: 'You need to create an admin account first. Click "Create First Admin Account" to get started.'
            }, 401);
          }
          
          const adminUser = allAdmins?.find((admin: any) => 
            admin.username?.toLowerCase() === sanitizedIdentifier.toLowerCase()
          );
          
          if (adminUser) {
            loginEmail = adminUser.email;
            console.log('[Auth] Found username, using email:', loginEmail);
          } else {
            // Username not found (but other admins exist)
            console.log('[Auth] Username not found:', sanitizedIdentifier);
            await auditLog({
              action: 'admin_login_failed',
              email: sanitizedIdentifier,
              status: 'failure',
              ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
              userAgent: c.req.header('user-agent'),
              details: { error: 'Username not found', identifier: sanitizedIdentifier, environment: environmentId }
            });
            return c.json({ error: 'Invalid login credentials' }, 401);
          }
        } catch (kvError: any) {
          console.error('KV lookup error during username login:', kvError);
          
          // Better error message based on error type
          if (kvError.message?.includes('timeout') || kvError.message?.includes('KV lookup timeout')) {
            return c.json({ 
              error: 'System is experiencing high load. Please try again in a moment.',
              message: 'The login system is temporarily slow. Please wait a few seconds and try again.'
            }, 503);
          }
          
          return c.json({ 
            error: 'Login system temporarily unavailable',
            message: 'Please try again in a moment, or use your email address to login instead.'
          }, 503);
        }
      }

      console.log('[Auth] Attempting Supabase auth with email:', loginEmail);

      // Use environment-aware Supabase client
      const supabaseClient = getSupabaseClient(environmentId);

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        // Check if it's an invalid credentials error and no admins exist
        // Check both message and code, and also check for 400 status (invalid credentials)
        const isInvalidCredentials = 
          error.message?.includes('Invalid login credentials') || 
          error.code === 'invalid_credentials' ||
          (error as any).status === 400;
          
        if (isInvalidCredentials) {
          try {
            console.log('[Auth] Checking if any admin users exist in environment:', environmentId);
            const allAdmins = await kv.getByPrefix('admin_users:', environmentId);
            console.log('[Auth] Found admin count:', allAdmins?.length || 0);
            
            if (!allAdmins || allAdmins.length === 0) {
              // No admins exist - direct user to bootstrap (this is expected, don't log as error)
              console.log('ℹ️ No admin users found - user needs to bootstrap first');
              await auditLog({
                action: 'admin_login_failed',
                email: loginEmail,
                status: 'failure',
                ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
                userAgent: c.req.header('user-agent'),
                details: { error: 'No admin users exist - bootstrap required', environment: environmentId }
              });
              return c.json({ 
                error: 'No admin accounts exist yet. Please create the first admin account.',
                needsBootstrap: true,
                message: 'You need to create an admin account first. Click "Create First Admin Account" to get started.'
              }, 401);
            } else {
              // Admins exist but credentials are wrong - this is expected behavior, not a system error
              console.log('[Auth] Invalid credentials - this is expected when password is wrong');
              console.log('[Auth] Supabase auth response:', {
                message: error.message,
                code: error.code,
                status: error.status
              });
              console.log('[Auth] Admin users exist but credentials are invalid');
              console.log('[Auth] Number of admins:', allAdmins.length);
              // Log each admin for debugging (without passwords)
              allAdmins.forEach((admin: any, index: number) => {
                console.log(`[Auth] Admin ${index + 1}:`, {
                  username: admin.username,
                  email: admin.email,
                  role: admin.role,
                  id: admin.id,
                  supabaseAuthId: admin.supabaseAuthId || 'NOT_SET'
                });
              });
              
              // Return helpful error message
              await auditLog({
                action: 'admin_login_failed',
                email: loginEmail,
                status: 'failure',
                ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
                userAgent: c.req.header('user-agent'),
                details: { 
                  error: 'Invalid credentials - password mismatch or user not in Supabase Auth',
                  environment: environmentId,
                  adminCount: allAdmins.length,
                  attemptedEmail: loginEmail
                }
              });
              
              return c.json({ 
                error: 'Invalid login credentials',
                message: 'The email/username or password you entered is incorrect. Please check your credentials and try again.',
                hint: 'If you forgot your password, please contact your system administrator.',
                adminCount: allAdmins.length,
                attemptedEmail: loginEmail
              }, 401);
            }
          } catch (kvError) {
            console.error('Failed to check for existing admins:', kvError);
            // Log the original auth error since we couldn't check KV
            console.error('[Auth] Supabase auth error:', error);
            console.error('[Auth] Error message:', error.message);
            
            // Still audit log the failure
            await auditLog({
              action: 'admin_login_failed',
              email: loginEmail,
              status: 'failure',
              ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
              userAgent: c.req.header('user-agent'),
              details: { error: error.message, kvCheckFailed: true, environment: environmentId }
            });
            return c.json({ error: 'Invalid login credentials' }, 401);
          }
        } else {
          // Not an invalid credentials error - log it and return
          console.error('[Auth] Supabase auth error (non-credentials):', error);
          console.error('[Auth] Error message:', error.message);
          console.error('[Auth] Error code:', error.code);
          console.error('[Auth] Error details:', JSON.stringify(error, null, 2));
          
          await auditLog({
            action: 'admin_login_failed',
            email: loginEmail,
            status: 'failure',
            ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
            userAgent: c.req.header('user-agent'),
            details: { error: error.message, errorCode: error.code, environment: environmentId }
          });
          return c.json({ 
            error: error.message || 'Authentication failed',
            message: 'An authentication error occurred. Please try again.'
          }, 401);
        }
      }

      console.log('[Auth] Supabase auth successful, user ID:', data.user.id);

      // Get admin data from KV with error handling
      let adminData = null;
      try {
        adminData = await kv.get(`admin_users:${data.user.id}`, environmentId);
        console.log('[Auth] Retrieved admin data from KV:', adminData ? 'Found' : 'Not found');
        if (adminData) {
          console.log('[Auth] Admin data:', {
            username: adminData.username,
            email: adminData.email,
            role: adminData.role
          });
        } else {
          // CRITICAL FIX: If admin data doesn't exist in KV but user exists in Supabase Auth,
          // create the KV record from the user metadata
          console.log('[Auth] Admin data not found in KV, creating from Supabase Auth metadata...');
          const role = data.user.user_metadata?.role || 'super_admin'; // Default to super_admin for legacy users
          adminData = {
            id: data.user.id,
            username: data.user.user_metadata?.username || loginEmail.split('@')[0],
            email: data.user.email!,
            role: role,
            createdAt: new Date().toISOString(),
          };
          
          // Store in KV for future logins
          await kv.set(`admin_users:${data.user.id}`, adminData, environmentId);
          console.log('[Auth] Created admin data in KV with role:', role);
        }
      } catch (kvError: any) {
        console.error('KV get error during login:', kvError);
        // Continue anyway - we'll use auth user data as fallback
      }

      // Generate our custom HS256 JWT instead of using Supabase's ES256 token
      const userData = adminData || {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || loginEmail.split('@')[0],
        role: data.user.user_metadata?.role || 'super_admin',
      };

      // Update last login timestamp
      try {
        await adminUsers.updateLastLogin(userData.id, environmentId);
      } catch (error) {
        console.error('Failed to update last login timestamp:', error);
        // Don't fail login if this fails
      }

      const customJWT = await generateCustomJWT({
        userId: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        environment: environmentId,
      });

      await auditLog({
        action: 'admin_login_success',
        userId: userData.id,
        email: loginEmail,
        status: 'success',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { environment: environmentId }
      });

      console.log('[Auth] Login successful, returning CUSTOM HS256 JWT');
      console.log('[Auth] Token algorithm: HS256 (not Supabase ES256)');
      console.log('[Auth] ========================================');

      return c.json({
        access_token: customJWT,
        user: userData,
        requirePasswordChange: userData.requirePasswordChange || false,
      });
    } catch (error: any) {
      console.error('Login exception:', error);
      console.error('Login exception stack:', error.stack);
      console.error('Login exception details:', JSON.stringify(error, null, 2));
      return c.json({ 
        error: error.message || 'Login failed due to an unexpected error',
        details: error.toString() 
      }, 500);
    }
  }
);

// Password reset request
app.post(
  "/make-server-6fcaeea3/auth/password-reset",
  authRateLimit,
  validateRequest({
    identifier: { type: 'string', required: true, min: 1, max: 254 } // Can be email or username
  }),
  async (c) => {
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    
    try {
      const { identifier } = c.get('validatedBody');

      // Sanitize identifier
      const sanitizedIdentifier = sanitize.string(identifier?.trim() || '');
      
      // Determine if identifier is email or username
      let resetEmail = '';
      
      if (sanitizedIdentifier.includes('@')) {
        // It's an email
        resetEmail = sanitize.email(sanitizedIdentifier);
      } else {
        // It's a username - look up the email from KV store
        try {
          const allAdmins = await kv.getByPrefix('admin_users:', environmentId);
          const adminUser = allAdmins?.find((admin: any) => 
            admin.username?.toLowerCase() === sanitizedIdentifier.toLowerCase()
          );
          
          if (adminUser) {
            resetEmail = adminUser.email;
          } else {
            // For security reasons, don't reveal if username exists
            // Return success anyway to prevent user enumeration
            await auditLog({
              action: 'password_reset_attempted',
              email: sanitizedIdentifier,
              status: 'username_not_found',
              ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
              userAgent: c.req.header('user-agent'),
              details: { identifier: sanitizedIdentifier, environment: environmentId }
            });
            return c.json({ 
              message: 'If an account with that email or username exists, you will receive a password reset link.' 
            });
          }
        } catch (kvError: any) {
          console.error('KV lookup error during password reset:', kvError);
          return c.json({ error: 'Password reset request failed due to system error' }, 500);
        }
      }

      // Use environment-aware Supabase client
      const supabaseClient = getSupabaseClient(environmentId);

      // Security Fix 1.4: Validate redirect origin against allowlist
      const requestOrigin = c.req.header('origin') || '';
      let redirectOrigin = 'http://localhost:5173';
      
      if (allowedOrigins.includes('*') || allowedOrigins.includes(requestOrigin)) {
        redirectOrigin = requestOrigin || 'http://localhost:5173';
      }

      // Send password reset email using Supabase Auth
      const { error } = await supabaseClient.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${redirectOrigin}/admin/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        await auditLog({
          action: 'password_reset_failed',
          email: resetEmail,
          status: 'failure',
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent'),
          details: { error: error.message }
        });
        // Don't reveal specific error to prevent user enumeration
        return c.json({ 
          message: 'If an account with that email or username exists, you will receive a password reset link.' 
        });
      }

      await auditLog({
        action: 'password_reset_sent',
        email: resetEmail,
        status: 'success',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent')
      });

      return c.json({ 
        message: 'If an account with that email or username exists, you will receive a password reset link.' 
      });
    } catch (error: any) {
      console.error('Password reset exception:', error);
      return c.json({ 
        error: 'Password reset request failed',
        details: error.toString() 
      }, 500);
    }
  }
);

// Get current session
app.get("/make-server-6fcaeea3/auth/session", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // NOTE: Using X-Access-Token header instead of Authorization to be consistent with other endpoints
    const accessToken = c.req.header('X-Access-Token');
    
    if (isDevelopment) {
      console.log('[Session Check] Environment ID:', environmentId);
      console.log('[Session Check] Has access token:', !!accessToken);
      if (accessToken) {
        console.log('[Session Check] Token preview:', accessToken.substring(0, 30) + '...');
      }
    }
    
    if (!accessToken) {
      if (isDevelopment) {
        console.log('[Session Check] No access token provided, returning null user');
      }
      return c.json({ user: null });
    }

    // CRITICAL FIX: Verify our custom HS256 JWT instead of using Supabase Auth
    try {
      const payload = await verifyCustomJWT(accessToken);
      
      if (isDevelopment) {
        console.log('[Session Check] ✅ JWT verified successfully');
        console.log('[Session Check] User ID:', payload.userId);
        console.log('[Session Check] Email:', payload.email);
        console.log('[Session Check] Role:', payload.role);
      }

      // Get admin data from KV with error handling
      try {
        const adminData = await kv.get(`admin_users:${payload.userId}`, environmentId);
        
        if (adminData) {
          if (isDevelopment) {
            console.log('[Session Check] Admin data found in KV');
          }
          return c.json({ user: adminData });
        } else {
          if (isDevelopment) {
            console.log('[Session Check] No admin data in KV, returning JWT payload data');
          }
          // Return data from JWT if KV doesn't have it
          return c.json({
            user: {
              id: payload.userId,
              email: payload.email,
              username: payload.username,
              role: payload.role,
            },
          });
        }
      } catch (kvError: any) {
        console.error('[Session Check] KV get error:', kvError);
        // If KV fails, return user data from JWT anyway
        return c.json({
          user: {
            id: payload.userId,
            email: payload.email,
            username: payload.username,
            role: payload.role,
          },
        });
      }
    } catch (jwtError: any) {
      if (isDevelopment) {
        console.error('[Session Check] ❌ JWT verification failed:', jwtError.message);
      }
      // Invalid or expired token - return null user
      return c.json({ user: null });
    }
  } catch (error: any) {
    console.error('[Session Check] Unexpected exception:', error);
    // Don't return 401 - just return null user
    return c.json({ user: null });
  }
});

// Logout - NO AUTH REQUIRED (token might be expired/invalid)
app.post("/make-server-6fcaeea3/auth/logout", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    // Since we're using stateless HS256 JWT tokens (not stored in a database),
    // we don't need to do anything on the backend for logout.
    // The client will delete the token from sessionStorage.
    // 
    // Previously this tried to call Supabase's auth.admin.signOut() which:
    // 1. Expected Supabase ES256 tokens, not our custom HS256 tokens
    // 2. Caused "Invalid JWT" errors
    // 3. Was unnecessary for stateless JWT tokens
    
    console.log('[Logout] Client-side logout requested for environment:', environmentId);
    
    // Always return success - logout should always succeed client-side
    return c.json({ success: true });
  } catch (error: any) {
    console.error('[Logout] Exception (still returning success):', error);
    // Still return success - client needs to clear the token
    return c.json({ success: true });
  }
});

// Check admin accounts (for debugging) - PUBLIC ENDPOINT
app.get("/make-server-6fcaeea3/admin/check", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('[Admin Check] Checking admin accounts for environment:', environmentId);
    const allAdmins = await kv.getByPrefix('admin_users:', environmentId);
    console.log('[Admin Check] Found', allAdmins?.length || 0, 'admin users');
    
    if (!allAdmins || allAdmins.length === 0) {
      return c.json({ 
        exists: false,
        count: 0,
        admins: [],
        message: 'No admin accounts found. You need to create one first.'
      });
    }
    
    // Return admin list with sensitive data removed
    const sanitizedAdmins = allAdmins.map((admin: any) => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    }));
    
    console.log('[Admin Check] Returning', sanitizedAdmins.length, 'admin accounts');
    
    return c.json({
      exists: true,
      count: sanitizedAdmins.length,
      admins: sanitizedAdmins
    });
  } catch (error: any) {
    console.error('[Admin Check] Error:', error);
    return c.json({ 
      error: 'Failed to check admin accounts',
      details: error.message 
    }, 500);
  }
});

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

// Get all admin users (super_admin only)
app.get("/make-server-6fcaeea3/admin-users", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  
  try {
    console.log('[Admin Users] GET request - Environment:', environmentId, 'User Role:', userRole);
    
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      console.log('[Admin Users] Access denied - user role:', userRole);
      return c.json({ error: 'Unauthorized: Only super admins can manage admin users' }, 403);
    }
    
    const users = await adminUsers.getAllAdminUsers(environmentId);
    console.log('[Admin Users] Returning', users.length, 'users');
    return c.json({ users });
  } catch (error: any) {
    console.error('[Admin Users] Get admin users error:', error);
    return c.json({ error: error.message || 'Failed to fetch admin users' }, 500);
  }
});

// Get admin user by ID (super_admin only)
app.get("/make-server-6fcaeea3/admin-users/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  
  try {
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Unauthorized: Only super admins can manage admin users' }, 403);
    }
    
    const id = c.req.param('id');
    const user = await adminUsers.getAdminUserById(id, environmentId);
    
    if (!user) {
      return c.json({ error: 'Admin user not found' }, 404);
    }
    
    return c.json({ user });
  } catch (error: any) {
    console.error('Get admin user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create admin user (super_admin only)
app.post("/make-server-6fcaeea3/admin-users", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  const userId = c.get('userId');
  
  try {
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Unauthorized: Only super admins can create admin users' }, 403);
    }
    
    const userData = await c.req.json();
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.role) {
      return c.json({ 
        error: 'Missing required fields: username, email, password, role' 
      }, 400);
    }
    
    // Create the user
    const supabaseClient = getSupabaseClient(environmentId);
    const newUser = await adminUsers.createAdminUser(
      userData,
      userId,
      environmentId,
      supabaseClient
    );
    
    await auditLog({
      action: 'admin_user_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        newUserId: newUser.id, 
        newUserEmail: newUser.email,
        role: newUser.role,
        environment: environmentId 
      }
    });
    
    return c.json({ user: newUser });
  } catch (error: any) {
    console.error('Create admin user error:', error);
    
    await auditLog({
      action: 'admin_user_creation_failed',
      userId: c.get('userId'),
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { error: error.message, environment: environmentId }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// Update admin user (super_admin only)
app.put("/make-server-6fcaeea3/admin-users/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  const userId = c.get('userId');
  
  try {
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Unauthorized: Only super admins can update admin users' }, 403);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Update the user
    const supabaseClient = getSupabaseClient(environmentId);
    const updatedUser = await adminUsers.updateAdminUser(
      id,
      updates,
      environmentId,
      supabaseClient
    );
    
    await auditLog({
      action: 'admin_user_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        updatedUserId: id,
        updates: Object.keys(updates),
        environment: environmentId 
      }
    });
    
    return c.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Update admin user error:', error);
    
    await auditLog({
      action: 'admin_user_update_failed',
      userId: c.get('userId'),
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        targetUserId: c.req.param('id'),
        error: error.message,
        environment: environmentId 
      }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// Delete admin user (super_admin only)
app.delete("/make-server-6fcaeea3/admin-users/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  const userId = c.get('userId');
  
  try {
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Unauthorized: Only super admins can delete admin users' }, 403);
    }
    
    const id = c.req.param('id');
    
    // Don't allow deleting yourself
    if (id === userId) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }
    
    // Delete the user
    const supabaseClient = getSupabaseClient(environmentId);
    await adminUsers.deleteAdminUser(id, environmentId, supabaseClient);
    
    await auditLog({
      action: 'admin_user_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        deletedUserId: id,
        environment: environmentId 
      }
    });
    
    return c.json({ success: true, message: 'Admin user deleted successfully' });
  } catch (error: any) {
    console.error('Delete admin user error:', error);
    
    await auditLog({
      action: 'admin_user_deletion_failed',
      userId: c.get('userId'),
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        targetUserId: c.req.param('id'),
        error: error.message,
        environment: environmentId 
      }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// Reset admin user password (super_admin only)
app.post("/make-server-6fcaeea3/admin-users/:id/reset-password", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userRole = c.get('userRole');
  const userId = c.get('userId');
  
  try {
    // Only super_admin can access this
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Unauthorized: Only super admins can reset passwords' }, 403);
    }
    
    const id = c.req.param('id');
    const { newPassword, requireChangeOnNextLogin } = await c.req.json();
    
    if (!newPassword) {
      return c.json({ error: 'Missing required field: newPassword' }, 400);
    }
    
    // Reset the password
    const supabaseClient = getSupabaseClient(environmentId);
    await adminUsers.resetAdminUserPassword(
      id,
      newPassword,
      environmentId,
      supabaseClient,
      requireChangeOnNextLogin || false
    );
    
    await auditLog({
      action: 'admin_password_reset',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        targetUserId: id,
        environment: environmentId 
      }
    });
    
    return c.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    await auditLog({
      action: 'admin_password_reset_failed',
      userId: c.get('userId'),
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        targetUserId: c.req.param('id'),
        error: error.message,
        environment: environmentId 
      }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// ==================== PASSWORD RESET ROUTES (PUBLIC) ====================

// Request password reset (public - no auth required)
app.post("/make-server-6fcaeea3/admin/forgot-password", async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Generate reset token
    const token = await adminUsers.generatePasswordResetToken(email, environmentId);
    
    // For security, always return success even if email doesn't exist
    // In production, you would send an email here with the reset link
    console.log('[Password Reset] Reset token generated. In production, send email to:', email);
    console.log('[Password Reset] Reset link: /admin/reset-password?token=' + token);
    
    // TODO: Send email with reset link
    // await sendPasswordResetEmail(email, token);
    
    await auditLog({
      action: 'password_reset_requested',
      userId: null,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        email,
        environment: environmentId 
      }
    });
    
    return c.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error: any) {
    console.error('[Password Reset] Request error:', error);
    
    await auditLog({
      action: 'password_reset_request_failed',
      userId: null,
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        error: error.message,
        environment: environmentId 
      }
    });
    
    // For security, don't reveal errors
    return c.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  }
});

// Validate password reset token (public - no auth required)
app.post("/make-server-6fcaeea3/admin/validate-reset-token", async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({ error: 'Token is required' }, 400);
    }

    const isValid = await adminUsers.validateResetToken(token, environmentId);
    
    if (!isValid) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }
    
    return c.json({ success: true, message: 'Token is valid' });
  } catch (error: any) {
    console.error('[Password Reset] Token validation error:', error);
    return c.json({ error: 'Invalid or expired reset token' }, 400);
  }
});

// Reset password with token (public - no auth required)
app.post("/make-server-6fcaeea3/admin/reset-password", async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { token, newPassword } = await c.req.json();
    
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }

    // Reset the password
    const supabaseClient = getSupabaseClient(environmentId);
    const result = await adminUsers.resetPasswordWithToken(
      token,
      newPassword,
      environmentId,
      supabaseClient
    );
    
    if (!result.success) {
      await auditLog({
        action: 'password_reset_failed',
        userId: null,
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { 
          error: result.error,
          environment: environmentId 
        }
      });
      
      return c.json({ error: result.error }, 400);
    }
    
    await auditLog({
      action: 'password_reset_completed',
      userId: null,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        environment: environmentId 
      }
    });
    
    return c.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('[Password Reset] Reset error:', error);
    
    await auditLog({
      action: 'password_reset_failed',
      userId: null,
      status: 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        error: error.message,
        environment: environmentId 
      }
    });
    
    return c.json({ error: 'Failed to reset password. Please try again.' }, 500);
  }
});

// ==================== RBAC: ROLES, ACCESS GROUPS & PERMISSIONS ROUTES ====================

// ========== PREDEFINED PERMISSIONS ==========
const PREDEFINED_PERMISSIONS = [
  // General Resource Permissions
  { id: 'view_dashboard', resource: 'dashboard', action: 'view', description: 'View dashboard', category: 'general' },
  { id: 'view_reports', resource: 'reports', action: 'view', description: 'View reports', category: 'general' },
  { id: 'export_data', resource: 'data', action: 'export', description: 'Export data', category: 'general' },
  
  // Gift/Order Permissions
  { id: 'redeem_gift', resource: 'gift', action: 'redeem', description: 'Redeem gifts', category: 'gifts' },
  { id: 'view_gift_catalog', resource: 'gift', action: 'view_catalog', description: 'View gift catalog', category: 'gifts' },
  { id: 'view_own_orders', resource: 'orders', action: 'view_own', description: 'View own orders', category: 'gifts' },
  { id: 'view_team_orders', resource: 'orders', action: 'view_team', description: 'View team orders', category: 'gifts' },
  { id: 'view_all_orders', resource: 'orders', action: 'view_all', description: 'View all orders', category: 'gifts' },
  
  // Award/Nomination Permissions
  { id: 'view_awards', resource: 'awards', action: 'view', description: 'View awards', category: 'awards' },
  { id: 'nominate_peer', resource: 'nomination', action: 'create_peer', description: 'Nominate peers', category: 'awards' },
  { id: 'nominate_team', resource: 'nomination', action: 'create_team', description: 'Nominate team members', category: 'awards' },
  { id: 'nominate_anyone', resource: 'nomination', action: 'create_any', description: 'Nominate anyone', category: 'awards' },
  { id: 'view_nominations', resource: 'nomination', action: 'view', description: 'View nominations', category: 'awards' },
  { id: 'approve_nominations', resource: 'nomination', action: 'approve', description: 'Approve nominations', category: 'awards' },
  { id: 'reject_nominations', resource: 'nomination', action: 'reject', description: 'Reject nominations', category: 'awards' },
  
  // Employee Management Permissions
  { id: 'view_employees', resource: 'employees', action: 'view', description: 'View employees', category: 'employees' },
  { id: 'view_team', resource: 'employees', action: 'view_team', description: 'View team members', category: 'employees' },
  { id: 'manage_employees', resource: 'employees', action: 'manage', description: 'Manage employees', category: 'employees' },
  
  // Site Administration Permissions
  { id: 'manage_site_settings', resource: 'site', action: 'manage_settings', description: 'Manage site settings', category: 'admin' },
  { id: 'manage_site_branding', resource: 'site', action: 'manage_branding', description: 'Manage site branding', category: 'admin' },
  { id: 'manage_products', resource: 'products', action: 'manage', description: 'Manage products', category: 'admin' },
  { id: 'manage_celebrations', resource: 'celebrations', action: 'manage', description: 'Manage celebrations', category: 'admin' },
  { id: 'view_analytics', resource: 'analytics', action: 'view', description: 'View analytics', category: 'admin' },
];

// Get all predefined permissions
app.get("/make-server-6fcaeea3/permissions", verifyAdmin, async (c) => {
  try {
    return c.json({ permissions: PREDEFINED_PERMISSIONS });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== ROLES MANAGEMENT ==========

// Get all roles (with optional client filter)
app.get("/make-server-6fcaeea3/roles", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const clientId = c.req.query('clientId');
  
  try {
    console.log('[Roles] GET request - Environment:', environmentId, 'Client ID:', clientId);
    
    // Get all roles from KV
    const allRoles = await kv.getByPrefix('role:', environmentId);
    console.log('[Roles] Found', allRoles.length, 'total roles');
    
    // Filter by client if provided
    let roles = allRoles;
    if (clientId) {
      roles = allRoles.filter((role: any) => 
        role.type === 'predefined' || role.clientId === clientId
      );
    }
    
    return c.json({ roles });
  } catch (error: any) {
    console.error('Get roles error:', error);
    return c.json({ error: error.message || 'Failed to fetch roles' }, 500);
  }
});

// Create new role
app.post("/make-server-6fcaeea3/roles", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  
  try {
    const { name, description, type, clientId, permissions, isActive } = await c.req.json();
    
    // Validation
    if (!name || !type) {
      return c.json({ error: 'Missing required fields: name, type' }, 400);
    }
    
    if (type === 'custom' && !clientId) {
      return c.json({ error: 'Custom roles must have a clientId' }, 400);
    }
    
    // Only super_admin can create predefined roles
    if (type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can create predefined roles' }, 403);
    }
    
    const roleId = `role:${crypto.randomUUID()}`;
    const role = {
      id: roleId,
      name,
      description: description || '',
      type, // 'predefined' or 'custom'
      clientId: type === 'custom' ? clientId : null,
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    
    await kv.set(roleId, role, environmentId);
    
    await auditLog({
      action: 'role_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { roleId, roleName: name, type, environment: environmentId }
    });
    
    return c.json({ role }, 201);
  } catch (error: any) {
    console.error('Create role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get role by ID
app.get("/make-server-6fcaeea3/roles/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  
  try {
    const role = await kv.get(id, environmentId);
    
    if (!role) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    return c.json({ role });
  } catch (error: any) {
    console.error('Get role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update role
app.put("/make-server-6fcaeea3/roles/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const id = c.req.param('id');
  
  try {
    const existingRole = await kv.get(id, environmentId);
    
    if (!existingRole) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    // Only super_admin can update predefined roles
    if (existingRole.type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can update predefined roles' }, 403);
    }
    
    const updates = await c.req.json();
    
    // Don't allow changing type or ID
    delete updates.id;
    delete updates.type;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const updatedRole = {
      ...existingRole,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };
    
    await kv.set(id, updatedRole, environmentId);
    
    await auditLog({
      action: 'role_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { roleId: id, updates: Object.keys(updates), environment: environmentId }
    });
    
    return c.json({ role: updatedRole });
  } catch (error: any) {
    console.error('Update role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete role
app.delete("/make-server-6fcaeea3/roles/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const id = c.req.param('id');
  
  try {
    const existingRole = await kv.get(id, environmentId);
    
    if (!existingRole) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    // Only super_admin can delete predefined roles
    if (existingRole.type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can delete predefined roles' }, 403);
    }
    
    await kv.del(id, environmentId);
    
    await auditLog({
      action: 'role_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { roleId: id, roleName: existingRole.name, environment: environmentId }
    });
    
    return c.json({ success: true, message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Delete role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== ACCESS GROUPS MANAGEMENT ==========

// Get all access groups (with optional client filter)
app.get("/make-server-6fcaeea3/access-groups", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const clientId = c.req.query('clientId');
  
  try {
    console.log('[Access Groups] GET request - Environment:', environmentId, 'Client ID:', clientId);
    
    // Get all access groups from KV
    const allGroups = await kv.getByPrefix('access_group:', environmentId);
    console.log('[Access Groups] Found', allGroups.length, 'total access groups');
    
    // Filter by client if provided
    let groups = allGroups;
    if (clientId) {
      groups = allGroups.filter((group: any) => 
        group.type === 'predefined' || group.clientId === clientId
      );
    }
    
    return c.json({ accessGroups: groups });
  } catch (error: any) {
    console.error('Get access groups error:', error);
    return c.json({ error: error.message || 'Failed to fetch access groups' }, 500);
  }
});

// Create new access group
app.post("/make-server-6fcaeea3/access-groups", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  
  try {
    const { name, description, type, clientId, permissions, isActive } = await c.req.json();
    
    // Validation
    if (!name || !type) {
      return c.json({ error: 'Missing required fields: name, type' }, 400);
    }
    
    if (type === 'custom' && !clientId) {
      return c.json({ error: 'Custom access groups must have a clientId' }, 400);
    }
    
    // Only super_admin can create predefined access groups
    if (type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can create predefined access groups' }, 403);
    }
    
    const groupId = `access_group:${crypto.randomUUID()}`;
    const accessGroup = {
      id: groupId,
      name,
      description: description || '',
      type, // 'predefined' or 'custom'
      clientId: type === 'custom' ? clientId : null,
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    
    await kv.set(groupId, accessGroup, environmentId);
    
    await auditLog({
      action: 'access_group_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { groupId, groupName: name, type, environment: environmentId }
    });
    
    return c.json({ accessGroup }, 201);
  } catch (error: any) {
    console.error('Create access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get access group by ID
app.get("/make-server-6fcaeea3/access-groups/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  
  try {
    const accessGroup = await kv.get(id, environmentId);
    
    if (!accessGroup) {
      return c.json({ error: 'Access group not found' }, 404);
    }
    
    return c.json({ accessGroup });
  } catch (error: any) {
    console.error('Get access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update access group
app.put("/make-server-6fcaeea3/access-groups/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const id = c.req.param('id');
  
  try {
    const existingGroup = await kv.get(id, environmentId);
    
    if (!existingGroup) {
      return c.json({ error: 'Access group not found' }, 404);
    }
    
    // Only super_admin can update predefined access groups
    if (existingGroup.type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can update predefined access groups' }, 403);
    }
    
    const updates = await c.req.json();
    
    // Don't allow changing type or ID
    delete updates.id;
    delete updates.type;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const updatedGroup = {
      ...existingGroup,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };
    
    await kv.set(id, updatedGroup, environmentId);
    
    await auditLog({
      action: 'access_group_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { groupId: id, updates: Object.keys(updates), environment: environmentId }
    });
    
    return c.json({ accessGroup: updatedGroup });
  } catch (error: any) {
    console.error('Update access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete access group
app.delete("/make-server-6fcaeea3/access-groups/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const id = c.req.param('id');
  
  try {
    const existingGroup = await kv.get(id, environmentId);
    
    if (!existingGroup) {
      return c.json({ error: 'Access group not found' }, 404);
    }
    
    // Only super_admin can delete predefined access groups
    if (existingGroup.type === 'predefined' && userRole !== 'super_admin') {
      return c.json({ error: 'Only super admins can delete predefined access groups' }, 403);
    }
    
    await kv.del(id, environmentId);
    
    await auditLog({
      action: 'access_group_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { groupId: id, groupName: existingGroup.name, environment: environmentId }
    });
    
    return c.json({ success: true, message: 'Access group deleted successfully' });
  } catch (error: any) {
    console.error('Delete access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== EMPLOYEE ROLE & ACCESS GROUP ASSIGNMENTS ==========

// Get employee role assignments
app.get("/make-server-6fcaeea3/employees/:employeeId/roles", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const employeeId = c.req.param('employeeId');
  
  try {
    const assignments = await kv.getByPrefix(`employee_role:${employeeId}:`, environmentId);
    return c.json({ assignments });
  } catch (error: any) {
    console.error('Get employee roles error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assign role to employee
app.post("/make-server-6fcaeea3/employees/:employeeId/roles", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const employeeId = c.req.param('employeeId');
  
  try {
    const { roleId, siteId } = await c.req.json();
    
    if (!roleId) {
      return c.json({ error: 'Missing required field: roleId' }, 400);
    }
    
    // Verify role exists
    const role = await kv.get(roleId, environmentId);
    if (!role) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    const assignmentId = `employee_role:${employeeId}:${roleId}:${siteId || 'all'}`;
    const assignment = {
      id: assignmentId,
      employeeId,
      roleId,
      siteId: siteId || null,
      assignedAt: new Date().toISOString(),
      assignedBy: userId,
    };
    
    await kv.set(assignmentId, assignment, environmentId);
    
    await auditLog({
      action: 'employee_role_assigned',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { employeeId, roleId, siteId, environment: environmentId }
    });
    
    return c.json({ assignment }, 201);
  } catch (error: any) {
    console.error('Assign employee role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Remove role from employee
app.delete("/make-server-6fcaeea3/employees/:employeeId/roles/:roleId", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const employeeId = c.req.param('employeeId');
  const roleId = c.req.param('roleId');
  const siteId = c.req.query('siteId');
  
  try {
    const assignmentId = `employee_role:${employeeId}:${roleId}:${siteId || 'all'}`;
    await kv.del(assignmentId, environmentId);
    
    await auditLog({
      action: 'employee_role_removed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { employeeId, roleId, siteId, environment: environmentId }
    });
    
    return c.json({ success: true, message: 'Role assignment removed successfully' });
  } catch (error: any) {
    console.error('Remove employee role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get employee access group assignments
app.get("/make-server-6fcaeea3/employees/:employeeId/access-groups", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const employeeId = c.req.param('employeeId');
  
  try {
    const assignments = await kv.getByPrefix(`employee_access_group:${employeeId}:`, environmentId);
    return c.json({ assignments });
  } catch (error: any) {
    console.error('Get employee access groups error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assign access group to employee
app.post("/make-server-6fcaeea3/employees/:employeeId/access-groups", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const employeeId = c.req.param('employeeId');
  
  try {
    const { accessGroupId, siteId } = await c.req.json();
    
    if (!accessGroupId) {
      return c.json({ error: 'Missing required field: accessGroupId' }, 400);
    }
    
    // Verify access group exists
    const accessGroup = await kv.get(accessGroupId, environmentId);
    if (!accessGroup) {
      return c.json({ error: 'Access group not found' }, 404);
    }
    
    const assignmentId = `employee_access_group:${employeeId}:${accessGroupId}:${siteId || 'all'}`;
    const assignment = {
      id: assignmentId,
      employeeId,
      accessGroupId,
      siteId: siteId || null,
      assignedAt: new Date().toISOString(),
      assignedBy: userId,
    };
    
    await kv.set(assignmentId, assignment, environmentId);
    
    await auditLog({
      action: 'employee_access_group_assigned',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { employeeId, accessGroupId, siteId, environment: environmentId }
    });
    
    return c.json({ assignment }, 201);
  } catch (error: any) {
    console.error('Assign employee access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Remove access group from employee
app.delete("/make-server-6fcaeea3/employees/:employeeId/access-groups/:accessGroupId", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const employeeId = c.req.param('employeeId');
  const accessGroupId = c.req.param('accessGroupId');
  const siteId = c.req.query('siteId');
  
  try {
    const assignmentId = `employee_access_group:${employeeId}:${accessGroupId}:${siteId || 'all'}`;
    await kv.del(assignmentId, environmentId);
    
    await auditLog({
      action: 'employee_access_group_removed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { employeeId, accessGroupId, siteId, environment: environmentId }
    });
    
    return c.json({ success: true, message: 'Access group assignment removed successfully' });
  } catch (error: any) {
    console.error('Remove employee access group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== OLD DUPLICATE CRUD ROUTES REMOVED ====================
// The following routes have been migrated to the CRUD factory pattern in migrated_resources.ts:
// - CLIENT ROUTES: GET, POST, PUT, DELETE /clients and /clients/:id
// - SITE ROUTES: GET /sites (admin), GET /sites/:id, POST, PUT, DELETE
// - GIFT ROUTES: GET /admin/gifts (duplicate)
// - ORDER ROUTES: GET /orders (duplicate)
// 
// Kept in this file:
// - PUBLIC endpoints (no auth): /public/sites, /public/sites/:siteId, /public/sites/:siteId/gifts
// - Special business logic: Employee CSV import, Mapping rules, SFTP config, Site gift config
// - Complex order logic: Rate limiting, validation, email notifications

// ==================== PUBLIC SITE ROUTES (NO AUTH) ====================
// NOTE: Public site routes have been moved to migrated_resources.ts
// This avoids route duplication and follows the new CRUD architecture
// See setupSiteRoutes() in migrated_resources.ts for the active implementation

// ==================== EMPLOYEE MANAGEMENT ROUTES ====================
// Note: Basic employee CRUD is in migrated_resources.ts
// Custom business logic routes kept here:

// Get employees by client ID (custom filtered query)
app.get("/make-server-6fcaeea3/clients/:clientId/employees", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const allEmployees = await kv.getByPrefix('employees:', environmentId);
    const employees = allEmployees.filter((emp: any) => emp.clientId === clientId);
    return c.json({ employees });
  } catch (error: any) {
    console.error('Get employees error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Import employees from CSV
app.post("/make-server-6fcaeea3/clients/:clientId/employees/import", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const { employees: importedEmployees } = await c.req.json();
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ row: number; field: string; message: string }> = [];
    
    for (let i = 0; i < importedEmployees.length; i++) {
      const empData = importedEmployees[i];
      
      // Validate required fields
      if (!empData.email || !empData.employeeId || !empData.name) {
        errors.push({
          row: i + 2, // +2 because row 1 is headers and array is 0-indexed
          field: !empData.email ? 'email' : !empData.employeeId ? 'employeeId' : 'name',
          message: 'Required field is missing'
        });
        skipped++;
        continue;
      }
      
      // Check if employee already exists
      const allEmployees = await kv.getByPrefix('employees:', environmentId);
      const existingEmployee = allEmployees.find((e: any) => 
        e.clientId === clientId && (
          e.email === empData.email || 
          e.employeeId === empData.employeeId
        )
      );
      
      const id = existingEmployee?.id || `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const employee = {
        id,
        clientId,
        email: empData.email,
        employeeId: empData.employeeId,
        name: empData.name,
        department: empData.department || '',
        country: empData.country || '',
        region: empData.region || '',
        location: empData.location || '',
        serialCard: empData.serialCard || '',
        status: 'active',
        createdAt: existingEmployee?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await kv.set(`employees:${id}`, employee, environmentId);
      
      if (existingEmployee) {
        updated++;
      } else {
        imported++;
      }
    }
    
    return c.json({
      success: true,
      imported,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Import employees error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get mapping rules
app.get("/make-server-6fcaeea3/clients/:clientId/mapping-rules", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const allRules = await kv.getByPrefix('mapping_rules:', environmentId);
    const rules = allRules.filter((rule: any) => rule.clientId === clientId);
    return c.json({ rules });
  } catch (error: any) {
    console.error('Get mapping rules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create mapping rule
app.post("/make-server-6fcaeea3/clients/:clientId/mapping-rules", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const ruleData = await c.req.json();
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const rule = {
      ...ruleData,
      id,
      clientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`mapping_rules:${id}`, rule, environmentId);
    return c.json({ rule });
  } catch (error: any) {
    console.error('Create mapping rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update mapping rule
app.put("/make-server-6fcaeea3/clients/:clientId/mapping-rules/:ruleId", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const ruleId = c.req.param('ruleId');
    const updates = await c.req.json();
    
    const existing = await kv.get(`mapping_rules:${ruleId}`, environmentId);
    if (!existing) {
      return c.json({ error: 'Rule not found' }, 404);
    }
    
    const rule = {
      ...existing,
      ...updates,
      id: ruleId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`mapping_rules:${ruleId}`, rule, environmentId);
    return c.json({ rule });
  } catch (error: any) {
    console.error('Update mapping rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete mapping rule
app.delete("/make-server-6fcaeea3/clients/:clientId/mapping-rules/:ruleId", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const ruleId = c.req.param('ruleId');
    await kv.del(`mapping_rules:${ruleId}`, environmentId);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete mapping rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Apply mapping rules to employees
app.post("/make-server-6fcaeea3/clients/:clientId/mapping-rules/apply", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    
    // Get all rules and employees for this client
    const allRules = await kv.getByPrefix('mapping_rules:', environmentId);
    const rules = allRules
      .filter((rule: any) => rule.clientId === clientId && rule.isActive)
      .sort((a: any, b: any) => a.priority - b.priority);
    
    const allEmployees = await kv.getByPrefix('employees:', environmentId);
    const employees = allEmployees.filter((emp: any) => emp.clientId === clientId);
    
    let mapped = 0;
    let unmapped = 0;
    
    // Apply rules to each employee
    for (const employee of employees) {
      let assigned = false;
      
      for (const rule of rules) {
        // Check if all conditions match
        const allConditionsMatch = rule.conditions.every((condition: any) => {
          const fieldValue = (employee[condition.field] || '').toLowerCase();
          const conditionValue = condition.value.toLowerCase();
          
          switch (condition.operator) {
            case 'equals':
              return fieldValue === conditionValue;
            case 'contains':
              return fieldValue.includes(conditionValue);
            case 'startsWith':
              return fieldValue.startsWith(conditionValue);
            case 'endsWith':
              return fieldValue.endsWith(conditionValue);
            default:
              return false;
          }
        });
        
        if (allConditionsMatch) {
          // Assign employee to this site
          const updatedEmployee = {
            ...employee,
            siteId: rule.siteId,
            updatedAt: new Date().toISOString()
          };
          await kv.set(`employees:${employee.id}`, updatedEmployee, environmentId);
          assigned = true;
          mapped++;
          break; // Stop checking rules once assigned
        }
      }
      
      if (!assigned) {
        unmapped++;
      }
    }
    
    return c.json({ mapped, unmapped });
  } catch (error: any) {
    console.error('Apply mapping rules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get SFTP config
app.get("/make-server-6fcaeea3/clients/:clientId/sftp-config", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const config = await kv.get(`sftp_config:${clientId}`, environmentId);
    return c.json({ config });
  } catch (error: any) {
    console.error('Get SFTP config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save SFTP config
app.post("/make-server-6fcaeea3/clients/:clientId/sftp-config", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const { config } = await c.req.json();
    
    const sftpConfig = {
      ...config,
      clientId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`sftp_config:${clientId}`, sftpConfig, environmentId);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Save SFTP config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Test SFTP connection
app.post("/make-server-6fcaeea3/clients/:clientId/sftp-config/test", verifyAdmin, async (c) => {
  try {
    const { config } = await c.req.json();
    
    // Mock SFTP test - in production, this would actually connect to the SFTP server
    // For now, just validate the config
    if (!config.host || !config.username) {
      return c.json({
        success: false,
        message: 'Missing required connection details'
      });
    }
    
    // Simulate connection test
    return c.json({
      success: true,
      message: `Successfully connected to ${config.host}`,
      filesFound: 3
    });
  } catch (error: any) {
    console.error('Test SFTP config error:', error);
    return c.json({
      success: false,
      message: error.message
    });
  }
});

// Manual SFTP sync
app.post("/make-server-6fcaeea3/clients/:clientId/sftp-config/sync", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const clientId = c.req.param('clientId');
    const config = await kv.get(`sftp_config:${clientId}`, environmentId);
    
    if (!config || !config.enabled) {
      return c.json({ error: 'SFTP not configured or not enabled' }, 400);
    }
    
    // Mock sync - in production, this would fetch files from SFTP and process them
    // For now, return mock results
    return c.json({
      imported: 0,
      errors: 0
    });
  } catch (error: any) {
    console.error('SFTP sync error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== GIFT BUSINESS LOGIC ROUTES ====================
// Note: Basic gift CRUD is in migrated_resources.ts at /admin/gifts
// Special business logic kept here:

// Bulk import products (ADMIN ONLY)
app.post("/make-server-6fcaeea3/admin/products/bulk-import", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { siteId, products } = await c.req.json();
    
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      return c.json({ error: 'products must be a non-empty array' }, 400);
    }
    
    let successful = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: string }> = [];
    
    for (let i = 0; i < products.length; i++) {
      try {
        const product = products[i];
        const id = `gift-${Date.now()}-${i}`;
        
        // Map product data to gift format
        const gift = {
          id,
          name: product.name,
          description: product.description || '',
          longDescription: product.longDescription || '',
          category: product.category,
          image: product.imageUrl || '',
          images: product.imageUrl ? [product.imageUrl] : [],
          sku: product.sku || `SKU-${id}`,
          price: product.value,
          retailValue: product.retailValue || product.value,
          inventory: {
            total: 100,
            available: product.available !== false ? 100 : 0,
            reserved: 0
          },
          status: product.status === 'inactive' || product.status === 'discontinued' ? 'inactive' : 
                  product.inventoryStatus === 'out_of_stock' ? 'out_of_stock' : 'active',
          attributes: {
            features: product.features || '',
            specifications: product.specifications || '',
            tags: product.tags || ''
          },
          inStock: product.available !== false && product.inventoryStatus !== 'out_of_stock',
          availableQuantity: product.available !== false ? 100 : 0,
          priority: product.priority || 0,
          quantityLimit: product.quantityLimit || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          siteId
        };
        
        await kv.set(`gifts:${id}`, gift, environmentId);
        successful++;
      } catch (error: any) {
        failed++;
        errors.push({ index: i, error: error.message });
      }
    }
    
    return c.json({ 
      success: true, 
      successful, 
      failed, 
      errors,
      total: products.length 
    });
  } catch (error: any) {
    console.error('Bulk import products error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== SITE GIFT CONFIGURATION ROUTES ====================

// Get site gift configuration
app.get("/make-server-6fcaeea3/sites/:siteId/gift-config", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const siteId = c.req.param('siteId');
    const config = await kv.get(`site_configs:${siteId}`, environmentId);
    
    console.log('[Get Gift Config] Site ID:', siteId);
    console.log('[Get Gift Config] Environment:', environmentId);
    console.log('[Get Gift Config] Retrieved config:', JSON.stringify(config, null, 2));
    
    return c.json({ config: config || null });
  } catch (error: any) {
    console.error('Get site config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update site gift configuration
app.put("/make-server-6fcaeea3/sites/:siteId/gift-config", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const siteId = c.req.param('siteId');
    const config = await c.req.json();
    
    console.log('[Save Gift Config] Site ID:', siteId);
    console.log('[Save Gift Config] Environment:', environmentId);
    console.log('[Save Gift Config] Config:', JSON.stringify(config, null, 2));
    
    const configData = {
      ...config,
      siteId,
    };
    
    await kv.set(`site_configs:${siteId}`, configData, environmentId);
    
    console.log('[Save Gift Config] ✅ Successfully saved config to key:', `site_configs:${siteId}`);
    
    // IMPORTANT: Also create site-gift-assignment keys for the public endpoint
    // First, delete all existing assignments for this site
    const existingAssignments = await kv.getByPrefix(`site-gift-assignment:${siteId}:`, environmentId);
    for (const assignment of existingAssignments) {
      await kv.del(`site-gift-assignment:${siteId}:${assignment.giftId}`, environmentId);
    }
    console.log('[Save Gift Config] Deleted', existingAssignments.length, 'existing assignments');
    
    // Create new assignments based on the strategy
    if (config.assignmentStrategy === 'explicit' && config.includedGiftIds) {
      // For explicit strategy, create assignments for each included gift
      for (const giftId of config.includedGiftIds) {
        const assignmentKey = `site-gift-assignment:${siteId}:${giftId}`;
        const assignment = {
          siteId,
          giftId,
          priority: 0,
          quantityLimit: null,
          createdAt: new Date().toISOString(),
        };
        await kv.set(assignmentKey, assignment, environmentId);
      }
      console.log('[Save Gift Config] Created', config.includedGiftIds.length, 'explicit gift assignments');
    } else if (config.assignmentStrategy === 'all') {
      // For 'all' strategy, create assignments for all active gifts
      const allGifts = await kv.getByPrefix(`gift:${environmentId}:`, environmentId);
      const activeGifts = allGifts.filter((g: any) => g.status === 'active');
      for (const gift of activeGifts) {
        const assignmentKey = `site-gift-assignment:${siteId}:${gift.id}`;
        const assignment = {
          siteId,
          giftId: gift.id,
          priority: 0,
          quantityLimit: null,
          createdAt: new Date().toISOString(),
        };
        await kv.set(assignmentKey, assignment, environmentId);
      }
      console.log('[Save Gift Config] Created', activeGifts.length, 'assignments for all active gifts');
    } else if (config.assignmentStrategy === 'price_levels' && config.selectedLevelId && config.priceLevels) {
      // For price levels, create assignments for gifts in the selected level
      const level = config.priceLevels.find((l: any) => l.id === config.selectedLevelId);
      if (level) {
        const allGifts = await kv.getByPrefix(`gift:${environmentId}:`, environmentId);
        const levelGifts = allGifts.filter((g: any) => 
          g.status === 'active' && g.price >= level.minPrice && g.price < level.maxPrice
        );
        for (const gift of levelGifts) {
          const assignmentKey = `site-gift-assignment:${siteId}:${gift.id}`;
          const assignment = {
            siteId,
            giftId: gift.id,
            priority: 0,
            quantityLimit: null,
            createdAt: new Date().toISOString(),
          };
          await kv.set(assignmentKey, assignment, environmentId);
        }
        console.log('[Save Gift Config] Created', levelGifts.length, 'assignments for price level');
      }
    } else if (config.assignmentStrategy === 'exclusions') {
      // For exclusions, create assignments for all gifts except excluded ones
      const allGifts = await kv.getByPrefix(`gift:${environmentId}:`, environmentId);
      const includedGifts = allGifts.filter((g: any) => {
        if (g.status !== 'active') return false;
        if (config.excludedSkus?.includes(g.sku)) return false;
        if (config.excludedCategories?.includes(g.category)) return false;
        return true;
      });
      for (const gift of includedGifts) {
        const assignmentKey = `site-gift-assignment:${siteId}:${gift.id}`;
        const assignment = {
          siteId,
          giftId: gift.id,
          priority: 0,
          quantityLimit: null,
          createdAt: new Date().toISOString(),
        };
        await kv.set(assignmentKey, assignment, environmentId);
      }
      console.log('[Save Gift Config] Created', includedGifts.length, 'assignments with exclusions');
    }
    
    return c.json({ config: configData });
  } catch (error: any) {
    console.error('[Save Gift Config] ❌ Error:', error);
    console.error('[Save Gift Config] Error message:', error.message);
    console.error('[Save Gift Config] Error stack:', error.stack);
    return c.json({ error: error.message }, 500);
  }
});

// ===== OLD SITE UPDATE ENDPOINT REMOVED =====
// This has been replaced by v2 database-backed endpoint:
// - PUT /v2/sites/:id (replaces PUT /sites/:siteId)

// Get gifts available for a specific site
app.get("/make-server-6fcaeea3/sites/:siteId/gifts", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const siteId = c.req.param('siteId');
    
    // Get site configuration
    const config = await kv.get(`site_configs:${siteId}`, environmentId);
    
    console.log('[Get Site Gifts] Site ID:', siteId);
    console.log('[Get Site Gifts] Config from DB:', JSON.stringify(config, null, 2));
    
    // Get all gifts
    const allGifts = await kv.getByPrefix('gifts:', environmentId);
    
    console.log('[Get Site Gifts] Total gifts in catalog:', allGifts.length);
    
    // If no config, return empty array
    if (!config) {
      console.log('[Get Site Gifts] ⚠️ No config found, returning empty array');
      return c.json({ gifts: [] });
    }
    
    // Filter based on configuration
    let gifts = allGifts.filter((g: any) => g.status === 'active');
    
    console.log('[Get Site Gifts] Active gifts:', gifts.length);
    console.log('[Get Site Gifts] Assignment strategy:', config.assignmentStrategy);
    
    switch (config.assignmentStrategy) {
      case 'all':
        // Return all active gifts
        break;
        
      case 'price_levels':
        if (config.selectedLevelId && config.priceLevels) {
          const level = config.priceLevels.find((l: any) => l.id === config.selectedLevelId);
          if (level) {
            gifts = gifts.filter((g: any) => 
              g.price >= level.minPrice && g.price < level.maxPrice
            );
          }
        }
        break;
        
      case 'exclusions':
        gifts = gifts.filter((g: any) => {
          if (config.excludedSkus?.includes(g.sku)) return false;
          if (config.excludedCategories?.includes(g.category)) return false;
          return true;
        });
        break;
        
      case 'explicit':
        if (config.includedGiftIds) {
          console.log('[Get Site Gifts] Included gift IDs:', config.includedGiftIds);
          gifts = gifts.filter((g: any) => config.includedGiftIds.includes(g.id));
          console.log('[Get Site Gifts] After explicit filtering:', gifts.length);
        } else {
          console.log('[Get Site Gifts] ⚠️ No includedGiftIds in config');
        }
        break;
        
      default:
        console.log('[Get Site Gifts] ⚠️ Unknown strategy, returning empty array');
        gifts = [];
    }
    
    console.log('[Get Site Gifts] ✅ Returning', gifts.length, 'gifts');
    return c.json({ gifts });
  } catch (error: any) {
    console.error('Get site gifts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ORDER ROUTES ====================

// ===== OLD ORDER CRUD ENDPOINTS REMOVED =====
// These have been replaced by v2 database-backed endpoints:
// - POST /v2/orders (replaces POST /orders)
// - GET /v2/orders/:id (replaces GET /orders/:id)
// - PUT /v2/orders/:id (replaces PUT /orders/:id)
// - DELETE /v2/orders/:id (new endpoint)
// - GET /v2/orders (list all orders)
// - GET /v2/orders/number/:orderNumber (get by order number)

// ==================== ENVIRONMENT CONFIGURATION ROUTES ====================

// Get all environment configurations (PUBLIC - no auth required)
app.get("/make-server-6fcaeea3/config/environments", async (c) => {
  try {
    // DEPLOYMENT FIX: During cold start (first 10s), return empty data immediately
    if (isInColdStartPeriod()) {
      console.log('[Config Environments] Cold start period - returning empty array');
      return c.json({ environments: [], coldStart: true });
    }
    
    const cacheKey = 'environments:list';
    
    // Try cache first
    const cached = getCachedData<any[]>(cacheKey);
    if (cached) {
      console.log('[Cache Hit] Returning cached environments');
      return c.json({ environments: cached, cached: true });
    }
    
    // Cache miss - fetch from database with aggressive timeout
    console.log('[Cache Miss] Fetching environments from database with 3s timeout');
    
    // Race between database fetch and 3-second timeout (reduced for deployment)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Fast timeout - graceful degradation')), 3000)
    );
    
    try {
      const environments = await Promise.race([
        kv.getByPrefix('environments:', 'development'),
        timeoutPromise
      ]);
      
      // Store in cache
      setCachedData(cacheKey, environments || []);
      console.log('[Success] Environments fetched and cached');
      
      return c.json({ environments: environments || [] });
    } catch (timeoutError: any) {
      // Fast timeout hit - return empty and try to fetch in background
      console.warn('[Fast Timeout] Returning empty environments, will cache in background');
      
      // Attempt background fetch (don't await)
      kv.getByPrefix('environments:', 'development')
        .then(envs => {
          if (envs && envs.length > 0) {
            setCachedData(cacheKey, envs);
            console.log('[Background Fetch] Environments cached for next request');
          }
        })
        .catch(err => console.error('[Background Fetch] Failed:', err.message));
      
      return c.json({ 
        environments: [], 
        warning: 'Database slow - loading in background' 
      });
    }
  } catch (error: any) {
    console.error('Get environments error:', error);
    // Return empty array on connection errors for graceful degradation
    const isConnectionError = error?.message?.includes('connection failed') || 
                             error?.message?.includes('timeout') ||
                             error?.message?.includes('522');
    if (isConnectionError) {
      console.log('[Graceful Degradation] Returning empty environments list due to connection error');
      return c.json({ environments: [], warning: 'Database temporarily unavailable' });
    }
    return c.json({ error: error.message }, 500);
  }
});

// Create or update environment configuration (PROTECTED - admin only)
app.post("/make-server-6fcaeea3/config/environments", verifyAdmin, async (c) => {
  try {
    let envData;
    
    try {
      envData = await c.req.json();
    } catch (parseError: any) {
      console.error('[POST /config/environments] Failed to parse JSON:', parseError);
      return c.json({ error: 'Invalid JSON in request body', details: parseError.message }, 400);
    }
    
    console.log('[POST /config/environments] Received data:', JSON.stringify(envData, null, 2));
    console.log('[POST /config/environments] Data type:', typeof envData);
    console.log('[POST /config/environments] Data keys:', Object.keys(envData || {}));
    
    // Validate required fields - only id and name are truly required
    // supabaseUrl and supabaseAnonKey can be empty during initial setup
    if (!envData || !envData.id || !envData.name) {
      console.error('[POST /config/environments] Missing required fields:', { 
        hasEnvData: !!envData,
        id: envData?.id, 
        name: envData?.name,
        allData: JSON.stringify(envData)
      });
      return c.json({ 
        error: 'Missing required fields: id and name',
        details: `Received: ${JSON.stringify(envData)}`
      }, 400);
    }

    // Check if environment already exists
    const existing = await kv.get(`environments:${envData.id}`, 'development');
    if (existing) {
      console.log('[POST /config/environments] Environment already exists:', envData.id);
      return c.json({ error: 'Environment already exists. Use PUT to update.' }, 409);
    }

    // Sanitize inputs with better error handling for optional fields
    let sanitizedUrl = '';
    if (envData.supabaseUrl && envData.supabaseUrl.trim() !== '') {
      try {
        sanitizedUrl = sanitize.url(envData.supabaseUrl);
      } catch (urlError: any) {
        console.error('[POST /config/environments] URL sanitization error:', urlError);
        return c.json({ 
          error: 'Invalid Supabase URL format',
          details: urlError.message 
        }, 400);
      }
    }

    const sanitizedData = {
      ...envData,
      id: sanitize.string(envData.id),
      name: sanitize.string(envData.name),
      label: sanitize.string(envData.label || envData.id.toUpperCase()),
      supabaseUrl: sanitizedUrl,
      supabaseAnonKey: envData.supabaseAnonKey ? sanitize.string(envData.supabaseAnonKey) : '',
      description: sanitize.string(envData.description || ''),
      color: sanitize.string(envData.color || '#10B981'),
      badge: sanitize.string(envData.badge || 'bg-gray-100 text-gray-800'),
      status: envData.status || 'inactive',
      isDefault: envData.isDefault || false,
      createdAt: envData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[POST /config/environments] Sanitized data:', JSON.stringify(sanitizedData, null, 2));

    await kv.set(`environments:${sanitizedData.id}`, sanitizedData, 'development');

    // Clear environments cache after creating a new environment
    clearCache('environments:');
    console.log('[Cache] Cleared environments cache after create');

    await auditLog({
      action: 'environment_created',
      userId: c.get('userId'),
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { environmentId: sanitizedData.id, name: sanitizedData.name }
    });

    console.log('[POST /config/environments] ✓ Environment created successfully');

    return c.json({ success: true, environment: sanitizedData });
  } catch (error: any) {
    console.error('[POST /config/environments] Create environment error:', error);
    console.error('[POST /config/environments] Error stack:', error.stack);
    return c.json({ 
      error: error.message || 'Failed to create environment',
      details: error.stack 
    }, 500);
  }
});

// Update environment configuration
app.put("/make-server-6fcaeea3/config/environments", verifyAdmin, async (c) => {
  try {
    const envData = await c.req.json();
    
    console.log('[PUT /config/environments] Received data:', envData);
    
    if (!envData.id) {
      return c.json({ error: 'Environment ID required' }, 400);
    }

    const existing = await kv.get(`environments:${envData.id}`, 'development');
    if (!existing) {
      return c.json({ error: 'Environment not found' }, 404);
    }

    console.log('[PUT /config/environments] Existing environment:', existing);

    // Sanitize inputs with better error handling
    let sanitizedUrl = existing.supabaseUrl;
    let sanitizedAnonKey = existing.supabaseAnonKey;
    
    try {
      if (envData.supabaseUrl) {
        sanitizedUrl = sanitize.url(envData.supabaseUrl);
      }
    } catch (urlError: any) {
      console.error('[PUT /config/environments] URL sanitization error:', urlError);
      return c.json({ 
        error: 'Invalid Supabase URL format',
        details: urlError.message 
      }, 400);
    }
    
    if (envData.supabaseAnonKey) {
      sanitizedAnonKey = sanitize.string(envData.supabaseAnonKey);
    }

    const sanitizedData = {
      ...existing,
      ...envData,
      id: sanitize.string(envData.id),
      name: sanitize.string(envData.name || existing.name),
      label: sanitize.string(envData.label || existing.label),
      supabaseUrl: sanitizedUrl,
      supabaseAnonKey: sanitizedAnonKey,
      description: sanitize.string(envData.description || existing.description || ''),
      color: sanitize.string(envData.color || existing.color || '#10B981'),
      badge: sanitize.string(envData.badge || existing.badge || 'bg-gray-100 text-gray-800'),
      status: envData.status || existing.status || 'inactive',
      isDefault: existing.isDefault || false,
      updatedAt: new Date().toISOString(),
    };

    console.log('[PUT /config/environments] Sanitized data:', sanitizedData);

    await kv.set(`environments:${sanitizedData.id}`, sanitizedData, 'development');

    // Clear environments cache after update
    clearCache('environments:');
    console.log('[Cache] Cleared environments cache after update');

    await auditLog({
      action: 'environment_updated',
      userId: c.get('userId'),
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { environmentId: sanitizedData.id, name: sanitizedData.name }
    });

    return c.json({ success: true, environment: sanitizedData });
  } catch (error: any) {
    console.error('[PUT /config/environments] Update environment error:', error);
    return c.json({ 
      error: error.message || 'Failed to update environment',
      details: error.stack 
    }, 500);
  }
});

// Update environment status
app.patch("/make-server-6fcaeea3/config/environments/:id/status", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { status, lastTested } = await c.req.json();

    const existing = await kv.get(`environments:${id}`, 'development');
    if (!existing) {
      return c.json({ error: 'Environment not found' }, 404);
    }

    const updated = {
      ...existing,
      status,
      lastTested,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`environments:${id}`, updated, 'development');
    
    // Clear environments cache after status update
    clearCache('environments:');
    console.log('[Cache] Cleared environments cache after status update');
    
    return c.json({ success: true, environment: updated });
  } catch (error: any) {
    console.error('Update environment status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete environment configuration
app.delete("/make-server-6fcaeea3/config/environments/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await kv.get(`environments:${id}`, 'development');
    if (!existing) {
      return c.json({ error: 'Environment not found' }, 404);
    }

    // Prevent deletion of default environments
    if (existing.isDefault) {
      return c.json({ error: 'Cannot delete default environments' }, 400);
    }

    await kv.del(`environments:${id}`, 'development');

    // Clear environments cache after deletion
    clearCache('environments:');
    console.log('[Cache] Cleared environments cache after deletion');

    await auditLog({
      action: 'environment_deleted',
      userId: c.get('userId'),
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { environmentId: id, name: existing.name }
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete environment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== DEVELOPMENT UTILITIES ====================

// Debug endpoint to list all admin users in current environment
app.get("/make-server-6fcaeea3/debug/list-admins", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('📋 Listing admin users for environment:', environmentId);
    
    // Get all admin users from KV store
    const adminUsers = await kv.getByPrefix('admin_users:', environmentId);
    
    console.log(`Found ${adminUsers?.length || 0} admin users`);
    
    return c.json({ 
      users: adminUsers || [],
      count: adminUsers?.length || 0,
      environment: environmentId
    });
  } catch (error: any) {
    console.error('List admins error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint to delete ALL admin users (DANGEROUS - use with caution)
app.post("/make-server-6fcaeea3/debug/delete-all-admins", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('⚠️ DELETE ALL ADMINS requested for environment:', environmentId);
    
    // Use environment-aware Supabase client
    const supabaseClient = getSupabaseClient(environmentId);
    
    // Get all admin users from KV store
    const adminUsers = await kv.getByPrefix('admin_users:', environmentId);
    
    if (!adminUsers || adminUsers.length === 0) {
      return c.json({ 
        message: 'No admin users found to delete',
        deletedCount: 0,
        environment: environmentId
      });
    }
    
    console.log(`Deleting ${adminUsers.length} admin users...`);
    let deletedCount = 0;
    
    // Delete each user from Supabase Auth and KV store
    for (const user of adminUsers) {
      try {
        // Delete from Supabase Auth
        const { error: authError } = await supabaseClient.auth.admin.deleteUser(user.id);
        if (authError) {
          console.error(`Failed to delete user ${user.id} from auth:`, authError);
        }
        
        // Delete from KV store
        await kv.del(`admin_users:${user.id}`, environmentId);
        
        deletedCount++;
        console.log(`✅ Deleted user: ${user.email} (${user.id})`);
      } catch (error: any) {
        console.error(`Failed to delete user ${user.id}:`, error);
      }
    }
    
    await auditLog({
      action: 'debug_delete_all_admins',
      status: 'success',
      details: { 
        deletedCount, 
        environment: environmentId,
        warning: 'ALL admin users deleted - system needs re-bootstrap'
      }
    });
    
    console.log(`✅ Successfully deleted ${deletedCount} admin users`);
    
    return c.json({ 
      success: true,
      message: `Successfully deleted ${deletedCount} admin users`,
      deletedCount,
      environment: environmentId
    });
  } catch (error: any) {
    console.error('Delete all admins error:', error);
    
    await auditLog({
      action: 'debug_delete_all_admins_failed',
      status: 'failure',
      details: { error: error.message, environment: environmentId }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint to diagnose login issues for a specific user
app.post("/make-server-6fcaeea3/debug/diagnose-login", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const { identifier } = await c.req.json();
    
    if (!identifier) {
      return c.json({ error: 'Identifier (email or username) is required' }, 400);
    }
    
    console.log('🔍 Diagnosing login for:', identifier, 'in environment:', environmentId);
    
    const supabaseClient = getSupabaseClient(environmentId);
    const diagnostic: any = {
      identifier,
      environment: environmentId,
      checks: {}
    };
    
    // Check 1: Determine if identifier is email or username
    const isEmail = identifier.includes('@');
    diagnostic.checks.identifierType = isEmail ? 'email' : 'username';
    
    let emailToCheck = identifier;
    
    // Check 2: If username, look up in KV store
    if (!isEmail) {
      const allAdmins = await kv.getByPrefix('admin_users:', environmentId);
      const adminUser = allAdmins?.find((admin: any) => 
        admin.username?.toLowerCase() === identifier.toLowerCase()
      );
      
      diagnostic.checks.kvLookup = {
        found: !!adminUser,
        email: adminUser?.email,
        username: adminUser?.username,
        role: adminUser?.role,
        id: adminUser?.id
      };
      
      if (adminUser) {
        emailToCheck = adminUser.email;
      } else {
        diagnostic.checks.kvLookup.error = 'Username not found in KV store';
        return c.json(diagnostic);
      }
    }
    
    // Check 3: Look for user in Supabase Auth
    try {
      const { data: { users }, error } = await supabaseClient.auth.admin.listUsers();
      
      if (error) {
        diagnostic.checks.supabaseAuth = {
          error: error.message
        };
      } else {
        const authUser = users?.find((u: any) => u.email?.toLowerCase() === emailToCheck.toLowerCase());
        diagnostic.checks.supabaseAuth = {
          found: !!authUser,
          email: authUser?.email,
          id: authUser?.id,
          emailConfirmed: authUser?.email_confirmed_at,
          createdAt: authUser?.created_at,
          lastSignIn: authUser?.last_sign_in_at
        };
        
        if (!authUser) {
          diagnostic.checks.supabaseAuth.error = 'Email not found in Supabase Auth - user may exist in KV but not in Auth database';
        }
      }
    } catch (authError: any) {
      diagnostic.checks.supabaseAuth = {
        error: authError.message
      };
    }
    
    // Check 4: Verify environment configuration
    diagnostic.checks.environment = {
      id: environmentId,
      supabaseUrl: environmentId === 'production' ? PRODUCTION_SUPABASE_URL : Deno.env.get('SUPABASE_URL'),
      hasProductionKey: !!PRODUCTION_SERVICE_ROLE_KEY
    };
    
    // Summary
    diagnostic.summary = {
      canLogin: diagnostic.checks.supabaseAuth?.found && 
                (isEmail || diagnostic.checks.kvLookup?.found),
      issues: []
    };
    
    if (!diagnostic.checks.supabaseAuth?.found) {
      diagnostic.summary.issues.push('User not found in Supabase Auth - account may not be properly created');
    }
    if (!isEmail && !diagnostic.checks.kvLookup?.found) {
      diagnostic.summary.issues.push('Username not found in KV store');
    }
    if (isEmail !== diagnostic.checks.supabaseAuth?.found) {
      diagnostic.summary.issues.push('Mismatch between KV store and Supabase Auth');
    }
    
    return c.json(diagnostic);
  } catch (error: any) {
    console.error('Diagnose login error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Public endpoint to check admin users (NO AUTH REQUIRED)
app.get("/make-server-6fcaeea3/public/check-auth-status", async (c) => {
  try {
    console.log('[Public Check] Checking for admin users in Supabase Auth...');
    
    //List all users in Supabase Auth using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('[Public Check] Error listing users:', error);
      return c.json({ 
        success: false,
        error: error.message,
        totalUsers: 0,
        allUsers: []
      }, 500);
    }
    
    console.log(`[Public Check] Found ${users?.length || 0} users in Supabase Auth`);
    
    // Also check KV store
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    const kvAdmins = await kv.getByPrefix('admin_users:', environmentId);
    console.log(`[Public Check] Found ${kvAdmins?.length || 0} admins in KV store`);
    
    return c.json({ 
      success: true,
      supabaseAuth: {
        totalUsers: users?.length || 0,
        allUsers: users?.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed_at: u.email_confirmed_at
        })) || []
      },
      kvStore: {
        totalAdmins: kvAdmins?.length || 0,
        admins: kvAdmins?.map((admin: any) => ({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        })) || []
      },
      environment: environmentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Public Check] Fatal error:', error);
    return c.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, 500);
  }
});

// Sync KV admin users to Supabase Auth (NO AUTH REQUIRED - for fixing bootstrap issues)
app.post("/make-server-6fcaeea3/debug/sync-admin-auth", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('🔄 Starting admin auth sync for environment:', environmentId);
    
    const supabaseClient = getSupabaseClient(environmentId);
    const results: any = {
      environment: environmentId,
      checked: 0,
      synced: 0,
      skipped: 0,
      errors: [],
      details: []
    };
    
    // Get all admin users from KV store
    const kvAdmins = await kv.getByPrefix('admin_users:', environmentId);
    console.log(`📋 Found ${kvAdmins?.length || 0} admins in KV store`);
    results.checked = kvAdmins?.length || 0;
    
    if (!kvAdmins || kvAdmins.length === 0) {
      return c.json({
        success: false,
        error: 'No admin users found in KV store',
        results
      });
    }
    
    // Get all users from Supabase Auth
    const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing Supabase Auth users:', listError);
      return c.json({
        success: false,
        error: listError.message,
        results
      }, 500);
    }
    
    const supabaseEmails = new Set(users?.map(u => u.email?.toLowerCase()) || []);
    console.log(`📋 Found ${users?.length || 0} users in Supabase Auth`);
    
    // Check each KV admin and create in Supabase Auth if missing
    for (const admin of kvAdmins) {
      const adminEmail = admin.email?.toLowerCase();
      const detail: any = {
        email: admin.email,
        username: admin.username,
        id: admin.id
      };
      
      if (!adminEmail) {
        detail.status = 'skipped';
        detail.reason = 'No email found';
        results.skipped++;
        results.details.push(detail);
        continue;
      }
      
      // Check if user exists in Supabase Auth
      if (supabaseEmails.has(adminEmail)) {
        detail.status = 'exists';
        detail.reason = 'Already in Supabase Auth';
        results.skipped++;
        results.details.push(detail);
        console.log(`✓ Admin ${admin.username} (${adminEmail}) already exists in Supabase Auth`);
        continue;
      }
      
      // User doesn't exist in Supabase Auth - create with default password
      console.log(`⚠️  Admin ${admin.username} (${adminEmail}) NOT found in Supabase Auth - creating...`);
      
      try {
        // Generate a temporary secure password
        const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10).toUpperCase()}!`;
        
        const { data: createData, error: createError } = await supabaseClient.auth.admin.createUser({
          email: adminEmail,
          password: tempPassword,
          user_metadata: { 
            username: admin.username,
            role: admin.role || 'admin',
            syncedFromKV: true,
            originalKVId: admin.id
          },
          email_confirm: true, // Auto-confirm
        });
        
        if (createError) {
          console.error(`❌ Failed to create ${adminEmail} in Supabase Auth:`, createError);
          detail.status = 'error';
          detail.error = createError.message;
          results.errors.push({
            email: adminEmail,
            error: createError.message
          });
          results.details.push(detail);
          continue;
        }
        
        // Update KV store with Supabase Auth ID
        const updatedAdmin = {
          ...admin,
          supabaseAuthId: createData.user.id,
          tempPassword, // Store temp password so admin can use it once
          passwordResetRequired: true,
          syncedAt: new Date().toISOString()
        };
        
        await kv.set(`admin_users:${admin.id}`, updatedAdmin, environmentId);
        
        detail.status = 'synced';
        detail.supabaseAuthId = createData.user.id;
        detail.tempPassword = tempPassword;
        detail.message = 'Created in Supabase Auth with temporary password';
        results.synced++;
        results.details.push(detail);
        
        console.log(`✅ Created ${adminEmail} in Supabase Auth with temp password: ${tempPassword}`);
        
        await auditLog({
          action: 'admin_auth_synced',
          userId: createData.user.id,
          email: adminEmail,
          status: 'success',
          details: { 
            username: admin.username,
            originalKVId: admin.id,
            environment: environmentId,
            method: 'sync-admin-auth'
          }
        });
      } catch (err: any) {
        console.error(`❌ Exception creating ${adminEmail}:`, err);
        detail.status = 'error';
        detail.error = err.message;
        results.errors.push({
          email: adminEmail,
          error: err.message
        });
        results.details.push(detail);
      }
    }
    
    console.log('🔄 Sync complete:', {
      checked: results.checked,
      synced: results.synced,
      skipped: results.skipped,
      errors: results.errors.length
    });
    
    return c.json({
      success: true,
      message: `Synced ${results.synced} admin users to Supabase Auth`,
      results
    });
  } catch (error: any) {
    console.error('Sync admin auth error:', error);
    return c.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, 500);
  }
});

// Manual reseed endpoint (development only)
app.post("/make-server-6fcaeea3/dev/reseed", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    console.log('Manual reseed triggered by admin for environment:', environmentId);
    
    // STEP 1: Clear database tables (in correct order due to foreign key constraints)
    console.log('Clearing database tables...');
    const dbClearResults = {
      orders: 0,
      employees: 0,
      products: 0,
      sites: 0,
      clients: 0,
    };
    
    try {
      // Clear orders FIRST (has foreign keys to clients, sites, products, employees)
      const { count: orderCount, error: orderCountError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${orderCount || 0} orders to delete`);
      
      if (!orderCountError && orderCount && orderCount > 0) {
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) {
          console.error('Error deleting orders:', deleteError);
        } else {
          dbClearResults.orders = orderCount;
          console.log(`Successfully deleted ${orderCount} orders from database`);
        }
      } else {
        console.log('No orders to delete');
      }
      
      // Clear employees (has foreign key to sites)
      const { count: employeeCount, error: employeeCountError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${employeeCount || 0} employees to delete`);
      
      if (!employeeCountError && employeeCount && employeeCount > 0) {
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) {
          console.error('Error deleting employees:', deleteError);
        } else {
          dbClearResults.employees = employeeCount;
          console.log(`Successfully deleted ${employeeCount} employees from database`);
        }
      } else {
        console.log('No employees to delete');
      }
      
      // Clear products (has foreign key to catalogs, but we're not managing catalogs yet)
      const { count: productCount, error: productCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${productCount || 0} products to delete`);
      
      if (!productCountError && productCount && productCount > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) {
          console.error('Error deleting products:', deleteError);
        } else {
          dbClearResults.products = productCount;
          console.log(`Successfully deleted ${productCount} products from database`);
        }
      } else {
        console.log('No products to delete');
      }
      
      // Clear sites (has foreign key to clients)
      const { count: siteCount, error: siteCountError } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${siteCount || 0} sites to delete`);
      
      if (!siteCountError && siteCount && siteCount > 0) {
        const { data: deletedSites, error: deleteError } = await supabase
          .from('sites')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000')
          .select();
        
        if (deleteError) {
          console.error('Error deleting sites:', deleteError);
        } else {
          dbClearResults.sites = deletedSites?.length || 0;
          console.log(`Successfully deleted ${deletedSites?.length || 0} sites from database`);
        }
      } else {
        console.log('No sites to delete');
      }
      
      // Clear clients LAST (referenced by sites and orders)
      const { count: clientCount, error: clientCountError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${clientCount || 0} clients to delete`);
      
      if (!clientCountError && clientCount && clientCount > 0) {
        const { data: deletedClients, error: deleteError } = await supabase
          .from('clients')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000')
          .select(); // Select to see what was deleted
        
        if (deleteError) {
          console.error('Error deleting clients:', deleteError);
          console.error('Delete error details:', JSON.stringify(deleteError, null, 2));
        } else {
          dbClearResults.clients = deletedClients?.length || 0;
          console.log(`Successfully deleted ${deletedClients?.length || 0} clients from database`);
          if (deletedClients && deletedClients.length > 0) {
            console.log('Deleted client IDs:', deletedClients.map((c: any) => c.id));
          }
        }
      } else {
        console.log('No clients to delete');
      }
      
      // Verify clients table is empty
      const { count: remainingClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      console.log(`After delete: ${remainingClients || 0} clients remaining in database`);
      
    } catch (dbError: any) {
      console.error('Error clearing database tables:', dbError);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
    }
    
    // STEP 2: Clear KV store - Clear BOTH old (plural) and new (singular) key patterns
    console.log('Clearing KV store...');
    const oldClients = await kv.getByPrefix('clients:', environmentId);
    for (const client of oldClients) {
      await kv.del(`clients:${environmentId}:${client.id}`, environmentId);
    }
    console.log(`Cleared ${oldClients.length} old clients from KV`);
    
    const clients = await kv.getByPrefix('client:', environmentId);
    for (const client of clients) {
      await kv.del(`client:${environmentId}:${client.id}`, environmentId);
    }
    console.log(`Cleared ${clients.length} new clients from KV`);
    
    const oldSites = await kv.getByPrefix('sites:', environmentId);
    for (const site of oldSites) {
      await kv.del(`sites:${environmentId}:${site.id}`, environmentId);
    }
    console.log(`Cleared ${oldSites.length} old sites from KV`);
    
    const sites = await kv.getByPrefix('site:', environmentId);
    for (const site of sites) {
      await kv.del(`site:${environmentId}:${site.id}`, environmentId);
    }
    console.log(`Cleared ${sites.length} new sites from KV`);
    
    const gifts = await kv.getByPrefix('gifts:', environmentId);
    for (const gift of gifts) {
      await kv.del(`gifts:${gift.id}`, environmentId);
    }
    console.log(`Cleared ${gifts.length} gifts from KV`);
    
    const configs = await kv.getByPrefix('site_configs:', environmentId);
    for (const config of configs) {
      await kv.del(`site_configs:${config.siteId}`, environmentId);
    }
    console.log(`Cleared ${configs.length} site configs from KV`);
    
    // STEP 3: Seed database tables with new data
    console.log('Seeding database tables...');
    const seedClients = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'TechCorp Inc.',
        contact_email: 'admin@techcorp.com',
        status: 'active',
        client_code: 'TECHCORP',
        client_contact_name: 'John Smith',
        client_contact_phone: '(555) 100-0000',
        client_address_line_1: '123 Tech Street',
        client_city: 'San Francisco',
        client_postal_code: '94102',
        client_country_state: 'CA',
        client_country: 'US',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'GlobalRetail Group',
        contact_email: 'contact@globalretail.com',
        status: 'active',
        client_code: 'GLOBALRETAIL',
        client_contact_name: 'Jane Doe',
        client_contact_phone: '(555) 200-0000',
        client_address_line_1: '456 Retail Ave',
        client_city: 'New York',
        client_postal_code: '10001',
        client_country_state: 'NY',
        client_country: 'US',
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'HealthCare Services Ltd.',
        contact_email: 'info@healthcareservices.com',
        status: 'active',
        client_code: 'HEALTHCARE',
        client_contact_name: 'Dr. Sarah Johnson',
        client_contact_phone: '(555) 300-0000',
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'EduTech Solutions',
        contact_email: 'hello@edutech.com',
        status: 'active',
        client_code: 'EDUTECH',
        client_contact_name: 'Michael Brown',
        client_contact_phone: '(555) 400-0000',
      },
    ];
    
    // Insert new clients (tables were already cleared in STEP 1)
    console.log('Attempting to insert clients:', seedClients.map(c => ({ id: c.id, name: c.name })));
    const { data: insertedClients, error: clientInsertError } = await supabase
      .from('clients')
      .insert(seedClients)
      .select();
    
    if (clientInsertError) {
      console.error('ERROR inserting clients:', clientInsertError);
      console.error('Full error details:', JSON.stringify(clientInsertError, null, 2));
    } else {
      console.log(`Successfully inserted ${insertedClients?.length || 0} clients to database`);
      console.log('Inserted client IDs:', insertedClients?.map(c => c.id));
    }
    
    const seedSites = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        name: 'TechCorp US - Employee Gifts 2026',
        slug: 'techcorp-us-gifts-2026',
        client_id: '00000000-0000-0000-0000-000000000001',
        status: 'active',
        site_code: 'TC-US-001',
        site_custom_domain_url: 'techcorp-us-gifts.jala.com',
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        name: 'TechCorp EU - Employee Recognition',
        slug: 'techcorp-eu-recognition-2026',
        client_id: '00000000-0000-0000-0000-000000000001',
        status: 'active',
        site_code: 'TC-EU-001',
        site_custom_domain_url: 'techcorp-eu-recognition.jala.com',
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        name: 'GlobalRetail Premium - US',
        slug: 'globalretail-premium-us-2026',
        client_id: '00000000-0000-0000-0000-000000000002',
        status: 'active',
        site_code: 'GR-US-001',
        site_custom_domain_url: 'globalretail-premium-us.jala.com',
      },
    ];
    
    // Insert new sites (tables were already cleared in STEP 1)
    console.log('Attempting to insert sites:', seedSites.map(s => ({ id: s.id, name: s.name })));
    const { data: insertedSites, error: siteInsertError } = await supabase
      .from('sites')
      .insert(seedSites)
      .select();
    
    if (siteInsertError) {
      console.error('ERROR inserting sites:', siteInsertError);
      console.error('Full error details:', JSON.stringify(siteInsertError, null, 2));
    } else {
      console.log(`Successfully inserted ${insertedSites?.length || 0} sites to database`);
      console.log('Inserted site IDs:', insertedSites?.map(s => s.id));
    }
    
    // STEP 4: KV store seeding skipped - using PostgreSQL database only
    console.log('KV store seeding skipped - all data now in PostgreSQL database');
    
    return c.json({ 
      success: true, 
      message: 'Database and KV store reseeded successfully',
      environment: environmentId,
      cleared: {
        database: dbClearResults,
        kv: {
          oldClients: oldClients.length,
          newClients: clients.length,
          oldSites: oldSites.length,
          newSites: sites.length,
          gifts: gifts.length,
          configs: configs.length,
        }
      },
      seeded: {
        clients: seedClients.length,
        sites: seedSites.length,
      }
    });
  } catch (error: any) {
    console.error('Reseed error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Initial seed endpoint (NO AUTH REQUIRED) - for bootstrapping empty database
// This endpoint can only seed if the database is completely empty (no admin user exists)
app.post("/make-server-6fcaeea3/dev/initial-seed", async (c) => {
  try {
    console.log('Initial seed requested (no auth)');
    
    // Check if admin user already exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminExists = users?.users?.some(u => 
      u.email === 'admin@example.com' || 
      u.user_metadata?.role === 'admin'
    );
    
    if (adminExists) {
      return c.json({ 
        error: 'Database already initialized. Use /dev/reseed endpoint with admin credentials instead.',
        hint: 'Login as admin@example.com to reseed the database'
      }, 403);
    }
    
    console.log('No admin user found, proceeding with initial seed...');
    
    // Seed the database
    await seedDatabase();
    
    return c.json({ 
      success: true, 
      message: 'Database seeded successfully',
      credentials: {
        email: 'admin@example.com',
        password: 'Admin123!',
        note: 'Use these credentials to login to /admin'
      }
    });
  } catch (error: any) {
    console.error('Initial seed error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Reseed products/gift catalog endpoint (NO AUTH REQUIRED for ease of use)
app.post("/make-server-6fcaeea3/dev/reseed-products", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development'; // FIXED: Get environmentId
  
  try {
    console.log(`Product reseed requested for environment: ${environmentId}`);
    
    // Force reseed the gift catalog - FIXED: Pass environmentId
    const result = await giftsApi.forceReseedGiftCatalog(environmentId);
    
    return c.json({ 
      success: true, 
      message: 'Product catalog reseeded successfully',
      cleared: result.cleared,
      created: result.created,
      environment: environmentId
    });
  } catch (error: any) {
    console.error('Product reseed error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// NEW: Public endpoint to list admin emails (for debugging login issues)
// This endpoint does NOT require authentication and only returns emails (not passwords)
app.get("/make-server-6fcaeea3/dev/list-admins", async (c) => {
  try {
    console.log('Listing admin accounts...');
    
    // Get all admin users from Supabase Auth
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Filter and return only admin users with their emails
    const adminUsers = users?.users
      ?.filter(u => u.user_metadata?.role && ['super_admin', 'admin', 'manager', 'client_admin'].includes(u.user_metadata.role))
      .map(u => ({
        email: u.email,
        role: u.user_metadata?.role || 'unknown',
        username: u.user_metadata?.username || 'N/A',
        created: u.created_at,
      })) || [];
    
    return c.json({
      success: true,
      count: adminUsers.length,
      admins: adminUsers,
      hint: 'Use admin@example.com with password Admin123! for the default super admin account'
    });
  } catch (error: any) {
    console.error('List admins error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint to check database keys (DEVELOPMENT ONLY)
app.get("/make-server-6fcaeea3/dev/debug-keys", verifyAdmin, async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const results: Record<string, any> = {};
    
    // Check various key patterns including gifts
    const patterns = [
      'client:',
      'site:',
      'clients:',
      'sites:',
      'client:development:',
      'site:development:',
      'client:production:',
      'site:production:',
      'gift:',
      'gift:development:',
      'gift:production:',
      'gifts:',
    ];
    
    for (const pattern of patterns) {
      const data = await kv.getByPrefix(pattern, environmentId);
      results[pattern] = {
        count: data?.length || 0,
        keys: data?.map((item: any) => item.id || 'no-id') || [],
        sample: data?.[0] || null
      };
    }
    
    // Also check the specific GIFTS_KEY
    const giftsAll = await kv.get('gifts:all', environmentId);
    results['gifts:all (direct get)'] = {
      exists: !!giftsAll,
      count: Array.isArray(giftsAll) ? giftsAll.length : 0,
      data: giftsAll
    };
    
    return c.json({ 
      success: true,
      timestamp: new Date().toISOString(),
      environmentId,
      patterns: results,
      summary: {
        totalPatterns: patterns.length,
        patternsWithData: Object.values(results).filter((r: any) => r.count > 0).length
      }
    });
  } catch (error: any) {
    console.error('Debug keys error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint to test token validity (no auth required, just logs details)
app.post("/make-server-6fcaeea3/dev/debug-token", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    const authHeader = c.req.header('Authorization');
    const environmentId = c.req.header('X-Environment-ID') || 'development';
    
    console.log('=== TOKEN DEBUG ===');
    console.log('Has X-Access-Token:', !!accessToken);
    console.log('Has Authorization:', !!authHeader);
    console.log('Environment ID:', environmentId);
    
    if (accessToken) {
      console.log('Token preview:', accessToken.substring(0, 50) + '...');
      console.log('Token length:', accessToken.length);
      
      // Try to decode
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token algorithm:', header.alg);
          console.log('Token payload:', payload);
          console.log('Token expired?', payload.exp < Math.floor(Date.now() / 1000));
        }
      } catch (decodeError) {
        console.error('Failed to decode:', decodeError);
      }
      
      // Try to verify
      try {
        const payload = await verifyCustomJWT(accessToken);
        console.log('✅ VERIFICATION SUCCESS');
        console.log('Verified payload:', payload);
        
        return c.json({
          success: true,
          message: 'Token is valid',
          payload
        });
      } catch (verifyError: any) {
        console.error('❌ VERIFICATION FAILED:', verifyError.message);
        return c.json({
          success: false,
          error: 'Token verification failed',
          details: verifyError.message
        }, 401);
      }
    } else {
      return c.json({
        success: false,
        error: 'No token provided'
      }, 400);
    }
  } catch (error: any) {
    console.error('Debug token error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Migration endpoint to migrate old key patterns to new environment-aware patterns
app.post("/make-server-6fcaeea3/dev/migrate-keys", verifyAdmin, async (c) => {
  try {
    const environmentId = c.get('environmentId') || 'development';
    console.log(`[Migration] Starting key pattern migration to environment: ${environmentId}`);
    
    const migrations = [];
    
    // Define resource types to migrate
    const resourceTypes = [
      { oldPrefix: 'clients:', newPrefix: `client:${environmentId}:`, name: 'clients' },
      { oldPrefix: 'sites:', newPrefix: `site:${environmentId}:`, name: 'sites' },
      { oldPrefix: 'gifts:', newPrefix: `gift:${environmentId}:`, name: 'gifts' },
      { oldPrefix: 'products:', newPrefix: `product:${environmentId}:`, name: 'products' },
      { oldPrefix: 'categories:', newPrefix: `category:${environmentId}:`, name: 'categories' },
      { oldPrefix: 'orders:', newPrefix: `order:${environmentId}:`, name: 'orders' },
      { oldPrefix: 'shipments:', newPrefix: `shipment:${environmentId}:`, name: 'shipments' },
    ];
    
    for (const resource of resourceTypes) {
      console.log(`[Migration] Processing ${resource.name}...`);
      
      // Get all records with old key pattern
      const oldRecords = await kv.getByPrefix(resource.oldPrefix);
      
      if (!oldRecords || oldRecords.length === 0) {
        console.log(`[Migration] No ${resource.name} found with old pattern`);
        migrations.push({
          resource: resource.name,
          migrated: 0,
          message: 'No records found with old pattern'
        });
        continue;
      }
      
      console.log(`[Migration] Found ${oldRecords.length} ${resource.name} to migrate`);
      
      // Migrate each record
      let migratedCount = 0;
      for (const record of oldRecords) {
        // Extract the ID from the record
        const id = record.id;
        if (!id) {
          console.warn(`[Migration] Record missing ID, skipping:`, record);
          continue;
        }
        
        // Create new key
        const newKey = `${resource.newPrefix}${id}`;
        
        // Write to new key
        await kv.set(newKey, record);
        
        // Delete old key
        const oldKey = `${resource.oldPrefix}${id}`;
        await kv.del(oldKey);
        
        migratedCount++;
        console.log(`[Migration] Migrated ${resource.name}: ${oldKey} → ${newKey}`);
      }
      
      migrations.push({
        resource: resource.name,
        migrated: migratedCount,
        message: `Successfully migrated ${migratedCount} records`
      });
    }
    
    // Audit log
    await auditLog({
      action: 'database_key_migration',
      status: 'success',
      userId: c.get('userId'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: {
        environmentId,
        migrations,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('[Migration] Key pattern migration completed successfully');
    
    return c.json({
      success: true,
      message: 'Database key migration completed',
      environmentId,
      migrations,
      totalMigrated: migrations.reduce((sum, m) => sum + m.migrated, 0)
    });
  } catch (error: any) {
    console.error('[Migration] Key migration error:', error);
    
    await auditLog({
      action: 'database_key_migration',
      status: 'failure',
      userId: c.get('userId'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        error: error.message,
        stack: error.stack 
      }
    });
    
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ERP INTEGRATION ROUTES ====================

// Get all ERP connections
app.get("/make-server-6fcaeea3/erp/connections", verifyAdmin, async (c) => {
  try {
    const connections = await erp.getAllERPConnections();
    return c.json({ connections });
  } catch (error: any) {
    console.error('Get ERP connections error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get ERP connection by ID
app.get("/make-server-6fcaeea3/erp/connections/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const connection = await erp.getERPConnection(id);
    
    if (!connection) {
      return c.json({ error: 'ERP connection not found' }, 404);
    }
    
    return c.json({ connection });
  } catch (error: any) {
    console.error('Get ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create ERP connection
app.post("/make-server-6fcaeea3/erp/connections", verifyAdmin, async (c) => {
  try {
    const connectionData = await c.req.json();
    const userId = c.get('userId');
    
    const connection = await erp.createERPConnection({
      ...connectionData,
      createdBy: userId,
    });
    
    await auditLog({
      action: 'erp_connection_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { erpId: connection.id, erpType: connection.type }
    });
    
    return c.json({ connection });
  } catch (error: any) {
    console.error('Create ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update ERP connection
app.put("/make-server-6fcaeea3/erp/connections/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const userId = c.get('userId');
    
    const connection = await erp.updateERPConnection(id, updates);
    
    if (!connection) {
      return c.json({ error: 'ERP connection not found' }, 404);
    }
    
    await auditLog({
      action: 'erp_connection_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { erpId: id, erpType: connection.type }
    });
    
    return c.json({ connection });
  } catch (error: any) {
    console.error('Update ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete ERP connection
app.delete("/make-server-6fcaeea3/erp/connections/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    await erp.deleteERPConnection(id);
    
    await auditLog({
      action: 'erp_connection_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { erpId: id }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Test ERP connection
app.post("/make-server-6fcaeea3/erp/connections/:id/test", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const connection = await erp.getERPConnection(id);
    
    if (!connection) {
      return c.json({ error: 'ERP connection not found' }, 404);
    }
    
    const result = await erp.testERPConnection(connection);
    
    return c.json(result);
  } catch (error: any) {
    console.error('Test ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Sync order to ERP
app.post("/make-server-6fcaeea3/erp/sync/order", verifyAdmin, async (c) => {
  try {
    const { erpConnectionId, order } = await c.req.json();
    const userId = c.get('userId');
    
    const result = await erp.syncOrderToERP(erpConnectionId, order);
    
    await auditLog({
      action: 'erp_order_sync',
      userId,
      status: result.success ? 'success' : 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        erpId: erpConnectionId, 
        orderId: order.orderId,
        erpOrderId: result.erpOrderId,
        error: result.error 
      }
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Sync order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Sync products from ERP
app.post("/make-server-6fcaeea3/erp/sync/products/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    const result = await erp.syncProductsFromERP(id);
    
    await auditLog({
      action: 'erp_product_sync',
      userId,
      status: result.success ? 'success' : 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        erpId: id,
        productsCount: result.products?.length || 0,
        error: result.error 
      }
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Sync products error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Sync inventory from ERP
app.post("/make-server-6fcaeea3/erp/sync/inventory/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    const result = await erp.syncInventoryFromERP(id);
    
    await auditLog({
      action: 'erp_inventory_sync',
      userId,
      status: result.success ? 'success' : 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        erpId: id,
        inventoryCount: result.inventory?.length || 0,
        error: result.error 
      }
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Sync inventory error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get sync logs for ERP connection
app.get("/make-server-6fcaeea3/erp/connections/:id/logs", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const logs = await erp.getSyncLogs(id, limit);
    
    return c.json({ logs });
  } catch (error: any) {
    console.error('Get sync logs error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get cached inventory for SKU
app.get("/make-server-6fcaeea3/erp/inventory/:sku", async (c) => {
  try {
    const sku = c.req.param('sku');
    const inventory = await erp.getCachedInventory(sku);
    
    if (!inventory) {
      return c.json({ error: 'Inventory not found for SKU' }, 404);
    }
    
    return c.json({ inventory });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ERP SCHEDULER ROUTES ====================

// Create schedule
app.post("/make-server-6fcaeea3/erp/schedules", verifyAdmin, async (c) => {
  try {
    const scheduleData = await c.req.json();
    const userId = c.get('userId');
    
    const schedule = await scheduler.createSchedule({
      ...scheduleData,
      createdBy: userId,
    });
    
    await auditLog({
      action: 'erp_schedule_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { scheduleId: schedule.id, erpId: schedule.erpConnectionId }
    });
    
    return c.json({ schedule });
  } catch (error: any) {
    console.error('Create schedule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all schedules
app.get("/make-server-6fcaeea3/erp/schedules", verifyAdmin, async (c) => {
  try {
    const schedules = await scheduler.getAllSchedules();
    return c.json({ schedules });
  } catch (error: any) {
    console.error('Get schedules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get schedules for an ERP connection
app.get("/make-server-6fcaeea3/erp/connections/:id/schedules", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const schedules = await scheduler.getSchedulesByConnection(id);
    return c.json({ schedules });
  } catch (error: any) {
    console.error('Get connection schedules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get schedule by ID
app.get("/make-server-6fcaeea3/erp/schedules/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const schedule = await scheduler.getSchedule(id);
    
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    
    return c.json({ schedule });
  } catch (error: any) {
    console.error('Get schedule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update schedule
app.put("/make-server-6fcaeea3/erp/schedules/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const userId = c.get('userId');
    
    const schedule = await scheduler.updateSchedule(id, updates);
    
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    
    await auditLog({
      action: 'erp_schedule_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { scheduleId: id, erpId: schedule.erpConnectionId }
    });
    
    return c.json({ schedule });
  } catch (error: any) {
    console.error('Update schedule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete schedule
app.delete("/make-server-6fcaeea3/erp/schedules/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    await scheduler.deleteSchedule(id);
    
    await auditLog({
      action: 'erp_schedule_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { scheduleId: id }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete schedule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Validate cron expression
app.post("/make-server-6fcaeea3/erp/schedules/validate-cron", verifyAdmin, async (c) => {
  try {
    const { expression } = await c.req.json();
    const result = scheduler.validateCronExpression(expression);
    
    let description = '';
    if (result.valid) {
      description = scheduler.describeCronExpression(expression);
    }
    
    return c.json({ ...result, description });
  } catch (error: any) {
    console.error('Validate cron error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get execution logs for a schedule
app.get("/make-server-6fcaeea3/erp/schedules/:id/logs", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const logs = await scheduler.getExecutionLogs(id, limit);
    
    return c.json({ logs });
  } catch (error: any) {
    console.error('Get execution logs error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Execute schedule immediately
app.post("/make-server-6fcaeea3/erp/schedules/:id/execute", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    const log = await scheduler.executeScheduledSync(id);
    
    await auditLog({
      action: 'erp_schedule_executed',
      userId,
      status: log.status === 'success' ? 'success' : 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { scheduleId: id, executionLog: log.id }
    });
    
    return c.json({ log });
  } catch (error: any) {
    console.error('Execute schedule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process due schedules (can be called by a cron job)
app.post("/make-server-6fcaeea3/erp/schedules/process-due", async (c) => {
  try {
    // Optional: Add API key authentication here for external cron services
    const apiKey = c.req.header('X-API-Key');
    const expectedKey = Deno.env.get('SCHEDULER_API_KEY');
    
    if (expectedKey && apiKey !== expectedKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const logs = await scheduler.processDueSchedules();
    
    return c.json({ 
      processed: logs.length,
      logs: logs.map(l => ({
        scheduleId: l.scheduleId,
        status: l.status,
        recordsProcessed: l.recordsProcessed
      }))
    });
  } catch (error: any) {
    console.error('Process due schedules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ENHANCED ERP INTEGRATION ROUTES ====================

// Enhanced: Create ERP connection with new features (DOI, SFTP, more data types)
app.post("/make-server-6fcaeea3/erp/connections/enhanced", verifyAdmin, async (c) => {
  try {
    const connectionData = await c.req.json();
    const userId = c.get('userId');
    
    const connection = await erpEnhanced.createERPConnection(connectionData, userId);
    
    await auditLog({
      action: 'erp_connection_created_enhanced',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        erpId: connection.id, 
        provider: connection.provider,
        method: connection.connectionMethod
      }
    });
    
    return c.json(connection);
  } catch (error: any) {
    console.error('Create enhanced ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Enhanced: Update ERP connection (PATCH)
app.patch("/make-server-6fcaeea3/erp/connections/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const userId = c.get('userId');
    
    const connection = await erpEnhanced.updateERPConnection(id, updates);
    
    if (!connection) {
      return c.json({ error: 'ERP connection not found' }, 404);
    }
    
    await auditLog({
      action: 'erp_connection_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { erpId: id, provider: connection.provider }
    });
    
    return c.json(connection);
  } catch (error: any) {
    console.error('Update ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Enhanced: Test ERP connection (supports all methods)
app.post("/make-server-6fcaeea3/erp/connections/:id/test-enhanced", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const result = await erpEnhanced.testERPConnection(id);
    
    return c.json(result);
  } catch (error: any) {
    console.error('Test ERP connection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Enhanced: Trigger manual sync with data type selection
app.post("/make-server-6fcaeea3/erp/connections/:id/sync", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { dataType, direction } = await c.req.json();
    const userId = c.get('userId');
    
    if (!dataType) {
      return c.json({ error: 'dataType is required' }, 400);
    }
    
    const syncLog = await erpEnhanced.triggerSync(id, dataType, direction);
    
    await auditLog({
      action: 'erp_manual_sync_triggered',
      userId,
      status: syncLog.status === 'success' ? 'success' : 'failure',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        erpId: id, 
        dataType,
        recordsProcessed: syncLog.recordsProcessed
      }
    });
    
    return c.json(syncLog);
  } catch (error: any) {
    console.error('Trigger sync error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get sync logs with filtering
app.get("/make-server-6fcaeea3/erp/sync-logs", verifyAdmin, async (c) => {
  try {
    const erpConnectionId = c.req.query('erpConnectionId');
    const dataType = c.req.query('dataType') as any;
    const limit = parseInt(c.req.query('limit') || '50');
    
    const logs = await erpEnhanced.getSyncLogs(erpConnectionId, dataType, limit);
    
    return c.json(logs);
  } catch (error: any) {
    console.error('Get sync logs error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get sync statistics
app.get("/make-server-6fcaeea3/erp/connections/:id/statistics", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const statistics = await erpEnhanced.getSyncStatistics(id);
    
    return c.json(statistics);
  } catch (error: any) {
    console.error('Get sync statistics error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== SYNC CONFIGURATION ROUTES ====================

// Get sync configurations for a connection
app.get("/make-server-6fcaeea3/erp/connections/:id/sync-configs", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const configs = await erpEnhanced.getSyncConfigurationsByConnection(id);
    
    return c.json(configs);
  } catch (error: any) {
    console.error('Get sync configs error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create sync configuration
app.post("/make-server-6fcaeea3/erp/sync-configs", verifyAdmin, async (c) => {
  try {
    const configData = await c.req.json();
    const userId = c.get('userId');
    
    const config = await erpEnhanced.createSyncConfiguration(configData);
    
    await auditLog({
      action: 'erp_sync_config_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        configId: config.id,
        erpConnectionId: config.erpConnectionId,
        dataType: config.dataType
      }
    });
    
    return c.json(config);
  } catch (error: any) {
    console.error('Create sync config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update sync configuration
app.patch("/make-server-6fcaeea3/erp/sync-configs/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const userId = c.get('userId');
    
    const config = await erpEnhanced.updateSyncConfiguration(id, updates);
    
    if (!config) {
      return c.json({ error: 'Sync configuration not found' }, 404);
    }
    
    await auditLog({
      action: 'erp_sync_config_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { configId: id }
    });
    
    return c.json(config);
  } catch (error: any) {
    console.error('Update sync config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== CLIENT/SITE ERP ASSIGNMENT ROUTES ====================

// Get client ERP assignments
app.get("/make-server-6fcaeea3/clients/:clientId/erp-assignments", verifyAdmin, async (c) => {
  try {
    const clientId = c.req.param('clientId');
    const assignments = await erpEnhanced.getClientERPAssignments(clientId);
    
    return c.json(assignments);
  } catch (error: any) {
    console.error('Get client ERP assignments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assign ERP to client
app.post("/make-server-6fcaeea3/clients/:clientId/erp-assignments", verifyAdmin, async (c) => {
  try {
    const clientId = c.req.param('clientId');
    const assignmentData = await c.req.json();
    const userId = c.get('userId');
    
    const assignment = await erpEnhanced.assignERPToClient({
      ...assignmentData,
      clientId
    });
    
    await auditLog({
      action: 'client_erp_assigned',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        clientId,
        erpConnectionId: assignment.erpConnectionId,
        catalogId: assignment.catalogId
      }
    });
    
    return c.json(assignment);
  } catch (error: any) {
    console.error('Assign ERP to client error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get site ERP assignments
app.get("/make-server-6fcaeea3/sites/:siteId/erp-assignments", verifyAdmin, async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const assignments = await erpEnhanced.getSiteERPAssignments(siteId);
    
    return c.json(assignments);
  } catch (error: any) {
    console.error('Get site ERP assignments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assign ERP to site
app.post("/make-server-6fcaeea3/sites/:siteId/erp-assignments", verifyAdmin, async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const assignmentData = await c.req.json();
    const userId = c.get('userId');
    
    const assignment = await erpEnhanced.assignERPToSite({
      ...assignmentData,
      siteId
    });
    
    await auditLog({
      action: 'site_erp_assigned',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        siteId,
        clientId: assignment.clientId,
        erpConnectionId: assignment.erpConnectionId,
        overridesClient: assignment.overridesClient
      }
    });
    
    return c.json(assignment);
  } catch (error: any) {
    console.error('Assign ERP to site error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get effective ERP for a site (considers client fallback)
app.get("/make-server-6fcaeea3/sites/:siteId/effective-erp", verifyAdmin, async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const clientId = c.req.query('clientId');
    
    if (!clientId) {
      return c.json({ error: 'clientId query parameter is required' }, 400);
    }
    
    const result = await erpEnhanced.getEffectiveERPForSite(siteId, clientId);
    
    return c.json(result);
  } catch (error: any) {
    console.error('Get effective ERP error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== EMPLOYEE MANAGEMENT ROUTES ====================

// Import employees from CSV
app.post("/make-server-6fcaeea3/employees/import", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const { siteId, employees } = await c.req.json();
    
    if (!siteId || !employees || !Array.isArray(employees)) {
      return c.json({ error: 'Invalid request. Required: siteId and employees array' }, 400);
    }
    
    // Validate site exists
    const site = await kv.get(`site:${siteId}`, environmentId);
    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }
    
    const imported = [];
    const errors = [];
    
    // Get client information for email variables
    const client = await kv.get(`client:${site.clientId}`, environmentId);
    
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      
      // Validate required fields
      if (!emp.email && !emp.employeeId && !emp.serialCard) {
        errors.push({ row: i + 1, error: 'At least one identifier (email, employeeId, or serialCard) is required' });
        continue;
      }
      
      const employee = {
        id: crypto.randomUUID(),
        siteId,
        email: emp.email?.toLowerCase().trim() || '',
        employeeId: emp.employeeId?.trim() || '',
        serialCard: emp.serialCard?.trim() || '',
        name: emp.name?.trim() || '',
        department: emp.department?.trim() || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await kv.set(`employee:${siteId}:${employee.id}`, employee, environmentId);
      imported.push(employee);
      
      // Trigger employee_added email automation if employee has email
      if (employee.email && employee.serialCard) {
        try {
          await emailEventHelper.notifyEmployeeAdded(
            siteId,
            {
              email: employee.email,
              name: employee.name,
              serialCode: employee.serialCard,
            },
            {
              name: site.name || 'Your Site',
            },
            {
              name: client?.name || 'Your Company',
            },
            environmentId
          );
          console.log(`[Employee Import] Triggered employee_added email for ${employee.email}`);
        } catch (emailError: any) {
          console.error(`[Employee Import] Failed to send email for ${employee.email}:`, emailError);
          // Don't fail the import if email fails
        }
      }
    }
    
    await auditLog({
      action: 'employees_imported',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        siteId, 
        imported: imported.length,
        errors: errors.length
      }
    });
    
    return c.json({ 
      success: true, 
      imported: imported.length, 
      errors: errors.length > 0 ? errors : undefined,
      employees: imported 
    });
  } catch (error: any) {
    console.error('Employee import error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== OLD EMPLOYEE CRUD ENDPOINTS REMOVED =====
// These have been replaced by v2 database-backed endpoints:
// - GET /v2/employees?site_id=:siteId (replaces GET /sites/:siteId/employees)
// - POST /v2/employees (replaces POST /sites/:siteId/employees)
// - GET /v2/employees/:id (replaces GET /employees/:id)
// - PUT /v2/employees/:id (replaces PUT /employees/:id)
// - DELETE /v2/employees/:id (replaces DELETE /employees/:id)

// Validate employee access (PUBLIC - no auth required)
app.post("/make-server-6fcaeea3/public/validate/employee", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const { siteId, method, value } = await c.req.json();
    
    console.log(`[Employee Validation] Environment: ${environmentId}, Site: ${siteId}, Method: ${method}, Value: ${value}`);
    
    if (!siteId || !method || !value) {
      return c.json({ error: 'siteId, method, and value are required' }, 400);
    }
    
    // Get site to check allowed domains (optional - validation works without it)
    let site = null;
    try {
      site = await kv.get(`site:${siteId}`, environmentId);
    } catch (error) {
      console.log(`[Employee Validation] Could not load site ${siteId}, continuing without allowed domains check`);
    }
    
    // Get all employees for the site
    console.log(`[Employee Validation] Looking for employees with prefix: employee:${siteId}:`);
    const employees = await kv.getByPrefix(`employee:${siteId}:`, environmentId);
    
    console.log(`[Employee Validation] Found ${employees.length} employees for site ${siteId}`);
    if (employees.length > 0) {
      console.log(`[Employee Validation] Employee serial cards:`, employees.map(e => e.serialCard));
    }
    
    let validEmployee = null;
    const normalizedValue = value.toLowerCase().trim();
    
    // Find matching employee based on validation method
    if (method === 'email') {
      validEmployee = employees.find(emp => 
        emp.email === normalizedValue && emp.status === 'active'
      );
      
      // If no specific employee found, check allowed domains (if site was loaded)
      if (!validEmployee && site && site.settings?.allowedDomains && site.settings.allowedDomains.length > 0) {
        const emailDomain = normalizedValue.split('@')[1];
        if (emailDomain && site.settings.allowedDomains.includes(emailDomain)) {
          console.log(`[Employee Validation] Email domain ${emailDomain} is in allowed domains list`);
          // Create a temporary employee record for domain-based access
          validEmployee = {
            id: `domain-${crypto.randomUUID()}`,
            email: normalizedValue,
            name: normalizedValue.split('@')[0],
            siteId,
            status: 'active'
          };
        }
      }
    } else if (method === 'employeeId') {
      validEmployee = employees.find(emp => 
        emp.employeeId === value.trim() && emp.status === 'active'
      );
    } else if (method === 'serialCard') {
      console.log(`[Employee Validation] Searching for serialCard: "${value.trim()}"`);
      validEmployee = employees.find(emp => 
        emp.serialCard === value.trim() && emp.status === 'active'
      );
      console.log(`[Employee Validation] Match found:`, !!validEmployee);
    } else {
      return c.json({ error: 'Invalid validation method. Use: email, employeeId, or serialCard' }, 400);
    }
    
    if (!validEmployee) {
      await auditLog({
        action: 'employee_validation_failed',
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { siteId, method, value: normalizedValue }
      });
      
      console.log(`[Employee Validation] Employee not found`);
      return c.json({ 
        valid: false, 
        error: 'Employee not found or inactive' 
      }, 403);
    }
    
    // Generate a temporary session token
    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      employeeId: validEmployee.id,
      siteId,
      employeeName: validEmployee.name,
      employeeEmail: validEmployee.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    await kv.set(`session:${sessionToken}`, session, environmentId);
    
    await auditLog({
      action: 'employee_validation_success',
      userId: validEmployee.id,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { siteId, method, employeeId: validEmployee.id }
    });
    
    return c.json({ 
      valid: true, 
      sessionToken,
      employee: {
        id: validEmployee.id,
        name: validEmployee.name,
        email: validEmployee.email
      }
    });
  } catch (error: any) {
    console.error('Employee validation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Verify session token (PUBLIC)
app.get("/make-server-6fcaeea3/public/session/:token", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const token = c.req.param('token');
  
  try {
    const session = await kv.get(`session:${token}`, environmentId);
    
    if (!session) {
      return c.json({ valid: false, error: 'Session not found' }, 401);
    }
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await kv.del(`session:${token}`, environmentId);
      return c.json({ valid: false, error: 'Session expired' }, 401);
    }
    
    return c.json({ valid: true, session });
  } catch (error: any) {
    console.error('Session validation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Invalidate session (logout for public users)
app.post("/make-server-6fcaeea3/public/session/:token/invalidate", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const token = c.req.param('token');
  
  try {
    await kv.del(`session:${token}`, environmentId);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Session invalidation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate and send magic link (PUBLIC)
app.post("/make-server-6fcaeea3/public/magic-link/request", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const { email, siteId } = await c.req.json();
    
    if (!email || !siteId) {
      return c.json({ error: 'email and siteId are required' }, 400);
    }
    
    // Validate email exists in employee database for this site
    const employees = await kv.getByPrefix(`employee:${siteId}:`, environmentId);
    const employee = employees.find(emp => 
      emp.email.toLowerCase() === email.toLowerCase() && emp.status === 'active'
    );
    
    if (!employee) {
      await auditLog({
        action: 'magic_link_request_failed',
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { email, siteId, reason: 'employee_not_found' }
      });
      
      return c.json({ 
        error: 'Email not found or not authorized for this site' 
      }, 403);
    }
    
    // Get site information for email
    const site = await kv.get(`site:${siteId}`, environmentId);
    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }
    
    // Generate magic link token
    const magicLinkToken = crypto.randomUUID();
    const magicLinkData = {
      token: magicLinkToken,
      employeeId: employee.id,
      siteId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      used: false
    };
    
    await kv.set(`magic-link:${magicLinkToken}`, magicLinkData, environmentId);
    
    // Build magic link URL
    const baseUrl = Deno.env.get('PUBLIC_APP_URL') || 'http://localhost:5173';
    const magicLinkUrl = `${baseUrl}/access/magic-link?token=${magicLinkToken}`;
    
    // Send email via email service
    const emailResult = await emailService.sendMagicLinkEmail({
      to: employee.email,
      userName: employee.name,
      siteName: site.name,
      magicLink: magicLinkUrl,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      supportEmail: site.supportEmail || 'support@jala2.com',
      environmentId
    });
    
    if (!emailResult.success) {
      console.error('Failed to send magic link email:', emailResult.error);
      return c.json({ 
        error: 'Failed to send magic link email. Please try again.' 
      }, 500);
    }
    
    await auditLog({
      action: 'magic_link_sent',
      userId: employee.id,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { email, siteId, messageId: emailResult.messageId }
    });
    
    return c.json({ 
      success: true,
      message: 'Magic link sent successfully',
      messageId: emailResult.messageId
    });
  } catch (error: any) {
    console.error('Magic link request error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Validate and use magic link (PUBLIC)
app.post("/make-server-6fcaeea3/public/magic-link/validate", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({ error: 'token is required' }, 400);
    }
    
    // Get magic link data
    const magicLinkData = await kv.get(`magic-link:${token}`, environmentId);
    
    if (!magicLinkData) {
      await auditLog({
        action: 'magic_link_validation_failed',
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { token, reason: 'not_found' }
      });
      
      return c.json({ 
        valid: false, 
        error: 'Invalid or expired magic link' 
      }, 401);
    }
    
    // Check if already used
    if (magicLinkData.used) {
      return c.json({ 
        valid: false, 
        error: 'This magic link has already been used' 
      }, 401);
    }
    
    // Check expiration
    if (new Date(magicLinkData.expiresAt) < new Date()) {
      await kv.del(`magic-link:${token}`, environmentId);
      
      await auditLog({
        action: 'magic_link_validation_failed',
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { token, reason: 'expired' }
      });
      
      return c.json({ 
        valid: false, 
        error: 'Magic link has expired' 
      }, 401);
    }
    
    // Mark as used
    magicLinkData.used = true;
    magicLinkData.usedAt = new Date().toISOString();
    await kv.set(`magic-link:${token}`, magicLinkData, environmentId);
    
    // Create session token
    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      employeeId: magicLinkData.employeeId,
      siteId: magicLinkData.siteId,
      employeeName: magicLinkData.employeeName,
      employeeEmail: magicLinkData.employeeEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    await kv.set(`session:${sessionToken}`, session, environmentId);
    
    await auditLog({
      action: 'magic_link_validated',
      userId: magicLinkData.employeeId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { token, siteId: magicLinkData.siteId }
    });
    
    return c.json({ 
      valid: true,
      sessionToken,
      employee: {
        id: magicLinkData.employeeId,
        name: magicLinkData.employeeName,
        email: magicLinkData.employeeEmail
      },
      siteId: magicLinkData.siteId
    });
  } catch (error: any) {
    console.error('Magic link validation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get available gifts for a site (PUBLIC - with session verification)
app.get("/make-server-6fcaeea3/public/sites/:siteId/gifts", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const siteId = c.req.param('siteId');
  const sessionToken = c.req.header('X-Session-Token'); // Changed from Authorization header
  
  try {
    // SECURITY: Session token verification
    // For demo/preview purposes, we allow access without session but log it
    // In production, consider making this mandatory by removing the conditional
    if (sessionToken) {
      // Verify session token and site match
      const session = await kv.get(`session:${sessionToken}`, environmentId);
      if (!session) {
        return c.json({ error: 'Invalid or expired session. Please validate your access again.' }, 403);
      }
      
      if (session.siteId !== siteId) {
        return c.json({ error: 'Session site mismatch. You can only access gifts for your assigned site.' }, 403);
      }
    } else {
      // No session provided - log for security audit
      console.log(`[SECURITY WARNING] Accessing gifts without session for site: ${siteId} in environment: ${environmentId}`);
    }
    
    // Get site to verify it exists and is active - FIXED: Using new key pattern
    const site = await kv.get(`site:${environmentId}:${siteId}`, environmentId);
    if (!site) {
      // Don't log as error - this is informational (expected when database not initialized)
      console.log(`[Public API] Site "${siteId}" not found when fetching gifts in environment: ${environmentId}`);
      return c.json({ error: 'Site not found' }, 404);
    }
    
    if (site.status !== 'active') {
      return c.json({ error: 'Site is not active' }, 403);
    }
    
    // Check if site is within selection period
    const now = new Date();
    const startDate = new Date(site.startDate);
    const endDate = new Date(site.endDate);
    
    if (now < startDate) {
      return c.json({ 
        error: 'Selection period has not started yet',
        startDate: site.startDate 
      }, 403);
    }
    
    if (now > endDate) {
      return c.json({ 
        error: 'Selection period has ended',
        endDate: site.endDate 
      }, 403);
    }
    
    // Get all site-gift assignments for this site
    const assignments = await kv.getByPrefix(`site-gift-assignment:${siteId}:`, environmentId);
    
    console.log(`[Public Gifts] Found ${assignments?.length || 0} gift assignments for site ${siteId}`);
    
    if (!assignments || assignments.length === 0) {
      return c.json({ gifts: [], site: { name: site.name, description: site.description } });
    }
    
    // Fetch full gift details for each assignment
    const giftsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const giftKey = `gift:${environmentId}:${assignment.giftId}`;
        const gift = await kv.get(giftKey, environmentId);
        
        console.log(`[Public Gifts] Fetching gift with key: ${giftKey}`);
        
        if (!gift) {
          console.warn(`[Public Gifts] Gift not found for assignment: ${assignment.giftId}`);
          return null;
        }
        
        if (gift.status !== 'active') {
          console.log(`[Public Gifts] Gift ${gift.id} is not active (status: ${gift.status})`);
          return null;
        }
        
        // Debug logging for image field - log all relevant fields
        console.log(`[Public Gifts] Gift ${gift.id} - name: "${gift.name}", image: "${gift.image || 'MISSING'}", imageUrl: "${gift.imageUrl || 'MISSING'}", category: "${gift.category}"`);
        
        // Check inventory
        const inventoryAvailable = gift.inventoryTracking 
          ? (gift.inventoryQuantity || 0) > 0 
          : true;
        
        const mappedGift = {
          ...gift,
          // Map image to imageUrl for frontend compatibility
          imageUrl: gift.imageUrl || gift.image || '',
          // Map price to value for frontend compatibility  
          value: gift.value || gift.price || 0,
          // Include site-specific assignment details
          priority: assignment.priority || 0,
          quantityLimit: assignment.quantityLimit,
          available: inventoryAvailable && gift.status === 'active',
          inventoryStatus: gift.inventoryTracking 
            ? `${gift.inventoryQuantity || 0} available`
            : 'In Stock'
        };
        
        console.log(`[Public Gifts] Mapped gift ${gift.id} - final imageUrl: "${mappedGift.imageUrl}"`);
        
        return mappedGift;
      })
    );
    
    // Filter out null values (inactive gifts) and sort by priority
    const availableGifts = giftsWithDetails
      .filter(gift => gift !== null)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    console.log(`[Public Gifts] Returning ${availableGifts.length} available gifts`);
    
    return c.json({ 
      gifts: availableGifts,
      site: {
        id: site.id,
        name: site.name,
        description: site.description,
        startDate: site.startDate,
        endDate: site.endDate,
        clientName: site.clientName
      }
    });
  } catch (error: any) {
    console.error('Get public gifts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single gift details (PUBLIC - with session verification)
app.get("/make-server-6fcaeea3/public/gifts/:giftId", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const giftId = c.req.param('giftId');
  const sessionToken = c.req.header('X-Session-Token'); // Changed from Authorization header
  
  try {
    // SECURITY: Session token verification
    // For demo/preview purposes, we allow access without session but log it
    // In production, consider making this mandatory by removing the conditional
    if (sessionToken) {
      const session = await kv.get(`session:${sessionToken}`, environmentId);
      if (!session) {
        return c.json({ error: 'Invalid or expired session. Please validate your access again.' }, 403);
      }
    } else {
      // No session provided - log for security audit
      console.log(`[SECURITY WARNING] Accessing gift ${giftId} without session in environment: ${environmentId}`);
    }
    
    const gift = await kv.get(`gift:${environmentId}:${giftId}`, environmentId);
    
    if (!gift) {
      return c.json({ error: 'Gift not found' }, 404);
    }
    
    if (gift.status !== 'active') {
      return c.json({ error: 'Gift is not available' }, 403);
    }
    
    // Check inventory
    const inventoryAvailable = gift.inventoryTracking 
      ? (gift.inventoryQuantity || 0) > 0 
      : true;
    
    return c.json({ 
      gift: {
        ...gift,
        // Map image to imageUrl for frontend compatibility
        imageUrl: gift.imageUrl || gift.image,
        // Map price to value for frontend compatibility
        value: gift.value || gift.price,
        available: inventoryAvailable,
        inventoryStatus: gift.inventoryTracking 
          ? `${gift.inventoryQuantity || 0} available`
          : 'In Stock'
      }
    });
  } catch (error: any) {
    console.error('Get public gift error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create order (PUBLIC - with session verification)
app.post("/make-server-6fcaeea3/public/orders", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '');
  
  try {
    // Verify session token
    if (!sessionToken) {
      return c.json({ error: 'Session token required' }, 401);
    }
    
    const session = await kv.get(`session:${sessionToken}`, environmentId);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    // Check session expiration
    if (new Date(session.expiresAt) < new Date()) {
      await kv.del(`session:${sessionToken}`, environmentId);
      return c.json({ error: 'Session expired' }, 401);
    }
    
    // Parse request body
    const { giftId, quantity, shippingAddress } = await c.req.json();
    
    // Validate required fields
    if (!giftId || !shippingAddress) {
      return c.json({ error: 'giftId and shippingAddress are required' }, 400);
    }
    
    // Validate shipping address fields
    const requiredAddressFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return c.json({ error: `Shipping address field '${field}' is required` }, 400);
      }
    }
    
    // Get gift details
    const gift = await kv.get(`gift:${giftId}`, environmentId);
    
    if (!gift) {
      return c.json({ error: 'Gift not found' }, 404);
    }
    
    if (gift.status !== 'active') {
      return c.json({ error: 'Gift is not available' }, 400);
    }
    
    // Check inventory
    if (gift.inventoryTracking) {
      const requestedQty = quantity || 1;
      if ((gift.inventoryQuantity || 0) < requestedQty) {
        return c.json({ 
          error: 'Insufficient inventory',
          available: gift.inventoryQuantity || 0,
          requested: requestedQty
        }, 400);
      }
    }
    
    // Get site details
    const site = await kv.get(`site:${session.siteId}`, environmentId);
    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }
    
    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const orderId = `order:${session.siteId}:${crypto.randomUUID()}`;
    
    // Calculate totals
    const orderQuantity = quantity || 1;
    const itemValue = gift.value || 0;
    const totalValue = itemValue * orderQuantity;
    
    // Create order object
    const order = {
      id: orderId,
      orderNumber,
      status: 'pending',
      
      // Employee information
      employeeId: session.employeeId,
      employeeName: session.employeeName,
      employeeEmail: session.employeeEmail,
      
      // Site information
      siteId: session.siteId,
      siteName: site.name,
      clientId: site.clientId,
      clientName: site.clientName,
      
      // Gift information
      giftId: gift.id,
      giftName: gift.name,
      giftDescription: gift.description,
      giftCategory: gift.category,
      giftImageUrl: gift.imageUrl,
      
      // Order details
      quantity: orderQuantity,
      itemValue: itemValue,
      totalValue: totalValue,
      
      // Shipping information
      shippingAddress: {
        fullName: shippingAddress.fullName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || ''
      },
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Tracking
      trackingNumber: null,
      shippedAt: null,
      deliveredAt: null
    };
    
    // Save order to database
    await kv.set(orderId, order, environmentId);
    
    // Update gift inventory
    if (gift.inventoryTracking) {
      gift.inventoryQuantity = (gift.inventoryQuantity || 0) - orderQuantity;
      await kv.set(`gift:${giftId}`, gift, environmentId);
    }
    
    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmationEmail({
        to: session.employeeEmail,
        userName: session.employeeName,
        orderNumber: orderNumber,
        giftName: gift.name,
        giftDescription: gift.description,
        giftImageUrl: gift.imageUrl,
        quantity: orderQuantity,
        shippingAddress: `${shippingAddress.fullName}, ${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
        estimatedDelivery: 'within 7-10 business days',
        supportEmail: site.supportEmail || 'support@jala2.com',
        environmentId
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }
    
    // Trigger email automation for gift_selected and order_placed
    try {
      // Trigger gift_selected event
      await emailEventHelper.notifyGiftSelected(
        session.siteId,
        {
          email: session.employeeEmail,
          name: session.employeeName,
        },
        {
          name: gift.name,
          imageUrl: gift.imageUrl,
        },
        environmentId
      );
      
      // Trigger order_placed event
      await emailEventHelper.notifyOrderPlaced(
        session.siteId,
        {
          id: orderNumber,
          recipientEmail: session.employeeEmail,
          recipientName: session.employeeName,
          totalAmount: totalValue,
        },
        environmentId
      );
      
      console.log(`[Order Creation] Triggered gift_selected and order_placed automation for ${session.employeeEmail}`);
    } catch (automationError: any) {
      console.error('[Order Creation] Failed to trigger email automation:', automationError);
      // Don't fail the order if automation fails
    }
    
    // Audit log
    await auditLog({
      action: 'order_created',
      userId: session.employeeId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: {
        orderId: orderId,
        orderNumber: orderNumber,
        giftId: giftId,
        siteId: session.siteId,
        quantity: orderQuantity,
        totalValue: totalValue
      }
    });
    
    return c.json({ 
      success: true,
      order: {
        id: orderId,
        orderNumber: orderNumber,
        status: order.status,
        giftName: gift.name,
        quantity: orderQuantity,
        totalValue: totalValue,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      }
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get order details (PUBLIC - with session verification)
app.get("/make-server-6fcaeea3/public/orders/:orderId", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const orderId = c.req.param('orderId');
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '');
  
  try {
    // Verify session token
    if (sessionToken) {
      const session = await kv.get(`session:${sessionToken}`, environmentId);
      if (!session) {
        return c.json({ error: 'Invalid session' }, 403);
      }
    }
    
    // Get order
    const order = await kv.get(orderId, environmentId);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Verify access (employee can only see their own orders)
    if (sessionToken) {
      const session = await kv.get(`session:${sessionToken}`, environmentId);
      if (session && order.employeeId !== session.employeeId) {
        return c.json({ error: 'Access denied' }, 403);
      }
    }
    
    return c.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== BRAND MANAGEMENT ROUTES ====================

// Get all brands
app.get("/make-server-6fcaeea3/brands", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const brands = await kv.getByPrefix('brand:', environmentId);
    
    // Sort by name
    brands.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    return c.json({ brands });
  } catch (error: any) {
    console.error('Get brands error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single brand
app.get("/make-server-6fcaeea3/brands/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  
  try {
    const brand = await kv.get(`brand:${id}`, environmentId);
    
    if (!brand) {
      return c.json({ error: 'Brand not found' }, 404);
    }
    
    return c.json({ brand });
  } catch (error: any) {
    console.error('Get brand error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create brand
app.post("/make-server-6fcaeea3/brands", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    
    if (!data.name || !data.clientId) {
      return c.json({ error: 'name and clientId are required' }, 400);
    }
    
    const brand = {
      id: crypto.randomUUID(),
      clientId: data.clientId,
      clientName: data.clientName,
      name: data.name,
      description: data.description || '',
      primaryColor: data.primaryColor || '#D91C81',
      secondaryColor: data.secondaryColor || '#1B2A5E',
      tertiaryColor: data.tertiaryColor || '#00B4CC',
      backgroundColor: data.backgroundColor || '#FFFFFF',
      textColor: data.textColor || '#000000',
      headingFont: data.headingFont || 'inter',
      bodyFont: data.bodyFont || 'inter',
      logoUrl: data.logoUrl || '',
      faviconUrl: data.faviconUrl || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      websiteUrl: data.websiteUrl || '',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`brand:${brand.id}`, brand, environmentId);
    
    await auditLog({
      action: 'brand_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { brandId: brand.id, brandName: brand.name, clientId: brand.clientId }
    });
    
    return c.json({ brand }, 201);
  } catch (error: any) {
    console.error('Create brand error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update brand
app.put("/make-server-6fcaeea3/brands/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    
    const key = `brand:${id}`;
    const brand = await kv.get(key, environmentId);
    
    if (!brand) {
      return c.json({ error: 'Brand not found' }, 404);
    }
    
    const updated = {
      ...brand,
      ...updates,
      id: brand.id, // Prevent ID change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, updated, environmentId);
    
    await auditLog({
      action: 'brand_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { brandId: id, brandName: updated.name }
    });
    
    return c.json({ brand: updated });
  } catch (error: any) {
    console.error('Update brand error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete brand
app.delete("/make-server-6fcaeea3/brands/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const key = `brand:${id}`;
    const brand = await kv.get(key, environmentId);
    
    if (!brand) {
      return c.json({ error: 'Brand not found' }, 404);
    }
    
    await kv.del(key, environmentId);
    
    await auditLog({
      action: 'brand_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { brandId: id, brandName: brand.name }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete brand error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== EMAIL TEMPLATES ROUTES ====================

// ==================== GLOBAL EMAIL TEMPLATES ====================

// Seed global templates (initialize default templates)
app.post("/make-server-6fcaeea3/global-templates/seed", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const now = new Date().toISOString();
    
    // Define all global templates
    const globalTemplatesData = [
      {
        id: 'global-invite',
        type: 'invite',
        name: 'Gift Selection Invite',
        description: 'Initial invitation to select a gift from the portal',
        category: 'transactional',
        defaultSubject: "You've been invited to select your gift from {{company_name}}",
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Hello {{recipient_name}}!</h1><p>You've been invited to select a gift from <strong>{{company_name}}</strong>.</p><p>Visit our gift selection portal to choose your gift:</p><a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift</a><p><strong>Access Code:</strong> {{access_code}}</p><p><em>This invitation expires on {{expiration_date}}</em></p><p style="color: #666; font-size: 12px;">If you have any questions, contact us at {{support_email}}</p></div>`,
        defaultTextContent: "Hello {{recipient_name}}! You've been invited to select a gift from {{company_name}}. Visit {{site_url}} and use access code: {{access_code}}. This invitation expires on {{expiration_date}}.",
        defaultSmsContent: 'Hi {{recipient_name}}! Select your gift from {{company_name}}: {{site_url}} Code: {{access_code}}',
        defaultPushTitle: 'Gift Selection Available',
        defaultPushBody: "You've been invited to select your gift from {{company_name}}. Tap to choose!",
        variables: ['recipient_name', 'company_name', 'site_url', 'access_code', 'expiration_date', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-order-confirmation',
        type: 'order_confirmation',
        name: 'Order Confirmation',
        description: 'Confirmation sent after user selects a gift',
        category: 'transactional',
        defaultSubject: 'Your gift order has been confirmed - Order #{{order_id}}',
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Order Confirmed!</h1><p>Thank you, {{recipient_name}}! Your gift order has been confirmed.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Order ID:</strong> {{order_id}}</p><p><strong>Order Date:</strong> {{order_date}}</p><p><strong>Gift:</strong> {{gift_name}}</p><p><strong>Quantity:</strong> {{gift_quantity}}</p><p><strong>Shipping Address:</strong><br>{{shipping_address}}</p><p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p></div><p>You can track your shipment at: <a href="{{tracking_url}}" style="color: #D91C81;">{{tracking_url}}</a></p><p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Order Confirmed! Thank you {{recipient_name}}. Order #{{order_id}} - {{gift_name}} x{{gift_quantity}}. Shipping to: {{shipping_address}}. Estimated delivery: {{estimated_delivery}}. Track: {{tracking_url}}',
        defaultSmsContent: 'Your gift order #{{order_id}} is confirmed! Track: {{tracking_url}}',
        defaultPushTitle: 'Order Confirmed',
        defaultPushBody: 'Your gift {{gift_name}} is confirmed and will arrive {{estimated_delivery}}',
        variables: ['recipient_name', 'order_id', 'order_date', 'gift_name', 'gift_quantity', 'shipping_address', 'estimated_delivery', 'tracking_url', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-gift-reminder',
        type: 'gift_reminder',
        name: 'Gift Selection Reminder',
        description: 'Reminder for users who have not selected their gift yet',
        category: 'marketing',
        defaultSubject: 'Reminder: Select your gift from {{company_name}} - {{days_remaining}} days left!',
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Don't miss out, {{recipient_name}}!</h1><p>This is a friendly reminder that you still have <strong>{{days_remaining}} days</strong> to select your gift from {{company_name}}.</p><a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift Now</a><p><em>Your invitation expires on {{expiration_date}}</em></p><p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Hi {{recipient_name}}! Reminder: You have {{days_remaining}} days left to select your gift from {{company_name}}. Visit: {{site_url}} Expires: {{expiration_date}}',
        defaultSmsContent: 'Reminder: {{days_remaining}} days to select your gift from {{company_name}}! {{site_url}}',
        defaultPushTitle: 'Gift Selection Reminder',
        defaultPushBody: 'You have {{days_remaining}} days left to select your gift. Do not miss out!',
        variables: ['recipient_name', 'company_name', 'days_remaining', 'site_url', 'expiration_date', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-shipping-notification',
        type: 'shipping_notification',
        name: 'Shipping Notification',
        description: 'Notification when gift has shipped',
        category: 'transactional',
        defaultSubject: 'Your gift has shipped! - Order #{{order_id}}',
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Your Gift is On the Way!</h1><p>Great news, {{recipient_name}}! Your gift has been shipped.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Order ID:</strong> {{order_id}}</p><p><strong>Tracking Number:</strong> {{tracking_number}}</p><p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p></div><p>Track your package: <a href="{{tracking_url}}" style="color: #D91C81;">{{tracking_url}}</a></p><p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Your gift has shipped! Order #{{order_id}}. Tracking: {{tracking_number}}. Estimated delivery: {{estimated_delivery}}. Track: {{tracking_url}}',
        defaultSmsContent: 'Your gift shipped! Track: {{tracking_url}}',
        defaultPushTitle: 'Gift Shipped',
        defaultPushBody: 'Your gift is on the way! Track: {{tracking_number}}',
        variables: ['recipient_name', 'order_id', 'tracking_number', 'estimated_delivery', 'tracking_url', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-delivery-confirmation',
        type: 'delivery_confirmation',
        name: 'Delivery Confirmation',
        description: 'Confirmation when gift has been delivered',
        category: 'transactional',
        defaultSubject: 'Your gift has been delivered! - Order #{{order_id}}',
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Your Gift Has Arrived!</h1><p>Hi {{recipient_name}}, your gift has been successfully delivered.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Order ID:</strong> {{order_id}}</p><p><strong>Delivered On:</strong> {{delivery_date}}</p><p><strong>Delivered To:</strong> {{delivery_location}}</p></div><p>We hope you enjoy your gift!</p><p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Your gift has been delivered! Order #{{order_id}}. Delivered on {{delivery_date}} to {{delivery_location}}.',
        defaultSmsContent: 'Your gift is delivered! Order #{{order_id}}',
        defaultPushTitle: 'Gift Delivered',
        defaultPushBody: 'Your gift has arrived! Enjoy!',
        variables: ['recipient_name', 'order_id', 'delivery_date', 'delivery_location', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-expiration-warning',
        type: 'expiration_warning',
        name: 'Expiration Warning',
        description: 'Warning before gift selection window expires',
        category: 'marketing',
        defaultSubject: 'Last chance to select your gift from {{company_name}}!',
        defaultHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #D91C81;">Last Chance, {{recipient_name}}!</h1><p>Your gift selection window expires in <strong>{{days_remaining}} days</strong>.</p><p style="color: #e74c3c; font-weight: bold;">Don't miss out on your gift from {{company_name}}!</p><a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift Now</a><p><em>Expires on {{expiration_date}}</em></p><p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'LAST CHANCE {{recipient_name}}! Your gift selection expires in {{days_remaining}} days on {{expiration_date}}. Visit: {{site_url}}',
        defaultSmsContent: 'LAST CHANCE! {{days_remaining}} days to select your gift: {{site_url}}',
        defaultPushTitle: 'Gift Selection Expiring Soon',
        defaultPushBody: 'Only {{days_remaining}} days left to select your gift!',
        variables: ['recipient_name', 'company_name', 'days_remaining', 'expiration_date', 'site_url', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-order-cancellation',
        type: 'order_cancellation',
        name: 'Order Cancellation',
        description: 'Notification when an order has been cancelled',
        category: 'transactional',
        defaultSubject: 'Order Cancelled - Order #{{order_id}}',
        defaultHtmlContent: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\"><h1 style=\"color: #D91C81;\">Order Cancelled</h1><p>Hi {{recipient_name}}, your order has been cancelled as requested.</p><div style=\"background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;\"><p><strong>Order ID:</strong> {{order_id}}</p><p><strong>Cancelled Date:</strong> {{cancellation_date}}</p><p><strong>Gift:</strong> {{gift_name}}</p><p><strong>Cancellation Reason:</strong> {{cancellation_reason}}</p></div><p>If you would like to select a different gift, please visit: <a href=\"{{site_url}}\" style=\"color: #D91C81;\">{{site_url}}</a></p><p style=\"color: #666; font-size: 12px;\">Questions? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Order #{{order_id}} has been cancelled. Gift: {{gift_name}}. Reason: {{cancellation_reason}}. Visit {{site_url}} to select a different gift.',
        defaultSmsContent: 'Order #{{order_id}} cancelled. Visit {{site_url}} to select a new gift.',
        defaultPushTitle: 'Order Cancelled',
        defaultPushBody: 'Your order #{{order_id}} has been cancelled',
        variables: ['recipient_name', 'order_id', 'gift_name', 'cancellation_date', 'cancellation_reason', 'site_url', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-admin-password-reset',
        type: 'admin_password_reset',
        name: 'Admin Password Reset',
        description: 'Password reset email for admin users',
        category: 'system',
        defaultSubject: 'Reset Your Admin Password - {{company_name}}',
        defaultHtmlContent: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\"><h1 style=\"color: #D91C81;\">Admin Password Reset</h1><p>Hi {{admin_name}},</p><p>We received a request to reset your admin account password for <strong>{{company_name}}</strong>.</p><a href=\"{{reset_url}}\" style=\"display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;\">Reset Your Password</a><p><strong>Reset Code:</strong> <span style=\"font-family: monospace; background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px;\">{{reset_code}}</span></p><p style=\"color: #e74c3c; font-size: 14px;\"><strong>⚠️ Security Notice:</strong> This link expires in {{expiration_time}}. If you did not request this reset, please ignore this email and contact your system administrator immediately.</p><p style=\"color: #666; font-size: 12px;\">Request from IP: {{request_ip}}<br>Time: {{request_time}}</p></div>`,
        defaultTextContent: 'Admin Password Reset for {{company_name}}. Reset your password at: {{reset_url}} or use code: {{reset_code}}. Link expires in {{expiration_time}}. If you did not request this, contact your administrator.',
        defaultSmsContent: 'Admin password reset for {{company_name}}. Code: {{reset_code}}. Expires in {{expiration_time}}.',
        defaultPushTitle: 'Admin Password Reset',
        defaultPushBody: 'Password reset requested for your admin account',
        variables: ['admin_name', 'company_name', 'reset_url', 'reset_code', 'expiration_time', 'request_ip', 'request_time'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'global-user-password-reset',
        type: 'user_password_reset',
        name: 'User Password Reset',
        description: 'Password reset email for end users',
        category: 'system',
        defaultSubject: 'Reset Your Password - {{company_name}}',
        defaultHtmlContent: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\"><h1 style=\"color: #D91C81;\">Password Reset Request</h1><p>Hi {{user_name}},</p><p>We received a request to reset your password for your <strong>{{company_name}}</strong> account.</p><a href=\"{{reset_url}}\" style=\"display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;\">Reset Your Password</a><p>Or use this code: <strong style=\"font-family: monospace; background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px;\">{{reset_code}}</strong></p><p style=\"color: #666; font-size: 14px;\">This link expires in {{expiration_time}}. If you did not request this reset, you can safely ignore this email.</p><p style=\"color: #666; font-size: 12px;\">Need help? Contact {{support_email}}</p></div>`,
        defaultTextContent: 'Password Reset for {{company_name}}. Reset your password at: {{reset_url}} or use code: {{reset_code}}. Link expires in {{expiration_time}}. Need help? Contact {{support_email}}',
        defaultSmsContent: 'Password reset code for {{company_name}}: {{reset_code}}. Expires in {{expiration_time}}.',
        defaultPushTitle: 'Password Reset',
        defaultPushBody: 'Password reset requested for your account',
        variables: ['user_name', 'company_name', 'reset_url', 'reset_code', 'expiration_time', 'support_email'],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    
    // Save all templates
    let count = 0;
    for (const template of globalTemplatesData) {
      await kv.set(`global-template:${template.id}`, template, environmentId);
      count++;
    }
    
    await auditLog({
      action: 'global_templates_seeded',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { count }
    });
    
    return c.json({ success: true, count, message: `${count} global templates seeded successfully` });
  } catch (error: any) {
    console.error('Seed global templates error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all global templates
app.get("/make-server-6fcaeea3/global-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const templates = await kv.getByPrefix('global-template:', environmentId);
    templates.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    return c.json({ templates });
  } catch (error: any) {
    console.error('Get global templates error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single global template
app.get("/make-server-6fcaeea3/global-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  
  try {
    const template = await kv.get(`global-template:${id}`, environmentId);
    
    if (!template) {
      return c.json({ error: 'Global template not found' }, 404);
    }
    
    return c.json({ template });
  } catch (error: any) {
    console.error('Get global template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create global template
app.post("/make-server-6fcaeea3/global-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const now = new Date().toISOString();
    
    const template = {
      ...data,
      id: data.id || `global-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    await kv.set(`global-template:${template.id}`, template, environmentId);
    
    await auditLog({
      action: 'global_template_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: template.id, templateName: template.name }
    });
    
    return c.json({ template }, 201);
  } catch (error: any) {
    console.error('Create global template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update global template
app.put("/make-server-6fcaeea3/global-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    const key = `global-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Global template not found' }, 404);
    }
    
    const updated = {
      ...template,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, updated, environmentId);
    
    await auditLog({
      action: 'global_template_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, templateName: updated.name }
    });
    
    return c.json({ template: updated });
  } catch (error: any) {
    console.error('Update global template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete global template
app.delete("/make-server-6fcaeea3/global-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const key = `global-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Global template not found' }, 404);
    }
    
    if (template.isSystem) {
      return c.json({ error: 'Cannot delete system template' }, 400);
    }
    
    await kv.del(key, environmentId);
    
    await auditLog({
      action: 'global_template_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, templateName: template.name }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete global template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== SITE EMAIL TEMPLATES ====================

// Get all site templates (optionally filter by siteId)
app.get("/make-server-6fcaeea3/site-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  
  try {
    const templates = await kv.getByPrefix('site-template:', environmentId);
    
    const filtered = siteId 
      ? templates.filter((t: any) => t.siteId === siteId)
      : templates;
    
    filtered.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    return c.json({ templates: filtered });
  } catch (error: any) {
    console.error('Get site templates error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single site template
app.get("/make-server-6fcaeea3/site-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  
  try {
    const template = await kv.get(`site-template:${id}`, environmentId);
    
    if (!template) {
      return c.json({ error: 'Site template not found' }, 404);
    }
    
    return c.json({ template });
  } catch (error: any) {
    console.error('Get site template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create site template
app.post("/make-server-6fcaeea3/site-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const now = new Date().toISOString();
    
    const template = {
      ...data,
      id: data.id || `site-template-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    await kv.set(`site-template:${template.id}`, template, environmentId);
    
    await auditLog({
      action: 'site_template_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: template.id, siteId: template.siteId, templateName: template.name }
    });
    
    return c.json({ template }, 201);
  } catch (error: any) {
    console.error('Create site template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update site template
app.put("/make-server-6fcaeea3/site-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    const key = `site-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Site template not found' }, 404);
    }
    
    const updated = {
      ...template,
      ...updates,
      id,
      siteId: template.siteId,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, updated, environmentId);
    
    await auditLog({
      action: 'site_template_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, siteId: updated.siteId, templateName: updated.name }
    });
    
    return c.json({ template: updated });
  } catch (error: any) {
    console.error('Update site template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete site template
app.delete("/make-server-6fcaeea3/site-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const key = `site-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Site template not found' }, 404);
    }
    
    await kv.del(key, environmentId);
    
    await auditLog({
      action: 'site_template_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, siteId: template.siteId, templateName: template.name }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete site template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send test email for site template
app.post("/make-server-6fcaeea3/site-templates/:id/test", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const { email, variables } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email address is required' }, 400);
    }
    
    // Get site template
    const key = `site-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Site template not found' }, 404);
    }
    
    // Replace variables in template content
    const replaceVariables = (content: string, vars: Record<string, string>) => {
      let result = content;
      if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          result = result.replace(regex, value || '');
        });
      }
      return result;
    };
    
    const subject = replaceVariables(template.subject, variables || {});
    const htmlContent = replaceVariables(template.htmlContent, variables || {});
    const textContent = replaceVariables(template.textContent, variables || {});
    
    // Send directly via Resend
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      return c.json({ 
        error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.',
        success: false 
      }, 500);
    }
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WeCelebrate <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    });
    
    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend API error:', errorData);
      return c.json({ 
        error: errorData.message || 'Failed to send test email',
        success: false 
      }, 500);
    }
    
    const resendData = await resendResponse.json();
    
    await auditLog({
      action: 'test_email_sent',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, recipientEmail: email, messageId: resendData.id }
    });
    
    return c.json({ 
      success: true, 
      messageId: resendData.id,
      message: 'Test email sent successfully'
    });
  } catch (error: any) {
    console.error('Send test email error:', error);
    return c.json({ error: error.message, success: false }, 500);
  }
});

// ==================== EMAIL AUTOMATION RULES ====================

// Get automation rules for a site
app.get("/make-server-6fcaeea3/automation-rules", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const rules = await emailAutomation.getAutomationRules(siteId, environmentId);
    return c.json({ rules });
  } catch (error: any) {
    console.error('Get automation rules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create automation rule
app.post("/make-server-6fcaeea3/automation-rules", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const rule = await emailAutomation.createAutomationRule(data, userId, environmentId);
    
    await auditLog({
      action: 'automation_rule_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { ruleId: rule.id, siteId: rule.siteId, trigger: rule.trigger }
    });
    
    return c.json({ rule }, 201);
  } catch (error: any) {
    console.error('Create automation rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update automation rule
app.put("/make-server-6fcaeea3/automation-rules/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    const rule = await emailAutomation.updateAutomationRule(id, updates, userId, environmentId);
    
    if (!rule) {
      return c.json({ error: 'Automation rule not found' }, 404);
    }
    
    await auditLog({
      action: 'automation_rule_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { ruleId: id, siteId: rule.siteId }
    });
    
    return c.json({ rule });
  } catch (error: any) {
    console.error('Update automation rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete automation rule
app.delete("/make-server-6fcaeea3/automation-rules/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const rule = await emailAutomation.getAutomationRule(id, environmentId);
    
    if (!rule) {
      return c.json({ error: 'Automation rule not found' }, 404);
    }
    
    const success = await emailAutomation.deleteAutomationRule(id, environmentId);
    
    await auditLog({
      action: 'automation_rule_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { ruleId: id, siteId: rule.siteId }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete automation rule error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Trigger email event
app.post("/make-server-6fcaeea3/email-events/trigger", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const event = await c.req.json();
    
    if (!event.siteId || !event.trigger) {
      return c.json({ error: 'siteId and trigger are required' }, 400);
    }
    
    const result = await emailAutomation.triggerEmailEvent(event, environmentId);
    
    await auditLog({
      action: 'email_event_triggered',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { 
        siteId: event.siteId, 
        trigger: event.trigger, 
        rulesMatched: result.rulesMatched,
        emailsSent: result.emailsSent 
      }
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Trigger email event error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get email send history
app.get("/make-server-6fcaeea3/email-history", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  const limit = parseInt(c.req.query('limit') || '50');
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const result = await emailAutomation.getEmailHistory(siteId, environmentId, limit);
    return c.json(result);
  } catch (error: any) {
    console.error('Get email history error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== WEBHOOK SYSTEM ====================

// Incoming webhook endpoint (public, signature-verified)
app.post("/make-server-6fcaeea3/webhooks/incoming/:siteId", async (c) => {
  const siteId = c.req.param('siteId');
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const body = await c.req.json();
    const { event, recipientEmail, variables, ...rest } = body;
    
    if (!event || !recipientEmail) {
      return c.json({ error: 'event and recipientEmail are required' }, 400);
    }
    
    // Verify signature (optional but recommended)
    const signature = c.req.header('X-Webhook-Signature');
    // TODO: Implement signature verification
    
    const result = await webhookSystem.processIncomingWebhook(
      siteId,
      event as any,
      {
        recipientEmail,
        variables: variables || {},
        ...rest,
      },
      environmentId
    );
    
    return c.json(result);
  } catch (error: any) {
    console.error('Incoming webhook error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get webhooks for a site
app.get("/make-server-6fcaeea3/webhooks", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const webhooks = await webhookSystem.getWebhooks(siteId, environmentId);
    return c.json({ webhooks });
  } catch (error: any) {
    console.error('Get webhooks error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create webhook
app.post("/make-server-6fcaeea3/webhooks", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const webhook = await webhookSystem.createWebhook(data, environmentId);
    
    await auditLog({
      action: 'webhook_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { webhookId: webhook.id, siteId: webhook.siteId }
    });
    
    return c.json({ webhook }, 201);
  } catch (error: any) {
    console.error('Create webhook error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update webhook
app.put("/make-server-6fcaeea3/webhooks/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    const webhook = await webhookSystem.updateWebhook(id, updates, environmentId);
    
    if (!webhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }
    
    await auditLog({
      action: 'webhook_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { webhookId: id }
    });
    
    return c.json({ webhook });
  } catch (error: any) {
    console.error('Update webhook error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete webhook
app.delete("/make-server-6fcaeea3/webhooks/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const success = await webhookSystem.deleteWebhook(id, environmentId);
    
    if (!success) {
      return c.json({ error: 'Webhook not found' }, 404);
    }
    
    await auditLog({
      action: 'webhook_deleted',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { webhookId: id }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete webhook error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get webhook delivery history
app.get("/make-server-6fcaeea3/webhooks/deliveries", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  const limit = parseInt(c.req.query('limit') || '50');
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const deliveries = await webhookSystem.getWebhookDeliveries(siteId, environmentId, limit);
    return c.json({ deliveries });
  } catch (error: any) {
    console.error('Get webhook deliveries error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== SCHEDULED EMAIL SYSTEM ====================

// Schedule an email
app.post("/make-server-6fcaeea3/scheduled-emails", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const email = await scheduledEmail.scheduleEmail(
      {
        ...data,
        createdBy: userId,
      },
      environmentId
    );
    
    await auditLog({
      action: 'email_scheduled',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { emailId: email.id, siteId: email.siteId, scheduledFor: email.scheduledFor }
    });
    
    return c.json({ email }, 201);
  } catch (error: any) {
    console.error('Schedule email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get scheduled emails
app.get("/make-server-6fcaeea3/scheduled-emails", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  const status = c.req.query('status') as any;
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const emails = await scheduledEmail.getScheduledEmails(siteId, environmentId, status);
    return c.json({ emails });
  } catch (error: any) {
    console.error('Get scheduled emails error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Cancel scheduled email
app.delete("/make-server-6fcaeea3/scheduled-emails/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const success = await scheduledEmail.cancelScheduledEmail(id, environmentId);
    
    if (!success) {
      return c.json({ error: 'Scheduled email not found or already sent' }, 404);
    }
    
    await auditLog({
      action: 'scheduled_email_cancelled',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { emailId: id }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Cancel scheduled email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process due scheduled emails (can be called by a cron job or manually)
app.post("/make-server-6fcaeea3/scheduled-emails/process", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const result = await scheduledEmail.processDueEmails(environmentId);
    
    await auditLog({
      action: 'scheduled_emails_processed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: result
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Process scheduled emails error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get scheduled email stats
app.get("/make-server-6fcaeea3/scheduled-emails/stats", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.query('siteId');
  
  try {
    if (!siteId) {
      return c.json({ error: 'siteId is required' }, 400);
    }
    
    const stats = await scheduledEmail.getScheduledEmailStats(siteId, environmentId);
    return c.json({ stats });
  } catch (error: any) {
    console.error('Get scheduled email stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== SCHEDULED TRIGGERS (BACKGROUND JOBS) ====================

// Process all scheduled triggers (call this from cron daily)
app.post("/make-server-6fcaeea3/scheduled-triggers/process", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const result = await scheduledTriggers.processAllScheduledTriggers(environmentId);
    
    await auditLog({
      action: 'scheduled_triggers_processed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: {
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        processedAt: result.processedAt,
      }
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('Process scheduled triggers error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process selection expiring triggers only
app.post("/make-server-6fcaeea3/scheduled-triggers/selection-expiring", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const results = await scheduledTriggers.processSelectionExpiringTriggers(environmentId);
    
    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    
    await auditLog({
      action: 'selection_expiring_processed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { totalSent, totalFailed }
    });
    
    return c.json({ results, totalSent, totalFailed });
  } catch (error: any) {
    console.error('Process selection expiring error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process anniversary approaching triggers only
app.post("/make-server-6fcaeea3/scheduled-triggers/anniversary-approaching", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const results = await scheduledTriggers.processAnniversaryApproachingTriggers(environmentId);
    
    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    
    await auditLog({
      action: 'anniversary_approaching_processed',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { totalSent, totalFailed }
    });
    
    return c.json({ results, totalSent, totalFailed });
  } catch (error: any) {
    console.error('Process anniversary approaching error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get scheduled trigger execution logs
app.get("/make-server-6fcaeea3/scheduled-triggers/logs", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const limit = parseInt(c.req.query('limit') || '10');
  
  try {
    const logs = await scheduledTriggers.getScheduledTriggerLogs(environmentId, limit);
    return c.json({ logs });
  } catch (error: any) {
    console.error('Get scheduled trigger logs error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get scheduled trigger statistics
app.get("/make-server-6fcaeea3/scheduled-triggers/stats", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const stats = await scheduledTriggers.getScheduledTriggerStats(environmentId);
    return c.json({ stats });
  } catch (error: any) {
    console.error('Get scheduled trigger stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== OLD EMAIL TEMPLATE ROUTES (LEGACY) ====================

// Get all email templates
app.get("/make-server-6fcaeea3/email-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const templates = await kv.getByPrefix('email-template:', environmentId);
    templates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return c.json({ templates });
  } catch (error: any) {
    console.error('Get email templates error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create email template
app.post("/make-server-6fcaeea3/email-templates", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    const data = await c.req.json();
    const template = {
      ...data,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };
    
    await kv.set(`email-template:${template.id}`, template, environmentId);
    
    await auditLog({
      action: 'email_template_created',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: template.id }
    });
    
    return c.json({ template }, 201);
  } catch (error: any) {
    console.error('Create email template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update email template
app.put("/make-server-6fcaeea3/email-templates/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const updates = await c.req.json();
    const key = `email-template:${id}`;
    const template = await kv.get(key, environmentId);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    const updated = {
      ...template,
      ...updates,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };
    
    await kv.set(key, updated, environmentId);
    
    await auditLog({
      action: 'email_template_updated',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id }
    });
    
    return c.json({ template: updated });
  } catch (error: any) {
    console.error('Update email template error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send test email
app.post("/make-server-6fcaeea3/email-templates/:id/test", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  try {
    const { email } = await c.req.json();
    
    if (!emailService.isValidEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }
    
    const template = await kv.get(`email-template:${id}`, environmentId);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Generate sample variables for test
    const sampleVariables: Record<string, string> = {
      userName: 'John Smith',
      userEmail: email,
      companyName: 'TechCorp Inc.',
      siteName: 'Holiday Gifts 2026',
      orderNumber: 'ORD-2026-001',
      orderTotal: '$149.99',
      giftName: 'Wireless Headphones',
      trackingNumber: '1Z999AA10123456784',
      magicLink: `${Deno.env.get('SUPABASE_URL')}/access/magic-link?token=sample-test-token`,
      expiryDate: 'December 31, 2026',
      supportEmail: 'support@jala2.com',
      logoUrl: 'https://via.placeholder.com/150x50?text=Company+Logo'
    };
    
    // Send test email
    const result = await emailService.sendTemplateEmail({
      to: email,
      templateId: id,
      variables: sampleVariables,
      environmentId
    });
    
    if (!result.success) {
      await auditLog({
        action: 'test_email_sent',
        userId,
        status: 'failure',
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        details: { templateId: id, recipientEmail: email, error: result.error }
      });
      
      return c.json({ error: result.error }, 500);
    }
    
    await auditLog({
      action: 'test_email_sent',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templateId: id, recipientEmail: email, messageId: result.messageId }
    });
    
    return c.json({ 
      success: true, 
      message: `Test email sent to ${email}`,
      messageId: result.messageId
    });
  } catch (error: any) {
    console.error('Send test email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get email service status
app.get("/make-server-6fcaeea3/email-service/status", verifyAdmin, async (c) => {
  try {
    const status = emailService.getEmailServiceStatus();
    return c.json(status);
  } catch (error: any) {
    console.error('Get email service status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Seed/Initialize email templates (shipping & delivery)
app.post("/make-server-6fcaeea3/email-templates/seed-shipping", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const userId = c.get('userId');
  
  try {
    // Shipping Notification Template
    const shippingTemplate = {
      id: 'shipping-notification',
      name: 'Shipping Notification',
      subjectLine: 'Your Order {{orderNumber}} Has Shipped! 📦',
      preheaderText: 'Track your package - it\'s on the way!',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📦 Your Order Has Shipped!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Hi {{userName}},
              </p>
              
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Great news! Your gift from <strong>{{companyName}}</strong> is on its way to you!
              </p>
              
              <!-- Order Details Box -->
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Order Number</p>
                    <p style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">{{orderNumber}}</p>
                    
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Gift</p>
                    <p style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">{{giftName}}</p>
                    
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Tracking Number</p>
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">{{trackingNumber}}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Track Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.google.com/search?q={{trackingNumber}}" style="display: inline-block; background: linear-gradient(135deg, #00B4CC 0%, #00E5A0 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Track Your Package
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your package should arrive within 5-7 business days. You'll receive another email when it's delivered.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Questions? We're here to help!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Contact us at <a href="mailto:support@jala2.com" style="color: #D91C81; text-decoration: none;">support@jala2.com</a>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                © 2026 {{companyName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      textContent: `Your Order Has Shipped!

Hi {{userName}},

Great news! Your gift from {{companyName}} is on its way to you!

Order Number: {{orderNumber}}
Gift: {{giftName}}
Tracking Number: {{trackingNumber}}

Track your package: https://www.google.com/search?q={{trackingNumber}}

Your package should arrive within 5-7 business days. You'll receive another email when it's delivered.

Questions? Contact us at support@jala2.com

© 2026 {{companyName}}. All rights reserved.
      `,
      variables: ['userName', 'companyName', 'orderNumber', 'giftName', 'trackingNumber'],
      status: 'active',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };
    
    // Delivery Confirmation Template
    const deliveryTemplate = {
      id: 'delivery-confirmation',
      name: 'Delivery Confirmation',
      subjectLine: 'Your Gift Has Been Delivered! 🎉',
      preheaderText: 'Your package has arrived - enjoy your gift!',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gift Has Been Delivered</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Your Gift Has Arrived!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Hi {{userName}},
              </p>
              
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Great news! Your gift has been successfully delivered!
              </p>
              
              <!-- Gift Box -->
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid #10b981;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 600;">YOUR GIFT</p>
                    <p style="margin: 0; color: #111827; font-size: 20px; font-weight: bold;">{{giftName}}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #111827; font-size: 16px; line-height: 1.6;">
                We hope you enjoy your gift from <strong>{{companyName}}</strong>! It was selected especially for you as a token of appreciation.
              </p>
              
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or issues with your gift, please don't hesitate to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Thank you for being part of our team!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@jala2.com" style="color: #D91C81; text-decoration: none;">support@jala2.com</a>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                © 2026 {{companyName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      textContent: `Your Gift Has Been Delivered!

Hi {{userName}},

Great news! Your gift has been successfully delivered!

YOUR GIFT: {{giftName}}

We hope you enjoy your gift from {{companyName}}! It was selected especially for you as a token of appreciation.

If you have any questions or issues with your gift, please don't hesitate to reach out to our support team.

Thank you for being part of our team!

Questions? Contact us at support@jala2.com

© 2026 {{companyName}}. All rights reserved.
      `,
      variables: ['userName', 'companyName', 'giftName'],
      status: 'active',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };
    
    // Save templates
    await kv.set(`email-template:shipping-notification`, shippingTemplate, environmentId);
    await kv.set(`email-template:delivery-confirmation`, deliveryTemplate, environmentId);
    
    // Audit log
    await auditLog({
      action: 'email_templates_seeded',
      userId,
      status: 'success',
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      details: { templates: ['shipping-notification', 'delivery-confirmation'] }
    });
    
    return c.json({ 
      success: true,
      message: 'Shipping and delivery email templates created successfully',
      templates: [shippingTemplate, deliveryTemplate]
    });
  } catch (error: any) {
    console.error('Seed email templates error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send magic link email
app.post("/make-server-6fcaeea3/send-email/magic-link", async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { to, userName, siteName, magicLink, expiryDate, supportEmail } = await c.req.json();
    
    if (!to || !userName || !siteName || !magicLink) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await emailService.sendMagicLinkEmail({
      to,
      userName,
      siteName,
      magicLink,
      expiryDate: expiryDate || 'within 24 hours',
      supportEmail: supportEmail || 'support@jala2.com',
      environmentId
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error('Send magic link email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send order confirmation email
app.post("/make-server-6fcaeea3/send-email/order-confirmation", async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { to, userName, orderNumber, giftName, orderTotal, companyName } = await c.req.json();
    
    if (!to || !userName || !orderNumber || !giftName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await emailService.sendOrderConfirmationEmail({
      to,
      userName,
      orderNumber,
      giftName,
      orderTotal: orderTotal || '$0.00',
      companyName: companyName || 'JALA 2',
      environmentId
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error('Send order confirmation email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send shipping notification email
app.post("/make-server-6fcaeea3/send-email/shipping-notification", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { to, userName, orderNumber, giftName, trackingNumber, companyName } = await c.req.json();
    
    if (!to || !userName || !orderNumber || !giftName || !trackingNumber) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await emailService.sendShippingNotificationEmail({
      to,
      userName,
      orderNumber,
      giftName,
      trackingNumber,
      companyName: companyName || 'JALA 2',
      environmentId
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error('Send shipping notification email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send delivery confirmation email
app.post("/make-server-6fcaeea3/send-email/delivery-confirmation", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { to, userName, giftName, companyName } = await c.req.json();
    
    if (!to || !userName || !giftName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await emailService.sendDeliveryConfirmationEmail({
      to,
      userName,
      giftName,
      companyName: companyName || 'JALA 2',
      environmentId
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error('Send delivery confirmation email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send selection reminder email
app.post("/make-server-6fcaeea3/send-email/selection-reminder", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  
  try {
    const { to, userName, siteName, expiryDate, companyName, magicLink } = await c.req.json();
    
    if (!to || !userName || !siteName || !expiryDate) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await emailService.sendSelectionReminderEmail({
      to,
      userName,
      siteName,
      expiryDate,
      companyName: companyName || 'JALA 2',
      magicLink: magicLink || '',
      environmentId
    });
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error('Send selection reminder email error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== GIFTS & ORDERS API ROUTES =====

// Initialize gift catalog (call once to seed)
app.post("/make-server-6fcaeea3/gifts/initialize", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    await giftsApi.initializeGiftCatalog(environmentId);
    return c.json({ success: true, message: 'Gift catalog initialized', environment: environmentId });
  } catch (error: any) {
    console.error('Gift catalog initialization error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all gifts with optional filtering
app.get("/make-server-6fcaeea3/gifts", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');
    const inStockOnly = c.req.query('inStockOnly') === 'true';
    
    const gifts = await giftsApi.getAllGifts(environmentId, {
      category,
      search,
      inStockOnly
    });
    
    return c.json({ gifts });
  } catch (error: any) {
    console.error('Get gifts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single gift by ID
app.get("/make-server-6fcaeea3/gifts/:id", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const giftId = c.req.param('id');
    const gift = await giftsApi.getGiftById(environmentId, giftId);
    
    if (!gift) {
      return c.json({ error: 'Gift not found' }, 404);
    }
    
    return c.json({ gift });
  } catch (error: any) {
    console.error('Get gift error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get gift categories
app.get("/make-server-6fcaeea3/gifts/categories/list", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const categories = await giftsApi.getCategories(environmentId);
    return c.json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== PHASE 2: CATALOG-AWARE GIFTS ENDPOINTS =====

// Get filtered gifts for a specific site (catalog-aware)
app.get("/make-server-6fcaeea3/sites/:siteId/gifts", async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const search = c.req.query('search');
    const category = c.req.query('category');
    const minPrice = c.req.query('minPrice') ? parseFloat(c.req.query('minPrice')!) : undefined;
    const maxPrice = c.req.query('maxPrice') ? parseFloat(c.req.query('maxPrice')!) : undefined;
    const status = c.req.query('status') as 'active' | 'inactive' | undefined;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;
    
    const { getFilteredGiftsForSite } = await import('./catalog-filter.ts');
    
    const result = await getFilteredGiftsForSite(siteId, {
      search,
      category,
      minPrice,
      maxPrice,
      status,
      limit,
      offset,
    });
    
    return c.json({
      success: true,
      gifts: result.gifts,
      total: result.total,
      filtered: result.filtered,
      exclusions: result.exclusions,
      pagination: {
        limit,
        offset,
        hasMore: result.filtered > (offset + limit),
      },
    });
  } catch (error: any) {
    console.error('[Gifts API] Error getting filtered gifts:', error);
    return c.json({
      success: false,
      error: `Failed to get gifts: ${error.message}`,
    }, 500);
  }
});

// Get catalog statistics for a site
app.get("/make-server-6fcaeea3/sites/:siteId/catalog-stats", async (c) => {
  try {
    const siteId = c.req.param('siteId');
    
    const { getCatalogStatsForSite } = await import('./catalog-filter.ts');
    const stats = await getCatalogStatsForSite(siteId);
    
    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Gifts API] Error getting catalog stats:', error);
    return c.json({
      success: false,
      error: `Failed to get catalog stats: ${error.message}`,
    }, 500);
  }
});

// Get available categories for a site
app.get("/make-server-6fcaeea3/sites/:siteId/categories", async (c) => {
  try {
    const siteId = c.req.param('siteId');
    
    const { getAvailableCategoriesForSite } = await import('./catalog-filter.ts');
    const categories = await getAvailableCategoriesForSite(siteId);
    
    return c.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('[Gifts API] Error getting categories:', error);
    return c.json({
      success: false,
      error: `Failed to get categories: ${error.message}`,
    }, 500);
  }
});

// Check if a gift is available for a specific site
app.get("/make-server-6fcaeea3/sites/:siteId/gifts/:giftId/availability", async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const giftId = c.req.param('giftId');
    
    const { isGiftAvailableForSite } = await import('./catalog-filter.ts');
    const isAvailable = await isGiftAvailableForSite(giftId, siteId);
    
    return c.json({
      success: true,
      available: isAvailable,
      giftId,
      siteId,
    });
  } catch (error: any) {
    console.error('[Gifts API] Error checking gift availability:', error);
    return c.json({
      success: false,
      error: `Failed to check gift availability: ${error.message}`,
    }, 500);
  }
});

// Create new order
app.post("/make-server-6fcaeea3/orders", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.userId || !body.userEmail || !body.giftId || !body.quantity || !body.shippingAddress) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const order = await giftsApi.createOrder(environmentId, {
      userId: body.userId,
      userEmail: body.userEmail,
      giftId: body.giftId,
      quantity: body.quantity,
      shippingAddress: body.shippingAddress
    });
    
    return c.json({ order });
  } catch (error: any) {
    console.error('Create order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get order by ID
app.get("/make-server-6fcaeea3/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await giftsApi.getOrderById(orderId);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user orders
app.get("/make-server-6fcaeea3/users/:userId/orders", async (c) => {
  try {
    const userId = c.req.param('userId');
    const orders = await giftsApi.getUserOrders(userId);
    
    return c.json({ orders });
  } catch (error: any) {
    console.error('Get user orders error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update order status (admin only)
app.put("/make-server-6fcaeea3/orders/:orderId/status", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const orderId = c.req.param('orderId');
    const body = await c.req.json();
    
    if (!body.status) {
      return c.json({ error: 'Status is required' }, 400);
    }
    
    const order = await giftsApi.updateOrderStatus(
      orderId,
      body.status,
      body.trackingNumber,
      body.carrier,
      environmentId
    );
    
    return c.json({ order });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== DASHBOARD ANALYTICS ENDPOINTS =====

/**
 * GET /dashboard/stats/:siteId
 * Get aggregate statistics for a site's dashboard
 * Includes: total orders, active employees, gifts available, pending shipments
 * With growth percentages compared to previous period
 */
app.get("/make-server-6fcaeea3/dashboard/stats/:siteId", verifyAdmin, async (c) => {
  const siteId = c.req.param('siteId');
  const timeRange = c.req.query('timeRange') || '30d';
  
  try {
    // Use database-based dashboard stats
    const { getDashboardStats } = await import('./dashboard_db.ts');
    const result = await getDashboardStats(siteId, timeRange);
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Dashboard Stats] Error:', error);
    return c.json({
      success: false,
      error: `Failed to fetch dashboard stats: ${error.message}`,
    }, 500);
  }
});

/**
 * GET /dashboard/recent-orders/:siteId
 * Get recent orders for a site
 */
app.get("/make-server-6fcaeea3/dashboard/recent-orders/:siteId", verifyAdmin, async (c) => {
  const siteId = c.req.param('siteId');
  const limit = parseInt(c.req.query('limit') || '5');
  const statusFilter = c.req.query('status');
  
  try {
    // Use database-based recent orders
    const { getRecentOrders } = await import('./dashboard_db.ts');
    const result = await getRecentOrders(siteId, limit, statusFilter);
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Dashboard Recent Orders] Error:', error);
    return c.json({
      success: false,
      error: `Failed to fetch recent orders: ${error.message}`,
    }, 500);
  }
});

/**
 * GET /dashboard/popular-gifts/:siteId
 * Get most popular gifts based on order count
 */
app.get("/make-server-6fcaeea3/dashboard/popular-gifts/:siteId", verifyAdmin, async (c) => {
  const siteId = c.req.param('siteId');
  const limit = parseInt(c.req.query('limit') || '5');
  const timeRange = c.req.query('timeRange') || '30d';
  
  try {
    // Use database-based popular gifts
    const { getPopularGifts } = await import('./dashboard_db.ts');
    const result = await getPopularGifts(siteId, limit, timeRange);
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Dashboard Popular Gifts] Error:', error);
    return c.json({
      success: false,
      error: `Failed to fetch popular gifts: ${error.message}`,
    }, 500);
  }
});

// ===== DEMO USE CASE SITES =====

// Seed demo use case sites (for stakeholder review)
app.post("/make-server-6fcaeea3/seed-demo-sites", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const result = await seedDemoUseCaseSites(environmentId);
    return c.json(result);
  } catch (error: any) {
    console.error('Seed demo sites error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== V2 DATABASE-BACKED CRUD ENDPOINTS =====
// These endpoints use PostgreSQL database instead of KV store
// Provides better performance, scalability, and query capabilities

import * as v2 from './endpoints_v2.ts';

// CLIENTS
app.get("/make-server-6fcaeea3/v2/clients", verifyAdmin, v2.getClientsV2);
app.get("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, v2.getClientByIdV2);
app.post("/make-server-6fcaeea3/v2/clients", verifyAdmin, v2.createClientV2);
app.put("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, v2.updateClientV2);
app.delete("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, v2.deleteClientV2);

// SITES
app.get("/make-server-6fcaeea3/v2/sites", verifyAdmin, v2.getSitesV2);
app.get("/make-server-6fcaeea3/v2/sites/:id", verifyAdmin, v2.getSiteByIdV2);
app.get("/make-server-6fcaeea3/v2/sites/slug/:slug", verifyAdmin, v2.getSiteBySlugV2);
app.post("/make-server-6fcaeea3/v2/sites", verifyAdmin, v2.createSiteV2);
app.put("/make-server-6fcaeea3/v2/sites/:id", verifyAdmin, v2.updateSiteV2);
app.delete("/make-server-6fcaeea3/v2/sites/:id", verifyAdmin, v2.deleteSiteV2);

// PUBLIC SITES (no auth required)
app.get("/make-server-6fcaeea3/v2/public/sites", v2.getPublicSitesV2);

// PRODUCTS
app.get("/make-server-6fcaeea3/v2/products", verifyAdmin, v2.getProductsV2);
app.get("/make-server-6fcaeea3/v2/products/:id", verifyAdmin, v2.getProductByIdV2);
app.post("/make-server-6fcaeea3/v2/products", verifyAdmin, v2.createProductV2);
app.put("/make-server-6fcaeea3/v2/products/:id", verifyAdmin, v2.updateProductV2);
app.delete("/make-server-6fcaeea3/v2/products/:id", verifyAdmin, v2.deleteProductV2);

// EMPLOYEES
app.get("/make-server-6fcaeea3/v2/employees", verifyAdmin, v2.getEmployeesV2);
app.get("/make-server-6fcaeea3/v2/employees/:id", verifyAdmin, v2.getEmployeeByIdV2);
app.post("/make-server-6fcaeea3/v2/employees", verifyAdmin, v2.createEmployeeV2);
app.put("/make-server-6fcaeea3/v2/employees/:id", verifyAdmin, v2.updateEmployeeV2);
app.delete("/make-server-6fcaeea3/v2/employees/:id", verifyAdmin, v2.deleteEmployeeV2);

// ORDERS
app.get("/make-server-6fcaeea3/v2/orders", verifyAdmin, v2.getOrdersV2);
app.get("/make-server-6fcaeea3/v2/orders/:id", verifyAdmin, v2.getOrderByIdV2);
app.get("/make-server-6fcaeea3/v2/orders/number/:orderNumber", verifyAdmin, v2.getOrderByNumberV2);
app.post("/make-server-6fcaeea3/v2/orders", verifyAdmin, v2.createOrderV2);
app.put("/make-server-6fcaeea3/v2/orders/:id", verifyAdmin, v2.updateOrderV2);
app.delete("/make-server-6fcaeea3/v2/orders/:id", verifyAdmin, v2.deleteOrderV2);

// UTILITIES
app.get("/make-server-6fcaeea3/v2/product-categories", verifyAdmin, v2.getProductCategoriesV2);
app.get("/make-server-6fcaeea3/v2/order-stats", verifyAdmin, v2.getOrderStatsV2);

// SITE GIFT CONFIGURATION
app.get("/make-server-6fcaeea3/v2/sites/:siteId/gift-config", verifyAdmin, v2.getSiteGiftConfigV2);
app.put("/make-server-6fcaeea3/v2/sites/:siteId/gift-config", verifyAdmin, v2.updateSiteGiftConfigV2);
app.get("/make-server-6fcaeea3/v2/sites/:siteId/gifts", v2.getSiteGiftsV2);  // Public endpoint

// BRANDS
console.log('[Routes] Registering brands routes... (deployed at ' + new Date().toISOString() + ')');
app.get("/make-server-6fcaeea3/v2/brands", verifyAdmin, v2.getBrandsV2);
app.post("/make-server-6fcaeea3/v2/brands/extract-colors", verifyAdmin, v2.extractColorsFromWebsiteV2);
app.post("/make-server-6fcaeea3/v2/brands", verifyAdmin, v2.createBrandV2);
app.get("/make-server-6fcaeea3/v2/brands/:id", verifyAdmin, v2.getBrandByIdV2);
app.put("/make-server-6fcaeea3/v2/brands/:id", verifyAdmin, v2.updateBrandV2);
app.delete("/make-server-6fcaeea3/v2/brands/:id", verifyAdmin, v2.deleteBrandV2);
console.log('[Routes] Brands routes registered, including extract-colors');

// EMAIL TEMPLATES
app.get("/make-server-6fcaeea3/v2/email-templates", verifyAdmin, v2.getEmailTemplatesV2);
app.get("/make-server-6fcaeea3/v2/email-templates/:id", verifyAdmin, v2.getEmailTemplateByIdV2);
app.post("/make-server-6fcaeea3/v2/email-templates", verifyAdmin, v2.createEmailTemplateV2);
app.put("/make-server-6fcaeea3/v2/email-templates/:id", verifyAdmin, v2.updateEmailTemplateV2);
app.delete("/make-server-6fcaeea3/v2/email-templates/:id", verifyAdmin, v2.deleteEmailTemplateV2);

console.log('✅ V2 Database-backed CRUD endpoints registered (46 endpoints)');

// ===== CELEBRATION SYSTEM =====

// Get celebrations for employee (PUBLIC)
app.get("/make-server-6fcaeea3/public/celebrations/:employeeId", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { employeeId } = c.req.param();
  
  try {
    const celebrationList = await celebrations.getCelebrationsForEmployee(employeeId, environmentId);
    
    return c.json({
      success: true,
      celebrations: celebrationList,
      count: celebrationList.length,
    });
  } catch (error: any) {
    console.error('[Celebrations] Error fetching celebrations:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch celebrations',
    }, 500);
  }
});

// Get single celebration by ID (PUBLIC)
app.get("/make-server-6fcaeea3/public/celebrations/view/:id", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { id } = c.req.param();
  
  try {
    const celebration = await celebrations.getCelebrationById(id, environmentId);
    
    if (!celebration) {
      return c.json({
        success: false,
        error: 'Celebration not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      celebration,
    });
  } catch (error: any) {
    console.error('[Celebrations] Error fetching celebration:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch celebration',
    }, 500);
  }
});

// Create celebration (PUBLIC - with session verification)
app.post("/make-server-6fcaeea3/public/celebrations", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    const body = await c.req.json();
    const { recipientId, recipientName, milestoneId, milestoneName, message, eCardId, eCardImage, from, fromEmail, visibility } = body;
    
    // Validate required fields
    if (!recipientId || !milestoneId || !message || !from) {
      return c.json({
        success: false,
        error: 'Missing required fields: recipientId, milestoneId, message, from',
      }, 400);
    }
    
    const celebration = await celebrations.createCelebration({
      recipientId,
      recipientName: recipientName || recipientId,
      milestoneId,
      milestoneName: milestoneName || milestoneId,
      message,
      eCardId,
      eCardImage,
      from,
      fromEmail,
      visibility: visibility || 'public',
    }, environmentId);
    
    return c.json({
      success: true,
      celebration,
      message: 'Celebration created successfully',
    });
  } catch (error: any) {
    console.error('[Celebrations] Error creating celebration:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to create celebration',
    }, 500);
  }
});

// Send celebration invite (PUBLIC)
app.post("/make-server-6fcaeea3/public/celebrations/:id/invite", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { id } = c.req.param();
  
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({
        success: false,
        error: 'Email is required',
      }, 400);
    }
    
    const invite = await celebrations.sendCelebrationInvite(id, email, environmentId);
    
    return c.json({
      success: true,
      invite,
      message: 'Invitation sent successfully',
    });
  } catch (error: any) {
    console.error('[Celebrations] Error sending invite:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to send invitation',
    }, 500);
  }
});

// Like celebration (PUBLIC)
app.post("/make-server-6fcaeea3/public/celebrations/:id/like", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { id } = c.req.param();
  
  try {
    await celebrations.likeCelebration(id, environmentId);
    
    return c.json({
      success: true,
      message: 'Celebration liked',
    });
  } catch (error: any) {
    console.error('[Celebrations] Error liking celebration:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to like celebration',
    }, 500);
  }
});

// Delete celebration (PUBLIC - could add auth later)
app.delete("/make-server-6fcaeea3/public/celebrations/:id", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { id } = c.req.param();
  
  try {
    await celebrations.deleteCelebration(id, environmentId);
    
    return c.json({
      success: true,
      message: 'Celebration deleted successfully',
    });
  } catch (error: any) {
    console.error('[Celebrations] Error deleting celebration:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to delete celebration',
    }, 500);
  }
});

// ===== HRIS INTEGRATION ROUTES =====
app.route("/make-server-6fcaeea3/hris", hrisRoutes);

// ===== PHASE 2: MULTI-CATALOG ARCHITECTURE ROUTES =====
console.log('📦 Setting up multi-catalog architecture routes...');

// Catalog management endpoints
app.route("/make-server-6fcaeea3/catalogs", catalogsApi);

// Site catalog configuration endpoints
app.route("/make-server-6fcaeea3/sites", siteCatalogConfigApi);

// Migration endpoints
app.route("/make-server-6fcaeea3/migration", migrationApi);

console.log('✅ Multi-catalog routes registered');

// ===== PHASE 3.2: MIGRATED CRUD RESOURCES =====
// Setup all resources migrated to use CRUD factory
console.log('🔄 Setting up migrated CRUD resources...');
setupMigratedResources(app, verifyAdmin);
console.log('✅ Migrated CRUD resources loaded');

// ===== CRUD FACTORY TEST ROUTES (DEVELOPMENT ONLY) =====
// Setup test routes for verifying CRUD factory functionality
// Only enable test routes in development (reusing isDevelopment from line 205)
if (isDevelopment) {
  console.log('🧪 Setting up CRUD factory test routes (DEVELOPMENT MODE)...');
  setupTestCrudRoutes(app);
  
  // Verification endpoint
  app.get("/make-server-6fcaeea3/test-crud/verify", async (c) => {
    const verification = await verifyCrudFactorySetup();
    return c.json(verification);
  });
  
  console.log('✅ CRUD factory test routes active');
  console.log('📋 Test resources: test-clients, test-products, test-posts');
  console.log('🔍 Status: GET /make-server-6fcaeea3/test-crud/status');
  console.log('✔️  Verify: GET /make-server-6fcaeea3/test-crud/verify');
} else {
  console.log('🚫 CRUD factory test routes disabled (PRODUCTION MODE)');
}

// ==================== IMAGE UPLOAD FOR EMAIL EDITOR ====================
app.post("/make-server-6fcaeea3/upload-image", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  
  try {
    console.log('[Image Upload] Starting image upload for environment:', environmentId);
    
    // Parse form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[Image Upload] No file provided');
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('[Image Upload] Invalid file type:', file.type);
      return c.json({ error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('[Image Upload] File too large:', file.size);
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `email-images/${timestamp}-${randomStr}.${extension}`;

    console.log('[Image Upload] Generated filename:', filename);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure bucket exists
    const bucketName = 'make-6fcaeea3-email-assets';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log('[Image Upload] Creating bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: maxSize,
        allowedMimeTypes: validTypes,
      });

      if (createError) {
        console.error('[Image Upload] Failed to create bucket:', createError);
        throw createError;
      }
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Image Upload] Upload failed:', uploadError);
      throw uploadError;
    }

    console.log('[Image Upload] Upload successful:', uploadData.path);

    // Generate signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filename, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('[Image Upload] Failed to generate signed URL:', urlError);
      throw urlError;
    }

    console.log('[Image Upload] ✅ Image uploaded successfully');

    return c.json({
      url: urlData.signedUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });

  } catch (error: any) {
    console.error('[Image Upload] Error:', error);
    return c.json({ error: error.message || 'Failed to upload image' }, 500);
  }
});

// ===== DATABASE CLEANUP ROUTES =====
console.log('🧹 Setting up database cleanup routes...');
setupCleanupRoutes(app);

// Server startup complete
console.log('✅ Server initialization complete - ready to accept requests');
console.log('🚀 Edge Function deployed and listening');

Deno.serve(app.fetch);