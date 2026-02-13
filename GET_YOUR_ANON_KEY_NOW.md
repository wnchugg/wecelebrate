# 🔑 GET YOUR ANON KEY - QUICK GUIDE

## ⚠️ REQUIRED BEFORE DEPLOYMENT

You need to get your **actual anon key** from Supabase dashboard.

---

## 📋 Quick Steps (2 minutes)

### Step 1: Open Supabase Dashboard
Click this link: **https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api**

### Step 2: Find the Anon Key
Look for the section labeled **"Project API keys"**

You'll see two keys:
- ❌ **service_role** key (DO NOT USE - this is secret!)
- ✅ **anon** key (USE THIS ONE - it's public)

### Step 3: Copy the Anon Key
Click the copy button next to the **anon** key

It will look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNTMzNzUsImV4cCI6MjA1MzkyOTM3NX0.XXXXXXXXXX
```

### Step 4: Update Your Environment File

**Option A: Create/Edit .env.local**
```bash
# Create or edit .env.local
nano .env.local

# Paste this and replace with your actual key:
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your_actual_key_here
```

**Option B: Update /utils/supabase/info.ts**
```typescript
// Open the file and replace:
export const publicAnonKey = "eyJhbGci...your_actual_key_here"
```

### Step 5: Verify It Works
```bash
# Start the dev server
npm run dev

# Check the console - should see no auth errors
```

---

## 🚀 For Figma Make Deployment

When deploying to Figma Make, set these environment variables:

```
Variable Name: VITE_SUPABASE_ANON_KEY
Value: [paste your anon key here]
```

---

## ❓ FAQ

**Q: Which key should I use?**  
A: The **anon** key (also called "public" key). NOT the service_role key!

**Q: Is it safe to use this key?**  
A: Yes! The anon key is designed to be public and used in your frontend.

**Q: What if I can't find it?**  
A: Make sure you're logged into Supabase and have access to the project.

**Q: Can I share this key?**  
A: The anon key can be public (it's in your frontend code), but the service_role key must stay secret!

---

**Direct Link to Dashboard**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api

**Project Ref (for reference)**:  
`wjfcqqrlhwdvvjmefxky` (WITH TWO v's)
