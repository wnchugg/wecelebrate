# Complete Recovery Guide - Lint Warning Fixes

## Overview

This guide documents all the patterns and approaches used to reduce warnings from 5,149 → 1,028 (80% reduction). Use this to efficiently recreate the lost work.

## Git Workflow (CRITICAL)

```bash
# Always work on a branch
git checkout -b lint-cleanup-[date]

# Commit every 20-50 fixes
git add -A
git commit -m "fix(lint): [category] - [count] warnings"

# Update baseline after each commit
npm run lint:baseline
git add .kiro/specs/lint-warnings-cleanup/baseline.json
git commit --amend --no-edit

# Push every 100 fixes (backup!)
git push origin lint-cleanup-[date]

# NEVER use git checkout -- src/ with uncommitted work!
```

## Phase 1: Explicit `any` Types (564 fixes → 0 warnings)

### Pattern 1: Function Parameters
```typescript
// Before
function foo(data: any) { }

// After - Use specific type
function foo(data: User) { }
function foo(data: Record<string, string>) { }
function foo(data: unknown) { } // Only if truly unknown
```

### Pattern 2: Catch Blocks
```typescript
// Before
catch (error: any) { }

// After
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### Pattern 3: Event Handlers
```typescript
// Before
const handleClick = (e: any) => { }

// After
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { }
```

### Pattern 4: API Responses
```typescript
// Before
const data: any = await response.json();

// After
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = await response.json();
```

### Pattern 5: Array Types
```typescript
// Before
const items: any[] = [];

// After
const items: User[] = [];
const items: Array<{ id: string; name: string }> = [];
```

### Pattern 6: Object Types
```typescript
// Before
const config: any = {};

// After
const config: Record<string, string> = {};
interface Config { key: string; value: number; }
const config: Config = {};
```

### Bulk Fix Script (Use Carefully!)
```bash
# Only for truly generic cases
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/: any\[\]/: unknown[]/g' {} \;
```

## Phase 2: Floating Promises (116 fixes → 0 warnings)

### Pattern 1: Add await
```typescript
// Before
someAsyncFunction();

// After
await someAsyncFunction();
```

### Pattern 2: Add void for fire-and-forget
```typescript
// Before
someAsyncFunction();

// After
void someAsyncFunction();
```

### Pattern 3: Add .catch() handler
```typescript
// Before
someAsyncFunction();

// After
someAsyncFunction().catch((error: unknown) => {
  console.error('Error:', error);
});
```

### Pattern 4: Promise.all for multiple
```typescript
// Before
promise1();
promise2();

// After
await Promise.all([promise1(), promise2()]);
```

### Bulk Find Command
```bash
npm run lint 2>&1 | grep "no-floating-promises" | grep -B2 "warning" | grep "^/" | sed 's|/Users/[^/]*/[^/]*/||'
```

## Phase 3: Misused Promises (27 fixes → 0 warnings)

### Pattern 1: Conditional Expressions
```typescript
// Before
const result = condition ? asyncFunc() : value;

// After
const result = condition ? await asyncFunc() : value;
```

### Pattern 2: Logical Operators
```typescript
// Before
const result = value || asyncFunc();

// After
const result = value || await asyncFunc();
```

### Pattern 3: Array Methods
```typescript
// Before
array.forEach(async (item) => await process(item));

// After
await Promise.all(array.map(async (item) => await process(item)));
```

## Phase 4: React Hook Dependencies (57 fixes → 0 warnings)

### Pattern 1: Add missing dependencies
```typescript
// Before
useEffect(() => {
  doSomething(value);
}, []);

// After
useEffect(() => {
  doSomething(value);
}, [value]);
```

### Pattern 2: Use useCallback
```typescript
// Before
useEffect(() => {
  const handler = () => doSomething(value);
  handler();
}, [value]);

// After
const handler = useCallback(() => {
  doSomething(value);
}, [value]);

useEffect(() => {
  handler();
}, [handler]);
```

### Pattern 3: Disable rule (rare cases)
```typescript
// Only when truly safe
useEffect(() => {
  doSomething();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

## Phase 5: Unsafe Member Access (244 fixes → 201 warnings)

### Pattern 1: Type Guards
```typescript
// Before
const name = data.user.name;

// After
const name = data && typeof data === 'object' && 'user' in data 
  ? (data.user as { name: string }).name 
  : '';
```

### Pattern 2: Optional Chaining
```typescript
// Before
const name = data.user.name;

// After
const name = data?.user?.name ?? '';
```

### Pattern 3: Type Assertions with Validation
```typescript
// Before
const value = obj.property;

// After
interface Expected { property: string; }
const value = (obj as Expected).property;
```

### Pattern 4: Narrow Types
```typescript
// Before
function process(data: unknown) {
  return data.value;
}

// After
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  return '';
}
```

## Phase 6: Unsafe Assignments (36 fixes → 190 warnings)

### Pattern 1: Type Annotations
```typescript
// Before
const result = await response.json();

// After
const result: ApiResponse = await response.json();
```

### Pattern 2: Type Assertions
```typescript
// Before
const data = JSON.parse(str);

// After
interface Data { id: string; }
const data = JSON.parse(str) as Data;
```

### Pattern 3: Validation Functions
```typescript
// Before
const config = getConfig();

// After
function isValidConfig(obj: unknown): obj is Config {
  return typeof obj === 'object' && obj !== null && 'key' in obj;
}

const config = getConfig();
if (isValidConfig(config)) {
  // config is now typed as Config
}
```

## Phase 7: Unsafe Arguments (31 fixes → 50 warnings)

### Pattern 1: Type Function Parameters
```typescript
// Before
function process(callback: (data: any) => void) { }

// After
function process(callback: (data: User) => void) { }
```

### Pattern 2: Generic Constraints
```typescript
// Before
function map<T>(items: T[], fn: (item: any) => any) { }

// After
function map<T, R>(items: T[], fn: (item: T) => R): R[] { }
```

## Phase 8: Unsafe Calls (30 fixes → 81 warnings)

### Pattern 1: Type Function Returns
```typescript
// Before
const result = someFunction();

// After
const result: string = someFunction();
// Or add return type to function
function someFunction(): string { }
```

### Pattern 2: Mock Functions in Tests
```typescript
// Before
const mockFn = vi.fn();

// After
const mockFn = vi.fn() as unknown as (arg: string) => number;
```

## Phase 10: Unused Imports/Variables (359 → target 0)

### Pattern 1: Remove Unused Imports
```typescript
// Before
import { unused, used } from './module';

// After
import { used } from './module';
```

### Pattern 2: Prefix Unused Parameters
```typescript
// Before
function handler(event, data) { }

// After
function handler(_event, data) { }
```

### Pattern 3: Rename in Destructuring
```typescript
// Before
const { unused, used } = obj;

// After
const { unused: _unused, used } = obj;
```

### Pattern 4: Remove Unused Variables
```typescript
// Before
const unused = getValue();
const used = getOther();

// After
const used = getOther();
```

### Bulk Fix Scripts
```bash
# Find unused variables
npm run lint 2>&1 | grep "is defined but never used" | awk -F"'" '{print $2}' | sort | uniq -c | sort -rn

# Fix unused catch errors
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/} catch (error) {/} catch {/g' {} \;

# Fix unused event parameters (be careful!)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/(e) =>/(\_e) =>/g' {} \;
```

## Phase 11: React Component Exports (53 warnings)

### Pattern: Named Exports
```typescript
// Before
export default function Component() { }

// After
function Component() { }
export default Component;

// Or use named export
export function Component() { }
```

## Phase 12: Unnecessary Async (56 warnings)

### Pattern: Remove async if no await
```typescript
// Before
async function foo() {
  return value;
}

// After
function foo() {
  return value;
}
```

## Quick Reference: Most Common Fixes

### Top 10 Patterns by Frequency
1. **Explicit any** (564) - Replace with specific types
2. **Unsafe member access** (244) - Add type guards/optional chaining
3. **Floating promises** (116) - Add await or void
4. **Unsafe assignments** (36) - Add type annotations
5. **Unsafe arguments** (31) - Type function parameters
6. **Unsafe calls** (30) - Type function returns
7. **Misused promises** (27) - Add await in expressions
8. **Hook dependencies** (57) - Add missing deps
9. **Unused variables** (359) - Remove or prefix with _
10. **React exports** (53) - Use named exports

## Validation Commands

```bash
# Check current warnings
npm run lint 2>&1 | grep -E "✖ [0-9]+ problems"

# Check specific category
npm run lint 2>&1 | grep "no-explicit-any" | wc -l

# Validate no regressions
npm run lint:validate

# Type check
npm run type-check

# Update baseline
npm run lint:baseline
```

## Time Estimates

- Phase 1 (Explicit any): 8-10 hours
- Phase 2 (Floating promises): 2-3 hours
- Phase 3 (Misused promises): 1 hour
- Phase 4 (Hook deps): 1-2 hours
- Phase 5 (Unsafe member): 4-6 hours
- Phase 6 (Unsafe assign): 1-2 hours
- Phase 7 (Unsafe args): 1-2 hours
- Phase 8 (Unsafe calls): 1-2 hours
- Phase 10 (Unused vars): 2-3 hours
- Phase 11 (React exports): 1 hour
- Phase 12 (Async): 1 hour

**Total**: 24-34 hours of focused work

## Tips for Efficiency

1. **Work in batches** - Fix 20-50 similar warnings at once
2. **Use find/grep** - Identify patterns before fixing
3. **Test incrementally** - Run type-check after each batch
4. **Commit frequently** - Every 20-50 fixes
5. **Use sed carefully** - Only for truly safe patterns
6. **Focus on one category** - Complete one phase before moving to next
7. **Document patterns** - Note any new patterns you discover

## Recovery Strategy

### Week 1: High-Impact Categories
- Day 1-2: Phase 1 (Explicit any) - 564 fixes
- Day 3: Phase 2 (Floating promises) - 116 fixes
- Day 4: Phase 5 (Unsafe member access) - 244 fixes
- Day 5: Phase 10 (Unused variables) - 359 fixes

### Week 2: Remaining Categories
- Day 1: Phases 3, 4, 6, 7, 8 - 181 fixes
- Day 2: Phases 11, 12 - 109 fixes
- Day 3: Final validation and cleanup

**Target**: Back to 1,028 warnings in 2 weeks of focused work

