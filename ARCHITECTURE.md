# JALA2 Architecture Documentation

## Overview

JALA2 is an enterprise-grade event gifting platform built with a modern three-tier architecture, featuring TypeScript-first development, comprehensive type safety, runtime validation, and production-ready infrastructure.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Admin    │  │  Employee  │  │   Public   │        │
│  │    SPA     │  │    SPA     │  │   Pages    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         React 18 + TypeScript + Tailwind CSS v4         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          │ (Type-Safe Client)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Supabase Edge Functions (Hono)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │   Auth   │  │   CRUD   │  │ Business │        │ │
│  │  │ Handlers │  │ Handlers │  │  Logic   │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  │         TypeScript + Zod Validation               │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ SQL
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Supabase PostgreSQL                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │    KV    │  │   Auth   │  │ Storage  │        │ │
│  │  │  Store   │  │   Data   │  │  Bucket  │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Frontend Architecture

### Technology Stack

```typescript
{
  "framework": "React 18",
  "language": "TypeScript 5.7",
  "styling": "Tailwind CSS v4",
  "routing": "React Router 7",
  "stateManagement": "Context API + Custom Hooks",
  "validation": "Zod 4.3",
  "testing": "Vitest 3.0",
  "buildTool": "Vite 6.3"
}
```

### Directory Structure

```
src/app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── admin/          # Admin-specific components
│   └── figma/          # Figma-imported components
├── pages/              # Route components
│   ├── admin/          # Admin dashboard pages
│   └── *.tsx           # Public pages
├── context/            # React Context providers
├── hooks/              # Custom React hooks
│   ├── useApi.ts       # Base hooks (query, mutation, pagination)
│   ├── useAuth.ts      # Authentication hooks
│   ├── useClients.ts   # Client management hooks
│   ├── useSites.ts     # Site management hooks
│   └── useGifts.ts     # Gift management hooks
├── lib/                # Libraries and utilities
│   └── apiClient.ts    # Type-safe API client
├── types/              # TypeScript type definitions
│   ├── api.types.ts    # API types (40+ interfaces)
│   ├── emailTemplates.ts
│   └── shippingConfig.ts
├── schemas/            # Zod validation schemas
│   └── validation.schemas.ts  # 30+ schemas
├── utils/              # Utility functions
│   ├── api.ts          # Legacy API utils
│   ├── security.ts     # Security utilities
│   ├── errorHandling.ts
│   └── ...
├── config/             # Configuration
│   ├── environments.ts # Multi-environment config
│   └── ...
├── data/               # Static data
└── routes.tsx          # Route configuration
```

### State Management Pattern

#### 1. **Global State (Context API)**

```typescript
// Authentication state
AuthContext: {
  user: User | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>
}

// Site configuration
SiteContext: {
  sites: Site[],
  currentSite: Site | null,
  updateSite: (siteId, data) => Promise<void>
}
```

#### 2. **Server State (Custom Hooks)**

```typescript
// Query hook pattern
const { data, isLoading, error, refetch } = useClients();

// Mutation hook pattern
const { mutate, isLoading, error } = useCreateClient({
  onSuccess: (data) => { /* handle success */ },
  onError: (error) => { /* handle error */ }
});
```

#### 3. **Local State (useState)**

```typescript
// Component-specific state
const [formData, setFormData] = useState<FormData>({});
const [showModal, setShowModal] = useState(false);
```

### Data Flow

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │ 1. Call custom hook
       │    useClients()
       ▼
┌──────────────┐
│ Custom Hook  │
│ useClients() │
└──────┬───────┘
       │ 2. Call API client
       │    apiClient.clients.list()
       ▼
┌──────────────┐
│  API Client  │
│ (Type-Safe)  │
└──────┬───────┘
       │ 3. HTTP request
       │    fetch(/clients)
       ▼
┌──────────────┐
│   Backend    │
│   Server     │
└──────┬───────┘
       │ 4. Response
       │    { data: Client[] }
       ▼
┌──────────────┐
│ Custom Hook  │
│ (Sets State) │
└──────┬───────┘
       │ 5. Re-render
       │    with data
       ▼
┌──────────────┐
│  Component   │
│  (Updated)   │
└──────────────┘
```

---

## 🔧 Backend Architecture

### Technology Stack

```typescript
{
  "runtime": "Deno",
  "framework": "Hono",
  "language": "TypeScript",
  "database": "PostgreSQL (KV Store)",
  "auth": "Supabase Auth",
  "platform": "Supabase Edge Functions"
}
```

### Directory Structure

```
supabase/functions/server/
├── index.tsx           # Main Hono server
├── types.ts            # TypeScript types (40+)
├── validation.ts       # Validation utilities (15+)
├── helpers.ts          # Helper functions (25+)
├── security.ts         # Security utilities
├── kv_store.tsx        # Database utilities
├── kv_env.tsx          # Environment management
├── seed.tsx            # Database seeding
├── tests/              # Backend tests
│   ├── helpers.test.ts
│   └── validation.test.ts
└── API_DOCUMENTATION.md
```

### Request Flow

```
┌──────────────────────────────────────────────────────┐
│                  Incoming Request                     │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│           1. CORS & Logging Middleware                │
│  • Set CORS headers (allow all origins)               │
│  • Log request method, path, and headers              │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          2. Environment ID Middleware                 │
│  • Extract X-Environment-ID header                    │
│  • Default to 'production' if not set                 │
│  • Store in request context                           │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│            3. Rate Limiting Middleware                │
│  • Check request count per IP                         │
│  • 100 requests per minute limit                      │
│  • Return 429 if exceeded                             │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│             4. Route Handler                          │
│  • Match route pattern                                │
│  • Extract route parameters                           │
│  • Call handler function                              │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          5. Authentication Check                      │
│  • Extract X-Access-Token header                      │
│  • Verify JWT with Supabase Auth                      │
│  • Return 401 if invalid (for protected routes)       │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          6. Input Validation (Zod)                    │
│  • Parse request body                                 │
│  • Validate against Zod schema                        │
│  • Return 400 if validation fails                     │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          7. Business Logic                            │
│  • Process validated data                             │
│  • Perform database operations                        │
│  • Apply business rules                               │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          8. Database Operations                       │
│  • Query/Insert/Update/Delete via KV store            │
│  • Apply environment isolation                        │
│  • Handle errors gracefully                           │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          9. Response Formatting                       │
│  • Format successful response                         │
│  • Include pagination metadata                        │
│  • Apply consistent structure                         │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          10. Error Handling                           │
│  • Catch any errors                                   │
│  • Log error details                                  │
│  • Return error response with context                 │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│               Response to Client                      │
└──────────────────────────────────────────────────────┘
```

### API Endpoints

#### Authentication
```
POST /auth/login              - User login
POST /auth/signup             - User signup (requires auth)
POST /auth/logout             - User logout
GET  /auth/session            - Get current session
POST /bootstrap/create-admin  - Bootstrap admin user
```

#### Clients
```
GET    /clients               - List clients (paginated)
POST   /clients               - Create client
GET    /clients/:id           - Get client by ID
PUT    /clients/:id           - Update client
DELETE /clients/:id           - Delete client
```

#### Sites
```
GET    /sites                 - List sites (paginated)
POST   /sites                 - Create site
GET    /sites/:id             - Get site by ID
PUT    /sites/:id             - Update site
DELETE /sites/:id             - Delete site
GET    /clients/:id/sites     - Get sites by client
GET    /public/sites          - Public site list
```

#### Gifts
```
GET    /gifts                 - List gifts (paginated)
POST   /gifts                 - Create gift
GET    /gifts/:id             - Get gift by ID
PUT    /gifts/:id             - Update gift
DELETE /gifts/:id             - Delete gift
POST   /gifts/bulk-delete     - Bulk delete gifts
GET    /public/sites/:id/gifts - Get gifts for site
```

#### Employees
```
GET    /employees             - List employees (paginated, by site)
POST   /employees             - Create employee
GET    /employees/:id         - Get employee by ID
PUT    /employees/:id         - Update employee
DELETE /employees/:id         - Delete employee
POST   /employees/bulk-import - Bulk import employees
```

#### Orders
```
GET    /orders                - List orders (paginated)
POST   /orders                - Create order
GET    /orders/:id            - Get order by ID
PUT    /orders/:id            - Update order
```

#### Validation
```
POST /public/validate-access     - Validate employee access
POST /public/magic-link/request  - Request magic link
```

#### System
```
GET /health                   - Health check
```

---

## 🗄️ Data Architecture

### Database Schema (KV Store)

The application uses a key-value store with the following patterns:

```typescript
// Environment-based keys
`${environmentId}:clients:${clientId}`
`${environmentId}:sites:${siteId}`
`${environmentId}:gifts:${giftId}`
`${environmentId}:employees:${employeeId}`
`${environmentId}:orders:${orderId}`

// Relationship keys
`${environmentId}:client:${clientId}:sites`
`${environmentId}:site:${siteId}:gifts`
`${environmentId}:site:${siteId}:employees`

// Index keys (for lists)
`${environmentId}:clients:list`
`${environmentId}:sites:list`
`${environmentId}:gifts:list`
```

### Environment Isolation

```
Development (wjfcqqrlhwdvvjmefxky):
  development:clients:123
  development:sites:456
  development:gifts:789

Production (lmffeqwhrnbsbhdztwyv):
  production:clients:123
  production:sites:456
  production:gifts:789
```

Data is completely isolated between environments.

---

## 🔐 Security Architecture

### Authentication Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────┐
│   Backend   │
│   Server    │
└──────┬──────┘
       │ 2. Validate credentials
       │    with Supabase Auth
       ▼
┌─────────────┐
│  Supabase   │
│    Auth     │
└──────┬──────┘
       │ 3. Return JWT token
       │    { access_token }
       ▼
┌─────────────┐
│   Backend   │
│   Server    │
└──────┬──────┘
       │ 4. Return response
       │    { accessToken }
       ▼
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 5. Store in sessionStorage
       │    setAccessToken(token)
       ▼
┌─────────────┐
│ Subsequent  │
│  Requests   │
└──────┬──────┘
       │ 6. Include in headers
       │    X-Access-Token: ${token}
       ▼
┌─────────────┐
│   Backend   │
│  (Validates)│
└─────────────┘
```

### Security Layers

1. **Transport Security**
   - HTTPS only in production
   - Secure headers (CORS, CSP)

2. **Authentication**
   - JWT tokens via Supabase Auth
   - Session management
   - Token expiration

3. **Authorization**
   - Role-based access control
   - Protected routes
   - Environment isolation

4. **Input Validation**
   - Zod schema validation
   - Type checking
   - Sanitization

5. **Rate Limiting**
   - Per-IP limits (100/min)
   - Per-endpoint limits
   - DDoS protection

6. **CSRF Protection**
   - Token validation
   - Secure context checks

7. **XSS Prevention**
   - Input sanitization
   - Output encoding
   - Content Security Policy

---

## 🧩 Type Safety Architecture

### Type Flow

```typescript
// 1. Define types
// /src/app/types/api.types.ts
export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  status: 'active' | 'inactive';
}

// 2. Create Zod schema
// /src/app/schemas/validation.schemas.ts
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  contactEmail: z.string().email(),
  status: z.enum(['active', 'inactive']),
});

// 3. Type-safe API client
// /src/app/lib/apiClient.ts
export const apiClient = {
  clients: {
    async get(id: string): Promise<Client> {
      const response = await apiRequest<{ success: true; data: Client }>(
        `/clients/${id}`,
        { requireAuth: true }
      );
      return response.data;
    }
  }
};

// 4. Custom hook
// /src/app/hooks/useClients.ts
export function useClient(id: string) {
  return useQuery<Client>(
    ['client', id],
    () => apiClient.clients.get(id)
  );
}

// 5. Component usage
// /src/app/pages/admin/ClientDetail.tsx
const { data: client, isLoading, error } = useClient(clientId);
//      ^? Client | null - Full type inference!
```

### Validation Layers

```
┌─────────────────────────────────────┐
│      Frontend (TypeScript)          │
│  • Compile-time type checking       │
│  • IDE autocomplete                 │
│  • Catch errors before runtime      │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│       Frontend (Zod)                │
│  • Runtime validation               │
│  • User input validation            │
│  • Form validation                  │
└─────────────────┬───────────────────┘
                  │
                  ▼ HTTP Request
                  │
┌─────────────────────────────────────┐
│       Backend (Zod)                 │
│  • Request validation               │
│  • Data integrity checks            │
│  • Business rule validation         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│    Database (PostgreSQL)            │
│  • Schema constraints               │
│  • Data type enforcement            │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Multi-Environment Setup

```
┌───────────────────────────────────────────────────────┐
│                  Development Environment              │
│  Project: wjfcqqrlhwdvvjmefxky                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Frontend  │  │   Backend   │  │  Database   │  │
│  │  (Vite Dev) │  │  (Function) │  │ (KV Store)  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                 Production Environment                │
│  Project: lmffeqwhrnbsbhdztwyv                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Frontend  │  │   Backend   │  │  Database   │  │
│  │  (Deployed) │  │  (Function) │  │ (KV Store)  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────────────────────────────────────┘
```

### Build Process

```
┌──────────────┐
│ Source Code  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  TypeScript  │
│  Compiler    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     Vite     │
│    Build     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Optimized   │
│   Bundle     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Deploy to  │
│   Hosting    │
└──────────────┘
```

---

## 📊 Performance Architecture

### Optimization Strategies

1. **Code Splitting**
   - Route-based splitting
   - Lazy loading components
   - Dynamic imports

2. **Caching**
   - Browser cache headers
   - API response caching
   - Static asset caching

3. **Data Fetching**
   - Pagination (50 items default)
   - Debounced search (300ms)
   - Optimistic updates

4. **Bundle Optimization**
   - Tree shaking
   - Minification
   - Compression (gzip)

5. **Database Optimization**
   - Key-based lookups
   - Index patterns
   - Efficient queries

---

## 🧪 Testing Architecture

### Testing Pyramid

```
         /\
        /E2E\        (Planned)
       /──────\
      /  Int   \     (65+ backend tests)
     /──────────\
    /   Unit     \   (50+ frontend tests)
   /──────────────\
```

### Test Coverage

- **Unit Tests:** Individual functions, utilities
- **Integration Tests:** API endpoints, data flow
- **E2E Tests:** User workflows (planned)

---

## 📚 Documentation Architecture

### Documentation Layers

1. **Code Documentation (JSDoc)**
   - Inline comments
   - Function descriptions
   - Type definitions

2. **API Documentation**
   - Endpoint reference
   - Request/response examples
   - Error codes

3. **Architecture Documentation**
   - System design
   - Data flow
   - Security model

4. **User Documentation**
   - Setup guides
   - User manuals
   - Troubleshooting

5. **Developer Documentation**
   - Contributing guidelines
   - Code standards
   - Testing guides

---

## 🔄 Future Architecture Considerations

### Scalability

- **Horizontal Scaling:** Edge functions auto-scale
- **Database:** Consider moving to relational schema
- **Caching:** Add Redis for session management
- **CDN:** Use CDN for static assets

### Feature Additions

- **Real-time Updates:** WebSockets for live data
- **File Storage:** Supabase Storage for images
- **Search:** Full-text search with PostgreSQL
- **Analytics:** Add analytics tracking
- **Monitoring:** Add application monitoring

---

## 📖 Related Documentation

- [README.md](/README.md) - Project overview
- [API_DOCUMENTATION.md](/supabase/functions/server/API_DOCUMENTATION.md) - API reference
- [PHASE_3_BACKEND_REFACTORING_COMPLETE.md](/PHASE_3_BACKEND_REFACTORING_COMPLETE.md) - Backend details
- [PHASE_4_FRONTEND_REFACTORING_COMPLETE.md](/PHASE_4_FRONTEND_REFACTORING_COMPLETE.md) - Frontend details
- [SECURITY_AUDIT_SUMMARY.md](/SECURITY_AUDIT_SUMMARY.md) - Security details

---

*Last Updated: February 7, 2026*  
*Version: 1.0.0*  
*Architecture: Three-Tier, TypeScript-First, Production-Ready*
