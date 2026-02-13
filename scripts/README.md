# JALA2 Deployment Scripts

Automated deployment scripts for JALA2 backend and frontend.

---

## 📋 Available Scripts

### **Full-Stack Deployment**

#### `deploy-full-stack.sh` ⭐ **RECOMMENDED**
**Complete deployment of both backend and frontend.**

```bash
# Deploy to Development
./scripts/deploy-full-stack.sh dev

# Deploy to Production
./scripts/deploy-full-stack.sh prod
```

**What it does:**
1. ✅ Checks prerequisites (Node.js, npm, Supabase CLI)
2. ✅ Links to Supabase project
3. ✅ Sets environment secrets
4. ✅ Deploys backend Edge Function
5. ✅ Tests backend health
6. ✅ Installs frontend dependencies
7. ✅ Runs TypeScript type check
8. ✅ Runs tests
9. ✅ Builds frontend
10. ✅ Provides deployment options

**Time:** ~5-10 minutes

---

### **Backend-Only Deployment**

#### `deploy-backend.sh`
**Deploy only the Supabase Edge Function (backend).**

```bash
# Deploy backend to Development
./scripts/deploy-backend.sh dev

# Deploy backend to Production
./scripts/deploy-backend.sh prod
```

**What it does:**
1. ✅ Links to Supabase project
2. ✅ Deploys Edge Function: `make-server-6fcaeea3`
3. ✅ Provides test commands

**Time:** ~2 minutes

**Use when:**
- You only updated backend code
- Frontend is already deployed
- Quick backend updates

---

### **Frontend-Only Deployment**

#### `deploy-frontend.sh`
**Build the frontend for deployment.**

```bash
# Build frontend for Development
./scripts/deploy-frontend.sh dev

# Build frontend for Production
./scripts/deploy-frontend.sh prod
```

**What it does:**
1. ✅ Installs dependencies
2. ✅ Runs TypeScript type check
3. ✅ Runs tests
4. ✅ Builds frontend (`dist/`)
5. ✅ Shows deployment options

**Time:** ~3-5 minutes

**Use when:**
- You only updated frontend code
- Backend is already deployed
- Testing builds locally

---

### **Platform-Specific Deployment**

#### `deploy-to-vercel.sh`
**Deploy frontend to Vercel.**

```bash
# Deploy to Vercel preview
./scripts/deploy-to-vercel.sh dev

# Deploy to Vercel production
./scripts/deploy-to-vercel.sh prod
```

**Prerequisites:**
```bash
npm install -g vercel
vercel login
```

---

#### `deploy-to-netlify.sh`
**Deploy frontend to Netlify.**

```bash
# Deploy to Netlify draft
./scripts/deploy-to-netlify.sh dev

# Deploy to Netlify production
./scripts/deploy-to-netlify.sh prod
```

**Prerequisites:**
```bash
npm install -g netlify-cli
netlify login
```

---

### **Legacy Scripts**

#### `deploy-to-environment.sh`
**Original backend deployment script (still supported).**

```bash
./scripts/deploy-to-environment.sh [dev|prod]
```

Similar to `deploy-backend.sh` but with more detailed output and secret management.

---

### **User Management**

#### `create-admin-user.sh`
**Create admin users in any environment.**

```bash
./scripts/create-admin-user.sh
```

**Interactive prompts:**
- Environment selection (dev/prod)
- Name
- Email
- Password

**Time:** ~2 minutes

---

## 🚀 Quick Start Guide

### **First Time Setup (Both Environments)**

```bash
# 1. Deploy Development (full stack)
./scripts/deploy-full-stack.sh dev

# 2. Deploy Production (full stack)
./scripts/deploy-full-stack.sh prod

# 3. Create admin users
./scripts/create-admin-user.sh  # For Development
./scripts/create-admin-user.sh  # For Production
```

**Total Time:** ~30 minutes

---

### **Update Backend Only**

```bash
# Update Development backend
./scripts/deploy-backend.sh dev

# Update Production backend
./scripts/deploy-backend.sh prod
```

**Time:** ~2 minutes per environment

---

### **Update Frontend Only**

```bash
# Build and deploy Development frontend
./scripts/deploy-frontend.sh dev
./scripts/deploy-to-vercel.sh dev  # or netlify

# Build and deploy Production frontend
./scripts/deploy-frontend.sh prod
./scripts/deploy-to-vercel.sh prod  # or netlify
```

**Time:** ~5 minutes per environment

---

### **Update Both (Full Stack)**

```bash
# Deploy everything to Development
./scripts/deploy-full-stack.sh dev

# Deploy everything to Production
./scripts/deploy-full-stack.sh prod
```

**Time:** ~10 minutes per environment

---

## 🔧 Common Workflows

### **Development Workflow**

```bash
# 1. Make code changes
# 2. Test locally
npm run dev

# 3. Deploy to Development
./scripts/deploy-full-stack.sh dev

# 4. Test in Development environment
# 5. If good, deploy to Production
./scripts/deploy-full-stack.sh prod
```

---

### **Backend Changes Only**

```bash
# 1. Edit backend code in /supabase/functions/server/
# 2. Test locally (if possible)

# 3. Deploy to Development
./scripts/deploy-backend.sh dev

# 4. Test backend
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer [ANON_KEY]"

# 5. If good, deploy to Production
./scripts/deploy-backend.sh prod
```

---

### **Frontend Changes Only**

```bash
# 1. Edit frontend code in /src/
# 2. Test locally
npm run dev

# 3. Build and deploy to Development
./scripts/deploy-frontend.sh dev
./scripts/deploy-to-vercel.sh dev

# 4. Test frontend at preview URL

# 5. If good, deploy to Production
./scripts/deploy-frontend.sh prod
./scripts/deploy-to-vercel.sh prod
```

---

### **Emergency Hotfix**

```bash
# 1. Fix the issue
# 2. Deploy immediately to Production

# If backend fix:
./scripts/deploy-backend.sh prod

# If frontend fix:
./scripts/deploy-frontend.sh prod
./scripts/deploy-to-vercel.sh prod

# 3. Verify fix
# 4. Deploy to Development for consistency
```

---

## 📊 Script Comparison

| Script | Backend | Frontend | Tests | Build | Deploy | Time |
|--------|---------|----------|-------|-------|--------|------|
| `deploy-full-stack.sh` | ✅ | ✅ | ✅ | ✅ | Backend | 10min |
| `deploy-backend.sh` | ✅ | ❌ | ❌ | ❌ | Backend | 2min |
| `deploy-frontend.sh` | ❌ | ✅ | ✅ | ✅ | No | 5min |
| `deploy-to-vercel.sh` | ❌ | ✅ | ✅ | ✅ | Vercel | 7min |
| `deploy-to-netlify.sh` | ❌ | ✅ | ✅ | ✅ | Netlify | 7min |

---

## 🌍 Environment Configuration

### **Development**
- Project ID: `wjfcqqrlhwdvvjmefxky`
- Backend: `https://wjfcqqrlhwdvvjmefxky.supabase.co`
- Frontend: [Your Vercel/Netlify URL]

### **Production**
- Project ID: `lmffeqwhrnbsbhdztwyv`
- Backend: `https://lmffeqwhrnbsbhdztwyv.supabase.co`
- Frontend: [Your Vercel/Netlify URL]

---

## 🔧 Troubleshooting

### Permission Denied

**Error:**
```
-bash: ./scripts/deploy-to-environment.sh: Permission denied
```

**Solution:**
```bash
chmod +x scripts/*.sh
```

### Supabase CLI Not Found

**Error:**
```
✗ Supabase CLI not found!
```

**Solution:**
```bash
npm install -g supabase
```

### Can't Link to Project

**Error:**
```
Failed to link to project
```

**Solutions:**
```bash
# 1. Login first
supabase login

# 2. Check project ID is correct
supabase projects list

# 3. Try linking manually
supabase link --project-ref YOUR_PROJECT_ID
```

### Health Check Fails

**Error:**
```
✗ Health check failed! Backend may not be responding
```

**Solutions:**
```bash
# 1. Check function deployed
supabase functions list

# 2. Redeploy
supabase functions deploy make-server-6fcaeea3

# 3. Check logs
supabase functions logs make-server-6fcaeea3

# 4. Test manually
curl https://PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer ANON_KEY"
```

### Admin User Creation Fails

**Common Issues:**

1. **Email already exists**
   - Use different email
   - Or log in with existing credentials

2. **Password too weak**
   - Must be 8+ characters
   - Mix of uppercase, lowercase, numbers, symbols

3. **Edge Function not deployed**
   - Deploy first: `supabase functions deploy make-server-6fcaeea3`

4. **Wrong Anon Key**
   - Get correct key from Supabase Dashboard
   - Settings → API → Project API keys

---

## 📊 Script Features

### Security
- ✅ Credentials never logged
- ✅ Passwords hidden during input
- ✅ Service Role Key properly secured
- ✅ Optional credential file (user choice)
- ✅ Warnings about credential safety

### Error Handling
- ✅ Validates all inputs
- ✅ Checks prerequisites
- ✅ Helpful error messages
- ✅ Suggests solutions
- ✅ Graceful failures

### User Experience
- ✅ Colored output (info/success/error/warning)
- ✅ Progress indicators
- ✅ Clear prompts
- ✅ Summary at end
- ✅ Next steps guidance

### Logging
- ✅ Deployment logs saved
- ✅ Timestamped filenames
- ✅ Complete audit trail
- ✅ Easy to review
- ✅ Share with team

---

## 📁 Directory Structure

```
scripts/
├── deploy-full-stack.sh       # Full stack deployment
├── deploy-backend.sh          # Backend only deployment
├── deploy-frontend.sh         # Frontend only deployment
├── deploy-to-vercel.sh        # Deploy frontend to Vercel
├── deploy-to-netlify.sh       # Deploy frontend to Netlify
├── create-admin-user.sh       # Admin user creation
├── test-environment.sh        # Test configuration (future)
└── README.md                  # This file

deployments/                   # Created automatically
├── dev-deployment-20260206-143000.log
└── prod-deployment-20260206-144500.log

admin-credentials-*.txt        # Created if user chooses to save
```

---

## 🎨 Color Codes

Scripts use ANSI color codes for better readability:

- 🔵 **Blue (ℹ)**: Information messages
- 🟢 **Green (✓)**: Success messages
- 🔴 **Red (✗)**: Error messages
- 🟡 **Yellow (⚠)**: Warning messages

---

## 💡 Pro Tips

### Tip 1: Keep Logs
Deployment logs in `deployments/` folder are useful for:
- Auditing deployments
- Troubleshooting issues
- Team documentation
- Compliance records

### Tip 2: Credential Management
For the credential files the scripts can create:
- Save to secure location immediately
- Delete from project folder
- Add `admin-credentials-*.txt` to `.gitignore`
- Use password manager

### Tip 3: Automate Further
You can create your own scripts building on these:
```bash
#!/bin/bash
# deploy-all.sh - Deploy both environments

./scripts/deploy-to-environment.sh dev
./scripts/deploy-to-environment.sh prod
./scripts/create-admin-user.sh
```

### Tip 4: Test Before Production
Always test scripts with Development first:
```bash
# Test with Dev first
./scripts/deploy-to-environment.sh dev

# If successful, deploy Prod
./scripts/deploy-to-environment.sh prod
```

---

## 📚 Related Documentation

- **`/OPTION_B_START_HERE.md`** - Complete deployment guide
- **`/QUICK_START_OPTION_B.md`** - Quick start overview
- **`/FULL_DEPLOYMENT_GUIDE.md`** - Detailed step-by-step
- **`/ENVIRONMENT_TROUBLESHOOTING.md`** - Problem solving

---

## 🆘 Getting Help

### Check Script Output
Scripts provide detailed error messages. Read them carefully!

### Manual Commands
You can always run Supabase commands manually:
```bash
supabase link --project-ref PROJECT_ID
supabase secrets set KEY=VALUE
supabase functions deploy FUNCTION_NAME
```

### Test Health Endpoint
```bash
curl https://PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer ANON_KEY"
```

### Check Logs
```bash
supabase functions logs make-server-6fcaeea3
```

---

## ✅ Quick Reference

### Deploy Development
```bash
./scripts/deploy-full-stack.sh dev
```

### Deploy Production
```bash
./scripts/deploy-full-stack.sh prod
```

### Create Admin User
```bash
./scripts/create-admin-user.sh
```

### Make Scripts Executable
```bash
chmod +x scripts/*.sh
```

### View Deployment Logs
```bash
cat deployments/dev-deployment-*.log
```

---

**Happy Deploying!** 🚀

These scripts are designed to make your deployment workflow smooth and error-free. If you encounter any issues, check the error messages carefully - they're designed to guide you to the solution!

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0