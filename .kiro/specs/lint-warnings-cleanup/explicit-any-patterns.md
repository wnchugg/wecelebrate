# Explicit Any Type Patterns Analysis

## Summary

Total explicit `any` warnings: **993**

## Distribution by File

### Top 20 Files (70% of warnings)
1. `src/app/pages/admin/SiteConfiguration.tsx` - 142 warnings (14.3%)
2. `src/app/utils/formSchemas.ts` - 33 warnings
3. `src/app/utils/objectUtils.ts` - 31 warnings
4. `src/app/utils/asyncUtils.ts` - 26 warnings
5. `src/app/pages/admin/ExecutiveDashboard.tsx` - 22 warnings
6. `src/app/pages/admin/DeveloperTools.tsx` - 21 warnings
7. `src/app/hooks/usePhase5A.ts` - 19 warnings
8. `src/app/pages/admin/OrderGiftingAnalytics.tsx` - 19 warnings
9. `src/app/types/component.types.ts` - 18 warnings
10. `src/app/utils/reactComponentUtils.tsx` - 18 warnings
11. `src/app/utils/bulkImport.ts` - 17 warnings
12. `src/app/utils/typeUtils.ts` - 17 warnings
13. `src/types/common.ts` - 17 warnings
14. `src/app/utils/testUtils.ts` - 14 warnings
15. `src/app/hooks/usePerformanceUtils.ts` - 13 warnings
16. `src/app/lib/eventHandlers.ts` - 13 warnings
17. `src/app/utils/reactUtils.tsx` - 13 warnings
18. `src/app/pages/admin/ReportsAnalytics.tsx` - 12 warnings
19. `src/app/utils/dashboardPerformanceMonitor.ts` - 12 warnings
20. `src/app/utils/logger.ts` - 12 warnings

## Common Patterns Identified

### Pattern 1: Generic Utility Functions (High Priority)
**Files**: `objectUtils.ts`, `asyncUtils.ts`, `typeUtils.ts`, `formSchemas.ts`

**Examples**:
```typescript
// Pattern: Generic function parameters
function isObject(item: any): item is Record<string, any>
export function deepEqual(obj1: any, obj2: any): boolean
export function get<T = any>(obj: any, path: string, defaultValue?: T): T

// Pattern: Generic async function types
export function debounceAsync<T extends (...args: any[]) => Promise<any>>
export function throttleAsync<T extends (...args: any[]) => Promise<any>>
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>

// Pattern: Validation functions
return (value: any): string | null => { ... }
export const matchValidation = (matchValue: any, fieldName: string = 'Fields')
```

**Fix Strategy**:
- Use `unknown` instead of `any` for truly dynamic inputs
- Add type guards after `unknown` checks
- Use proper generic constraints: `T extends (...args: unknown[]) => Promise<unknown>`
- For validation functions, use specific types or generics: `<T>(value: T): string | null`

### Pattern 2: Event Handlers and Callbacks
**Files**: `eventHandlers.ts`, `reactUtils.tsx`, `reactComponentUtils.tsx`

**Examples**:
```typescript
// Pattern: Event handler parameters
onClick: (event: any) => void
onChange: (value: any) => void
onSubmit: (data: any) => void
```

**Fix Strategy**:
- Use React event types: `React.MouseEvent`, `React.ChangeEvent<HTMLInputElement>`
- Use specific types for data: `onSubmit: (data: FormData) => void`
- Define interfaces for complex callback data

### Pattern 3: Form Data and Validation
**Files**: `formSchemas.ts`, various form components

**Examples**:
```typescript
// Pattern: Form data parameters
confirmPassword: (value: string, formData?: any)
conditionalValidator: (condition: (formData: any) => boolean, ...)
```

**Fix Strategy**:
- Define form data interfaces for each form
- Use generics: `<TFormData>(value: string, formData?: TFormData)`
- Create type-safe validation schemas

### Pattern 4: API Response and Data Structures
**Files**: Dashboard components, analytics pages

**Examples**:
```typescript
// Pattern: API response data
const data: any = await fetchData()
const response: any = await api.get(...)
```

**Fix Strategy**:
- Define response interfaces based on API contracts
- Use type guards to validate API responses
- Create typed API client methods

### Pattern 5: Dynamic Object Access
**Files**: `objectUtils.ts`, configuration files

**Examples**:
```typescript
// Pattern: Dynamic property access
export function get<T = any>(obj: any, path: string, defaultValue?: T): T
export function set<T extends Record<string, any>>(obj: T, path: string, value: any): T
```

**Fix Strategy**:
- Use `Record<string, unknown>` for dynamic objects
- Add type guards for property access
- Use TypeScript's `keyof` and indexed access types where possible

### Pattern 6: Test Utilities and Mocks
**Files**: `testUtils.ts`, test files

**Examples**:
```typescript
// Pattern: Mock data and test helpers
const mockData: any = { ... }
function createMock(overrides?: any)
```

**Fix Strategy**:
- Define proper mock interfaces
- Use `Partial<T>` for overrides
- Create typed test factories

### Pattern 7: Logger and Error Handling
**Files**: `logger.ts`, `errorHandling.ts`, `securityLogger.ts`

**Examples**:
```typescript
// Pattern: Log metadata and error data
log(message: string, metadata?: any)
handleError(error: any)
```

**Fix Strategy**:
- Use `unknown` for error parameters, then narrow with type guards
- Define metadata interfaces: `Record<string, string | number | boolean>`
- Use TypeScript's `Error` type and custom error classes

### Pattern 8: React Component Props
**Files**: `component.types.ts`, various React components

**Examples**:
```typescript
// Pattern: Generic component props
interface ComponentProps {
  data: any;
  onChange: (value: any) => void;
}
```

**Fix Strategy**:
- Define specific prop interfaces
- Use generics for reusable components: `<TData>`
- Leverage React's built-in types: `React.ComponentProps<typeof Component>`

## Batch Fix Opportunities

### Batch 1: Utility Functions (objectUtils, asyncUtils, typeUtils)
- **Count**: ~74 warnings
- **Approach**: Replace `any` with `unknown` and add type guards
- **Priority**: HIGH (these are used throughout the codebase)

### Batch 2: Form Validation (formSchemas.ts)
- **Count**: 33 warnings
- **Approach**: Create generic validation types
- **Priority**: HIGH (affects form type safety)

### Batch 3: Event Handlers (eventHandlers.ts, reactUtils.tsx)
- **Count**: ~26 warnings
- **Approach**: Use proper React event types
- **Priority**: MEDIUM

### Batch 4: SiteConfiguration.tsx
- **Count**: 142 warnings
- **Approach**: Define proper interfaces for site configuration data
- **Priority**: HIGH (single file with most warnings)

### Batch 5: Dashboard and Analytics Pages
- **Count**: ~75 warnings across multiple files
- **Approach**: Define API response interfaces
- **Priority**: MEDIUM

### Batch 6: Test Utilities
- **Count**: ~14 warnings
- **Approach**: Create typed test helpers
- **Priority**: LOW (test code)

## Recommended Fix Order

1. **Phase 1**: Utility functions (objectUtils, asyncUtils, typeUtils) - Foundation for other code
2. **Phase 2**: Form validation (formSchemas.ts) - High impact on type safety
3. **Phase 3**: SiteConfiguration.tsx - Single file with most warnings
4. **Phase 4**: Event handlers and React utilities - Common patterns
5. **Phase 5**: Dashboard and analytics pages - API response types
6. **Phase 6**: Remaining files - Smaller counts, various patterns

## Common Type Replacements

| Current Pattern | Recommended Replacement |
|----------------|------------------------|
| `item: any` | `item: unknown` + type guard |
| `(...args: any[])` | `(...args: unknown[])` or specific types |
| `Promise<any>` | `Promise<unknown>` or `Promise<T>` |
| `Record<string, any>` | `Record<string, unknown>` or specific interface |
| `value: any` in validators | `value: unknown` or generic `<T>(value: T)` |
| `event: any` | `React.MouseEvent`, `React.ChangeEvent`, etc. |
| `error: any` | `error: unknown` + type guard |
| `data: any` from API | Define response interface |

## Type Guard Examples

```typescript
// For unknown types
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// For error handling
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// For API responses
interface ApiResponse<T> {
  data: T;
  status: number;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'status' in value
  );
}
```

## Next Steps

1. Start with utility functions (objectUtils.ts, asyncUtils.ts, typeUtils.ts)
2. Create type guard utilities for common patterns
3. Define interfaces for form data, API responses, and component props
4. Apply fixes in batches, validating after each batch
5. Run tests after each batch to ensure no regressions
