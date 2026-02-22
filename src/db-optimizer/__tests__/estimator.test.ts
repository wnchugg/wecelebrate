/**
 * Tests for impact estimator.
 */

import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { ImpactEstimator } from '../estimator';
import type {
  RLSOptimization,
  PolicyConsolidation,
  IndexOptimization,
  RLSAuthWarning,
  MultiplePermissiveWarning,
  PolicyDefinition,
} from '../models';

describe('ImpactEstimator', () => {
  it('should initialize estimator', () => {
    const estimator = new ImpactEstimator();
    expect(estimator).toBeDefined();
  });
});

// Property-based tests

/**
 * Property 25: Impact Estimation Completeness
 * Feature: database-performance-optimization
 * 
 * For any optimization (RLS, policy consolidation, or index operation),
 * the output should include an estimated performance impact.
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */
describe('Property 25: Impact Estimation Completeness', () => {
  const estimator = new ImpactEstimator();

  // Generator for RLS auth warnings
  const rlsAuthWarningArb = fc.record({
    tableName: fc.constantFrom('users', 'posts', 'comments', 'orders'),
    schemaName: fc.constant('public'),
    policyName: fc.string({ minLength: 5, maxLength: 20 }),
    authFunctions: fc.array(
      fc.constantFrom('auth.uid()', 'auth.jwt()', 'auth.role()'),
      { minLength: 1, maxLength: 5 }
    ),
  });

  // Generator for RLS optimizations
  const rlsOptimizationArb = fc.record({
    warning: rlsAuthWarningArb,
    originalSQL: fc.string({ minLength: 10, maxLength: 100 }),
    optimizedSQL: fc.string({ minLength: 10, maxLength: 100 }),
    estimatedImpact: fc.constant(''), // Will be populated by estimator
  });

  // Generator for multiple permissive warnings
  const multiplePermissiveWarningArb = fc.record({
    tableName: fc.constantFrom('users', 'posts', 'comments'),
    schemaName: fc.constant('public'),
    role: fc.constantFrom('authenticated', 'anon', 'service_role'),
    action: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE'),
    policyNames: fc.array(fc.string({ minLength: 5, maxLength: 20 }), {
      minLength: 2,
      maxLength: 5,
    }),
  });

  // Generator for policy definitions
  const policyDefinitionArb = fc.record({
    name: fc.string({ minLength: 5, maxLength: 20 }),
    using: fc.string({ minLength: 10, maxLength: 50 }),
    withCheck: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
  });

  // Generator for policy consolidations
  const policyConsolidationArb = fc.record({
    warning: multiplePermissiveWarningArb,
    originalPolicies: fc.array(policyDefinitionArb, { minLength: 2, maxLength: 5 }),
    consolidatedPolicy: policyDefinitionArb,
    estimatedImpact: fc.constant(''), // Will be populated by estimator
  });

  // Generator for index optimizations
  const indexOptimizationArb = fc.oneof(
    // Remove duplicate
    fc.record({
      type: fc.constant('remove_duplicate' as const),
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      indexToRemove: fc.string({ minLength: 5, maxLength: 30 }),
      estimatedImpact: fc.constant(''),
    }),
    // Remove unused
    fc.record({
      type: fc.constant('remove_unused' as const),
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      indexToRemove: fc.string({ minLength: 5, maxLength: 30 }),
      estimatedImpact: fc.constant(''),
    }),
    // Create FK index
    fc.record({
      type: fc.constant('create_fk_index' as const),
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      indexToCreate: fc.record({
        name: fc.string({ minLength: 5, maxLength: 30 }),
        columns: fc.array(fc.string({ minLength: 3, maxLength: 20 }), {
          minLength: 1,
          maxLength: 3,
        }),
      }),
      estimatedImpact: fc.constant(''),
    })
  );

  test.prop([rlsOptimizationArb])(
    'should provide impact estimate for RLS optimizations',
    (optimization) => {
      const impact = estimator.estimateRLSImpact(optimization);
      
      // Impact should be a non-empty string
      expect(impact).toBeTruthy();
      expect(typeof impact).toBe('string');
      expect(impact.length).toBeGreaterThan(0);
    }
  );

  test.prop([policyConsolidationArb])(
    'should provide impact estimate for policy consolidations',
    (consolidation) => {
      const impact = estimator.estimatePolicyConsolidationImpact(consolidation);
      
      // Impact should be a non-empty string
      expect(impact).toBeTruthy();
      expect(typeof impact).toBe('string');
      expect(impact.length).toBeGreaterThan(0);
    }
  );

  test.prop([indexOptimizationArb])(
    'should provide impact estimate for index optimizations',
    (optimization) => {
      const impact = estimator.estimateIndexImpact(optimization);
      
      // Impact should be a non-empty string
      expect(impact).toBeTruthy();
      expect(typeof impact).toBe('string');
      expect(impact.length).toBeGreaterThan(0);
    }
  );

  test.prop([
    fc.array(rlsOptimizationArb, { maxLength: 5 }),
    fc.array(policyConsolidationArb, { maxLength: 5 }),
    fc.array(indexOptimizationArb, { maxLength: 5 }),
  ])(
    'should provide impact estimates for all optimizations when ranking',
    (rlsOpts, policyOpts, indexOpts) => {
      const ranked = estimator.rankByImpact(rlsOpts, policyOpts, indexOpts);
      
      // All ranked items should have impact estimates
      for (const item of ranked) {
        expect(item.estimatedImpact).toBeTruthy();
        expect(typeof item.estimatedImpact).toBe('string');
        expect(item.estimatedImpact.length).toBeGreaterThan(0);
      }
    }
  );
});


/**
 * Property 26: Impact-Based Ranking
 * Feature: database-performance-optimization
 * 
 * For any set of multiple optimizations, they should be ranked/ordered
 * by their estimated performance impact (highest impact first).
 * 
 * Validates: Requirements 6.5
 */
describe('Property 26: Impact-Based Ranking', () => {
  const estimator = new ImpactEstimator();

  // Generator for RLS auth warnings with controlled auth function counts
  const rlsAuthWarningWithCountArb = (count: number) =>
    fc.record({
      tableName: fc.constantFrom('users', 'posts', 'comments'),
      schemaName: fc.constant('public'),
      policyName: fc.string({ minLength: 5, maxLength: 20 }),
      authFunctions: fc.constant(
        Array(count).fill('auth.uid()') as string[]
      ),
    });

  // Generator for RLS optimizations with specific auth function counts
  const rlsOptWithCountArb = (count: number) =>
    fc.record({
      warning: rlsAuthWarningWithCountArb(count),
      originalSQL: fc.string({ minLength: 10, maxLength: 100 }),
      optimizedSQL: fc.string({ minLength: 10, maxLength: 100 }),
      estimatedImpact: fc.constant(''),
    });

  // Generator for policy consolidations with controlled policy counts
  const policyConsolidationWithCountArb = (count: number) =>
    fc.record({
      warning: fc.record({
        tableName: fc.constantFrom('users', 'posts', 'comments'),
        schemaName: fc.constant('public'),
        role: fc.constantFrom('authenticated', 'anon'),
        action: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE'),
        policyNames: fc.constant(
          Array(count)
            .fill(0)
            .map((_, i) => `policy_${i}`)
        ),
      }),
      originalPolicies: fc.constant(
        Array(count)
          .fill(0)
          .map((_, i) => ({
            name: `policy_${i}`,
            using: 'condition',
          }))
      ) as fc.Arbitrary<PolicyDefinition[]>,
      consolidatedPolicy: fc.record({
        name: fc.constant('consolidated'),
        using: fc.constant('condition'),
      }) as fc.Arbitrary<PolicyDefinition>,
      estimatedImpact: fc.constant(''),
    });

  // Generator for index optimizations with specific types
  const indexOptWithTypeArb = (
    type: 'remove_duplicate' | 'remove_unused' | 'create_fk_index'
  ): fc.Arbitrary<IndexOptimization> => {
    if (type === 'create_fk_index') {
      return fc.record({
        type: fc.constant(type),
        tableName: fc.constantFrom('users', 'posts'),
        schemaName: fc.constant('public'),
        indexToCreate: fc.record({
          name: fc.string({ minLength: 5, maxLength: 30 }),
          columns: fc.array(fc.string({ minLength: 3, maxLength: 20 }), {
            minLength: 1,
            maxLength: 2,
          }),
        }),
        estimatedImpact: fc.constant(''),
      }) as fc.Arbitrary<IndexOptimization>;
    } else {
      return fc.record({
        type: fc.constant(type),
        tableName: fc.constantFrom('users', 'posts'),
        schemaName: fc.constant('public'),
        indexToRemove: fc.string({ minLength: 5, maxLength: 30 }),
        estimatedImpact: fc.constant(''),
      }) as fc.Arbitrary<IndexOptimization>;
    }
  };

  test.prop([
    rlsOptWithCountArb(1),
    rlsOptWithCountArb(3),
  ])(
    'should rank RLS optimizations with more auth functions higher',
    (lowImpact, highImpact) => {
      const ranked = estimator.rankByImpact([lowImpact, highImpact], [], []);
      
      expect(ranked.length).toBe(2);
      // Higher auth function count should be ranked first
      expect(ranked[0].impactScore).toBeGreaterThan(ranked[1].impactScore);
    }
  );

  test.prop([
    policyConsolidationWithCountArb(2),
    policyConsolidationWithCountArb(4),
  ])(
    'should rank policy consolidations with more policies higher',
    (lowImpact, highImpact) => {
      const ranked = estimator.rankByImpact([], [lowImpact, highImpact], []);
      
      expect(ranked.length).toBe(2);
      // More policies consolidated should be ranked first
      expect(ranked[0].impactScore).toBeGreaterThan(ranked[1].impactScore);
    }
  );

  test.prop([
    indexOptWithTypeArb('remove_unused'),
    indexOptWithTypeArb('remove_duplicate'),
    indexOptWithTypeArb('create_fk_index'),
  ])(
    'should rank index optimizations by type priority',
    (unused, duplicate, fkIndex) => {
      const ranked = estimator.rankByImpact([], [], [unused, duplicate, fkIndex]);
      
      expect(ranked.length).toBe(3);
      
      // FK index creation should have highest impact
      const fkRank = ranked.findIndex((r) => {
        const opt = r.optimization as IndexOptimization;
        return opt.type === 'create_fk_index';
      });
      
      // Remove duplicate should be middle
      const dupRank = ranked.findIndex((r) => {
        const opt = r.optimization as IndexOptimization;
        return opt.type === 'remove_duplicate';
      });
      
      // Remove unused should be lowest
      const unusedRank = ranked.findIndex((r) => {
        const opt = r.optimization as IndexOptimization;
        return opt.type === 'remove_unused';
      });
      
      expect(fkRank).toBeLessThan(dupRank);
      expect(dupRank).toBeLessThan(unusedRank);
    }
  );

  test.prop([
    rlsOptWithCountArb(2),
    policyConsolidationWithCountArb(3),
    indexOptWithTypeArb('create_fk_index'),
  ])(
    'should rank RLS optimizations highest, then consolidations, then indexes',
    (rlsOpt, policyOpt, indexOpt) => {
      const ranked = estimator.rankByImpact([rlsOpt], [policyOpt], [indexOpt]);
      
      expect(ranked.length).toBe(3);
      
      // RLS should be first (highest impact)
      expect(ranked[0].type).toBe('rls');
      
      // Policy consolidation should be second
      expect(ranked[1].type).toBe('consolidation');
      
      // Index should be third
      expect(ranked[2].type).toBe('index');
    }
  );

  test.prop([
    fc.array(rlsOptWithCountArb(1), { minLength: 1, maxLength: 3 }),
    fc.array(policyConsolidationWithCountArb(2), { minLength: 1, maxLength: 3 }),
    fc.array(indexOptWithTypeArb('create_fk_index'), { minLength: 1, maxLength: 3 }),
  ])(
    'should maintain descending order of impact scores',
    (rlsOpts, policyOpts, indexOpts) => {
      const ranked = estimator.rankByImpact(rlsOpts, policyOpts, indexOpts);
      
      // Verify descending order
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].impactScore).toBeGreaterThanOrEqual(ranked[i + 1].impactScore);
      }
    }
  );
});
