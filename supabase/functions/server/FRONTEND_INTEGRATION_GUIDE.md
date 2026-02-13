# Frontend Integration Guide - Environment-Aware Backend

## 🎯 Quick Start

Your backend is now **100% environment-aware**. Every API request **MUST** include the `X-Environment-ID` header.

---

## 🔑 Required Changes

### 1. Add Environment Header to ALL Requests

```typescript
// Before (OLD - will default to development)
fetch('/api/clients', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// After (NEW - explicitly set environment)
fetch('/api/clients', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Environment-ID': environmentId // 'development' or 'production'
  }
});
```

---

## 🏗️ Recommended Architecture

### Environment Context

Create a React context to manage environment state:

```typescript
// contexts/EnvironmentContext.tsx
import { createContext, useContext, useState } from 'react';

type Environment = 'development' | 'production';

interface EnvironmentContextType {
  environmentId: Environment;
  setEnvironmentId: (env: Environment) => void;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [environmentId, setEnvironmentId] = useState<Environment>('development');
  
  // Environment-specific Supabase configurations
  const config = {
    development: {
      url: 'https://wjfcqqrlhwdvjmefxky.supabase.co',
      anonKey: 'your-dev-anon-key'
    },
    production: {
      url: 'https://lmffeqwhrnbsbhdztwyv.supabase.co',
      anonKey: 'your-prod-anon-key'
    }
  };
  
  return (
    <EnvironmentContext.Provider
      value={{
        environmentId,
        setEnvironmentId,
        supabaseUrl: config[environmentId].url,
        supabaseAnonKey: config[environmentId].anonKey
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) throw new Error('useEnvironment must be used within EnvironmentProvider');
  return context;
};
```

### API Client

Create an environment-aware API client:

```typescript
// lib/api-client.ts
import { useEnvironment } from '@/contexts/EnvironmentContext';

export function useApiClient() {
  const { environmentId, supabaseUrl } = useEnvironment();
  
  const baseUrl = `${supabaseUrl}/functions/v1/make-server-6fcaeea3`;
  
  async function apiCall(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const token = localStorage.getItem(`auth_token_${environmentId}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Environment-ID': environmentId, // ← Critical!
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  return { apiCall, environmentId };
}
```

### Auth Management

Store tokens separately per environment:

```typescript
// lib/auth.ts
export function storeAuthToken(token: string, environmentId: string) {
  localStorage.setItem(`auth_token_${environmentId}`, token);
}

export function getAuthToken(environmentId: string) {
  return localStorage.getItem(`auth_token_${environmentId}`);
}

export function clearAuthToken(environmentId: string) {
  localStorage.removeItem(`auth_token_${environmentId}`);
}

// Clear all tokens when switching environments
export function clearAllTokens() {
  localStorage.removeItem('auth_token_development');
  localStorage.removeItem('auth_token_production');
}
```

---

## 🎨 UI Components

### Environment Selector

Add an environment selector to your admin UI:

```typescript
// components/EnvironmentSelector.tsx
import { useEnvironment } from '@/contexts/EnvironmentContext';

export function EnvironmentSelector() {
  const { environmentId, setEnvironmentId } = useEnvironment();
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Environment:</label>
      <select
        value={environmentId}
        onChange={(e) => setEnvironmentId(e.target.value as any)}
        className="border rounded px-3 py-1"
      >
        <option value="development">Development</option>
        <option value="production">Production</option>
      </select>
      
      {environmentId === 'production' && (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
          LIVE
        </span>
      )}
    </div>
  );
}
```

---

## 📝 Usage Examples

### Login

```typescript
async function handleLogin(email: string, password: string) {
  const { apiCall, environmentId } = useApiClient();
  
  try {
    const { access_token, user } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: email,
        password: password
      })
    });
    
    // Store token for this environment
    storeAuthToken(access_token, environmentId);
    
    return { success: true, user };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error };
  }
}
```

### Fetch Clients

```typescript
async function fetchClients() {
  const { apiCall } = useApiClient();
  
  try {
    const { clients } = await apiCall('/clients');
    return clients;
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw error;
  }
}
```

### Create Site

```typescript
async function createSite(siteData: any) {
  const { apiCall } = useApiClient();
  
  try {
    const { site } = await apiCall('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData)
    });
    return site;
  } catch (error) {
    console.error('Failed to create site:', error);
    throw error;
  }
}
```

---

## ⚠️ Important Warnings

### 1. JWT Tokens are Environment-Specific

A JWT token issued by **development** will **NOT** work with **production** (and vice versa).

**Why?** Tokens are cryptographically signed by different Supabase projects.

**Solution:** Store and manage tokens separately per environment.

### 2. Don't Mix Environments

```typescript
// ❌ BAD: Using dev token with production endpoint
fetch('https://lmffeqwhrnbsbhdztwyv.supabase.co/...', {
  headers: {
    'Authorization': `Bearer ${devToken}`, // Wrong!
    'X-Environment-ID': 'production'
  }
});

// ✅ GOOD: Matching token and environment
fetch('https://lmffeqwhrnbsbhdztwyv.supabase.co/...', {
  headers: {
    'Authorization': `Bearer ${prodToken}`, // Correct!
    'X-Environment-ID': 'production'
  }
});
```

### 3. Clear State When Switching

When user switches environments, clear all state:

```typescript
function switchEnvironment(newEnv: Environment) {
  // Clear current auth
  clearAuthToken(currentEnvironment);
  
  // Clear cached data
  queryClient.clear();
  
  // Set new environment
  setEnvironmentId(newEnv);
  
  // Redirect to login
  router.push('/admin/login');
}
```

---

## 🧪 Testing Checklist

- [ ] Can login to development environment
- [ ] Can login to production environment  
- [ ] Tokens stored separately per environment
- [ ] Switching environments clears old token
- [ ] Data fetched from correct environment
- [ ] No cross-environment data leakage
- [ ] Error messages show correct environment
- [ ] URL changes based on environment

---

## 🐛 Common Issues

### Issue: "Unauthorized: Invalid token"

**Cause:** Using dev token with production environment  
**Fix:** Ensure token matches environment

### Issue: "Seeing dev data in production"

**Cause:** Not sending `X-Environment-ID` header  
**Fix:** Add header to all requests

### Issue: "Login works but can't fetch data"

**Cause:** Header not included in authenticated requests  
**Fix:** Add header to API client default headers

---

## 📚 API Endpoint Examples

All endpoints support environment isolation via the `X-Environment-ID` header:

### Public Endpoints (no auth)
- `GET /health` - Health check
- `GET /test-db` - Database test
- `GET /public/sites` - Get active sites
- `GET /public/sites/:siteId/gifts` - Get site gifts
- `POST /auth/login` - Login
- `POST /auth/signup` - Sign up (requires existing admin)
- `POST /bootstrap/create-admin` - Create first admin

### Protected Endpoints (requires auth)
- `GET /clients` - List clients
- `POST /clients` - Create client
- `GET /sites` - List sites
- `POST /sites` - Create site
- `GET /gifts` - List gifts
- `POST /gifts` - Create gift
- `GET /orders` - List orders

### Environment Configuration (manages environments themselves)
- `GET /config/environments` - List configured environments
- `POST /config/environments` - Add new environment
- `PUT /config/environments` - Update environment

---

## 🎉 You're Ready!

With these changes, your frontend will be fully compatible with the multi-environment backend.

**Key Takeaway:** Always include `X-Environment-ID` header in every API request!
