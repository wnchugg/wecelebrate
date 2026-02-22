# Integration Testing Guide

This guide shows you how to connect the database optimizer tests to your development Supabase database.

## Quick Start

### Step 1: Get Your Database Connection String

1. Go to your Supabase project: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Click on **Project Settings** (gear icon in sidebar)
3. Navigate to **Database** section
4. Scroll to **Connection string**
5. Select **Direct connection** (not Connection pooling)
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Add to Your .env File

Open your `.env` file (create it from `.env.example` if it doesn't exist) and add:

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres
```

**Important:** 
- Replace `YOUR_ACTUAL_PASSWORD` with your real password
- Don't commit this file to git (it's already in `.gitignore`)

### Step 3: Run Integration Tests

```bash
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
```

## What the Integration Tests Do

The integration tests will:

1. **Connect to your database** - Verifies the connection works
2. **Query pg_policies** - Lists all RLS policies in your public schema
3. **Query pg_indexes** - Lists all indexes in your public schema
4. **Find optimization candidates** - Identifies policies that could benefit from optimization
5. **Test semantic validation** - Validates the optimization logic against real policies

### Example Output

When connected successfully, you'll see output like:

```
✓ Connected to database for integration tests
✓ should connect to database successfully
✓ should query pg_policies table
  Found 12 RLS policies in public schema
  Sample policy: { schemaname: 'public', tablename: 'users', policyname: 'user_select_policy' }
✓ should query pg_indexes table
  Found 45 indexes in public schema
✓ should list all tables with RLS enabled
  Found 8 tables with RLS policies
  Tables with most policies:
    - users: 4 policies
    - posts: 3 policies
    - comments: 2 policies
✓ should identify potential optimization candidates
  Found 5 policies that could be optimized
  Sample policies needing optimization:
    - users.user_select_policy
      USING: auth.uid() = user_id
```

## Safety Notes

- **Read-only**: Integration tests only read from your database, they never modify it
- **Development only**: Only use your development database, never production
- **No data changes**: Tests query system tables (`pg_policies`, `pg_indexes`) but don't touch your data

## Troubleshooting

### "Failed to connect to database"

**Possible causes:**
1. Wrong password
2. IP not allowed in Supabase
3. Using wrong connection string format

**Solutions:**
- Double-check your password
- Go to Supabase > Project Settings > Database > Connection pooling
- Add your IP to the allowed list (or temporarily allow all IPs for testing)
- Make sure you're using "Direct connection" not "Connection pooling"

### "SSL connection error"

The code automatically handles SSL for Supabase. If you see SSL errors:
- Verify you're connecting to `db.*.supabase.co`
- Check your Supabase project is active

### "No policies found"

This is normal if:
- Your database is new and has no RLS policies yet
- You haven't enabled RLS on any tables

To add test policies, you can:
1. Go to Supabase > Table Editor
2. Select a table
3. Click "Enable RLS"
4. Add a policy

### Tests still skip

Make sure:
- Your `.env` file is in the project root
- The `DATABASE_URL` variable is set correctly
- You've restarted your terminal/IDE after adding the variable

## Alternative: Individual Variables

Instead of `DATABASE_URL`, you can use individual variables:

```env
DB_HOST=db.wjfcqqrlhwdvvjmefxky.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Running Specific Tests

```bash
# Run all integration tests
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts

# Run with verbose output
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts --reporter=verbose

# Run a specific test
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts -t "should query pg_policies"
```

## Next Steps

Once integration tests are working:

1. **Explore your policies**: The tests will show you which policies exist
2. **Identify optimizations**: See which policies could be optimized
3. **Test optimizations**: Use the validator to test policy changes before applying them
4. **Generate migrations**: Use the migration generator to create safe SQL scripts

## Need Help?

- Check the main README: `src/db-optimizer/README.md`
- Review the test file: `src/db-optimizer/__tests__/validator.integration.test.ts`
- Look at the validator implementation: `src/db-optimizer/validator.ts`
