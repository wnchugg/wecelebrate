# JALA 2 Platform - Developer Quick Reference

## Quick Links
- [Full Refactoring Summary](./REFACTORING_SUMMARY.md)
- [API Client Documentation](#api-client)
- [Type System](#type-system)
- [Context Providers](#context-providers)
- [Environment Configuration](#environment-configuration)

---

## 🚀 Quick Start

### Import Types
```typescript
// Import from centralized location
import { 
  Client, 
  Site, 
  Gift, 
  Employee,
  Order,
  BaseModalProps,
  LoadingState 
} from '@/app/types';
```

### Use API Client
```typescript
// Import the API client
import { adminApi, publicSiteApi } from '@/app/lib/apiClient';

// Make API calls with full type safety
const clients = await adminApi.clients.list({ page: 1, limit: 10 });
const site = await publicSiteApi.getSiteInfo(siteId);
```

### Use Environment Config
```typescript
import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';

const env = getCurrentEnvironment();
console.log(env.name); // 'development', 'staging', or 'production'
```

---

## 📁 Project Structure

```
/src/app/
├── components/              ← React components
│   ├── admin/              ← Admin-specific components
│   ├── ui/                 ← Reusable UI components
│   └── ...
├── config/
│   ├── buildConfig.ts             ← Build-time config
│   ├── deploymentEnvironments.ts  ← Runtime environments
│   └── validateEnv.ts             ← Environment validation
├── context/                 ← React context providers
│   ├── AdminContext.tsx
│   ├── AuthContext.tsx
│   ├── GiftContext.tsx
│   ├── LanguageContext.tsx
│   └── ... (11 total)
├── hooks/                   ← Custom React hooks
│   ├── useApi.ts           ← Generic API hook
│   ├── useAuth.ts          ← Auth hook
│   ├── useClients.ts       ← Client management hook
│   ├── useSites.ts         ← Site management hook
│   └── useGifts.ts         ← Gift management hook
├── lib/
│   └── apiClient.ts        ← Unified API client ⭐
├── pages/                   ← Page components
│   ├── admin/              ← Admin pages
│   └── ...                 ← Public pages
├── types/                   ← TypeScript types
│   ├── index.ts            ← Central export point ⭐
│   ├── api.types.ts        ← API types
│   ├── emailTemplates.ts   ← Email types
│   ├── shippingConfig.ts   ← Shipping types
│   └── global.d.ts         ← Global declarations
└── utils/
    ├── api.ts              ← Legacy API utils
    ├── errorHandling.ts    ← Error handling
    └── security.ts         ← Security utilities

/supabase/functions/server/
├── index.tsx               ← Consolidated server ⭐
└── kv_store.tsx            ← KV store (protected)
```

---

## 🔌 API Client

### Available APIs

#### 1. Authentication API
```typescript
import { authApi } from '@/app/lib/apiClient';

// Signup
const result = await authApi.signup({
  email: 'user@example.com',
  password: 'password123',
  username: 'johndoe',
  fullName: 'John Doe'
});

// Login
const session = await authApi.login({
  emailOrUsername: 'user@example.com',
  password: 'password123'
});

// Get session
const currentSession = await authApi.getSession();

// Logout
await authApi.logout();
```

#### 2. Admin - Clients API
```typescript
import { adminApi } from '@/app/lib/apiClient';

// List clients (with pagination)
const clients = await adminApi.clients.list({ 
  page: 1, 
  limit: 10 
});

// Get single client
const client = await adminApi.clients.get(clientId);

// Create client
const newClient = await adminApi.clients.create({
  name: 'TechCorp Inc.',
  contactEmail: 'contact@techcorp.com',
  status: 'active'
});

// Update client
const updated = await adminApi.clients.update(clientId, {
  name: 'TechCorp International'
});

// Delete client
await adminApi.clients.delete(clientId);
```

#### 3. Admin - Sites API
```typescript
import { adminApi } from '@/app/lib/apiClient';

// List sites for a client
const sites = await adminApi.sites.list({ 
  page: 1, 
  limit: 10,
  clientId: 'client-123'
});

// Get single site
const site = await adminApi.sites.get(siteId);

// Create site
const newSite = await adminApi.sites.create({
  clientId: 'client-123',
  name: 'Employee Gifts 2026',
  slug: 'employee-gifts-2026',
  status: 'active',
  validationMethods: [
    { type: 'email', enabled: true }
  ]
});

// Update site
const updated = await adminApi.sites.update(siteId, {
  status: 'inactive'
});

// Delete site
await adminApi.sites.delete(siteId);
```

#### 4. Admin - Gifts API
```typescript
import { adminApi } from '@/app/lib/apiClient';

// List gifts
const gifts = await adminApi.gifts.list({ 
  page: 1, 
  limit: 20 
});

// Get single gift
const gift = await adminApi.gifts.get(giftId);

// Create gift
const newGift = await adminApi.gifts.create({
  name: 'Wireless Headphones',
  description: 'Premium noise-cancelling headphones',
  sku: 'WH-2026-001',
  price: 199.99,
  category: 'Electronics',
  status: 'active'
});

// Update gift
const updated = await adminApi.gifts.update(giftId, {
  price: 179.99
});

// Delete gift
await adminApi.gifts.delete(giftId);
```

#### 5. Admin - Employees API
```typescript
import { adminApi } from '@/app/lib/apiClient';

// List employees for a site
const employees = await adminApi.employees.list(siteId, { 
  page: 1, 
  limit: 50 
});

// Get single employee
const employee = await adminApi.employees.get(employeeId);

// Create employee
const newEmployee = await adminApi.employees.create({
  siteId: 'site-123',
  employeeId: 'EMP-001',
  email: 'john.doe@company.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'active'
});

// Bulk import employees
const importResult = await adminApi.employees.bulkImport({
  siteId: 'site-123',
  employees: [
    { employeeId: 'EMP-001', email: 'john@company.com' },
    { employeeId: 'EMP-002', email: 'jane@company.com' }
  ],
  overwriteExisting: false
});
```

#### 6. Public - Site API
```typescript
import { publicSiteApi } from '@/app/lib/apiClient';

// Get site information
const siteInfo = await publicSiteApi.getSiteInfo(siteId);

// Validate access
const validation = await publicSiteApi.validateAccess({
  siteId: 'site-123',
  method: 'email',
  value: 'user@company.com'
});

if (validation.valid) {
  console.log('Access granted!', validation.employeeId);
}
```

#### 7. Public - Orders API
```typescript
import { publicOrderApi } from '@/app/lib/apiClient';

// Create order
const order = await publicOrderApi.create({
  siteId: 'site-123',
  employeeId: 'EMP-001',
  giftId: 'gift-456',
  shippingAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States'
  }
});

// Get order
const orderDetails = await publicOrderApi.get(orderId);

// Track order
const tracking = await publicOrderApi.track('ORD-2026-001234');
```

#### 8. Email Templates API
```typescript
import { emailApi } from '@/app/lib/apiClient';

// List templates
const templates = await emailApi.list(siteId);

// Get template
const template = await emailApi.get(templateId);

// Create template
const newTemplate = await emailApi.create({
  siteId: 'site-123',
  type: 'invite',
  name: 'Employee Invitation',
  subject: 'Your Gift Awaits!',
  htmlContent: '<html>...</html>',
  textContent: 'Plain text version...',
  enabled: true,
  variables: []
});

// Preview template
const preview = await emailApi.preview(templateId);
console.log(preview.html);

// Send test email
const testResult = await emailApi.test(templateId, 'test@example.com');
```

#### 9. Shipping Configuration API
```typescript
import { shippingApi } from '@/app/lib/apiClient';

// Get configuration
const config = await shippingApi.get(siteId);

// Update configuration
const updated = await shippingApi.update(siteId, {
  shippingModes: {
    employee: { enabled: true },
    company: { enabled: true, address: {...} },
    store: { enabled: false, stores: [] }
  },
  standardFields: {...},
  customFields: [...]
});
```

### Error Handling
```typescript
import { adminApi, ApiError } from '@/app/lib/apiClient';

try {
  const client = await adminApi.clients.get(clientId);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 📦 Type System

### Importing Types
```typescript
// ✅ CORRECT - Import from central location
import { 
  Client, 
  Site, 
  Gift,
  Employee,
  Order,
  ValidationMethod,
  ShippingAddress,
  EmailTemplate
} from '@/app/types';

// ❌ INCORRECT - Don't define types inline
interface Client {
  id: string;
  name: string;
}
```

### Available Types

#### Core Domain Types
- `Client` - Client/company information
- `Site` - Gifting site configuration
- `Gift` - Product/gift catalog item
- `Employee` - Employee record
- `Order` - Gift order
- `ShippingAddress` - Shipping address details
- `ValidationMethod` - Access validation configuration
- `EmailTemplate` - Email template definition
- `ShippingPageConfiguration` - Shipping page config

#### API Types
- `ApiResponse<T>` - Generic API response
- `ErrorResponse` - Error response structure
- `SuccessResponse<T>` - Success response structure
- `PaginatedResponse<T>` - Paginated list response
- `PaginationParams` - Pagination parameters

#### Request/Response Types
- `SignupRequest` / `SignupResponse`
- `LoginRequest` / `LoginResponse`
- `CreateClientRequest` / `UpdateClientRequest`
- `CreateSiteRequest` / `UpdateSiteRequest`
- `CreateGiftRequest` / `UpdateGiftRequest`
- `CreateEmployeeRequest` / `UpdateEmployeeRequest`
- `BulkImportRequest` / `BulkImportResponse`
- `ValidateAccessRequest` / `ValidateAccessResponse`
- `MagicLinkRequest` / `MagicLinkResponse`

#### UI Component Types
- `BaseModalProps` - Base modal properties
- `TableColumn<T>` - Table column definition
- `FilterOption` - Filter option
- `SearchParams` - Search parameters
- `FormField` - Form field configuration
- `FormError` - Form validation error
- `LoadingState` - Loading state
- `DataState<T>` - Data with loading state
- `ListState<T>` - List with loading state
- `ToastType` / `Toast` - Toast notification
- `ConfirmDialogState` - Confirmation dialog

---

## 🔐 Context Providers

### Available Contexts

1. **AdminContext** - Admin authentication
```typescript
import { useAdmin } from '@/app/context/AdminContext';

const { isAuthenticated, userId, login, logout } = useAdmin();
```

2. **AuthContext** - User authentication
```typescript
import { useAuth } from '@/app/context/AuthContext';

const { isAuthenticated, userIdentifier, authenticate, logout } = useAuth();
```

3. **GiftContext** - Gift catalog
```typescript
import { useGift } from '@/app/context/GiftContext';

const { gifts, loading, error, refreshGifts } = useGift();
```

4. **LanguageContext** - Multi-language
```typescript
import { useLanguage } from '@/app/context/LanguageContext';

const { language, setLanguage, t } = useLanguage();
```

5. **SiteContext** - Site management
```typescript
import { useSite } from '@/app/context/SiteContext';

const { currentSite, availableSites, selectSite } = useSite();
```

6. **OrderContext** - Order management
```typescript
import { useOrder } from '@/app/context/OrderContext';

const { currentOrder, createOrder, updateOrder } = useOrder();
```

7. **EmailTemplateContext** - Email templates
```typescript
import { useEmailTemplate } from '@/app/context/EmailTemplateContext';

const { templates, loading, createTemplate, updateTemplate } = useEmailTemplate();
```

8. **ShippingConfigContext** - Shipping config
```typescript
import { useShippingConfig } from '@/app/context/ShippingConfigContext';

const { config, loading, updateConfig } = useShippingConfig();
```

9. **PrivacyContext** - Privacy & consent
```typescript
import { usePrivacy } from '@/app/context/PrivacyContext';

const { hasConsent, grantConsent, revokeConsent } = usePrivacy();
```

10. **PublicSiteContext** - Public site data
```typescript
import { usePublicSite } from '@/app/context/PublicSiteContext';

const { siteInfo, loading, error } = usePublicSite();
```

11. **CartContext** - Shopping cart
```typescript
import { useCart } from '@/app/context/CartContext';

const { items, addItem, removeItem, clearCart } = useCart();
```

---

## 🌍 Environment Configuration

### Available Environments
- **Development** - Local development with wjfcqqrlhwdvjmefxky
- **Staging** - Staging environment (if configured)
- **Production** - Live production with lmffeqwhrnbsbhdztwyv

### Getting Current Environment
```typescript
import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';

const env = getCurrentEnvironment();
console.log(env.name);        // 'development' | 'staging' | 'production'
console.log(env.projectId);   // Supabase project ID
console.log(env.anonKey);     // Supabase anon key
console.log(env.baseUrl);     // API base URL
```

### Switching Environments
```typescript
import { setCurrentEnvironment } from '@/app/config/deploymentEnvironments';

// Switch to production
setCurrentEnvironment('production');

// Switch to development
setCurrentEnvironment('development');
```

### Getting All Environments
```typescript
import { getAvailableEnvironments } from '@/app/config/deploymentEnvironments';

const envs = getAvailableEnvironments();
envs.forEach(env => {
  console.log(`${env.name}: ${env.projectId}`);
});
```

---

## 🛠️ Custom Hooks

### useApi - Generic API Hook
```typescript
import { useQuery, useMutation } from '@/app/hooks/useApi';

// Query data
const { data, loading, error, refetch } = useQuery(
  () => adminApi.clients.list({ page: 1, limit: 10 })
);

// Mutate data
const { mutate, loading: mutating } = useMutation(
  (data) => adminApi.clients.create(data),
  {
    onSuccess: (result) => console.log('Created!', result),
    onError: (error) => console.error('Error:', error)
  }
);
```

### useAuth - Authentication Hook
```typescript
import { useAuthQuery, useLoginMutation, useSignupMutation } from '@/app/hooks/useAuth';

// Check session
const { data: session } = useAuthQuery();

// Login
const { mutate: login } = useLoginMutation();
login({ emailOrUsername: 'user@example.com', password: 'pass' });

// Signup
const { mutate: signup } = useSignupMutation();
signup({ email: 'user@example.com', password: 'pass', ... });
```

### useClients - Client Management Hook
```typescript
import { useClientsQuery, useCreateClientMutation } from '@/app/hooks/useClients';

// List clients
const { data: clients } = useClientsQuery({ page: 1, limit: 10 });

// Create client
const { mutate: createClient } = useCreateClientMutation();
createClient({ name: 'TechCorp', contactEmail: 'contact@techcorp.com' });
```

---

## 🎨 Common Patterns

### Loading State
```typescript
import { useState } from 'react';
import type { LoadingState } from '@/app/types';

const [state, setState] = useState<LoadingState>({
  isLoading: false,
  error: null
});

// Set loading
setState({ isLoading: true, error: null });

// Set error
setState({ isLoading: false, error: 'Something went wrong' });

// Set success
setState({ isLoading: false, error: null });
```

### Modal Pattern
```typescript
import type { BaseModalProps } from '@/app/types';

interface MyModalProps extends BaseModalProps {
  data: Gift;
  onSave: (data: Gift) => void;
}

function MyModal({ open, onClose, data, onSave }: MyModalProps) {
  // Modal implementation
}
```

### Form Validation
```typescript
import { sanitizeInput, validateEmailFormat } from '@/app/utils/security';

const email = sanitizeInput(userInput);
if (!validateEmailFormat(email)) {
  setError('Invalid email format');
  return;
}
```

### Error Handling
```typescript
import { showErrorToast, showSuccessToast } from '@/app/utils/errorHandling';

try {
  const result = await adminApi.clients.create(data);
  showSuccessToast('Client created successfully!');
} catch (error) {
  showErrorToast('Failed to create client', error);
}
```

---

## 🔍 Debugging Tips

### API Debugging
```typescript
// Enable verbose logging in apiClient.ts
// Check browser console for request/response logs
```

### Environment Debugging
```typescript
import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';

console.log('Current Environment:', getCurrentEnvironment());
```

### Type Debugging
```typescript
// Use TypeScript utility types
import type { Client } from '@/app/types';

// Check what type a variable has
type ClientKeys = keyof Client; // 'id' | 'name' | 'contactEmail' | ...

// Pick specific properties
type ClientPreview = Pick<Client, 'id' | 'name'>;

// Make all properties optional
type PartialClient = Partial<Client>;
```

---

## 📚 Additional Resources

- [Full Refactoring Summary](./REFACTORING_SUMMARY.md)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Last Updated**: February 8, 2026  
**Version**: 1.0
