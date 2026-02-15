-- ============================================================================
-- Test Helper Functions
-- Phase 1: Database Optimization - Day 4
-- 
-- These functions help test data integrity and foreign key relationships
-- ============================================================================

-- Function to check for orphaned sites (sites without valid client)
CREATE OR REPLACE FUNCTION check_orphaned_sites()
RETURNS TABLE (count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM sites s
  LEFT JOIN clients c ON s.client_id = c.id
  WHERE c.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check for orphaned products (products without valid catalog)
CREATE OR REPLACE FUNCTION check_orphaned_products()
RETURNS TABLE (count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM products p
  LEFT JOIN catalogs c ON p.catalog_id = c.id
  WHERE c.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check for orphaned orders (orders without valid site/client)
CREATE OR REPLACE FUNCTION check_orphaned_orders()
RETURNS TABLE (count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM orders o
  LEFT JOIN sites s ON o.site_id = s.id
  LEFT JOIN clients c ON o.client_id = c.id
  WHERE s.id IS NULL OR c.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check for orphaned employees (employees without valid site)
CREATE OR REPLACE FUNCTION check_orphaned_employees()
RETURNS TABLE (count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM employees e
  LEFT JOIN sites s ON e.site_id = s.id
  WHERE s.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get migration statistics
CREATE OR REPLACE FUNCTION get_migration_stats()
RETURNS TABLE (
  table_name TEXT,
  record_count BIGINT,
  avg_row_size_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'clients'::TEXT, COUNT(*)::BIGINT, pg_column_size(clients.*)::BIGINT FROM clients
  UNION ALL
  SELECT 'sites'::TEXT, COUNT(*)::BIGINT, pg_column_size(sites.*)::BIGINT FROM sites
  UNION ALL
  SELECT 'catalogs'::TEXT, COUNT(*)::BIGINT, pg_column_size(catalogs.*)::BIGINT FROM catalogs
  UNION ALL
  SELECT 'products'::TEXT, COUNT(*)::BIGINT, pg_column_size(products.*)::BIGINT FROM products
  UNION ALL
  SELECT 'employees'::TEXT, COUNT(*)::BIGINT, pg_column_size(employees.*)::BIGINT FROM employees
  UNION ALL
  SELECT 'orders'::TEXT, COUNT(*)::BIGINT, pg_column_size(orders.*)::BIGINT FROM orders;
END;
$$ LANGUAGE plpgsql;

-- Function to check index usage
CREATE OR REPLACE FUNCTION check_index_usage()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  index_scans BIGINT,
  tuples_read BIGINT,
  tuples_fetched BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename AS table_name,
    indexname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('clients', 'sites', 'catalogs', 'products', 'employees', 'orders')
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_table_stats()
RETURNS TABLE (
  table_name TEXT,
  total_rows BIGINT,
  live_rows BIGINT,
  dead_rows BIGINT,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  last_analyze TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || relname AS table_name,
    n_tup_ins + n_tup_upd AS total_rows,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND relname IN ('clients', 'sites', 'catalogs', 'products', 'employees', 'orders')
  ORDER BY n_live_tup DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_orphaned_sites() TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_products() TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_orders() TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_employees() TO service_role;
GRANT EXECUTE ON FUNCTION get_migration_stats() TO service_role;
GRANT EXECUTE ON FUNCTION check_index_usage() TO service_role;
GRANT EXECUTE ON FUNCTION analyze_table_stats() TO service_role;

-- Comments
COMMENT ON FUNCTION check_orphaned_sites() IS 'Check for sites without valid client references';
COMMENT ON FUNCTION check_orphaned_products() IS 'Check for products without valid catalog references';
COMMENT ON FUNCTION check_orphaned_orders() IS 'Check for orders without valid site/client references';
COMMENT ON FUNCTION check_orphaned_employees() IS 'Check for employees without valid site references';
COMMENT ON FUNCTION get_migration_stats() IS 'Get statistics about migrated tables';
COMMENT ON FUNCTION check_index_usage() IS 'Check how indexes are being used';
COMMENT ON FUNCTION analyze_table_stats() IS 'Analyze table statistics for performance tuning';
