/**
 * Shared TypeScript interfaces for the wecelebrate platform
 * These types ensure type safety across the entire application
 */

// Export all types from common (base callback types, etc.)
export * from './common';

// Export event handler types (may have some overlaps with common - that's OK, they're compatible)
// Skipping to avoid duplicate export warnings: export * from './events';

// Export catalog types
export * from './catalog';

// ============================================================================
// GIFT TYPES
// ============================================================================

export interface Gift {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sku: string;
  price: number;
  status: 'active' | 'inactive' | 'discontinued';
  inStock?: boolean;
  tags?: string[];
  brand?: string;
  stock?: number;
  catalogId?: string;
  externalId?: string;
  specifications?: Record<string, string | number>;
  compliance?: {
    prop65?: {
      required: boolean;
      warningType?: 'cancer' | 'reproductive' | 'both';
      chemicalNames?: string[];
      customWarning?: string;
    };
    pfas?: {
      containsPFAS: boolean;
      pfasLevel?: 'trace' | 'moderate' | 'high';
      warningMessage?: string;
    };
    energyCompliance?: {
      regulationRequired: boolean;
      energyRating?: string;
      certificationNumber?: string;
    };
    restrictedStates?: string[];
    additionalWarnings?: string[];
    certifications?: string[];
  };
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// ============================================================================
// SITE TYPES
// ============================================================================

export interface Site {
  id: string;
  name: string;
  slug?: string;
  clientId: string;
  status: 'active' | 'inactive' | 'pending' | 'draft';
  domain?: string;
  brandingColor?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    accentColor?: string; // Added for CreateSiteModal compatibility
    logo?: string;
  };
  logo?: string;
  settings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  
  // Multi-language content support (camelCase)
  availableLanguages?: string[];
  translations?: Record<string, any>;
  draftAvailableLanguages?: string[];
  _draftSettings?: Record<string, unknown>;
  
  // Multi-language content support (snake_case for backward compatibility)
  available_languages?: string[];
  draft_available_languages?: string[];
  draft_settings?: Record<string, unknown>;
}

export interface SiteWithDetails extends Site {
  clientName?: string;
  giftCount?: number;
  userCount?: number;
}

// ============================================================================
// SITE GIFT CONFIGURATION TYPES
// ============================================================================

export interface PriceLevel {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  description?: string;
}

export interface GiftExclusions {
  excludedSkus?: string[];
  excludedCategories?: string[];
  excludedTags?: string[];
  excludedBrands?: string[];
}

export interface GiftOverride {
  giftId: string;
  price?: number;
  name?: string;
  description?: string;
  hidden?: boolean;
}

export interface SiteGiftConfiguration {
  siteId: string;
  assignmentStrategy: 'all' | 'price_levels' | 'exclusions' | 'explicit';
  
  // Price Levels Strategy
  priceLevels?: PriceLevel[];
  selectedLevelId?: string;
  
  // Exclusions Strategy
  exclusions?: GiftExclusions;
  excludedSkus?: string[]; // Backward compatibility
  excludedCategories?: string[]; // Backward compatibility
  excludedTags?: string[];
  excludedBrands?: string[];
  
  // Explicit Strategy
  includedGiftIds?: string[];
  
  // Overrides (applies to all strategies)
  overrides?: GiftOverride[];
  
  // Catalog Configuration
  defaultCatalogId?: string;
  allowMultipleCatalogs?: boolean;
  
  // Display Options
  hideOutOfStock?: boolean;
  allowPriceOverride?: boolean;
  priceAdjustment?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  contactEmail?: string;
  contactName?: string;
  industry?: string;
  logo?: string;
  settings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  clientCode?: string;
  isActive?: boolean;
}

export interface ClientWithDetails extends Client {
  siteCount?: number;
  totalUsers?: number;
}

// ============================================================================
// CATALOG CONFIGURATION TYPES
// ============================================================================

export interface SiteCatalogConfiguration {
  siteId: string;
  catalogIds: string[];
  defaultCatalogId?: string;
  allowMultipleCatalogs: boolean;
  catalogPriority?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'client_admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  siteId?: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'client_admin';
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  tags?: string[];
  brands?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export interface DeploymentEnvironment {
  id: string;
  name: string;
  supabaseUrl: string;
  apiBaseUrl: string;
  isDefault?: boolean;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber?: string;
  orderDate?: string;
  siteId: string;
  employeeId?: string;
  giftId: string;
  giftName?: string;
  quantity?: number;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: OrderStatus;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// EVENT TYPES (for celebrations and anniversaries)
// ============================================================================

export interface Event {
  id: string;
  type: 'work_anniversary' | 'birthday' | 'milestone' | 'custom';
  employeeId: string;
  employeeName: string;
  title: string;
  description?: string;
  date: string;
  siteId: string;
  clientId: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// Re-export catalog types from catalog module for convenience
export type {
  CatalogType,
  CatalogStatus,
  CatalogFilters
} from './catalog';

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Employee {
  id: string;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department?: string;
  serialCardNumber?: string;
  siteId: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface CreateSiteFormData {
  name: string;
  slug?: string;
  clientId: string;
  domain?: string;
  templateId?: string;
  type?: string;
  validationMethod: 'email' | 'employee_id' | 'serial_card' | 'magic_link';
  shippingMode?: 'individual' | 'bulk' | 'store_pickup';
  validationMethods?: Array<{
    type: 'email' | 'employee_id' | 'serial_card' | 'magic_link';
    enabled: boolean;
  }>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    accentColor?: string; // Added for CreateSiteModal compatibility
    logo?: string;
  };
  settings?: Record<string, unknown>;
}

export interface CreateGiftFormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  price: string | number; // Allow string for form input, convert to number before submission
  image?: string;
  tags?: string[];
  brand?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  inStock?: boolean;
  stock?: number;
}