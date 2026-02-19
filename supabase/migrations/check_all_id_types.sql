-- Check ALL id column types for tables in our migration
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'clients', 'catalogs', 'brands', 'employees', 'orders',
    'site_product_exclusions', 'site_catalog_assignments', 
    'site_price_overrides', 'site_category_exclusions',
    'site_gift_configs', 'email_templates', 'admin_users',
    'site_users', 'analytics_events', 'audit_logs', 'schema_versions'
  )
  AND column_name IN ('id', 'user_id', 'site_id')
ORDER BY table_name, column_name;
