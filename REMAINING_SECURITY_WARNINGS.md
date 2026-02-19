# Remaining Security Warnings - Fix Guide

## Summary

After fixing the critical SECURITY DEFINER view errors, you have 13 remaining **WARN** level security issues:
- 11 functions with mutable search_path
- 1 extension in public schema
- 1 auth configuration issue

All of these are fixable with the migrations and configuration changes provided.

---

## 1. Function Search Path Warnings (11 functions)

### Issue
Functions without a fixed `search_path` are vulnerable to schema injection attacks. An attacker could create a malicious schema and trick the function into using it.

### Severity
⚠️ WARN (Medium Risk)

### Fix
Run the migration: `fix_function_search_paths.sql`

This migration adds `SET search_path = public, pg_temp` to all affected functions:
- `update_updated_at_column`
- `update_site_catalog_assignments_updated_at`
- `update_site_price_overrides_updated_at`
- `cleanup_expired_proxy_sessions`
- `admin_user_has_permission`
- `grant_admin_permission`
- `revoke_admin_permission`
- `get_admin_user_permissions`
- `cleanup_expired_admin_permissions`
- `check_password_expiration`
- `cleanup_expired_passwords`

### How to Apply
```sql
-- In Supabase SQL Editor
\i supabase/migrations/fix_function_search_paths.sql
```

### Verification
After running, check the linter again. All 11 function warnings should be resolved.

---

## 2. Extension in Public Schema (pg_trgm)

### Issue
The `pg_trgm` extension is installed in the `public` schema. Best practice is to keep extensions in a separate schema to avoid naming conflicts and improve security.

### Severity
⚠️ WARN (Low Risk)

### Fix
Run the migration: `fix_extension_schema.sql`

This migration:
1. Creates an `extensions` schema
2. Moves `pg_trgm` to the `extensions` schema
3. Grants necessary permissions

### How to Apply
```sql
-- In Supabase SQL Editor
\i supabase/migrations/fix_extension_schema.sql
```

### Note
This requires elevated privileges. If the migration fails with a permission error, you can run this manually in the Supabase SQL Editor:

```sql
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;
```

### Verification
After running, the extension should be in the `extensions` schema:
```sql
SELECT extname, nspname 
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'pg_trgm';
```

---

## 3. Leaked Password Protection Disabled

### Issue
Supabase Auth can check passwords against the HaveIBeenPwned database to prevent users from using compromised passwords. This feature is currently disabled.

### Severity
⚠️ WARN (Medium Risk)

### Fix
This must be enabled in the Supabase Dashboard (cannot be done via SQL).

### How to Enable

**Option 1: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click "Authentication" → "Policies" or "Settings"
3. Find "Leaked Password Protection" or "Password Security"
4. Toggle to **ON**
5. Save changes

**Option 2: Management API**
```bash
curl -X PATCH https://api.supabase.com/v1/projects/YOUR_PROJECT_ID/config/auth \
  -H "Authorization: Bearer YOUR_MANAGEMENT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"SECURITY_PASSWORD_HIBP_ENABLED": true}'
```

### What This Does
- Checks new passwords against HaveIBeenPwned database
- Rejects passwords found in data breaches
- Uses k-anonymity (privacy-preserving)
- No impact on existing users
- Only affects new signups and password changes

### Documentation
See `ENABLE_LEAKED_PASSWORD_PROTECTION.md` for detailed instructions.

---

## Priority & Impact

| Issue | Count | Severity | Impact | Effort |
|-------|-------|----------|--------|--------|
| Function search_path | 11 | Medium | Medium | Low (1 migration) |
| Extension in public | 1 | Low | Low | Low (1 migration) |
| Leaked password protection | 1 | Medium | Medium | Very Low (dashboard toggle) |

---

## Recommended Action Plan

### Step 1: Fix Function Search Paths (5 minutes)
```sql
\i supabase/migrations/fix_function_search_paths.sql
```
**Impact**: Prevents schema injection attacks on 11 functions

### Step 2: Move Extension (2 minutes)
```sql
\i supabase/migrations/fix_extension_schema.sql
```
**Impact**: Better schema organization, reduced naming conflict risk

### Step 3: Enable Leaked Password Protection (1 minute)
- Go to Supabase Dashboard
- Enable in Authentication settings
**Impact**: Prevents users from using compromised passwords

### Total Time: ~10 minutes
### Result: All security warnings resolved ✅

---

## Verification

After applying all fixes, run the Supabase Database Linter again:

1. Go to Supabase Dashboard
2. Navigate to Database → Database Linter
3. Click "Refresh" or "Re-run Linter"

Expected result:
- ✅ 0 ERROR level issues
- ✅ 0 WARN level issues
- ✅ Clean security audit

---

## Files Created

1. `supabase/migrations/fix_function_search_paths.sql` - Fixes 11 function warnings
2. `supabase/migrations/fix_extension_schema.sql` - Moves pg_trgm extension
3. `ENABLE_LEAKED_PASSWORD_PROTECTION.md` - Guide for enabling HIBP
4. `REMAINING_SECURITY_WARNINGS.md` - This file

---

## Summary

All remaining security warnings are fixable:
- ✅ 2 SQL migrations (automated)
- ✅ 1 dashboard setting (manual, 1 minute)
- ✅ Total effort: ~10 minutes
- ✅ Result: Complete security compliance

Your security implementation is nearly complete! 🎉
