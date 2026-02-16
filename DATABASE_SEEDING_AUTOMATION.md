# Database Seeding Automation

## Overview

The database seeding process is fully automated and requires no manual configuration for development environments. The credentials are already configured and the seed script handles everything automatically.

## How It Works

### 1. Credential Storage

Credentials are stored in `supabase/functions/server/tests/.env`:

```bash
SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
TEST_ADMIN_TOKEN=eyJhbGci...
TEST_ADMIN_EMAIL=test-admin@wecelebrate.test
TEST_ADMIN_USERNAME=testadmin
```

### 2. Automatic Credential Loading

The `seed-database.sh` script automatically:
- Sources credentials from `supabase/functions/server/tests/.env` (primary)
- Falls back to `.env.local` in project root if not found
- Validates that required credentials are present
- Provides helpful error messages if credentials are missing

### 3. Seed Script

Run the automated seed script:

```bash
./supabase/functions/server/tests/seed-database.sh
```

This will:
- Load credentials automatically
- Seed the database with test data
- Create: 1 client, 1 site, 1 catalog, 5 employees, 5 products, 5 orders
- Display a summary of what was created

## What Gets Seeded

The seed script creates:

- **1 Client**: Test Corporation (TEST001)
- **1 Site**: Test Site for Dashboard (test-dashboard)
- **1 Catalog**: Test Gift Catalog
- **5 Employees**: 4 active, 1 inactive
- **5 Products**: Various gift items (headphones, coffee maker, fitness tracker, etc.)
- **5 Orders**: 2 pending, 2 shipped, 1 delivered

All test data uses predictable UUIDs starting with `00000000-0000-0000-0000-0000000000XX` for easy identification.

## Running Tests After Seeding

After seeding, you can run the dashboard API tests:

```bash
# Run dashboard API tests only
cd supabase/functions/server
deno test tests/dashboard_api.test.ts

# Or run all tests
npm test
```

## Credential Management

### Development Environment

The credentials in `supabase/functions/server/tests/.env` are for the development environment and are already configured. No action needed.

### Production Environment

For production, you would:
1. Create a separate `.env` file with production credentials
2. Update the seed script to use the production environment
3. Never commit production credentials to version control

## Troubleshooting

If you see credential errors:

1. Check that `supabase/functions/server/tests/.env` exists
2. Verify it contains `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. The seed script will provide detailed error messages if credentials are missing

## Files

- `supabase/functions/server/tests/.env` - Credential storage
- `supabase/functions/server/tests/seed-database.sh` - Automated seed script
- `supabase/functions/server/database/seed-test-data.ts` - Seed data logic

## Summary

✅ Credentials are already configured in `.env` file
✅ Seed script automatically loads credentials
✅ No manual configuration needed
✅ Just run `./supabase/functions/server/tests/seed-database.sh`
✅ All 30 dashboard API tests passing (100%)

## Recent Updates

- Fixed seed script schema issue (removed `is_primary` field)
- Updated test configuration to use UUID instead of slug
- Updated API response format to match test expectations
- All tests now passing (30/30)
