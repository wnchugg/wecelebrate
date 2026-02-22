# Database Performance Optimizer

This module analyzes and optimizes database performance issues identified by Supabase's database linter.

## Features

- **RLS Policy Optimization**: Wraps authentication functions in SELECT subqueries to evaluate once per query instead of once per row
- **Policy Consolidation**: Merges multiple permissive RLS policies into single, more efficient policies
- **Index Management**: Removes duplicate and unused indexes, creates missing indexes for foreign keys
- **Semantic Validation**: Verifies that optimizations preserve the same access grants

## Testing

### Unit Tests (Default)

Unit tests use mocked database connections and run by default:

```bash
npm run test:safe -- src/db-optimizer/__tests__/
```

These tests validate:
- Parser logic for linter output
- Optimization algorithms (auth function wrapping, policy consolidation)
- Property-based tests for correctness properties
- Semantic validation logic with mocked data

### Integration Tests (Optional)

Integration tests connect to a real Supabase database to validate against actual schema and policies.

#### Setup

1. **Get your Supabase database connection details:**
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > Database
   - Copy the "Connection string" (use "Direct connection" mode)
   - Replace `[YOUR-PASSWORD]` with your actual database password

2. **Add to your `.env` file:**

   Option A - Use connection string (recommended):
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres
   ```

   Option B - Use individual variables:
   ```env
   DB_HOST=db.wjfcqqrlhwdvvjmefxky.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

3. **Run integration tests:**

   ```bash
   npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
   ```

#### What Integration Tests Do

Integration tests will:
- ✓ Connect to your Supabase database
- ✓ Query `pg_policies` to find existing RLS policies
- ✓ Query `pg_indexes` to find existing indexes
- ✓ Identify policies with auth functions that could be optimized
- ✓ List tables with RLS enabled
- ✓ Show potential optimization candidates

**Note:** Integration tests are read-only and will not modify your database.

#### Troubleshooting

**Connection fails:**
- Verify your password is correct
- Check that your IP is allowed in Supabase (Project Settings > Database > Connection pooling)
- Ensure you're using the "Direct connection" string, not "Connection pooling"

**SSL errors:**
- The connection automatically uses SSL for Supabase hosts
- If you see SSL errors, check your Supabase project settings

**No policies found:**
- If your database has no RLS policies yet, some tests will be skipped
- This is normal for new projects

## Usage Example

```typescript
import { DatabaseConnection } from './db-utils';
import { SemanticValidator } from './validator';
import { PolicyOptimizer } from './optimizer';

// Connect to database
const db = new DatabaseConnection({
  connectionString: process.env.DATABASE_URL
});
await db.connect();

// Create validator
const validator = new SemanticValidator(db);

// Create optimizer
const optimizer = new PolicyOptimizer();

// Optimize a policy
const originalSQL = 'auth.uid() = user_id';
const optimizedSQL = optimizer.optimize(originalSQL);

console.log('Original:', originalSQL);
console.log('Optimized:', optimizedSQL);
// Output: (SELECT auth.uid()) = user_id

// Validate the optimization
const optimization = {
  warning: {
    tableName: 'users',
    schemaName: 'public',
    policyName: 'user_policy',
    authFunctions: ['auth.uid()'],
  },
  originalSQL,
  optimizedSQL,
  estimatedImpact: 'Reduces row evaluations by ~90%',
};

const [isValid, reason] = await validator.validateRLSOptimization(optimization);
console.log('Valid:', isValid, 'Reason:', reason);

// Clean up
await db.disconnect();
```

## Architecture

```
db-optimizer/
├── models.ts           # Type definitions
├── parser.ts           # Linter output parser
├── optimizer.ts        # RLS and policy optimizers
├── analyzer.ts         # Index analyzer
├── validator.ts        # Semantic validation
├── migration.ts        # Migration script generator
├── estimator.ts        # Impact estimation
├── db-utils.ts         # Database connection utilities
└── __tests__/
    ├── *.test.ts                    # Unit tests (mocked)
    └── *.integration.test.ts        # Integration tests (real DB)
```

## Property-Based Testing

This module uses property-based testing (PBT) with `fast-check` to validate correctness properties:

- **Property 1**: RLS Auth Function Detection
- **Property 2**: Auth Function Wrapping
- **Property 3**: Current Setting Replacement
- **Property 4**: Multiple Auth Function Wrapping
- **Property 5**: Semantic Preservation (validates Requirements 1.3, 2.3, 5.2)
- **Property 6**: Permissive Policy Consolidation Detection
- **Property 7**: OR Logic Consolidation
- **Property 8**: Conflicting Policy Detection
- **Property 9**: Policy Type Separation
- **Property 29**: Complex Expression Handling

Each property test runs 100+ iterations with randomly generated inputs to ensure correctness across all cases.

## Development

### Running Tests

```bash
# Run all unit tests
npm run test:safe -- src/db-optimizer/__tests__/

# Run specific test file
npm run test:safe -- src/db-optimizer/__tests__/validator.test.ts

# Run with coverage
npm run test:coverage -- src/db-optimizer/__tests__/

# Run integration tests (requires DB config)
npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
```

### Adding New Tests

1. **Unit tests**: Add to existing `*.test.ts` files or create new ones
2. **Property tests**: Use `test.prop()` from `@fast-check/vitest`
3. **Integration tests**: Add to `*.integration.test.ts` files

### Type Checking

```bash
npm run type-check
```

## License

ISC
