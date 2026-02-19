# Migration Test Guide

## Task 2.2: Test Migration Script on Development Database

**Spec:** `.kiro/specs/multi-language-content/`  
**Requirements:** 8.18  
**Date:** February 19, 2026

## Overview

This guide provides instructions for testing the content migration script that migrates existing site content to the new translations structure.

## Prerequisites

Before running the migration tests, ensure you have:

1. **Database Access**: Either via:
   - Supabase Dashboard SQL Editor
   - Direct PostgreSQL connection (psql)
   - Supabase CLI with linked project

2. **Backup**: Create a database backup before running the migration

3. **Migration Files**:
   - `20260219130000_migrate_content_to_translations.sql` - Main migration
   - `test_migration.sql` - Verification tests
   - `20260219130000_migrate_content_to_translations_rollback.sql` - Rollback script

## Test Execution Methods

### Method 1: Supabase Dashboard (Recommended)

This is the easiest method and doesn't require any local setup.

#### Step 1: Run the Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20260219130000_migrate_content_to_translations.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Wait for completion (should see "Success" message)

#### Step 2: Run the Verification Tests

1. In the SQL Editor, click **New Query**
2. Copy the contents of `supabase/migrations/test_migration.sql`
3. Paste into the SQL Editor
4. Click **Run** or press `Cmd/Ctrl + Enter`
5. Review the test output in the Results panel

#### Step 3: Review Results

The test output will show:

```
========================================
Starting Migration Verification Tests
========================================

Test 1: Total Sites
  Total sites in database: X

Test 2: Available Languages Configuration
  Sites with available_languages = ['en']: X
  ✓ PASS: All sites have available_languages configured

Test 3: Default Language Configuration
  Sites with defaultLanguage = 'en': X
  ✓ PASS: All sites have defaultLanguage configured

Test 4: Translations Populated
  Sites with translations: X
  ✓ PASS: All sites have translations populated

Test 5: Required Sections Present
  ✓ Site "Site Name" (id) has all 16 sections
  ...

Test 6: Sample Content Verification
  Site: "Site Name" (id)
    Header Logo Alt: ...
    Welcome Title: ...
    Landing Hero Title: ...
    Catalog Title: ...
    Footer Text: ...

Test 7: Original Settings Preservation
  Site "Site Name" (id)
    Original welcomeMessage exists: true/false
    Original catalogTitle exists: true/false

========================================
Migration Verification Summary
========================================
Total Sites: X
Sites with Languages: X
Sites with Default Language: X
Sites with Translations: X

✓ ALL TESTS PASSED - Migration successful!
========================================
```

### Method 2: PostgreSQL Command Line (psql)

If you have direct database access:

```bash
# Set your database connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres"

# Run the migration
psql $DATABASE_URL -f supabase/migrations/20260219130000_migrate_content_to_translations.sql

# Run the verification tests
psql $DATABASE_URL -f supabase/migrations/test_migration.sql
```

### Method 3: Supabase CLI (Local Development)

If you have Supabase CLI installed and Docker running:

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Run verification tests
supabase db execute --file supabase/migrations/test_migration.sql
```

## Verification Checklist

After running the tests, verify the following:

### ✓ Test 1: Available Languages Configuration
- [ ] All sites have `available_languages` column populated
- [ ] All sites have `available_languages = ['en']`
- [ ] No sites have NULL or empty `available_languages`

### ✓ Test 2: Default Language Configuration
- [ ] All sites have `defaultLanguage` in settings
- [ ] All sites have `defaultLanguage = 'en'`
- [ ] No sites have NULL or missing `defaultLanguage`

### ✓ Test 3: Translations Populated
- [ ] All sites have `translations` column populated
- [ ] All sites have non-empty `translations` JSONB object
- [ ] No sites have NULL or `{}` translations

### ✓ Test 4: Required Sections Present
- [ ] All sites have all 16 required sections:
  - header
  - welcomePage
  - landingPage
  - accessPage
  - catalogPage
  - productDetail
  - cartPage
  - checkoutPage
  - reviewOrder
  - confirmation
  - orderHistory
  - orderTracking
  - notFoundPage
  - privacyPolicy
  - expiredPage
  - footer

### ✓ Test 5: Sample Content Verification
- [ ] Sample sites show actual content (not empty strings)
- [ ] Content is in English (en)
- [ ] Content matches expected structure

### ✓ Test 6: Original Settings Preservation
- [ ] Original settings fields still exist
- [ ] No data was lost during migration
- [ ] Sites can still access old settings if needed

### ✓ Test 7: Backward Compatibility
- [ ] Existing functionality still works
- [ ] No breaking changes to API
- [ ] Old settings can coexist with new translations

## Expected Results

### Success Criteria

All tests should pass with the following results:

1. **100% of sites** have `available_languages = ['en']`
2. **100% of sites** have `defaultLanguage = 'en'`
3. **100% of sites** have translations populated
4. **100% of sites** have all 16 required sections
5. **Sample content** shows actual English text
6. **No data loss** - original settings preserved
7. **Backward compatible** - old and new structures coexist

### Failure Scenarios

If any test fails:

1. **Review the error messages** in the test output
2. **Check the migration script** for any issues
3. **Verify database schema** matches expectations
4. **Consider rollback** if critical issues found

## Rollback Procedure

If the migration fails or causes issues:

### Using Supabase Dashboard

1. Go to SQL Editor
2. Copy contents of `20260219130000_migrate_content_to_translations_rollback.sql`
3. Paste and run
4. Verify rollback completed successfully

### Using psql

```bash
psql $DATABASE_URL -f supabase/migrations/20260219130000_migrate_content_to_translations_rollback.sql
```

### Using Supabase CLI

```bash
supabase db execute --file supabase/migrations/20260219130000_migrate_content_to_translations_rollback.sql
```

## Manual Verification Queries

You can also run these queries manually to verify specific aspects:

### Check Available Languages

```sql
SELECT id, name, available_languages 
FROM sites 
LIMIT 10;
```

### Check Default Language

```sql
SELECT id, name, settings->>'defaultLanguage' as default_language 
FROM sites 
LIMIT 10;
```

### Check Translations Structure

```sql
SELECT id, name, 
  jsonb_object_keys(translations) as section 
FROM sites 
LIMIT 10;
```

### Check Specific Translation

```sql
SELECT id, name,
  translations->'welcomePage'->'title'->>'en' as welcome_title,
  translations->'catalogPage'->'title'->>'en' as catalog_title
FROM sites 
LIMIT 10;
```

### Count Sections Per Site

```sql
SELECT id, name,
  (SELECT COUNT(*) FROM jsonb_object_keys(translations)) as section_count
FROM sites;
```

## Troubleshooting

### Issue: No sites found

**Solution:** Ensure the database has existing sites before running migration

### Issue: Translations column doesn't exist

**Solution:** Run the schema migrations first:
- `20260219125504_add_available_languages_column.sql`
- `20260219125600_add_translations_column.sql`
- `20260219125700_add_draft_available_languages_column.sql`

### Issue: Some sections missing

**Solution:** Check if the migration script completed successfully. Review the migration logs for any errors.

### Issue: Original content lost

**Solution:** Restore from backup and review the migration script before re-running

## Documentation

After successful migration, document:

1. **Migration Date**: When the migration was run
2. **Sites Migrated**: Number of sites successfully migrated
3. **Issues Encountered**: Any problems and how they were resolved
4. **Verification Results**: Summary of test results
5. **Rollback Plan**: Backup location and rollback procedure

## Next Steps

After successful migration verification:

1. ✓ Mark task 2.2 as complete
2. → Proceed to task 3.1: Update Site type definition
3. → Continue with Phase 2: Core Components & Utilities

## Support

If you encounter issues:

1. Review the migration script logs
2. Check the test output for specific failures
3. Consult the requirements document (`.kiro/specs/multi-language-content/requirements.md`)
4. Review the design document (`.kiro/specs/multi-language-content/design.md`)

---

**Last Updated:** February 19, 2026  
**Task:** 2.2 Test migration script on development database  
**Status:** Ready for execution
