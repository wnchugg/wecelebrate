# 🎯 YOUR EXACT STEPS TO FIX "Failed to Fetch"

## Your Project Info
- **Project ID**: `lmffeqwhrnbsbhdztwyv`
- **Supabase URL**: `https://lmffeqwhrnbsbhdztwyv.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s`

---

## 🚀 Step 1: Get Your Service Role Key

1. Go to: https://app.supabase.com/project/lmffeqwhrnbsbhdztwyv/settings/api
2. Scroll to "Project API keys"
3. Find and copy the **"service_role"** key (it's long, starts with `eyJhbGc...`)
4. **Save it somewhere** - you'll need it in Step 3

---

## 💻 Step 2: Open Terminal on Your Mac

1. Press `⌘ Command + Space`
2. Type "Terminal"
3. Press `Enter`

---

## 📦 Step 3: Install Supabase CLI

Copy and paste this into Terminal:

```bash
npm install -g supabase
```

Press `Enter` and wait for it to install.

---

## 🔐 Step 4: Login to Supabase

```bash
supabase login
```

This will open your browser. Click "Authorize" to connect.

---

## 🔗 Step 5: Link to Your Project

```bash
supabase link --project-ref lmffeqwhrnbsbhdztwyv
```

**When prompted for database password:**
- Enter the password you created when you made this Supabase project
- (If you don't remember it, you can reset it in the Supabase Dashboard)

---

## 🗂️ Step 6: Create Backend Files on Your Mac

Run these commands one by one:

```bash
# Create the folder structure
mkdir -p ~/JALA2-backend/supabase/functions/make-server-6fcaeea3

# Go into that folder
cd ~/JALA2-backend/supabase/functions/make-server-6fcaeea3
```

Now you need to create the backend files. I'll give you two options:

### Option A: Download from Figma Make (Easiest)

If Figma Make has an export/download button:
1. Download the project
2. Find the `supabase` folder
3. Copy it to `~/JALA2-backend/`
4. Skip to Step 7

### Option B: Copy Files Manually

Create each file by copying from Figma Make:

**File 1: Create `index.tsx`**
```bash
nano index.tsx
```
- Go to Figma Make → Open `/supabase/functions/server/index.tsx`
- Copy ALL the code
- Paste into Terminal (⌘ Command + V)
- Press `Control + X`, then `Y`, then `Enter` to save

**File 2: Create `kv_store.tsx`**
```bash
nano kv_store.tsx
```
- Go to Figma Make → Open `/supabase/functions/server/kv_store.tsx`
- Copy ALL the code
- Paste into Terminal
- Press `Control + X`, then `Y`, then `Enter`

**File 3: Create `security.tsx`**
```bash
nano security.tsx
```
- Go to Figma Make → Open `/supabase/functions/server/security.tsx`
- Copy ALL the code
- Paste into Terminal
- Press `Control + X`, then `Y`, then `Enter`

**File 4: Create `seed.tsx`**
```bash
nano seed.tsx
```
- Go to Figma Make → Open `/supabase/functions/server/seed.tsx`
- Copy ALL the code
- Paste into Terminal
- Press `Control + X`, then `Y`, then `Enter`

---

## 🔑 Step 7: Set Environment Secrets

Replace `YOUR_SERVICE_ROLE_KEY` with the key you copied in Step 1:

```bash
supabase secrets set SUPABASE_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co"

supabase secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s"

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

supabase secrets set ALLOWED_ORIGINS="*"
```

---

## 🚀 Step 8: Deploy the Edge Function

```bash
cd ~/JALA2-backend
supabase functions deploy make-server-6fcaeea3
```

**Wait for it to finish.** You should see:
```
Deploying function make-server-6fcaeea3...
✓ Deployed!
```

---

## ✅ Step 9: Test It Works

```bash
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s"
```

**Should return:** `{"status":"ok"}`

If you see that, **IT WORKS!** 🎉

---

## 🎯 Step 10: Configure in Figma Make

Go back to your Figma Make app in the browser:

1. Open: `/admin/environment-config`
2. Click **"Edit"** on the Development environment card
3. Enter:
   - **Supabase URL**: `https://lmffeqwhrnbsbhdztwyv.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s`
4. Click **"Save"**
5. Click **"Test Connection"**

**You should see:**
✅ "Development environment is online!"

---

## 🎉 DONE!

Your "Failed to fetch" error is now fixed!

**What just happened:**
1. ✅ Installed Supabase CLI on your Mac
2. ✅ Connected to your Supabase project
3. ✅ Created backend files on your Mac
4. ✅ Set environment secrets
5. ✅ Deployed the Edge Function
6. ✅ Configured credentials in Figma Make
7. ✅ Connection works!

---

## 🆘 Troubleshooting

### "npm: command not found"
You need to install Node.js first:
1. Go to: https://nodejs.org/
2. Download and install the LTS version
3. Restart Terminal
4. Try `npm install -g supabase` again

### "Database password incorrect"
1. Go to: https://app.supabase.com/project/lmffeqwhrnbsbhdztwyv/settings/database
2. Click "Reset database password"
3. Create a new password
4. Use that password when linking

### "Function deployment failed"
1. Check you're in the right folder: `cd ~/JALA2-backend`
2. Check the files exist: `ls supabase/functions/make-server-6fcaeea3/`
3. Check Supabase Dashboard → Edge Functions → Logs for errors

### "Still getting Failed to fetch"
1. Verify health check works (Step 9)
2. Check you entered the EXACT credentials in `/admin/environment-config`
3. Try hard refresh in browser: `⌘ Command + Shift + R`

---

## 📋 Quick Command Reference

```bash
# Check if Supabase CLI is installed
supabase --version

# Check which project you're linked to
supabase projects list

# Check deployed functions
supabase functions list

# View function logs (if errors)
supabase functions logs make-server-6fcaeea3

# Redeploy if needed
cd ~/JALA2-backend
supabase functions deploy make-server-6fcaeea3
```

---

## 🎯 What to Do Next

Once the backend is working:

1. **Create an admin user** - You'll need this to login
2. **Test the full application** - Try creating clients, sites, gifts
3. **Set up Production** (optional) - Create a separate Supabase project for production

---

**Need more help?** Check:
- [Full Troubleshooting Guide](/docs/FAILED_TO_FETCH_TROUBLESHOOTING.md)
- [Figma Make Setup Guide](/FIGMA_MAKE_FAILED_TO_FETCH_FIX.md)

**Last Updated**: 2026-02-06  
**Your Project**: lmffeqwhrnbsbhdztwyv
