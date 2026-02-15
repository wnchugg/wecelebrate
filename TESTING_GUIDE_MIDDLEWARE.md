# Middleware Testing Guide

**Date:** February 15, 2026  
**Purpose:** Test the newly integrated authentication and tenant isolation middleware

---

## Prerequisites

- Development Supabase URL: `https://wjfcqqrlhwdvvjmefxky.supabase.co`
- Admin user credentials (or create one via bootstrap)
- `curl` or similar HTTP client

---

## Test 1: Rate Limiting (5 minutes)

### Test IP-Based Rate Limiting

```bash
# Make 101 requests quickly to trigger rate limit
for i in {1..101}; do
  echo "Request $i"
  curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/health | jq -r '.status'
done
```

**Expected Results:**
- First 100 requests: `"ok"`
- 101st request: Error with status 429
- Response includes rate limit headers:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 0`
  - `Retry-After: <seconds>`

**What This Tests:**
- ✅ Rate limiting is active
- ✅ Limit is 100 requests per 15 minutes
- ✅ Rate limit headers are included
- ✅ 429 status code returned when exceeded

---

## Test 2: Authentication (10 minutes)

### Test Login and Token Generation

```bash
# 1. Login as admin user
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "identifier": "your-email@example.com",
    "password": "your-password"
  }' | jq

# Save the token from the response
TOKEN="<paste-token-here>"
```

**Expected Results:**
- Status: 200 OK
- Response includes:
  - `accessToken` (JWT)
  - `user` object with `id`, `email`, `username`, `role`

### Test Authenticated Request

```bash
# 2. Make authenticated request
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/api/products \
  -H "X-Access-Token: $TOKEN" \
  -H "X-Environment-ID: development" | jq
```

**Expected Results:**
- Status: 200 OK
- Response includes products data
- Console logs show tenant access information

### Test Without Token

```bash
# 3. Try without token (should fail)
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/api/products \
  -H "X-Environment-ID: development" | jq
```

**Expected Results:**
- Status: 401 Unauthorized
- Error message: "Unauthorized"

**What This Tests:**
- ✅ Authentication is required for protected endpoints
- ✅ Valid tokens are accepted
- ✅ Invalid/missing tokens are rejected
- ✅ JWT verification works

---

## Test 3: Tenant Isolation (10 minutes)

### Check Tenant Context

```bash
# 1. Login and check what tenant context is set
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "identifier": "user@example.com",
    "password": "password"
  }' | jq

# Look at the JWT payload to see client_id and site_id
```

### Test Tenant Filtering

```bash
# 2. Make request to products endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/api/products \
  -H "X-Access-Token: $TOKEN" \
  -H "X-Environment-ID: development" | jq

# Check server logs for tenant access information
```

**Expected in Server Logs:**
```
[Tenant] Access: {
  user_id: '<user-id>',
  user_email: 'user@example.com',
  client_id: '<client-id>',
  site_id: '<site-id>',
  path: '/make-server-6fcaeea3/api/products',
  method: 'GET'
}
```

### Test Super Admin Access

```bash
# 3. Login as super admin
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "identifier": "admin@example.com",
    "password": "admin-password"
  }' | jq

ADMIN_TOKEN="<paste-admin-token-here>"

# 4. Make request as super admin
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/api/products \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -H "X-Environment-ID: development" | jq
```

**Expected Results:**
- Regular user: Only sees products for their tenant
- Super admin: Sees all products (no tenant filtering)
- Server logs show `enforce_isolation: false` for super admin

**What This Tests:**
- ✅ Tenant context is extracted from JWT
- ✅ Tenant access is logged
- ✅ Super admins bypass tenant isolation
- ✅ Regular users are restricted to their tenant

---

## Test 4: Existing Functionality (5 minutes)

### Verify No Breaking Changes

```bash
# 1. Health check (public endpoint)
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/health | jq

# 2. Public environments endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/public/environments \
  -H "X-Environment-ID: development" | jq

# 3. Database test
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/test-db \
  -H "X-Environment-ID: development" | jq
```

**Expected Results:**
- All public endpoints still work
- No authentication required for public endpoints
- Responses are normal

**What This Tests:**
- ✅ Public endpoints not affected
- ✅ No breaking changes
- ✅ Backward compatibility maintained

---

## Test 5: Run Existing Tests (5 minutes)

### Run Database Tests

```bash
# Navigate to project directory
cd supabase/functions/server

# Run products API tests
deno run --allow-all database/test_gifts_api_v2.ts

# Run orders API tests
deno run --allow-all database/test_orders_api.ts

# Run catalogs API tests
deno run --allow-all database/test_catalogs_api.ts

# Run site config API tests
deno run --allow-all database/test_site_catalog_config_api.ts
```

**Expected Results:**
- All tests pass
- No new errors
- Same behavior as before

**What This Tests:**
- ✅ Database layer still works
- ✅ API endpoints still work
- ✅ No regression in functionality

---

## Test 6: Performance Check (5 minutes)

### Check Response Times

```bash
# Test response time with rate limiting
time curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/health > /dev/null

# Test authenticated endpoint response time
time curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/make-server-6fcaeea3/api/products \
  -H "X-Access-Token: $TOKEN" \
  -H "X-Environment-ID: development" > /dev/null
```

**Expected Results:**
- Response times similar to before (< 200ms)
- Rate limiting adds minimal overhead (< 5ms)
- Tenant context extraction adds minimal overhead (< 5ms)

**What This Tests:**
- ✅ Performance not significantly impacted
- ✅ Middleware is efficient
- ✅ No noticeable slowdown

---

## Test Summary Checklist

After running all tests, verify:

- [ ] Rate limiting works (100 req/15min per IP)
- [ ] Rate limit headers included in responses
- [ ] Authentication required for protected endpoints
- [ ] Valid tokens accepted, invalid tokens rejected
- [ ] Tenant context extracted from JWT
- [ ] Tenant access logged in console
- [ ] Super admins bypass tenant isolation
- [ ] Regular users restricted to their tenant
- [ ] Public endpoints still work without auth
- [ ] No breaking changes to existing functionality
- [ ] All existing tests still pass
- [ ] Performance not significantly impacted

---

## Troubleshooting

### Rate Limiting Not Working

**Symptom:** Can make more than 100 requests without getting 429

**Solution:**
1. Check server logs for rate limiting messages
2. Verify `ipRateLimit` middleware is registered
3. Check if IP address is being extracted correctly

### Authentication Failing

**Symptom:** Valid tokens rejected with 401

**Solution:**
1. Check JWT secret configuration
2. Verify token is not expired
3. Check server logs for JWT verification errors
4. Use debug endpoint: `/make-server-6fcaeea3/debug/verify-jwt`

### Tenant Context Not Set

**Symptom:** No tenant access logs in console

**Solution:**
1. Check JWT payload includes `clientId` and `siteId`
2. Verify `verifyAdmin` middleware is setting tenant context
3. Check server logs for tenant context information

### Performance Issues

**Symptom:** Slow response times after integration

**Solution:**
1. Check rate limit store size (should auto-cleanup)
2. Verify no database queries in middleware
3. Check server logs for errors or warnings

---

## Next Steps After Testing

Once all tests pass:

1. **Optional:** Update API endpoints to use `applyTenantFilters()` (30-60 min)
2. **Deploy to production** when ready
3. **Monitor** rate limiting and tenant access logs
4. **Adjust** rate limits if needed based on usage patterns

---

## Support

If you encounter issues:

1. Check server logs for detailed error messages
2. Review `MIDDLEWARE_INTEGRATION_COMPLETE.md` for usage examples
3. Check `CRITICAL_ITEMS_STATUS.md` for current status
4. Review middleware source code in `middleware/` directory

---

**Testing Time:** ~40 minutes total

**Result:** Confidence that authentication and tenant isolation are working correctly! 🎉

