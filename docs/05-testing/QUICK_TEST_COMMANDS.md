# Quick Test Commands - Development Environment

## Backend Health Check
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

## Admin Login
```bash
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Save the `access_token` from the response for subsequent requests.**

## Test Protected Endpoint (Sites)
```bash
# Replace YOUR_TOKEN with the access_token from login
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites \
  -H "X-Access-Token: YOUR_TOKEN"
```

## Test Rate Limiting
```bash
# This should trigger rate limit after 100 requests
for i in {1..105}; do
  echo "Request $i"
  curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health | grep -o '"status":"[^"]*"'
  sleep 0.1
done
```

## Test Ed25519 Token Verification
```bash
# This should return 401 (HS256 tokens rejected)
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites \
  -H "X-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

## Test Tenant Isolation
```bash
# Login as admin
TOKEN=$(curl -s -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | jq -r '.access_token')

# Get sites (should only return sites for this tenant)
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites \
  -H "X-Access-Token: $TOKEN"
```

## Test CORS
```bash
curl -X OPTIONS https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

## Full Authentication Flow Test
```bash
#!/bin/bash

echo "=== Testing Full Authentication Flow ==="

# 1. Health check
echo -e "\n1. Health Check:"
curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health | jq

# 2. Login
echo -e "\n2. Admin Login:"
LOGIN_RESPONSE=$(curl -s -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')
echo $LOGIN_RESPONSE | jq

# 3. Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo -e "\nToken: ${TOKEN:0:50}..."

# 4. Test protected endpoint
echo -e "\n3. Test Protected Endpoint (Sites):"
curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites \
  -H "X-Access-Token: $TOKEN" | jq

# 5. Test another protected endpoint
echo -e "\n4. Test Protected Endpoint (Catalogs):"
curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/catalogs \
  -H "X-Access-Token: $TOKEN" | jq

echo -e "\n=== Test Complete ==="
```

Save this as `test_auth_flow.sh` and run:
```bash
chmod +x test_auth_flow.sh
./test_auth_flow.sh
```

## Frontend Testing

### Local Development
```bash
npm run dev
# Open http://localhost:5173
```

### Test Admin Login
1. Navigate to `/admin/login`
2. Email: `admin@example.com`
3. Password: `Admin123!`
4. Should redirect to admin dashboard

### Test Client Portal
1. Navigate to `/`
2. Should see landing page
3. Click "Get Started"
4. Should see site selection

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Token expired or invalid. Login again to get new token.

### Issue: 429 Too Many Requests
**Solution:** Rate limit hit. Wait 15 minutes or use different IP.

### Issue: CORS Error
**Solution:** Check that Origin header matches allowed origins in backend.

### Issue: 500 Internal Server Error
**Solution:** Check Supabase logs for detailed error message.

## Environment URLs

### Development
- **Backend:** https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
- **Frontend:** (Your Netlify URL)

### Production
- **Backend:** https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3
- **Frontend:** (Your production Netlify URL)

## Useful Commands

### Check Backend Logs
```bash
# Via Supabase CLI
supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky
```

### Redeploy Backend
```bash
./deploy-backend.sh dev
```

### Rebuild Frontend
```bash
npm run build
```

### Run Tests
```bash
npm test -- --run
```

## Need Help?

- **API Documentation:** `API_DOCUMENTATION.md`
- **E2E Testing Guide:** `READY_FOR_E2E_TESTING.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Security Guide:** `SECURITY_VULNERABILITY_CLOSED.md`
