# Frontend Database Connection Debug Guide

## Current Configuration

Your Supabase configuration is set up in:
- **Project ID**: `wjfcqqrlhwdvvjmefxky`
- **URL**: `https://wjfcqqrlhwdvvjmefxky.supabase.co`
- **Client**: Configured in `src/app/lib/supabase.ts`

## Common Issues & Solutions

### 1. Check Browser Console Errors

Open your deployed site and check the browser console (F12 → Console tab):

**Look for these error types:**

#### CORS Errors
```
Access to fetch at 'https://wjfcqqrlhwdvvjmefxky.supabase.co/...' from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

**Solution**: Add your Netlify domain to Supabase allowed origins:
1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
2. Scroll to "URL Configuration"
3. Add your Netlify URL to "Site URL" and "Redirect URLs"

#### Network Errors
```
Failed to fetch
net::ERR_NAME_NOT_RESOLVED
```

**Solution**: Check if Supabase project is paused or deleted
- Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
- Ensure project is active (not paused)

#### Authentication Errors
```
Invalid API key
JWT expired
```

**Solution**: Regenerate anon key if needed
- Go to Settings → API
- Copy the `anon` `public` key
- Update `utils/supabase/info.ts`

### 2. Test Database Connection

Add this test to your deployed site's console:

```javascript
// Test 1: Check if Supabase client exists
console.log('Supabase URL:', 'https://wjfcqqrlhwdvvjmefxky.supabase.co');

// Test 2: Try a simple query
fetch('https://wjfcqqrlhwdvvjmefxky.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec'
  }
})
.then(r => r.json())
.then(d => console.log('Supabase Response:', d))
.catch(e => console.error('Supabase Error:', e));
```

### 3. Check Supabase Project Status

Visit: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky

**Verify:**
- ✅ Project is active (not paused)
- ✅ Database is running
- ✅ Tables exist (check Table Editor)
- ✅ RLS policies are configured (if using Row Level Security)

### 4. Check Network Tab

In browser DevTools (F12 → Network tab):
1. Refresh the page
2. Filter by "supabase"
3. Look for failed requests (red)
4. Click on failed request → Preview/Response tab to see error details

### 5. Common Database Issues

#### Empty Database
If database has no tables:
```bash
# Run migrations locally first
cd supabase
supabase db push

# Or use Supabase dashboard to create tables
```

#### RLS Blocking Access
If Row Level Security is enabled but no policies exist:
1. Go to Authentication → Policies
2. Either disable RLS or add policies
3. For testing, you can temporarily disable RLS on tables

#### Wrong Environment
Check if you're pointing to the right Supabase project:
- Development: Different project ID
- Production: Current project ID (`wjfcqqrlhwdvvjmefxky`)

### 6. Netlify Environment Variables

Even though your keys are hardcoded, you might want to use environment variables for flexibility:

**In Netlify Dashboard:**
1. Go to Site Settings → Environment Variables
2. Add these variables:
   ```
   VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Then update `utils/supabase/info.ts`:**
```typescript
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || "wjfcqqrlhwdvvjmefxky"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 7. Check Build Logs

In Netlify:
1. Go to Deploys
2. Click on latest deploy
3. Check build logs for errors
4. Look for "Build failed" or warnings

### 8. Test Locally First

Before debugging production:
```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Test if database works locally
# Open http://localhost:5173
```

If it works locally but not in production, it's likely a CORS or environment issue.

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Supabase project is active (not paused)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful requests to Supabase
- [ ] Netlify domain is added to Supabase allowed origins
- [ ] Database has tables (check Supabase Table Editor)
- [ ] API keys are correct and not expired
- [ ] Build completed successfully on Netlify
- [ ] Site loads (not 404 or blank page)

## Get Specific Error Details

To help debug further, please provide:

1. **Netlify URL**: Your deployed site URL
2. **Console Errors**: Screenshot or copy/paste from browser console
3. **Network Errors**: Any failed requests in Network tab
4. **Supabase Status**: Is project active? Do tables exist?
5. **Specific Behavior**: What happens when you try to use the site?
   - Blank page?
   - Error message?
   - Infinite loading?
   - Specific feature not working?

## Next Steps

1. Open your deployed site
2. Open browser console (F12)
3. Look for errors
4. Share the error messages with me
5. I'll help you fix the specific issue

## Common Solutions Summary

| Issue | Solution |
|-------|----------|
| CORS Error | Add Netlify URL to Supabase allowed origins |
| 404 on routes | Already fixed with `netlify.toml` redirects |
| Empty database | Run migrations or create tables in Supabase |
| RLS blocking | Add policies or disable RLS for testing |
| Project paused | Unpause in Supabase dashboard |
| Wrong keys | Update keys in `utils/supabase/info.ts` |
| Build failed | Check Netlify build logs |
