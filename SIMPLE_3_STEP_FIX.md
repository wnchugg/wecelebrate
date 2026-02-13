# ⚡ 3-STEP FIX: Failed to fetch

## **Problem:**
```
[BackendHealthTest] Network error: TypeError: Failed to fetch
```

## **Root Cause:**
Directory is named `server` but needs to be `make-server-6fcaeea3`

---

## ✅ **FIX (3 Commands):**

### **Mac/Linux:**

```bash
# Step 1: Rename
mv supabase/functions/server supabase/functions/make-server-6fcaeea3

# Step 2: Deploy
./deploy-backend.sh

# Step 3: Test
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**When `deploy-backend.sh` prompts:**
- Select: `1` (Development)
- Login if asked
- Wait 30-60 seconds

---

### **Windows PowerShell:**

```powershell
# Step 1: Rename
Rename-Item "supabase\functions\server" "make-server-6fcaeea3"

# Step 2: Deploy
.\deploy-backend.bat

# Step 3: Test
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

## ✅ **Success = See This:**

```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

---

## 🎯 **After Success:**

1. **Open app:** https://jala2-dev.netlify.app/admin
2. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Look for:** ✅ Green badge "Backend is connected and healthy!"

---

## 🆘 **Still Not Working?**

### **Check if function exists:**
```bash
supabase functions list --project-ref wjfcqqrlhwdvvjmefxky
```

**Should show:**
```
NAME                    VERSION
make-server-6fcaeea3    1
```

**If empty or shows "server":**
- The rename didn't work
- Run rename command again
- Then redeploy

---

### **Check logs:**
```bash
supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky
```

---

## 📋 **One-Liner (Mac/Linux):**

```bash
mv supabase/functions/server supabase/functions/make-server-6fcaeea3 && ./deploy-backend.sh
```

---

**That's it! 3 steps and you're done.** 🚀
