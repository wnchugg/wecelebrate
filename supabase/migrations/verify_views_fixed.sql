-- Verify that views no longer have SECURITY DEFINER
-- This query checks the view definitions

SELECT 
  viewname,
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER ❌'
    ELSE 'NO SECURITY DEFINER ✅'
  END as security_status
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('site_products_view', 'active_products_view');

-- Alternative check using pg_catalog
SELECT 
  c.relname as view_name,
  CASE 
    WHEN pg_get_viewdef(c.oid, true) LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER ❌'
    ELSE 'NO SECURITY DEFINER ✅'
  END as security_status,
  pg_get_viewdef(c.oid, true) as full_definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
  AND n.nspname = 'public'
  AND c.relname IN ('site_products_view', 'active_products_view');
