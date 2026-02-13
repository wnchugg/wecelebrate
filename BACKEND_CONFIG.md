# JALA 2 Backend Configuration

## ⚠️ IMPORTANT - DO NOT CHANGE THESE VALUES

This document defines the canonical backend configuration. All scripts and code must use these values.

---

## **✅ FILE EXTENSION FIX - COMPLETED**

**Problem:** Supabase Edge Functions require `.ts` files, NOT `.tsx` files.

**Solution Applied:**
- ✅ All imports updated to use `.ts` extensions (except protected `kv_store.tsx`)
- ✅ Created all necessary `.ts` files:
  - `/supabase/functions/server/kv_env.ts`
  - `/supabase/functions/server/security.ts`
  - `/supabase/functions/server/erp_integration.ts`
  - `/supabase/functions/server/erp_scheduler.ts`
  - `/supabase/functions/server/seed.ts`

**⚠️ CRITICAL: Manual Step Required**

You must manually copy index.tsx → index.ts:

1. Open `/supabase/functions/server/index.tsx` in file explorer
2. Select All (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Create new file `/supabase/functions/server/index.ts`
5. Paste (Ctrl+V / Cmd+V)
6. Save

Then deploy:
```bash
./deploy-dev.sh
```

---

## Directory Structure

```
/supabase/functions/server/
  ├── index.ts            (main Hono server) ← MUST BE .ts NOT .tsx
  ├── seed.ts
  ├── security.ts
  ├── kv_env.ts           ← environment-aware KV wrapper
  ├── kv_store.tsx        (protected - original KV functions)
  ├── erp_integration.ts
  └── erp_scheduler.ts
```

---

## Deployment Configuration

### Development Environment
- **Project ID:** `wjfcqqrlhwdvvjmefxky`
- **Function Directory:** `server`
- **Deploy Command:** `supabase functions deploy server --project-ref wjfcqqrlhwdvvjmefxky`

### Production Environment  
- **Project ID:** `lmffeqwhrnbsbhdztwyv`
- **Function Directory:** `server`
- **Deploy Command:** `supabase functions deploy server --project-ref lmffeqwhrnbsbhdztwyv`

---

## URL Structure

### Base URLs

**Development:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server
```

**Production:**
```
https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server
```

### Route Prefix (in code)

All routes in `/supabase/functions/server/index.tsx` use this prefix:
```
/make-server-6fcaeea3
```

### Full Endpoint URLs

**Development Example:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/health
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/auth/login
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/clients
```

**Production Example:**
```
https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server/make-server-6fcaeea3/health
https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server/make-server-6fcaeea3/auth/login
https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server/make-server-6fcaeea3/clients
```

---

## Authentication Headers

### Public Endpoints (bootstrap, login, signup)
```bash
Authorization: Bearer <SUPABASE_ANON_KEY>
```

### Protected Endpoints (all others)
```bash
Authorization: Bearer <SUPABASE_ANON_KEY>  # Required by Supabase platform
X-Access-Token: <USER_JWT_TOKEN>           # Validated by our code
```

**Why two headers?**
- Supabase Edge Functions platform requires `Authorization: Bearer <anon_key>` at the platform level
- Our custom JWT tokens are sent in `X-Access-Token` to avoid Supabase trying to validate them
- Public endpoints ignore `X-Access-Token`
- Protected endpoints validate `X-Access-Token` using our custom logic

---

## Environment Variables

Required in Supabase Dashboard → Settings → Edge Functions:

```
ALLOWED_ORIGINS=*
SEED_ON_STARTUP=false
SUPABASE_URL=<auto-provided>
SUPABASE_ANON_KEY=<auto-provided>
SUPABASE_SERVICE_ROLE_KEY=<auto-provided>
SUPABASE_DB_URL=<auto-provided>
```

---

## Testing Scripts

### Development Test Script
```bash
./auth-test.sh
```
Uses: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3`

### Production Test Script
```bash
./test-prod.sh
```
Uses: `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server/make-server-6fcaeea3`

---

## Quick Reference

| Component | Value |
|-----------|-------|
| Function Directory | `server` |
| Route Prefix | `/make-server-6fcaeea3` |
| Dev Project ID | `wjfcqqrlhwdvvjmefxky` |
| Prod Project ID | `lmffeqwhrnbsbhdztwyv` |
| Auth Header (Platform) | `Authorization: Bearer <anon_key>` |
| Auth Header (Custom) | `X-Access-Token: <user_jwt>` |

---

**Last Updated:** 2026-02-07
**Status:** ✅ VERIFIED AND LOCKED