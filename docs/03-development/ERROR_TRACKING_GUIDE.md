# Error Tracking & Monitoring Guide

## Overview

JALA 2 uses Sentry for production error tracking, performance monitoring, and user session replay. This guide covers setup, configuration, and usage patterns.

## Setup

### Installation

Sentry is already installed as a dependency:

```bash
npm install @sentry/react
```

### Environment Configuration

Add your Sentry DSN to environment variables:

```bash
# .env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_ENVIRONMENT=production  # or 'development', 'staging'
VITE_APP_VERSION=1.0.0       # Optional: for release tracking
```

**Important:** Sentry only initializes in production builds (`import.meta.env.PROD`). Development errors are logged to console.

### Sentry Configuration

The Sentry client is configured in `src/utils/sentry.ts` with:

- **Environment tracking** - Automatically tags errors by environment
- **Release tracking** - Links errors to specific app versions
- **Performance monitoring** - 10% sample rate for traces
- **Session replay** - 10% normal sessions, 100% error sessions
- **User context** - Automatically attaches user info from localStorage
- **Breadcrumb filtering** - Excludes console logs from breadcrumbs
- **Error filtering** - Ignores browser extension and common non-critical errors

## Usage Patterns

### 1. Error Boundary (Top-Level)

Wrap your app with the Sentry Error Boundary to catch React errors:

```typescript
import { SentryErrorBoundary } from '@/utils/sentry';

function App() {
  return (
    <SentryErrorBoundary
      fallback={<ErrorFallback />}
      showDialog={true}
    >
      <YourApp />
    </SentryErrorBoundary>
  );
}
```

### 2. Manual Error Logging

Use `logError()` for caught exceptions:

```typescript
import { logError } from '@/utils/sentry';

try {
  await riskyOperation();
} catch (error) {
  logError(error as Error, {
    operation: 'riskyOperation',
    userId: user.id,
    context: 'checkout-flow'
  });
}
```

**Behavior:**
- **Development:** Logs to console
- **Production:** Sends to Sentry with context

### 3. User Identification

Track users for better error context:

```typescript
import { identifyUser, clearUser } from '@/utils/sentry';

// On login
identifyUser(user.id, user.email, user.username);

// On logout
clearUser();
```

### 4. Performance Tracking

Track custom performance metrics:

```typescript
import { trackPerformance } from '@/utils/sentry';

const startTime = performance.now();
await expensiveOperation();
const duration = performance.now() - startTime;

trackPerformance('expensive-operation', duration);
```

### 5. Custom Context

Add additional context to errors:

```typescript
import { setContext } from '@/utils/sentry';

setContext('checkout', {
  cartTotal: 150.00,
  itemCount: 3,
  paymentMethod: 'credit-card'
});
```

### 6. Breadcrumbs

Add custom breadcrumbs for debugging:

```typescript
import { addBreadcrumb } from '@/utils/sentry';

addBreadcrumb('User clicked checkout button', 'user-action', {
  cartId: cart.id,
  itemCount: cart.items.length
});
```

### 7. Capture Messages

Log informational messages (not errors):

```typescript
import { captureMessage } from '@/utils/sentry';

captureMessage('Payment processing started', 'info');
captureMessage('Unusual cart behavior detected', 'warning');
```

## Integration Points

### Authentication Flow

```typescript
// src/context/AuthContext.tsx
import { identifyUser, clearUser } from '@/utils/sentry';

// On successful login
const handleLogin = async (credentials) => {
  const user = await login(credentials);
  identifyUser(user.id, user.email);
  setUser(user);
};

// On logout
const handleLogout = () => {
  clearUser();
  setUser(null);
};
```

### API Service Layer

```typescript
// src/services/api.ts
import { logError, addBreadcrumb } from '@/utils/sentry';

export async function fetchData(endpoint: string) {
  addBreadcrumb(`API call: ${endpoint}`, 'http');
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError(error as Error, {
      endpoint,
      method: 'GET',
      service: 'api'
    });
    throw error;
  }
}
```

### Form Submissions

```typescript
// src/components/CheckoutForm.tsx
import { logError, addBreadcrumb } from '@/utils/sentry';

const handleSubmit = async (data: FormData) => {
  addBreadcrumb('Checkout form submitted', 'user-action', {
    itemCount: data.items.length
  });
  
  try {
    await submitOrder(data);
  } catch (error) {
    logError(error as Error, {
      formData: sanitizeFormData(data),
      step: 'checkout'
    });
    showErrorToast('Order submission failed');
  }
};
```

## Ignored Errors

The following errors are automatically filtered out:

### Browser Extensions
- `top.GLOBALS`
- `originalCreateNotification`
- `canvas.contentDocument`
- `MyApp_RemoveAllHighlights`

### Third-Party Plugins
- `Can't find variable: ZiteReader`
- `jigsaw is not defined`
- `ComboSearch is not defined`

### Non-Critical Errors
- `ResizeObserver loop limit exceeded`
- `Non-Error promise rejection captured`

To add more ignored errors, update the `ignoreErrors` array in `src/utils/sentry.ts`.

## Sample Rates

### Performance Traces
- **Rate:** 10% (`tracesSampleRate: 0.1`)
- **Purpose:** Monitor performance without overwhelming Sentry quota
- **Adjust:** Increase for debugging, decrease for high-traffic apps

### Session Replay
- **Normal sessions:** 10% (`replaysSessionSampleRate: 0.1`)
- **Error sessions:** 100% (`replaysOnErrorSampleRate: 1.0`)
- **Purpose:** Capture user sessions when errors occur

## Best Practices

### DO ✅

1. **Use logError() for caught exceptions**
   ```typescript
   try {
     await operation();
   } catch (error) {
     logError(error as Error, { context: 'operation-name' });
   }
   ```

2. **Add context to errors**
   ```typescript
   logError(error, {
     userId: user.id,
     action: 'checkout',
     step: 'payment'
   });
   ```

3. **Identify users on login**
   ```typescript
   identifyUser(user.id, user.email);
   ```

4. **Clear user on logout**
   ```typescript
   clearUser();
   ```

5. **Add breadcrumbs for debugging**
   ```typescript
   addBreadcrumb('User action', 'navigation', { page: '/checkout' });
   ```

### DON'T ❌

1. **Don't log sensitive data**
   ```typescript
   // BAD
   logError(error, { password: user.password });
   
   // GOOD
   logError(error, { userId: user.id });
   ```

2. **Don't log expected errors**
   ```typescript
   // BAD - validation errors are expected
   if (!isValid) {
     logError(new Error('Validation failed'));
   }
   
   // GOOD - only log unexpected errors
   try {
     await submitForm();
   } catch (error) {
     logError(error as Error);
   }
   ```

3. **Don't use in development**
   - Sentry automatically disables in dev mode
   - Errors log to console instead

4. **Don't forget to sanitize data**
   ```typescript
   // BAD
   logError(error, { formData: rawFormData });
   
   // GOOD
   logError(error, { formData: sanitizeFormData(rawFormData) });
   ```

## Monitoring Dashboard

### Accessing Sentry

1. Visit [sentry.io](https://sentry.io)
2. Navigate to your project
3. View errors, performance, and replays

### Key Metrics to Monitor

- **Error rate** - Errors per minute/hour
- **Affected users** - Unique users experiencing errors
- **Performance** - Transaction duration, throughput
- **Release health** - Crash-free sessions per release

### Alerts

Configure alerts in Sentry for:
- Error spike detection
- New error types
- Performance degradation
- High error rates per user

## Troubleshooting

### Sentry Not Capturing Errors

**Check:**
1. `VITE_SENTRY_DSN` is set in `.env`
2. Running production build (`npm run build && npm run preview`)
3. Error is not in `ignoreErrors` list
4. Sample rate is not too low

### User Context Not Appearing

**Check:**
1. `identifyUser()` called after login
2. User data exists in localStorage
3. `beforeSend` hook is not filtering user data

### Too Many Events

**Solutions:**
1. Increase `tracesSampleRate` to reduce performance traces
2. Decrease `replaysSessionSampleRate` to reduce replays
3. Add more errors to `ignoreErrors` list
4. Implement custom `beforeSend` filtering

## Environment-Specific Behavior

### Development
- Sentry **disabled**
- Errors log to console
- No data sent to Sentry

### Staging
- Sentry **enabled**
- Tagged with `environment: staging`
- Full error tracking

### Production
- Sentry **enabled**
- Tagged with `environment: production`
- Full error tracking + session replay

## Related Documentation

- [Security Guide](../06-security/SECURITY_GUIDE.md) - Security best practices
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development workflow
- [Deployment Guide](../04-deployment/DEPLOYMENT_GUIDE.md) - Production deployment
- [Environment Variables](../09-reference/ENVIRONMENT_VARIABLES.md) - Configuration reference

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)

---

**Last Updated:** March 10, 2026  
**Status:** ✅ Implemented and Production Ready
