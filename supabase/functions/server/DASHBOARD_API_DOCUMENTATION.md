# Dashboard API Documentation

**Version:** 1.0  
**Created:** February 12, 2026  
**Last Updated:** February 12, 2026

---

## Overview

The Dashboard API provides real-time analytics and statistics for site administrators to monitor their site's performance. These endpoints aggregate data from orders, employees, and catalog gifts to provide actionable insights.

---

## Authentication

All dashboard endpoints require admin authentication using the `verifyAdmin` middleware.

**Headers Required:**
```
Authorization: Bearer <admin_jwt_token>
X-Environment-ID: <environment_id> (optional, defaults to 'development')
```

---

## Endpoints

### 1. Get Dashboard Statistics

Get aggregate statistics for a site's dashboard including total orders, active employees, gifts available, and pending shipments with growth percentages.

**Endpoint:** `GET /make-server-6fcaeea3/dashboard/stats/:siteId`

**URL Parameters:**
- `siteId` (required): The unique identifier of the site

**Query Parameters:**
- `timeRange` (optional): Time range for statistics
  - Options: `'7d'` | `'30d'` | `'90d'` | `'1y'`
  - Default: `'30d'`

**Request Example:**
```bash
curl -X GET 'https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/stats/site-123?timeRange=30d' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'X-Environment-ID: development'
```

**Response Schema:**
```typescript
{
  success: boolean;
  stats: {
    // Current period
    totalOrders: number;              // Total orders in current period
    activeEmployees: number;          // Active employees count
    giftsAvailable: number;           // Active gifts in catalog
    pendingShipments: number;         // Pending/confirmed orders
    
    // Previous period (for comparison)
    previousOrders: number;           // Orders in previous period
    previousActiveEmployees: number;  // Employees in previous period
    previousGiftsAvailable: number;   // Gifts in previous period
    previousPendingShipments: number; // Pending orders in previous period
    
    // Growth percentages
    orderGrowth: number;              // % change in orders
    employeeGrowth: number;           // % change in employees
    giftsChange: number;              // % change in gifts
    pendingChange: number;            // % change in pending orders
  };
  timeRange: string;                  // The time range used
  generatedAt: string;                // ISO timestamp when stats generated
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 127,
    "previousOrders": 98,
    "orderGrowth": 29.6,
    "activeEmployees": 42,
    "previousActiveEmployees": 42,
    "employeeGrowth": 0,
    "giftsAvailable": 15,
    "previousGiftsAvailable": 15,
    "giftsChange": 0,
    "pendingShipments": 8,
    "previousPendingShipments": 12,
    "pendingChange": -33.3
  },
  "timeRange": "30d",
  "generatedAt": "2026-02-12T10:30:00.000Z"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch dashboard stats: <error message>"
}
```

**Growth Calculation Logic:**
- Growth percentage = `((current - previous) / previous) * 100`
- If previous = 0 and current > 0: growth = 100%
- If previous = 0 and current = 0: growth = 0%
- Rounded to 1 decimal place

**Time Period Calculation:**
- Current Period: Last N days from now
- Previous Period: N days before current period start
- Example for 30d: Current = Last 30 days, Previous = Days 31-60 ago

**Data Sources:**
- Orders: Fetched from `order_index:by_site:${siteId}`
- Employees: Fetched from `employee_index:by_site:${siteId}`
- Gifts: Fetched from site's catalog configuration
- All queries filtered by environment ID

---

### 2. Get Recent Orders

Get the most recent orders for a site with employee and gift details.

**Endpoint:** `GET /make-server-6fcaeea3/dashboard/recent-orders/:siteId`

**URL Parameters:**
- `siteId` (required): The unique identifier of the site

**Query Parameters:**
- `limit` (optional): Maximum number of orders to return
  - Type: `number`
  - Default: `5`
  - Range: 1-100
- `status` (optional): Filter by order status
  - Options: `'pending'` | `'confirmed'` | `'shipped'` | `'delivered'` | `'cancelled'`

**Request Example:**
```bash
curl -X GET 'https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/recent-orders/site-123?limit=10&status=pending' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'X-Environment-ID: development'
```

**Response Schema:**
```typescript
{
  success: boolean;
  orders: Array<{
    id: string;               // Order ID
    orderNumber: string;      // Human-readable order number
    employeeEmail: string;    // Employee email or ID
    giftName: string;         // Gift name
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: string;        // ISO timestamp
  }>;
  total: number;              // Total orders matching criteria (before limit)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "ord-abc123",
      "orderNumber": "ORD-001234",
      "employeeEmail": "john.doe@company.com",
      "giftName": "Wireless Headphones",
      "status": "pending",
      "orderDate": "2026-02-11T15:30:00.000Z"
    },
    {
      "id": "ord-def456",
      "orderNumber": "ORD-001233",
      "employeeEmail": "jane.smith@company.com",
      "giftName": "Smart Watch",
      "status": "shipped",
      "orderDate": "2026-02-10T14:20:00.000Z"
    }
  ],
  "total": 127
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch recent orders: <error message>"
}
```

**Sorting:**
- Orders are sorted by `orderDate` in descending order (most recent first)

**Data Enrichment:**
- Fetches employee details to get email
- Fetches gift details to get name
- Falls back to IDs if details not found

---

### 3. Get Popular Gifts

Get the most popular gifts based on order count within a time range.

**Endpoint:** `GET /make-server-6fcaeea3/dashboard/popular-gifts/:siteId`

**URL Parameters:**
- `siteId` (required): The unique identifier of the site

**Query Parameters:**
- `limit` (optional): Maximum number of gifts to return
  - Type: `number`
  - Default: `5`
  - Range: 1-50
- `timeRange` (optional): Time range for popularity calculation
  - Options: `'7d'` | `'30d'` | `'90d'` | `'1y'`
  - Default: `'30d'`

**Request Example:**
```bash
curl -X GET 'https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/popular-gifts/site-123?limit=5&timeRange=30d' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'X-Environment-ID: development'
```

**Response Schema:**
```typescript
{
  success: boolean;
  gifts: Array<{
    giftId: string;          // Gift ID
    giftName: string;        // Gift name
    orderCount: number;      // Number of orders for this gift
    percentage: number;      // Percentage of total orders (0-100)
  }>;
  totalOrders: number;       // Total orders in time range
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "gifts": [
    {
      "giftId": "gift-abc123",
      "giftName": "Wireless Headphones",
      "orderCount": 45,
      "percentage": 35
    },
    {
      "giftId": "gift-def456",
      "giftName": "Smart Watch",
      "orderCount": 32,
      "percentage": 25
    },
    {
      "giftId": "gift-ghi789",
      "giftName": "Coffee Maker",
      "orderCount": 28,
      "percentage": 22
    }
  ],
  "totalOrders": 127
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch popular gifts: <error message>"
}
```

**Percentage Calculation:**
- `percentage = (orderCount / totalOrders) * 100`
- Rounded to nearest integer
- Sum of percentages may not equal 100% due to rounding and limiting

**Sorting:**
- Gifts sorted by `orderCount` in descending order (most popular first)

**Time Range Filtering:**
- Only counts orders within the specified time range
- Uses order creation date (`createdAt` or `orderDate`)

---

## Data Models

### Order
```typescript
{
  id: string;
  orderNumber?: string;
  siteId: string;
  employeeId?: string;
  giftId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: string;
  createdAt: string;
  // ... other fields
}
```

### Employee
```typescript
{
  id: string;
  siteId: string;
  employeeId: string;
  email?: string;
  status: 'active' | 'inactive';
  // ... other fields
}
```

### Gift
```typescript
{
  id: string;
  catalogId: string;
  name: string;
  status: 'active' | 'inactive';
  // ... other fields
}
```

### Site Catalog Configuration
```typescript
{
  siteId: string;
  catalogId: string;
  // ... other fields
}
```

---

## KV Store Keys Used

### Indexes
- `order_index:by_site:${siteId}` → `Array<orderId>`
- `employee_index:by_site:${siteId}` → `Array<employeeId>`
- `site_catalog_config:${siteId}` → `SiteCatalogConfig`
- `catalog_gifts:${catalogId}` → `Array<giftId>`

### Records
- `orders:${orderId}` → `Order`
- `employees:${employeeId}` → `Employee`
- `gifts:${giftId}` → `Gift`

---

## Error Handling

All endpoints follow consistent error handling:

1. **Authentication Errors** (401 Unauthorized):
   - Missing or invalid admin token
   - Handled by `verifyAdmin` middleware

2. **Validation Errors** (400 Bad Request):
   - Invalid parameters
   - Missing required parameters

3. **Server Errors** (500 Internal Server Error):
   - Database query failures
   - Data processing errors
   - Returns error message in response

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Performance Considerations

### Caching Strategy
- Dashboard stats can be cached for 5 minutes per site
- Cache key: `dashboard_cache:${siteId}:${timeRange}`
- Invalidate on order creation/update

### Query Optimization
- Uses KV store indexes for efficient filtering
- Batch fetches related data (orders, employees, gifts)
- Limits result sets appropriately

### Recommended Load
- Maximum 1 request per 10 seconds per site
- Use polling intervals of 30-60 seconds for auto-refresh
- Implement exponential backoff on errors

---

## Rate Limiting

The `verifyAdmin` middleware includes rate limiting for admin endpoints:
- Limit: Based on `RATE_LIMIT_CONFIGS.admin`
- Typically: 100 requests per 15 minutes
- Applies per IP address

---

## Security

### Authentication
- All endpoints require admin JWT token
- Token verified via `verifyAdmin` middleware
- Token must be valid and non-expired

### Authorization
- Endpoints filter data strictly by `siteId`
- No cross-site data leakage
- Admin must have access to the specific site

### Data Privacy
- Employee emails only shown to authorized admins
- No sensitive customer data exposed
- All queries scoped to environment ID

---

## Testing

### Manual Testing

**1. Test Dashboard Stats:**
```bash
# Replace with actual values
export ADMIN_TOKEN="your-admin-token"
export PROJECT_ID="your-project-id"
export SITE_ID="your-site-id"

curl -X GET "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/stats/${SITE_ID}?timeRange=30d" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "X-Environment-ID: development"
```

**2. Test Recent Orders:**
```bash
curl -X GET "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/recent-orders/${SITE_ID}?limit=10" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "X-Environment-ID: development"
```

**3. Test Popular Gifts:**
```bash
curl -X GET "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/dashboard/popular-gifts/${SITE_ID}?limit=5&timeRange=30d" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "X-Environment-ID: development"
```

### Integration Tests

Test scenarios to cover:
1. ✅ Stats endpoint returns correct order counts
2. ✅ Growth percentages calculated correctly
3. ✅ Recent orders sorted by date
4. ✅ Popular gifts ranked by order count
5. ✅ Time range filtering works
6. ✅ Status filtering for orders works
7. ✅ Empty states handled gracefully
8. ✅ Invalid site ID returns empty/zero values
9. ✅ Unauthorized access blocked
10. ✅ Cross-site data isolation verified

---

## Logging

All dashboard endpoints log:
- Request parameters (siteId, timeRange, limit)
- Query results (counts, filtered results)
- Errors with full context

**Log Format:**
```
[Dashboard Stats] Fetching stats for site: <siteId>, timeRange: <timeRange>, environment: <environmentId>
[Dashboard Stats] Found <count> total orders for site
[Dashboard Stats] Generated stats: <stats>
```

---

## Troubleshooting

### Issue: No data returned
**Cause:** Site has no orders, employees, or catalog configured  
**Solution:** 
- Verify site exists: Check `sites:${siteId}` in KV store
- Check indexes: Verify `order_index:by_site:${siteId}` exists
- Seed test data: Use seed endpoints to create sample data

### Issue: Growth percentages show 100% or 0%
**Cause:** No data in previous period  
**Solution:** This is expected for new sites - growth will normalize over time

### Issue: Popular gifts missing names
**Cause:** Gift records not found in database  
**Solution:** 
- Verify gifts exist in catalog
- Check `catalog_gifts:${catalogId}` contains gift IDs
- Verify `gifts:${giftId}` records exist

### Issue: Employee emails show "N/A"
**Cause:** Employee records missing or don't have email field  
**Solution:**
- Check employee records have email populated
- Verify `employees:${employeeId}` exists
- Consider using `employeeId` as fallback

---

## Migration Notes

### Migrating from Mock Data

If migrating from the frontend mock data:

1. **Stats Cards Mapping:**
   - `stats[0].value` → `stats.totalOrders`
   - `stats[1].value` → `stats.activeEmployees`
   - `stats[2].value` → `stats.giftsAvailable`
   - `stats[3].value` → `stats.pendingShipments`

2. **Growth Indicators:**
   - `stats[n].trend` → Use sign of `*Growth` fields
   - `stats[n].change` → Use `*Growth` fields directly

3. **Recent Orders:**
   - Direct mapping from `recentOrders` array
   - Add proper date formatting

4. **Popular Gifts:**
   - Map to progress bar UI
   - Use `percentage` for bar width

---

## Changelog

### Version 1.0 (February 12, 2026)
- ✅ Initial implementation
- ✅ Dashboard stats endpoint
- ✅ Recent orders endpoint
- ✅ Popular gifts endpoint
- ✅ Time range filtering
- ✅ Growth calculations
- ✅ Admin authentication
- ✅ Comprehensive error handling
- ✅ Logging and monitoring

---

## Future Enhancements

### Planned Features
- [ ] Caching layer for improved performance
- [ ] Historical employee count tracking
- [ ] Real-time gift inventory updates
- [ ] Export stats to CSV/PDF
- [ ] Scheduled reports via email
- [ ] Advanced filtering options
- [ ] Custom date range selection
- [ ] Dashboard widgets API
- [ ] Webhook notifications for thresholds

### Performance Optimizations
- [ ] Pre-computed aggregates
- [ ] Incremental updates on order changes
- [ ] Redis caching layer
- [ ] Query result pagination
- [ ] GraphQL interface option

---

## Support

For issues, questions, or feature requests:
1. Check this documentation
2. Review error logs in Supabase dashboard
3. Test with curl commands above
4. Verify authentication and permissions
5. Contact development team

---

**Document Version:** 1.0  
**API Version:** 1.0  
**Status:** Production Ready  
**Last Reviewed:** February 12, 2026
