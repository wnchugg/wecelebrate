# Netlify Environment Configuration

## Current Status

Your app has Supabase credentials **hardcoded** in `utils/supabase/info.ts`:
- ✅ Project ID: `wjfcqqrlhwdvvjmefxky`
- ✅ Anon Key: Already in the code

**This means environment variables are OPTIONAL** - your app will work without them.

## The Real Issue

The problem isn't environment variables - it's that your **Supabase Edge Function isn't deployed**.

Your frontend is trying to call:
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/health-check
```

But this endpoint doesn't exist yet because the backend isn't deployed.

## Two Solutions

### Solution 1: Quick Fix (No Backend Needed) ⚡

Make the site work WITHOUT the backend by using fallback data.

**Step 1**: I'll update the Welcome page to skip the database check
**Step 2**: You commit and push
**Step 3**: Site works in 3 minutes

Want me to do this now?

### Solution 2: Deploy Backend (Full Setup) 🚀

Deploy your Supabase Edge Functions so the backend works.

#### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

#### Deploy Steps

1. **Link to your project**:
```bash
supabase link --project-ref wjfcqqrlhwdvvjmefxky
```

2. **Deploy the Edge Function**:
```bash
cd supabase/functions
supabase functions deploy make-server-6fcaeea3
```

3. **Initialize the database**:
```bash
cd supabase
supabase db push
```

4. **Verify deployment**:
```bash
# Test the health endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/health-check \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"
```

## Optional: Netlify Environment Variables

If you want to use environment variables instead of hardcoded values (recommended for production):

### Step 1: Add Variables in Netlify

1. Go to https://app.netlify.com/sites/wecelebrate/settings/deploys#environment
2. Click "Add a variable"
3. Add these:

```
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec
VITE_SUPABASE_PROJECT_ID=wjfcqqrlhwdvvjmefxky
```

### Step 2: Update Code to Use Env Vars

Update `utils/supabase/info.ts`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "wjfcqqrlhwdvvjmefxky"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"
```

### Step 3: Redeploy

Trigger a new deploy in Netlify (it will pick up the env vars).

## Supabase Dashboard Configuration

Also configure CORS in Supabase:

1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
2. Scroll to "URL Configuration"
3. Add these URLs:
   - **Site URL**: `https://wecelebrate.netlify.app`
   - **Redirect URLs**: `https://wecelebrate.netlify.app/**`

## Current Netlify Build Settings

Your `netlify.toml` is already configured correctly:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: 20
- ✅ SPA redirects: Configured
- ✅ Security headers: Set

## Verification Checklist

After setup, verify:

- [ ] Netlify build succeeds
- [ ] Site loads at https://wecelebrate.netlify.app
- [ ] No console errors about missing env vars
- [ ] Backend health check passes (if deployed)
- [ ] CORS configured in Supabase
- [ ] Database has tables (if using backend)

## What to Do Right Now

**Option A**: Quick fix without backend (I can do this in 2 minutes)
**Option B**: Deploy backend yourself (requires Supabase CLI)

Which would you prefer?
