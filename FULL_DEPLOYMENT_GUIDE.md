# 🚀 Full Production Deployment Guide

Complete step-by-step guide to set up separate Development and Production environments.

**Estimated Time**: 15-20 minutes  
**Goal**: Two isolated Supabase projects with deployed Edge Functions

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Supabase account created ([supabase.com](https://supabase.com))
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] CLI logged in (`supabase login`)
- [ ] Terminal/command line open
- [ ] Admin access to JALA2 application

---

## 🎯 Step 1: Create Development Project (5 min)

### 1.1 Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   ```
   Organization: [Your Organization]
   Name: JALA2-Development
   Database Password: [Generate Strong Password - SAVE THIS!]
   Region: [Choose closest to your users]
   Plan: Free (or Pro if needed)
   ```
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 1.2 Get Project Credentials

Once project is ready:

1. Click **Settings** (gear icon in sidebar)
2. Click **API** section
3. **COPY AND SAVE** these values:

```bash
# Development Environment
PROJECT_ID: [shows in URL: abc123xyz]
PROJECT_URL: https://[PROJECT_ID].supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [long string]
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [different long string]
```

⚠️ **IMPORTANT**: Save these securely! You'll need them next.

---

## 🎯 Step 2: Create Production Project (5 min)

### 2.1 Create Project

1. Go back to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"** again
3. Fill in details:
   ```
   Organization: [Your Organization]
   Name: JALA2-Production
   Database Password: [Generate Different Strong Password - SAVE THIS!]
   Region: [Same region as Development]
   Plan: Free (upgrade to Pro for production later)
   ```
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 2.2 Get Project Credentials

Once project is ready:

1. Click **Settings** → **API**
2. **COPY AND SAVE** these values:

```bash
# Production Environment
PROJECT_ID: [different ID: xyz789abc]
PROJECT_URL: https://[PROJECT_ID].supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [long string]
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [different long string]
```

### 2.3 Organize Your Credentials

Create a temporary text file with this structure:

```bash
# DEVELOPMENT
DEV_PROJECT_ID=abc123xyz
DEV_URL=https://abc123xyz.supabase.co
DEV_ANON_KEY=eyJhbGci...
DEV_SERVICE_ROLE_KEY=eyJhbGci...

# PRODUCTION
PROD_PROJECT_ID=xyz789abc
PROD_URL=https://xyz789abc.supabase.co
PROD_ANON_KEY=eyJhbGci...
PROD_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## 🎯 Step 3: Deploy to Development (3 min)

### 3.1 Link to Development Project

Open terminal in your project directory and run:

```bash
# Link to Development project
supabase link --project-ref abc123xyz
# Replace abc123xyz with your actual DEV_PROJECT_ID
```

When prompted for database password, enter the password you set for Development project.

### 3.2 Set Development Secrets

```bash
# Set environment secrets for Development
supabase secrets set SUPABASE_URL=https://abc123xyz.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Optional: Set allowed origins
supabase secrets set ALLOWED_ORIGINS=*
```

Replace with your actual Development credentials!

### 3.3 Deploy Edge Function to Development

```bash
# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Should see output like:
# Deploying function make-server-6fcaeea3...
# Deployed function make-server-6fcaeea3 ✓
```

### 3.4 Test Development Deployment

```bash
# Test the health endpoint
curl https://abc123xyz.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_DEV_ANON_KEY"

# Should return:
# {"status":"ok"}
```

If you see `{"status":"ok"}`, Development is ready! ✅

---

## 🎯 Step 4: Deploy to Production (3 min)

### 4.1 Link to Production Project

```bash
# Unlink from Development first
supabase unlink

# Link to Production project
supabase link --project-ref xyz789abc
# Replace xyz789abc with your actual PROD_PROJECT_ID
```

When prompted for database password, enter the password you set for Production project.

### 4.2 Set Production Secrets

```bash
# Set environment secrets for Production
supabase secrets set SUPABASE_URL=https://xyz789abc.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Optional: Set allowed origins (restrict in production!)
supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

Replace with your actual Production credentials!

### 4.3 Deploy Edge Function to Production

```bash
# Deploy the Edge Function
supabase functions deploy make-server-6fcaeea3

# Should see output like:
# Deploying function make-server-6fcaeea3...
# Deployed function make-server-6fcaeea3 ✓
```

### 4.4 Test Production Deployment

```bash
# Test the health endpoint
curl https://xyz789abc.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_PROD_ANON_KEY"

# Should return:
# {"status":"ok"}
```

If you see `{"status":"ok"}`, Production is ready! ✅

---

## 🎯 Step 5: Configure in Admin UI (2 min)

Now configure both environments in your Admin UI:

### 5.1 Open Admin Panel

1. Go to your app: `/admin/login`
2. Log in with admin credentials
3. Click **"Environment Config"** in sidebar

### 5.2 Configure Development Environment

1. Click **Edit** (pencil icon) on Development card
2. Fill in the form:
   ```
   Environment Name: Development
   Label: DEV
   Description: Development environment for testing
   Badge Color: #10B981 (green - already set)
   
   Supabase Project URL: https://abc123xyz.supabase.co
   Anon (Public) Key: [Your DEV_ANON_KEY]
   ```
3. Click **"Update"**
4. Should see: ✅ "Environment updated successfully"

### 5.3 Configure Production Environment

1. Click **Edit** on Production card
2. Fill in the form:
   ```
   Environment Name: Production
   Label: PROD
   Description: Production environment - live data
   Badge Color: #EF4444 (red - already set)
   
   Supabase Project URL: https://xyz789abc.supabase.co
   Anon (Public) Key: [Your PROD_ANON_KEY]
   ```
3. Click **"Update"**
4. Should see: ✅ "Environment updated successfully"

---

## 🎯 Step 6: Test Connections (1 min)

### 6.1 Test Development

1. On Development card, click **"Test Connection"**
2. Should see: ✅ "Development environment is online!"
3. Status badge changes to **Active** (green)
4. "Last tested" timestamp appears

### 6.2 Test Production

1. On Production card, click **"Test Connection"**
2. Should see: ✅ "Production environment is online!"
3. Status badge changes to **Active** (green)
4. "Last tested" timestamp appears

---

## 🎯 Step 7: Verify Environment Switcher (1 min)

### 7.1 Check Deployment Environment Selector

1. Look at top-right of admin panel
2. Should see **"Deployment Environment"** dropdown
3. Current environment displayed (e.g., "DEV - Development")

### 7.2 Switch Environments

1. Click the environment dropdown
2. Select **"Production"**
3. Page should reload
4. Dropdown now shows **"PROD - Production"**
5. All data operations now use Production backend

### 7.3 Switch Back to Development

1. Click the environment dropdown again
2. Select **"Development"**
3. Page reloads
4. Back to Development environment ✅

---

## 🎯 Step 8: Create Admin Users in Both Environments

You need admin users in each environment since they're separate databases.

### 8.1 Create Development Admin

```bash
# Link to Development
supabase link --project-ref abc123xyz

# Run admin creation script
node scripts/create-admin-user.js

# Or use curl:
curl https://abc123xyz.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEV_ANON_KEY" \
  -d '{
    "email": "admin@jala2.com",
    "password": "SecurePassword123!",
    "username": "Admin User",
    "role": "super_admin"
  }'
```

### 8.2 Create Production Admin

```bash
# Link to Production
supabase link --project-ref xyz789abc

# Run admin creation script
node scripts/create-admin-user.js

# Or use curl:
curl https://xyz789abc.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROD_ANON_KEY" \
  -d '{
    "email": "admin@jala2.com",
    "password": "DifferentSecurePassword456!",
    "username": "Production Admin",
    "role": "super_admin"
  }'
```

---

## 🎯 Step 9: Seed Development Database (Optional)

### 9.1 Why Seed?

- Populates Development with test data
- Includes sample clients, sites, gifts, orders
- Makes testing easier
- Production starts empty (as it should)

### 9.2 Run Seed Script

The backend automatically seeds on first startup, but you can trigger manually:

```bash
# Development is already linked
curl https://abc123xyz.supabase.co/functions/v1/make-server-6fcaeea3/health

# This triggers the seed.tsx file on server startup
# Check logs in Supabase Dashboard → Edge Functions → Logs
```

### 9.3 Verify Seed Data

1. Log into Development admin panel
2. Go to **Client Management**
3. Should see sample clients: Acme Corp, TechStart Inc, Global Solutions
4. Go to **Site Management**
5. Should see sample sites for each client
6. Go to **Gift Management**
7. Should see sample gifts

---

## 🎯 Step 10: Final Verification Checklist

### Development Environment
- [ ] Project created in Supabase
- [ ] Edge Function deployed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Configured in Admin UI
- [ ] Test Connection shows "Active"
- [ ] Admin user created
- [ ] Can log into admin panel
- [ ] Seed data loaded

### Production Environment
- [ ] Project created in Supabase
- [ ] Edge Function deployed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Configured in Admin UI
- [ ] Test Connection shows "Active"
- [ ] Admin user created
- [ ] Can log into admin panel
- [ ] Database empty (ready for real data)

### Environment Switcher
- [ ] Dropdown visible in admin header
- [ ] Shows current environment
- [ ] Can switch between Dev/Prod
- [ ] Page reloads on switch
- [ ] Data isolated between environments

---

## 🎉 Success! You're Production Ready

You now have:

✅ **Two Isolated Environments**
- Development: For testing new features
- Production: For live data

✅ **Deployed Edge Functions**
- Both environments have backend API
- Health checks passing
- Ready to handle requests

✅ **Admin UI Configuration**
- Both environments configured
- Connection tests passing
- Environment switcher working

✅ **Admin Access**
- Admin users in both environments
- Can manage clients, sites, gifts
- Can process orders

✅ **Data Isolation**
- Test data in Development
- Clean slate in Production
- No cross-contamination

---

## 📊 Environment Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                          │
├─────────────────────────────────────────────────────────┤
│ Project: JALA2-Development                              │
│ URL: https://abc123xyz.supabase.co                      │
│ Purpose: Testing, Development, Staging                  │
│ Data: Sample/Test Data                                  │
│ Updates: Frequent, experimental                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                           │
├─────────────────────────────────────────────────────────┤
│ Project: JALA2-Production                               │
│ URL: https://xyz789abc.supabase.co                      │
│ Purpose: Live, Real Data                                │
│ Data: Customer Data                                     │
│ Updates: Careful, tested                                │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Next Steps

### Daily Development Workflow

1. **Start in Development**
   - Switch to Development environment
   - Test new features
   - Make changes safely
   - Use sample data

2. **Test Thoroughly**
   - Verify all functionality works
   - Check edge cases
   - Review with team

3. **Deploy to Production**
   - Switch to Production environment
   - Deploy tested changes
   - Monitor closely
   - Keep backups

### Best Practices

✅ **DO:**
- Always test in Development first
- Keep Production data backed up
- Document changes
- Use environment switcher
- Monitor Production logs

❌ **DON'T:**
- Test in Production
- Mix up environments
- Skip Development testing
- Delete Production data without backup
- Ignore error logs

---

## 🔧 Maintenance Commands

### Check Deployment Status

```bash
# List all functions in current project
supabase functions list

# View function logs
supabase functions logs make-server-6fcaeea3

# Check secrets
supabase secrets list
```

### Redeploy Edge Function

```bash
# If you need to update the Edge Function
supabase functions deploy make-server-6fcaeea3

# Redeploy to both environments:
# 1. Link to Dev, deploy
# 2. Link to Prod, deploy
```

### Backup Production Database

```bash
# Link to Production
supabase link --project-ref xyz789abc

# Generate backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore if needed
supabase db reset --db-url "postgresql://..."
```

---

## 📞 Need Help?

### Common Issues

**Can't link to project:**
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
# Enter database password when prompted
```

**Health check fails:**
```bash
# Check function deployed
supabase functions list

# Check secrets set
supabase secrets list

# Redeploy
supabase functions deploy make-server-6fcaeea3
```

**Can't switch environments:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check environment is configured in Admin UI
- Verify credentials are correct

### Support Resources

- **Documentation**: Check `/ENVIRONMENT_TROUBLESHOOTING.md`
- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Supabase Discord**: https://discord.supabase.com

---

## 🎯 Quick Reference

### Development
```bash
Project ID: abc123xyz
URL: https://abc123xyz.supabase.co
Badge: 🟢 DEV (Green)
Purpose: Testing & Development
```

### Production
```bash
Project ID: xyz789abc
URL: https://xyz789abc.supabase.co
Badge: 🔴 PROD (Red)
Purpose: Live Data
```

### Deployment Commands
```bash
# Link to Dev
supabase link --project-ref abc123xyz

# Link to Prod
supabase link --project-ref xyz789abc

# Deploy
supabase functions deploy make-server-6fcaeea3

# Test
curl https://PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

**Congratulations! Your production environment is ready!** 🎉

You can now safely develop and test features in Development, then deploy to Production with confidence knowing your data is completely isolated.

**Estimated Total Time**: ✅ Completed in ~15-20 minutes

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
