# Simple Environment Setup for Figma Make

**TL;DR**: For Figma Make, the easiest way is to directly edit the configuration file to add your Production credentials.

---

## 🎯 Understanding Your Current Setup

Right now, you have **one Supabase project** that serves as Development:

```
Current Project: lmffeqwhrnbsbhdztwyv
URL: https://lmffeqwhrnbsbhdztwyv.supabase.co
Location: /utils/supabase/info.tsx
```

This is used for Development, Test, UAT, and Production (all point to the same database).

---

## 🚀 Simplest Setup: Add Production Environment

### Step 1: Create Production Supabase Project (5 min)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `JALA2-Production`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose same as your current project
4. Click **"Create new project"**
5. Wait 2-3 minutes for it to initialize

### Step 2: Get Production Credentials (2 min)

Once your Production project is ready:

1. Go to **Settings > API** in the Supabase Dashboard
2. Copy these two values:

```
Project URL: https://[your-prod-id].supabase.co
anon public key: eyJhbGc...(long string)
```

### Step 3: Add Production Credentials to Your Code (1 min)

Edit `/src/app/config/environments.ts` and update the `production` section:

Find this section (around line 59):
```typescript
production: {
  id: 'production',
  name: 'Production',
  label: 'PROD',
  color: '#EF4444', // Red
  badge: 'bg-red-100 text-red-800 border-red-300',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL_PROD || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || DEFAULT_SUPABASE_ANON_KEY,
  description: 'Production environment - live data',
},
```

Replace it with:
```typescript
production: {
  id: 'production',
  name: 'Production',
  label: 'PROD',
  color: '#EF4444', // Red
  badge: 'bg-red-100 text-red-800 border-red-300',
  // Production credentials - replace with your actual values
  supabaseUrl: 'https://YOUR_PROD_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_PROD_ANON_KEY_HERE',
  description: 'Production environment - live data',
},
```

**Important**: Replace:
- `YOUR_PROD_PROJECT_ID` with your actual production project ID
- `YOUR_PROD_ANON_KEY_HERE` with your actual production anon key

### Step 4: Deploy Edge Function to Production (5 min)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your Production project
supabase link --project-ref YOUR_PROD_PROJECT_ID

# Set environment secrets for the Edge Function
supabase secrets set SUPABASE_URL=https://YOUR_PROD_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY
```

You'll also need your Service Role Key (also from Settings > API):
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_ROLE_KEY
```

Then deploy:
```bash
supabase functions deploy make-server-6fcaeea3
```

### Step 5: Test (2 min)

1. Refresh your Figma Make app
2. Go to `/admin/login`
3. Click the environment dropdown (top-right)
4. Select **"Production"** (red badge)
5. You should see:
   - Backend connection status: ✅ green checkmark
   - "Connected to Production"

---

## ✅ Complete Example

Here's what your `/src/app/config/environments.ts` should look like after editing:

```typescript
export const environments: Record<EnvironmentType, EnvironmentConfig> = {
  development: {
    id: 'development',
    name: 'Development',
    label: 'DEV',
    color: '#10B981',
    badge: 'bg-green-100 text-green-800 border-green-300',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    description: 'Development environment for testing new features',
  },
  test: {
    id: 'test',
    name: 'Test (Dev)',
    label: 'TEST',
    color: '#F59E0B',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_TEST || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_TEST || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    description: 'Testing environment (currently uses Development)',
  },
  uat: {
    id: 'uat',
    name: 'UAT (Dev)',
    label: 'UAT',
    color: '#8B5CF6',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_UAT || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_UAT || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    description: 'UAT environment (currently uses Development)',
  },
  production: {
    id: 'production',
    name: 'Production',
    label: 'PROD',
    color: '#EF4444',
    badge: 'bg-red-100 text-red-800 border-red-300',
    // REPLACE WITH YOUR PRODUCTION CREDENTIALS
    supabaseUrl: 'https://xyz789prod.supabase.co', // <-- Your prod URL here
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // <-- Your prod key here
    description: 'Production environment - live data',
  },
};
```

---

## 📊 Before vs After

### Before (Current State):
```
┌─────────────────────────────────────────┐
│ All Environments                         │
├─────────────────────────────────────────┤
│ Development → lmffeqwhrnbsbhdztwyv       │
│ Test        → lmffeqwhrnbsbhdztwyv       │ (same DB)
│ UAT         → lmffeqwhrnbsbhdztwyv       │ (same DB)
│ Production  → lmffeqwhrnbsbhdztwyv       │ (same DB)
└─────────────────────────────────────────┘

Result: All environments share the same database
```

### After Setup:
```
┌─────────────────────────────────────────┐
│ Two Separate Environments                │
├─────────────────────────────────────────┤
│ Development → lmffeqwhrnbsbhdztwyv       │
│ Test        → lmffeqwhrnbsbhdztwyv       │ (shared)
│ UAT         → lmffeqwhrnbsbhdztwyv       │ (shared)
│ Production  → xyz789prod (NEW!)          │ ← Separate DB!
└─────────────────────────────────────────┘

Result: Dev/Test/UAT share one DB, Production separate
```

---

## 🔒 Security Note

**About hardcoding credentials:**

The anon key is **public** and safe to include in your frontend code. It's called "anon" (anonymous) because it's meant to be public. Supabase uses Row Level Security (RLS) to protect your data, not secret keys.

**Never include in code:**
- ❌ Service Role Key (this one is secret!)
- ❌ Database passwords
- ❌ Admin passwords

**Safe to include in code:**
- ✅ Project URL (public)
- ✅ Anon Key (public)

The Service Role Key is only used in the backend Edge Function, where we set it as a secret using `supabase secrets set`.

---

## 🎯 Summary Checklist

- [ ] Create Production Supabase project
- [ ] Get Production URL and Anon Key
- [ ] Edit `/src/app/config/environments.ts`
- [ ] Replace `YOUR_PROD_PROJECT_ID` with actual ID
- [ ] Replace `YOUR_PROD_ANON_KEY_HERE` with actual key
- [ ] Deploy Edge Function to Production project
- [ ] Test environment switching in UI
- [ ] Verify separate databases (create test data in Dev, check it doesn't appear in Prod)

---

## 🔧 Alternative: Using Supabase Secrets (If You Prefer)

If you'd rather not hardcode credentials, you can use the create_supabase_secret tool:

I can help you set up secrets that Figma Make will prompt you to fill in. Would you like me to do that instead?

---

## 🆘 Need Help?

**Issue: Can't find Settings > API in Supabase**
- Make sure you're in the correct project
- Look in the left sidebar for "Project Settings" or "Settings"
- Then click "API" tab

**Issue: Don't have Supabase CLI**
```bash
npm install -g supabase
supabase --version  # Verify installation
```

**Issue: Can't deploy Edge Function**
- Make sure you're logged in: `supabase login`
- Make sure you're linked to the right project: `supabase link --project-ref YOUR_PROD_ID`
- Check your internet connection

---

## 📝 Next Steps After Setup

1. **Create Production Admin Account**
   ```bash
   ./scripts/create-admin.sh prod
   ```

2. **Test Login**
   - Log into Production
   - Should see empty dashboard (new database)

3. **Configure Production**
   - Create your first client in Production
   - Set up real sites (not test data)
   - Configure actual products

4. **Start Using**
   - Use Development for testing new features
   - Use Production for real gift orders

---

**Total Time**: ~15 minutes  
**Cost**: ~$50/month (2 projects)  
**Result**: Separate Dev and Production environments!

---

**Last Updated**: February 6, 2026  
**For**: Figma Make Projects
