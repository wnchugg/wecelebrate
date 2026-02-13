# JALA2 Backend API Documentation

**Version:** 2.0  
**Last Updated:** Phase 3 Backend Refactoring  
**Base URL:** `https://{project-id}.supabase.co/functions/v1/make-server-6fcaeea3`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Headers](#headers)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Endpoints](#endpoints)
   - [Health & System](#health--system)
   - [Authentication](#authentication-endpoints)
   - [Clients](#clients)
   - [Sites](#sites)
   - [Gifts](#gifts)
   - [Employees](#employees)
   - [Orders](#orders)
   - [Validation](#validation)
   - [ERP Integration](#erp-integration)
   - [Analytics](#analytics)

---

## Authentication

Most endpoints require admin authentication using JWT tokens.

### How to Authenticate

1. **Login** via `/auth/login` to obtain an access token
2. **Include token** in the `X-Access-Token` header for protected endpoints

```bash
curl -H "X-Access-Token: your-jwt-token-here" \
     -H "Authorization: Bearer your-anon-key" \
     https://project.supabase.co/functions/v1/make-server-6fcaeea3/clients
```

**Note:** The `Authorization` header with the anon key is required by Supabase, while `X-Access-Token` is used for user authentication.

---

## Headers

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Authorization` | Supabase anon key (always required) | `Bearer eyJhbGc...` |
| `Content-Type` | Request content type (for POST/PUT) | `application/json` |

### Optional Headers

| Header | Description | Default | Example |
|--------|-------------|---------|---------|
| `X-Access-Token` | User JWT token (for protected routes) | - | `eyJhbGc...` |
| `X-Environment-ID` | Target environment | `development` | `production` |
| `X-CSRF-Token` | CSRF protection token | - | `abc123...` |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "message": "Optional detailed message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "additionalInfo": "..."
  }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Health & System

#### `GET /health`

Health check endpoint (public).

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-02-07T10:30:00Z",
  "environment": "development",
  "database": true,
  "responseTime": 45,
  "version": "2.0"
}
```

#### `GET /test-db`

Database connection test (public).

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-02-07T10:30:00Z"
}
```

---

### Authentication Endpoints

#### `POST /bootstrap/create-admin`

Create the first admin user (public, but only works if no users exist).

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "username": "admin",
  "fullName": "Admin User"
}
```

**Validation Rules:**
- Email must be valid format
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Username: 3-30 characters
- Full name: required

**Response:**
```json
{
  "success": true,
  "userId": "uuid-here",
  "accessToken": "jwt-token-here",
  "message": "Bootstrap admin user created successfully"
}
```

#### `POST /auth/signup`

Create a new admin user (requires existing admin authentication).

**Auth Required:** Yes

**Request:** Same as bootstrap

**Response:**
```json
{
  "success": true,
  "userId": "uuid-here",
  "message": "Admin user created successfully"
}
```

#### `POST /auth/login`

Login with email/username and password.

**Request:**
```json
{
  "emailOrUsername": "admin@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt-token-here",
  "userId": "uuid-here",
  "email": "admin@example.com",
  "username": "admin"
}
```

#### `GET /auth/session`

Get current session information.

**Auth Required:** No (checks for token if provided)

**Response:**
```json
{
  "authenticated": true,
  "userId": "uuid-here",
  "email": "admin@example.com",
  "username": "admin"
}
```

#### `POST /auth/logout`

Logout current user.

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Clients

#### `GET /clients`

Get all clients.

**Auth Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "client-uuid",
      "name": "Acme Corporation",
      "contactEmail": "contact@acme.com",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### `GET /clients/:id`

Get client by ID.

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-uuid",
    "name": "Acme Corporation",
    "contactEmail": "contact@acme.com",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### `POST /clients`

Create a new client.

**Auth Required:** Yes

**Request:**
```json
{
  "name": "Acme Corporation",
  "contactEmail": "contact@acme.com",
  "status": "active"
}
```

**Validation:**
- `name`: required, 2-100 characters
- `contactEmail`: required, valid email format
- `status`: optional, "active" or "inactive" (default: "active")

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-uuid",
    "name": "Acme Corporation",
    "contactEmail": "contact@acme.com",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### `PUT /clients/:id`

Update a client.

**Auth Required:** Yes

**Request:**
```json
{
  "name": "Updated Name",
  "contactEmail": "new-contact@acme.com",
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Client updated successfully"
}
```

#### `DELETE /clients/:id`

Delete a client (also deletes associated sites).

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Client and associated sites deleted successfully"
}
```

---

### Sites

#### `GET /sites`

Get all sites (admin only).

**Auth Required:** Yes

**Query Parameters:** Same as clients

#### `GET /public/sites`

Get all active sites (public).

**Auth Required:** No

**Response:**
```json
{
  "sites": [
    {
      "id": "site-uuid",
      "clientId": "client-uuid",
      "name": "Holiday Gift Event 2024",
      "slug": "holiday-2024",
      "status": "active",
      "validationMethods": [
        { "type": "email", "enabled": true },
        { "type": "employeeId", "enabled": true }
      ],
      "branding": {
        "logo": "https://...",
        "primaryColor": "#D91C81",
        "secondaryColor": "#1B2A5E"
      },
      "selectionStartDate": "2024-12-01T00:00:00Z",
      "selectionEndDate": "2024-12-31T23:59:59Z"
    }
  ]
}
```

#### `GET /sites/:id`

Get site by ID.

**Auth Required:** Yes

#### `GET /clients/:clientId/sites`

Get all sites for a client.

**Auth Required:** Yes

#### `POST /sites`

Create a new site.

**Auth Required:** Yes

**Request:**
```json
{
  "clientId": "client-uuid",
  "name": "Holiday Gift Event 2024",
  "slug": "holiday-2024",
  "status": "active",
  "validationMethods": [
    { "type": "email", "enabled": true },
    { "type": "employeeId", "enabled": true }
  ],
  "branding": {
    "logo": "https://example.com/logo.png",
    "primaryColor": "#D91C81",
    "secondaryColor": "#1B2A5E",
    "tertiaryColor": "#00B4CC"
  },
  "selectionStartDate": "2024-12-01T00:00:00Z",
  "selectionEndDate": "2024-12-31T23:59:59Z"
}
```

**Validation:**
- `clientId`: required
- `name`: required
- `slug`: required, lowercase letters/numbers/hyphens only
- `validationMethods`: required array, at least one method
- Valid method types: "email", "employeeId", "serialCard", "magicLink"

#### `PUT /sites/:id`

Update a site.

**Auth Required:** Yes

#### `DELETE /sites/:id`

Delete a site.

**Auth Required:** Yes

---

### Gifts

#### `GET /gifts`

Get all gifts.

**Auth Required:** Yes

#### `GET /public/sites/:siteId/gifts`

Get all gifts assigned to a site (public).

**Auth Required:** No

**Response:**
```json
{
  "gifts": [
    {
      "id": "gift-uuid",
      "name": "Wireless Headphones",
      "description": "Premium noise-cancelling headphones",
      "sku": "WH-1000XM4",
      "price": 299.99,
      "currency": "USD",
      "imageUrl": "https://...",
      "category": "Electronics",
      "availableQuantity": 50,
      "status": "active"
    }
  ]
}
```

#### `POST /gifts`

Create a new gift.

**Auth Required:** Yes

**Request:**
```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "sku": "WH-1000XM4",
  "price": 299.99,
  "currency": "USD",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Electronics",
  "availableQuantity": 50,
  "status": "active"
}
```

**Validation:**
- `name`: required
- `description`: required
- `sku`: required
- `price`: required, positive number
- `currency`: optional, 3-letter ISO code (default: "USD")
- `imageUrl`: optional, valid URL
- `availableQuantity`: optional, non-negative number

#### `PUT /gifts/:id`

Update a gift.

**Auth Required:** Yes

#### `DELETE /gifts/:id`

Delete a single gift.

**Auth Required:** Yes

#### `POST /gifts/bulk-delete`

Delete multiple gifts.

**Auth Required:** Yes

**Request:**
```json
{
  "giftIds": ["gift-uuid-1", "gift-uuid-2", "gift-uuid-3"]
}
```

---

### Validation

#### `POST /public/validate-access`

Validate employee access to a site (public).

**Request:**
```json
{
  "siteId": "site-uuid",
  "method": "email",
  "value": "employee@company.com"
}
```

**Valid Methods:**
- `email`: Validate by email address
- `employeeId`: Validate by employee ID
- `serialCard`: Validate by serial card number
- `magicLink`: Validate by magic link token

**Response:**
```json
{
  "valid": true,
  "employeeId": "emp-uuid"
}
```

#### `POST /public/magic-link/request`

Request a magic link for validation.

**Request:**
```json
{
  "siteId": "site-uuid",
  "email": "employee@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to email"
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 60 requests per minute per IP
- **Authenticated endpoints:** 120 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1675777200
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (never in localStorage for sensitive apps)
3. **Handle errors gracefully** and show user-friendly messages
4. **Use pagination** for large datasets
5. **Validate input** on the frontend before sending to API
6. **Set appropriate timeouts** for requests
7. **Use environment headers** to target the correct database

---

## Support

For API support or questions, please refer to the main project documentation or contact the development team.
