# Admin Authentication Debug Guide

## Current Authentication Architecture

### Overview
The JALA 2 platform uses a **dual-header authentication system**:
- **Supabase Auth** for password management (stores passwords securely)
- **Custom HS256 JWT** for API authentication (generated after Supabase login)

### Authentication Flow

#### 1. Login Request (`/auth/login`)
```
POST /make-server-6fcaeea3/auth/login
Headers:
  - Authorization: Bearer {supabaseAnonKey}  ← Supabase platform auth
  - X-Environment-ID: {environmentId}         ← development or production
  - Content-Type: application/json
Body:
  {
    "identifier": "username or email",
    "password": "password"
  }
```

**Backend Process:**
1. Receives login request with identifier + password
2. Determines if identifier is email or username
3. If username, looks up email in KV store
4. Calls `supabaseClient.auth.signInWithPassword(email, password)`
5. If Supabase auth succeeds, generates **custom HS256 JWT**
6. Returns: `{ access_token: customJWT, user: {...} }`

#### 2. Authenticated API Requests (After Login)
```
GET/POST/PUT/DELETE /make-server-6fcaeea3/admin/*
Headers:
  - Authorization: Bearer {supabaseAnonKey}  ← Supabase platform auth
  - X-Access-Token: {customJWT}              ← Our custom JWT for verification
  - X-Environment-ID: {environmentId}        ← development or production
  - Content-Type: application/json
```

**Backend Verification (verifyAdmin middleware):**
1. Extracts `X-Access-Token` header
2. Verifies custom JWT using HS256 algorithm
3. Checks JWT expiration
4. Extracts userId, email, role from JWT payload
5. Sets context variables for route handlers

### Why Two Tokens?

| Header | Token Type | Purpose |
|--------|-----------|---------|
| `Authorization: Bearer {anonKey}` | Supabase Anon Key | Allows Supabase Edge Functions to accept the request |
| `X-Access-Token: {customJWT}` | Custom HS256 JWT | Our application verifies user identity and role |

**Supabase Platform Requirement:**
- Supabase Edge Functions require a valid `Authorization` header with either:
  - Service role key (for admin operations)
  - Anon key (for public operations)
- Without this, Supabase platform rejects the request **before** it reaches our code

**Our Security Layer:**
- We generate our own HS256 JWT after Supabase authenticates the password
- This JWT contains user ID, email, role, expiration
- We verify this JWT on protected routes using the `verifyAdmin` middleware

## Common Issues and Solutions

### Issue 1: "Invalid login credentials" (Before Bootstrap)

**Symptoms:**
```
[Auth] Error code: invalid_credentials
AuthApiError: Invalid login credentials
```

**Cause:** No admin users exist in Supabase Auth yet.

**Solution:** Run bootstrap to create first admin account:
1. Go to `/admin-bootstrap` route
2. Create first admin account
3. System will create user in Supabase Auth + KV store

### Issue 2: 401 Unauthorized on API Requests

**Symptoms:**
```
401 Unauthorized on /make-server-6fcaeea3/admin/*
```

**Debugging Steps:**
1. Check if `X-Access-Token` is being sent:
   ```javascript
   // In browser console
   console.log('Token:', sessionStorage.getItem('jala_admin_token'));
   ```

2. Check token format:
   ```javascript
   const token = sessionStorage.getItem('jala_admin_token');
   const parts = token.split('.');
   console.log('Header:', JSON.parse(atob(parts[0])));
   console.log('Payload:', JSON.parse(atob(parts[1])));
   ```

3. Verify token algorithm is HS256:
   ```javascript
   // Should show: { alg: 'HS256', typ: 'JWT' }
   ```

4. Check expiration:
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   const exp = new Date(payload.exp * 1000);
   const now = new Date();
   console.log('Expires:', exp);
   console.log('Now:', now);
   console.log('Expired:', exp < now);
   ```

### Issue 3: Wrong Token Type (ES256 instead of HS256)

**Symptoms:**
```
Backend returned ES256 token instead of HS256
```

**Cause:** Backend code not deployed correctly, returning Supabase's JWT instead of custom JWT.

**Solution:**
1. Check backend logs for JWT generation
2. Verify `generateCustomJWT()` is being called
3. Re-deploy backend edge function

### Issue 4: Missing Environment Headers

**Symptoms:**
```
Data showing from wrong environment
```

**Debugging:**
1. Check environment selection:
   ```javascript
   console.log('Current env:', localStorage.getItem('jala_selected_environment'));
   ```

2. Verify headers in Network tab:
   - Should see `X-Environment-ID: development` or `production`

## Testing Authentication

### Manual Test Flow

1. **Clear all state:**
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   location.reload();
   ```

2. **Bootstrap (if needed):**
   - Navigate to `/admin-bootstrap`
   - Create first admin with:
     - Username: `admin`
     - Email: `admin@example.com`
     - Password: Strong password with uppercase, lowercase, number, special char

3. **Login:**
   - Navigate to `/admin-login`
   - Enter credentials
   - Check browser console for:
     ```
     [authApi.login] ✅ Token algorithm: HS256
     [AdminContext] Login successful
     ```

4. **Verify token storage:**
   ```javascript
   const token = sessionStorage.getItem('jala_admin_token');
   console.log('Token stored:', !!token);
   console.log('Token length:', token?.length);
   ```

5. **Make authenticated request:**
   - Navigate to any admin page (e.g., `/admin/dashboard`)
   - Check Network tab for API request
   - Verify headers include:
     - `Authorization: Bearer ey...` (Supabase anon key)
     - `X-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Custom JWT)
     - `X-Environment-ID: development`

## Environment Configuration

### Frontend
```typescript
// /src/app/utils/environment.ts
export const environments = {
  development: {
    id: 'development',
    name: 'Development',
    supabaseUrl: 'https://wjfcqqrlhwdvvjmefxky.supabase.co',
    supabaseAnonKey: '...',
  },
  production: {
    id: 'production',
    name: 'Production',
    supabaseUrl: 'https://lmffeqwhrnbsbhdztwyv.supabase.co',
    supabaseAnonKey: '...',
  }
};
```

### Backend
```typescript
// Backend automatically uses environment from X-Environment-ID header
// to route KV store operations to correct database
```

## Security Best Practices

1. **Never log full tokens in production:**
   ```typescript
   if (isDevelopment) {
     console.log('Token:', token.substring(0, 20) + '...');
   }
   ```

2. **Validate token format before storage:**
   ```typescript
   function isValidTokenFormat(token: string): boolean {
     const parts = token.split('.');
     if (parts.length !== 3) return false;
     const header = JSON.parse(atob(parts[0]));
     return header.alg === 'HS256';
   }
   ```

3. **Clear tokens on 401 (but not immediately after login):**
   ```typescript
   if (!wasRecentLogin()) {
     setAccessToken(null);
   }
   ```

4. **Use session storage (not localStorage) for tokens:**
   - Tokens clear when browser tab closes
   - Reduces XSS attack surface

## Quick Reference

### Frontend Files
- `/src/app/utils/api.ts` - API client, sends headers
- `/src/app/context/AdminContext.tsx` - Admin auth state
- `/src/app/utils/environment.ts` - Environment config

### Backend Files
- `/supabase/functions/server/index.tsx` - Main server, verifyAdmin middleware
- `/supabase/functions/server/security.ts` - Security utilities
- `/supabase/functions/server/helpers.ts` - JWT generation/verification

### Key Functions
- `authApi.login()` - Frontend login
- `generateCustomJWT()` - Backend JWT creation
- `verifyCustomJWT()` - Backend JWT verification
- `verifyAdmin()` - Backend auth middleware
- `getAccessToken()` - Get token from session storage
- `setAccessToken()` - Store token in session storage

## Emergency Recovery

If completely stuck:

```javascript
// Run in browser console
window.forceClearTokens = function() {
  sessionStorage.clear();
  localStorage.clear();
  console.log('All tokens cleared! Refresh page and try again.');
};
window.forceClearTokens();
location.reload();
```

Then navigate to `/admin-bootstrap` and start fresh.
