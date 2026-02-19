# Task 1.3 Complete: Add draft_available_languages column to sites table

## Summary

Successfully created the database migration file to add the `draft_available_languages` column to the `sites` table.

## What Was Done

### 1. Created Migration File
**File:** `supabase/migrations/20260219125700_add_draft_available_languages_column.sql`

The migration includes:
- `ALTER TABLE` statement to add `draft_available_languages` TEXT[] column
- Default value set to `NULL` (no draft changes by default)
- Column comment documenting the purpose and usage in draft/publish workflow

### 2. Migration Details

```sql
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_available_languages TEXT[] DEFAULT NULL;
```

## How to Apply the Migration

You have several options to apply this migration:

### Option 1: Supabase Dashboard (Recommended)
1. Go to the Supabase Dashboard: https://app.supabase.com/project/wjfcqqrlhwdvvjmefxky
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20260219125700_add_draft_available_languages_column.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI (if linked to project)
```bash
supabase db push
```

### Option 3: Direct SQL Execution (if you have database credentials)
```bash
psql $DATABASE_URL -f supabase/migrations/20260219125700_add_draft_available_languages_column.sql
```

## Verification

After running the migration, you can verify it was successful by running:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'sites' AND column_name = 'draft_available_languages';
```

Expected results:
- Column `draft_available_languages` should exist with type `ARRAY` (text[]) and default `NULL`

## Requirements Satisfied

- ✅ **Requirement 9.2**: THE System SHALL store draft Available_Languages in draft_available_languages column

## Design Integration

This column integrates with the draft/publish workflow:
- **NULL value**: No draft language configuration changes (using published `available_languages`)
- **Non-NULL value**: Draft language configuration exists (preview mode)
- **On publish**: Copy `draft_available_languages` to `available_languages`
- **On discard**: Set `draft_available_languages` back to `NULL`

## Next Steps

After applying this migration, you can proceed with:
- Task 1.4: Create database indexes (GIN index on available_languages already exists from Task 1.1)
- Task 2.1: Create migration script for existing content
- Task 3.1: Update Site type definition in api.types.ts

## Notes

- The migration uses `IF NOT EXISTS` to make it idempotent (safe to run multiple times)
- Default value is `NULL` to indicate no draft changes exist
- This follows the same pattern as `draft_settings` column for the draft/publish workflow
- No index is created for this column as it's only used during draft editing (not for queries)

