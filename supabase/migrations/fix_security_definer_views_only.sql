-- Fix SECURITY DEFINER views
-- This must be run separately to ensure views are properly recreated

-- Drop both views completely
DROP VIEW IF EXISTS public.site_products_view CASCADE;
DROP VIEW IF EXISTS public.active_products_view CASCADE;

-- Recreate site_products_view WITHOUT SECURITY DEFINER
-- Note: You need to replace this SELECT with your actual view definition
-- Run this first to get the definition: SELECT pg_get_viewdef('public.site_products_view', true);
CREATE VIEW public.site_products_view AS
  SELECT 
    s.id AS site_id,
    s.name AS site_name,
    p.id AS product_id,
    p.name AS product_name,
    p.description,
    p.price,
    p.image_url,
    p.category,
    p.brand_id,
    p.catalog_id,
    p.status
  FROM sites s
  JOIN products p ON p.catalog_id IN (
    SELECT catalog_id 
    FROM site_catalog_assignments 
    WHERE site_id = s.id
  )
  WHERE p.status = 'active';

-- Recreate active_products_view WITHOUT SECURITY DEFINER
CREATE VIEW public.active_products_view AS
  SELECT *
  FROM products
  WHERE status = 'active';

-- Grant appropriate permissions
GRANT SELECT ON public.site_products_view TO authenticated;
GRANT SELECT ON public.active_products_view TO authenticated;

-- Revoke from anonymous users
REVOKE SELECT ON public.site_products_view FROM anon;
REVOKE SELECT ON public.active_products_view FROM anon;

-- Verify the views no longer have SECURITY DEFINER
-- Run this after: SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' AND viewname IN ('site_products_view', 'active_products_view');
