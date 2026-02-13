# 🔧 Token Fix V2 - ES256 vs HS256 Issue

## 🔍 Root Cause Identified

You have **Supabase Auth tokens (ES256)** instead of **our backend tokens (HS256)**.

### The Problem:
- **ES256 tokens** are from Supabase's authentication system
- **HS256 tokens** are from our custom backend (JALA 2 API)
- They are **incompatible** - the backend only accepts HS256 tokens

### Your Current Token:
```
Algorithm: ES256 ❌ (Should be HS256)
Source: Supabase Auth
Used by: Supabase authentication flows
NOT compatible with our backend
```

---

## ✅ The Fix (Already Applied)

### 1. **Enhanced Token Migration (App.tsx)**
- Now checks **algorithm** (must be HS256)
- Now checks **issuer** (must be from wjfcqqrlhwdvvjmefxky)
- **Automatically clears** ES256 tokens on app load
- Updated to version v2 to force re-run

### 2. **Improved Clear Button**
- Force clears ALL storage
- Hard reloads the page (bypasses cache)
- More reliable clearing

### 3. **New Token Debug Page**
- Visit `/admin/token-debug` for detailed analysis
- Shows token algorithm, issuer, expiry
- Color-coded status indicators
- One-click token clearing

---

## 🧪 How to Fix Your 401 Errors RIGHT NOW

### **Option 1: Use the Green Banner (EASIEST)**

1. Look at the **TOP of the app**
2. See the green banner
3. Click **"Clear Tokens & Reload"**
4. Page reloads → old token gone
5. Login at `/admin/login`
6. ✅ Done!

### **Option 2: Visit Token Debug Page**

1. Navigate to: **`/admin/token-debug`**
2. See detailed token analysis
3. Click **"Clear Token"** button
4. Login at `/admin/login`
5. ✅ Done!

### **Option 3: Console Command**

Press F12 and paste:
```javascript
sessionStorage.clear();
localStorage.clear();
window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
```

---

## 🎯 What You'll See After Clearing

### **1. App Loads**
```
[Token Migration v2] Found existing token, validating...
[Token Migration v2] Token algorithm: ES256
[Token Migration v2] Token issuer: https://wjfcqqrlhwdvvjmefxky.supabase.co/auth/v1
[Token Migration v2] ❌ Invalid algorithm. Expected HS256, got: ES256
[Token Migration v2] Clearing token - this is a Supabase Auth token, not our backend token
```

### **2. Token Cleared**
```
✅ All tokens cleared
```

### **3. Redirect to Login**
- You're now at `/admin/login`
- No token in sessionStorage
- Ready for fresh login

### **4. Login Successfully**
- Enter credentials: `admin@example.com` / `Admin123!`
- Backend issues **HS256 token**
- Token stored in sessionStorage
- ✅ All admin features work!

---

## 🔍 Understanding Token Types

### **ES256 (Supabase Auth) - NOT Compatible**
```json
{
  "alg": "ES256",  // ❌ Wrong algorithm
  "iss": "https://wjfcqqrlhwdvvjmefxky.supabase.co/auth/v1",
  "sub": "user-uuid",
  "aud": "authenticated"
}
```
**Used for:** Supabase authentication (signInWithPassword, signInWithOAuth)  
**NOT used for:** Our JALA 2 backend API

### **HS256 (Our Backend) - Correct**
```json
{
  "alg": "HS256",  // ✅ Correct algorithm
  "iss": "https://wjfcqqrlhwdvvjmefxky.supabase.co",
  "email": "admin@example.com",
  "role": "super_admin"
}
```
**Used for:** JALA 2 backend API (clients, sites, gifts, etc.)  
**Issued by:** `/auth/login` endpoint on our backend

---

## 📊 Token Debug Page Features

Navigate to **`/admin/token-debug`** to see:

### **Status Indicators:**
- 🟢 Green = Valid HS256 token
- 🟡 Yellow = Expired token
- 🔴 Red = Invalid or ES256 token
- ⚪ Gray = No token

### **Information Displayed:**
- ✅ Algorithm (HS256 vs ES256)
- ✅ Issuer (which Supabase instance)
- ✅ Email/Subject
- ✅ Issued At / Expires At
- ✅ Token validity status
- ✅ Recommendations

### **Actions Available:**
- 🔄 Refresh analysis
- 🗑️ Clear token
- 📋 View raw token data

---

## 🚀 After Clearing: How to Get a Valid Token

### **Step 1: Navigate to Login**
```
/admin/login
```

### **Step 2: Enter Credentials**
```
Email: admin@example.com
Password: Admin123!
```

### **Step 3: Backend Issues HS256 Token**
The backend `/auth/login` endpoint:
1. Validates credentials
2. Creates custom JWT with **HS256**
3. Returns token to frontend
4. Frontend stores in sessionStorage

### **Step 4: Use Admin Features**
Now all API calls will:
1. Get token from sessionStorage
2. Send in `X-Access-Token` header
3. Backend validates HS256 signature
4. ✅ Request succeeds!

---

## 🔧 Migration Code (Already Applied)

The app now automatically detects and clears ES256 tokens:

```typescript
// In App.tsx
const header = JSON.parse(atob(parts[0]));
const algorithm = header.alg || '';

if (algorithm !== 'HS256') {
  console.warn('❌ Invalid algorithm. Expected HS256, got:', algorithm);
  clearAccessToken();
  sessionStorage.clear();
}
```

This runs **automatically on every page load** until you have a valid HS256 token.

---

## ✅ Verification Checklist

After clearing tokens and logging in:

- [ ] Visit `/admin/token-debug`
- [ ] Check algorithm = **HS256** ✅
- [ ] Check issuer contains **wjfcqqrlhwdvvjmefxky** ✅
- [ ] Check status = **Valid** ✅
- [ ] Visit `/admin/clients` - loads without 401 ✅
- [ ] Visit `/admin/sites` - loads without 401 ✅
- [ ] Visit `/admin/gifts` - loads without 401 ✅
- [ ] No 401 errors in console ✅

---

## 🎯 Quick Reference

| Action | Method |
|--------|--------|
| **Check token type** | `/admin/token-debug` |
| **Clear tokens (UI)** | Green banner button |
| **Clear tokens (console)** | `sessionStorage.clear(); location.reload();` |
| **Get valid token** | Login at `/admin/login` |
| **Verify it works** | Visit `/admin/clients` |

---

## 💡 Why This Happened

You likely:
1. Used Supabase's `signInWithPassword()` directly (creates ES256 token)
2. Or used Supabase Auth UI/helpers (creates ES256 token)
3. Instead of using our `/auth/login` API endpoint (creates HS256 token)

**The Solution:**
Always login through **`/admin/login`** page, which calls our backend's `/auth/login` endpoint and gets an HS256 token.

---

## 🚀 Next Steps

1. **Click "Clear Tokens & Reload"** in the green banner
2. **Navigate to `/admin/login`**
3. **Login with credentials**
4. **Verify at `/admin/token-debug`** (should show HS256)
5. **Test admin features** (clients, sites, gifts)
6. ✅ **All 401 errors gone!**

---

## 📞 Still Having Issues?

If you still see 401 errors after:
1. Clearing tokens
2. Logging in at `/admin/login`
3. Verifying HS256 token at `/admin/token-debug`

Then the issue may be:
- Backend not deployed
- Wrong environment selected
- Backend endpoint returning wrong token

Check backend health:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec" \
  https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Should return: `{"status":"ok",...}`

---

**The fix is complete and active!** Just click the button in the green banner to clear old tokens. 🎉
