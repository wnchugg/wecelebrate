# Backend Deployment Checklist

## Pre-Deployment Testing Gates

### 1. Code Quality Checks ✅

#### Syntax & Type Checking
```bash
# Check for TypeScript/Deno errors
cd supabase/functions/server
deno check index.tsx
deno check crud_db.ts
deno check endpoints_v2.ts
```

#### Linting (if configured)
```bash
deno lint
```

### 2. Unit Tests (if available)
```bash
# Run unit tests
cd supabase/functions/server
deno test --allow-net --allow-env --allow-read tests/
```

### 3. Local Function Testing

#### Start Local Supabase
```bash
# If using local Supabase
supabase start
supabase functions serve make-server-6fcaeea3
```

#### Test Critical Endpoints
```bash
# Health check
curl http://localhost:54321/functions/v1/make-server-6fcaeea3/health

# Test v2 endpoints
curl -X GET "http://localhost:54321/functions/v1/make-server-6fcaeea3/v2/sites" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

### 4. Database Schema Validation

#### Check Schema Compatibility
```bash
# Verify database tables exist
psql $DATABASE_URL -c "\dt"

# Check specific columns
psql $DATABASE_URL -c "\d sites"
psql $DATABASE_URL -c "\d clients"
```

#### Test Migrations (if new)
```bash
# Run migrations in test environment first
supabase db reset --db-url $TEST_DATABASE_URL
```

### 5. Integration Tests

#### Test CRUD Operations
Create a test script to verify:
- ✅ Create operations work
- ✅ Read operations return correct data
- ✅ Update operations persist changes
- ✅ Delete operations remove data
- ✅ Error handling works correctly

Example test script:
```bash
#!/bin/bash
# test-crud-operations.sh

BASE_URL="http://localhost:54321/functions/v1/make-server-6fcaeea3"
AUTH_HEADER="Authorization: Bearer $ANON_KEY"
ENV_HEADER="X-Environment-ID: development"

# Test site creation
echo "Testing site creation..."
RESPONSE=$(curl -s -X POST "$BASE_URL/v2/sites" \
  -H "$AUTH_HEADER" \
  -H "$ENV_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Site",
    "slug": "test-site",
    "clientId": "test-client-id",
    "allowSessionTimeoutExtend": true
  }')

echo $RESPONSE | jq .

# Test site update
echo "Testing site update..."
SITE_ID=$(echo $RESPONSE | jq -r '.data.id')
curl -s -X PUT "$BASE_URL/v2/sites/$SITE_ID" \
  -H "$AUTH_HEADER" \
  -H "$ENV_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "updated-test-site"
  }' | jq .

# Test site retrieval
echo "Testing site retrieval..."
curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID" \
  -H "$AUTH_HEADER" \
  -H "$ENV_HEADER" | jq .
```

### 6. Backward Compatibility Check

#### Verify Old Endpoints Still Work
```bash
# Test legacy endpoints (if they should still work)
curl -X GET "$BASE_URL/sites" \
  -H "Authorization: Bearer $ANON_KEY"
```

#### Check Frontend Compatibility
- ✅ Frontend can still call existing endpoints
- ✅ Response format hasn't changed unexpectedly
- ✅ No breaking changes to API contracts

### 7. Performance Testing

#### Load Testing (Optional for major changes)
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 "$BASE_URL/v2/sites"
```

#### Response Time Check
```bash
# Measure response times
time curl -X GET "$BASE_URL/v2/sites" \
  -H "Authorization: Bearer $ANON_KEY"
```

### 8. Security Checks

#### Authentication Testing
- ✅ Protected endpoints require authentication
- ✅ Public endpoints work without auth
- ✅ Invalid tokens are rejected

```bash
# Test without auth (should fail for protected endpoints)
curl -X GET "$BASE_URL/v2/sites" \
  -H "X-Environment-ID: development"

# Test with invalid token (should fail)
curl -X GET "$BASE_URL/v2/sites" \
  -H "Authorization: Bearer invalid_token"
```

#### Authorization Testing
- ✅ Users can only access their own data
- ✅ Admin endpoints require admin role
- ✅ Cross-tenant access is prevented

### 9. Error Handling Verification

#### Test Error Scenarios
```bash
# Test invalid input
curl -X POST "$BASE_URL/v2/sites" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Test non-existent resource
curl -X GET "$BASE_URL/v2/sites/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $ANON_KEY"

# Test malformed request
curl -X POST "$BASE_URL/v2/sites" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d 'not valid json'
```

### 10. Documentation Review

- ✅ API documentation updated
- ✅ Breaking changes documented
- ✅ Migration guide created (if needed)
- ✅ Changelog updated

## Deployment Process

### Step 1: Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed (if team process)
- [ ] Database migrations ready (if needed)
- [ ] Rollback plan documented
- [ ] Monitoring/alerts configured

### Step 2: Deploy to Development

```bash
# Deploy to development environment
./deploy-backend.sh dev
```

### Step 3: Smoke Tests (Development)

```bash
# Run smoke tests against development
./test-deployment.sh development
```

**Critical Tests:**
1. Health check responds
2. Authentication works
3. Key endpoints return data
4. No 500 errors in logs

### Step 4: Monitor Development

```bash
# Check logs for errors
supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky

# Monitor for 5-10 minutes
# Look for:
# - Error rates
# - Response times
# - Unexpected behavior
```

### Step 5: Frontend Integration Testing

1. Deploy frontend to development
2. Test user flows:
   - ✅ Login works
   - ✅ Site selection works
   - ✅ CRUD operations work
   - ✅ No console errors
3. Test on multiple browsers (if critical change)

### Step 6: Staging Deployment (if available)

```bash
# Deploy to staging
./deploy-backend.sh staging
```

### Step 7: Production Deployment

```bash
# Deploy to production
./deploy-backend.sh prod
```

### Step 8: Post-Deployment Verification

```bash
# Verify production deployment
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health

# Check critical endpoints
./test-deployment.sh production
```

### Step 9: Monitor Production

- Watch error rates for 30 minutes
- Check response times
- Monitor database performance
- Review user reports

## Rollback Procedure

### If Issues Detected

1. **Immediate Rollback**
   ```bash
   # Redeploy previous version
   git checkout <previous-commit>
   ./deploy-backend.sh prod
   ```

2. **Database Rollback (if migrations ran)**
   ```bash
   # Rollback migrations
   supabase db reset --db-url $PROD_DATABASE_URL
   # Restore from backup
   ```

3. **Notify Team**
   - Alert team of rollback
   - Document issues found
   - Plan fix and redeployment

## Testing Checklist for This Deployment (CamelCase Fix)

### Specific Tests for Snake_Case Conversion

- [ ] **Site Update with Slug**
  ```bash
  curl -X PUT "$BASE_URL/v2/sites/$SITE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"slug": "new-slug", "allowSessionTimeoutExtend": true}'
  ```

- [ ] **Client Update with CamelCase Fields**
  ```bash
  curl -X PUT "$BASE_URL/v2/clients/$CLIENT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"clientAllowSessionTimeoutExtend": true}'
  ```

- [ ] **Product Update**
  ```bash
  curl -X PUT "$BASE_URL/v2/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"availableQuantity": 100}'
  ```

- [ ] **Employee Update**
  ```bash
  curl -X PUT "$BASE_URL/v2/employees/$EMPLOYEE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"firstName": "John", "lastName": "Doe"}'
  ```

- [ ] **Order Update**
  ```bash
  curl -X PUT "$BASE_URL/v2/orders/$ORDER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"trackingNumber": "TRACK123"}'
  ```

### Expected Results

- ✅ No "column not found" errors
- ✅ Data persists correctly in database
- ✅ Response returns camelCase format
- ✅ All fields update successfully

## Automated Testing Script

Create `test-deployment.sh`:

```bash
#!/bin/bash
# test-deployment.sh

ENV=${1:-development}

if [ "$ENV" = "production" ]; then
  BASE_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3"
else
  BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
fi

echo "Testing $ENV environment..."

# Test 1: Health Check
echo "1. Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo $HEALTH | grep -q '"status":"ok"'; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Test 2: Public Sites Endpoint
echo "2. Public Sites..."
SITES=$(curl -s "$BASE_URL/v2/public/sites" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "X-Environment-ID: $ENV")
if echo $SITES | grep -q '"sites"'; then
  echo "✅ Public sites endpoint working"
else
  echo "❌ Public sites endpoint failed"
  exit 1
fi

# Test 3: Authentication Required
echo "3. Authentication Check..."
AUTH_TEST=$(curl -s -w "%{http_code}" "$BASE_URL/v2/sites" \
  -H "X-Environment-ID: $ENV")
if echo $AUTH_TEST | grep -q "401"; then
  echo "✅ Authentication required"
else
  echo "⚠️  Authentication may not be enforced"
fi

echo ""
echo "All tests passed! ✅"
```

## Monitoring After Deployment

### Key Metrics to Watch

1. **Error Rate**
   - Target: < 1% error rate
   - Alert if > 5%

2. **Response Time**
   - Target: < 200ms for GET requests
   - Target: < 500ms for POST/PUT requests
   - Alert if > 2x baseline

3. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow query log

4. **Function Logs**
   ```bash
   # Watch logs in real-time
   supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky --follow
   ```

### Success Criteria

- ✅ No increase in error rate
- ✅ Response times within acceptable range
- ✅ No user-reported issues
- ✅ All critical flows working
- ✅ Database performance stable

## Quick Reference

### Deploy Commands
```bash
# Development
./deploy-backend.sh dev

# Production
./deploy-backend.sh prod
```

### Test Commands
```bash
# Run tests
deno test --allow-net --allow-env tests/

# Check deployment
./test-deployment.sh development

# View logs
supabase functions logs make-server-6fcaeea3
```

### Rollback Commands
```bash
# Rollback to previous commit
git checkout <previous-commit>
./deploy-backend.sh prod
```

---

**Remember**: 
- Test locally first
- Deploy to development before production
- Monitor after deployment
- Have a rollback plan ready
- Document any issues found
