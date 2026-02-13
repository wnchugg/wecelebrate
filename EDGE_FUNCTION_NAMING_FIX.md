# Edge Function Naming Fix - CRITICAL ⚠️

## 🐛 **THE PROBLEM**

You've discovered a **CRITICAL NAMING MISMATCH**:

### Current State:
```
Directory:    /supabase/functions/server/
Deploys as:   .../functions/v1/server/
Routes in code: /make-server-6fcaeea3/health
Actual URL:   .../functions/v1/server/make-server-6fcaeea3/health ❌ WRONG!
```

### Expected State:
```
Directory:    /supabase/functions/make-server-6fcaeea3/
Deploys as:   .../functions/v1/make-server-6fcaeea3/
Routes in code: /health
Actual URL:   .../functions/v1/make-server-6fcaeea3/health ✅ CORRECT!
```

---

## 🎯 **THE SOLUTION**

You have **2 options**:

### **Option A: Rename Directory (Recommended)**
Rename `/supabase/functions/server/` to `/supabase/functions/make-server-6fcaeea3/`

**Pros:**
- Matches Figma Make naming conventions
- Other deployment scripts already use this name
- Frontend code expects this name

**Cons:**
- Need to move all files
- Figma Make may not support directory renaming easily

### **Option B: Remove Route Prefixes**
Remove `/make-server-6fcaeea3` prefix from all routes in the code

**Pros:**
- No directory changes needed
- Simpler fix

**Cons:**
- Breaks Figma Make conventions
- Frontend code needs updates
- Other scripts need updates

---

## ✅ **RECOMMENDED: Option A**

Since most of your deployment scripts already reference `make-server-6fcaeea3`, let's rename the directory.

### **How Supabase Edge Functions Work:**

When you have:
```
/supabase/functions/my-function/index.ts
```

And deploy with:
```bash
supabase functions deploy my-function
```

The URL becomes:
```
https://PROJECT.supabase.co/functions/v1/my-function/{routes}
```

### **Your Routes Should Be:**

In `index.tsx`:
```typescript
// Before (with prefix):
app.get("/make-server-6fcaeea3/health", ...)  ❌

// After (without prefix):
app.get("/health", ...)  ✅
```

---

## 🔧 **QUICK FIX**

Since Figma Make doesn't easily support renaming directories, let's fix this differently:

### **Keep directory as `/supabase/functions/server/`**
### **BUT: Remove the `/make-server-6fcaeea3` prefix from ALL routes**
### **AND: Update all scripts to deploy `server` (not `make-server-6fcaeea3`)**

This way:
- Supabase deploys the function as `server`
- Routes like `/health` work correctly
- URL becomes: `.../functions/v1/server/health` ✅

---

## 📝 **FILES THAT NEED UPDATING**

### **1. Backend Routes** (Remove `/make-server-6fcaeea3` prefix):
- `/supabase/functions/server/index.tsx` - All `app.get()`, `app.post()`, etc.

### **2. Deployment Scripts** (Already fixed to use `make-server-6fcaeea3`):
- ✅ `/scripts/deploy-full-stack.sh` - JUST FIXED
- ✅ `/scripts/deploy-backend.sh` - JUST FIXED  
- ✅ `/scripts/deploy-to-environment.sh` - Already correct
- ✅ `/scripts/deploy-environment.sh` - Already correct

### **3. Frontend API Calls:**
- Check all frontend files that call backend endpoints
- Update from `/make-server-6fcaeea3/` to `/server/`

---

## 🎯 **DECISION NEEDED**

You need to choose:

### **Choice 1: Use `server` everywhere**
- Keep directory as `server`
- Remove `/make-server-6fcaeea3` from routes  
- Update frontend to call `/server/`
- Update scripts to deploy `server`

### **Choice 2: Use `make-server-6fcaeea3` everywhere** (RECOMMENDED)
- Ask me to remove the `/make-server-6fcaeea3` prefix from all routes
- Keep deployment scripts as-is (they already use `make-server-6fcaeea3`)
- Rename directory using Figma Make tools

---

## 📊 **CURRENT STATUS**

| Component | Current Name | Should Be |
|-----------|--------------|-----------|
| Directory | `server` | `make-server-6fcaeea3` |
| Deployment | ~~`server`~~ **FIXED** | `make-server-6fcaeea3` ✅ |
| Routes | `/make-server-6fcaeea3/health` | `/health` |
| Frontend | Calls `/make-server-6fcaeea3/` | Should call `/make-server-6fcaeea3/` |

---

## 🚀 **RECOMMENDED ACTION**

**Tell me which approach you prefer:**

1. **"Use server everywhere"** - I'll remove route prefixes and update scripts
2. **"Use make-server-6fcaeea3 everywhere"** - I'll help you rename the directory
3. **"Just make it work"** - I'll implement the quickest fix

---

**⚠️ This is blocking your deployment. Let's fix it now!**
