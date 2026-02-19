# Content to Translations Migration

## Overview

This migration script moves existing site content from various `settings` fields into the new `translations` JSONB structure to support multi-language content management.

**Spec:** `.kiro/specs/multi-language-content/`  
**Task:** 2.1 Create migration script for all 16 priority sections  
**Requirements:** 8.1-8.18

## What This Migration Does

### 1. Database Changes
- Sets `available_languages` to `['en']` for all existing sites
- Sets `defaultLanguage` to `'en'` in the `settings` JSONB field
- Populates the `translations` JSONB column with English content

### 2. Content Migration

The migration extracts content from existing fields and organizes it into 16 priority sections:

#### Global Sections (2)
1. **Header** - Logo alt text, navigation links, CTA button
2. **Footer** - Footer text, privacy/terms/contact links

#### Page Sections (14)
3. **Welcome Page** - Title, message, button text
4. **Landing Page** - Hero title, subtitle, CTA
5. **Access Validation Page** - Title, description, button, messages
6. **Catalog Page** - Title, description, empty message, filters
7. **Product Detail Page** - Back button, add to cart, buy now, labels
8. **Cart Page** - Title, empty message, buttons, labels
9. **Checkout Page** - Title, section headings, button text
10. **Review Order Page** - Title, instructions, buttons, labels
11. **Confirmation Page** - Title, message, labels
12. **Order History Page** - Title, empty message, status labels
13. **Order Tracking Page** - Title, status labels, messages
14. **Not Found Page** - Title, message, suggestions
15. **Privacy Policy Page** - Section headings, content
16. **Selection Period Expired Page** - Title, message

### 3. Translation Structure

Content is stored in a nested JSONB structure:

```json
{
  "header": {
    "logoAlt": { "en": "Company Logo" },
    "homeLink": { "en": "Home" },
    "ctaButton": { "en": "Get Started" }
  },
  "welcomePage": {
    "title": { "en": "Welcome" },
    "message": { "en": "Welcome message text..." },
    "buttonText": { "en": "Continue" }
  },
  "catalogPage": {
    "title": { "en": "Products" },
    "description": { "en": "Browse our collection..." }
  }
  // ... more sections
}
```

## Migration Files

### Main Migration
- **File:** `20260219130000_migrate_content_to_translations.sql`
- **Purpose:** Migrates all existing content to the translations structure
- **Safe to run:** Yes, preserves original settings fields

### Test Script
- **File:** `test_migration.sql`
- **Purpose:** Verifies the migration completed successfully
- **Tests:**
  1. All sites have `available_languages = ['en']`
  2. All sites have `defaultLanguage = 'en'`
  3. All sites have translations populated
  4. All 16 required sections are present
  5. Sample content verification
  6. Original settings preservation check

### Rollback Script
- **File:** `20260219130000_migrate_content_to_translations_rollback.sql`
- **Purpose:** Reverts the migration if needed
- **Warning:** Clears all translations data

## Running the Migration

### Step 1: Backup Database
```bash
# Create a backup before running migration
pg_dump -h your-db-host -U your-user -d your-database > backup_before_migration.sql
```

### Step 2: Run Migration
```bash
# Apply the migration
psql -h your-db-host -U your-user -d your-database -f 20260219130000_migrate_content_to_translations.sql
```

### Step 3: Verify Migration
```bash
# Run the test script
psql -h your-db-host -U your-user -d your-database -f test_migration.sql
```

Expected output:
```
✓ PASS: All sites have available_languages configured
✓ PASS: All sites have defaultLanguage configured
✓ PASS: All sites have translations populated
✓ ALL TESTS PASSED - Migration successful!
```

### Step 4: Rollback (if needed)
```bash
# Only if you need to revert
psql -h your-db-host -U your-user -d your-database -f 20260219130000_migrate_content_to_translations_rollback.sql
```

## Content Mapping

### From Settings to Translations

| Original Field | New Location | Default Value |
|---------------|--------------|---------------|
| `settings.welcomeMessage` | `translations.welcomePage.message.en` | - |
| `settings.welcomeTitle` | `translations.welcomePage.title.en` | "Welcome" |
| `settings.catalogTitle` | `translations.catalogPage.title.en` | "Products" |
| `settings.catalogDescription` | `translations.catalogPage.description.en` | - |
| `settings.footerText` | `translations.footer.text.en` | "© 2026 All rights reserved" |
| `settings.landingPage.sections[0].content.title` | `translations.landingPage.heroTitle.en` | - |
| `settings.landingPage.sections[0].content.subtitle` | `translations.landingPage.heroSubtitle.en` | - |
| `settings.landingPage.sections[0].content.ctaText` | `translations.landingPage.heroCTA.en` | "Get Started" |

### Default Values

For fields that don't exist in the original settings, the migration provides sensible English defaults:

- Navigation links: "Home", "Products", "About", "Contact"
- Buttons: "Get Started", "Continue", "Verify", etc.
- Labels: "Subtotal", "Shipping", "Tax", "Total", etc.
- Messages: "Your cart is empty", "No products available", etc.

## Data Preservation

**Important:** The migration does NOT delete original settings fields. This ensures:
- Backward compatibility during transition
- Ability to verify migration accuracy
- Safe rollback if needed

Original fields remain in `settings` and can be removed in a future cleanup migration once the new translation system is fully deployed and tested.

## Verification Checklist

After running the migration, verify:

- [ ] All sites have `available_languages = ['en']`
- [ ] All sites have `settings.defaultLanguage = 'en'`
- [ ] All sites have non-empty `translations` field
- [ ] All 16 sections are present in translations
- [ ] Sample content matches original values
- [ ] Original settings fields still exist (for rollback)
- [ ] No errors in migration logs
- [ ] Test script passes all checks

## Troubleshooting

### Issue: Some sites missing translations
**Solution:** Check if the site had any content in settings fields. Sites with no original content will have default English values.

### Issue: Content doesn't match original
**Solution:** Review the content mapping table above. Some fields may have been renamed or restructured.

### Issue: Migration fails partway through
**Solution:** 
1. Check the error message in logs
2. Run the rollback script
3. Fix the issue
4. Re-run the migration

### Issue: Need to add custom content
**Solution:** After migration, you can manually update translations:
```sql
UPDATE sites
SET translations = jsonb_set(
  translations,
  '{customSection,customField,en}',
  '"Custom content"'
)
WHERE id = 'your-site-id';
```

## Next Steps

After successful migration:

1. **Deploy Frontend Changes** - Update components to use `useSiteContent` hook
2. **Test Language Switching** - Verify fallback chain works correctly
3. **Add More Languages** - Site admins can now add translations for other languages
4. **Monitor Performance** - Check query performance with GIN indexes
5. **Plan Cleanup** - Schedule removal of old settings fields after full deployment

## Support

For issues or questions:
- Review the spec: `.kiro/specs/multi-language-content/`
- Check the design doc: `.kiro/specs/multi-language-content/design.md`
- Review requirements: `.kiro/specs/multi-language-content/requirements.md`

## Migration History

- **2026-02-19:** Initial migration created
- **Task:** 2.1 Create migration script for all 16 priority sections
- **Requirements:** 8.1-8.18 (Migration of Existing Content)
