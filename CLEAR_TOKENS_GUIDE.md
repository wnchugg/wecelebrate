# 🔄 Quick Fix: Clear Old Tokens

If you're still seeing 401 errors after the fix, you have old tokens cached in your browser. Here's how to clear them:

---

## ✅ Option 1: Clear in Browser Console (EASIEST)

1. Open **https://jala2-dev.netlify.app/**
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab
4. Paste this and press Enter:

```javascript
sessionStorage.clear();
location.reload();
```

5. ✅ **Done!** The page will reload with no old tokens

---

## ✅ Option 2: Clear Browser Data (THOROUGH)

### Chrome/Edge:
1. Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. Select "**Cookies and other site data**"
3. Choose "**Last hour**" or "**All time**"
4. Click "**Clear data**"
5. Reload https://jala2-dev.netlify.app/

### Firefox:
1. Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. Select "**Cookies**"
3. Choose "**Last hour**" or "**Everything**"
4. Click "**Clear Now**"
5. Reload https://jala2-dev.netlify.app/

### Safari:
1. Press **Cmd+,** to open Settings
2. Go to **Privacy**
3. Click "**Manage Website Data**"
4. Search for "**netlify.app**"
5. Click "**Remove**" → "**Done**"
6. Reload https://jala2-dev.netlify.app/

---

## ✅ Option 3: Use Incognito/Private Mode

1. Open a **new incognito/private window**
2. Go to https://jala2-dev.netlify.app/
3. Login fresh (no old tokens)

---

## 🧪 Verify It Worked

After clearing:

1. Go to https://jala2-dev.netlify.app/admin/login
2. Login with:
   - **Email:** `admin@example.com`
   - **Password:** `Admin123!`
3. You should see the admin dashboard
4. Open browser console (F12) - **no 401 errors!** ✅

---

## 🔍 Debug: Check Your Current Token

Want to see if you have an old token?

1. Open browser console (F12)
2. Paste this:

```javascript
const token = sessionStorage.getItem('jala_access_token');
if (!token) {
  console.log('✅ No token - you are logged out');
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const issuer = payload.iss || '';
    const isValid = issuer.includes('wjfcqqrlhwdvvjmefxky');
    
    console.log('Token issuer:', issuer);
    console.log('Is valid?', isValid ? '✅ YES' : '❌ NO - OLD TOKEN');
    
    if (!isValid) {
      console.log('🔧 Clearing old token...');
      sessionStorage.clear();
      location.reload();
    }
  } catch (e) {
    console.log('❌ Invalid token format - clearing...');
    sessionStorage.clear();
    location.reload();
  }
}
```

This will:
- Check if you have a token
- Validate if it's from the correct backend
- Automatically clear old tokens
- Reload the page

---

## ❓ Still Having Issues?

If you still see 401 errors after clearing:

1. **Hard refresh the page:**
   - Windows/Linux: **Ctrl+Shift+R**
   - Mac: **Cmd+Shift+R**

2. **Check backend is running:**
   ```bash
   curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec" \
        https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```
   Should return: `{"status":"ok",...}`

3. **Try a different browser**

---

## 🎉 That's It!

After clearing old tokens, everything should work perfectly. The app will automatically handle token management from now on.
