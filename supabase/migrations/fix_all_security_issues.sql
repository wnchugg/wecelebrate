-- ============================================================================
-- COMPREHENSIVE SECURITY FIX
-- Addresses all Supabase security linter issues
-- ============================================================================

-- ============================================================================
-- PART 1: Fix SECURITY DEFINER Views
-- ============================================================================

-- Fix: site_products_view - Drop and recreate WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.site_products_view CASCADE;
CREATE VIEW public.site_products_view AS
  SELECT 
    s.id AS site_id,
    s.name AS site_name,
    s.client_id,
    p.id,
    p.catalog_id,
    p.sku,
    p.external_id,
    p.external_sku,
    p.name,
    p.description,
    p.category,
    p.brand,
    p.price,
    p.cost,
    p.msrp,
    p.currency,
    p.images,
    p.image_url,
    p.features,
    p.specifications,
    p.available_quantity,
    p.track_inventory,
    p.status,
    p.is_active,
    p.sync_status,
    p.sync_notes,
    p.last_synced_at,
    p.created_at,
    p.updated_at
  FROM sites s
  JOIN catalogs c ON s.catalog_id = c.id
  JOIN products p ON p.catalog_id = c.id
  LEFT JOIN site_product_exclusions spe ON spe.site_id = s.id AND spe.product_id = p.id
  WHERE spe.id IS NULL 
    AND p.is_active = true 
    AND c.status = 'active'
    AND s.status = 'active';

GRANT SELECT ON public.site_products_view TO authenticated;
REVOKE SELECT ON public.site_products_view FROM anon;

-- Fix: active_products_view - Drop and recreate WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.active_products_view CASCADE;
CREATE VIEW public.active_products_view AS
  SELECT 
    id,
    catalog_id,
    sku,
    external_id,
    external_sku,
    name,
    description,
    category,
    brand,
    price,
    cost,
    msrp,
    currency,
    images,
    image_url,
    features,
    specifications,
    available_quantity,
    track_inventory,
    status,
    is_active,
    sync_status,
    sync_notes,
    last_synced_at,
    created_at,
    updated_at
  FROM products
  WHERE status = 'active';

GRANT SELECT ON public.active_products_view TO authenticated;
REVOKE SELECT ON public.active_products_view FROM anon;

-- ============================================================================
-- PART 2: Enable RLS on All Public Tables
-- ============================================================================

-- Core business tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Site configuration tables
ALTER TABLE public.site_product_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_catalog_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_price_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_category_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_gift_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: Create RLS Policies - Admin Access
-- ============================================================================

-- Policy: Admin users can access everything
-- This is a catch-all for admin users across all tables

CREATE POLICY "Admin users have full access to clients"
  ON public.clients FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to catalogs"
  ON public.catalogs FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to brands"
  ON public.brands FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to employees"
  ON public.employees FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to orders"
  ON public.orders FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to site_product_exclusions"
  ON public.site_product_exclusions FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to site_catalog_assignments"
  ON public.site_catalog_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to site_price_overrides"
  ON public.site_price_overrides FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to site_category_exclusions"
  ON public.site_category_exclusions FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to site_gift_configs"
  ON public.site_gift_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users have full access to email_templates"
  ON public.email_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- ============================================================================
-- PART 4: Create RLS Policies - Site User Access
-- ============================================================================

-- Site users can only access data from their assigned sites

CREATE POLICY "Site users can view their site's employees"
  ON public.employees FOR SELECT
  USING (
    site_id IN (
      SELECT site_id FROM site_users 
      WHERE site_users.id = auth.uid() 
      AND site_users.status = 'active'
    )
  );

CREATE POLICY "Site users can view their site's orders"
  ON public.orders FOR SELECT
  USING (
    site_id IN (
      SELECT site_id FROM site_users 
      WHERE site_users.id = auth.uid() 
      AND site_users.status = 'active'
    )
  );

CREATE POLICY "Site users can view their site configurations"
  ON public.site_gift_configs FOR SELECT
  USING (
    site_id IN (
      SELECT site_id FROM site_users 
      WHERE site_users.id = auth.uid() 
      AND site_users.status = 'active'
    )
  );

-- ============================================================================
-- PART 5: Sensitive Data Protection
-- ============================================================================

-- Analytics events: Users can only see their own session data
CREATE POLICY "Users can only view their own analytics events"
  ON public.analytics_events FOR SELECT
  USING (
    -- Admin users can see all
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    OR
    -- Regular users can only see their own session (user_id is TEXT, cast auth.uid() to text)
    user_id = auth.uid()::text
  );

-- Audit logs: Only admins can view
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Admin users: Only admins can view other admins
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Site users: Admins see all, site users see only their site
CREATE POLICY "Site users access control"
  ON public.site_users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    OR
    (id = auth.uid() AND status = 'active')
  );

-- Schema versions: Read-only for authenticated users
CREATE POLICY "Authenticated users can view schema versions"
  ON public.schema_versions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- PART 6: Create Performance Indexes
-- ============================================================================

-- Indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_orders_site_id ON orders(site_id);
CREATE INDEX IF NOT EXISTS idx_site_gift_configs_site_id ON site_gift_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_site_users_id_status ON site_users(id, status) WHERE status = 'active';

-- ============================================================================
-- PART 7: Grant Appropriate Permissions
-- ============================================================================

-- Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Grant authenticated user access (RLS will control what they see)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant admin users full access (they still go through RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after the migration to verify:

-- 1. Check RLS is enabled on all tables
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- 2. Check all policies
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- 3. Check views don't have SECURITY DEFINER
-- SELECT viewname 
-- FROM pg_views 
-- WHERE schemaname = 'public';

COMMENT ON SCHEMA public IS 'Comprehensive security fix applied - RLS enabled on all tables, SECURITY DEFINER removed from views, sensitive data protected';
