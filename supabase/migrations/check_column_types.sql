-- Check column types to debug the type mismatch error
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('admin_users', 'site_users', 'analytics_events')
  AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;
