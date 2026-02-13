/**
 * Backend Type Definitions for JALA2
 * Phase 3: Backend Refactoring
 */

// ===== Core Types =====

export type EnvironmentId = 'development' | 'staging' | 'production';

export interface RequestContext {
  userId?: string;
  userEmail?: string;
  environmentId: EnvironmentId;
  ip?: string;
  userAgent?: string;
}

// ===== Authentication Types =====

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface SignupResponse {
  success: boolean;
  userId?: string;
  accessToken?: string;
  error?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  userId?: string;
  email?: string;
  username?: string;
  error?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface SessionResponse {
  authenticated: boolean;
  userId?: string;
  email?: string;
  username?: string;
}

// ===== Client Types =====

export interface Client {
  id: string;
  name: string;
  contact_email: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  
  // Client Settings
  client_code?: string; // Code used to identify client and in URL
  client_region?: string; // US/CA, EMEA, APAC, LATAM, Global
  client_source_code?: string;
  client_contact_name?: string;
  client_contact_phone?: string;
  client_tax_id?: string;
  
  // Client Address
  client_address_line_1?: string;
  client_address_line_2?: string;
  client_address_line_3?: string;
  client_city?: string;
  client_postal_code?: string;
  client_country_state?: string;
  client_country?: string;
  
  // Account Settings
  client_account_manager?: string;
  client_account_manager_email?: string;
  client_implementation_manager?: string;
  client_implementation_manager_email?: string;
  technology_owner?: string;
  technology_owner_email?: string;
  
  // Client App Settings
  client_url?: string; // Client's Main URL
  client_allow_session_timeout_extend?: boolean; // Yes, No
  client_authentication_method?: string;
  client_custom_url?: string;
  client_has_employee_data?: boolean; // Yes, No
  
  // Client Billing Settings
  client_invoice_type?: string; // Client, Site, Site and Award, HR Manager, Manager, Purchase Order, Registered Invoice, Online Payment
  client_invoice_template_type?: string; // US, UK, German
  client_po_type?: string;
  client_po_number?: string;
  
  // Client Integrations
  client_erp_system?: string;
  client_sso?: string;
  client_hris_system?: string;
}

export interface CreateClientRequest {
  name: string;
  contactEmail: string;
  status?: 'active' | 'inactive';
  
  // All optional fields
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  clientContactName?: string;
  clientContactPhone?: string;
  clientTaxId?: string;
  
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  
  clientErpSystem?: string;
  clientSso?: string;
  clientHrisSystem?: string;
}

export interface UpdateClientRequest {
  name?: string;
  contactEmail?: string;
  status?: 'active' | 'inactive';
  
  // All optional update fields
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  clientContactName?: string;
  clientContactPhone?: string;
  clientTaxId?: string;
  
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  
  clientErpSystem?: string;
  clientSso?: string;
  clientHrisSystem?: string;
}

// ===== Site Types =====

export interface ValidationMethod {
  type: 'email' | 'employeeId' | 'serialCard' | 'magicLink';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface SiteBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  customCss?: string;
}

export interface Site {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  validation_methods: ValidationMethod[];
  branding?: SiteBranding;
  selection_start_date?: string;
  selection_end_date?: string;
  
  // Phase 1: ERP Integration Fields (CRITICAL)
  site_code?: string;
  site_erp_integration?: string;
  site_erp_instance?: string;
  site_ship_from_country?: string;
  site_hris_system?: string;
  
  // Phase 2: Site Management
  site_drop_down_name?: string;
  site_custom_domain_url?: string;
  site_account_manager?: string;
  site_account_manager_email?: string;
  site_celebrations_enabled?: boolean;
  allow_session_timeout_extend?: boolean;
  enable_employee_log_report?: boolean;
  
  // Phase 3: Regional Client Info
  regional_client_info?: {
    office_name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address_line_1?: string;
    address_line_2?: string;
    address_line_3?: string;
    city?: string;
    country_state?: string;
    tax_id?: string;
  };
  
  // Phase 4: Advanced Authentication
  disable_direct_access_auth?: boolean;
  sso_provider?: string;
  sso_client_office_name?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreateSiteRequest {
  clientId: string;
  name: string;
  slug: string;
  status?: 'active' | 'inactive';
  validationMethods: ValidationMethod[];
  branding?: SiteBranding;
  selectionStartDate?: string;
  selectionEndDate?: string;
  
  // ERP Integration
  siteCode?: string;
  siteErpIntegration?: string;
  siteErpInstance?: string;
  siteShipFromCountry?: string;
  siteHrisSystem?: string;
  
  // Site Management
  siteDropDownName?: string;
  siteCustomDomainUrl?: string;
  siteAccountManager?: string;
  siteAccountManagerEmail?: string;
  siteCelebrationsEnabled?: boolean;
  allowSessionTimeoutExtend?: boolean;
  enableEmployeeLogReport?: boolean;
  
  // Regional Info
  regionalClientInfo?: {
    officeName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;
    taxId?: string;
  };
  
  // Authentication
  disableDirectAccessAuth?: boolean;
  ssoProvider?: string;
  ssoClientOfficeName?: string;
}

export interface UpdateSiteRequest {
  name?: string;
  slug?: string;
  status?: 'active' | 'inactive';
  validationMethods?: ValidationMethod[];
  branding?: SiteBranding;
  selectionStartDate?: string;
  selectionEndDate?: string;
  
  // ERP Integration
  siteCode?: string;
  siteErpIntegration?: string;
  siteErpInstance?: string;
  siteShipFromCountry?: string;
  siteHrisSystem?: string;
  
  // Site Management
  siteDropDownName?: string;
  siteCustomDomainUrl?: string;
  siteAccountManager?: string;
  siteAccountManagerEmail?: string;
  siteCelebrationsEnabled?: boolean;
  allowSessionTimeoutExtend?: boolean;
  enableEmployeeLogReport?: boolean;
  
  // Regional Info
  regionalClientInfo?: {
    officeName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;
    taxId?: string;
  };
  
  // Authentication
  disableDirectAccessAuth?: boolean;
  ssoProvider?: string;
  ssoClientOfficeName?: string;
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

// ===== Catalog Types (Multi-Catalog Architecture) =====

export type CatalogType = 'erp' | 'vendor' | 'manual' | 'dropship';
export type CatalogStatus = 'active' | 'inactive' | 'syncing' | 'error';
export type SourceType = 'api' | 'file' | 'manual';
export type AuthType = 'basic' | 'oauth' | 'api_key' | 'none';
export type FileFormat = 'csv' | 'xlsx' | 'json' | 'xml';
export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  type: CatalogType;
  source: CatalogSource;
  status: CatalogStatus;
  
  // Metadata
  totalProducts: number;
  activeProducts: number;
  lastSyncedAt?: string;
  nextSyncAt?: string;
  
  // Configuration
  settings: CatalogSettings;
  
  // Ownership
  managedBy?: string;      // Admin user ID
  ownerId?: string;        // Client ID (if client-specific)
  
  createdAt: string;
  updatedAt: string;
}

export interface CatalogSource {
  type: SourceType;
  sourceSystem: string;    // "SAP", "Oracle", "Vendor Portal", etc.
  sourceId: string;        // External system identifier
  sourceVersion?: string;  // API version
  
  // API configuration
  apiConfig?: ApiSourceConfig;
  
  // File configuration
  fileConfig?: FileSourceConfig;
}

export interface ApiSourceConfig {
  endpoint: string;
  authType: AuthType;
  credentials: Record<string, string>;  // Encrypted in production
  syncEndpoint: string;
  headers?: Record<string, string>;
  timeout?: number;                     // Request timeout in ms
  retryAttempts?: number;               // Number of retry attempts
}

export interface FileSourceConfig {
  format: FileFormat;
  ftpHost?: string;
  ftpPort?: number;
  ftpPath?: string;
  ftpUsername?: string;
  ftpPassword?: string;  // Encrypted in production
  encoding?: string;     // File encoding (default: utf-8)
  delimiter?: string;    // CSV delimiter (default: ,)
}

export interface CatalogSettings {
  autoSync: boolean;
  syncFrequency?: SyncFrequency;
  defaultCurrency: string;
  priceMarkup?: number;           // Percentage markup on cost
  allowSiteOverrides: boolean;    // Can sites modify prices?
  trackInventory: boolean;
  requireApproval?: boolean;      // Require approval for sync changes
  notifyOnSync?: boolean;         // Send notification after sync
  notifyOnError?: boolean;        // Send notification on sync errors
}

export interface CreateGiftRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  category?: string;
  availableQuantity?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateGiftRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  category?: string;
  availableQuantity?: number;
  status?: 'active' | 'inactive';
}

// ===== Employee Types =====

export interface Employee {
  id: string;
  site_id: string;
  employee_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  serial_card_number?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
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

export interface BulkImportRequest {
  siteId: string;
  employees: Array<{
    employeeId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    serialCardNumber?: string;
  }>;
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

export interface Order {
  id: string;
  site_id: string;
  employee_id?: string;
  gift_id: string;
  shipping_address: ShippingAddress;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  siteId: string;
  employeeId?: string;
  giftId: string;
  shippingAddress: ShippingAddress;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

// ===== Validation Types =====

export interface ValidateAccessRequest {
  siteId: string;
  method: 'email' | 'employeeId' | 'serialCard' | 'magicLink';
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

export interface ERPConnection {
  id: string;
  name: string;
  type: 'api' | 'sftp' | 'database';
  config: Record<string, any>;
  status: 'active' | 'inactive';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncSchedule {
  enabled: boolean;
  cron: string;
  lastRun?: string;
  nextRun?: string;
}

export interface CreateERPConnectionRequest {
  name: string;
  type: 'api' | 'sftp' | 'database';
  config: Record<string, any>;
  schedule?: SyncSchedule;
}

export interface UpdateERPConnectionRequest {
  name?: string;
  config?: Record<string, any>;
  status?: 'active' | 'inactive';
  schedule?: SyncSchedule;
}

export interface SyncResult {
  success: boolean;
  itemsSynced?: number;
  errors?: string[];
  timestamp: string;
}

// ===== Analytics Types =====

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  siteId?: string;
  clientId?: string;
  metric?: 'orders' | 'selections' | 'validations' | 'gifts';
}

export interface AnalyticsResponse {
  data: Record<string, any>;
  summary: {
    total: number;
    period: string;
  };
}

// ===== Audit Log Types =====

export interface AuditLogEntry {
  action: string;
  userId?: string;
  status: 'success' | 'failure' | 'warning';
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

// ===== Error Response Types =====

export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// ===== API Response Wrapper =====

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;