/**
 * Type-Safe API Client
 * Phase 4: Frontend Refactoring
 * 
 * Provides a fully type-safe API client for interacting with the JALA2 backend.
 * All methods include TypeScript type definitions and automatic error handling.
 * 
 * @example
 * ```typescript
 * // Login
 * const response = await apiClient.auth.login({ emailOrUsername, password });
 * 
 * // Fetch clients
 * const clients = await apiClient.clients.list({ page: 1, limit: 50 });
 * 
 * // Create a site
 * const site = await apiClient.sites.create({
 *   clientId: '123',
 *   name: 'My Site',
 *   slug: 'my-site',
 *   validationMethods: [{ type: 'email', enabled: true }]
 * });
 * ```
 */

import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  SessionResponse,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  Site,
  CreateSiteRequest,
  UpdateSiteRequest,
  Gift,
  CreateGiftRequest,
  UpdateGiftRequest,
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  BulkImportRequest,
  BulkImportResponse,
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  ValidateAccessRequest,
  ValidateAccessResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  PaginationParams,
  PaginatedResponse,
  ErrorResponse,
} from '../types/api.types';

import { isErrorResponse } from '../types/api.types';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { isAuthOrErrorPage, isPublicRoute } from '../utils/routeUtils';

/**
 * Storage key for access token
 */
const TOKEN_KEY = 'jala_access_token';

/**
 * CRITICAL: Clear any admin tokens if we're on a public route
 * This runs IMMEDIATELY when the module loads, before any API calls
 */
const currentPath = window.location.pathname;
console.warn('[API Client Init] Current path:', currentPath);
console.warn('[API Client Init] Is public route:', isPublicRoute(currentPath));

if (isPublicRoute(currentPath)) {
  const existingToken = sessionStorage.getItem(TOKEN_KEY);
  if (existingToken) {
    console.warn('[API Client Init] ⚠️ CLEARING admin token on public route:', currentPath);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    console.warn('[API Client Init] ✓ No admin token found on public route');
  }
} else {
  console.warn('[API Client Init] Not a public route - keeping token if present');
}

// ===== Configuration =====

/**
 * Get the API base URL for the current environment
 * @returns The base URL for API requests
 * @internal
 */
function getApiBaseUrl(): string {
  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const envProjectId = urlMatch ? urlMatch[1] : projectId;
  return `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
}

// ===== Token Management =====

/**
 * Store the access token in session storage
 * @param token - The JWT access token to store, or null to remove
 * @example
 * ```typescript
 * setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * ```
 */
export function setAccessToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Retrieve the stored access token from session storage
 * @returns The stored JWT token or null if not found
 * @example
 * ```typescript
 * const token = getAccessToken();
 * if (token) {
 *   // User is authenticated
 * }
 * ```
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Validate that a token is the correct type (HS256)
 * If it's an ES256 token (Supabase Auth), clear it and redirect
 * @internal
 */
function validateTokenType(token: string): void {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[Token Validation] Invalid JWT format');
      clearAccessToken();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/admin/token-clear';
      throw new Error('Invalid JWT format - redirecting to clear tokens');
    }

    const header = JSON.parse(atob(parts[0]));
    const algorithm = header.alg || '';

    // Accept both HS256 (legacy) and EdDSA/ES256 (Ed25519) tokens
    // Backend was migrated to Ed25519 on 2026-02-15 for better security
    const validAlgorithms = ['HS256', 'EdDSA', 'ES256'];
    if (!validAlgorithms.includes(algorithm)) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('🚨 CRITICAL: INVALID TOKEN DETECTED IN API CLIENT');
      console.error('═══════════════════════════════════════════════════════');
      console.error(`Algorithm: ${algorithm} (Expected: ${validAlgorithms.join(' or ')})`);
      console.error('This token uses an unsupported algorithm.');
      console.error('Clearing ALL storage and redirecting to token clear page...');
      console.error('═══════════════════════════════════════════════════════');
      
      // Clear everything
      clearAccessToken();
      sessionStorage.clear();
      localStorage.clear();
      
      // Force redirect to token clear page
      window.location.href = '/admin/token-clear';
      
      // Throw to stop execution
      throw new Error('Invalid token algorithm - redirecting to clear tokens');
    }

    // Token is valid
    return;
  } catch (error) {
    // If the error is one we threw above, just re-throw it
    if (error instanceof Error && error.message.includes('redirecting to clear tokens')) {
      throw error;
    }
    
    // Otherwise it's a parsing error, so clear and redirect
    console.error('[Token Validation] Failed to decode token:', error);
    clearAccessToken();
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/admin/token-clear';
    throw new Error('Token validation failed - redirecting to clear tokens');
  }
}

/**
 * Clear the stored access token from session storage
 * @example
 * ```typescript
 * clearAccessToken(); // User logged out
 * ```
 */
export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ===== Error Handling =====

/**
 * Custom error class for API errors
 * Extends the built-in Error class with additional context
 * 
 * @example
 * ```typescript
 * try {
 *   await apiClient.clients.get('invalid-id');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`Error ${error.statusCode}: ${error.message}`);
 *     console.error('Response:', error.response);
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  /**
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (400, 401, 404, 500, etc.)
   * @param response - Optional detailed error response from the server
   */
  constructor(
    message: string,
    public statusCode: number,
    public response?: ErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ===== Request Helper =====

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  requireAuth?: boolean;
  headers?: Record<string, string>;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    requireAuth = false,
    headers: customHeaders = {},
  } = options;

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add access token if required, otherwise use public anon key
  if (requireAuth) {
    const token = getAccessToken();
    if (!token) {
      throw new ApiError('Authentication required', 401);
    }
    // Validate token type - will throw and redirect if invalid
    validateTokenType(token);
    // Send token in both headers for compatibility
    headers['X-Access-Token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // For public endpoints, use the anon key
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  // Add environment header
  const env = getCurrentEnvironment();
  headers['X-Environment-ID'] = env.id;

  // Make request
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  const data = await response.json();

  // Handle errors
  if (!response.ok) {
    // Check if we're on a public route FIRST
    const isOnPublicRoute = isPublicRoute(currentPath);
    
    console.warn('[API Client] Error response:', {
      status: response.status,
      currentPath,
      isOnPublicRoute,
      requireAuth,
      endpoint
    });
    
    // Clear invalid token on 401 errors and redirect to session expired page
    // BUT: Skip this entirely if we're on a public route
    if (response.status === 401 && requireAuth && !isOnPublicRoute) {
      console.warn('[API Client] Received 401 error - Invalid or expired token');
      console.warn('[API Client] Clearing token and redirecting to session expired page...');
      clearAccessToken();
      
      // Dispatch event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('auth-token-cleared'));
      
      // Only redirect if we're not already on an auth/error page
      if (!isAuthOrErrorPage(currentPath)) {
        console.warn('[API Client] Redirecting to session expired page...');
        // Use setTimeout to avoid interrupting the current execution
        setTimeout(() => {
          window.location.href = '/admin/session-expired';
        }, 100);
      }
    } else if (response.status === 401 && isOnPublicRoute) {
      console.warn('[API Client] Received 401 on public route - skipping session expired redirect');
    }
    
    if (isErrorResponse(data)) {
      throw new ApiError(
        data.error,
        response.status,
        data
      );
    }
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
}

// ===== API Client =====

export const apiClient = {
  // ===== Authentication =====

  auth: {
    async login(request: LoginRequest): Promise<LoginResponse> {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: request,
      });

      // Store token if login successful
      if (response.success && response.accessToken) {
        setAccessToken(response.accessToken);
      }

      return response;
    },

    async signup(request: SignupRequest): Promise<SignupResponse> {
      return apiRequest<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: request,
        requireAuth: true,
      });
    },

    async bootstrapAdmin(request: SignupRequest): Promise<SignupResponse> {
      const response = await apiRequest<SignupResponse>('/bootstrap/create-admin', {
        method: 'POST',
        body: request,
      });

      // Store token if bootstrap successful
      if (response.success && response.accessToken) {
        setAccessToken(response.accessToken);
      }

      return response;
    },

    async getSession(): Promise<SessionResponse> {
      return apiRequest<SessionResponse>('/auth/session', {
        requireAuth: true,
      });
    },

    async logout(): Promise<void> {
      await apiRequest('/auth/logout', {
        method: 'POST',
        requireAuth: true,
      });
      clearAccessToken();
    },
  },

  // ===== Clients =====

  clients: {
    async list(params?: PaginationParams): Promise<PaginatedResponse<Client>> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const queryString = query.toString();
      const endpoint = `/v2/clients${queryString ? `?${queryString}` : ''}`;

      return apiRequest<PaginatedResponse<Client>>(endpoint, {
        requireAuth: true,
      });
    },

    async get(id: string): Promise<Client> {
      const response = await apiRequest<{ success: true; data: Client }>(
        `/v2/clients/${id}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async create(request: CreateClientRequest): Promise<Client> {
      const response = await apiRequest<{ success: true; data: Client }>(
        '/v2/clients',
        {
          method: 'POST',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async update(id: string, request: UpdateClientRequest): Promise<Client> {
      const response = await apiRequest<{ success: true; data: Client }>(
        `/v2/clients/${id}`,
        {
          method: 'PUT',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await apiRequest(`/v2/clients/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
    },
  },

  // ===== Sites =====

  sites: {
    async list(params?: PaginationParams): Promise<PaginatedResponse<Site>> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const queryString = query.toString();
      const endpoint = `/v2/sites${queryString ? `?${queryString}` : ''}`;

      return apiRequest<PaginatedResponse<Site>>(endpoint, {
        requireAuth: true,
      });
    },

    async listPublic(): Promise<Site[]> {
      const response = await apiRequest<{ sites: Site[] }>('/public/sites');
      return response.sites;
    },

    async get(id: string): Promise<Site> {
      const response = await apiRequest<{ success: true; data: Site }>(
        `/v2/sites/${id}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async getByClient(clientId: string): Promise<Site[]> {
      const response = await apiRequest<{ success: true; data: Site[] }>(
        `/v2/sites?client_id=${clientId}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async create(request: CreateSiteRequest): Promise<Site> {
      const response = await apiRequest<{ success: true; data: Site }>(
        '/v2/sites',
        {
          method: 'POST',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async update(id: string, request: UpdateSiteRequest): Promise<Site> {
      const response = await apiRequest<{ success: true; data: Site }>(
        `/v2/sites/${id}`,
        {
          method: 'PUT',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await apiRequest(`/v2/sites/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
    },
  },

  // ===== Gifts =====

  gifts: {
    async list(params?: PaginationParams): Promise<PaginatedResponse<Gift>> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const queryString = query.toString();
      const endpoint = `/gifts${queryString ? `?${queryString}` : ''}`;

      return apiRequest<PaginatedResponse<Gift>>(endpoint, {
        requireAuth: true,
      });
    },

    async listBySite(siteId: string): Promise<Gift[]> {
      const response = await apiRequest<{ gifts: Gift[] }>(
        `/public/sites/${siteId}/gifts`
      );
      return response.gifts;
    },

    async get(id: string): Promise<Gift> {
      const response = await apiRequest<{ success: true; data: Gift }>(
        `/gifts/${id}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async create(request: CreateGiftRequest): Promise<Gift> {
      const response = await apiRequest<{ success: true; data: Gift }>(
        '/gifts',
        {
          method: 'POST',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async update(id: string, request: UpdateGiftRequest): Promise<Gift> {
      const response = await apiRequest<{ success: true; data: Gift }>(
        `/gifts/${id}`,
        {
          method: 'PUT',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await apiRequest(`/gifts/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
    },

    async bulkDelete(giftIds: string[]): Promise<void> {
      await apiRequest('/gifts/bulk-delete', {
        method: 'POST',
        body: { giftIds },
        requireAuth: true,
      });
    },

    async initializeCatalog(): Promise<void> {
      await apiRequest('/gifts/initialize', {
        method: 'POST',
        requireAuth: false,
      });
    },

    async getCategories(): Promise<string[]> {
      const response = await apiRequest<{ categories: string[] }>(
        '/gifts/categories/list',
        { requireAuth: false }
      );
      return response.categories;
    },
  },

  // ===== Employees =====

  employees: {
    async list(siteId: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
      const query = new URLSearchParams({ site_id: siteId });
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      return apiRequest<PaginatedResponse<Employee>>(
        `/v2/employees?${query.toString()}`,
        { requireAuth: true }
      );
    },

    async get(id: string): Promise<Employee> {
      const response = await apiRequest<{ success: true; data: Employee }>(
        `/v2/employees/${id}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async create(request: CreateEmployeeRequest): Promise<Employee> {
      const response = await apiRequest<{ success: true; data: Employee }>(
        '/v2/employees',
        {
          method: 'POST',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async update(id: string, request: UpdateEmployeeRequest): Promise<Employee> {
      const response = await apiRequest<{ success: true; data: Employee }>(
        `/v2/employees/${id}`,
        {
          method: 'PUT',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await apiRequest(`/v2/employees/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
    },

    async bulkImport(request: BulkImportRequest): Promise<BulkImportResponse> {
      return apiRequest<BulkImportResponse>('/v2/employees/bulk-import', {
        method: 'POST',
        body: request,
        requireAuth: true,
      });
    },
  },

  // ===== Orders =====

  orders: {
    async list(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const queryString = query.toString();
      const endpoint = `/v2/orders${queryString ? `?${queryString}` : ''}`;

      return apiRequest<PaginatedResponse<Order>>(endpoint, {
        requireAuth: true,
      });
    },

    async get(id: string): Promise<Order> {
      const response = await apiRequest<{ success: true; data: Order }>(
        `/v2/orders/${id}`,
        { requireAuth: true }
      );
      return response.data;
    },

    async create(request: CreateOrderRequest): Promise<Order> {
      const response = await apiRequest<{ success: true; data: Order }>(
        '/v2/orders',
        {
          method: 'POST',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },

    async update(id: string, request: UpdateOrderRequest): Promise<Order> {
      const response = await apiRequest<{ success: true; data: Order }>(
        `/v2/orders/${id}`,
        {
          method: 'PUT',
          body: request,
          requireAuth: true,
        }
      );
      return response.data;
    },
  },

  // ===== Validation =====

  validation: {
    async validateAccess(request: ValidateAccessRequest): Promise<ValidateAccessResponse> {
      return apiRequest<ValidateAccessResponse>('/public/validate-access', {
        method: 'POST',
        body: request,
      });
    },

    async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
      return apiRequest<MagicLinkResponse>('/public/magic-link/request', {
        method: 'POST',
        body: request,
      });
    },
  },

  // ===== Health =====

  health: {
    async check(): Promise<{ status: string; message: string }> {
      return apiRequest('/health');
    },
  },
};

// ===== Helper Functions =====

/**
 * Order history item for simplified order display
 */
export interface OrderHistoryItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  status: Order['status'];
  gift: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
  quantity: number;
  estimatedDelivery: string;
}

/**
 * Convert Order to OrderHistoryItem format
 * @param order - Full order object
 * @returns Simplified order history item
 * @example
 * ```typescript
 * const order = await apiClient.orders.get('123');
 * const historyItem = orderToHistoryItem(order);
 * ```
 */
export function orderToHistoryItem(order: Order): OrderHistoryItem {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    status: order.status,
    gift: {
      id: order.gift.id,
      name: order.gift.name,
      image: order.gift.image || order.gift.imageUrl || '',
      category: order.gift.category
    },
    quantity: order.quantity,
    estimatedDelivery: order.estimatedDelivery
  };
}

/**
 * Helper to ensure catalog is initialized before use
 * Automatically initializes the gift catalog if empty
 * Uses internal flag to prevent repeated initialization checks
 * 
 * @example
 * ```typescript
 * // Call once on app startup or before accessing gifts
 * await ensureCatalogInitialized();
 * 
 * // Now safe to fetch gifts
 * const gifts = await apiClient.gifts.list();
 * ```
 */
let catalogInitialized = false;

export async function ensureCatalogInitialized(): Promise<void> {
  if (catalogInitialized) return;
  
  // Skip initialization if user isn't authenticated
  // This prevents "Authentication required" errors on public pages
  const token = getAccessToken();
  if (!token) {
    return;
  }
  
  try {
    // Try to get gifts first - if empty, initialize
    const response = await apiClient.gifts.list({ limit: 1 });
    
    if (response.data.length === 0) {
      console.warn('Initializing gift catalog...');
      await apiClient.gifts.initializeCatalog();
      catalogInitialized = true;
      console.warn('Gift catalog initialized successfully');
    } else {
      catalogInitialized = true;
      console.warn(`Gift catalog already has ${response.total} gifts`);
    }
  } catch (error) {
    // Silently fail - catalog initialization is optional
    // Backend may not be deployed yet, which is fine for development
    catalogInitialized = false; // Allow retry later
  }
}