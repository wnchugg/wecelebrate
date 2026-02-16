# Environment Setup Checklist

Quick reference checklist for setting up multiple Supabase environments.

---

## 📋 Pre-Setup Checklist

- [ ] Supabase account created
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Logged into Supabase CLI: `supabase login`
- [ ] Git repository set up with `.gitignore` including `.env*` files

---

## 🏗️ Create Supabase Projects

### Development Environment
- [ ] Create project: `JALA2-Development`
- [ ] Save Project URL: `______________________________`
- [ ] Save Anon Key: `______________________________`
- [ ] Save Service Role Key (secure!): `______________________________`
- [ ] Save Project Ref ID: `______________________________`

### Test Environment
- [ ] Create project: `JALA2-Test`
- [ ] Save Project URL: `______________________________`
- [ ] Save Anon Key: `______________________________`
- [ ] Save Service Role Key (secure!): `______________________________`
- [ ] Save Project Ref ID: `______________________________`

### UAT Environment
- [ ] Create project: `JALA2-UAT`
- [ ] Save Project URL: `______________________________`
- [ ] Save Anon Key: `______________________________`
- [ ] Save Service Role Key (secure!): `______________________________`
- [ ] Save Project Ref ID: `______________________________`

### Production Environment
- [ ] Create project: `JALA2-Production`
- [ ] Save Project URL: `______________________________`
- [ ] Save Anon Key: `______________________________`
- [ ] Save Service Role Key (secure!): `______________________________`
- [ ] Save Project Ref ID: `______________________________`

---

## 📝 Configure Environment Files

### .env.local (Development)
```bash
- [ ] Create file: .env.local
- [ ] Add: VITE_SUPABASE_URL=https://[dev-id].supabase.co
- [ ] Add: VITE_SUPABASE_ANON_KEY=[dev-anon-key]
- [ ] Verify file is in .gitignore
```

### .env.test
```bash
- [ ] Create file: .env.test
- [ ] Add: VITE_SUPABASE_URL_TEST=https://[test-id].supabase.co
- [ ] Add: VITE_SUPABASE_ANON_KEY_TEST=[test-anon-key]
- [ ] Verify file is in .gitignore
```

### .env.uat
```bash
- [ ] Create file: .env.uat
- [ ] Add: VITE_SUPABASE_URL_UAT=https://[uat-id].supabase.co
- [ ] Add: VITE_SUPABASE_ANON_KEY_UAT=[uat-anon-key]
- [ ] Verify file is in .gitignore
```

### .env.production
```bash
- [ ] Create file: .env.production
- [ ] Add: VITE_SUPABASE_URL_PROD=https://[prod-id].supabase.co
- [ ] Add: VITE_SUPABASE_ANON_KEY_PROD=[prod-anon-key]
- [ ] Verify file is in .gitignore
```

---

## 🚀 Deploy Edge Functions

### Make Scripts Executable
```bash
- [ ] Run: chmod +x scripts/*.sh
```

### Deploy to Development
```bash
- [ ] Link project: supabase link --project-ref [dev-ref-id]
- [ ] Set secret: supabase secrets set SUPABASE_URL=https://[dev-id].supabase.co
- [ ] Set secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[dev-service-key]
- [ ] Set secret: supabase secrets set SUPABASE_ANON_KEY=[dev-anon-key]
- [ ] Deploy: ./scripts/deploy-environment.sh dev
- [ ] Test: ./scripts/test-environment.sh dev
```

### Deploy to Test
```bash
- [ ] Unlink: supabase unlink -f
- [ ] Link project: supabase link --project-ref [test-ref-id]
- [ ] Set secret: supabase secrets set SUPABASE_URL=https://[test-id].supabase.co
- [ ] Set secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[test-service-key]
- [ ] Set secret: supabase secrets set SUPABASE_ANON_KEY=[test-anon-key]
- [ ] Deploy: ./scripts/deploy-environment.sh test
- [ ] Test: ./scripts/test-environment.sh test
```

### Deploy to UAT
```bash
- [ ] Unlink: supabase unlink -f
- [ ] Link project: supabase link --project-ref [uat-ref-id]
- [ ] Set secret: supabase secrets set SUPABASE_URL=https://[uat-id].supabase.co
- [ ] Set secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[uat-service-key]
- [ ] Set secret: supabase secrets set SUPABASE_ANON_KEY=[uat-anon-key]
- [ ] Deploy: ./scripts/deploy-environment.sh uat
- [ ] Test: ./scripts/test-environment.sh uat
```

### Deploy to Production
```bash
- [ ] Unlink: supabase unlink -f
- [ ] Link project: supabase link --project-ref [prod-ref-id]
- [ ] Set secret: supabase secrets set SUPABASE_URL=https://[prod-id].supabase.co
- [ ] Set secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[prod-service-key]
- [ ] Set secret: supabase secrets set SUPABASE_ANON_KEY=[prod-anon-key]
- [ ] Deploy: ./scripts/deploy-environment.sh prod
- [ ] Test: ./scripts/test-environment.sh prod
```

### Test All Environments
```bash
- [ ] Run: ./scripts/test-environment.sh all
- [ ] Verify all show green checkmarks ✅
```

---

## 👤 Create Admin Accounts

### Development
```bash
- [ ] Run: ./scripts/create-admin.sh dev
- [ ] Email: admin-dev@example.com (or custom)
- [ ] Password: [secure password - save it!]
- [ ] Username: Admin Dev
- [ ] Test login at /admin/login
```

### Test
```bash
- [ ] Run: ./scripts/create-admin.sh test
- [ ] Email: admin-test@example.com (or custom)
- [ ] Password: [secure password - save it!]
- [ ] Username: Admin Test
- [ ] Test login at /admin/login
```

### UAT
```bash
- [ ] Run: ./scripts/create-admin.sh uat
- [ ] Email: admin-uat@example.com (or custom)
- [ ] Password: [secure password - save it!]
- [ ] Username: Admin UAT
- [ ] Test login at /admin/login
```

### Production
```bash
- [ ] Run: ./scripts/create-admin.sh prod
- [ ] Email: admin@yourcompany.com
- [ ] Password: [VERY secure password - save it securely!]
- [ ] Username: Admin
- [ ] Test login at /admin/login
```

---

## ✅ Verification Checklist

### Frontend
- [ ] Open /admin/login
- [ ] See environment selector in top-right
- [ ] Switch to Development - shows DEV badge
- [ ] Switch to Test - shows TEST badge
- [ ] Switch to UAT - shows UAT badge
- [ ] Switch to Production - shows PROD badge
- [ ] Connection status shows green ✅ for all

### Login Testing
- [ ] Log into Development with dev credentials
- [ ] See admin dashboard
- [ ] Log out
- [ ] Switch to Test environment
- [ ] Log into Test with test credentials
- [ ] See admin dashboard
- [ ] Verify data is separate from Development
- [ ] Repeat for UAT and Production

### Password Manager
- [ ] Save credentials in Development
- [ ] Switch to Production
- [ ] Verify password manager doesn't suggest dev credentials
- [ ] Switch back to Development
- [ ] Verify password manager auto-fills dev credentials

---

## 🔒 Security Checklist

- [ ] Service Role Keys stored securely (NOT in .env files)
- [ ] All `.env*` files in `.gitignore`
- [ ] Strong passwords used for all admin accounts
- [ ] Production admin email is company email
- [ ] Production CORS will be restricted (set ALLOWED_ORIGINS)
- [ ] Admin credentials documented in password manager
- [ ] Different passwords for each environment

---

## 📚 Documentation Review

- [ ] Read: /MULTI_ENVIRONMENT_SETUP_GUIDE.md
- [ ] Read: /scripts/README.md
- [ ] Bookmark: /BACKEND_CONNECTION_TROUBLESHOOTING.md
- [ ] Review: /ENVIRONMENT_SYSTEM_GUIDE.md
- [ ] Check: /CODE_REVIEW_REPORT.md

---

## 🎯 Final Testing

### Development
- [ ] Health check passes
- [ ] Can log in
- [ ] Can create client
- [ ] Can create site
- [ ] Can view dashboard

### Test
- [ ] Health check passes
- [ ] Can log in
- [ ] Separate data from dev
- [ ] All features work

### UAT
- [ ] Health check passes
- [ ] Can log in
- [ ] Separate data from dev/test
- [ ] All features work

### Production
- [ ] Health check passes
- [ ] Can log in
- [ ] Separate data from other envs
- [ ] All features work
- [ ] Ready for live use

---

## 🚨 Troubleshooting Quick Reference

### If deployment fails:
```bash
# Check you're logged in
supabase login

# Verify you're linked to correct project
supabase projects list

# Check secrets are set
supabase secrets list

# Try redeploying
./scripts/deploy-environment.sh [env]
```

### If health check fails:
```bash
# Test manually
curl https://[project-id].supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer [anon-key]"

# Redeploy if needed
./scripts/deploy-environment.sh [env]
```

### If login fails:
```bash
# Verify admin account exists
# Go to Supabase Dashboard > Authentication > Users

# Try creating account again
./scripts/create-admin.sh [env]
```

---

## ✨ Success Criteria

You're done when:

- ✅ All 4 environments deployed
- ✅ All health checks pass
- ✅ Admin accounts created in each
- ✅ Can log in to each environment
- ✅ Data is isolated between environments
- ✅ Password manager works correctly
- ✅ Environment selector works
- ✅ Backend connection status shows green

---

## 📞 Need Help?

1. Run diagnostic: `./scripts/test-environment.sh all`
2. Check documentation in project root
3. Review Supabase dashboard for errors
4. Check browser console for frontend errors
5. Review Edge Function logs in Supabase

---

**Date Completed:** _______________  
**Completed By:** _______________  
**Notes:** 
```
_____________________________________________________
_____________________________________________________
_____________________________________________________
```

---

**Congratulations! 🎉**

Your multi-environment setup is complete! You now have:
- 4 isolated environments
- Automated deployment scripts
- Secure credential management
- Full environment switching capabilities

Ready to start developing! 🚀
