# API Reference - Migrated Resources

**Quick reference for all 10 migrated CRUD resources**

**Base URL:** `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3`

---

## 📋 **Table of Contents**

1. [Clients](#1-clients)
2. [Sites](#2-sites)
3. [Gifts](#3-gifts)
4. [Orders](#4-orders)
5. [Employees](#5-employees)
6. [Admin Users](#6-admin-users)
7. [Roles](#7-roles)
8. [Access Groups](#8-access-groups)
9. [Celebrations](#9-celebrations)
10. [Email Templates](#10-email-templates)

---

## 1. **Clients**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/clients` | Admin | List all clients (paginated) |
| GET | `/clients/:id` | Admin | Get client by ID |
| POST | `/clients` | Admin | Create new client |
| PUT | `/clients/:id` | Admin | Update client |
| DELETE | `/clients/:id` | Admin | Delete client |
| GET | `/clients/:id/sites` | Admin | Get client's sites |
| GET | `/clients/:id/employees` | Admin | Get client's employees |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  name: string;              // Required, 2-200 chars
  description?: string;
  contactEmail?: string;     // Valid email
  contactName?: string;
  contactPhone?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'suspended';  // Default: active
  settings?: Record<string, any>;
  createdAt?: string;        // Auto-generated
  updatedAt?: string;        // Auto-generated
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `status` - Filter by status

### **Example**

```bash
# List clients
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create client
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "contactEmail": "admin@acme.com",
    "status": "active"
  }'
```

---

## 2. **Sites**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sites` | Admin | List all sites (paginated) |
| GET | `/sites/:id` | Admin | Get site by ID |
| POST | `/sites` | Admin | Create new site |
| PUT | `/sites/:id` | Admin | Update site |
| DELETE | `/sites/:id` | Admin | Delete site |
| GET | `/public/sites` | Public | Get active sites |
| GET | `/public/sites/:id` | Public | Get site by ID (public) |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  clientId: string;          // Required
  name: string;              // Required, 2-200 chars
  description?: string;
  slug?: string;             // Auto-generated from name
  status?: 'active' | 'inactive' | 'draft';  // Default: draft
  startDate: string;         // Required, ISO 8601
  endDate: string;           // Required, must be after startDate
  validationMethods?: string[];  // Default: ['email']
  brandingConfig?: {
    primaryColor?: string;   // Hex color
    secondaryColor?: string;
    logo?: string;           // URL
  };
  pageConfigurations?: any[];
  settings?: Record<string, any>;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `clientId` - Filter by client
- `status` - Filter by status

### **Example**

```bash
# Get active sites (public)
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites" \
  -H "X-Environment-Id: development"

# Create site
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-123",
    "name": "Summer Appreciation Event",
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-06-30T23:59:59Z",
    "status": "active"
  }'
```

---

## 3. **Gifts**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/gifts` | Admin | List all gifts (paginated) |
| GET | `/admin/gifts/:id` | Admin | Get gift by ID |
| POST | `/admin/gifts` | Admin | Create new gift |
| PUT | `/admin/gifts/:id` | Admin | Update gift |
| DELETE | `/admin/gifts/:id` | Admin | Delete gift (soft) |
| GET | `/public/sites/:siteId/gifts` | Public | Get gifts for site |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  name: string;              // Required, 2-200 chars
  description?: string;
  category?: string;         // Lowercase
  price?: number;            // Non-negative
  msrp?: number;             // Non-negative
  sku?: string;              // Uppercase
  imageUrl?: string;         // Valid URL
  images?: string[];         // Array of URLs
  status?: 'active' | 'inactive' | 'discontinued';  // Default: active
  inventoryTracking?: boolean;  // Default: false
  inventoryQuantity?: number;   // Required if inventoryTracking=true
  tags?: string[];           // Lowercase
  specifications?: Record<string, any>;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 200)
- `category` - Filter by category
- `status` - Filter by status

### **Example**

```bash
# List gifts
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts?category=electronics&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"

# Create gift with inventory
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Gift Box",
    "description": "Luxury gift set",
    "category": "premium",
    "price": 99.99,
    "sku": "GIFT-PREM-001",
    "status": "active",
    "inventoryTracking": true,
    "inventoryQuantity": 100
  }'
```

---

## 4. **Orders**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Admin | List all orders (paginated) |
| GET | `/orders/:id` | Admin | Get order by ID |
| POST | `/orders` | Admin | Create new order |
| PUT | `/orders/:id` | Admin | Update order |
| DELETE | `/orders/:id` | Admin | Delete order (soft) |
| POST | `/public/orders` | Public | Create order (public) |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated (ORD-XXXXXXXX-XXXX)
  orderNumber?: string;      // Same as ID
  siteId: string;            // Required
  employeeId?: string;
  employeeEmail: string;     // Required, valid email
  employeeName?: string;
  giftId: string;            // Required
  giftName?: string;         // Auto-populated
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  shippingAddress?: {
    addressLine1: string;    // Required
    addressLine2?: string;
    city: string;            // Required
    state: string;           // Required
    postalCode: string;      // Required
    country: string;         // Required
    phone?: string;
  };
  trackingNumber?: string;
  notes?: string;
  metadata?: Record<string, any>;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 200)
- `siteId` - Filter by site
- `status` - Filter by status
- `employeeId` - Filter by employee

### **Example**

```bash
# Create order (public)
curl -X POST "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/orders" \
  -H "X-Environment-Id: development" \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "site-123",
    "employeeEmail": "john@company.com",
    "giftId": "gift-456",
    "shippingAddress": {
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    }
  }'

# List orders for a site
curl "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/orders?siteId=site-123&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Environment-Id: development"
```

---

## 5. **Employees**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/employees` | Admin | List all employees (paginated) |
| GET | `/employees/:id` | Admin | Get employee by ID |
| POST | `/employees` | Admin | Create new employee |
| PUT | `/employees/:id` | Admin | Update employee |
| DELETE | `/employees/:id` | Admin | Delete employee |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  clientId: string;          // Required
  siteId?: string;
  email: string;             // Required, valid email
  firstName?: string;
  lastName?: string;
  employeeId?: string;       // External employee ID
  department?: string;
  jobTitle?: string;
  status?: 'active' | 'inactive';  // Default: active
  metadata?: Record<string, any>;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 100, max: 500)
- `clientId` - Filter by client
- `siteId` - Filter by site
- `status` - Filter by status
- `department` - Filter by department

---

## 6. **Admin Users**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | Super Admin | List all admin users |
| GET | `/admin/users/:id` | Super Admin | Get admin user by ID |
| POST | `/admin/users` | Super Admin | Create new admin user |
| PUT | `/admin/users/:id` | Super Admin | Update admin user |
| DELETE | `/admin/users/:id` | Super Admin | Delete admin user |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  email: string;             // Required, valid email
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';  // Default: active
  permissions?: string[];
  lastLogin?: string;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `status` - Filter by status
- `role` - Filter by role

---

## 7. **Roles**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roles` | Admin | List all roles (paginated) |
| GET | `/roles/:id` | Admin | Get role by ID |
| POST | `/roles` | Admin | Create new role |
| PUT | `/roles/:id` | Admin | Update role |
| DELETE | `/roles/:id` | Admin | Delete role |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  name: string;              // Required, 2-100 chars
  description?: string;
  permissions?: string[];
  isSystemRole?: boolean;    // Default: false
  status?: 'active' | 'inactive';  // Default: active
}
```

---

## 8. **Access Groups**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/access-groups` | Admin | List all access groups |
| GET | `/access-groups/:id` | Admin | Get access group by ID |
| POST | `/access-groups` | Admin | Create new access group |
| PUT | `/access-groups/:id` | Admin | Update access group |
| DELETE | `/access-groups/:id` | Admin | Delete access group |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  name: string;              // Required, 2-100 chars
  description?: string;
  permissions?: string[];
  siteId?: string;
  status?: 'active' | 'inactive';  // Default: active
}
```

---

## 9. **Celebrations**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/celebrations` | Admin | List all celebrations |
| GET | `/celebrations/:id` | Admin | Get celebration by ID |
| POST | `/celebrations` | Admin | Create new celebration |
| PUT | `/celebrations/:id` | Admin | Update celebration |
| DELETE | `/celebrations/:id` | Admin | Delete celebration |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  clientId: string;          // Required
  siteId?: string;
  employeeId?: string;
  type: string;              // Required (e.g., 'birthday', 'anniversary')
  date: string;              // Required, ISO 8601
  title?: string;
  message?: string;
  status?: 'active' | 'inactive';  // Default: active
  metadata?: Record<string, any>;
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 100, max: 500)
- `clientId` - Filter by client
- `siteId` - Filter by site
- `type` - Filter by celebration type
- `status` - Filter by status

---

## 10. **Email Templates**

### **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/email-templates` | Admin | List all templates |
| GET | `/email-templates/:id` | Admin | Get template by ID |
| POST | `/email-templates` | Admin | Create new template |
| PUT | `/email-templates/:id` | Admin | Update template |
| DELETE | `/email-templates/:id` | Admin | Delete template |

### **Fields**

```typescript
{
  id?: string;               // Auto-generated
  name: string;              // Required, 2-100 chars
  subject: string;           // Required
  body: string;              // Required (HTML or plain text)
  templateType?: string;     // e.g., 'welcome', 'order-confirmation'
  language?: string;         // Default: 'en'
  variables?: string[];      // Template variables (e.g., ['name', 'orderNumber'])
  status?: 'active' | 'inactive' | 'draft';  // Default: draft
}
```

### **Query Parameters**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `templateType` - Filter by type
- `language` - Filter by language
- `status` - Filter by status

---

## 🔒 **Authentication**

All admin endpoints require:
- **Header:** `Authorization: Bearer YOUR_TOKEN`
- **Header:** `X-Environment-Id: development` (or `production`)

Public endpoints only require:
- **Header:** `X-Environment-Id: development` (or `production`)

---

## 📊 **Standard Response Format**

### **Success Response**

```json
{
  "success": true,
  "data": { /* resource or array of resources */ },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 50,
    "totalPages": 2
  }
}
```

### **Error Response**

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🚀 **Quick Start Examples**

### **JavaScript/TypeScript**

```typescript
const API_BASE = 'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3';
const AUTH_TOKEN = 'your-auth-token';
const ENV_ID = 'development';

// List clients
const response = await fetch(`${API_BASE}/clients?page=1&pageSize=10`, {
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'X-Environment-Id': ENV_ID
  }
});

const { success, data, meta } = await response.json();
console.log(`Found ${meta.total} clients`);
```

### **Python**

```python
import requests

API_BASE = 'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3'
AUTH_TOKEN = 'your-auth-token'
ENV_ID = 'development'

headers = {
    'Authorization': f'Bearer {AUTH_TOKEN}',
    'X-Environment-Id': ENV_ID
}

# List sites
response = requests.get(f'{API_BASE}/sites', headers=headers)
data = response.json()
print(f"Found {data['meta']['total']} sites")
```

---

**For complete testing examples, see `/PHASE_3_1_TESTING_GUIDE.md`**

**Last Updated:** February 9, 2026
