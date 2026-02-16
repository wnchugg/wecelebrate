# 🧪 Testing in Figma Make Interface

## ✅ Good News!

You **don't need to manually clear tokens** - the app does it automatically! Here's how:

---

## 🔄 Automatic Token Cleanup

When you test in Figma Make preview, the app automatically:

1. **Checks for old tokens** on page load
2. **Validates token issuer** (must be from wjfcqqrlhwdvvjmefxky)
3. **Clears invalid tokens** automatically
4. **Redirects to login** if needed

### What You'll See:

In the browser console (press F12 in the preview):

**If you have an old token:**
```
[Token Migration] Clearing token from old backend instance
[Token Migration] Old issuer: https://...
[Token Migration] Expected issuer: wjfcqqrlhwdvvjmefxky
```

**If no token or valid token:**
```
(No migration messages - ready to use)
```

---

## 🎯 Quick Token Clear (If Needed)

At the **top of the app**, you'll see a **green banner** with a button:

**"Clear Tokens & Reload"** ← Click this button!

This will:
- ✅ Clear all stored tokens
- ✅ Clear session storage
- ✅ Reload the page
- ✅ Start fresh

---

## 🧪 Testing Flow in Figma Make

### 1. **Open the Preview**
- Click the preview button in Figma Make
- App loads with automatic token migration

### 2. **Check Console**
- Press **F12** to open DevTools
- Look for migration messages
- No 401 errors should appear

### 3. **Test Login**
- Navigate to `/admin/login` in the preview
- Login with:
  - **Email:** `admin@example.com`
  - **Password:** `Admin123!`
- Should login successfully

### 4. **Verify Features Work**
- Click on "Clients" - should load
- Click on "Sites" - should load
- Click on "Gifts" - should load
- No 401 errors in console

---

## 🐛 If You Still See 401 Errors

### Option 1: Use the Banner Button
1. Look for the **green banner** at the top
2. Click **"Clear Tokens & Reload"**
3. Page reloads fresh

### Option 2: DevTools Console
Press F12 and paste:
```javascript
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Option 3: Manual Token Check
Press F12 and paste:
```javascript
const token = sessionStorage.getItem('jala_access_token');
if (!token) {
  console.log('✅ No token - ready to login');
} else {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const issuer = payload.iss || '';
  const isValid = issuer.includes('wjfcqqrlhwdvvjmefxky');
  
  console.log('Token issuer:', issuer);
  console.log('Is valid?', isValid ? '✅ YES' : '❌ NO');
  
  if (!isValid) {
    sessionStorage.clear();
    location.reload();
  }
}
```

---

## 📊 Expected Behavior

### **First Load (No Token)**
```
App loads
  ↓
Migration runs (no token found)
  ↓
Login page shown
  ↓
✅ Ready to login
```

### **First Load (Old Token)**
```
App loads
  ↓
Migration runs
  ↓
Old token detected
  ↓
Token cleared automatically
  ↓
Login page shown
  ↓
✅ Ready to login fresh
```

### **First Load (Valid Token)**
```
App loads
  ↓
Migration runs
  ↓
Valid token detected
  ↓
Session restored
  ↓
✅ Logged in automatically
```

---

## 🚀 Deploy to Netlify for Full Testing

For complete testing outside Figma Make:

### Quick Steps:

1. **Export from Figma Make**
   - Click Export → Download ZIP

2. **Extract and open terminal**
   ```bash
   cd /path/to/extracted/files
   ```

3. **Deploy with Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --site jala2-dev
   ```
   When prompted, enter: `dist`

4. **Test on live site**
   - Visit https://jala2-dev.netlify.app/
   - Everything works with real backend!

See `/NETLIFY_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🔍 Debugging in Figma Make

### Check Backend is Running:

In Figma Make preview console (F12):
```javascript
fetch('https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Backend health:', data))
.catch(e => console.error('❌ Backend error:', e));
```

Should show:
```json
{
  "status": "ok",
  "environment": "development",
  "database": true
}
```

### Check Current Token:

```javascript
const token = sessionStorage.getItem('jala_access_token');
console.log('Has token?', !!token);
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token details:', {
    issuer: payload.iss,
    email: payload.email,
    expires: new Date(payload.exp * 1000)
  });
}
```

---

## ✅ Success Indicators

You know it's working when:

- ✅ Green banner shows "Backend Deployed & JWT Fixed!"
- ✅ No 401 errors in console
- ✅ Can login successfully
- ✅ Can access all admin pages
- ✅ Data loads without errors
- ✅ Token validation working

---

## 📝 Quick Reference

| Action | Method |
|--------|--------|
| **Clear tokens** | Click green banner button |
| **Check token** | F12 → Console → `sessionStorage.getItem('jala_access_token')` |
| **Test backend** | Run health check fetch in console |
| **Force reload** | `sessionStorage.clear(); location.reload()` |
| **View logs** | F12 → Console tab |

---

## 🎉 Summary

**You don't need to do anything special!** The app automatically:
- ✅ Clears old tokens on load
- ✅ Validates token issuer
- ✅ Handles 401 errors gracefully
- ✅ Provides UI button to manually clear

Just **open the Figma Make preview** and it should work! If you need to clear tokens manually, use the **green banner button** at the top of the app.
