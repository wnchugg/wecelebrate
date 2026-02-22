-- Final Security Verification
-- Run this to confirm all security issues are resolved

-- 1. Verify views don't have SECURITY DEFINER
SELECT 
  'VIEW CHECK' as check_type,
  viewname as object_name,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ FAIL'
    ELSE '✅ PASS'
  END as status
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('site_products_view', 'active_products_view');

-- 2. Verify RLS is enabled on all required tables
SELECT 
  'RLS ENABLED' as check_type,
  tablename as object_name,
  CASE 
    WHEN rowsecurity = true THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'catalogs', 'brands', 'employees', 'orders',
    'site_product_exclusions', 'site_catalog_assignments', 
    'site_price_overrides', 'site_category_exclusions',
    'site_gift_configs', 'email_templates', 'admin_users',
    'site_users', 'analytics_events', 'audit_logs', 'schema_versions'
  )
ORDER BY tablename;

-- 3. Verify RLS policies exist
SELECT 
  'RLS POLICIES' as check_type,
  tablename as object_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '⚠️ WARNING'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'catalogs', 'brands', 'employees', 'orders',
    'site_product_exclusions', 'site_catalog_assignments', 
    'site_price_overrides', 'site_category_exclusions',
    'site_gift_configs', 'email_templates', 'admin_users',
    'site_users', 'analytics_events', 'audit_logs', 'schema_versions'
  )
GROUP BY tablename
ORDER BY tablename;

-- 4. Summary
SELECT 
  'SUMMARY' as check_type,
  'Total Tables with RLS' as metric,
  COUNT(*) as value
FROM pg_tables 
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'clients', 'catalogs', 'brands', 'employees', 'orders',
    'site_product_exclusions', 'site_catalog_assignments', 
    'site_price_overrides', 'site_category_exclusions',
    'site_gift_configs', 'email_templates', 'admin_users',
    'site_users', 'analytics_events', 'audit_logs', 'schema_versions'
  )

UNION ALL

SELECT 
  'SUMMARY' as check_type,
  'Total RLS Policies' as metric,
  COUNT(*) as value
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'catalogs', 'brands', 'employees', 'orders',
    'site_product_exclusions', 'site_catalog_assignments', 
    'site_price_overrides', 'site_category_exclusions',
    'site_gift_configs', 'email_templates', 'admin_users',
    'site_users', 'analytics_events', 'audit_logs', 'schema_versions'
  )

UNION ALL

SELECT 
  'SUMMARY' as check_type,
  'Views without SECURITY DEFINER' as metric,
  COUNT(*) as value
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('site_products_view', 'active_products_view')
  AND definition NOT LIKE '%SECURITY DEFINER%';
