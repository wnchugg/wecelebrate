# Floating Promises Guide

**Quick reference for handling `@typescript-eslint/no-floating-promises` warnings**

## What is a Floating Promise?

A floating promise is an async operation that's called but not awaited, caught, or explicitly marked as intentional. This can lead to:
- Unhandled errors
- Race conditions
- Silent failures

## When to Fix vs. Ignore

### ✅ FIX: Critical Operations

Add proper error handling for:
- **Authentication/Authorization** - Token refresh, login, logout
- **Data Mutations** - Create, update, delete operations
- **Payment Processing** - Any financial transactions
- **Security Operations** - Permission checks, validation

**Example:**
```typescript
// ❌ BAD - Error could be silently ignored
setTimeout(() => {
  performTokenRefresh();
}, 5000);

// ✅ GOOD - Error is logged
setTimeout(() => {
  void performTokenRefresh().catch((error) => {
    logger.error('Token refresh failed:', error);
  });
}, 5000);
```

### 🔇 SILENCE: False Positives

Use `void` operator for:
- **Synchronous functions** typed as async (e.g., `navigate()`)
- **Fire-and-forget operations** where errors don't matter
- **UI operations** that have their own error handling

**Example:**
```typescript
// ❌ Warning but safe
navigate('/dashboard');

// ✅ Silenced appropriately
void navigate('/dashboard');
```

### ⏳ AWAIT: Sequential Operations

Use `await` when:
- Next operation depends on result
- Need to handle errors immediately
- Operation must complete before continuing

**Example:**
```typescript
// ✅ GOOD - Sequential operations
const handleSubmit = async () => {
  try {
    await saveData();
    await refreshList();
    showSuccessMessage();
  } catch (error) {
    showErrorMessage(error);
  }
};
```

## Common Patterns

### Pattern 1: useEffect with Async

```typescript
// ❌ BAD - Floating promise
useEffect(() => {
  fetchData();
}, []);

// ✅ GOOD - Explicit fire-and-forget
useEffect(() => {
  void fetchData();
}, []);

// ✅ BETTER - With error handling
useEffect(() => {
  void fetchData().catch((error) => {
    console.error('Failed to fetch data:', error);
  });
}, []);

// ✅ BEST - Proper async pattern
useEffect(() => {
  const loadData = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  void loadData();
}, []);
```

### Pattern 2: Event Handlers

```typescript
// ❌ BAD - Floating promise
<button onClick={saveData}>Save</button>

// ✅ GOOD - Wrapped in arrow function
<button onClick={() => void saveData()}>Save</button>

// ✅ BETTER - With error handling
<button onClick={() => {
  void saveData().catch((error) => {
    showErrorToast(error.message);
  });
}}>Save</button>

// ✅ BEST - Proper async handler
<button onClick={async () => {
  try {
    await saveData();
    showSuccessToast('Saved!');
  } catch (error) {
    showErrorToast(error.message);
  }
}}>Save</button>
```

### Pattern 3: setTimeout/setInterval

```typescript
// ❌ BAD - Floating promise
setTimeout(() => {
  refreshToken();
}, 5000);

// ✅ GOOD - With error handling
setTimeout(() => {
  void refreshToken().catch((error) => {
    logger.error('Token refresh failed:', error);
  });
}, 5000);
```

### Pattern 4: Navigation

```typescript
// ❌ Warning (false positive)
navigate('/dashboard');

// ✅ Silenced appropriately
void navigate('/dashboard');

// Note: navigate() is synchronous but typed as potentially async
```

## Decision Tree

```
Is the operation critical?
├─ YES → Add proper error handling (.catch or try/catch)
└─ NO → Is it truly async?
    ├─ YES → Use void operator (fire-and-forget)
    └─ NO → Use void operator (false positive)
```

## ESLint Configuration

To ignore specific patterns, add to `eslint.config.js`:

```javascript
{
  rules: {
    '@typescript-eslint/no-floating-promises': [
      'warn',
      {
        ignoreVoid: true,  // Allow void operator
        ignoreIIFE: true,  // Allow immediately invoked function expressions
      }
    ]
  }
}
```

## Quick Fixes

### 1. Fire-and-Forget (Non-Critical)
```typescript
void asyncOperation();
```

### 2. With Error Logging
```typescript
void asyncOperation().catch((error) => {
  logger.error('Operation failed:', error);
});
```

### 3. With User Feedback
```typescript
void asyncOperation().catch((error) => {
  showErrorToast(error.message);
});
```

### 4. Proper Async/Await
```typescript
const handleOperation = async () => {
  try {
    await asyncOperation();
  } catch (error) {
    handleError(error);
  }
};
```

## Examples from Our Codebase

### ✅ Fixed: Token Manager (Critical)
```typescript
// Before: Silent failure
setTimeout(() => {
  this.performTokenRefresh();
}, refreshTime);

// After: Logged failure
setTimeout(() => {
  void this.performTokenRefresh().catch((error) => {
    logger.error('[TokenManager] Scheduled token refresh failed:', error);
  });
}, refreshTime);
```

### ✅ Fixed: Navigation (False Positive)
```typescript
// Before: Warning
navigate('/admin/login', { replace: true });

// After: Silenced
void navigate('/admin/login', { replace: true });
```

### ✅ Fixed: Security Checks (Fire-and-Forget)
```typescript
// Before: Warning
useEffect(() => {
  performSecurityChecks();
}, []);

// After: Explicit intent
useEffect(() => {
  void performSecurityChecks();
}, []);
```

## Best Practices

1. **Always handle errors in critical operations**
2. **Use `void` operator to show intent**
3. **Add logging for background operations**
4. **Provide user feedback for UI operations**
5. **Document why you're using `void`**

## When in Doubt

Ask yourself:
1. What happens if this operation fails?
2. Does the user need to know about failures?
3. Does the next operation depend on this one?

If any answer is "yes", add proper error handling. Otherwise, `void` is fine.

---

**Remember:** The goal is not to eliminate all warnings, but to handle errors appropriately and show clear intent in your code.
