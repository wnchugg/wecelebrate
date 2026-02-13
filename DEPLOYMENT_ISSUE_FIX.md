# Deployment Issue: Database Not Recognized

## Problem Identified

Your frontend is deployed at https://wecelebrate.netlify.app/ but it's trying to connect to a **Supabase Edge Function** that may not be deployed yet.

The Welcome page checks:
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/health-check
```

## Quick Test

Open your browser console on https://wecelebrate.netlify.app/ and run:

```javascript
fetch('https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/health-check', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec'
  }
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

## Expected Issues

### Issue 1: Edge Function Not Deployed
**Error**: 404 or "Function not found"

**Solution**: Deploy your Supabase Edge Functions

```bash
cd supabase/functions
supabase functions deploy make-server-6fcaeea3
```

### Issue 2: Database Tables Don't Exist
**Error**: "relation does not exist" or empty database

**Solution**: Run database migrations

```bash
# Option 1: Using Supabase CLI
cd supabase
supabase db push

# Option 2: Using the Supabase Dashboard
# Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/editor
# Run your SQL migrations manually
```

### Issue 3: CORS Not Configured
**Error**: CORS policy blocked

**Solution**: Add Netlify domain to Supabase
1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
2. Under "URL Configuration"
3. Add to "Site URL": `https://wecelebrate.netlify.app`
4. Add to "Redirect URLs": `https://wecelebrate.netlify.app/**`

## Immediate Workaround

If you want the site to work NOW without the backend, you can bypass the database check:

### Option 1: Skip Database Check (Quick Fix)

Update `src/app/pages/Welcome.tsx`:

```typescript
// Comment out the database check
useEffect(() => {
  // Skip database check for now
  setDbCheckComplete(true);
  
  /* Original code - uncomment when backend is ready
  const checkDatabaseStatus = async () => {
    try {
      const env = getCurrentEnvironment();
      const response = await fetch(
        `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/public/health-check`,
        ...
      );
      ...
    } catch (error) {
      console.error('[Welcome] Database check error:', error);
      setDbCheckComplete(true);
    }
  };
  checkDatabaseStatus();
  */
}, [navigate]);
```

Then rebuild and redeploy:
```bash
npm run build
# Commit and push to trigger Netlify rebuild
git add .
git commit -m "Bypass database check temporarily"
git push
```

### Option 2: Use Mock Data (Better for Demo)

Create a demo mode that works without backend:

```typescript
// In src/app/config/deploymentEnvironments.ts
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
```

Add to Netlify environment variables:
```
VITE_USE_MOCK_DATA=true
```

## Proper Solution (Recommended)

### Step 1: Check Supabase Project Status

1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Verify project is **active** (not paused)
3. Check if tables exist in Table Editor

### Step 2: Deploy Edge Functions

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Deploy the Edge Function
cd supabase/functions
supabase functions deploy make-server-6fcaeea3

# Verify deployment
supabase functions list
```

### Step 3: Initialize Database

```bash
# Run migrations
cd supabase
supabase db push

# Or seed with test data
supabase db seed
```

### Step 4: Configure CORS

In Supabase Dashboard:
1. Settings → API
2. Add `https://wecelebrate.netlify.app` to allowed origins

### Step 5: Test Backend

```bash
# Test the health endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/health-check \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"
```

## What's Happening Now

Your site is likely:
1. ✅ Frontend deployed successfully to Netlify
2. ❌ Backend Edge Function not deployed to Supabase
3. ❌ Database tables don't exist or are empty
4. ❌ Welcome page waiting for database check to complete

## Next Steps

**Choose one path:**

### Path A: Quick Demo (No Backend)
1. Bypass database check (see Option 1 above)
2. Use mock data for demo purposes
3. Deploy backend later

### Path B: Full Deployment (Recommended)
1. Deploy Supabase Edge Functions
2. Run database migrations
3. Configure CORS
4. Test end-to-end

## Need Help?

Tell me which path you want to take, or share:
1. Browser console errors from https://wecelebrate.netlify.app/
2. Whether you have Supabase CLI installed
3. If you want to deploy the backend now or demo without it
