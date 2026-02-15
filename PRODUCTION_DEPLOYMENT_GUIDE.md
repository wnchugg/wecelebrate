# Production Deployment Guide

**Date:** February 15, 2026  
**Version:** 2.0 (Database-backed)  
**Status:** Ready for Implementation

---

## Overview

This guide provides step-by-step instructions for deploying the refactored database system to production. Follow these steps in order to ensure a smooth deployment.

---

## Pre-Deployment Checklist

### Code Readiness ✅
- [x] All tests passing (95+ tests, 100% success rate)
- [x] TypeScript compilation successful
- [x] No critical security vulnerabilities
- [x] Documentation complete

### Infrastructure Readiness ⏳
- [ ] Production Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Backup strategy configured

### Security Readiness ✅
- [x] Authentication middleware created
- [x] Multi-tenant isolation middleware created
- [x] Error handling middleware created
- [x] Rate limiting middleware created

---

## Step 1: Set Up Production Environment (1-2 hours)

### 1.1 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name:** WeCelebrate Production
   - **Database Password:** (Generate strong password)
   - **Region:** (Choose closest to users)
   - **Pricing Plan:** Pro or higher

4. Wait for project to be provisioned (~2 minutes)

### 1.2 Configure Environment Variables

Create `.env.production` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
API_KEY=your-secure-api-key-here

# Environment
NODE_ENV=production
```

**Security Notes:**
- Never commit `.env.production` to git
- Use strong, randomly generated keys
- Rotate keys regularly
- Store securely (use secrets manager)

### 1.3 Configure Supabase Settings

In Supabase Dashboard:

1. **Authentication:**
   - Enable Email/Password auth
   - Configure JWT expiry (default: 1 hour)
   - Set up password requirements

2. **Database:**
   - Enable connection pooling
   - Set max connections: 100
   - Configure statement timeout: 30s

3. **API:**
   - Enable RLS (Row Level Security)
   - Configure CORS origins
   - Set rate limits

---

## Step 2: Deploy Database Schema (30 minutes)

### 2.1 Deploy Main Schema

1. Open Supabase SQL Editor
2. Copy contents of `supabase/functions/server/database/schema.sql`
3. Execute SQL
4. Verify all tables created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- clients
- sites
- catalogs
- products
- orders
- employees
- site_product_exclusions
- analytics_events
- admin_users
- audit_logs
- site_catalog_assignments
- site_price_overrides
- site_category_exclusions

### 2.2 Deploy Site Catalog Config Schema

1. Copy contents of `supabase/functions/server/database/site_catalog_config_schema.sql`
2. Execute SQL
3. Verify tables created

### 2.3 Verify Indexes

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should see 50+ indexes.

### 2.4 Verify Constraints

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
```

---

## Step 3: Configure Backup Strategy (1 hour)

### 3.1 Enable Automated Backups

In Supabase Dashboard → Settings → Database:

1. **Point-in-Time Recovery (PITR):**
   - Enable PITR
   - Retention: 7 days minimum

2. **Daily Backups:**
   - Enabled by default on Pro plan
   - Retention: 30 days

### 3.2 Test Backup Restoration

1. Create test backup:
```sql
-- Create test data
INSERT INTO clients (name, contact_email, status)
VALUES ('Test Backup Client', 'test@example.com', 'active');
```

2. Note the timestamp
3. In Dashboard → Database → Backups:
   - Click "Restore"
   - Select timestamp
   - Restore to test project (not production!)

4. Verify data restored correctly

### 3.3 Document Backup Procedures

Create `BACKUP_PROCEDURES.md`:
- How to create manual backup
- How to restore from backup
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Contact information for emergencies

---

## Step 4: Migrate Data (3-4 hours)

### 4.1 Export Data from KV Store

Create migration script:

```typescript
// supabase/functions/server/database/export_kv_data.ts
import * as kv from '../kv_env.ts';

async function exportData() {
  // Export clients
  const clients = await kv.getByPrefix('clients:');
  
  // Export sites
  const sites = await kv.getByPrefix('sites:');
  
  // Export products
  const products = await kv.getByPrefix('gifts:');
  
  // Export orders
  const orders = await kv.getByPrefix('orders:');
  
  // Save to JSON files
  await Deno.writeTextFile('clients.json', JSON.stringify(clients, null, 2));
  await Deno.writeTextFile('sites.json', JSON.stringify(sites, null, 2));
  await Deno.writeTextFile('products.json', JSON.stringify(products, null, 2));
  await Deno.writeTextFile('orders.json', JSON.stringify(orders, null, 2));
}

exportData();
```

### 4.2 Transform and Import Data

```typescript
// supabase/functions/server/database/import_data.ts
import * as db from './db.ts';

async function importData() {
  // Read exported data
  const clientsData = JSON.parse(await Deno.readTextFile('clients.json'));
  const sitesData = JSON.parse(await Deno.readTextFile('sites.json'));
  const productsData = JSON.parse(await Deno.readTextFile('products.json'));
  const ordersData = JSON.parse(await Deno.readTextFile('orders.json'));
  
  // Import clients
  for (const client of clientsData) {
    await db.insertClient(transformClient(client));
  }
  
  // Import sites
  for (const site of sitesData) {
    await db.createSite(transformSite(site));
  }
  
  // Import products
  for (const product of productsData) {
    await db.createProduct(transformProduct(product));
  }
  
  // Import orders
  for (const order of ordersData) {
    await db.createOrder(transformOrder(order));
  }
}

function transformClient(kvClient: any) {
  return {
    name: kvClient.name,
    contact_email: kvClient.contact_email,
    status: kvClient.status || 'active',
    // ... map other fields
  };
}

// Similar transform functions for other entities

importData();
```

### 4.3 Verify Data Integrity

```sql
-- Check record counts
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'sites', COUNT(*) FROM sites
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Verify foreign key relationships
SELECT 
  COUNT(*) as orphaned_sites
FROM sites s
LEFT JOIN clients c ON s.client_id = c.id
WHERE c.id IS NULL;

-- Should return 0 orphaned records
```

---

## Step 5: Deploy Application Code (1 hour)

### 5.1 Update Route Registration

In `supabase/functions/server/index.tsx`, add middleware:

```typescript
import { Hono } from 'npm:hono';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.ts';
import { tenantIsolationMiddleware } from './middleware/tenant.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { ipRateLimit, userRateLimit } from './middleware/rateLimit.ts';

const app = new Hono();

// Global middleware
app.use('*', ipRateLimit);  // Rate limit by IP
app.onError(errorHandler);  // Global error handler

// Public routes (no auth required)
app.get('/health', (c) => c.json({ status: 'ok' }));

// Protected routes (auth required)
app.use('/api/*', authMiddleware);  // Require authentication
app.use('/api/*', tenantIsolationMiddleware);  // Enforce tenant isolation
app.use('/api/*', userRateLimit);  // Rate limit by user

// Register API routes
import * as giftsApi from './gifts_api_v2.ts';
import catalogsApi from './catalogs_api_v2.ts';
import siteCatalogConfigApi from './site-catalog-config_api_v2.ts';

giftsApi.setupGiftsRoutes(app);
app.route('/api/catalogs', catalogsApi);
app.route('/api/sites', siteCatalogConfigApi);

export default app;
```

### 5.2 Deploy to Supabase Edge Functions

```bash
# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy server --no-verify-jwt

# Verify deployment
curl https://your-project.supabase.co/functions/v1/server/health
```

### 5.3 Test Deployment

```bash
# Test authentication
curl -X GET \
  https://your-project.supabase.co/functions/v1/server/api/products \
  -H "Authorization: Bearer your-jwt-token"

# Should return products or 401 if token invalid
```

---

## Step 6: Configure Monitoring (1-2 hours)

### 6.1 Set Up Supabase Monitoring

In Supabase Dashboard → Observability:

1. **Database Metrics:**
   - Enable query performance monitoring
   - Set alert for slow queries (>200ms)
   - Monitor connection pool usage

2. **API Metrics:**
   - Monitor request rate
   - Track error rates
   - Set alert for high error rate (>1%)

3. **Resource Metrics:**
   - Monitor CPU usage
   - Monitor memory usage
   - Set alert for high usage (>80%)

### 6.2 Set Up External Monitoring (Optional)

**Option A: Sentry for Error Tracking**

```typescript
import * as Sentry from '@sentry/deno';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
  tracesSampleRate: 0.1,
});

// Add to error handler
app.onError((err, c) => {
  Sentry.captureException(err);
  return errorHandler(err, c);
});
```

**Option B: New Relic for APM**

```typescript
import newrelic from 'newrelic';

// Add to each route
app.use('*', async (c, next) => {
  const transaction = newrelic.startWebTransaction(c.req.path);
  await next();
  transaction.end();
});
```

### 6.3 Set Up Alerts

Configure alerts for:
- Error rate > 1%
- Response time > 500ms (p95)
- Database connections > 80%
- Disk usage > 80%
- Failed authentication attempts > 100/hour

---

## Step 7: Final Verification (30 minutes)

### 7.1 Smoke Tests

Run through critical user flows:

1. **Authentication:**
```bash
# Login
curl -X POST \
  https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: your-anon-key" \
  -d '{"email":"test@example.com","password":"password"}'
```

2. **Product Listing:**
```bash
curl -X GET \
  https://your-project.supabase.co/functions/v1/server/api/products \
  -H "Authorization: Bearer $TOKEN"
```

3. **Order Creation:**
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/server/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"...","quantity":1,...}'
```

### 7.2 Performance Tests

```bash
# Run load test
ab -n 1000 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  https://your-project.supabase.co/functions/v1/server/api/products
```

Expected results:
- Average response time < 100ms
- No failed requests
- No errors in logs

### 7.3 Security Tests

1. **Test authentication:**
   - Try accessing API without token (should get 401)
   - Try with invalid token (should get 401)
   - Try with expired token (should get 401)

2. **Test tenant isolation:**
   - Try accessing another tenant's data (should get 403)
   - Verify data is properly filtered

3. **Test rate limiting:**
   - Make 101 requests rapidly (should get 429)
   - Wait and try again (should work)

---

## Step 8: Go Live (30 minutes)

### 8.1 Update DNS/Load Balancer

Point production traffic to new deployment:

```bash
# Update DNS record
# production.wecelebrate.com → your-project.supabase.co
```

### 8.2 Monitor Closely

For the first 24 hours:
- Check error logs every hour
- Monitor performance metrics
- Watch for unusual patterns
- Be ready to rollback if needed

### 8.3 Gradual Rollout (Recommended)

Instead of switching all traffic at once:

1. **Day 1:** 10% of traffic
2. **Day 2:** 25% of traffic
3. **Day 3:** 50% of traffic
4. **Day 4:** 75% of traffic
5. **Day 5:** 100% of traffic

Monitor at each stage before increasing.

---

## Rollback Procedure

If issues are encountered:

### Quick Rollback (5 minutes)

1. **Revert DNS:**
```bash
# Point back to old system
production.wecelebrate.com → old-system.com
```

2. **Verify old system working:**
```bash
curl https://old-system.com/health
```

### Full Rollback (30 minutes)

1. Stop new deployment
2. Restore database from backup
3. Revert code deployment
4. Update DNS
5. Verify functionality
6. Investigate issues

---

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Review logs for issues

### Week 1
- [ ] Analyze performance trends
- [ ] Optimize slow queries
- [ ] Review security logs
- [ ] Gather user feedback

### Month 1
- [ ] Performance review
- [ ] Security audit
- [ ] Capacity planning
- [ ] Documentation updates

---

## Support & Escalation

### On-Call Rotation
- Primary: [Name] - [Phone]
- Secondary: [Name] - [Phone]
- Manager: [Name] - [Phone]

### Escalation Path
1. Check monitoring dashboards
2. Review error logs
3. Contact on-call engineer
4. Escalate to manager if critical

### Emergency Contacts
- Supabase Support: support@supabase.com
- Database Admin: [Email]
- Security Team: [Email]

---

## Success Criteria

Deployment is successful when:
- ✅ All smoke tests passing
- ✅ Error rate < 0.1%
- ✅ Response time < 100ms (p95)
- ✅ No data loss
- ✅ All features working
- ✅ Monitoring operational
- ✅ Backups verified

---

## Appendix

### A. Environment Variables Reference

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
API_KEY=your-api-key
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

### B. Useful SQL Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### C. Troubleshooting Guide

**Issue: High response times**
- Check database connection pool
- Review slow query log
- Check for missing indexes
- Verify caching working

**Issue: Authentication failures**
- Verify JWT secret configured
- Check token expiry settings
- Review auth logs
- Test token generation

**Issue: Data not showing**
- Check tenant isolation filters
- Verify foreign key relationships
- Review RLS policies
- Check user permissions

---

**Deployment Guide Version:** 1.0  
**Last Updated:** February 15, 2026  
**Next Review:** After first production deployment
