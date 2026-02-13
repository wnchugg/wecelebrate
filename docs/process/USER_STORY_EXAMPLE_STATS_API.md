# User Story Example: Dashboard Statistics API

**Story ID:** US-001  
**Epic:** EPC-001 - Dashboard Production Readiness  
**Status:** ✅ Complete  
**Priority:** P0 - Critical  
**Points:** 5  
**Sprint:** Sprint 5 - Week of Feb 12, 2026

**Team:**
- Assignee: Backend Developer
- Reviewer: Tech Lead
- QA: QA Engineer

---

## 📝 User Story

**As a** platform administrator  
**I want** a backend API that provides real-time dashboard statistics  
**So that** I can see accurate, up-to-date metrics about orders, celebrations, and gifts without relying on mock data

---

## 🎯 Business Value

### Why This Matters

Currently, the admin dashboard uses hardcoded mock data, which:
- Provides inaccurate information to decision-makers
- Requires manual updates (time-consuming)
- Reduces trust in the platform
- Cannot reflect real-time changes

This API will enable:
- **Real-time visibility** into platform metrics
- **Accurate decision-making** based on current data
- **Automatic updates** without manual intervention
- **Increased user trust** in platform reliability

### Impact

- **Admin Users:** Get real-time, accurate dashboard data
- **Business Team:** Make data-driven decisions
- **Development Team:** Have reliable API for future features

---

## ✅ Acceptance Criteria

### AC1: Basic Statistics Endpoint

**Given** I am an authenticated admin user  
**When** I call GET `/dashboard/stats/:siteId?timeRange=30d`  
**Then** I receive statistics for that site within the time range

**Response includes:**
```json
{
  "stats": {
    "totalOrders": 1234,
    "totalCelebrations": 567,
    "totalGifts": 890
  },
  "growth": {
    "ordersGrowth": 15.5,
    "celebrationsGrowth": -5.2,
    "giftsGrowth": 22.3
  },
  "timeRange": "30d",
  "previousPeriod": {
    "totalOrders": 1070,
    "totalCelebrations": 598,
    "totalGifts": 728
  }
}
```

### AC2: Time Range Support

**Given** I am an authenticated admin user  
**When** I specify different time ranges  
**Then** I receive statistics for each time range

**Supported time ranges:**
- `7d` - Last 7 days
- `30d` - Last 30 days (default)
- `90d` - Last 90 days
- `1y` - Last 1 year

### AC3: Growth Percentage Calculation

**Given** statistics for current and previous periods  
**When** the API calculates growth  
**Then** growth percentage is calculated as: `((current - previous) / previous) * 100`

**Examples:**
- Current: 100, Previous: 80 → Growth: +25%
- Current: 80, Previous: 100 → Growth: -20%
- Current: 100, Previous: 0 → Growth: 0% (handle division by zero)

### AC4: Environment Isolation

**Given** the API is called  
**When** an environment header is provided  
**Then** statistics are filtered to that environment (dev/test/prod)

**Environment header:**
```
X-Environment-ID: test
```

### AC5: Authentication Required

**Given** I call the API without authentication  
**When** I make the request  
**Then** I receive a 401 Unauthorized error

### AC6: Authorization Check

**Given** I am authenticated but not an admin  
**When** I call the API  
**Then** I receive a 403 Forbidden error

### AC7: Site Access Validation

**Given** I am an admin for Site A  
**When** I request stats for Site B (not my site)  
**Then** I receive a 403 Forbidden error

### AC8: Invalid Time Range

**Given** I specify an invalid time range  
**When** I call the API  
**Then** I receive a 400 Bad Request with clear error message

### AC9: Performance

**Given** the database has 10,000+ orders  
**When** I call the API  
**Then** response time is under 500ms

### AC10: Error Handling

**Given** a database error occurs  
**When** I call the API  
**Then** I receive a 500 error with sanitized error message (no sensitive data exposed)

---

## 🔧 Technical Requirements

### Backend

#### API Endpoint

```typescript
// Route: GET /make-server-6fcaeea3/dashboard/stats/:siteId
// Query params: ?timeRange=30d

interface DashboardStatsRequest {
  siteId: string;          // From URL parameter
  timeRange?: '7d' | '30d' | '90d' | '1y';  // Query param (default: 30d)
  environmentId?: string;  // From header X-Environment-ID
}

interface DashboardStatsResponse {
  success: boolean;
  data: {
    stats: {
      totalOrders: number;
      totalCelebrations: number;
      totalGifts: number;
    };
    growth: {
      ordersGrowth: number;
      celebrationsGrowth: number;
      giftsGrowth: number;
    };
    timeRange: string;
    previousPeriod: {
      totalOrders: number;
      totalCelebrations: number;
      totalGifts: number;
    };
  };
  error?: string;
}
```

#### Database Queries

**Current Period Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE key LIKE 'order:%') as total_orders,
  COUNT(*) FILTER (WHERE key LIKE 'celebration:%') as total_celebrations,
  COUNT(*) FILTER (WHERE key LIKE 'gift:%') as total_gifts
FROM kv_store_6fcaeea3
WHERE 
  value->>'siteId' = $siteId
  AND value->>'environmentId' = $environmentId
  AND (value->>'createdAt')::timestamp >= NOW() - INTERVAL '$timeRange'
```

**Previous Period Query:**
```sql
-- Same as above but with date range shifted back by timeRange
```

#### Business Logic

1. **Validate Request**
   - Check authentication (JWT token)
   - Check authorization (admin role)
   - Validate siteId access
   - Validate timeRange parameter

2. **Calculate Date Ranges**
   - Current period: `NOW() - timeRange` to `NOW()`
   - Previous period: `NOW() - (2 * timeRange)` to `NOW() - timeRange`

3. **Fetch Data**
   - Query current period stats
   - Query previous period stats

4. **Calculate Growth**
   - For each metric: `((current - previous) / previous) * 100`
   - Handle division by zero (return 0)
   - Round to 1 decimal place

5. **Return Response**
   - Format as DashboardStatsResponse
   - Include all required fields

### Database

**No schema changes required** - Uses existing `kv_store_6fcaeea3` table

**Indexes needed:**
```sql
-- Composite index for performance
CREATE INDEX IF NOT EXISTS idx_kv_site_env_created 
ON kv_store_6fcaeea3 (
  (value->>'siteId'),
  (value->>'environmentId'),
  (value->>'createdAt')
);
```

### API Authentication

```typescript
// Verify JWT token from Authorization header
const token = request.headers.get('Authorization')?.split(' ')[1];
const { data: { user }, error } = await supabase.auth.getUser(token);

if (!user) {
  return new Response(
    JSON.stringify({ success: false, error: 'Unauthorized' }),
    { status: 401 }
  );
}

// Verify admin role
const role = user.user_metadata?.role;
if (role !== 'admin' && role !== 'super_admin') {
  return new Response(
    JSON.stringify({ success: false, error: 'Forbidden' }),
    { status: 403 }
  );
}
```

---

## 🧪 Test Plan

### Unit Tests (10 tests)

#### Test Suite: Dashboard Stats Endpoint

**Test 1: Successful Stats Retrieval**
```typescript
test('returns stats for valid request', async () => {
  const response = await fetch('/dashboard/stats/site123?timeRange=30d', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.data.stats).toHaveProperty('totalOrders');
  expect(data.data.growth).toHaveProperty('ordersGrowth');
});
```

**Test 2: Default Time Range**
```typescript
test('uses 30d as default time range', async () => {
  const response = await fetch('/dashboard/stats/site123', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  const data = await response.json();
  expect(data.data.timeRange).toBe('30d');
});
```

**Test 3: Custom Time Ranges**
```typescript
test.each(['7d', '30d', '90d', '1y'])('supports %s time range', async (timeRange) => {
  const response = await fetch(`/dashboard/stats/site123?timeRange=${timeRange}`, {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  const data = await response.json();
  expect(data.data.timeRange).toBe(timeRange);
});
```

**Test 4: Growth Calculation**
```typescript
test('calculates growth percentage correctly', async () => {
  // Mock data: current=120, previous=100
  const response = await fetch('/dashboard/stats/site123', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  const data = await response.json();
  // Expected growth: ((120-100)/100)*100 = 20%
  expect(data.data.growth.ordersGrowth).toBe(20.0);
});
```

**Test 5: Negative Growth**
```typescript
test('handles negative growth', async () => {
  // Mock data: current=80, previous=100
  const response = await fetch('/dashboard/stats/site123', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  const data = await response.json();
  // Expected growth: ((80-100)/100)*100 = -20%
  expect(data.data.growth.ordersGrowth).toBe(-20.0);
});
```

**Test 6: Division by Zero**
```typescript
test('handles division by zero in growth calculation', async () => {
  // Mock data: current=100, previous=0
  const response = await fetch('/dashboard/stats/site123', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  const data = await response.json();
  expect(data.data.growth.ordersGrowth).toBe(0);
});
```

**Test 7: Authentication Required**
```typescript
test('returns 401 without authentication', async () => {
  const response = await fetch('/dashboard/stats/site123');
  
  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data.success).toBe(false);
  expect(data.error).toBe('Unauthorized');
});
```

**Test 8: Authorization Check**
```typescript
test('returns 403 for non-admin users', async () => {
  const response = await fetch('/dashboard/stats/site123', {
    headers: { Authorization: 'Bearer employeeToken' }
  });
  
  expect(response.status).toBe(403);
  const data = await response.json();
  expect(data.error).toBe('Forbidden');
});
```

**Test 9: Invalid Time Range**
```typescript
test('returns 400 for invalid time range', async () => {
  const response = await fetch('/dashboard/stats/site123?timeRange=invalid', {
    headers: { Authorization: 'Bearer validToken' }
  });
  
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toContain('Invalid time range');
});
```

**Test 10: Environment Isolation**
```typescript
test('filters data by environment', async () => {
  const testResponse = await fetch('/dashboard/stats/site123', {
    headers: { 
      Authorization: 'Bearer validToken',
      'X-Environment-ID': 'test'
    }
  });
  
  const prodResponse = await fetch('/dashboard/stats/site123', {
    headers: { 
      Authorization: 'Bearer validToken',
      'X-Environment-ID': 'prod'
    }
  });
  
  const testData = await testResponse.json();
  const prodData = await prodResponse.json();
  
  // Test and prod should have different stats
  expect(testData.data.stats).not.toEqual(prodData.data.stats);
});
```

### Integration Tests (Covered in Epic)

- Full data flow: Frontend → Service → API → Database
- End-to-end user flow testing
- Performance under load

### Manual Test Cases

#### Test Case 1: Happy Path
1. Log in as admin
2. Navigate to dashboard
3. Verify stats load correctly
4. Change time range to 7d
5. Verify stats update

**Expected:** All stats display correctly, growth percentages accurate

#### Test Case 2: No Data Scenario
1. Select site with no orders
2. View dashboard
3. Verify empty state displays

**Expected:** "No data available" message, growth at 0%

#### Test Case 3: Large Dataset
1. Select site with 10,000+ orders
2. View dashboard
3. Measure load time

**Expected:** Loads in under 500ms

---

## 📋 Tasks

### Backend Tasks

- [x] **TSK-001:** Create `/dashboard/stats/:siteId` endpoint
  - Estimate: 2 hours
  - Assignee: Backend Developer

- [x] **TSK-002:** Implement authentication/authorization middleware
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-003:** Write database queries for current period
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-004:** Write database queries for previous period
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-005:** Implement growth percentage calculation
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-006:** Add environment isolation logic
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-007:** Implement error handling
  - Estimate: 1 hour
  - Assignee: Backend Developer

### Testing Tasks

- [x] **TSK-008:** Write 10 unit tests
  - Estimate: 3 hours
  - Assignee: Backend Developer

- [x] **TSK-009:** Manual QA testing
  - Estimate: 1 hour
  - Assignee: QA Engineer

- [x] **TSK-010:** Performance testing
  - Estimate: 1 hour
  - Assignee: QA Engineer

### Documentation Tasks

- [x] **TSK-011:** Write API documentation
  - Estimate: 1 hour
  - Assignee: Backend Developer

- [x] **TSK-012:** Update backend README
  - Estimate: 0.5 hours
  - Assignee: Backend Developer

**Total Estimate:** 14.5 hours  
**Actual Time:** 12 hours ✅

---

## 🎨 Design

**Not applicable** - Backend API only, no UI changes

---

## 🔗 Dependencies

### Depends On
- [x] Authentication system functional
- [x] Database with order/celebration/gift data
- [x] Supabase backend configured

### Blocks
- US-004: Dashboard Service (needs this API)
- US-005: Dashboard UI (indirectly)

### Related
- US-002: Recent Orders API
- US-003: Popular Gifts API

---

## 📚 Documentation

### API Documentation

```markdown
## GET /dashboard/stats/:siteId

Get dashboard statistics for a site.

### Parameters

**Path Parameters:**
- `siteId` (string, required): Site ID to get stats for

**Query Parameters:**
- `timeRange` (string, optional): Time range for stats
  - Values: `7d`, `30d`, `90d`, `1y`
  - Default: `30d`

**Headers:**
- `Authorization` (string, required): Bearer token
- `X-Environment-ID` (string, optional): Environment filter

### Response

**200 OK:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 1234,
      "totalCelebrations": 567,
      "totalGifts": 890
    },
    "growth": {
      "ordersGrowth": 15.5,
      "celebrationsGrowth": -5.2,
      "giftsGrowth": 22.3
    },
    "timeRange": "30d",
    "previousPeriod": {
      "totalOrders": 1070,
      "totalCelebrations": 598,
      "totalGifts": 728
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Forbidden: Insufficient permissions"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid time range. Must be one of: 7d, 30d, 90d, 1y"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to fetch dashboard statistics"
}
```

### Example

```bash
curl -X GET \
  'https://project.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/stats/site123?timeRange=30d' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Environment-ID: prod'
```
```

---

## ✅ Definition of Ready Checklist

- [x] User story clearly written
- [x] Acceptance criteria defined (10 scenarios)
- [x] Business value articulated
- [x] Technical approach agreed upon
- [x] Backend requirements documented
- [x] API contract defined
- [x] Database queries identified
- [x] No schema changes needed
- [x] Dependencies identified and resolved
- [x] Story estimated (5 points)
- [x] Story is right-sized (can complete in 2-3 days)
- [x] Tasks identified (12 tasks)
- [x] Test scenarios documented (10 unit tests)
- [x] Security requirements identified
- [x] Product Owner reviewed and approved
- [x] Tech Lead reviewed and approved
- [x] Team understands requirements

**DoR Status:** ✅ **READY FOR DEVELOPMENT**

---

## ✅ Definition of Done Checklist

### Code

- [x] Code written and follows standards
- [x] TypeScript types defined
- [x] No TypeScript errors
- [x] Code properly formatted (linting passes)
- [x] Code reviewed by Tech Lead
- [x] Code merged to main branch

### Testing

- [x] 10 unit tests written
- [x] All tests passing (100%)
- [x] Error cases tested
- [x] Edge cases tested
- [x] Authentication tested
- [x] Authorization tested
- [x] Performance tested (< 500ms)
- [x] Manual QA complete

### Functionality

- [x] All 10 acceptance criteria met
- [x] Returns correct statistics
- [x] Growth calculation accurate
- [x] Time ranges work correctly
- [x] Environment isolation works
- [x] Authentication enforced
- [x] Authorization enforced
- [x] Error handling comprehensive

### Performance

- [x] Response time < 500ms
- [x] Handles 10,000+ orders
- [x] No performance regressions
- [x] Database indexes added

### Security

- [x] Authentication required
- [x] Authorization checks in place
- [x] Input validation complete
- [x] Error messages sanitized
- [x] No sensitive data exposed

### Documentation

- [x] API endpoint documented
- [x] Request/response examples provided
- [x] Error codes documented
- [x] Code comments added
- [x] Backend README updated

### Deployment

- [x] Deployed to test environment
- [x] Tested in test environment
- [x] Deployed to production
- [x] Smoke tests passed

### Approval

- [x] QA approved
- [x] Tech Lead approved
- [x] Product Owner accepted

**DoD Status:** ✅ **DONE - PRODUCTION READY**

---

## 📝 Notes

### Implementation Notes

- Used existing `kv_store_6fcaeea3` table
- No schema changes required
- Added composite index for performance
- Growth calculation handles division by zero
- Environment isolation via header

### Technical Decisions

1. **Why composite index?**
   - Queries filter by siteId, environmentId, and createdAt
   - Composite index provides best performance
   - Covers all query patterns

2. **Why 30d default?**
   - Most common use case
   - Balances recency with data volume
   - Matches business requirements

3. **Why round growth to 1 decimal?**
   - Sufficient precision for dashboard
   - Cleaner UI display
   - Prevents float precision issues

### Known Limitations

- Maximum time range is 1 year
- Does not support custom date ranges (future enhancement)
- Growth calculation is simple (not compound)

### Future Enhancements

- [ ] Add custom date range support
- [ ] Add caching layer (Redis)
- [ ] Add real-time WebSocket updates
- [ ] Add more granular metrics (daily/weekly breakdown)
- [ ] Add comparison to other sites

---

## 🎉 Completion

**Story Status:** ✅ **COMPLETE**  
**Completed:** February 12, 2026  
**Actual Time:** 12 hours (vs 14.5 estimated)  
**Tests:** 10/10 passing ✅  
**DoD Met:** 100% ✅

---

**This story serves as a reference example for writing detailed user stories in the wecelebrate platform.**
