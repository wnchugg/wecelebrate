-- ============================================================================
-- WeCelebrate Platform - PostgreSQL Schema Design
-- Phase 1: Database Optimization
-- 
-- Purpose: Replace generic KV store with proper relational tables
-- Expected Improvement: 100-1000x faster queries
-- Date: February 15, 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- ============================================================================
-- CLIENTS TABLE
-- Stores client organizations (companies using the platform)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Client Identification
  client_code TEXT UNIQUE,  -- Code used in URLs and integrations
  client_region TEXT,  -- US/CA, EMEA, APAC, LATAM, Global
  client_source_code TEXT,
  
  -- Contact Information
  client_contact_name TEXT,
  client_contact_phone TEXT,
  client_tax_id TEXT,
  
  -- Address
  client_address_line_1 TEXT,
  client_address_line_2 TEXT,
  client_address_line_3 TEXT,
  client_city TEXT,
  client_postal_code TEXT,
  client_country_state TEXT,
  client_country TEXT,
  
  -- Account Management
  client_account_manager TEXT,
  client_account_manager_email TEXT,
  client_implementation_manager TEXT,
  client_implementation_manager_email TEXT,
  technology_owner TEXT,
  technology_owner_email TEXT,
  
  -- Application Settings
  client_url TEXT,
  client_allow_session_timeout_extend BOOLEAN DEFAULT false,
  client_authentication_method TEXT,
  client_custom_url TEXT,
  client_has_employee_data BOOLEAN DEFAULT false,
  
  -- Billing Settings
  client_invoice_type TEXT,
  client_invoice_template_type TEXT,
  client_po_type TEXT,
  client_po_number TEXT,
  
  -- Integration Settings
  client_erp_system TEXT,
  client_sso TEXT,
  client_hris_system TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT clients_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT clients_name_length CHECK (length(name) >= 2),
  CONSTRAINT clients_email_format CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON clients(client_code) WHERE client_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);

-- ============================================================================
-- SITES TABLE
-- Stores individual celebration sites (each client can have multiple sites)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sites (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  catalog_id UUID,  -- References catalogs table (added later)
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- URL-friendly identifier
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Validation Methods (stored as JSONB for flexibility)
  validation_methods JSONB NOT NULL DEFAULT '[]',
  
  -- Branding (stored as JSONB)
  branding JSONB DEFAULT '{}',
  
  -- Selection Period
  selection_start_date TIMESTAMPTZ,
  selection_end_date TIMESTAMPTZ,
  
  -- ERP Integration Fields
  site_code TEXT,
  site_erp_integration TEXT,
  site_erp_instance TEXT,
  site_ship_from_country TEXT,
  site_hris_system TEXT,
  
  -- Site Management
  site_drop_down_name TEXT,
  site_custom_domain_url TEXT,
  site_account_manager TEXT,
  site_account_manager_email TEXT,
  site_celebrations_enabled BOOLEAN DEFAULT false,
  allow_session_timeout_extend BOOLEAN DEFAULT false,
  enable_employee_log_report BOOLEAN DEFAULT false,
  
  -- Regional Client Info (stored as JSONB)
  regional_client_info JSONB DEFAULT '{}',
  
  -- Advanced Authentication
  disable_direct_access_auth BOOLEAN DEFAULT false,
  sso_provider TEXT,
  sso_client_office_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT sites_status_check CHECK (status IN ('draft', 'active', 'inactive')),
  CONSTRAINT sites_name_length CHECK (length(name) >= 2),
  CONSTRAINT sites_slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT sites_dates_check CHECK (
    selection_start_date IS NULL OR 
    selection_end_date IS NULL OR 
    selection_start_date < selection_end_date
  )
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_sites_client_id ON sites(client_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_catalog_id ON sites(catalog_id) WHERE catalog_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sites_client_status ON sites(client_id, status);
CREATE INDEX IF NOT EXISTS idx_sites_selection_dates ON sites(selection_start_date, selection_end_date) 
  WHERE selection_start_date IS NOT NULL;

-- ============================================================================
-- CATALOGS TABLE
-- Stores product catalogs (can be ERP-synced, manual, vendor, or dropship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalogs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,  -- erp, manual, vendor, dropship
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Source Information (stored as JSONB for flexibility)
  source JSONB NOT NULL DEFAULT '{}',
  
  -- Settings (stored as JSONB)
  settings JSONB NOT NULL DEFAULT '{}',
  
  -- Ownership
  managed_by TEXT,  -- Admin user ID
  owner_id UUID,  -- Client ID (if client-specific)
  
  -- Statistics
  total_products INTEGER NOT NULL DEFAULT 0,
  active_products INTEGER NOT NULL DEFAULT 0,
  
  -- Sync Information
  last_synced_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT catalogs_type_check CHECK (type IN ('erp', 'manual', 'vendor', 'dropship')),
  CONSTRAINT catalogs_status_check CHECK (status IN ('draft', 'active', 'inactive', 'syncing', 'error')),
  CONSTRAINT catalogs_name_length CHECK (length(name) >= 2),
  CONSTRAINT catalogs_product_counts CHECK (
    total_products >= 0 AND 
    active_products >= 0 AND 
    active_products <= total_products
  )
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_catalogs_type ON catalogs(type);
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON catalogs(status);
CREATE INDEX IF NOT EXISTS idx_catalogs_owner_id ON catalogs(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_catalogs_last_synced ON catalogs(last_synced_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_catalogs_type_status ON catalogs(type, status);

-- ============================================================================
-- PRODUCTS TABLE (formerly GIFTS)
-- Stores individual products/gifts available in catalogs
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  
  -- Product Identification
  sku TEXT NOT NULL,
  external_id TEXT,  -- ID in external system (ERP, vendor)
  external_sku TEXT,  -- SKU in external system
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  
  -- Pricing
  price NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2),  -- Cost from vendor/ERP
  msrp NUMERIC(10, 2),  -- Manufacturer's suggested retail price
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Images (stored as JSONB array)
  images JSONB DEFAULT '[]',
  image_url TEXT,  -- Primary image URL
  
  -- Product Details
  features JSONB DEFAULT '[]',  -- Array of feature strings
  specifications JSONB DEFAULT '{}',  -- Key-value pairs
  
  -- Inventory
  available_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,
  
  -- Sync Information
  sync_status TEXT DEFAULT 'manual',  -- synced, modified, conflict, manual
  sync_notes TEXT,
  last_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT products_catalog_sku_unique UNIQUE (catalog_id, sku),
  CONSTRAINT products_price_check CHECK (price >= 0),
  CONSTRAINT products_cost_check CHECK (cost IS NULL OR cost >= 0),
  CONSTRAINT products_msrp_check CHECK (msrp IS NULL OR msrp >= 0),
  CONSTRAINT products_inventory_check CHECK (available_quantity >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
  CONSTRAINT products_sync_status_check CHECK (sync_status IN ('synced', 'modified', 'conflict', 'manual')),
  CONSTRAINT products_name_length CHECK (length(name) >= 2)
);

-- Indexes for fast lookups and queries
CREATE INDEX IF NOT EXISTS idx_products_catalog_id ON products(catalog_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_catalog_active ON products(catalog_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);  -- Full-text search
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price) WHERE is_active = true;

-- ============================================================================
-- SITE_PRODUCT_EXCLUSIONS TABLE
-- Tracks which products are excluded from which sites
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_product_exclusions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Exclusion Details
  reason TEXT,
  excluded_by TEXT,  -- Admin user who excluded it
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT site_product_exclusions_unique UNIQUE (site_id, product_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_exclusions_site_id ON site_product_exclusions(site_id);
CREATE INDEX IF NOT EXISTS idx_site_exclusions_product_id ON site_product_exclusions(product_id);

-- ============================================================================
-- EMPLOYEES TABLE
-- Stores employee information for validation and tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Employee Identification
  employee_id TEXT NOT NULL,
  email TEXT,
  serial_card_number TEXT,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT employees_site_employee_unique UNIQUE (site_id, employee_id),
  CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT employees_email_format CHECK (
    email IS NULL OR 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_serial_card ON employees(serial_card_number) WHERE serial_card_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_site_status ON employees(site_id, status);

-- ============================================================================
-- ORDERS TABLE
-- Stores customer orders
-- ============================================================================

-- ============================================================================
-- ORDERS TABLE
-- Stores customer orders with multi-tenant support
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  client_id UUID NOT NULL REFERENCES clients(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  product_id UUID REFERENCES products(id),  -- Can be NULL if product deleted
  employee_id UUID REFERENCES employees(id),  -- Can be NULL for guest orders
  
  -- Order Identification
  order_number TEXT NOT NULL UNIQUE,  -- Human-readable order number
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_employee_id TEXT,  -- For tracking even if employee record deleted
  
  -- Order Details
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Shipping Information (stored as JSONB)
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  
  -- Order Items (stored as JSONB for flexibility)
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Additional Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT orders_total_check CHECK (total_amount >= 0),
  CONSTRAINT orders_email_format CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT orders_status_timestamps CHECK (
    (status != 'confirmed' OR confirmed_at IS NOT NULL) AND
    (status != 'shipped' OR shipped_at IS NOT NULL) AND
    (status != 'delivered' OR delivered_at IS NOT NULL) AND
    (status != 'cancelled' OR cancelled_at IS NOT NULL)
  )
);

-- Indexes for fast lookups and reporting
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_site_id ON orders(site_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_client_created ON orders(client_id, created_at DESC);  -- For client reports
CREATE INDEX IF NOT EXISTS idx_orders_site_created ON orders(site_id, created_at DESC);  -- For site reports
CREATE INDEX IF NOT EXISTS idx_orders_client_status ON orders(client_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_site_status ON orders(site_id, status);
-- ============================================================================
-- ANALYTICS_EVENTS TABLE
-- Stores user activity events for analytics and reporting
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys (nullable for anonymous events)
  client_id UUID REFERENCES clients(id),
  site_id UUID REFERENCES sites(id),
  
  -- Event Information
  event_type TEXT NOT NULL,  -- page_view, product_view, add_to_cart, purchase, etc.
  user_id TEXT,  -- Anonymous or authenticated user ID
  session_id TEXT,
  
  -- Event Data (stored as JSONB for flexibility)
  event_data JSONB NOT NULL DEFAULT '{}',
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT analytics_event_type_length CHECK (length(event_type) >= 2)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_client_id ON analytics_events(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_site_id ON analytics_events(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_client_date ON analytics_events(client_id, created_at DESC) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_site_date ON analytics_events(site_id, created_at DESC) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id) WHERE session_id IS NOT NULL;

-- ============================================================================
-- ADMIN_USERS TABLE
-- Stores admin user accounts for platform management
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Profile
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT admin_users_role_check CHECK (role IN ('super_admin', 'admin', 'viewer')),
  CONSTRAINT admin_users_status_check CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT admin_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for authentication
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- ============================================================================
-- AUDIT_LOGS TABLE
-- Stores audit trail of all important actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Action Information
  action TEXT NOT NULL,
  entity_type TEXT,  -- client, site, product, order, etc.
  entity_id UUID,
  
  -- User Information
  user_id UUID,
  user_email TEXT,
  user_type TEXT,  -- admin, employee, system
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  
  -- Status
  status TEXT NOT NULL,  -- success, failure, warning
  
  -- Details (stored as JSONB)
  details JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT audit_logs_status_check CHECK (status IN ('success', 'failure', 'warning')),
  CONSTRAINT audit_logs_user_type_check CHECK (user_type IN ('admin', 'employee', 'system', 'anonymous'))
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id) WHERE entity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalogs_updated_at BEFORE UPDATE ON catalogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active products with catalog information
CREATE OR REPLACE VIEW active_products_view AS
SELECT 
  p.*,
  c.name AS catalog_name,
  c.type AS catalog_type,
  c.owner_id AS catalog_owner_id
FROM products p
INNER JOIN catalogs c ON p.catalog_id = c.id
WHERE p.is_active = true AND c.status = 'active';

-- View: Site products (excluding excluded products)
CREATE OR REPLACE VIEW site_products_view AS
SELECT 
  s.id AS site_id,
  s.name AS site_name,
  s.client_id,
  p.*
FROM sites s
INNER JOIN catalogs c ON s.catalog_id = c.id
INNER JOIN products p ON p.catalog_id = c.id
LEFT JOIN site_product_exclusions spe ON spe.site_id = s.id AND spe.product_id = p.id
WHERE spe.id IS NULL  -- Exclude excluded products
  AND p.is_active = true
  AND c.status = 'active'
  AND s.status = 'active';

-- View: Order summary with related information
CREATE OR REPLACE VIEW orders_summary_view AS
SELECT 
  o.*,
  c.name AS client_name,
  s.name AS site_name,
  p.name AS product_name,
  p.sku AS product_sku,
  e.employee_id AS employee_number,
  e.email AS employee_email
FROM orders o
INNER JOIN clients c ON o.client_id = c.id
INNER JOIN sites s ON o.site_id = s.id
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN employees e ON o.employee_id = e.id;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE clients IS 'Client organizations using the platform';
COMMENT ON TABLE sites IS 'Individual celebration sites (each client can have multiple)';
COMMENT ON TABLE catalogs IS 'Product catalogs (ERP-synced, manual, vendor, or dropship)';
COMMENT ON TABLE products IS 'Individual products/gifts available in catalogs';
COMMENT ON TABLE site_product_exclusions IS 'Products excluded from specific sites';
COMMENT ON TABLE employees IS 'Employee information for validation and tracking';
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON TABLE analytics_events IS 'User activity events for analytics';
COMMENT ON TABLE admin_users IS 'Admin user accounts for platform management';
COMMENT ON TABLE audit_logs IS 'Audit trail of all important actions';

-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your security requirements)
-- ============================================================================

-- Grant permissions to service role (used by Edge Functions)
-- Note: In production, use more restrictive permissions

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_versions (version, description) VALUES 
  (1, 'Initial schema creation - Phase 1 database optimization');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
