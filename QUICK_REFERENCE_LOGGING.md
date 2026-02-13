# Quick Reference: Logging Best Practices

## ❌ Don't Use console.log in Production Code

```typescript
// ❌ BAD - Will trigger ESLint error
console.log('User logged in:', user);
console.log('[Service] Processing request');
console.warn('Token might be expired');
```

## ✅ Use the Logger Utility

```typescript
import { logger } from '@/utils/logger';

// ✅ GOOD - Structured logging with context
logger.debug('User logged in', { userId: user.id });
logger.info('Processing request', { service: 'AuthService' });
logger.warn('Token might be expired', { expiresAt: token.exp });
logger.error('Request failed', { error, service: 'ApiService' });
```

## Logger Levels

### DEBUG (Development Only)
Use for detailed debugging information
```typescript
logger.debug('Request attempt', { 
  service: 'DashboardService',
  attempt: 1,
  url: '/api/stats'
});
```

### INFO (Important Events)
Use for significant application events
```typescript
logger.info('User authenticated', { 
  userId: user.id,
  role: user.role 
});
```

### WARN (Potential Issues)
Use for recoverable issues that need attention
```typescript
logger.warn('Rate limit approaching', { 
  current: 95,
  limit: 100 
});
```

### ERROR (Failures)
Use for errors and exceptions
```typescript
logger.error('API request failed', { 
  error: error.message,
  statusCode: 500,
  service: 'PaymentService'
});
```

## Security: Never Log Sensitive Data

```typescript
// ❌ NEVER log these
console.log('Token:', token);
console.log('Password:', password);
console.log('API Key:', apiKey);
console.log('Credit Card:', cardNumber);

// ✅ Log existence, not values
logger.debug('Authentication check', { 
  hasToken: !!token,
  // Never log actual token value
});
```

## When console.log IS Allowed

### 1. Scripts and CLI Tools
```typescript
// ✅ OK in src/scripts/
console.log('🌱 Seeding database...');
console.log('✅ Completed successfully');
```

### 2. Test Files
```typescript
// ✅ OK in *.test.ts files
console.log = vi.fn(); // Mocking
```

### 3. console.error for Critical Errors
```typescript
// ✅ Allowed by ESLint config
console.error('Fatal error:', error);
```

## ESLint Configuration

Current rule in `eslint.config.js`:
```javascript
'no-console': ['error', { 
  allow: ['error'] // Only console.error is allowed
}]
```

## Migration Checklist

When you see console.log in code:

1. ✅ Is it in a script file? → Keep it
2. ✅ Is it in a test file? → Keep it (if mocking)
3. ✅ Is it logging sensitive data? → Remove immediately
4. ✅ Is it in production code? → Convert to logger
5. ✅ Is it in JSDoc example? → Keep it (it's documentation)

## Examples from Codebase

### Before (dashboardService.ts)
```typescript
console.log(`[DashboardService] Request attempt ${attempt + 1}/${retries + 1}: ${url}`);
console.warn('[DashboardService] No access token found - request may fail');
console.log(`[DashboardService] Request successful: ${url}`);
```

### After (dashboardService.ts)
```typescript
logger.debug('Request attempt', { 
  service: 'DashboardService',
  attempt: attempt + 1,
  maxRetries: retries + 1,
  url 
});

logger.warn('No access token found - request may fail', { 
  service: 'DashboardService' 
});

logger.debug('Request successful', { 
  service: 'DashboardService',
  url 
});
```

## Benefits of Using Logger

1. **Structured Data:** Easy to parse and analyze
2. **Context:** Service name, timestamps, metadata
3. **Levels:** Filter by severity in production
4. **Server Logging:** Can send to logging service
5. **Type Safety:** Proper TypeScript support
6. **Production Ready:** Can be disabled/filtered

## Quick Import

```typescript
// Add to top of file
import { logger } from '@/utils/logger';
// or
import { logger } from '../../utils/logger';
```

## Common Patterns

### API Request Logging
```typescript
logger.debug('API request started', { 
  service: 'ServiceName',
  method: 'GET',
  url 
});

// ... make request ...

logger.debug('API request completed', { 
  service: 'ServiceName',
  statusCode: response.status 
});
```

### Error Handling
```typescript
try {
  // ... code ...
} catch (error) {
  logger.error('Operation failed', { 
    service: 'ServiceName',
    error: error instanceof Error ? error.message : 'Unknown error',
    context: { userId, action }
  });
  throw error;
}
```

### Conditional Logging
```typescript
if (!token) {
  logger.warn('Missing authentication token', { 
    service: 'AuthService',
    endpoint: '/api/protected'
  });
}
```
