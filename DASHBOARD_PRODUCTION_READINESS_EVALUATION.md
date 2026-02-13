# Site Dashboard Production Readiness Evaluation

**Date:** February 12, 2026  
**Component:** `/src/app/pages/admin/Dashboard.tsx`  
**Status:** ⚠️ Using Mock Data - Not Production Ready

---

## Executive Summary

The Site Dashboard is currently **NOT production-ready** and requires significant backend and frontend implementation to replace hardcoded mock data with real-time data from the database. This evaluation outlines the specific gaps and implementation requirements.

---

## Current State Analysis

### 1. Mock Data Usage

The dashboard currently uses **three sources of hardcoded mock data**:

#### a. Stats Cards (Lines 8-41)
```typescript
const stats = [
  { name: 'Total Orders', value: '1,284', change: '+12.5%', trend: 'up' },
  { name: 'Active Users', value: '856', change: '+8.2%', trend: 'up' },
  { name: 'Gifts Available', value: '47', change: '+3', trend: 'up' },
  { name: 'Pending Shipments', value: '23', change: '-5.1%', trend: 'down' }
];
```
**Issues:**
- Static values never update
- No site-specific filtering
- No real-time data
- Growth percentages are fake

#### b. Recent Orders (Lines 43-49)
```typescript
const recentOrders = [
  { id: 'ORD-1284', user: 'john.doe@company.com', gift: 'Premium Headphones', status: 'pending', date: '2026-02-05' },
  // ... more hardcoded orders
];
```
**Issues:**
- Shows same 5 orders for all sites
- No actual order data from database
- Dates don't update
- Not site-specific

#### c. Popular Gifts (Lines 51-57)
```typescript
const popularGifts = [
  { name: 'Premium Headphones', orders: 142, percentage: 85 },
  // ... more hardcoded gifts
];
```
**Issues:**
- Static gift popularity data
- No correlation to actual catalog
- Same for all sites
- Order counts never change

### 2. Missing Backend Integration

**Current Status:**
- ✅ Has `SiteContext` integration for current site
- ❌ No API calls to fetch dashboard data
- ❌ No loading states
- ❌ No error handling
- ❌ No refresh capability

### 3. Existing Backend Capabilities

The backend **already has** some relevant endpoints:

#### Catalog Statistics
- `GET /catalogs/:id/stats` - Returns catalog-level statistics
  - Total products
  - Active/inactive counts
  - Category distribution
  - Price ranges
  - Inventory levels

#### Order Management
- `GET /orders` - List orders (in `migrated_resources.ts`)
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- Orders can be filtered by `siteId`

#### Missing Dashboard-Specific Endpoints
- ❌ No `/dashboard/stats/:siteId` endpoint
- ❌ No `/dashboard/recent-orders/:siteId` endpoint
- ❌ No `/dashboard/popular-gifts/:siteId` endpoint
- ❌ No aggregate statistics by site
- ❌ No time-based filtering (7d, 30d, etc.)

---

## Implementation Requirements

### Phase 1: Backend API Development

#### 1.1 Dashboard Stats Endpoint
**Endpoint:** `GET /make-server-6fcaeea3/dashboard/stats/:siteId`

**Query Parameters:**
- `timeRange` (optional): '7d' | '30d' | '90d' | '1y'
- Default: '30d'

**Response:**
```typescript
{
  success: true,
  stats: {
    totalOrders: number;           // Total orders for site in time range
    previousOrders: number;        // Orders in previous period for comparison
    orderGrowth: number;           // Percentage change
    
    activeEmployees: number;       // Employees with active status
    previousActiveEmployees: number;
    employeeGrowth: number;
    
    giftsAvailable: number;        // Active gifts in site's catalog
    previousGiftsAvailable: number;
    giftsChange: number;
    
    pendingShipments: number;      // Orders with status 'pending' or 'confirmed'
    previousPendingShipments: number;
    pendingChange: number;
  },
  timeRange: string;
  generatedAt: string;
}
```

**Data Sources:**
- Orders: Query KV store for orders filtered by `siteId`
- Employees: Query KV store for employees filtered by `siteId`
- Gifts: Get site's catalog config and query catalog gifts
- Calculate growth by comparing current period vs previous period

#### 1.2 Recent Orders Endpoint
**Endpoint:** `GET /make-server-6fcaeea3/dashboard/recent-orders/:siteId`

**Query Parameters:**
- `limit` (optional): number, default 5
- `status` (optional): filter by order status

**Response:**
```typescript
{
  success: true,
  orders: Array<{
    id: string;
    orderNumber: string;
    employeeEmail: string;
    giftName: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: string;
  }>,
  total: number;
}
```

**Data Sources:**
- Query orders by `siteId`
- Join with employee data for email
- Join with gift data for name
- Sort by `createdAt` DESC
- Limit results

#### 1.3 Popular Gifts Endpoint
**Endpoint:** `GET /make-server-6fcaeea3/dashboard/popular-gifts/:siteId`

**Query Parameters:**
- `limit` (optional): number, default 5
- `timeRange` (optional): '7d' | '30d' | '90d' | '1y'

**Response:**
```typescript
{
  success: true,
  gifts: Array<{
    giftId: string;
    giftName: string;
    orderCount: number;
    percentage: number;  // Relative to total orders
  }>,
  totalOrders: number;
}
```

**Data Sources:**
- Query orders by `siteId` and time range
- Group by `giftId` and count
- Join with gift data for names
- Calculate percentages
- Sort by count DESC
- Limit results

### Phase 2: Frontend Service Layer

#### 2.1 Create Dashboard Service
**File:** `/src/app/services/dashboardService.ts`

```typescript
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface DashboardStats {
  totalOrders: number;
  orderGrowth: number;
  activeEmployees: number;
  employeeGrowth: number;
  giftsAvailable: number;
  giftsChange: number;
  pendingShipments: number;
  pendingChange: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  employeeEmail: string;
  giftName: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

export interface PopularGift {
  giftId: string;
  giftName: string;
  orderCount: number;
  percentage: number;
}

class DashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  async getStats(siteId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<DashboardStats> {
    const response = await fetch(
      `${this.baseUrl}/dashboard/stats/${siteId}?timeRange=${timeRange}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stats;
  }

  async getRecentOrders(siteId: string, limit: number = 5): Promise<RecentOrder[]> {
    const response = await fetch(
      `${this.baseUrl}/dashboard/recent-orders/${siteId}?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch recent orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orders;
  }

  async getPopularGifts(
    siteId: string, 
    limit: number = 5, 
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<PopularGift[]> {
    const response = await fetch(
      `${this.baseUrl}/dashboard/popular-gifts/${siteId}?limit=${limit}&timeRange=${timeRange}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch popular gifts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.gifts;
  }
}

export const dashboardService = new DashboardService();
```

### Phase 3: Frontend Dashboard Refactor

#### 3.1 Update Dashboard Component

**Changes Required:**

1. **Add State Management**
   - Loading states for each data section
   - Error states
   - Data states for stats, orders, gifts

2. **Add Data Fetching**
   - `useEffect` to fetch on mount and when site changes
   - Use `dashboardService` for all API calls
   - Handle errors gracefully

3. **Add Loading UI**
   - Skeleton loaders for stats cards
   - Loading indicators for data sections
   - Prevent flickering during refreshes

4. **Add Error Handling**
   - Display error messages
   - Retry mechanisms
   - Fallback UI

5. **Add Refresh Capability**
   - Manual refresh button
   - Auto-refresh interval (optional)
   - Pull-to-refresh (mobile)

6. **Remove Mock Data**
   - Delete all hardcoded arrays
   - Remove mock data functions

7. **Add Time Range Filter**
   - Dropdown to select 7d, 30d, 90d, 1y
   - Update stats and popular gifts based on selection
   - Persist preference in localStorage

#### 3.2 Updated Component Structure

```typescript
export function Dashboard() {
  const { currentSite } = useSite();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularGifts, setPopularGifts] = useState<PopularGift[]>([]);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingGifts, setLoadingGifts] = useState(true);
  
  // Error states
  const [statsError, setStatsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [giftsError, setGiftsError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    if (!currentSite?.id) return;
    
    fetchAllData();
  }, [currentSite?.id, timeRange]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders(),
      fetchPopularGifts(),
    ]);
  };

  const fetchStats = async () => {
    // Implementation
  };

  const fetchRecentOrders = async () => {
    // Implementation
  };

  const fetchPopularGifts = async () => {
    // Implementation
  };

  // ... rest of component
}
```

---

## Data Dependencies

### Required KV Store Keys

The backend needs to query these KV store keys:

1. **Orders**
   - Key pattern: `orders:*`
   - Index by: `order_index:by_site:${siteId}`
   - Fields needed: `id`, `siteId`, `employeeId`, `giftId`, `status`, `createdAt`, `orderDate`

2. **Employees**
   - Key pattern: `employees:*`
   - Index by: `employee_index:by_site:${siteId}`
   - Fields needed: `id`, `siteId`, `email`, `status`, `createdAt`

3. **Gifts**
   - Key pattern: `gifts:*` or `catalog_gifts:${catalogId}`
   - Fields needed: `id`, `name`, `status`, `catalogId`

4. **Site Catalog Configuration**
   - Key: `site_catalog_config:${siteId}`
   - Fields needed: `catalogId`, `visibilityRules`, `pricingOverrides`

### Required Indexes

For efficient querying, these indexes should exist:

```typescript
// Order indexes
`order_index:by_site:${siteId}` → Array<orderId>
`order_index:by_status:${status}` → Array<orderId>
`order_index:by_site_status:${siteId}:${status}` → Array<orderId>

// Employee indexes
`employee_index:by_site:${siteId}` → Array<employeeId>
`employee_index:by_status:${status}` → Array<employeeId>

// Gift indexes (if not using catalog-based)
`gift_index:by_catalog:${catalogId}` → Array<giftId>
`gift_index:by_status:${status}` → Array<giftId>
```

---

## Testing Requirements

### Unit Tests
- [ ] Dashboard service methods
- [ ] Backend endpoint logic
- [ ] Data aggregation functions
- [ ] Growth calculation logic

### Integration Tests
- [ ] Full dashboard data flow
- [ ] Error handling
- [ ] Loading states
- [ ] Site switching

### E2E Tests
- [ ] Dashboard loads with real data
- [ ] Stats cards show correct values
- [ ] Recent orders display correctly
- [ ] Popular gifts chart works
- [ ] Time range filter updates data
- [ ] Refresh functionality works

---

## Performance Considerations

### Backend Optimization
1. **Caching Strategy**
   - Cache dashboard stats for 5 minutes per site
   - Invalidate cache on order creation/update
   - Use KV store for cache storage

2. **Query Optimization**
   - Use indexes for all queries
   - Batch fetch related data (orders + gifts + employees)
   - Limit result sets with pagination

3. **Computation**
   - Pre-compute stats during off-peak hours
   - Store aggregated data separately
   - Update incrementally on order changes

### Frontend Optimization
1. **Lazy Loading**
   - Load stats first, then orders, then gifts
   - Show partial data as it loads

2. **Caching**
   - Cache dashboard data in memory
   - Only refetch when stale (5 minutes)
   - Use React Query or SWR

3. **Optimistic Updates**
   - Show cached data immediately
   - Update in background
   - Smooth transitions

---

## Security Considerations

### Authentication
- All dashboard endpoints should verify admin authentication
- Use existing `verifyAdmin` middleware
- Check site ownership/access

### Authorization
- Verify user has access to the specific site
- Filter data strictly by `siteId`
- Don't leak data from other sites

### Rate Limiting
- Apply rate limiting to dashboard endpoints
- Prevent excessive refresh attacks
- Use existing rate limiting middleware

---

## Migration Path

### Phase 1: Backend (Week 1)
1. ✅ Day 1: Implement `/dashboard/stats/:siteId` endpoint
2. ✅ Day 2: Implement `/dashboard/recent-orders/:siteId` endpoint
3. ✅ Day 3: Implement `/dashboard/popular-gifts/:siteId` endpoint
4. ✅ Day 4: Add indexes and optimize queries
5. ✅ Day 5: Test and validate endpoints

### Phase 2: Frontend Service (Week 2)
1. ✅ Day 1: Create `dashboardService.ts`
2. ✅ Day 2: Add TypeScript interfaces
3. ✅ Day 3: Implement service methods
4. ✅ Day 4: Add error handling
5. ✅ Day 5: Test service integration

### Phase 3: Dashboard Refactor (Week 3)
1. ✅ Day 1-2: Add state management and data fetching
2. ✅ Day 3: Implement loading states
3. ✅ Day 4: Add error handling UI
4. ✅ Day 5: Remove mock data, final testing

### Phase 4: Testing & Optimization (Week 4)
1. ✅ Day 1-2: Write unit tests
2. ✅ Day 3: Write integration tests
3. ✅ Day 4: Performance optimization
4. ✅ Day 5: Production deployment

---

## Success Criteria

### Functional Requirements
- ✅ Dashboard displays real-time data for current site
- ✅ Stats cards show accurate counts and growth percentages
- ✅ Recent orders list shows actual orders from database
- ✅ Popular gifts chart reflects real order data
- ✅ Time range filter works correctly
- ✅ Data refreshes when site changes
- ✅ Manual refresh button works

### Non-Functional Requirements
- ✅ Dashboard loads in < 2 seconds
- ✅ No errors in console
- ✅ Graceful error handling
- ✅ Responsive on all devices
- ✅ Accessible (WCAG 2.1 AA)
- ✅ 90%+ test coverage

### User Experience
- ✅ Clear loading indicators
- ✅ Helpful error messages
- ✅ Smooth transitions
- ✅ No data flickering
- ✅ Intuitive navigation

---

## Risks & Mitigation

### Risk 1: Large Data Sets
**Impact:** Slow query performance with many orders  
**Mitigation:** 
- Implement pagination
- Use date range filtering
- Add database indexes
- Pre-compute aggregates

### Risk 2: Missing Data
**Impact:** Empty dashboard for new sites  
**Mitigation:**
- Show helpful empty states
- Provide quick actions to add data
- Display onboarding guidance

### Risk 3: Stale Data
**Impact:** Dashboard shows outdated information  
**Mitigation:**
- Implement cache invalidation
- Add last updated timestamp
- Provide manual refresh
- Auto-refresh at intervals

### Risk 4: API Failures
**Impact:** Dashboard doesn't load  
**Mitigation:**
- Comprehensive error handling
- Retry mechanisms
- Fallback to cached data
- Clear error messages

---

## Estimated Effort

### Backend Development
- Dashboard stats endpoint: **8 hours**
- Recent orders endpoint: **6 hours**
- Popular gifts endpoint: **6 hours**
- Indexing and optimization: **4 hours**
- Testing: **6 hours**
- **Total: 30 hours**

### Frontend Development
- Dashboard service: **4 hours**
- Dashboard refactor: **12 hours**
- Loading states: **4 hours**
- Error handling: **4 hours**
- Testing: **6 hours**
- **Total: 30 hours**

### Total Project Effort
**60 hours** (approximately 1.5-2 weeks for one developer)

---

## Conclusion

The Site Dashboard is **currently not production-ready** due to reliance on hardcoded mock data. To make it production-ready, we need to:

1. **Implement 3 new backend API endpoints** for dashboard-specific data
2. **Create a frontend service layer** to fetch dashboard data
3. **Refactor the Dashboard component** to use real data with proper loading and error states
4. **Add comprehensive testing** across all layers
5. **Optimize for performance** with caching and indexing

The implementation is straightforward but requires significant development effort. The backend and frontend can be developed in parallel to reduce timeline.

**Recommended Priority:** **HIGH** - This is a core admin feature that should display real data.

**Next Steps:**
1. Review and approve this evaluation
2. Create implementation tickets for each phase
3. Assign developers
4. Begin Phase 1 (Backend API Development)

---

**Document Version:** 1.0  
**Author:** AI Assistant  
**Review Required:** Yes  
**Approval Required:** Yes
