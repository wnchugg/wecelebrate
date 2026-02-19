-- Fix SECURITY DEFINER views ONLY
-- Run this if policies already exist

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

-- Verify views no longer have SECURITY DEFINER
-- Run after: SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname IN ('site_products_view', 'active_products_view');
