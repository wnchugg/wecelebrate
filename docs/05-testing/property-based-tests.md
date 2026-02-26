# Property-Based Testing Guide

## Overview

Property-based testing (PBT) validates that code satisfies formal specifications by testing properties across many generated inputs. We use `@fast-check/vitest` for PBT.

## Why Property-Based Testing?

Traditional example-based tests check specific cases:
```tsx
it('should validate email', () => {
  expect(emailSchema.parse({ email: 'test@example.com' })).toBeTruthy();
});
```

Property-based tests check properties across many generated inputs:
```tsx
test.prop([fc.emailAddress()], { numRuns: 100 })(
  'should parse all valid emails',
  (email) => {
    const result = emailSchema.safeParse({ email });
    expect(result.success).toBe(true);
  }
);
```

## Setup

```bash
npm install --save-dev @fast-check/vitest fast-check
```

## Basic Pattern

```tsx
import { describe, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { mySchema } from '../my.schema';

/**
 * **Validates: Requirements 1.1, 1.2**
 */
describe('mySchema - Property-Based Tests', () => {
  test.prop([fc.string()], { numRuns: 100 })(
    'should handle all strings',
    (input) => {
      const result = mySchema.safeParse({ value: input });
      // Assert property holds
    }
  );
});
```

## Common Generators

```tsx
// Primitives
fc.string()                    // Any string
fc.string({ minLength: 2 })    // Min length
fc.string({ maxLength: 100 })  // Max length
fc.integer()                   // Any integer
fc.integer({ min: 0, max: 100 }) // Range
fc.boolean()                   // true/false
fc.constant('value')           // Fixed value

// Structured
fc.emailAddress()              // Valid emails
fc.webUrl()                    // Valid URLs
fc.date()                      // Date objects
fc.array(fc.string())          // Arrays
fc.record({ key: fc.string() }) // Objects

// Combinations
fc.oneof(fc.string(), fc.integer()) // One of
fc.constantFrom('a', 'b', 'c')      // Pick from list

// Filtering
fc.string().filter(s => s.length > 5) // Custom filter
```

## Schema Validation Pattern

### Valid Data Tests

```tsx
/**
 * **Validates: Requirements 1.1**
 * Property: Valid data should always parse successfully
 */
test.prop([
  fc.string({ minLength: 2, maxLength: 100 }),
  fc.emailAddress(),
], { numRuns: 100 })('should parse valid data', (name, email) => {
  const data = { name, email };
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
});
```

### Invalid Data Tests

```tsx
/**
 * **Validates: Requirements 1.2**
 * Property: Invalid data should always fail validation
 */
test.prop([
  fc.oneof(
    fc.string({ maxLength: 1 }),  // Too short
    fc.string({ minLength: 101 }), // Too long
  ),
], { numRuns: 100 })('should reject invalid names', (invalidName) => {
  const data = { name: invalidName, email: 'test@example.com' };
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
});
```

### Round-Trip Tests

```tsx
/**
 * **Validates: Requirements 1.1**
 * Property: Round-trip parsing should preserve data
 */
test.prop([
  fc.string({ minLength: 2, maxLength: 100 }),
  fc.emailAddress(),
], { numRuns: 100 })('should preserve data through round-trip', (name, email) => {
  const originalData = { name, email };
  const parsed = schema.parse(originalData);
  const reparsed = schema.parse(parsed);
  expect(reparsed).toEqual(parsed);
});
```

## Real-World Example

```tsx
import { describe, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { shippingSchema } from '../shipping.schema';

/**
 * Property-Based Tests for Shipping Schema
 * 
 * **Validates: Requirements 1.1, 1.2**
 */
describe('shippingSchema - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.1**
   * Property: Valid shipping data should always parse
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 100 }).filter(s => /^[a-zA-Z\s'-]+$/.test(s)),
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
    fc.string({ minLength: 5, maxLength: 200 }),
    fc.string({ minLength: 2, maxLength: 100 }),
    fc.constantFrom('US', 'CA', 'GB', 'FR', 'DE'),
  ], { numRuns: 100 })('should parse valid shipping data', 
    (fullName, phone, street, city, country) => {
      const data = { fullName, phone, street, city, country };
      const result = shippingSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  );

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid phone numbers should fail
   */
  test.prop([
    fc.oneof(
      fc.string({ maxLength: 9 }),  // Too short
      fc.string({ minLength: 10 }).filter(s => /[^0-9\s()+-]/.test(s)), // Invalid chars
    ),
  ], { numRuns: 100 })('should reject invalid phone numbers', (invalidPhone) => {
    const data = {
      fullName: 'John Doe',
      phone: invalidPhone,
      street: '123 Main St',
      city: 'New York',
      country: 'US',
    };
    const result = shippingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Best Practices

1. **Always annotate with requirements**: `**Validates: Requirements X.Y**`
2. **Use 100 runs minimum**: `{ numRuns: 100 }`
3. **Test three properties**:
   - Valid data parses successfully
   - Invalid data fails validation
   - Round-trip parsing preserves data
4. **Use descriptive test names**: Explain what property is being tested
5. **Filter generators carefully**: Ensure generated data matches constraints
6. **Test edge cases**: Empty strings, boundary values, special characters
7. **Keep tests fast**: Avoid expensive operations in test body

## Common Patterns

### Testing String Constraints

```tsx
// Length constraints
fc.string({ minLength: 2, maxLength: 100 })

// Character constraints
fc.string().filter(s => /^[a-zA-Z]+$/.test(s))

// Combined
fc.string({ minLength: 2, maxLength: 100 })
  .filter(s => /^[a-zA-Z\s'-]+$/.test(s))
```

### Testing Number Constraints

```tsx
// Range
fc.integer({ min: 0, max: 100 })

// Positive only
fc.integer({ min: 1 })

// Decimal
fc.float({ min: 0, max: 100, noNaN: true })
```

### Testing Enums

```tsx
// Pick from valid values
fc.constantFrom('active', 'inactive', 'pending')

// Test invalid values
fc.string().filter(s => !['active', 'inactive', 'pending'].includes(s))
```

## Debugging Failed Tests

When a property test fails, fast-check provides a counterexample:

```
Property failed after 42 runs
Counterexample: ["a", "invalid@"]
Shrunk 5 time(s)
Got error: Expected success to be true
```

Use the counterexample to:
1. Understand why the property failed
2. Add it as a specific test case
3. Fix the schema or test logic

## Running Tests

```bash
# Run all property-based tests
npm run test:safe -- src/app/schemas/__tests__/

# Run specific test file
npx vitest src/app/schemas/__tests__/shipping.schema.property.test.ts

# Watch mode
npx vitest watch src/app/schemas/__tests__/
```

### Test Execution Modes

**Local Development** (`npm run test:safe`):
- Uses conservative resource limits (2 workers, 2 max concurrency)
- Safe for laptops and local development machines
- Prevents excessive CPU/memory usage

**CI Environment** (`npm run test:full`):
- Overrides with higher concurrency (4 workers, 4 max concurrency)
- Faster test execution on dedicated CI runners
- Command-line overrides: `--maxConcurrency=4 --poolOptions.threads.maxThreads=4`
- Disables single-thread mode for better performance
- Allocates 4GB memory: `NODE_OPTIONS='--max-old-space-size=4096'`

**Watch Mode** (`npm run test:watch`):
- Omits `--run` flag to enable watch mode
- Re-runs tests on file changes
- Useful for TDD workflow

## Bugfix Testing Patterns

For bugfix specs, create two types of tests following the observation-first methodology:

### 1. Bug Condition Exploration Tests

Verify the bug exists before implementing fixes. These tests should **fail on unfixed code** and **pass after fixes are applied**.

#### Pattern: Compilation Error Exploration

```tsx
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * Bug Condition Exploration Test
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */
describe('TypeScript Error Cleanup - Bug Condition Exploration', () => {
  it('should verify TypeScript compilation succeeds with 0 errors', () => {
    let typeCheckOutput = '';
    let exitCode = 0;
    
    try {
      typeCheckOutput = execSync('npm run type-check', {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd()
      });
    } catch (error: any) {
      exitCode = error.status || 1;
      typeCheckOutput = error.stdout || error.stderr || '';
    }
    
    // Parse and categorize errors
    const errorCount = parseErrorCount(typeCheckOutput);
    
    // Log counterexamples for debugging
    console.log(`Total TypeScript Errors: ${errorCount}`);
    
    // This assertion FAILS on unfixed code (proving bug exists)
    // After fixes, this assertion PASSES (proving bug is fixed)
    expect(exitCode).toBe(0);
    expect(errorCount).toBe(0);
  });
});
```

#### Pattern: Test Suite Timeout Exploration

```tsx
import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';

/**
 * Bug Condition Exploration Test - Test Suite Hangs
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code
 * **Validates: Requirements 1.1, 1.2**
 */
describe('Test Failures Fix - Bug Condition Exploration', () => {
  it('should verify test:safe completes within reasonable time', async () => {
    const timeoutMs = 180000; // 3 minutes
    const startTime = Date.now();
    let completed = false;
    let exitCode: number | null = null;
    
    const testPromise = new Promise<void>((resolve, reject) => {
      const child = spawn('npm', ['run', 'test:safe'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true
      });
      
      child.on('close', (code) => {
        exitCode = code;
        completed = true;
        resolve();
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      // Kill process if it hangs
      setTimeout(() => {
        if (!completed) {
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!completed) child.kill('SIGKILL');
          }, 5000);
        }
      }, timeoutMs);
    });
    
    await testPromise;
    
    const duration = Date.now() - startTime;
    
    // This assertion FAILS on unfixed code (proving bug exists)
    expect(completed, 
      'Test suite should complete within 3 minutes. ' +
      'On unfixed code, the test runner hangs indefinitely.'
    ).toBe(true);
    
    expect(exitCode).not.toBeNull();
    expect(duration).toBeLessThan(timeoutMs);
  }, 210000); // 3.5 minutes test timeout
});
```

#### Pattern: Configuration File Validation

```tsx
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Bug Condition Exploration Test - Configuration Issues
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code
 * **Validates: Requirements 1.2, 1.3, 1.4**
 */
describe('Test Watch Mode Resource Fix - Bug Condition Exploration', () => {
  it('should verify vitest.config.ts has safe default resource limits', () => {
    // Read configuration file
    const vitestConfigPath = join(process.cwd(), 'vitest.config.ts');
    const vitestConfig = readFileSync(vitestConfigPath, 'utf-8');
    
    // Extract configuration values
    const maxConcurrencyMatch = vitestConfig.match(/maxConcurrency:\s*(\d+)/);
    const maxConcurrency = maxConcurrencyMatch ? parseInt(maxConcurrencyMatch[1], 10) : null;
    
    const maxWorkersMatch = vitestConfig.match(/maxWorkers:\s*(\d+)/);
    const maxWorkers = maxWorkersMatch ? parseInt(maxWorkersMatch[1], 10) : null;
    
    console.log('\nCurrent configuration:');
    console.log(`  maxConcurrency: ${maxConcurrency}`);
    console.log(`  maxWorkers: ${maxWorkers}`);
    
    // Check if limits are aggressive (4 or higher)
    const hasAggressiveConcurrency = maxConcurrency !== null && maxConcurrency >= 4;
    const hasAggressiveWorkers = maxWorkers !== null && maxWorkers >= 4;
    
    if (hasAggressiveConcurrency || hasAggressiveWorkers) {
      console.log('\n❌ COUNTEREXAMPLE FOUND:');
      console.log('  - Default resource limits are too aggressive for local development');
      console.log(`  - maxConcurrency: ${maxConcurrency} (should be 2 for local dev)`);
      console.log(`  - maxWorkers: ${maxWorkers} (should be 2 for local dev)`);
      console.log('  - These aggressive limits cause excessive CPU usage');
    }
    
    // This assertion FAILS on unfixed code (proving bug exists)
    expect(maxConcurrency,
      'maxConcurrency should be 2 for safe local development. ' +
      `Current value: ${maxConcurrency}. Aggressive limits cause excessive CPU usage.`
    ).toBe(2);
    
    expect(maxWorkers,
      'maxWorkers should be 2 for safe local development. ' +
      `Current value: ${maxWorkers}. Aggressive limits cause excessive CPU usage.`
    ).toBe(2);
  });
  
  it('should verify all non-watch test commands include --run flag', () => {
    // Read package.json
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Define which commands should have --run flag
    const nonWatchCommands = [
      'test:safe',
      'test:full',
      'test:coverage',
      // ... more commands
    ];
    
    const missingRunFlag: string[] = [];
    
    for (const cmd of nonWatchCommands) {
      const script = packageJson.scripts[cmd];
      const hasRunFlag = script?.includes('--run');
      
      if (!hasRunFlag) {
        missingRunFlag.push(cmd);
      }
    }
    
    if (missingRunFlag.length > 0) {
      console.log('\n❌ COUNTEREXAMPLE FOUND:');
      console.log('  - Some non-watch commands are missing --run flag:');
      missingRunFlag.forEach(cmd => {
        console.log(`    - ${cmd}: ${packageJson.scripts[cmd]}`);
      });
    }
    
    // This assertion documents the expected state
    expect(missingRunFlag.length,
      'All non-watch test commands should have --run flag to prevent watch mode. ' +
      `Missing --run flag in: ${missingRunFlag.join(', ')}`
    ).toBe(0);
  });
});
```

#### Key Characteristics

1. **Expected to fail initially**: Test encodes correct behavior, fails on buggy code
2. **Documents counterexamples**: Logs specific error instances for analysis
3. **Validates fix**: Passes after bug is fixed
4. **Scoped to concrete cases**: Tests actual system behavior, not generated inputs

#### When to Use

- Bugfix specs where you need to verify the bug exists
- Compilation errors, lint violations, or other tool output
- Test suite execution issues (timeouts, hangs, watch mode problems)
- System-level behavior that can be observed via CLI tools
- Before implementing fixes (observation-first methodology)

### 2. Preservation Property Tests

Capture baseline runtime behavior to ensure fixes don't introduce regressions. These tests should **pass on unfixed code** and **continue passing after fixes**.

#### Pattern: Runtime Behavior Preservation

```tsx
import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';

/**
 * Preservation Property Tests
 * 
 * **Property 2: Preservation** - Runtime Behavior Unchanged
 * 
 * **Methodology**: Observation-first approach
 * 1. Run tests on UNFIXED code to establish baseline
 * 2. Apply type fixes
 * 3. Re-run tests to verify behavior is preserved
 * 
 * **EXPECTED OUTCOME**: All tests PASS on unfixed code (confirms baseline)
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */
describe('TypeScript Error Cleanup - Preservation Properties', () => {
  describe('Property 2.1: Component Rendering Preservation', () => {
    /**
     * **Validates: Requirements 3.2, 3.7**
     * 
     * WHEN components render
     * THEN the system SHALL CONTINUE TO display the same UI and functionality
     */
    test.prop([
      fc.record({
        props: fc.record({
          id: fc.string(),
          className: fc.option(fc.string(), { nil: undefined }),
          disabled: fc.boolean(),
        }),
      }),
    ])(
      'should preserve component prop handling for any valid props',
      ({ props }) => {
        // Property: Components should handle props consistently
        // Type fixes should not change how props are processed
        expect(props.id).toBeDefined()
        expect(typeof props.disabled).toBe('boolean')
        
        if (props.className !== undefined) {
          expect(typeof props.className).toBe('string')
        }
      }
    )
  })

  describe('Property 2.2: Null/Undefined Handling Preservation', () => {
    /**
     * **Validates: Requirements 3.2, 3.4, 3.7**
     */
    test.prop([
      fc.record({
        value: fc.oneof(
          fc.string(),
          fc.constant(null),
          fc.constant(undefined)
        ),
        fallback: fc.string(),
      }),
    ])(
      'should preserve null coalescing behavior',
      ({ value, fallback }) => {
        // Property: Null coalescing should work consistently
        const result = value ?? fallback
        
        if (value === null || value === undefined) {
          expect(result).toBe(fallback)
        } else {
          expect(result).toBe(value)
        }
      }
    )
  })

  describe('Property 2.3: Type Guard Preservation', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.7**
     */
    test.prop([
      fc.oneof(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.constant(undefined),
        fc.array(fc.anything()),
        fc.record({ key: fc.string() })
      ),
    ])(
      'should preserve type guard behavior for any value',
      (value) => {
        // Property: Type guards should work consistently
        if (typeof value === 'string') {
          expect(typeof value).toBe('string')
        } else if (typeof value === 'number') {
          expect(typeof value).toBe('number')
        } else if (typeof value === 'boolean') {
          expect(typeof value).toBe('boolean')
        } else if (value === null) {
          expect(value).toBeNull()
        } else if (value === undefined) {
          expect(value).toBeUndefined()
        } else if (Array.isArray(value)) {
          expect(Array.isArray(value)).toBe(true)
        } else if (typeof value === 'object') {
          expect(typeof value).toBe('object')
        }
      }
    )
  })
})
```

#### Key Characteristics

1. **Expected to pass initially**: Tests capture baseline behavior on unfixed code
2. **Validates preservation**: Ensures type fixes don't change runtime behavior
3. **Property-based**: Uses generators to test across many inputs
4. **Comprehensive coverage**: Tests components, hooks, services, utilities, type guards, error handling

#### Common Preservation Properties

- **Component Rendering**: Props handling, UI display, user interactions
- **Hook State Management**: State initialization, updates, side effects
- **API Data Structures**: Request/response formats, data transformations
- **Type Safety**: Dynamic property access, type guards, type coercion
- **Null/Undefined Handling**: Optional chaining, nullish coalescing
- **Array/Object Operations**: Map, filter, reduce, iteration
- **Function Signatures**: Argument handling, return values
- **Error Handling**: Try/catch, error propagation, recovery
- **Configuration Behavior**: Command-line overrides, config file structure, script execution
- **CI/CD Performance**: Resource limits, test execution modes, coverage generation

#### Pattern: Configuration and Command Preservation

```tsx
import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Preservation Property Tests - Configuration Behavior
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */
describe('Configuration Preservation Properties', () => {
  describe('Property 2.1: CI Performance Preservation', () => {
    it('should verify test:full command has CI overrides for performance', () => {
      /**
       * CI testing via test:full must continue to use higher resource limits
       * through command-line overrides.
       */
      
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      const testFullScript = packageJson.scripts['test:full'];
      
      // Verify CI overrides are present
      const hasRunFlag = testFullScript?.includes('--run');
      const hasMaxConcurrency4 = testFullScript?.includes('--maxConcurrency=4');
      const hasMaxThreads4 = testFullScript?.includes('--poolOptions.threads.maxThreads=4');
      const hasSingleThreadFalse = testFullScript?.includes('--poolOptions.threads.singleThread=false');
      
      expect(hasRunFlag, 'test:full must have --run flag').toBe(true);
      expect(hasMaxConcurrency4, 'test:full must have --maxConcurrency=4').toBe(true);
      expect(hasMaxThreads4, 'test:full must have --poolOptions.threads.maxThreads=4').toBe(true);
      expect(hasSingleThreadFalse, 'test:full must have --poolOptions.threads.singleThread=false for performance').toBe(true);
    });
    
    test.prop([fc.constantFrom('test:full')])(
      'should verify CI command has proper overrides (property-based)',
      (command) => {
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const script = packageJson.scripts[command];
        
        expect(script).toContain('--run');
        expect(script).toContain('--maxConcurrency=4');
        expect(script).toContain('--maxWorkers=4');
      }
    );
  });
  
  describe('Property 2.2: Watch Mode Commands Preservation', () => {
    test.prop([
      fc.constantFrom(
        'test:watch',
        'test:button:watch',
        'test:ui-components:watch'
      )
    ])('should verify watch commands omit --run flag', (command) => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const script = packageJson.scripts[command];
      
      expect(script).toBeDefined();
      expect(script).not.toContain('--run');
    });
  });
  
  describe('Property 2.3: Configuration Structure Preservation', () => {
    it('should verify vitest.config.ts has consistent structure', () => {
      const vitestConfigPath = join(process.cwd(), 'vitest.config.ts');
      const vitestConfig = readFileSync(vitestConfigPath, 'utf-8');
      
      // Verify key configuration properties exist
      expect(vitestConfig).toContain('maxConcurrency:');
      expect(vitestConfig).toContain('maxWorkers:');
      expect(vitestConfig).toContain('poolOptions:');
      expect(vitestConfig).toContain("pool: 'forks'");
    });
  });
});
```

#### When to Use

- Bugfix specs where runtime behavior must be preserved
- Type-only fixes (no logic changes)
- Refactoring that should maintain behavior
- Configuration changes that affect test execution
- CI/CD pipeline modifications
- After observation-first methodology establishes baseline

### Bugfix Testing Workflow

1. **Write exploration test** - Verify bug exists (test fails on unfixed code)
2. **Write preservation tests** - Capture baseline behavior (tests pass on unfixed code)
3. **Implement fixes** - Apply type fixes or bug corrections
4. **Re-run exploration test** - Verify bug is fixed (test now passes)
5. **Re-run preservation tests** - Verify no regressions (tests still pass)

## Resources

- [@fast-check/vitest docs](https://fast-check.dev/docs/ecosystem/vitest/)
- [fast-check generators](https://fast-check.dev/docs/core-blocks/arbitraries/)
- [Property-based testing intro](https://fast-check.dev/docs/introduction/)
