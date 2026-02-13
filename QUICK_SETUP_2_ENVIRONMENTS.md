# Quick Setup: 2 Environments (Dev + Prod)

Simplified guide for setting up just **Development** and **Production** environments to reduce costs.

---

## Why 2 Environments?

- **Development**: Safe space for coding, testing, and breaking things
- **Production**: Live environment with real data
- **Cost Savings**: Only pay for 2 Supabase projects instead of 4
- **Simpler**: Easier to manage and deploy

**Note**: Test and UAT options still appear in the UI but point to Development behind the scenes.

---

## 📋 Quick Setup Checklist

### Step 1: Create Supabase Projects (5 minutes)

**Development Project:**
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Click "New Project"
- [ ] Name: `JALA2-Development`
- [ ] Generate & save database password
- [ ] Choose closest region
- [ ] Wait ~2 minutes for setup

**Production Project:**
- [ ] Click "New Project" again
- [ ] Name: `JALA2-Production`
- [ ] Generate & save database password
- [ ] Choose same region as Dev
- [ ] Wait ~2 minutes for setup

### Step 2: Save Credentials

For each project, go to **Settings > API** and save:

**Development:**
```
Project URL: https://[your-dev-id].supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
Project Ref ID: [your-dev-id]
```

**Production:**
```
Project URL: https://[your-prod-id].supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
Project Ref ID: [your-prod-id]
```

### Step 3: Create Environment Files

**Create `.env.local` for Development:**
```bash
VITE_SUPABASE_URL=https://[your-dev-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...[your-dev-anon-key]
```

**Create `.env.production` for Production:**
```bash
VITE_SUPABASE_URL_PROD=https://[your-prod-id].supabase.co
VITE_SUPABASE_ANON_KEY_PROD=eyJhbGc...[your-prod-anon-key]
```

**Important**: Add these to `.gitignore`:
```
.env.local
.env.production
```

### Step 4: Deploy Edge Functions

**Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
```

**Deploy to Development:**
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy to dev
./scripts/deploy-environment.sh dev
```

Follow the prompts to set secrets:
```bash
supabase secrets set SUPABASE_URL=https://[your-dev-id].supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[your-dev-service-role-key]
supabase secrets set SUPABASE_ANON_KEY=[your-dev-anon-key]
```

**Deploy to Production:**
```bash
./scripts/deploy-environment.sh prod
```

Follow the prompts to set secrets:
```bash
supabase secrets set SUPABASE_URL=https://[your-prod-id].supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[your-prod-service-role-key]
supabase secrets set SUPABASE_ANON_KEY=[your-prod-anon-key]
```

### Step 5: Test Connectivity

```bash
# Test both environments
./scripts/test-environment.sh dev
./scripts/test-environment.sh prod

# Should see green checkmarks ✅ for both
```

### Step 6: Create Admin Accounts

**Development:**
```bash
./scripts/create-admin.sh dev

# When prompted:
Email: admin@example.com
Password: [secure password]
Username: Admin Dev
```

**Production:**
```bash
./scripts/create-admin.sh prod

# When prompted:
Email: admin@yourcompany.com
Password: [VERY secure password]
Username: Admin
```

**Save these credentials in your password manager!**

### Step 7: Test Login

1. Go to `/admin/login`
2. Select **Development** from dropdown
3. Log in with dev credentials
4. Verify you see the dashboard
5. Log out
6. Switch to **Production**
7. Log in with prod credentials
8. Verify separate database (no dev data)

---

## ✅ You're Done!

You should now have:
- ✅ 2 Supabase projects (Dev + Prod)
- ✅ Edge Functions deployed to both
- ✅ Admin accounts in each
- ✅ Environment switching working
- ✅ Separate databases for isolation

---

## 📖 What About Test & UAT?

The UI still shows **Test** and **UAT** options, but they currently point to Development:

- **Development** → Your dev project
- **Test** → Same as Development (shared database)
- **UAT** → Same as Development (shared database)
- **Production** → Your prod project

This means:
- Test/UAT are free (no extra projects)
- You can use them as "modes" in Development
- Later, you can add separate projects if needed

To add Test/UAT later:
1. Create new Supabase projects
2. Add environment variables: `VITE_SUPABASE_URL_TEST`, etc.
3. Deploy Edge Functions to them
4. They'll automatically become separate environments

---

## 🚀 Daily Workflow

### Developing New Features

```bash
# 1. Work in Development environment
#    - Select "Development" in UI
#    - Make your changes
#    - Test thoroughly

# 2. Deploy updated code to Dev
./scripts/deploy-environment.sh dev
./scripts/test-environment.sh dev

# 3. When ready for production
./scripts/deploy-environment.sh prod
./scripts/test-environment.sh prod
```

### Creating Test Data

**In Development:**
- Go to `/admin/login` → Select "Development"
- Log in with dev credentials
- Create clients, sites, products, orders
- Test the full flow

**In Production:**
- Only create real data
- Use actual client information
- Real employee data (when appropriate)

---

## 💰 Cost Comparison

### 4 Environments (Full Setup)
- 4 Supabase projects × $25/month = $100/month
- More complex to manage
- Better for large teams

### 2 Environments (Your Setup)
- 2 Supabase projects × $25/month = $50/month
- **Saves $50/month** 💰
- Perfect for small teams
- Can upgrade later

**Note**: Actual costs depend on your Supabase plan and usage.

---

## 🔄 Upgrading to 4 Environments Later

If you need Test/UAT in the future:

1. **Create new Supabase projects:**
   - JALA2-Test
   - JALA2-UAT

2. **Add environment variables:**
   ```bash
   # .env.test
   VITE_SUPABASE_URL_TEST=https://[test-id].supabase.co
   VITE_SUPABASE_ANON_KEY_TEST=[test-anon-key]
   
   # .env.uat
   VITE_SUPABASE_URL_UAT=https://[uat-id].supabase.co
   VITE_SUPABASE_ANON_KEY_UAT=[uat-anon-key]
   ```

3. **Deploy Edge Functions:**
   ```bash
   ./scripts/deploy-environment.sh test
   ./scripts/deploy-environment.sh uat
   ```

4. **Create admin accounts:**
   ```bash
   ./scripts/create-admin.sh test
   ./scripts/create-admin.sh uat
   ```

That's it! The system automatically detects the new environments.

---

## 🔧 Manual Setup (Without Scripts)

If you prefer to do it manually:

### Deploy Edge Function Manually

```bash
# Link to project
supabase link --project-ref [your-project-id]

# Set secrets
supabase secrets set SUPABASE_URL=https://[project-id].supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
supabase secrets set SUPABASE_ANON_KEY=[anon-key]

# Deploy
supabase functions deploy make-server-6fcaeea3

# Verify
supabase functions list
```

### Create Admin Account Manually

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [anon-key]" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!",
    "username": "Admin",
    "role": "super_admin"
  }'
```

### Test Health Check Manually

```bash
curl https://[project-id].supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer [anon-key]"
```

Expected: `{"status":"ok"}`

---

## 🐛 Troubleshooting

### "Failed to fetch"
```bash
# Check if Edge Function is deployed
supabase functions list

# Redeploy if needed
./scripts/deploy-environment.sh dev
```

### "Health check failed"
```bash
# Test manually
curl https://[your-dev-id].supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer [your-anon-key]"

# Check secrets are set
supabase link --project-ref [your-dev-id]
supabase secrets list
```

### "Cannot create admin"
```bash
# Check Edge Function is deployed
./scripts/test-environment.sh dev

# Try again
./scripts/create-admin.sh dev
```

### "Wrong environment selected"
- Clear browser data: `localStorage.clear()`
- Refresh page
- Select correct environment from dropdown

---

## 📊 Environment Summary

| Environment | Uses Project | When to Use |
|-------------|--------------|-------------|
| Development | Dev Project | Daily development, testing, experimenting |
| Test (Dev) | Dev Project | Testing features before production |
| UAT (Dev) | Dev Project | User acceptance testing |
| Production | Prod Project | Live data, real users |

---

## 🎯 Success Criteria

You're all set when:

- [x] 2 Supabase projects created
- [x] Edge Functions deployed to both
- [x] Health checks pass for both
- [x] Admin accounts created
- [x] Can log into Dev environment
- [x] Can log into Prod environment
- [x] Data is separate between Dev and Prod
- [x] Environment selector shows correct badges

---

## 📝 Quick Reference

### Commands
```bash
# Deploy
./scripts/deploy-environment.sh dev
./scripts/deploy-environment.sh prod

# Test
./scripts/test-environment.sh dev
./scripts/test-environment.sh prod

# Create admin
./scripts/create-admin.sh dev
./scripts/create-admin.sh prod
```

### URLs
- Development: `https://[dev-id].supabase.co`
- Production: `https://[prod-id].supabase.co`

### Admin Login
- Development: `admin@example.com`
- Production: `admin@yourcompany.com`

---

## 🎉 Next Steps

Now that your environments are set up:

1. **Start Developing**: Work in Development environment
2. **Test Features**: Use the full 6-step gift flow
3. **Create Clients**: Set up your first client and site
4. **Deploy to Production**: When ready for launch
5. **Monitor**: Keep an eye on both environments

---

**Setup Time**: ~20 minutes  
**Monthly Cost**: ~$50 (2 projects)  
**Upgrade Path**: Add Test/UAT anytime

**Ready to build!** 🚀

---

**Last Updated**: February 6, 2026  
**Version**: 2-Environment Setup
