# Multi-Environment Supabase Setup Guide

Complete guide to creating separate Supabase projects for Dev, Test, UAT, and Production environments.

---

## Overview

You'll create **4 separate Supabase projects**:
- **Development** - For active development and testing
- **Test** - For QA and automated testing
- **UAT** - For user acceptance testing
- **Production** - For live/production use

Each project will have:
- Its own database
- Its own Edge Function deployment
- Its own credentials (URL + Anon Key)
- Complete data isolation

---

## Step 1: Create Supabase Projects

### 1.1 Create Development Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Organization**: Your organization
   - **Name**: `JALA2-Development` (or your preferred name)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Choose appropriate plan
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### 1.2 Save Development Credentials

Once created, go to **Settings > API**:

```bash
# Save these values:
Project URL: https://[dev-project-id].supabase.co
Anon (public) key: eyJhbGc...  (long string)
Service Role key: eyJhbGc...  (different long string)
```

**⚠️ Important**: Keep the Service Role key secure - never expose it to frontend!

### 1.3 Repeat for Other Environments

Create 3 more projects with these names:
- `JALA2-Test`
- `JALA2-UAT`
- `JALA2-Production`

For each project, save:
- Project URL
- Anon key
- Service Role key

---

## Step 2: Configure Environment Variables

### 2.1 Create `.env.local` (Development)

Create `/path/to/your/project/.env.local`:

```bash
# Development Environment (default)
VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...YOUR_DEV_ANON_KEY
```

### 2.2 Create `.env.test` (Test)

Create `/path/to/your/project/.env.test`:

```bash
# Test Environment
VITE_SUPABASE_URL_TEST=https://YOUR_TEST_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY_TEST=eyJhbGc...YOUR_TEST_ANON_KEY
```

### 2.3 Create `.env.uat` (UAT)

Create `/path/to/your/project/.env.uat`:

```bash
# UAT Environment
VITE_SUPABASE_URL_UAT=https://YOUR_UAT_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY_UAT=eyJhbGc...YOUR_UAT_ANON_KEY
```

### 2.4 Create `.env.production` (Production)

Create `/path/to/your/project/.env.production`:

```bash
# Production Environment
VITE_SUPABASE_URL_PROD=https://YOUR_PROD_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=eyJhbGc...YOUR_PROD_ANON_KEY
```

### 2.5 Update `.gitignore`

Ensure your `.gitignore` includes:

```
# Environment files
.env
.env.local
.env.*.local
.env.development
.env.test
.env.uat
.env.production

# But keep the example file
!.env.example
```

### 2.6 Create `.env.example` Template

Create `/path/to/your/project/.env.example`:

```bash
# Environment Variable Template
# Copy this file and rename to .env.local, .env.test, etc.
# Fill in your actual values

# Development (default)
VITE_SUPABASE_URL=https://your-dev-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# Test
VITE_SUPABASE_URL_TEST=https://your-test-project-id.supabase.co
VITE_SUPABASE_ANON_KEY_TEST=your-test-anon-key

# UAT
VITE_SUPABASE_URL_UAT=https://your-uat-project-id.supabase.co
VITE_SUPABASE_ANON_KEY_UAT=your-uat-anon-key

# Production
VITE_SUPABASE_URL_PROD=https://your-prod-project-id.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=your-prod-anon-key
```

---

## Step 3: Deploy Edge Functions to Each Environment

### 3.1 Install Supabase CLI

If not already installed:

```bash
npm install -g supabase

# Or with homebrew on Mac
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### 3.2 Login to Supabase

```bash
supabase login
```

This will open a browser window. Authorize the CLI.

### 3.3 Deploy to Development

```bash
# Link to Development project
supabase link --project-ref YOUR_DEV_PROJECT_ID

# Set environment variables (these are for the Edge Function server)
supabase secrets set SUPABASE_URL=https://YOUR_DEV_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_DEV_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY

# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Verify deployment
supabase functions list
```

Expected output:
```
┌──────────────────────────┬─────────┬──────────────────────┐
│ NAME                     │ STATUS  │ UPDATED AT           │
├──────────────────────────┼─────────┼──────────────────────┤
│ make-server-6fcaeea3     │ ACTIVE  │ 2026-02-06 12:34:56  │
└──────────────────────────┴─────────┴──────────────────────┘
```

### 3.4 Deploy to Test

```bash
# Unlink from Development
supabase unlink

# Link to Test project
supabase link --project-ref YOUR_TEST_PROJECT_ID

# Set environment variables for Test
supabase secrets set SUPABASE_URL=https://YOUR_TEST_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_TEST_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_TEST_ANON_KEY

# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Verify
supabase functions list
```

### 3.5 Deploy to UAT

```bash
# Unlink from Test
supabase unlink

# Link to UAT project
supabase link --project-ref YOUR_UAT_PROJECT_ID

# Set environment variables for UAT
supabase secrets set SUPABASE_URL=https://YOUR_UAT_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_UAT_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_UAT_ANON_KEY

# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Verify
supabase functions list
```

### 3.6 Deploy to Production

```bash
# Unlink from UAT
supabase unlink

# Link to Production project
supabase link --project-ref YOUR_PROD_PROJECT_ID

# Set environment variables for Production
supabase secrets set SUPABASE_URL=https://YOUR_PROD_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY

# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Verify
supabase functions list
```

---

## Step 4: Test Each Environment

### 4.1 Test Health Endpoints

**Development:**
```bash
curl https://YOUR_DEV_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_DEV_ANON_KEY"
```

**Test:**
```bash
curl https://YOUR_TEST_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_TEST_ANON_KEY"
```

**UAT:**
```bash
curl https://YOUR_UAT_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_UAT_ANON_KEY"
```

**Production:**
```bash
curl https://YOUR_PROD_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_PROD_ANON_KEY"
```

Expected response for all:
```json
{"status":"ok"}
```

### 4.2 Test in Application

1. Open your app at `/admin/login`
2. Use the environment selector dropdown
3. Switch to each environment
4. Check the "Backend Connection Status" indicator
5. Should show green checkmark for each environment

---

## Step 5: Create Admin Accounts

You'll need to create admin accounts in each environment.

### 5.1 Using the Backend API

**Development:**
```bash
curl -X POST https://YOUR_DEV_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEV_ANON_KEY" \
  -d '{
    "email": "admin-dev@example.com",
    "password": "YourSecurePassword123!",
    "username": "Admin Dev",
    "role": "super_admin"
  }'
```

**Test:**
```bash
curl -X POST https://YOUR_TEST_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_ANON_KEY" \
  -d '{
    "email": "admin-test@example.com",
    "password": "YourSecurePassword123!",
    "username": "Admin Test",
    "role": "super_admin"
  }'
```

**UAT:**
```bash
curl -X POST https://YOUR_UAT_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_UAT_ANON_KEY" \
  -d '{
    "email": "admin-uat@example.com",
    "password": "YourSecurePassword123!",
    "username": "Admin UAT",
    "role": "super_admin"
  }'
```

**Production:**
```bash
curl -X POST https://YOUR_PROD_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROD_ANON_KEY" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourVerySecurePassword123!",
    "username": "Admin",
    "role": "super_admin"
  }'
```

### 5.2 Verify Login

1. Go to `/admin/login`
2. Select "Development" environment
3. Log in with `admin-dev@example.com`
4. Should successfully log in and see dashboard

Repeat for each environment to verify.

---

## Step 6: Configure Database Tables (Optional)

Each environment starts with an empty database except for the KV store table which is auto-created.

### 6.1 Let Database Seed Run

The backend automatically seeds initial data on first startup:
- Creates the `kv_store_6fcaeea3` table
- Adds sample clients and sites (from `seed.tsx`)
- Sets up initial configuration

### 6.2 Verify Database

In each Supabase project:
1. Go to **Table Editor**
2. You should see: `kv_store_6fcaeea3`
3. Click on it to view seeded data

---

## Step 7: Configure CORS (Production Only)

For production, you should restrict CORS to your domain.

### 7.1 Set ALLOWED_ORIGINS in Production

```bash
# Link to production project
supabase link --project-ref YOUR_PROD_PROJECT_ID

# Set allowed origins (your production domain)
supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redeploy function
supabase functions deploy make-server-6fcaeea3
```

---

## Quick Reference: Environment Configuration

### Your Environment Setup

| Environment  | Project ID | Anon Key | Admin Email |
|-------------|-----------|----------|-------------|
| Development | _________ | ________ | admin-dev@example.com |
| Test        | _________ | ________ | admin-test@example.com |
| UAT         | _________ | ________ | admin-uat@example.com |
| Production  | _________ | ________ | admin@yourcompany.com |

### Edge Function URLs

- **Development**: `https://[dev-id].supabase.co/functions/v1/make-server-6fcaeea3`
- **Test**: `https://[test-id].supabase.co/functions/v1/make-server-6fcaeea3`
- **UAT**: `https://[uat-id].supabase.co/functions/v1/make-server-6fcaeea3`
- **Production**: `https://[prod-id].supabase.co/functions/v1/make-server-6fcaeea3`

---

## Automation Scripts

To make future deployments easier, you can create deployment scripts.

### Script: `deploy-all-environments.sh`

Create this file in your project root:

```bash
#!/bin/bash

echo "🚀 Deploying to all environments..."

# Development
echo "📦 Deploying to Development..."
supabase unlink -f
supabase link --project-ref YOUR_DEV_PROJECT_ID
supabase functions deploy make-server-6fcaeea3
echo "✅ Development deployed"

# Test
echo "📦 Deploying to Test..."
supabase unlink -f
supabase link --project-ref YOUR_TEST_PROJECT_ID
supabase functions deploy make-server-6fcaeea3
echo "✅ Test deployed"

# UAT
echo "📦 Deploying to UAT..."
supabase unlink -f
supabase link --project-ref YOUR_UAT_PROJECT_ID
supabase functions deploy make-server-6fcaeea3
echo "✅ UAT deployed"

# Production (with confirmation)
echo "📦 Ready to deploy to Production..."
read -p "Deploy to Production? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
  supabase unlink -f
  supabase link --project-ref YOUR_PROD_PROJECT_ID
  supabase functions deploy make-server-6fcaeea3
  echo "✅ Production deployed"
else
  echo "⏭️  Skipped Production"
fi

echo "🎉 All deployments complete!"
```

Make it executable:
```bash
chmod +x deploy-all-environments.sh
```

Use it:
```bash
./deploy-all-environments.sh
```

---

## Troubleshooting

### Issue: "Project not found"

**Solution**: Double-check your project ref ID. Get it from:
- Supabase Dashboard > Settings > General > Reference ID

### Issue: "Function already exists"

**Solution**: This is normal. The deploy command updates the existing function.

### Issue: "Authentication failed"

**Solution**: Re-login to Supabase CLI:
```bash
supabase logout
supabase login
```

### Issue: "Secrets not set"

**Solution**: Verify secrets are set:
```bash
supabase secrets list
```

Should show: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

---

## Next Steps

After completing this setup:

1. ✅ Test login in each environment
2. ✅ Create test data in Development
3. ✅ Run QA tests in Test environment
4. ✅ User acceptance testing in UAT
5. ✅ Deploy to Production when ready
6. 📊 Set up monitoring for Production
7. 🔐 Configure production security settings
8. 📧 Set up email service for password resets

---

**Setup Complete!** 🎉

You now have 4 isolated environments, each with:
- ✅ Separate Supabase project
- ✅ Deployed Edge Function
- ✅ Independent database
- ✅ Admin account
- ✅ Full data isolation

---

**Last Updated**: February 6, 2026  
**Version**: 1.0
