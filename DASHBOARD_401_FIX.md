# Dashboard 401 Errors - FIXED

**Date:** February 12, 2026  
**Status:** ✅ **FIXED**

---

## 🐛 Issues Found

### 1. Authentication Header Issue
**Problem:** The `dashboardService` was sending the JWT token only in the `Authorization` header, but the backend `verifyAdmin` middleware expects it in the `X-Access-Token` header.

**Error:**
```
[Dashboard] No current site selected
[DashboardService] Request failed (attempt 1/3): Error: HTTP 401: 
[DashboardService] Failed to fetch stats: Error: HTTP 401: 
```

### 2. Missing Site Selection Error
**Problem:** When no site was selected, the error message wasn't helpful.

---

## ✅ Fixes Applied

### Fix 1: Updated dashboardService Authentication Headers

**File:** `/src/app/services/dashboardService.ts`

**Changed from:**
```typescript
private getHeaders(environmentId: string = 'development'): HeadersInit {
  const token = getAccessToken();
  
  return {
    'Authorization': `Bearer ${token || publicAnonKey}`,
    'X-Environment-ID': environmentId,
    'Content-Type': 'application/json',
  };
}
```

**Changed to:**
```typescript
private getHeaders(environmentId: string = 'development'): HeadersInit {
  const token = getAccessToken();
  
  return {
    // CRITICAL: Send Supabase anon key for platform authorization
    'Authorization': `Bearer ${publicAnonKey}`,
    // CRITICAL: Send custom JWT token in X-Access-Token header
    'X-Access-Token': token || '',
    'X-Environment-ID': environmentId,
    'Content-Type': 'application/json',
  };
}
```

**Why this fixes it:**
- The backend `verifyAdmin` middleware (line 377 in `/supabase/functions/server/index.tsx`) looks for the token in the `X-Access-Token` header
- The `Authorization` header should only contain the Supabase anonymous key for platform-level auth
- The custom JWT token goes in `X-Access-Token` for admin verification

---

### Fix 2: Improved Error Handling in Dashboard

**File:** `/src/app/pages/admin/Dashboard.tsx`

**Added:**
1. **Better no-site-selected handling:**
   ```typescript
   if (!currentSite?.id) {
     console.warn('[Dashboard] No current site selected');
     setError('No site selected. Please select a site from the dropdown.');
     setLoading(false);
     setRefreshing(false);
     return;
   }
   ```

2. **More helpful error messages:**
   ```typescript
   if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
     setError('Authentication required. Please log in again.');
   } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
     setError('Access denied. You do not have permission to view this dashboard.');
   }
   ```

---

## 🧪 How to Test

### 1. Login as Admin
Make sure you're logged in as an admin user:
```
Email: admin@wecelebrate.com (or your admin account)
Password: [your password]
```

### 2. Select a Site
If no site is automatically selected:
1. Click the site dropdown in the header
2. Select a site

### 3. Navigate to Dashboard
Go to `/admin/dashboard` - you should now see:
- ✅ Dashboard loads without 401 errors
- ✅ Statistics display correctly
- ✅ Recent orders and popular gifts show (if data exists)

---

## 🔍 Debugging Steps (if issues persist)

### Check 1: Verify You're Logged In
Open browser console and run:
```javascript
// Check if token exists
sessionStorage.getItem('jala_access_token')

// Inspect token (DEV only)
window.inspectJALAToken()
```

**Expected:** Should return a token and show it's valid (not expired)

### Check 2: Verify Site is Selected
```javascript
// Check current site in session storage
sessionStorage.getItem('current_site_id')
```

**Expected:** Should return a site ID

### Check 3: Test Dashboard API Directly
```javascript
// Test the stats endpoint
const projectId = 'your-project-id';
const siteId = 'your-site-id';
const token = sessionStorage.getItem('jala_access_token');
const publicAnonKey = 'your-public-anon-key';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/stats/${siteId}?timeRange=30d`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Access-Token': token,
    'X-Environment-ID': 'development',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Dashboard stats:', data));
```

**Expected:** Should return dashboard statistics without 401 error

---

## 🎯 Root Cause

The issue was a **header mismatch** between frontend and backend:

- **Frontend** (before fix): Sent JWT in `Authorization` header
- **Backend** (`verifyAdmin`): Expected JWT in `X-Access-Token` header

This is by design because:
1. Supabase platform requires `Authorization: Bearer ${anonKey}` for all edge function requests
2. Our custom JWT needs a separate header to avoid conflicts
3. The backend uses `X-Access-Token` to verify admin authentication

---

## 📊 Files Changed

1. ✅ `/src/app/services/dashboardService.ts` - Fixed authentication headers
2. ✅ `/src/app/pages/admin/Dashboard.tsx` - Improved error handling

---

## ✅ Status

**FIXED!** The Dashboard should now work correctly when:
- User is logged in as an admin
- A site is selected
- Backend is deployed and responding

---

## 🔗 Related Documentation

- [Dashboard Production Readiness](../PROJECT_COMPLETE.md) - Original dashboard implementation
- [Backend Dashboard API](../supabase/functions/server/DASHBOARD_API_DOCUMENTATION.md) - API documentation
- [Authentication Flow](../ADMIN_AUTH_SYSTEM.md) - Admin authentication system

---

**If you still see 401 errors after applying these fixes, the issue is likely:**
1. **Not logged in** - Log in as an admin user
2. **Token expired** - Log out and log back in
3. **Backend not deployed** - Deploy the backend edge functions
4. **No sites exist** - Create a site first

**Quick fix for most issues:**
```javascript
// Clear everything and start fresh
sessionStorage.clear();
// Then reload and log in again
```
