# Environment Setup Instructions

## ⚠️ CRITICAL: Correct Project References

### Development Project
- **Project Ref**: `wjfcqqrlhwdvjmefxky`
- **URL**: https://wjfcqqrlhwdvjmefxky.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky
- **API Settings**: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/settings/api

### Production Project
- **Project Ref**: `lmffeqwhrnbsbhdztwyv`
- **URL**: https://lmffeqwhrnbsbhdztwyv.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
- **API Settings**: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/api

---

## 🚀 Quick Setup (Required Before Deployment)

### Step 1: Get Your Anon Keys from Supabase

#### For Development:
1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/settings/api
2. Copy the **anon** key (it's labeled "anon public")
3. Keep this handy for Step 2

#### For Production:
1. Go to https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/api
2. Copy the **anon** key (it's labeled "anon public")
3. Keep this handy for later

### Step 2: Update Environment Files

#### Option A: Using .env.local (Recommended for local development)
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local and replace:
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ACTUAL_ANON_KEY_FROM_SUPABASE_DASHBOARD

# With your actual anon key from Step 1
```

#### Option B: Update /utils/supabase/info.ts directly
```typescript
// Replace the placeholder with your actual key from Step 1
export const publicAnonKey = "YOUR_ACTUAL_ANON_KEY_HERE"
```

### Step 3: Verify Configuration

Run this test to verify your environment is configured correctly:

```bash
# Check that environment variables are loaded
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

---

## 📋 Environment Files Reference

### File Structure
```
/
├── .env.example          ✅ Template (safe to commit)
├── .env.development      ✅ Development defaults (safe to commit without keys)
├── .env.production       ✅ Production defaults (safe to commit without keys)
├── .env.local            ❌ YOUR LOCAL OVERRIDES (NEVER COMMIT)
└── .gitignore            ✅ Protects sensitive files
```

### Priority Order (Vite loads in this order):
1. `.env.local` (highest priority - your local overrides)
2. `.env.[mode].local` (mode-specific local overrides)
3. `.env.[mode]` (mode-specific defaults)
4. `.env` (general defaults)

---

## 🔧 Configuration for Different Environments

### Local Development
Use `.env.local` with development project:
```bash
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://wjfcqqrlhwdvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=your_dev_anon_key_here
VITE_API_URL=https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
```

### Figma Make Deployment
When deploying to Figma Make, set these environment variables in the deployment settings:

**For Development Deployment:**
```
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://wjfcqqrlhwdvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=[your dev anon key]
```

**For Production Deployment:**
```
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://lmffeqwhrnbsbhdztwyv.supabase.co
VITE_SUPABASE_ANON_KEY=[your prod anon key]
```

### Production Build
```bash
# Build for production
npm run build:production

# Or use environment file
VITE_APP_ENV=production npm run build
```

---

## 🔍 How to Find Your Anon Key

### Method 1: Supabase Dashboard (Easiest)
1. Open your project dashboard
   - Dev: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky
   - Prod: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
2. Click **Settings** (gear icon in sidebar)
3. Click **API** in the settings menu
4. Look for the **Project API keys** section
5. Copy the **anon** / **public** key (it's a long JWT token starting with `eyJ...`)

### Method 2: Verify Current Key
If you're not sure what key you're using, decode the JWT:
```bash
# The JWT payload contains the project ref
# Decode at https://jwt.io or use:
echo "YOUR_KEY" | cut -d. -f2 | base64 -d
```

The `ref` field should match:
- Development: `"ref": "wjfcqqrlhwdvjmefxky"`
- Production: `"ref": "lmffeqwhrnbsbhdztwyv"`

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `.env.local` exists with correct development project ref (`wjfcqqrlhwdvjmefxky`)
- [ ] Anon key in `.env.local` matches development project
- [ ] `.gitignore` includes `.env.local` (to prevent committing secrets)
- [ ] `/utils/supabase/info.ts` has correct project ID
- [ ] No hardcoded project refs in code (all use environment variables)

Test the configuration:
```bash
# Start dev server
npm run dev

# Check browser console - should show:
# - Supabase URL: https://wjfcqqrlhwdvjmefxky.supabase.co
# - No authentication errors
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong: Hardcoding Project Ref
```typescript
const supabase = createClient(
  'https://wjfcqqrlhwdvvjmefxky.supabase.co',  // WRONG! Extra 'v'
  'hardcoded-key'
)
```

### ✅ Correct: Using Environment Variables
```typescript
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### ❌ Wrong: Using Production Key in Development
This will cause authentication issues!

### ✅ Correct: Match Key to Environment
- Development project → Development anon key
- Production project → Production anon key

---

## 📞 Troubleshooting

### "Invalid API key" or "Invalid JWT"
- **Cause**: Anon key doesn't match the project
- **Fix**: Get the correct anon key from Supabase dashboard

### "Failed to fetch" or CORS errors
- **Cause**: Wrong project URL
- **Fix**: Verify `VITE_SUPABASE_URL` matches your project ref

### Environment variables not loading
- **Cause**: File naming or Vite not restarted
- **Fix**: 
  1. Ensure file is named `.env.local` (with leading dot)
  2. Restart dev server (`npm run dev`)
  3. Hard refresh browser (Ctrl+Shift+R)

### Project ref typo
- **Development**: `wjfcqqrlhwdvjmefxky` (NO extra 'v')
- **Production**: `lmffeqwhrnbsbhdztwyv`

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Client Setup](https://supabase.com/docs/reference/javascript/initializing)
- [JALA 2 Configuration Management](/CONFIGURATION_MANAGEMENT.md)

---

**Last Updated**: February 10, 2026
**Status**: Ready for deployment with correct environment configuration
