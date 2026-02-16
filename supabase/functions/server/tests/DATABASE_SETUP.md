# Database Setup for Tests

## Quick Start

### 1. Add Service Role Key to .env

The database seed script requires the Supabase service role key. Add it to your `.env` file:

```bash
cd supabase/functions/server/tests

# Get the service role key from Supabase dashboard:
# https://app.supabase.com/project/wjfcqqrlhwdvvjmefxky/settings/api

# Add it to .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env
```

### 2. Seed the Database

```bash
./seed-database.sh
```

This will create test data in the PostgreSQL database:
- 1 test client
- 1 test site  
- 1 test catalog
- 5 test employees
- 5 test products
- 5 test orders

### 3. Run Tests

```bash
cd ../
export DENO_TLS_CA_STORE=system
deno test --allow-net --allow-env --allow-read tests/dashboard_api.test.ts
```

## Getting the Service Role Key

1. Go to the Supabase dashboard: https://app.supabase.com/project/wjfcqqrlhwdvvjmefxky/settings/api
2. Scroll to "Project API keys"
3. Find the "service_role" key (it's a long JWT token starting with `eyJ...`)
4. Copy the entire key
5. Add it to `supabase/functions/server/tests/.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Why is this needed?

The backend is being migrated from KV store to PostgreSQL database. The new database seed script needs direct database access via the service role key to create test data.

The service role key:
- Has full database access (bypasses Row Level Security)
- Is automatically available to deployed Edge Functions
- Must be manually provided for local scripts
- Should be kept secret (don't commit to git)

## Files

- `.env.template` - Template showing required environment variables
- `.env` - Your local environment variables (gitignored)
- `seed-database.sh` - Script to seed PostgreSQL database
- `seed-test-data-kv.sh` - Legacy script for KV store (still works)

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"

Add the key to your `.env` file as described above.

### "Cannot connect to database"

Check that:
1. SUPABASE_URL is correct (https://wjfcqqrlhwdvvjmefxky.supabase.co)
2. SUPABASE_SERVICE_ROLE_KEY is the full JWT token
3. You have internet connection

### "Permission denied"

Make sure the script is executable:
```bash
chmod +x seed-database.sh
```

## Migration Status

### ✅ Using Database
- Dashboard endpoints (stats, recent orders, popular gifts)
- Database seed script

### ⏳ Still Using KV Store
- Client CRUD
- Site CRUD
- Product CRUD
- Employee CRUD
- Order CRUD
- HRIS integration
- Scheduled triggers

The migration is ongoing. Eventually all operations will use the database.
