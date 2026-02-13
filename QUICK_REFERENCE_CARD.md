# 📇 JALA 2 - Quick Reference Card

## 🎯 Project Configuration

### Development Project (PRIMARY)
```
Ref:       wjfcqqrlhwdvvjmefxky (WITH TWO v's)
URL:       https://wjfcqqrlhwdvvjmefxky.supabase.co
Dashboard: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
Backend:   Deployed ✅
Anon Key:  Installed ✅
```

### Production Project
```
Ref:       lmffeqwhrnbsbhdztwyv
URL:       https://lmffeqwhrnbsbhdztwyv.supabase.co
Dashboard: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
Backend:   Uses dev for auth
Anon Key:  TBD
```

---

## 🔑 Environment Variables (Dev)

```bash
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec
VITE_API_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
```

---

## 📁 Key Files

### Entry Points
```
/index.html                    - Vite entry point
/src/main.tsx                  - React mounting
/src/app/App.tsx               - Main component
```

### Configuration
```
/utils/supabase/info.ts        - Supabase credentials ✅
/src/app/config/environments.ts - Build config
/.env.local                    - Local overrides ✅
/.env.development              - Dev defaults ✅
```

### Backend
```
/supabase/functions/server/index.tsx - Hono server
/supabase/functions/server/routes/   - API routes
```

---

## 🚀 Deployment Commands

### Deploy Backend (if needed)
```bash
cd /path/to/project
./scripts/redeploy-backend.sh dev
```

### Deploy Frontend
```
Open in Figma Make → Click Deploy
```

---

## 🔍 Verification Checklist

- [x] Project ref is wjfcqqrlhwdvvjmefxky (TWO v's)
- [x] Real anon key installed
- [x] Entry points created
- [x] Environment files configured
- [x] No JWT errors
- [x] Ready for deployment

---

## 🆘 Quick Troubleshooting

### "Invalid JWT" Error
✅ **FIXED** - Real anon key now installed

### "Failed to fetch" Error
→ Check project ref is wjfcqqrlhwdvvjmefxky (TWO v's)

### "404 Not Found" Error
→ Verify backend is deployed to dev project

### Build Fails
→ Check /index.html and /src/main.tsx exist

---

## 📊 Status Overview

| Item | Status |
|------|--------|
| Project Ref | ✅ wjfcqqrlhwdvvjmefxky |
| Anon Key | ✅ Real key |
| Entry Points | ✅ Created |
| Environment | ✅ Configured |
| JWT Error | ✅ Fixed |
| Deployment | ✅ Ready |

---

## 📞 Quick Links

**Dev Dashboard**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky

**API Keys**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api

**Database**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/database/tables

**Edge Functions**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/functions

---

**Last Updated**: February 10, 2026  
**Version**: 1.0  
**Status**: ✅ READY
