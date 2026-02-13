# Environment Configuration in Figma Make

**Important**: In Figma Make, you DON'T create `.env` files manually. Instead, you configure environment variables through the Figma Make interface.

---

## 🎯 Where to Configure

### In Figma Make Interface

Environment variables are configured in the **Figma Make project settings**, not in files you create.

---

## 📝 Current Configuration

Your project currently uses these credentials from `/utils/supabase/info.tsx`:

```
Project ID: lmffeqwhrnbsbhdztwyv
Supabase URL: https://lmffeqwhrnbsbhdztwyv.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**This is your Development environment by default.**

---

## 🔧 How to Add Production Environment

### Option 1: Use Figma Make Environment Variables (Recommended)

1. **In Figma Make**, look for a "Settings" or "Environment Variables" section
2. Add these variables:

```
VITE_SUPABASE_URL_PROD=https://[your-prod-project-id].supabase.co
VITE_SUPABASE_ANON_KEY_PROD=[your-prod-anon-key]
```

### Option 2: Update the info.tsx File (Temporary for Testing)

You can temporarily update `/utils/supabase/info.tsx` for testing, but note that this file is auto-generated and may be overwritten.

---

## 🏗️ Recommended Setup Approach

Since Figma Make manages the environment differently, here's the simplified approach:

### For Development (Current Setup)
✅ Already configured in `/utils/supabase/info.tsx`
- Project: lmffeqwhrnbsbhdztwyv
- This is your **Development** environment

### For Production (New Setup)

You have **two options**:

#### **Option A: Use Current Project for Dev, Create New for Prod**

1. **Keep current project as Development**
   - No changes needed
   - Current credentials stay as-is

2. **Create new Supabase project for Production**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project: `JALA2-Production`
   - Get credentials (URL + Anon Key)

3. **Add Production variables in Figma Make**
   - Add: `VITE_SUPABASE_URL_PROD`
   - Add: `VITE_SUPABASE_ANON_KEY_PROD`

4. **Deploy Edge Function to Production**
   ```bash
   ./scripts/deploy-environment.sh prod
   ```

#### **Option B: Create Both New Projects**

If you want to start fresh:

1. **Create Development Project**
   - Name: `JALA2-Development`
   - Get credentials

2. **Create Production Project**
   - Name: `JALA2-Production`
   - Get credentials

3. **Update Figma Make environment variables**
   - Development: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Production: `VITE_SUPABASE_URL_PROD`, `VITE_SUPABASE_ANON_KEY_PROD`

---

## 🚀 Quick Start: Add Production to Current Setup

Since you already have a working project, here's the fastest path:

### Step 1: Create Production Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Name: `JALA2-Production`
4. Generate strong database password
5. Choose same region as current project
6. Wait 2-3 minutes for creation

### Step 2: Get Production Credentials

In your new Production project:
1. Go to **Settings > API**
2. Copy these values:

```
Project URL: https://[prod-id].supabase.co
Anon (public) key: eyJhbGc...
Service Role key: eyJhbGc...
Project Ref ID: [prod-id]
```

### Step 3: Configure in Figma Make

**Look for one of these locations in Figma Make:**
- ⚙️ Settings button
- 🔐 Environment Variables section
- 📝 Project Configuration
- 🛠️ Build Settings

**Add these variables:**
```
Name: VITE_SUPABASE_URL_PROD
Value: https://[your-prod-id].supabase.co

Name: VITE_SUPABASE_ANON_KEY_PROD
Value: eyJhbGc...[your-prod-anon-key]
```

### Step 4: Deploy Edge Function to Production

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link to Production project
supabase link --project-ref [your-prod-id]

# Set secrets
supabase secrets set SUPABASE_URL=https://[your-prod-id].supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[your-prod-service-role-key]
supabase secrets set SUPABASE_ANON_KEY=[your-prod-anon-key]

# Deploy
supabase functions deploy make-server-6fcaeea3
```

### Step 5: Test

1. Refresh your Figma Make app
2. Go to `/admin/login`
3. Use the environment selector dropdown
4. Switch to "Production"
5. You should see the red PROD badge
6. Backend connection should show green ✅

---

## 📊 Current vs. Needed Setup

### What You Have Now:
```
Development Environment
├─ Supabase Project: lmffeqwhrnbsbhdztwyv
├─ URL: https://lmffeqwhrnbsbhdztwyv.supabase.co
├─ Configured in: /utils/supabase/info.tsx
└─ Status: ✅ Working
```

### What You Need to Add:
```
Production Environment
├─ Supabase Project: [new project to create]
├─ URL: https://[prod-id].supabase.co
├─ Configure in: Figma Make environment variables
│   ├─ VITE_SUPABASE_URL_PROD
│   └─ VITE_SUPABASE_ANON_KEY_PROD
└─ Deploy: Edge Function to prod project
```

---

## 🔍 How the Code Reads Environment Variables

Your app reads variables in this order:

```typescript
// From /src/app/config/environments.ts

development: {
  // Uses current credentials from /utils/supabase/info.tsx
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
}

production: {
  // Looks for PROD variables, falls back to default
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL_PROD || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || DEFAULT_SUPABASE_ANON_KEY,
}
```

**Right now**: Production falls back to Development (same project)

**After setup**: Production uses its own project

---

## ✅ Verification Steps

After configuration:

1. **Check variables are loaded:**
   - Open browser console (F12)
   - Type: `import.meta.env`
   - Should see: `VITE_SUPABASE_URL_PROD`

2. **Check environment selector:**
   - Go to `/admin/login`
   - Top-right dropdown should show:
     - Development (green)
     - Production (red)

3. **Test connection:**
   - Select Production
   - Should see "Backend is online" with green checkmark
   - Should show "Connected to Production"

---

## 🆘 If You Can't Find Environment Variable Settings

If Figma Make doesn't have a visible environment variables section:

### Alternative: Contact Figma Make Support

Ask them:
> "How do I add environment variables (VITE_SUPABASE_URL_PROD and VITE_SUPABASE_ANON_KEY_PROD) to my Figma Make project?"

### Temporary Workaround: Hardcode for Testing

**NOT recommended for production, but for testing:**

Edit `/src/app/config/environments.ts`:

```typescript
production: {
  id: 'production',
  name: 'Production',
  label: 'PROD',
  color: '#EF4444',
  badge: 'bg-red-100 text-red-800 border-red-300',
  // Hardcoded for testing - REPLACE WITH YOUR PRODUCTION CREDENTIALS
  supabaseUrl: 'https://YOUR_PROD_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'eyJhbGc...YOUR_PROD_ANON_KEY',
  description: 'Production environment - live data',
},
```

**⚠️ Important**: This is temporary. You should use environment variables for security.

---

## 📝 Summary

**In Figma Make:**
- ❌ Don't create `.env.local` or `.env.production` files manually
- ✅ Use Figma Make's environment variable interface
- ✅ Or ask Figma Make support for the correct method

**Your Task:**
1. Create Production Supabase project
2. Get production credentials (URL + Keys)
3. Add to Figma Make environment variables:
   - `VITE_SUPABASE_URL_PROD`
   - `VITE_SUPABASE_ANON_KEY_PROD`
4. Deploy Edge Function to production project
5. Test environment switching

**Current Status:**
- Development: ✅ Working (project: lmffeqwhrnbsbhdztwyv)
- Production: ⏳ Need to create and configure

---

## 🎯 Next Action

**Right now, you should:**

1. **Create Production Supabase Project** (5 min)
   - Go to dashboard and create `JALA2-Production`

2. **Find environment variable settings in Figma Make** (2 min)
   - Look for Settings/Configuration in Figma Make UI
   - Or ask Figma Make support

3. **Once you know where to add variables:**
   - Add `VITE_SUPABASE_URL_PROD`
   - Add `VITE_SUPABASE_ANON_KEY_PROD`

4. **Deploy Edge Function to Production** (5 min)
   - Use the deployment script

**Need help finding where to add environment variables in Figma Make?** Let me know and I can help troubleshoot!

---

**Last Updated**: February 6, 2026  
**Platform**: Figma Make
