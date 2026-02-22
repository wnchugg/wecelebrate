# How to Get a Valid Auth Token

## The Issue

The test is failing with "Unauthorized" because the auth token needs to be a valid admin JWT token.

## Option 1: Get Token from Browser (Easiest)

1. Open your admin dashboard in the browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the "Application" or "Storage" tab
4. Look for "Local Storage" or "Session Storage"
5. Find the Supabase auth token (usually under key like `sb-wjfcqqrlhwdvvjmefxky-auth-token`)
6. Copy the `access_token` value

**Or use Console:**

```javascript
// In browser console on your admin dashboard
const token = JSON.parse(localStorage.getItem('sb-wjfcqqrlhwdvvjmefxky-auth-token'))?.access_token;
console.log(token);
```

## Option 2: Get Token from Network Tab

1. Open your admin dashboard
2. Open Developer Tools (F12)
3. Go to "Network" tab
4. Refresh the page or make any API call
5. Look for requests to `supabase.co`
6. Click on one of them
7. Look at the "Headers" section
8. Find "Authorization: Bearer ..." header
9. Copy everything after "Bearer "

## Option 3: Use Supabase Anon Key (Limited Access)

For testing public endpoints only:

```bash
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"
```

Note: This won't work for admin endpoints (which require admin role).

## Option 4: Create Admin Token via Supabase

If you have access to create admin users:

1. Go to Supabase Dashboard → Authentication → Users
2. Find or create an admin user
3. Copy their JWT token

## Quick Test

Once you have a valid token, test it:

```bash
# Replace YOUR_TOKEN with your actual token
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

If you get a JSON response with sites, the token is valid!

## Common Token Issues

### Issue: Token expired
**Solution**: Get a fresh token from the browser (tokens typically expire after 1 hour)

### Issue: Token doesn't have admin role
**Solution**: Make sure you're logged in as an admin user in the dashboard

### Issue: Token format wrong
**Solution**: Make sure you're copying just the token, not "Bearer " prefix

## For the Test Script

Once you have a valid token, run:

```bash
./test-draft-live-backend.sh
```

When prompted, paste your token (it will be a long string starting with "eyJ...")

## Token Format

A valid JWT token looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA4MzU0ODY4LCJleHAiOjIwODU5MzA4Njh9.abc123def456...
```

It has three parts separated by dots (`.`):
1. Header (algorithm info)
2. Payload (user data, role, expiration)
3. Signature (verification)

## Verify Your Token

You can decode your token (without the signature) at https://jwt.io to see:
- What role it has (should be "admin" or similar)
- When it expires
- What user it belongs to

Just paste your token there and check the "Payload" section.
