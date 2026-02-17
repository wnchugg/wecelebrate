/**
 * Database Types
 * 
 * TypeScript interfaces for all database tables
 * Generated from schema.sql
 */

// ==================== Clients ====================

export interface Client {
  id: string;
  name: string;
  contact_email: string;
  status: 'active' | 'inactive';
  client_code?: string;
  client_region?: string;
  client_source_code?: string;
  client_contact_name?: string;
  client_contact_phone?: string;
  client_tax_id?: string;
  client_address_line_1?: string;
  client_address_line_2?: string;
  client_address_line_3?: string;
  client_city?: string;
  client_postal_code?: string;
  client_country_state?: string;
  client_country?: string;
  client_account_manager?: string;
  client_account_manager_email?: string;
  client_implementation_manager?: string;
  client_implementation_manager_email?: string;
  technology_owner?: string;
  technology_owner_email?: string;
  client_url?: string;
  client_allow_session_timeout_extend?: boolean;
  client_authentication_method?: string;
  client_custom_url?: string;
  client_has_employee_data?: boolean;
  client_invoice_type?: string;
  client_invoice_template_type?: string;
  client_po_type?: string;
  client_po_number?: string;
  client_erp_system?: string;
  client_sso?: string;
  client_hris_system?: string;
  default_brand_id?: string;
  branding_overrides?: Record<string, any>;
  header_footer_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  contact_email: string;
  status?: 'active' | 'inactive';
  client_code?: string;
  client_region?: string;
  // ... other optional fields
}

export interface UpdateClientInput {
  name?: string;
  contact_email?: string;
  status?: 'active' | 'inactive';
  client_code?: string;
  // ... other optional fields
}

export interface ClientFilters {
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== Sites ====================

export interface Site {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'maintenance';
  site_url?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  custom_css?: string;
  settings?: Record<string, any>;
  brand_id?: string;
  branding_overrides?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateSiteInput {
  client_id: string;
  name: string;
  slug: string;
  status?: 'active' | 'inactive' | 'maintenance';
  site_url?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  custom_css?: string;
  settings?: Record<string, any>;
  created_by?: string;
}

export interface UpdateSiteInput {
  client_id?: string;
  name?: string;
  slug?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  site_url?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  custom_css?: string;
  settings?: Record<string, any>;
  updated_by?: string;
}

export interface SiteFilters {
  client_id?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== Catalogs ====================

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  type: 'erp' | 'vendor' | 'manual' | 'dropship';
  status: 'draft' | 'active' | 'inactive' | 'syncing' | 'error';
  source?: Record<string, any>;  // JSONB field for source configuration
  settings?: Record<string, any>;  // JSONB field for settings
  managed_by?: string;
  owner_id?: string;
  total_products: number;
  active_products: number;
  last_synced_at?: string;
  next_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogInput {
  name: string;
  description?: string;
  type: 'erp' | 'vendor' | 'manual' | 'dropship';
  status?: 'draft' | 'active' | 'inactive' | 'syncing' | 'error';
  source?: Record<string, any>;
  settings?: Record<string, any>;
  managed_by?: string;
  owner_id?: string;
}

export interface UpdateCatalogInput {
  name?: string;
  description?: string;
  type?: 'erp' | 'vendor' | 'manual' | 'dropship';
  status?: 'draft' | 'active' | 'inactive' | 'syncing' | 'error';
  source?: Record<string, any>;
  settings?: Record<string, any>;
  managed_by?: string;
  owner_id?: string;
  last_synced_at?: string;
  next_sync_at?: string;
}

export interface CatalogFilters {
  type?: 'erp' | 'vendor' | 'manual' | 'dropship';
  status?: 'draft' | 'active' | 'inactive' | 'syncing' | 'error';
  owner_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== Products ====================

export interface Product {
  id: string;
  catalog_id: string;
  sku: string;
  name: string;
  description?: string;
  long_description?: string;
  category?: string;
  price: number;
  currency: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  available_quantity?: number;
  image_url?: string;
  features?: string[];
  specifications?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateProductInput {
  catalog_id: string;
  sku: string;
  name: string;
  description?: string;
  long_description?: string;
  category?: string;
  price: number;
  currency?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  available_quantity?: number;
  image_url?: string;
  features?: string[];
  specifications?: Record<string, any>;
  metadata?: Record<string, any>;
  created_by?: string;
}

export interface UpdateProductInput {
  catalog_id?: string;
  sku?: string;
  name?: string;
  description?: string;
  long_description?: string;
  category?: string;
  price?: number;
  currency?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  available_quantity?: number;
  image_url?: string;
  features?: string[];
  specifications?: Record<string, any>;
  metadata?: Record<string, any>;
  updated_by?: string;
}

export interface ProductFilters {
  catalog_id?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  limit?: number;
  offset?: number;
}

// ==================== Employees ====================

export interface Employee {
  id: string;
  site_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateEmployeeInput {
  site_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status?: 'active' | 'inactive' | 'terminated';
  metadata?: Record<string, any>;
  created_by?: string;
}

export interface UpdateEmployeeInput {
  site_id?: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status?: 'active' | 'inactive' | 'terminated';
  metadata?: Record<string, any>;
  updated_by?: string;
}

export interface EmployeeFilters {
  site_id?: string;
  status?: 'active' | 'inactive' | 'terminated';
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== Orders ====================

export interface Order {
  id: string;
  client_id: string;
  site_id: string;
  product_id?: string;
  employee_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_employee_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  tracking_number?: string;
  items: Array<{
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface CreateOrderInput {
  client_id: string;
  site_id: string;
  product_id?: string;
  employee_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_employee_id?: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency?: string;
  shipping_address: Record<string, any>;
  tracking_number?: string;
  items: Array<{
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata?: Record<string, any>;
  notes?: string;
}

export interface UpdateOrderInput {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  metadata?: Record<string, any>;
  notes?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface OrderFilters {
  client_id?: string;
  site_id?: string;
  product_id?: string;
  employee_id?: string;
  customer_email?: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  search?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// ==================== Site Product Exclusions ====================

export interface SiteProductExclusion {
  id: string;
  site_id: string;
  product_id: string;
  reason?: string;
  created_at: string;
  created_by?: string;
}

export interface CreateSiteProductExclusionInput {
  site_id: string;
  product_id: string;
  reason?: string;
  created_by?: string;
}

// ==================== Analytics Events ====================

export interface AnalyticsEvent {
  id: string;
  site_id?: string;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CreateAnalyticsEventInput {
  site_id?: string;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// ==================== Admin Users ====================

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserInput {
  email: string;
  username: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
}

export interface UpdateAdminUserInput {
  email?: string;
  username?: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  metadata?: Record<string, any>;
}

// ==================== Audit Logs ====================

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CreateAuditLogInput {
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// ==================== Site Catalog Configuration ====================

export interface SiteCatalogAssignment {
  id: string;
  site_id: string;
  catalog_id: string;
  settings: {
    allowPriceOverride?: boolean;
    priceAdjustment?: {
      type: 'percentage' | 'fixed';
      value: number;
    };
    hideOutOfStock?: boolean;
    hideDiscontinued?: boolean;
    minimumInventory?: number;
    maximumPrice?: number;
    minimumPrice?: number;
    onlyShowFeatured?: boolean;
    [key: string]: any; // Allow additional custom settings
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateSiteCatalogAssignmentInput {
  site_id: string;
  catalog_id: string;
  settings?: SiteCatalogAssignment['settings'];
  created_by?: string;
}

export interface UpdateSiteCatalogAssignmentInput {
  settings?: Partial<SiteCatalogAssignment['settings']>;
  updated_by?: string;
}

export interface SitePriceOverride {
  id: string;
  site_id: string;
  product_id: string;
  override_price: number;
  reason?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateSitePriceOverrideInput {
  site_id: string;
  product_id: string;
  override_price: number;
  reason?: string;
  created_by?: string;
}

export interface UpdateSitePriceOverrideInput {
  override_price?: number;
  reason?: string;
  updated_by?: string;
}

export interface SiteCategoryExclusion {
  id: string;
  site_id: string;
  category: string;
  reason?: string;
  created_at: string;
  created_by?: string;
}

export interface CreateSiteCategoryExclusionInput {
  site_id: string;
  category: string;
  reason?: string;
  created_by?: string;
}

// Combined site catalog configuration (for API responses)
export interface SiteCatalogConfig {
  siteId: string;
  assignments: SiteCatalogAssignment[];
  priceOverrides: SitePriceOverride[];
  categoryExclusions: SiteCategoryExclusion[];
  productExclusions: SiteProductExclusion[];
}
