# Floating Promises Analysis

## Summary

Total floating promise warnings: **155** across **68 files**

## Pattern Categories

Based on analysis of the codebase, floating promises fall into these categories:

### 1. Fire-and-Forget in useEffect (Most Common)
**Pattern**: Async functions called in useEffect without await
**Count**: ~40-50 instances
**Example**:
```typescript
useEffect(() => {
  loadConnections();  // ❌ Floating promise
  loadSyncHistory();  // ❌ Floating promise
}, [client.id]);
```

**Fix Strategy**: 
- Add `void` operator for intentional fire-and-forget
- Add error handling with `.catch()`
```typescript
useEffect(() => {
  void loadConnections().catch(console.error);
  void loadSyncHistory().catch(console.error);
}, [client.id]);
```

### 2. Event Handlers with Async Calls
**Pattern**: Async functions called in event handlers without proper handling
**Count**: ~30-40 instances
**Example**:
```typescript
const handleClick = () => {
  saveData();  // ❌ Floating promise
};
```

**Fix Strategy**:
- Use `void` operator with error handling
- Or make the handler async and await
```typescript
const handleClick = () => {
  void saveData().catch(console.error);
};
// OR
const handleClick = async () => {
  await saveData();
};
```

### 3. Missing Await in Async Functions
**Pattern**: Promise-returning function called without await in async context
**Count**: ~30-40 instances
**Example**:
```typescript
const processData = async () => {
  fetchData();  // ❌ Should be awaited
  // ... more code
};
```

**Fix Strategy**:
- Add `await` keyword
```typescript
const processData = async () => {
  await fetchData();
  // ... more code
};
```

### 4. Promises That Should Be Returned
**Pattern**: Promise created but not returned to caller
**Count**: ~20-30 instances
**Example**:
```typescript
const wrapper = async () => {
  someAsyncOperation();  // ❌ Should return
};
```

**Fix Strategy**:
- Return the promise
```typescript
const wrapper = () => {
  return someAsyncOperation();
};
```

### 5. Conditional/Try-Catch Blocks
**Pattern**: Promises in conditional logic or error handling
**Count**: ~10-15 instances
**Example**:
```typescript
try {
  doSomething();
  asyncOperation();  // ❌ Floating promise
} catch (error) {
  // ...
}
```

**Fix Strategy**:
- Add await or proper handling
```typescript
try {
  doSomething();
  await asyncOperation();
} catch (error) {
  // ...
}
```

## Files with Most Warnings

Based on the analysis, these files have the highest concentration:

1. `src/app/components/admin/HRISIntegrationTab.tsx` - 8 warnings
2. `src/app/components/admin/BackendHealthMonitor.tsx` - 4 warnings
3. `src/app/components/TokenErrorHandler.tsx` - 3 warnings
4. `src/app/components/SiteLoaderWrapper.tsx` - 2 warnings
5. `src/app/components/admin/DatabaseCleanupPanel.tsx` - 2 warnings

## Recommended Fix Order

1. **Start with useEffect patterns** - Most common and straightforward
2. **Fix event handlers** - Important for user interactions
3. **Add awaits in async functions** - Ensures proper sequencing
4. **Return promises where appropriate** - Simplifies code
5. **Handle edge cases** - Conditional blocks and error handling

## Error Handling Strategy

For all fire-and-forget promises, we should add error handling:

```typescript
// Bad
void someAsyncOperation();

// Good
void someAsyncOperation().catch((error) => {
  console.error('Error in someAsyncOperation:', error);
  // Optional: Report to error tracking service
});
```

## Notes

- Most floating promises are in React components (useEffect, event handlers)
- Many are intentional fire-and-forget but lack explicit marking
- Some may reveal actual bugs where await was forgotten
- Error handling is often missing even when promises are handled
