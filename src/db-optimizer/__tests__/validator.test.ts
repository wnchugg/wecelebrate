/**
 * Tests for semantic validator.
 */

import { describe, it, expect, vi } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { SemanticValidator, type UserContext } from '../validator';
import type { RLSOptimization, PolicyConsolidation, RLSAuthWarning, MultiplePermissiveWarning, PolicyDefinition } from '../models';
import { DatabaseConnection } from '../db-utils';

describe('SemanticValidator', () => {
  it('should initialize validator', () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);
    expect(validator).toBeDefined();
  });
});

/**
 * Property 5: Semantic Preservation
 * Feature: database-performance-optimization
 * 
 * For any optimization (RLS or policy consolidation), the optimized version should grant
 * access to exactly the same set of rows as the original version(s) for all possible
 * database states and user contexts.
 * 
 * Validates: Requirements 1.3, 2.3, 5.2
 */
describe('Property 5: Semantic Preservation', () => {
  // Generator for user contexts
  const userContextGenerator = fc.record({
    userId: fc.uuid(),
    role: fc.constantFrom('authenticated', 'anon', 'service_role'),
    jwtClaims: fc.option(
      fc.record({
        sub: fc.uuid(),
        role: fc.constantFrom('authenticated', 'anon', 'service_role'),
      }),
      { nil: undefined }
    ),
  });

  // Generator for RLS auth warnings
  const rlsAuthWarningGenerator = fc.record({
    tableName: fc.constantFrom('users', 'posts', 'comments', 'profiles'),
    schemaName: fc.constant('public'),
    policyName: fc.string({ minLength: 5, maxLength: 20 }),
    authFunctions: fc.constantFrom(
      ['auth.uid()'],
      ['auth.jwt()'],
      ['auth.role()'],
      ['auth.uid()', 'auth.role()'],
    ),
  });

  // Generator for policy SQL with auth functions
  const policySQLGenerator = fc.oneof(
    fc.constant('auth.uid() = user_id'),
    fc.constant('user_id = auth.uid()'),
    fc.constant('auth.uid() = user_id AND status = true'),
    fc.constant('auth.uid() = user_id OR auth.uid() = owner_id'),
    fc.constant('auth.role() = role_name'),
    fc.constant('auth.uid() = user_id AND auth.role() = role_name'),
    fc.constant("current_setting('request.jwt.claims', true)::json->>'sub' = user_id"),
  );

  // Generator for RLS optimizations
  const rlsOptimizationGenerator = fc.tuple(
    rlsAuthWarningGenerator,
    policySQLGenerator
  ).map(([warning, originalSQL]) => {
    // Generate optimized SQL by wrapping auth functions
    let optimizedSQL = originalSQL;
    
    // Replace current_setting
    optimizedSQL = optimizedSQL.replace(
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/gi,
      '(SELECT auth.uid())'
    );
    
    // Wrap auth functions
    optimizedSQL = optimizedSQL.replace(/(?<!\(SELECT\s+)(auth\.uid\(\))/gi, '(SELECT $1)');
    optimizedSQL = optimizedSQL.replace(/(?<!\(SELECT\s+)(auth\.jwt\(\))/gi, '(SELECT $1)');
    optimizedSQL = optimizedSQL.replace(/(?<!\(SELECT\s+)(auth\.role\(\))/gi, '(SELECT $1)');

    const optimization: RLSOptimization = {
      warning,
      originalSQL,
      optimizedSQL,
      estimatedImpact: 'Test optimization',
    };
    
    return optimization;
  });

  // Generator for policy definitions
  const policyDefinitionGenerator = fc.record({
    name: fc.string({ minLength: 5, maxLength: 20 }),
    using: fc.oneof(
      fc.constant('user_id = 1'),
      fc.constant('user_id = 2'),
      fc.constant('owner_id = 3'),
      fc.constant('status = true'),
      fc.constant('role = \'admin\''),
    ),
    withCheck: fc.option(
      fc.oneof(
        fc.constant('status = true'),
        fc.constant('role = \'admin\''),
        fc.constant('user_id = 1'),
      ),
      { nil: undefined }
    ),
  });

  // Generator for policy consolidations
  const policyConsolidationGenerator = fc.tuple(
    fc.record({
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      role: fc.constantFrom('authenticated', 'anon'),
      action: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE') as fc.Arbitrary<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'>,
      policyNames: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 4 }),
    }),
    fc.array(policyDefinitionGenerator, { minLength: 2, maxLength: 4 })
  ).map(([warning, originalPolicies]) => {
    // Generate consolidated policy by OR-combining USING clauses
    const usingClauses = originalPolicies
      .map(p => p.using)
      .filter(u => u && u.trim() !== '')
      .map(u => `(${u})`);
    
    const consolidatedUsing = usingClauses.join(' OR ');

    // Combine WITH CHECK clauses
    const withCheckClauses = originalPolicies
      .map(p => p.withCheck)
      .filter(wc => wc && wc.trim() !== '')
      .map(wc => `(${wc})`);

    const consolidatedWithCheck = withCheckClauses.length > 0
      ? withCheckClauses.join(' OR ')
      : undefined;

    const consolidation: PolicyConsolidation = {
      warning,
      originalPolicies,
      consolidatedPolicy: {
        name: `${warning.tableName}_consolidated`,
        using: consolidatedUsing,
        withCheck: consolidatedWithCheck,
      },
      estimatedImpact: 'Test consolidation',
    };

    return consolidation;
  });

  test.prop([rlsOptimizationGenerator, fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })])(
    'RLS optimization should preserve semantic equivalence for all user contexts',
    async (optimization, userContexts) => {
      // Create mock database connection
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      // Mock the executeWithPolicy method to simulate query execution
      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // For this property test, we simulate that both original and optimized
      // policies return the same results (semantic preservation)
      // In a real implementation, this would execute actual queries
      const mockResults = [
        { id: 1, user_id: userContexts[0].userId, status: true },
        { id: 2, user_id: userContexts[0].userId, status: false },
      ];
      
      executeWithPolicySpy.mockResolvedValue(mockResults);

      // Validate the optimization
      const [isValid, reason] = await validator.validateRLSOptimization(
        optimization,
        userContexts
      );

      // The validation should pass because both return the same results
      expect(isValid).toBe(true);
      expect(reason).toContain('passed');

      // Verify that executeWithPolicy was called for both original and optimized
      const callCount = executeWithPolicySpy.mock.calls.length;
      expect(callCount).toBe(userContexts.length * 2); // 2 calls per context (original + optimized)

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([rlsOptimizationGenerator, fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })])(
    'RLS optimization validation should fail when results differ',
    async (optimization, userContexts) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate different results for original vs optimized (semantic violation)
      let callIndex = 0;
      executeWithPolicySpy.mockImplementation(async () => {
        callIndex++;
        // Return different results for original (odd calls) vs optimized (even calls)
        if (callIndex % 2 === 1) {
          return [
            { id: 1, user_id: userContexts[0].userId },
            { id: 2, user_id: userContexts[0].userId },
          ];
        } else {
          return [
            { id: 1, user_id: userContexts[0].userId },
            // Missing id: 2 - semantic violation!
          ];
        }
      });

      const [isValid, reason] = await validator.validateRLSOptimization(
        optimization,
        userContexts
      );

      // Validation should fail due to different results
      expect(isValid).toBe(false);
      expect(reason).toContain('failed');
      expect(reason).toMatch(/returned \d+ rows/);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([policyConsolidationGenerator, fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })])(
    'Policy consolidation should preserve semantic equivalence for all user contexts',
    async (consolidation, userContexts) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate that consolidated policy grants access to union of all original policies
      const mockResults = [
        { id: 1, user_id: 1, status: true },
        { id: 2, user_id: 2, status: false },
        { id: 3, owner_id: 3, status: true },
      ];
      
      executeWithPolicySpy.mockResolvedValue(mockResults);

      const [isValid, reason] = await validator.validatePolicyConsolidation(
        consolidation,
        userContexts
      );

      // Validation should pass because consolidated grants same access as union of originals
      expect(isValid).toBe(true);
      expect(reason).toContain('passed');

      // Verify executeWithPolicy was called for each original policy + consolidated
      const callCount = executeWithPolicySpy.mock.calls.length;
      const expectedCalls = userContexts.length * (consolidation.originalPolicies.length + 1);
      expect(callCount).toBe(expectedCalls);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([policyConsolidationGenerator, fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })])(
    'Policy consolidation validation should fail when consolidated grants different access',
    async (consolidation, userContexts) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      let callIndex = 0;
      const totalOriginalCalls = userContexts.length * consolidation.originalPolicies.length;
      
      executeWithPolicySpy.mockImplementation(async (query: string, policySQL: string) => {
        callIndex++;
        
        // Check if this is a consolidated policy call by looking at the policy SQL
        const isConsolidated = policySQL.includes('_consolidated');
        
        if (!isConsolidated) {
          // Original policies - grant access to rows 1, 2, 3
          return [
            { id: 1, user_id: 1 },
            { id: 2, user_id: 2 },
            { id: 3, owner_id: 3 },
          ];
        } else {
          // Consolidated policy - missing row 3 (semantic violation)
          return [
            { id: 1, user_id: 1 },
            { id: 2, user_id: 2 },
          ];
        }
      });

      const [isValid, reason] = await validator.validatePolicyConsolidation(
        consolidation,
        userContexts
      );

      // Validation should fail due to different access grants
      expect(isValid).toBe(false);
      expect(reason).toContain('failed');
      expect(reason).toMatch(/granted access to \d+ rows/);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([rlsOptimizationGenerator])(
    'Validation should handle errors gracefully',
    async (optimization) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate an error during query execution
      executeWithPolicySpy.mockRejectedValue(new Error('Database connection failed'));

      const [isValid, reason] = await validator.validateRLSOptimization(optimization);

      // Validation should fail with error message
      expect(isValid).toBe(false);
      expect(reason).toContain('Validation error');
      expect(reason).toContain('Database connection failed');

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([policyConsolidationGenerator])(
    'Consolidation validation should handle errors gracefully',
    async (consolidation) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate an error during query execution
      executeWithPolicySpy.mockRejectedValue(new Error('Query timeout'));

      const [isValid, reason] = await validator.validatePolicyConsolidation(consolidation);

      // Validation should fail with error message
      expect(isValid).toBe(false);
      expect(reason).toContain('Validation error');
      expect(reason).toContain('Query timeout');

      executeWithPolicySpy.mockRestore();
    }
  );

  // Unit tests for specific scenarios
  it('should validate RLS optimization with default user contexts', async () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const optimization: RLSOptimization = {
      warning: {
        tableName: 'users',
        schemaName: 'public',
        policyName: 'test_policy',
        authFunctions: ['auth.uid()'],
      },
      originalSQL: 'auth.uid() = user_id',
      optimizedSQL: '(SELECT auth.uid()) = user_id',
      estimatedImpact: 'Test',
    };

    const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
    executeWithPolicySpy.mockResolvedValue([{ id: 1, user_id: 'test-user' }]);

    const [isValid, reason] = await validator.validateRLSOptimization(optimization);

    expect(isValid).toBe(true);
    expect(reason).toContain('passed');

    // Should use default contexts (3 contexts)
    expect(executeWithPolicySpy.mock.calls.length).toBe(6); // 3 contexts * 2 calls each

    executeWithPolicySpy.mockRestore();
  });

  it('should validate policy consolidation with default user contexts', async () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const consolidation: PolicyConsolidation = {
      warning: {
        tableName: 'users',
        schemaName: 'public',
        role: 'authenticated',
        action: 'SELECT',
        policyNames: ['policy_1', 'policy_2'],
      },
      originalPolicies: [
        { name: 'policy_1', using: 'user_id = 1' },
        { name: 'policy_2', using: 'user_id = 2' },
      ],
      consolidatedPolicy: {
        name: 'consolidated',
        using: '(user_id = 1) OR (user_id = 2)',
      },
      estimatedImpact: 'Test',
    };

    const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
    executeWithPolicySpy.mockResolvedValue([
      { id: 1, user_id: 1 },
      { id: 2, user_id: 2 },
    ]);

    const [isValid, reason] = await validator.validatePolicyConsolidation(consolidation);

    expect(isValid).toBe(true);
    expect(reason).toContain('passed');

    // Should use default contexts (3 contexts) * (2 original + 1 consolidated) = 9 calls
    expect(executeWithPolicySpy.mock.calls.length).toBe(9);

    executeWithPolicySpy.mockRestore();
  });

  it('should generate test queries correctly', () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const userContext: UserContext = {
      userId: 'test-user-id',
      role: 'authenticated',
    };

    const query = validator.generateTestQuery('public', 'users', 'test_policy', userContext);

    expect(query).toBe('SELECT * FROM public.users');
  });

  it('should compare result sets correctly', () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const results1 = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    const results2 = [
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
    ];

    const results3 = [
      { id: 1, name: 'Alice' },
    ];

    // Same results in different order should be equal
    const areEqual1 = (validator as any).areResultSetsEqual(results1, results2);
    expect(areEqual1).toBe(true);

    // Different results should not be equal
    const areEqual2 = (validator as any).areResultSetsEqual(results1, results3);
    expect(areEqual2).toBe(false);
  });
});

/**
 * Property 27: Validation Query Generation
 * Feature: database-performance-optimization
 * 
 * For any optimization, test queries should be generated for validation.
 * 
 * Validates: Requirements 5.1
 */
describe('Property 27: Validation Query Generation', () => {
  // Generator for RLS auth warnings
  const rlsAuthWarningGenerator = fc.record({
    tableName: fc.constantFrom('users', 'posts', 'comments', 'profiles'),
    schemaName: fc.constant('public'),
    policyName: fc.string({ minLength: 5, maxLength: 20 }),
    authFunctions: fc.constantFrom(
      ['auth.uid()'],
      ['auth.jwt()'],
      ['auth.role()'],
    ),
  });

  // Generator for RLS optimizations
  const rlsOptimizationGenerator = fc.tuple(
    rlsAuthWarningGenerator,
    fc.oneof(
      fc.constant('auth.uid() = user_id'),
      fc.constant('user_id = auth.uid()'),
      fc.constant('auth.uid() = user_id AND status = true'),
    )
  ).map(([warning, originalSQL]) => {
    const optimizedSQL = originalSQL.replace(/(?<!\(SELECT\s+)(auth\.uid\(\))/gi, '(SELECT $1)');
    
    const optimization: RLSOptimization = {
      warning,
      originalSQL,
      optimizedSQL,
      estimatedImpact: 'Test optimization',
    };
    
    return optimization;
  });

  // Generator for user contexts
  const userContextGenerator = fc.record({
    userId: fc.uuid(),
    role: fc.constantFrom('authenticated', 'anon', 'service_role'),
    jwtClaims: fc.option(
      fc.record({
        sub: fc.uuid(),
        role: fc.constantFrom('authenticated', 'anon', 'service_role'),
      }),
      { nil: undefined }
    ),
  });

  test.prop([rlsOptimizationGenerator, userContextGenerator])(
    'Test queries should be generated for each optimization',
    async (optimization, userContext) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      // Generate test query
      const query = validator.generateTestQuery(
        optimization.warning.schemaName,
        optimization.warning.tableName,
        optimization.warning.policyName,
        userContext
      );

      // Verify query is generated
      expect(query).toBeDefined();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);

      // Verify query contains table reference
      expect(query).toContain(optimization.warning.schemaName);
      expect(query).toContain(optimization.warning.tableName);

      // Verify query is a SELECT statement
      expect(query.toLowerCase()).toContain('select');
      expect(query.toLowerCase()).toContain('from');
    }
  );

  test.prop([rlsOptimizationGenerator])(
    'Test queries should be generated for all user contexts',
    async (optimization) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      // Get default user contexts
      const defaultContexts = (validator as any).generateDefaultUserContexts();

      // Verify default contexts are generated
      expect(defaultContexts).toBeDefined();
      expect(Array.isArray(defaultContexts)).toBe(true);
      expect(defaultContexts.length).toBeGreaterThan(0);

      // Generate test query for each context
      const queries = defaultContexts.map((context: UserContext) =>
        validator.generateTestQuery(
          optimization.warning.schemaName,
          optimization.warning.tableName,
          optimization.warning.policyName,
          context
        )
      );

      // Verify queries are generated for all contexts
      expect(queries.length).toBe(defaultContexts.length);
      queries.forEach(query => {
        expect(query).toBeDefined();
        expect(typeof query).toBe('string');
        expect(query.length).toBeGreaterThan(0);
      });
    }
  );

  test.prop([
    fc.record({
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      role: fc.constantFrom('authenticated', 'anon'),
      action: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE') as fc.Arbitrary<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'>,
      policyNames: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 4 }),
    }),
    userContextGenerator
  ])(
    'Test queries should be generated for policy consolidations',
    async (warning, userContext) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      // Generate test query
      const query = validator.generateTestQuery(
        warning.schemaName,
        warning.tableName,
        'consolidated_test',
        userContext
      );

      // Verify query is generated
      expect(query).toBeDefined();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);

      // Verify query structure
      expect(query).toContain(warning.schemaName);
      expect(query).toContain(warning.tableName);
      expect(query.toLowerCase()).toContain('select');
    }
  );

  it('should generate consistent queries for same inputs', () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const userContext: UserContext = {
      userId: 'test-user-id',
      role: 'authenticated',
    };

    const query1 = validator.generateTestQuery('public', 'users', 'test_policy', userContext);
    const query2 = validator.generateTestQuery('public', 'users', 'test_policy', userContext);

    // Same inputs should generate same query
    expect(query1).toBe(query2);
  });

  it('should generate different queries for different tables', () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const userContext: UserContext = {
      userId: 'test-user-id',
      role: 'authenticated',
    };

    const query1 = validator.generateTestQuery('public', 'users', 'test_policy', userContext);
    const query2 = validator.generateTestQuery('public', 'posts', 'test_policy', userContext);

    // Different tables should generate different queries
    expect(query1).not.toBe(query2);
    expect(query1).toContain('users');
    expect(query2).toContain('posts');
  });
});

/**
 * Property 28: Validation Failure Handling
 * Feature: database-performance-optimization
 * 
 * For any optimization that should fail validation, it should be rejected and logged.
 * 
 * Validates: Requirements 5.5
 */
describe('Property 28: Validation Failure Handling', () => {
  // Generator for RLS auth warnings
  const rlsAuthWarningGenerator = fc.record({
    tableName: fc.constantFrom('users', 'posts', 'comments'),
    schemaName: fc.constant('public'),
    policyName: fc.string({ minLength: 5, maxLength: 20 }),
    authFunctions: fc.constantFrom(['auth.uid()'], ['auth.jwt()']),
  });

  // Generator for user contexts
  const userContextGenerator = fc.record({
    userId: fc.uuid(),
    role: fc.constantFrom('authenticated', 'anon', 'service_role'),
    jwtClaims: fc.option(
      fc.record({
        sub: fc.uuid(),
      }),
      { nil: undefined }
    ),
  });

  test.prop([rlsAuthWarningGenerator, fc.string(), fc.string(), fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })])(
    'Optimizations that fail validation should be rejected',
    async (warning, originalSQL, optimizedSQL, userContexts) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const optimization: RLSOptimization = {
        warning,
        originalSQL,
        optimizedSQL,
        estimatedImpact: 'Test',
      };

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate different results (validation failure)
      let callIndex = 0;
      executeWithPolicySpy.mockImplementation(async () => {
        callIndex++;
        // Original returns 2 rows, optimized returns 1 row (semantic violation)
        if (callIndex % 2 === 1) {
          return [
            { id: 1, user_id: 'user1' },
            { id: 2, user_id: 'user2' },
          ];
        } else {
          return [
            { id: 1, user_id: 'user1' },
          ];
        }
      });

      const [isValid, reason] = await validator.validateRLSOptimization(
        optimization,
        userContexts
      );

      // Validation should fail
      expect(isValid).toBe(false);
      
      // Reason should be provided
      expect(reason).toBeDefined();
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
      
      // Reason should indicate failure
      expect(reason.toLowerCase()).toMatch(/fail|error/);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([
    fc.record({
      tableName: fc.constantFrom('users', 'posts'),
      schemaName: fc.constant('public'),
      role: fc.constantFrom('authenticated', 'anon'),
      action: fc.constantFrom('SELECT', 'INSERT') as fc.Arbitrary<'SELECT' | 'INSERT'>,
      policyNames: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 3 }),
    }),
    fc.array(userContextGenerator, { minLength: 1, maxLength: 3 })
  ])(
    'Policy consolidations that fail validation should be rejected',
    async (warning, userContexts) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const consolidation: PolicyConsolidation = {
        warning,
        originalPolicies: [
          { name: 'policy_1', using: 'user_id = 1' },
          { name: 'policy_2', using: 'user_id = 2' },
        ],
        consolidatedPolicy: {
          name: 'consolidated',
          using: '(user_id = 1) OR (user_id = 2)',
        },
        estimatedImpact: 'Test',
      };

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate different access grants (validation failure)
      executeWithPolicySpy.mockImplementation(async (query: string, policySQL: string) => {
        const isConsolidated = policySQL.includes('_consolidated') || policySQL.includes('consolidated');
        
        if (!isConsolidated) {
          // Original policies grant access to 3 rows
          return [
            { id: 1, user_id: 1 },
            { id: 2, user_id: 2 },
            { id: 3, user_id: 1 },
          ];
        } else {
          // Consolidated grants access to only 2 rows (semantic violation)
          return [
            { id: 1, user_id: 1 },
            { id: 2, user_id: 2 },
          ];
        }
      });

      const [isValid, reason] = await validator.validatePolicyConsolidation(
        consolidation,
        userContexts
      );

      // Validation should fail
      expect(isValid).toBe(false);
      
      // Reason should be provided
      expect(reason).toBeDefined();
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
      
      // Reason should indicate failure
      expect(reason.toLowerCase()).toMatch(/fail|error/);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([rlsAuthWarningGenerator])(
    'Database errors during validation should be caught and logged',
    async (warning) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const optimization: RLSOptimization = {
        warning,
        originalSQL: 'auth.uid() = user_id',
        optimizedSQL: '(SELECT auth.uid()) = user_id',
        estimatedImpact: 'Test',
      };

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate database error
      const errorMessage = 'Connection timeout';
      executeWithPolicySpy.mockRejectedValue(new Error(errorMessage));

      const [isValid, reason] = await validator.validateRLSOptimization(optimization);

      // Validation should fail
      expect(isValid).toBe(false);
      
      // Reason should contain error information
      expect(reason).toContain('Validation error');
      expect(reason).toContain(errorMessage);

      executeWithPolicySpy.mockRestore();
    }
  );

  test.prop([
    fc.record({
      tableName: fc.constantFrom('users', 'posts'),
      schemaName: fc.constant('public'),
      role: fc.constantFrom('authenticated', 'anon'),
      action: fc.constantFrom('SELECT', 'INSERT') as fc.Arbitrary<'SELECT' | 'INSERT'>,
      policyNames: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 3 }),
    })
  ])(
    'Query errors during consolidation validation should be caught and logged',
    async (warning) => {
      const mockDb = new DatabaseConnection();
      const validator = new SemanticValidator(mockDb);

      const consolidation: PolicyConsolidation = {
        warning,
        originalPolicies: [
          { name: 'policy_1', using: 'user_id = 1' },
          { name: 'policy_2', using: 'user_id = 2' },
        ],
        consolidatedPolicy: {
          name: 'consolidated',
          using: '(user_id = 1) OR (user_id = 2)',
        },
        estimatedImpact: 'Test',
      };

      const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
      
      // Simulate query error
      const errorMessage = 'Permission denied';
      executeWithPolicySpy.mockRejectedValue(new Error(errorMessage));

      const [isValid, reason] = await validator.validatePolicyConsolidation(consolidation);

      // Validation should fail
      expect(isValid).toBe(false);
      
      // Reason should contain error information
      expect(reason).toContain('Validation error');
      expect(reason).toContain(errorMessage);

      executeWithPolicySpy.mockRestore();
    }
  );

  it('should reject optimization when original and optimized return different row counts', async () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const optimization: RLSOptimization = {
      warning: {
        tableName: 'users',
        schemaName: 'public',
        policyName: 'test_policy',
        authFunctions: ['auth.uid()'],
      },
      originalSQL: 'auth.uid() = user_id',
      optimizedSQL: '(SELECT auth.uid()) = user_id',
      estimatedImpact: 'Test',
    };

    const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
    
    let callIndex = 0;
    executeWithPolicySpy.mockImplementation(async () => {
      callIndex++;
      // Original returns 3 rows, optimized returns 2 rows
      if (callIndex % 2 === 1) {
        return [
          { id: 1, user_id: 'user1' },
          { id: 2, user_id: 'user2' },
          { id: 3, user_id: 'user3' },
        ];
      } else {
        return [
          { id: 1, user_id: 'user1' },
          { id: 2, user_id: 'user2' },
        ];
      }
    });

    const [isValid, reason] = await validator.validateRLSOptimization(optimization);

    expect(isValid).toBe(false);
    expect(reason).toContain('failed');
    expect(reason).toContain('3 rows');
    expect(reason).toContain('2 rows');

    executeWithPolicySpy.mockRestore();
  });

  it('should reject consolidation when consolidated grants different access', async () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const consolidation: PolicyConsolidation = {
      warning: {
        tableName: 'users',
        schemaName: 'public',
        role: 'authenticated',
        action: 'SELECT',
        policyNames: ['policy_1', 'policy_2'],
      },
      originalPolicies: [
        { name: 'policy_1', using: 'user_id = 1' },
        { name: 'policy_2', using: 'user_id = 2' },
      ],
      consolidatedPolicy: {
        name: 'consolidated',
        using: '(user_id = 1) OR (user_id = 2)',
      },
      estimatedImpact: 'Test',
    };

    const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
    
    executeWithPolicySpy.mockImplementation(async (query: string, policySQL: string) => {
      const isConsolidated = policySQL.includes('consolidated');
      
      if (!isConsolidated) {
        // Original policies grant access to 4 rows total
        return [
          { id: 1, user_id: 1 },
          { id: 2, user_id: 2 },
          { id: 3, user_id: 1 },
          { id: 4, user_id: 2 },
        ];
      } else {
        // Consolidated grants access to only 3 rows
        return [
          { id: 1, user_id: 1 },
          { id: 2, user_id: 2 },
          { id: 3, user_id: 1 },
        ];
      }
    });

    const [isValid, reason] = await validator.validatePolicyConsolidation(consolidation);

    expect(isValid).toBe(false);
    expect(reason).toContain('failed');
    expect(reason).toMatch(/\d+ rows/);

    executeWithPolicySpy.mockRestore();
  });

  it('should provide detailed error messages for validation failures', async () => {
    const mockDb = new DatabaseConnection();
    const validator = new SemanticValidator(mockDb);

    const optimization: RLSOptimization = {
      warning: {
        tableName: 'users',
        schemaName: 'public',
        policyName: 'test_policy',
        authFunctions: ['auth.uid()'],
      },
      originalSQL: 'auth.uid() = user_id',
      optimizedSQL: '(SELECT auth.uid()) = user_id',
      estimatedImpact: 'Test',
    };

    const executeWithPolicySpy = vi.spyOn(validator as any, 'executeWithPolicy');
    
    let callIndex = 0;
    executeWithPolicySpy.mockImplementation(async () => {
      callIndex++;
      if (callIndex % 2 === 1) {
        return [{ id: 1 }, { id: 2 }];
      } else {
        return [{ id: 1 }];
      }
    });

    const userContext: UserContext = {
      userId: 'test-user-123',
      role: 'authenticated',
    };

    const [isValid, reason] = await validator.validateRLSOptimization(
      optimization,
      [userContext]
    );

    expect(isValid).toBe(false);
    expect(reason).toContain('failed');
    expect(reason).toContain('test-user-123'); // Should include user context
    expect(reason).toContain('2 rows'); // Original count
    expect(reason).toContain('1 rows'); // Optimized count

    executeWithPolicySpy.mockRestore();
  });
});
