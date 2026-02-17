import type {
  Gift,
  Site,
  Client,
  SiteGiftConfiguration,
  Catalog,
  SiteCatalogConfiguration,
  AdminUser,
} from '../../types';
import type {
  CreateERPConnectionRequest,
  UpdateERPConnectionRequest,
  SyncSchedule
} from '../types/api.types';
import { logger } from './logger';
import { 
  logSecurityEvent, 
  checkSecureContext, 
  sanitizeInput 
} from './security';
import { getOrCreateCSRFToken } from './csrfProtection';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type CreateScheduleRequest = Partial<Omit<SyncSchedule, 'id'>>;
type UpdateScheduleRequest = Partial<Omit<SyncSchedule, 'id'>>;

// ==================== TYPE DEFINITIONS ====================

export interface PublicSite {
  id: string;
  name: string;
  clientId: string;
  domain: string;
  status: 'active' | 'inactive';
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };
  settings: {
    validationMethod: 'email' | 'employee_id' | 'serial_card' | 'magic_link';
    allowMultipleSelections: boolean;
    requireShipping: boolean;
    supportEmail: string;
    languages: string[];
    defaultLanguage: string;
    // Landing and Welcome Page Configuration
    skipLandingPage?: boolean; // If true, skip landing page and go to validation
    enableWelcomePage?: boolean; // Show welcome page after authentication
    welcomePageContent?: {
      title?: string;
      message?: string;
      imageUrl?: string;
      authorName?: string;
      authorTitle?: string;
      videoUrl?: string;
      ctaText?: string;
    };
    // Checkout Configuration
    skipReviewPage?: boolean; // If true, skip review page and go straight to confirmation
    // Celebration Module Configuration
    celebrationModule?: {
      enabled: boolean;
      standalone: boolean;
      allowPeerMessages: boolean;
      allowManagerMessages: boolean;
      allowExternalMessages: boolean;
      requireApproval: boolean;
      messageCharLimit: number;
      allowPhotos: boolean;
      allowVideos: boolean;
      displayMode: 'wall' | 'carousel' | 'grid';
    };
    // Domain validation
    allowedDomains?: string[];
  };
  siteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicGift {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  available: boolean;
}

interface JWTHeader {
  alg: string;
  typ?: string;
}

interface JWTPayload {
  userId?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface TokenInspectionResult {
  header: JWTHeader;
  payload: JWTPayload;
  isExpired: boolean;
  timeLeft: number;
}

// ==================== API CONFIGURATION ====================

// Get API base URL from current environment
function getApiBaseUrl(): string {
  const env = getCurrentEnvironment();
  // Extract project ID from Supabase URL
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const envProjectId = urlMatch ? urlMatch[1] : projectId;
  return `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
}

// Helper to get active environment (alias for getCurrentEnvironment)
function getActiveEnvironment() {
  return getCurrentEnvironment();
}

// ==================== TOKEN MANAGEMENT ====================

// Store access token in sessionStorage (persists during browser session)
const TOKEN_KEY = 'jala_access_token';
const JUST_LOGGED_IN_KEY = 'jala_just_logged_in';

// Validate token format - ONLY accept HS256 (our custom JWT)
function isValidTokenFormat(token: string): boolean {
  try {
    logger.info('[Token Validation] Starting validation', {
      tokenPreview: token.substring(0, 50) + '...',
      tokenLength: token.length
    });
    
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      logger.info('[Token Validation] Invalid JWT format', { expectedParts: 3, actualParts: parts.length });
      return false;
    }
    
    logger.info('[Token Validation] JWT has 3 parts, decoding header...');
    
    // Decode header to check algorithm
    const header = JSON.parse(atob(parts[0])) as JWTHeader;
    
    logger.info('[Token Validation] Header decoded', {
      algorithm: header.alg,
      type: header.typ
    });
    
    // CRITICAL FIX: Accept BOTH HS256 (legacy) and EdDSA/ES256 (Ed25519) tokens
    // Backend was migrated to Ed25519 on 2026-02-15 for better security
    const validAlgorithms = ['HS256', 'EdDSA', 'ES256'];
    if (!validAlgorithms.includes(header.alg)) {
      logger.info('[Token Validation] Token rejected - invalid algorithm', { 
        algorithm: header.alg,
        expected: validAlgorithms.join(' or ')
      });
      return false;
    }
    
    logger.info('[Token Validation] Algorithm is valid (' + header.alg + '), checking expiration...');
    
    // Check expiration in payload
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    logger.info('[Token Validation] Payload decoded', {
      hasExp: !!payload.exp,
      exp: payload.exp,
      userId: payload.userId?.substring(0, 8) + '...',
      role: payload.role
    });
    
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        logger.info('[Token Validation] Token expired', { 
          expiredAt: new Date(payload.exp * 1000).toISOString(),
          now: new Date(now * 1000).toISOString()
        });
        return false;
      }
      
      logger.info('[Token Validation] Token is not expired', {
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        timeLeftSeconds: payload.exp - now
      });
    }
    
    logger.info('[Token Validation] ✅ Token is valid');
    return true;
  } catch (error) {
    logger.error('[Token Validation] Failed to validate token format', { error });
    return false;
  }
}

export function setAccessToken(token: string | null): void {
  if (token) {
    // Log the token we're trying to store
    logger.info('[setAccessToken] Attempting to store token', {
      tokenPreview: token.substring(0, 50) + '...',
      tokenLength: token.length
    });
    
    // CRITICAL DEBUG: Decode token header to see what algorithm it uses
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        logger.info('[setAccessToken] Token header decoded', {
          algorithm: header.alg,
          type: header.typ
        });
      }
    } catch (e) {
      logger.error('[setAccessToken] Failed to decode token header', { error: e });
    }
    
    // Validate token format before storing
    if (!isValidTokenFormat(token)) {
      logger.error('[Token Validation] Refusing to store invalid token');
      // Clear any existing invalid token
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
      return;
    }
    
    logger.info('[setAccessToken] Token validation passed, storing in sessionStorage');
    sessionStorage.setItem(TOKEN_KEY, token);
    logger.info('[setAccessToken] Token stored successfully');
    
    // Set a flag that we just logged in - don't clear token on 401 for a few seconds
    sessionStorage.setItem(JUST_LOGGED_IN_KEY, Date.now().toString());
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
    // Notify that token was cleared so AdminContext can update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-token-cleared'));
    }
  }
}

export function getAccessToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  
  logger.info('[getAccessToken] Retrieving token from sessionStorage', {
    tokenExists: !!token,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'null',
    tokenLength: token?.length
  });
  
  // Validate token format when retrieving
  if (token && !isValidTokenFormat(token)) {
    logger.info('[Token Validation] Found invalid token in storage, clearing it');
    setAccessToken(null);
    return null;
  }
  
  return token;
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

// ==================== DEBUG UTILITIES (Development Only) ====================

// DEBUGGING: Force clear all tokens (can be called from browser console)
// Usage: window.clearJALATokens()
export function forceClearTokens(): string {
  logger.info('[Force Clear] Clearing all JALA tokens and auth state');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
  sessionStorage.clear();
  localStorage.clear();
  logger.info('[Force Clear] All tokens and storage cleared');
  window.dispatchEvent(new CustomEvent('auth-token-cleared'));
  return 'All tokens cleared! Refresh the page.';
}

// DEBUGGING: Decode and inspect current token
export function inspectToken(): TokenInspectionResult | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    logger.info('[Token Inspector] No token found in storage');
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      logger.info('[Token Inspector] Invalid JWT format');
      return null;
    }
    
    const header = JSON.parse(atob(parts[0])) as JWTHeader;
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < now : false;
    const timeLeft = payload.exp ? payload.exp - now : 0;
    
    // Only log in development
    if (import.meta.env.DEV) {
      logger.info('=== TOKEN INSPECTION ===', {
        header,
        payload: {
          ...payload,
          // Redact sensitive data
          email: payload.email ? '***@***.***' : undefined,
        },
        isExpired,
        timeLeftHours: Math.floor(timeLeft / 3600),
      });
    }
    
    return { header, payload, isExpired, timeLeft };
  } catch (error) {
    logger.error('[Token Inspector] Failed to decode token', { error });
    return null;
  }
}

// Expose debug utilities to window (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  interface WindowWithDebug extends Window {
    clearJALATokens?: () => string;
    inspectJALAToken?: () => TokenInspectionResult | null;
    testSitesAPI?: () => Promise<unknown>;
    testClientsAPI?: () => Promise<unknown>;
  }
  
  const windowDebug = window as WindowWithDebug;
  windowDebug.clearJALATokens = forceClearTokens;
  windowDebug.inspectJALAToken = inspectToken;
  
  windowDebug.testSitesAPI = async () => {
    logger.info('=== TESTING SITES API ===');
    try {
      const response = await apiRequest<{ success: boolean; data: unknown[] }>('/sites');
      logger.info('Sites API Response', { 
        success: response.success,
        count: response.data?.length || 0 
      });
      return response;
    } catch (error) {
      logger.error('Sites API Error', { error });
      return null;
    }
  };
  
  windowDebug.testClientsAPI = async () => {
    logger.info('=== TESTING CLIENTS API ===');
    try {
      const response = await apiRequest<{ success: boolean; data: unknown[] }>('/clients');
      logger.info('Clients API Response', { 
        success: response.success,
        count: response.data?.length || 0 
      });
      return response;
    } catch (error) {
      logger.error('Clients API Error', { error });
      return null;
    }
  };
  
  logger.info('[JALA Debug] Token utilities available', {
    commands: [
      'window.clearJALATokens()',
      'window.inspectJALAToken()',
      'window.testSitesAPI()',
      'window.testClientsAPI()'
    ]
  });
}

function wasRecentLogin(): boolean {
  const justLoggedInTime = sessionStorage.getItem(JUST_LOGGED_IN_KEY);
  if (!justLoggedInTime) return false;
  
  const loginTime = parseInt(justLoggedInTime, 10);
  const now = Date.now();
  // Consider it a recent login if it was within the last 5 seconds
  return (now - loginTime) < 5000;
}

// ==================== RATE LIMITING ====================

// Rate limit tracking for client-side
const requestCounts = new Map<string, { count: number; resetAt: number }>();

// Endpoints that should be exempt from rate limiting
const RATE_LIMIT_EXEMPT_ENDPOINTS = [
  '/auth/session',  // Session checks happen frequently and are read-only
  '/public/sites',  // Public site loading - needed for initial page load
];

function checkClientRateLimit(endpoint: string): boolean {
  // Skip rate limiting for exempt endpoints
  if (RATE_LIMIT_EXEMPT_ENDPOINTS.some(exempt => endpoint.includes(exempt))) {
    return true;
  }

  const now = Date.now();
  const key = `api_${endpoint}`;
  let record = requestCounts.get(key);

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + 60000 }; // 1 minute window
    requestCounts.set(key, record);
  }

  record.count++;

  // Allow max 100 requests per minute to any endpoint
  if (record.count > 100) {
    logSecurityEvent({
      action: 'rate_limit',
      status: 'warning',
      details: `Client-side rate limit exceeded for endpoint: ${endpoint}`
    });
    return false;
  }

  return true;
}

// ==================== CORE API REQUEST ====================

interface ApiError extends Error {
  status?: number;
  statusCode?: number;
  response?: unknown;
  originalError?: Error;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if HTTPS in production
  if (import.meta.env.PROD && !checkSecureContext()) {
    throw new Error('API requests must be made over HTTPS in production');
  }

  // Client-side rate limiting
  if (!checkClientRateLimit(endpoint)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Always include environment info
  const env = getCurrentEnvironment();
  
  // CRITICAL: Always send publicAnonKey in Authorization header for Supabase platform
  headers['Authorization'] = `Bearer ${env.supabaseAnonKey || publicAnonKey}`;
  
  // CRITICAL: Always send environment ID for backend to route to correct data
  headers['X-Environment-ID'] = env.id;
  
  // Add custom JWT token if available
  const token = getAccessToken();
  if (token) {
    // Send our custom JWT token in X-Access-Token header for backend verification
    headers['X-Access-Token'] = token;
    logger.info('[API Request] Sending request with JWT token', {
      endpoint,
      method: options.method || 'GET',
      tokenPreview: token.substring(0, 50) + '...',
      hasXAccessToken: true,
      environmentId: env.id
    });
  } else {
    logger.info('[API Request] No token available, sending request without JWT', {
      endpoint,
      method: options.method || 'GET',
      hasXAccessToken: false,
      environmentId: env.id
    });
  }
  
  // Add CSRF token for state-changing operations
  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    headers['X-CSRF-Token'] = getOrCreateCSRFToken();
  }

  // Sanitize request body if present
  let body = options.body;
  if (body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      const sanitized = sanitizeInput(parsed);
      body = JSON.stringify(sanitized);
    } catch (e) {
      // If parsing fails, use original body
      logger.debug('[API] Failed to parse request body for sanitization', { error: e });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    // Track login time for recent login check
    const isLogin = endpoint.includes('/auth/login') || endpoint.includes('/bootstrap/create-admin');
    
    // Check for rate limiting response from server
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      logSecurityEvent({
        action: 'rate_limit',
        status: 'warning',
        details: `Server rate limit hit for ${endpoint}. Retry after: ${retryAfter}s`
      });
      
      throw new Error(`Rate limited. Try again in ${retryAfter || 60} seconds.`);
    }

    // Parse response
    let data: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json() as unknown;
    } else {
      data = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      // Determine if this is a session check, logout, or data loading endpoint
      const isSessionCheck = endpoint.includes('/auth/session');
      const isLogout = endpoint.includes('/auth/logout');
      const isDataLoadingEndpoint = ['/sites', '/clients', '/gifts', '/employees', '/orders'].some(path => endpoint.includes(path));
      const hasToken = !!token;
      
      // Log authentication failures (but skip expected failures like session checks when backend isn't deployed)
      if ((response.status === 401 || response.status === 403) && !isSessionCheck && !isLogout && !isDataLoadingEndpoint && hasToken) {
        // Don't clear token if we just logged in - give backend time to establish session
        if (!wasRecentLogin()) {
          const errorMessage = typeof data === 'object' && data !== null 
            ? (data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message 
            : undefined;
          
          logSecurityEvent({
            action: 'auth_failure',
            status: 'failure',
            details: `Authentication failed for ${endpoint}: ${errorMessage || response.statusText || 'Unknown error'}`
          });
          
          // Clear invalid token
          setAccessToken(null);
        }
      }

      // Create error object
      const errorMessage = typeof data === 'object' && data !== null 
        ? (data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message 
        : `HTTP ${response.status}: ${response.statusText}`;
      
      const error: ApiError = new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.statusCode = response.status;
      error.response = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    // Re-throw if already processed
    const apiError = error as ApiError;
    if (apiError.status || apiError.statusCode) {
      throw error;
    }

    // Network or other errors
    logger.error('[API Request Error]', { endpoint, error });
    const wrappedError: ApiError = new Error(
      (error as Error).message || 'Network request failed'
    );
    wrappedError.originalError = error as Error;
    throw wrappedError;
  }
}

// Export a simple authApi object that wraps apiRequest
export const authApi = {
  async login(credentials: { emailOrUsername: string; password: string }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: credentials.emailOrUsername, // Backend expects 'identifier' not 'emailOrUsername'
        password: credentials.password
      }),
    });
  },
  
  async signup(data: { email: string; username: string; password: string; role: string }) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getSession() {
    return apiRequest('/auth/session', {
      method: 'GET',
    });
  },
  
  async logout() {
    const result = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    setAccessToken(null);
    return result;
  },
  
  // ERP Management methods
  async getERPConnections() {
    return apiRequest('/erp/connections', {
      method: 'GET',
    });
  },
  
  async createERPConnection(connectionData: CreateERPConnectionRequest) {
    return apiRequest('/erp/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  },
  
  async updateERPConnection(id: string, updates: UpdateERPConnectionRequest) {
    return apiRequest(`/erp/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async deleteERPConnection(id: string) {
    return apiRequest(`/erp/connections/${id}`, {
      method: 'DELETE',
    });
  },
  
  async testERPConnection(id: string) {
    return apiRequest(`/erp/connections/${id}/test`, {
      method: 'POST',
    });
  },
  
  async syncProductsFromERP(connectionId: string) {
    return apiRequest(`/erp/connections/${connectionId}/sync-products`, {
      method: 'POST',
    });
  },
  
  async syncInventoryFromERP(connectionId: string) {
    return apiRequest(`/erp/connections/${connectionId}/sync-inventory`, {
      method: 'POST',
    });
  },
  
  async getERPSyncLogs(connectionId: string) {
    return apiRequest(`/erp/connections/${connectionId}/logs`, {
      method: 'GET',
    });
  },
  
  // Schedule Management methods
  async getSchedulesByConnection(erpConnectionId: string) {
    return apiRequest(`/erp/schedules?connectionId=${erpConnectionId}`, {
      method: 'GET',
    });
  },
  
  async createSchedule(scheduleData: CreateScheduleRequest) {
    return apiRequest('/erp/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },
  
  async updateSchedule(id: string, updates: UpdateScheduleRequest) {
    return apiRequest(`/erp/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async deleteSchedule(id: string) {
    return apiRequest(`/erp/schedules/${id}`, {
      method: 'DELETE',
    });
  },
  
  async executeScheduleNow(scheduleId: string) {
    return apiRequest(`/erp/schedules/${scheduleId}/execute`, {
      method: 'POST',
    });
  },
  
  async getScheduleExecutionLogs(scheduleId: string, limit: number = 20) {
    return apiRequest(`/erp/schedules/${scheduleId}/logs?limit=${limit}`, {
      method: 'GET',
    });
  },
};

// Export a publicSiteApi object for public endpoints (no authentication required)
export const publicSiteApi = {
  async getActiveSites() {
    return apiRequest<{ sites: PublicSite[] }>('/public/sites', {
      method: 'GET',
    });
  },
  
  async getSiteById(siteId: string) {
    return apiRequest<{ site: PublicSite }>(`/public/sites/${siteId}`, {
      method: 'GET',
    });
  },
  
  async getSiteGifts(siteId: string) {
    return apiRequest<{ gifts: PublicGift[] }>(`/public/sites/${siteId}/gifts`, {
      method: 'GET',
    });
  },
};

// Export a giftApi object for gift management
export const giftApi = {
  async getAll() {
    return apiRequest<{ gifts: Gift[] }>('/gifts', {
      method: 'GET',
    });
  },
  
  async getById(id: string) {
    return apiRequest<{ gift: Gift }>(`/gifts/${id}`, {
      method: 'GET',
    });
  },
  
  async create(giftData: Partial<Gift>) {
    return apiRequest<{ gift: Gift }>('/gifts', {
      method: 'POST',
      body: JSON.stringify(giftData),
    });
  },
  
  async update(id: string, updates: Partial<Gift>) {
    return apiRequest<{ gift: Gift }>(`/gifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async delete(id: string) {
    return apiRequest<{ success: boolean }>(`/gifts/${id}`, {
      method: 'DELETE',
    });
  },
  
  async bulkDelete(ids: string[]) {
    return apiRequest<{ success: boolean }>('/gifts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
  
  async getCategories() {
    return apiRequest<{ categories: string[] }>('/gifts/categories/list', {
      method: 'GET',
    });
  },
  
  async initializeCatalog() {
    return apiRequest<{ success: boolean }>('/gifts/initialize', {
      method: 'POST',
    });
  },
  
  async search(query: string) {
    return apiRequest<{ gifts: Gift[] }>(`/gifts/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },
};

// Export a siteApi object for site management
export const siteApi = {
  async getAll() {
    return apiRequest<{ success: boolean; data: Site[] }>('/v2/sites', {
      method: 'GET',
    });
  },
  
  async getById(id: string) {
    return apiRequest<{ data: Site }>(`/v2/sites/${id}`, {
      method: 'GET',
    });
  },
  
  async create(siteData: Partial<Site>) {
    return apiRequest<{ data: Site }>('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    });
  },
  
  async update(id: string, updates: Partial<Site>) {
    return apiRequest<{ data: Site }>(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async delete(id: string) {
    return apiRequest<{ success: boolean }>(`/sites/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getGiftConfig(siteId: string) {
    return apiRequest<{ config: SiteGiftConfiguration | null }>(`/sites/${siteId}/gift-config`, {
      method: 'GET',
    });
  },
  
  async updateGiftConfig(siteId: string, config: SiteGiftConfiguration) {
    return apiRequest<{ config: SiteGiftConfiguration }>(`/sites/${siteId}/gift-config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },
  
  async getGifts(siteId: string) {
    return apiRequest<{ gifts: Gift[] }>(`/sites/${siteId}/gifts`, {
      method: 'GET',
    });
  },
};

// Export a clientApi object for client management
export const clientApi = {
  async getAll() {
    return apiRequest<{ success: boolean; data: Client[] }>('/v2/clients', {
      method: 'GET',
    });
  },
  
  async getById(id: string) {
    return apiRequest<{ data: Client }>(`/v2/clients/${id}`, {
      method: 'GET',
    });
  },
  
  async create(clientData: Partial<Client>) {
    return apiRequest<{ data: Client }>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },
  
  async update(id: string, updates: Partial<Client>) {
    return apiRequest<{ data: Client }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async delete(id: string) {
    return apiRequest<{ success: boolean }>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getBrands() {
    return apiRequest<{ success: boolean; data: string[] }>('/brands', {
      method: 'GET',
    });
  },
  
  async createBrand(brandData: { name: string; description?: string }) {
    return apiRequest<{ data: { id: string; name: string } }>('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  },
  
  async updateBrand(id: string, updates: { name?: string; description?: string }) {
    return apiRequest<{ data: { id: string; name: string } }>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async deleteBrand(id: string) {
    return apiRequest<{ success: boolean }>(`/brands/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export an orderApi object for order management
export const orderApi = {
  async getAll() {
    return apiRequest<{ orders: any[] }>('/orders', {
      method: 'GET',
    });
  },
  
  async getById(id: string) {
    return apiRequest<{ order: any }>(`/orders/${id}`, {
      method: 'GET',
    });
  },
  
  async create(orderData: any) {
    return apiRequest<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  async update(id: string, updates: any) {
    return apiRequest<{ order: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  async delete(id: string) {
    return apiRequest<{ success: boolean }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getUserOrders(userId: string) {
    return apiRequest<{ orders: any[] }>(`/orders?user_id=${userId}`, {
      method: 'GET',
    });
  },
  
  async updateStatus(id: string, status: string) {
    return apiRequest<{ order: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin auth API
export const adminAuthApi = {
  async login(email: string, password: string) {
    return apiRequest<{ success: boolean; data: { accessToken: string; user: AdminUser } }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async logout() {
    return apiRequest<{ success: boolean }>('/admin/logout', {
      method: 'POST',
    });
  },
  
  async getCurrentUser() {
    return apiRequest<{ success: boolean; data: AdminUser }>('/admin/me', {
      method: 'GET',
    });
  },
};

// Authenticated request helper
export const authenticatedRequest = apiRequest;