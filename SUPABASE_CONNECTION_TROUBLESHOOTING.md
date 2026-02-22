# Supabase Connection Troubleshooting

## Current Issue

The direct connection hostname `db.wjfcqqrlhwdvvjmefxky.supabase.co` is not resolving. This is a common issue with Supabase external connections.

## Solution: Use Connection Pooling

Supabase provides two types of connection strings:
1. **Direct connection** - For internal/server-side use (doesn't work from external machines)
2. **Connection pooling** - For external connections (this is what you need!)

### Steps to Fix

1. **Go to your Supabase Dashboard:**
   - https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/database

2. **Find the Connection Pooling section:**
   - Scroll down to "Connection string"
   - Click on "Connection pooling" tab (not "Direct connection")

3. **Copy the connection pooling string:**
   It should look like:
   ```
   postgresql://postgres.wjfcqqrlhwdvvjmefxky:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

4. **Update your `.env` file:**
   ```bash
   # Replace the current DATABASE_URL with the connection pooling string
   DATABASE_URL=postgresql://postgres.wjfcqqrlhwdvvjmefxky:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

   **Important differences:**
   - Port changes from `5432` to `6543`
   - Hostname changes from `db.xxx.supabase.co` to `aws-0-xxx.pooler.supabase.com`
   - Username format changes from `postgres` to `postgres.xxx`

5. **Run the tests again:**
   ```bash
   npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
   ```

## Alternative: Check if Project is Paused

If you're on the free tier, Supabase pauses inactive projects after 7 days:

1. Go to your project dashboard
2. Look for a "Resume Project" or "Restore Project" button
3. Click it to wake up your database
4. Wait a few minutes for it to fully start
5. Try the connection again

## Alternative: Allow Your IP Address

Supabase might be blocking your IP:

1. Go to Project Settings > Database
2. Scroll to "Connection pooling"
3. Look for IP restrictions
4. Temporarily add `0.0.0.0/0` to allow all IPs (for testing only!)
5. Or add your specific IP address

## Verify Connection String Format

Your current connection string:
```
DATABASE_URL=postgresql://postgres:74rRtfqMw0BHCyXo@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres
```

Should be changed to (connection pooling):
```
DATABASE_URL=postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Notice:
- ✅ Username: `postgres.wjfcqqrlhwdvvjmefxky` (includes project ID)
- ✅ Host: `aws-0-us-west-1.pooler.supabase.com` (pooler hostname)
- ✅ Port: `6543` (pooler port, not 5432)

## Test Connection Manually

You can test the connection using `psql` (if installed):

```bash
# Test connection pooling
psql "postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

If this works, then the integration tests will work too!

## Still Not Working?

If you continue to have issues:

1. **Check Supabase Status:**
   - https://status.supabase.com/
   - Make sure there are no ongoing incidents

2. **Verify Project Region:**
   - Your project might be in a different region
   - Check the connection string in your Supabase dashboard for the correct region

3. **Contact Supabase Support:**
   - If you're on a paid plan, reach out to support
   - Check the Supabase Discord community

4. **Use Unit Tests Instead:**
   - The unit tests work perfectly without a database
   - Integration tests are optional for development
   - You can always run them later when the connection is working

## Quick Command Reference

```bash
# Update .env with connection pooling string
echo "DATABASE_URL=postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-0-us-west-1.pooler.supabase.com:6543/postgres" > .env

# Run integration tests
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts

# Run unit tests (no database needed)
npm run test:safe -- src/db-optimizer/__tests__/validator.test.ts
```

## Summary

The most likely fix is to use the **connection pooling** string instead of the direct connection string. Get this from your Supabase dashboard under the "Connection pooling" tab.
