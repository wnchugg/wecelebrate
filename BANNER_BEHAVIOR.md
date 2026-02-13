# 🎨 Token Issue Banner - Smart Behavior

## How It Works

The **yellow/orange warning banner** at the top of the page is **smart** - it only appears when there's an actual problem.

---

## 📋 Banner Display Logic

### ✅ **Banner SHOWS When:**

1. **ES256 token detected** in sessionStorage
   - This means you have a Supabase Auth token instead of our backend token
   - Causes 401 "Invalid JWT" errors
   - Banner provides quick "FIX NOW" button

2. **Unparseable/corrupted token**
   - Token exists but can't be decoded
   - Likely corrupted or invalid format
   - Banner helps you clear it

### ❌ **Banner HIDDEN When:**

1. **No token exists**
   - User hasn't logged in yet
   - Normal state for public pages

2. **Valid HS256 token exists**
   - Correct token type
   - Everything working normally
   - No need to show warning

3. **Banner was dismissed**
   - User clicked the X button
   - Preference saved in localStorage
   - Won't show again until page reload with new token issue

---

## 🔍 Detection Method

The banner uses a React `useEffect` hook to check the token on mount:

```typescript
useEffect(() => {
  const token = getAccessToken();
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const algorithm = header.alg || '';
        
        // Only show banner if it's an ES256 token (wrong type)
        if (algorithm === 'ES256') {
          setHasTokenIssue(true);
        } else {
          setHasTokenIssue(false);
        }
      }
    } catch (error) {
      // If we can't parse the token, there might be an issue
      setHasTokenIssue(true);
    }
  } else {
    setHasTokenIssue(false);
  }
}, []);
```

---

## 🎯 Use Cases

### **Scenario 1: Normal User Journey**
1. User visits site (no token) → **No banner**
2. User logs in → Gets HS256 token → **No banner**
3. User navigates around → **No banner** (token is valid)

### **Scenario 2: ES256 Token Issue**
1. User has ES256 token from previous session → **Banner appears**
2. User clicks "FIX NOW" → Redirects to token clear
3. User logs in → Gets HS256 token → **No banner**

### **Scenario 3: Automatic Fix**
1. User has ES256 token → **Banner appears briefly**
2. App.tsx detects ES256 → Auto-redirects before user sees banner
3. After login → HS256 token → **No banner**

---

## 🛠️ Manual Override

Users can dismiss the banner by clicking the **X button** if they:
- Want to ignore the warning temporarily
- Are troubleshooting manually
- Know about the issue and will fix it later

**Note:** Dismissal is stored in localStorage, so it will return if the token issue persists after a page reload.

---

## 🔄 Interaction with Auto-Fix

The banner works **alongside** the automatic token detection:

### **Layer 1: App.tsx** (Automatic)
- Detects ES256 on page load
- Redirects immediately
- User may never see the banner

### **Layer 2: API Client** (Automatic)
- Detects ES256 before API calls
- Redirects immediately
- User may never see the banner

### **Layer 3: Banner** (Manual Backup)
- Provides visual indicator
- Gives user manual control
- Useful if auto-redirect fails
- Useful if user cancels redirect

---

## 💡 Benefits

1. **Non-intrusive**: Only appears when there's a real issue
2. **Informative**: Tells user exactly what's wrong
3. **Actionable**: Provides clear fix button
4. **Dismissible**: User can close it if needed
5. **Smart**: Doesn't clutter UI when everything works
6. **Backup**: Provides manual option if auto-fix fails

---

## 🎨 Visual States

### **No Issue (Hidden)**
```
┌────────────────────────────┐
│                            │
│    App Content Here        │
│                            │
└────────────────────────────┘
```

### **ES256 Detected (Shown)**
```
┌────────────────────────────────────────┐
│  ⚠️ ATTENTION: Token Issue Detected   │
│  [FIX NOW - Clear Invalid Token]  [X] │
└────────────────────────────────────────┘
┌────────────────────────────┐
│                            │
│    App Content Here        │
│                            │
└────────────────────────────┘
```

---

## 🧪 Testing

To test the banner behavior:

### **Test 1: Create ES256 Token Issue**
```javascript
// In console
const fakeES256Token = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
sessionStorage.setItem('jala_access_token', fakeES256Token);
location.reload();
```
Expected: **Banner appears**

### **Test 2: Clear Issue**
```javascript
sessionStorage.clear();
location.reload();
```
Expected: **No banner**

### **Test 3: Valid HS256 Token**
Login normally through `/admin/login`
Expected: **No banner**

---

## 🚀 Summary

The banner is a **smart, contextual UI element** that:
- ✅ Only appears when needed
- ✅ Provides clear, actionable fix
- ✅ Works with automatic detection
- ✅ Doesn't clutter the interface
- ✅ Gives users control

**It's a safety net, not a permanent fixture!** 🎉
