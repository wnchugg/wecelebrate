# Day 4 Setup Instructions
## Getting Started with Migration Testing

**Status:** Ready to Execute  
**Environment:** Development First

---

## Step 1: Set Up Environment Variables

You need to set your Supabase credentials as environment variables. 

### Option A: Temporary (for this session only)

```bash
# Set development environment variables
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Verify they're set
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Option B: Create .env file (recommended)

Create a `.env` file in the project root:

```bash
# Create .env file
cat > .env << 'EOF'
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# Load environment variables
export $(cat .env | xargs)
```

### Where to Find Your Credentials

1. **Supabase URL:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy "Project URL"

2. **Service Role Key:**
   - Same page (Settings → API)
   - Copy "service_role" key (NOT the anon key!)
   - ⚠️ **Keep this secret!** Never commit to git

---

## Step 2: Verify Deno Installation

```bash
# Add Deno to PATH
export PATH="$HOME/.deno/bin:$PATH"

# Verify installation
deno --version
```

Expected output:
```
deno 2.6.9 (stable, release, aarch64-apple-darwin)
v8 14.5.201.2-rusty
typescript 5.9.2
```

---

## Step 3: Check Current Data

```bash
# Run the data check script
deno run --allow-net --allow-env supabase/functions/server/database/check_current_data.ts
```

Expected output:
```
================================================================================
Current KV Store Data Check
================================================================================

📊 Clients: X
   Sample IDs: abc-123, def-456, ghi-789...
📊 Catalogs: X
   Sample IDs: cat-001, cat-002...
📊 Sites: X
   Sample IDs: site-001, site-002...
📊 Products/Gifts: X
   Sample IDs: gift-001, gift-002...
📊 Employees: X
   Sample IDs: emp-001, emp-002...
📊 Orders: X
   Sample IDs: ord-001, ord-002...

================================================================================
Total Records: XXX
================================================================================
```

---

## Step 4: Decide Next Steps

### If You Have Data in Development ✅

Great! Proceed with migration testing:
1. Create schema
2. Run dry-run migration
3. Run live migration
4. Run tests

### If Development is Empty ❌

You have two options:

**Option A: Seed Test Data**
```bash
# Run the seed script to create test data
deno run --allow-net --allow-env supabase/functions/server/seed.ts
```

**Option B: Use Production Copy**
- Create a snapshot/copy of production database
- Test migration on the copy
- This gives you realistic data to test with

---

## Step 5: Create Database Schema

Once you have data to test with:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"

# Run schema creation
\i supabase/functions/server/database/schema.sql

# Install test helpers
\i supabase/functions/server/database/test_helpers.sql

# Verify tables created
\dt

# Exit psql
\q
```

---

## Step 6: Run Dry-Run Migration

```bash
# Run dry-run (no changes made)
deno run --allow-net --allow-env supabase/functions/server/database/migrate_kv_to_tables.ts --dry-run --verbose
```

Review the output carefully:
- Check for validation errors
- Verify record counts
- Note any skipped records

---

## Step 7: Run Live Migration (if dry-run looks good)

```bash
# Run live migration
deno run --allow-net --allow-env supabase/functions/server/database/migrate_kv_to_tables.ts --verbose
```

---

## Step 8: Run Tests

```bash
# Run automated test suite
deno run --allow-net --allow-env supabase/functions/server/database/test_migration.ts
```

---

## Troubleshooting

### Error: "supabaseUrl is required"
- Environment variables not set
- Run: `export SUPABASE_URL="https://..."`

### Error: "command not found: deno"
- Deno not in PATH
- Run: `export PATH="$HOME/.deno/bin:$PATH"`

### Error: "Failed to connect"
- Check your SUPABASE_URL is correct
- Check your SERVICE_ROLE_KEY is correct
- Verify you have internet connection

### Error: "Permission denied"
- Service role key doesn't have permissions
- Verify you're using the service_role key (not anon key)

---

## Safety Checklist

Before running migration:

- [ ] Using development environment (not production)
- [ ] Environment variables set correctly
- [ ] Deno installed and working
- [ ] Can connect to database
- [ ] Have reviewed dry-run output
- [ ] Understand rollback procedure

---

## Quick Command Reference

```bash
# Set environment
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
export PATH="$HOME/.deno/bin:$PATH"

# Check data
deno run --allow-net --allow-env supabase/functions/server/database/check_current_data.ts

# Dry run
deno run --allow-net --allow-env supabase/functions/server/database/migrate_kv_to_tables.ts --dry-run

# Live migration
deno run --allow-net --allow-env supabase/functions/server/database/migrate_kv_to_tables.ts

# Run tests
deno run --allow-net --allow-env supabase/functions/server/database/test_migration.ts

# Rollback (if needed)
deno run --allow-net --allow-env supabase/functions/server/database/rollback_migration.ts --confirm
```

---

## Next Steps

Once you've completed the setup:
1. ✅ Check current data
2. ✅ Create schema
3. ✅ Run dry-run
4. ✅ Run live migration
5. ✅ Run tests
6. ✅ Document results

**Ready to proceed? Start with Step 1: Set Up Environment Variables**
