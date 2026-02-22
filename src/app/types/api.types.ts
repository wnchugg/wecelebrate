/**
 * Frontend Type Definitions - Matching Backend API
 * Phase 4: Frontend Refactoring
 */

import type {
  HeaderFooterConfig,
  BrandingAssets,
  GiftSelectionConfig,
  ReviewScreenConfig,
  OrderTrackingConfig,
} from './siteCustomization';

// ===== Re-export Zod Schema Types for API Requests Only (Not Entity Types) =====
export type {
  // Authentication Requests
  SignupRequest,
  LoginRequest,
  SessionResponse,

  // Client Requests
  CreateClientRequest,
  UpdateClientRequest,

  // Site Requests
  CreateSiteRequest as ZodCreateSiteRequest,
  UpdateSiteRequest as ZodUpdateSiteRequest,

  // Gift Requests
  CreateGiftRequest as ZodCreateGiftRequest,
  UpdateGiftRequest as ZodUpdateGiftRequest,

  // Employee Requests
  CreateEmployeeRequest as ZodCreateEmployeeRequest,
  UpdateEmployeeRequest as ZodUpdateEmployeeRequest,

  // Order Requests
  CreateOrderRequest as ZodCreateOrderRequest,
  UpdateOrderRequest as ZodUpdateOrderRequest,
} from '../schemas/validation.schemas';

// ===== Core Types =====

export type EnvironmentId = 'development' | 'staging' | 'production';

// ===== Extended Authentication Types =====

export interface SignupResponse {
  success: boolean;
  userId?: string;
  accessToken?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  userId?: string;
  email?: string;
  username?: string;
  error?: string;
}

// ===== Client Types =====

export interface Client {
  // System fields
  /** Unique identifier for the client */
  id: string;
  /** Timestamp when the client was created */
  createdAt: string;
  /** Timestamp when the client was last updated */
  updatedAt: string;
  
  // Basic Information (Required)
  /** Client organization name */
  name: string;
  /** Primary contact email address for the client */
  contactEmail: string;
  /** Current status of the client account */
  status: 'active' | 'inactive';
  
  // Client Identification
  /** Unique code identifying the client in external systems */
  clientCode?: string;
  /** Geographic region where the client operates (e.g., US/CA, EMEA, APAC, LATAM, Global) */
  clientRegion?: string;
  /** Source code indicating how the client was acquired or originated */
  clientSourceCode?: string;
  
  // Contact Information
  /** Name of the primary contact person at the client organization */
  clientContactName?: string;
  /** Phone number for the primary contact person */
  clientContactPhone?: string;
  /** Tax identification number for the client organization */
  clientTaxId?: string;
  
  // Address
  /** First line of the client's physical address */
  clientAddressLine1?: string;
  /** Second line of the client's physical address */
  clientAddressLine2?: string;
  /** Third line of the client's physical address */
  clientAddressLine3?: string;
  /** City where the client is located */
  clientCity?: string;
  /** Postal or ZIP code for the client's address */
  clientPostalCode?: string;
  /** State, province, or country subdivision */
  clientCountryState?: string;
  /** Country where the client is located */
  clientCountry?: string;
  
  // Account Management
  /** Name of the HALO account manager assigned to this client */
  clientAccountManager?: string;
  /** Email address of the account manager */
  clientAccountManagerEmail?: string;
  /** Name of the implementation manager for this client */
  clientImplementationManager?: string;
  /** Email address of the implementation manager */
  clientImplementationManagerEmail?: string;
  /** Name of the technology owner responsible for technical aspects */
  technologyOwner?: string;
  /** Email address of the technology owner */
  technologyOwnerEmail?: string;
  
  // Application Settings
  /** Primary URL for accessing the client's application */
  clientUrl?: string;
  /** Custom branded URL for the client's application */
  clientCustomUrl?: string;
  /** Whether to allow users to extend session timeout (4-hour sessions) */
  clientAllowSessionTimeoutExtend?: boolean;
  /** Authentication method used by the client (e.g., SSO, Basic, OAuth) */
  clientAuthenticationMethod?: string;
  /** Whether the client has employee data integrated */
  clientHasEmployeeData?: boolean;
  
  // Billing Settings
  /** Type of invoice used for billing this client */
  clientInvoiceType?: string;
  /** Template type used for generating invoices */
  clientInvoiceTemplateType?: string;
  /** Type of purchase order used by the client */
  clientPoType?: string;
  /** Purchase order number for billing reference */
  clientPoNumber?: string;
  
  // Integration Settings
  /** ERP system integrated with the client (e.g., NXJ, Fourgen, Netsuite, GRS) */
  clientErpSystem?: string;
  /** SSO provider configuration for the client */
  clientSso?: string;
  /** HRIS system integrated with the client */
  clientHrisSystem?: string;
  
  // UX Customization
  /** Header and footer configuration for client branding */
  headerFooterConfig?: HeaderFooterConfig;
  /** Branding assets including logos and colors */
  brandingAssets?: BrandingAssets;
}

// ===== Extended Site Types =====

export type ValidationMethodType = 'email' | 'employee_id' | 'serial_card' | 'magic_link' | 'sso';

export interface ValidationMethod {
  type: ValidationMethodType;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface SiteBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  customCss?: string;
}

export interface SiteSettings {
  validationMethod: ValidationMethodType;
  ssoProvider?: 'google' | 'microsoft' | 'okta' | 'azure';
  allowMultipleSelections: boolean;
  requireShipping: boolean;
  supportEmail: string;
  languages: string[];
  defaultLanguage: string;                // Primary language for the site (required for all translatable fields)
  enableLanguageSelector?: boolean;
  allowQuantitySelection?: boolean;
  showPricing?: boolean;
  giftsPerUser?: number;
  shippingMode?: 'company' | 'employee' | 'store';
  defaultShippingAddress?: string;
  welcomeMessage?: string;
  // Landing Page Configuration
  skipLandingPage?: boolean;
  // Welcome Page Configuration
  enableWelcomePage?: boolean;
  welcomePageContent?: {
    title?: string;
    message?: string;
    imageUrl?: string;
    authorName?: string;
    authorTitle?: string;
    videoUrl?: string;
    ctaText?: string;
  };
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
  // International settings
  defaultCurrency?: string;
  allowedCountries?: string[];
  defaultCountry?: string;
  allowedDomains?: string[];
  // Availability period
  availabilityStartDate?: string;
  availabilityEndDate?: string;
  expiredMessage?: string;
  // Default Gift Configuration
  defaultGiftId?: string;
  defaultGiftDaysAfterClose?: number;
  // SSO Configuration
  ssoConfig?: {
    enabled: boolean;
    provider: 'saml' | 'oauth2' | 'openid' | 'azure' | 'okta' | 'google' | 'custom';
    // OAuth/OpenID fields (top-level for backward compatibility)
    clientId?: string;
    clientSecret?: string;
    authUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string;
    // SAML fields (top-level for backward compatibility)
    idpEntryPoint?: string;
    entityId?: string;
    certificate?: string;
    // Admin bypass fields
    allowAdminBypass?: boolean;
    bypassRequires2FA?: boolean;
    bypassAllowedIPs?: string[];
    // Nested structures
    saml?: {
      entryPoint: string;
      issuer: string;
      cert: string;
      callbackUrl: string;
      logoutUrl?: string;
      signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
      identifierFormat?: string;
    };
    oauth?: {
      clientId: string;
      clientSecret: string;
      authorizationUrl: string;
      tokenUrl: string;
      userInfoUrl?: string;
      scope: string;
      redirectUri: string;
      responseType?: 'code' | 'token' | 'id_token';
    };
    attributeMapping?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      employeeId?: string;
      department?: string;
    };
    autoProvision?: boolean;
    allowedDomains?: string[];
    sessionTimeout?: number;
    requireMFA?: boolean;
  };
  // Address validation
  addressValidation?: {
    enabled: boolean;
    provider: 'none' | 'usps' | 'google' | 'smartystreets' | 'loqate' | 'here';
    apiKey?: string;
    apiSecret?: string;
    validationLevel: 'strict' | 'moderate' | 'lenient';
    autoCorrect: boolean;
    requireValidation: boolean;
  };
  // Landing Page Configuration (extended)
  landingPageConfig?: any;
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'draft';
  isActive: boolean;
  validationMethods: ValidationMethod[];
  branding?: SiteBranding;
  settings: SiteSettings;
  selectionStartDate?: string;
  selectionEndDate?: string;
  domain?: string;
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  createdAt: string;
  updatedAt: string;
  
  // Multi-language content support
  availableLanguages?: string[];          // Languages enabled for this site (default: ['en'])
  translations?: Record<string, any>;     // JSONB column storing all translations
  draftAvailableLanguages?: string[];     // Draft languages (before publish)
  
  // NEW: UX Customization (can override client defaults)
  headerFooterConfig?: HeaderFooterConfig;
  brandingAssets?: BrandingAssets;
  giftSelectionConfig?: GiftSelectionConfig;
  reviewScreenConfig?: ReviewScreenConfig;
  orderTrackingConfig?: OrderTrackingConfig;
  
  // Phase 1: ERP Integration Fields (CRITICAL for ERP sync)
  siteCode?: string;                      // Unique code for ERP sync
  siteErpIntegration?: string;            // ERP system: NAJ, Fourgen, Netsuite, GRS
  siteErpInstance?: string;               // Specific ERP instance identifier
  siteShipFromCountry?: string;           // Country products are shipped from
  siteHrisSystem?: string;                // HR information system
  
  // Phase 2: Site Management Fields
  siteDropDownName?: string;              // Display name in multi-site dropdown
  siteCustomDomainUrl?: string;           // Custom domain if configured
  siteAccountManager?: string;            // HALO account manager assigned
  siteAccountManagerEmail?: string;       // AM email for notifications
  siteCelebrationsEnabled?: boolean;      // Enable celebration feature (default: false)
  allowSessionTimeoutExtend?: boolean;    // Allow 4-hour timeout (default: false)
  enableEmployeeLogReport?: boolean;      // Enable employee activity logging (default: false)
  
  // Phase 3: Regional Client Information
  regionalClientInfo?: {
    officeName?: string;                  // Regional office name
    contactName?: string;                 // Client contact at regional office
    contactEmail?: string;                // Regional contact email
    contactPhone?: string;                // Regional contact phone
    addressLine1?: string;                // Regional office address
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;                // Country/State
    taxId?: string;                       // Tax/VAT ID
  };
  
  // Phase 4: Advanced Authentication
  disableDirectAccessAuth?: boolean;      // Disable direct access, SSO only (default: false)
  ssoProvider?: string;                   // SSO provider name
  ssoClientOfficeName?: string;           // SSO configuration identifier
}

export interface CreateSiteRequest {
  clientId: string;
  name: string;
  slug: string;
  status?: 'active' | 'inactive';
  validationMethods: ValidationMethod[];
  branding?: SiteBranding;
  settings: SiteSettings;
  selectionStartDate?: string;
  selectionEndDate?: string;
  domain?: string;
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  headerFooterConfig?: HeaderFooterConfig;
  brandingAssets?: BrandingAssets;
  giftSelectionConfig?: GiftSelectionConfig;
  reviewScreenConfig?: ReviewScreenConfig;
  orderTrackingConfig?: OrderTrackingConfig;
  
  // Multi-language content support
  availableLanguages?: string[];          // Languages enabled for this site (default: ['en'])
  translations?: Record<string, any>;     // JSONB column storing all translations
  draftAvailableLanguages?: string[];     // Draft languages (before publish)
  
  // Phase 1: ERP Integration Fields (CRITICAL for ERP sync)
  siteCode?: string;                      // Unique code for ERP sync
  siteErpIntegration?: string;            // ERP system: NAJ, Fourgen, Netsuite, GRS
  siteErpInstance?: string;               // Specific ERP instance identifier
  siteShipFromCountry?: string;           // Country products are shipped from
  siteHrisSystem?: string;                // HR information system
  
  // Phase 2: Site Management Fields
  siteDropDownName?: string;              // Display name in multi-site dropdown
  siteCustomDomainUrl?: string;           // Custom domain if configured
  siteAccountManager?: string;            // HALO account manager assigned
  siteAccountManagerEmail?: string;       // AM email for notifications
  siteCelebrationsEnabled?: boolean;      // Enable celebration feature (default: false)
  allowSessionTimeoutExtend?: boolean;    // Allow 4-hour timeout (default: false)
  enableEmployeeLogReport?: boolean;      // Enable employee activity logging (default: false)
  
  // Phase 3: Regional Client Information
  regionalClientInfo?: {
    officeName?: string;                  // Regional office name
    contactName?: string;                 // Client contact at regional office
    contactEmail?: string;                // Regional contact email
    contactPhone?: string;                // Regional contact phone
    addressLine1?: string;                // Regional office address
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;                // Country/State
    taxId?: string;                       // Tax/VAT ID
  };
  
  // Phase 4: Advanced Authentication
  disableDirectAccessAuth?: boolean;      // Disable direct access, SSO only (default: false)
  ssoProvider?: string;                   // SSO provider name
  ssoClientOfficeName?: string;           // SSO configuration identifier
}

export interface UpdateSiteRequest {
  name?: string;
  slug?: string;
  status?: 'active' | 'inactive';
  validationMethods?: ValidationMethod[];
  branding?: SiteBranding;
  settings?: SiteSettings;
  selectionStartDate?: string;
  selectionEndDate?: string;
  domain?: string;
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  headerFooterConfig?: HeaderFooterConfig;
  brandingAssets?: BrandingAssets;
  giftSelectionConfig?: GiftSelectionConfig;
  reviewScreenConfig?: ReviewScreenConfig;
  orderTrackingConfig?: OrderTrackingConfig;
  
  // Multi-language content support
  availableLanguages?: string[];          // Languages enabled for this site (default: ['en'])
  translations?: Record<string, any>;     // JSONB column storing all translations
  draftAvailableLanguages?: string[];     // Draft languages (before publish)
  
  // Phase 1: ERP Integration Fields (CRITICAL for ERP sync)
  siteCode?: string;                      // Unique code for ERP sync
  siteErpIntegration?: string;            // ERP system: NAJ, Fourgen, Netsuite, GRS
  siteErpInstance?: string;               // Specific ERP instance identifier
  siteShipFromCountry?: string;           // Country products are shipped from
  siteHrisSystem?: string;                // HR information system
  
  // Phase 2: Site Management Fields
  siteDropDownName?: string;              // Display name in multi-site dropdown
  siteCustomDomainUrl?: string;           // Custom domain if configured
  siteAccountManager?: string;            // HALO account manager assigned
  siteAccountManagerEmail?: string;       // AM email for notifications
  siteCelebrationsEnabled?: boolean;      // Enable celebration feature (default: false)
  allowSessionTimeoutExtend?: boolean;    // Allow 4-hour timeout (default: false)
  enableEmployeeLogReport?: boolean;      // Enable employee activity logging (default: false)
  
  // Phase 3: Regional Client Information
  regionalClientInfo?: {
    officeName?: string;                  // Regional office name
    contactName?: string;                 // Client contact at regional office
    contactEmail?: string;                // Regional contact email
    contactPhone?: string;                // Regional contact phone
    addressLine1?: string;                // Regional office address
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;                // Country/State
    taxId?: string;                       // Tax/VAT ID
  };
  
  // Phase 4: Advanced Authentication
  disableDirectAccessAuth?: boolean;      // Disable direct access, SSO only (default: false)
  ssoProvider?: string;                   // SSO provider name
  ssoClientOfficeName?: string;           // SSO configuration identifier
}

// ===== Gift Types =====

export interface Gift {
  id: string;
  
  // NEW: Catalog linkage
  catalogId: string;
  
  // NEW: Source attribution
  source: {
    catalogId: string;
    externalId?: string;      // ID in external system
    externalSku?: string;     // SKU in external system
    lastSyncedAt?: string;
    syncStatus: 'synced' | 'modified' | 'conflict' | 'manual';
    syncNotes?: string;
  };
  
  // Product information
  name: string;
  description: string;
  sku: string;
  
  // Pricing
  price: number;
  cost?: number;              // NEW: Cost from vendor/ERP
  msrp?: number;              // NEW: Manufacturer's suggested retail price
  currency: string;
  
  // Images
  imageUrl?: string;
  image?: string; // Legacy field for backward compatibility
  
  // Categorization
  category?: string;
  
  // Inventory
  availableQuantity?: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Additional metadata
  features?: string[];
  specifications?: { [key: string]: string };
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  image?: string; // Legacy field for backward compatibility
  category?: string;
  availableQuantity?: number;
  status?: 'active' | 'inactive';
  features?: string[];
  specifications?: { [key: string]: string };
}

export interface UpdateGiftRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  image?: string; // Legacy field for backward compatibility
  category?: string;
  availableQuantity?: number;
  status?: 'active' | 'inactive';
  features?: string[];
  specifications?: { [key: string]: string };
}

// ===== Employee Types =====

export interface Employee {
  id: string;
  siteId: string;
  employeeId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  serialCardNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  siteId: string;
  employeeId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  serialCardNumber?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateEmployeeRequest {
  employeeId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  serialCardNumber?: string;
  status?: 'active' | 'inactive';
}

export interface BulkImportEmployee {
  employeeId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  serialCardNumber?: string;
}

export interface BulkImportRequest {
  siteId: string;
  employees: BulkImportEmployee[];
  overwriteExisting?: boolean;
}

export interface BulkImportResponse {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}

// ===== Order Types =====

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber?: string;
  orderDate?: string;
  siteId: string;
  employeeId?: string;
  giftId: string;
  gift?: Gift;
  quantity?: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  siteId: string;
  employeeId?: string;
  giftId: string;
  shippingAddress: ShippingAddress;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  trackingNumber?: string;
}

// ===== Validation Types =====

export interface ValidateAccessRequest {
  siteId: string;
  method: ValidationMethodType;
  value: string;
}

export interface ValidateAccessResponse {
  valid: boolean;
  employeeId?: string;
  error?: string;
}

export interface MagicLinkRequest {
  siteId: string;
  email: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ===== ERP Integration Types =====

export type ERPConnectionType = 'api' | 'sftp' | 'database';

export interface ERPConnection {
  id: string;
  name: string;
  type: ERPConnectionType;
  config: Record<string, unknown>;
  status: 'active' | 'inactive';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncSchedule {
  enabled: boolean;
  cron: string;
  lastRun?: string;
  nextRun?: string;
}

export interface CreateERPConnectionRequest {
  name: string;
  type: ERPConnectionType;
  config: Record<string, unknown>;
  schedule?: SyncSchedule;
}

export interface UpdateERPConnectionRequest {
  name?: string;
  config?: Record<string, unknown>;
  status?: 'active' | 'inactive';
  schedule?: SyncSchedule;
}

export interface SyncResult {
  success: boolean;
  itemsSynced?: number;
  errors?: string[];
  timestamp: string;
}

// ===== API Response Types =====

export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
  field?: string;
}

/**
 * API Error type - used across the application for error handling
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// ===== Pagination Types =====

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  total?: number; // Total count for convenience
}

// ===== Type Guards =====

export function isErrorResponse(response: ApiResponse<unknown>): response is ErrorResponse {
  return 'error' in response;
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return 'success' in response && response.success === true;
}

export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'pagination' in response &&
    Array.isArray((response as PaginatedResponse<T>).data)
  );
}