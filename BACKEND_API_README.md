# JALA 2 Backend API Implementation

## Overview

The JALA 2 application now uses a comprehensive REST API backend powered by Supabase. All data is persisted in Supabase's key-value store, and authentication is handled through Supabase Auth.

## Architecture

### Three-Tier Architecture
```
Frontend (React) → API Server (Hono/Deno) → Database (Supabase KV Store)
```

- **Frontend**: React application using contexts that call API endpoints
- **API Server**: Hono web server running on Supabase Edge Functions
- **Database**: PostgreSQL-backed key-value store for data persistence
- **Auth**: Supabase Auth for session management

## API Endpoints

### Base URL
```
https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3
```

### Authentication Endpoints

#### POST /auth/signup
Create a new admin user account
```json
{
  "email": "admin@example.com",
  "password": "securepassword",
  "username": "adminuser",
  "role": "manager" // or "super_admin", "admin"
}
```

#### POST /auth/login
Authenticate and receive access token
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```
Returns: `{ access_token, user }`

#### GET /auth/session
Check current session validity (requires Authorization header)

#### POST /auth/logout
Logout and invalidate session (requires Authorization header)

### Client Endpoints (Admin Only)

#### GET /clients
Get all clients

#### GET /clients/:id
Get specific client

#### POST /clients
Create new client

#### PUT /clients/:id
Update client

#### DELETE /clients/:id
Delete client (fails if client has sites)

### Site Endpoints (Admin Only)

#### GET /sites
Get all sites

#### GET /clients/:clientId/sites
Get sites for specific client

#### GET /sites/:id
Get specific site

#### POST /sites
Create new site

#### PUT /sites/:id
Update site

#### DELETE /sites/:id
Delete site (also deletes site configuration)

#### GET /sites/:siteId/gifts (Public)
Get gifts available for a specific site based on configuration

#### GET /sites/:siteId/gift-config
Get site gift configuration

#### PUT /sites/:siteId/gift-config
Update site gift configuration

### Gift Endpoints (Admin Only)

#### GET /gifts
Get all gifts from global catalog

#### GET /gifts/:id
Get specific gift

#### POST /gifts
Create new gift

#### PUT /gifts/:id
Update gift

#### DELETE /gifts/:id
Delete gift

#### POST /gifts/bulk-delete
Delete multiple gifts
```json
{
  "ids": ["gift-001", "gift-002"]
}
```

### Order Endpoints

#### POST /orders (Public)
Create new order

#### GET /orders (Admin Only)
Get all orders

#### GET /orders/:id (Public)
Get specific order

#### PUT /orders/:id (Admin Only)
Update order status

## Data Models

### Key-Value Storage Schema

Data is stored in the Supabase KV table with the following key prefixes:

- `admin_users:{userId}` - Admin user data
- `clients:{clientId}` - Client information
- `sites:{siteId}` - Site configurations
- `gifts:{giftId}` - Gift catalog items
- `site_configs:{siteId}` - Site gift assignment configurations
- `orders:{orderId}` - Order records

## Authentication Flow

### Admin Login
1. User enters email and password
2. Frontend calls `/auth/login` endpoint
3. Server validates credentials with Supabase Auth
4. Server returns `access_token` and user data
5. Frontend stores token in memory
6. All subsequent API requests include `Authorization: Bearer ${access_token}` header

### Session Management
- Access tokens are stored in memory (not localStorage/sessionStorage)
- Tokens expire after the Supabase Auth session timeout
- Session validation happens on each admin endpoint request
- Users must re-login when token expires

## Frontend Integration

### API Client (`/src/app/utils/api.ts`)

The frontend uses a centralized API client that:
- Manages access tokens
- Adds authentication headers automatically
- Handles error responses
- Provides typed API methods

Example usage:
```typescript
import { clientApi } from '@/app/utils/api';

// Create a client
const { client } = await clientApi.create({
  name: 'TechCorp Inc.',
  isActive: true,
  // ... other fields
});

// Get all clients
const { clients } = await clientApi.getAll();
```

### Context Migration

All contexts have been migrated to use the API:

1. **AdminContext**: Uses Supabase Auth for login/logout
2. **SiteContext**: Calls client and site API endpoints
3. **GiftContext**: Calls gift and site configuration endpoints
4. **OrderContext**: Calls order API endpoints

### Key Changes

- Methods are now `async` and return Promises
- Data is loaded from server on component mount
- Create/Update/Delete operations immediately update local state after API success
- Loading states are managed with `isLoading` boolean
- Errors are caught and thrown with user-friendly messages

## Database Seeding

The server automatically seeds the database with demo data on first startup:
- 4 demo clients
- 7 demo sites
- 10 demo gifts
- 3 demo site configurations

Seeding only runs once (checks for existing data before seeding).

## Security Considerations

### Authentication
- Supabase Auth handles password hashing and session management
- Access tokens are JWTs with built-in expiration
- Email confirmation is auto-enabled (no email server required for prototyping)

### Authorization
- Admin endpoints protected with `verifyAdmin` middleware
- Public endpoints (site gifts, order creation) don't require auth
- User ID extracted from JWT for audit logging

### Rate Limiting
- Frontend implements rate limiting for login attempts
- Security events logged to browser console

## Important Notes

⚠️ **Data Privacy Warning**
- Figma Make is NOT designed for production use with sensitive PII
- This is a prototype/development environment
- For production, implement additional security measures:
  - Row-level security (RLS) policies
  - Field-level encryption for sensitive data
  - Proper audit logging to database
  - GDPR/CCPA compliance controls
  - IP allowlisting
  - Enhanced rate limiting

## Creating Admin Accounts

### Quick Start

For detailed instructions on creating your first admin account, see **[ADMIN_SETUP.md](./ADMIN_SETUP.md)**.

### Method 1: Using the API Directly

You can create admin accounts by calling the signup endpoint:

```bash
curl -X POST https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "username": "admin",
    "role": "super_admin"
  }'
```

### Method 2: Using Browser Console

Open your browser console and run:
```javascript
fetch('https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin123!',
    username: 'admin',
    role: 'super_admin'
  })
}).then(r => r.json()).then(console.log);
```

### Method 3: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and password
5. Set user metadata: `{ "username": "admin", "role": "super_admin" }`

## Troubleshooting

### "Unauthorized" errors
- Check that access token is being sent in Authorization header
- Verify token hasn't expired
- Re-login to get a fresh token

### Data not loading
- Check browser console for API errors
- Verify Supabase Edge Function is running
- Check that database was properly seeded

### Session expires immediately
- Check Supabase Auth settings for session timeout configuration
- Verify JWT_SECRET environment variable is set

## Development Workflow

1. **Start the application** - Edge function will auto-deploy
2. **Create admin account** - Use signup endpoint or Supabase dashboard
3. **Login** - Use admin login page at `/admin/login`
4. **Access admin portal** - Create clients, sites, gifts, and configurations
5. **Test employee flow** - Access site as employee to select and order gifts

## Migration from Local Storage

The application has been fully migrated from local storage to API-based persistence:

| Old Approach | New Approach |
|-------------|--------------|
| `sessionStorage.setItem()` | API POST/PUT requests |
| `sessionStorage.getItem()` | API GET requests |
| `localStorage` for preferences | API-backed user preferences |
| In-memory demo data | Database-persisted data |
| Context-only state | Server state + local cache |

## Next Steps for Production

To prepare for production deployment:

1. **Database Migration**: Migrate from KV store to proper PostgreSQL tables with schema
2. **Row-Level Security**: Implement RLS policies for multi-tenancy
3. **API Documentation**: Generate OpenAPI/Swagger docs
4. **Rate Limiting**: Implement server-side rate limiting
5. **Monitoring**: Add logging, metrics, and alerting
6. **Backup Strategy**: Implement automated backups
7. **CDN Integration**: Serve static assets via CDN
8. **Email Service**: Configure email for password resets and notifications
9. **Audit Logging**: Store security events in database
10. **GDPR Compliance**: Implement data export, deletion, and consent management