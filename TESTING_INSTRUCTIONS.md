# Testing Instructions - All 55 Migrated Routes

## 🎯 Overview

This guide provides step-by-step instructions to test all 55 CRUD routes that were migrated to the factory pattern.

**Environment:** Development  
**Base URL:** `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3`

---

## 🚀 Quick Start

### **Option 1: Bash Script (Recommended)**

```bash
# 1. Set your auth token
export AUTH_TOKEN="your-admin-token-here"

# 2. Run the test script
chmod +x test_all_routes.sh
./test_all_routes.sh
```

### **Option 2: JavaScript (Browser Console)**

```javascript
// 1. Open browser console on any page
// 2. Copy and paste the contents of quick_route_test.js
// 3. Update AUTH_TOKEN in the script
// 4. Results will appear in console
```

### **Option 3: Manual cURL Commands**

See sections below for individual cURL commands.

---

## 📋 Test Checklist

### **1. Clients (7 routes)** ✅

```bash
# List all clients
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# List clients with pagination
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Filter by status
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create client
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","contactEmail":"test@example.com","status":"active"}'

# Get client by ID (replace CLIENT_ID)
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients/CLIENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Update client
curl -X PUT "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients/CLIENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Client","status":"active"}'

# Delete client
curl -X DELETE "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients/CLIENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Get client's sites
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients/CLIENT_ID/sites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Get client's employees
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients/CLIENT_ID/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"
```

### **2. Sites (7 routes)** ✅

```bash
# List all sites
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Get active sites (PUBLIC - no auth)
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites" \
  -H "X-Environment-Id: development"

# Get site by ID (PUBLIC - no auth)
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites/SITE_ID" \
  -H "X-Environment-Id: development"

# Create site
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_ID","name":"Test Site","startDate":"2026-01-01T00:00:00Z","endDate":"2026-12-31T23:59:59Z","status":"active"}'
```

### **3. Gifts (6 routes)** ✅

```bash
# List all gifts
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Get gifts for site (PUBLIC)
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites/SITE_ID/gifts" \
  -H "X-Environment-Id: development"

# Create gift
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Gift","price":99.99,"status":"active","inventoryTracking":true,"inventoryQuantity":100}'
```

### **4. Orders (6 routes)** ✅

```bash
# List all orders
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create order (PUBLIC)
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/orders" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"SITE_ID","employeeEmail":"test@example.com","giftId":"GIFT_ID","shippingAddress":{"addressLine1":"123 Main St","city":"New York","state":"NY","postalCode":"10001","country":"USA"}}'
```

### **5. Employees (5 routes)** ✅

```bash
# List all employees
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create employee
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_ID","email":"employee@test.com","firstName":"Test","lastName":"Employee","status":"active"}'
```

### **6. Admin Users (5 routes)** ✅

```bash
# List all admin users
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create admin user
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","firstName":"Test","lastName":"Admin","role":"admin","status":"active"}'
```

### **7. Roles (5 routes)** ✅

```bash
# List all roles
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/roles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create role
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/roles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Role","description":"Test role","permissions":["read","write"],"status":"active"}'
```

### **8. Access Groups (5 routes)** ✅

```bash
# List all access groups
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/access-groups" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create access group
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/access-groups" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Access Group","description":"Test group","permissions":["read","write"],"status":"active"}'
```

### **9. Celebrations (5 routes)** ✅

```bash
# List all celebrations
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/celebrations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create celebration
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/celebrations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_ID","type":"birthday","date":"2026-06-15T00:00:00Z","title":"Test Birthday","status":"active"}'
```

### **10. Email Templates (5 routes)** ✅

```bash
# List all email templates
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/email-templates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create email template
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/email-templates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Template","subject":"Test Email","body":"Test email body","templateType":"test","language":"en","status":"active"}'
```

---

## 🎯 Expected Responses

### **Success Response**

```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 50,
    "totalPages": 0
  }
}
```

### **Error Response (401 - Unauthorized)**

```json
{
  "success": false,
  "error": "Access denied"
}
```

### **Error Response (400 - Validation)**

```json
{
  "success": false,
  "error": "Missing required field: name"
}
```

### **Error Response (404 - Not Found)**

```json
{
  "success": false,
  "error": "Resource not found"
}
```

---

## 🧪 Testing Workflow

### **Phase 1: Connectivity Test**

Test public endpoints first (no auth required):

```bash
# Test public sites endpoint
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites" \
  -H "X-Environment-Id: development"
```

**Expected:** HTTP 200 with empty array or list of sites

### **Phase 2: Authentication Test**

Test authenticated endpoint:

```bash
# Test clients endpoint
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"
```

**Expected:** HTTP 200 with list of clients or 403 if token invalid

### **Phase 3: CRUD Operations Test**

For each resource:
1. ✅ **CREATE** - POST new resource
2. ✅ **READ** - GET the created resource
3. ✅ **UPDATE** - PUT to modify the resource
4. ✅ **READ** - GET again to verify update
5. ✅ **DELETE** - DELETE the resource
6. ✅ **READ** - GET should return 404

### **Phase 4: Pagination & Filtering Test**

Test query parameters:

```bash
# Pagination
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?page=1&pageSize=5"

# Filtering
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?status=active"

# Combined
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?page=1&pageSize=5&status=active"
```

---

## 📊 Test Results Template

| Resource | List | Get | Create | Update | Delete | Custom | Status |
|----------|------|-----|--------|--------|--------|--------|--------|
| Clients | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Sites | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Gifts | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Orders | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Employees | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Admin Users | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Roles | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Access Groups | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Celebrations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Email Templates | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | - | ⬜ |

**Legend:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🔧 Troubleshooting

### **Issue: "Access denied" on all routes**

- ✅ Check AUTH_TOKEN is valid
- ✅ Check token has admin role
- ✅ Verify X-Environment-Id header is set

### **Issue: "Resource not found" on GET by ID**

- ✅ Verify resource was created successfully
- ✅ Check ID format matches expected pattern
- ✅ Ensure using correct environment

### **Issue: CORS errors**

- ✅ Server should have CORS enabled
- ✅ Check server logs for CORS configuration
- ✅ Try using curl instead of browser

### **Issue: "Module not found" errors**

- ✅ Check all imports in migrated_resources.ts
- ✅ Verify crud_factory.ts is deployed
- ✅ Check Supabase Edge Functions logs

---

## 📈 Success Criteria

**All tests pass when:**

✅ All 10 resources respond with HTTP 200/201  
✅ Pagination works on all list endpoints  
✅ Filtering works on all filtered endpoints  
✅ Public routes work without authentication  
✅ Admin routes require authentication  
✅ CRUD operations work end-to-end  
✅ Validation errors return appropriate messages  
✅ Access control prevents unauthorized access

---

**Ready to test! Start with the bash script for comprehensive automated testing, or use individual curl commands for targeted testing.** 🚀
