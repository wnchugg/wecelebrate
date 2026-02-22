/**
 * Tests for linter output parser.
 */

import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { LinterOutputParser } from '../parser';
import type { LinterWarning, ParsedOutput } from '../models';

describe('LinterOutputParser', () => {
  const parser = new LinterOutputParser();

  it('should parse empty input', () => {
    const result = parser.parse([]);
    
    expect(result).toBeDefined();
    expect(result.rlsAuthWarnings).toHaveLength(0);
    expect(result.multiplePermissivePolicies).toHaveLength(0);
    expect(result.duplicateIndexes).toHaveLength(0);
    expect(result.unindexedForeignKeys).toHaveLength(0);
    expect(result.unusedIndexes).toHaveLength(0);
  });

  describe('RLS Auth Warnings', () => {
    it('should parse RLS auth warning with exact name', () => {
      const warnings: LinterWarning[] = [{
        name: 'auth_rls_initplan',
        title: 'Auth functions in RLS policy',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: 'Policy uses auth.uid() without subquery',
        metadata: {
          table_name: 'users',
          schema_name: 'public',
          policy_name: 'user_policy',
          auth_functions: ['auth.uid()'],
        },
        cache_key: 'test-1',
      }];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0]).toEqual({
        tableName: 'users',
        schemaName: 'public',
        policyName: 'user_policy',
        authFunctions: ['auth.uid()'],
      });
    });

    it('should extract auth functions from detail text', () => {
      const warnings: LinterWarning[] = [{
        name: 'auth_rls_initplan',
        title: 'Auth functions in RLS policy',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: 'Policy uses auth.uid() and auth.role() without subquery',
        metadata: {
          table_name: 'posts',
          schema: 'public',
          policy_name: 'post_policy',
        },
        cache_key: 'test-2',
      }];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].authFunctions).toContain('auth.uid()');
      expect(result.rlsAuthWarnings[0].authFunctions).toContain('auth.role()');
    });

    it('should handle current_setting pattern', () => {
      const warnings: LinterWarning[] = [{
        name: 'auth_rls_initplan',
        title: 'Auth functions in RLS policy',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: "Policy uses current_setting('request.jwt.claims', true)::json->>'sub'",
        metadata: {
          tableName: 'orders',
          schemaName: 'public',
          policyName: 'order_policy',
        },
        cache_key: 'test-3',
      }];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].authFunctions.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Permissive Policies', () => {
    it('should parse multiple permissive policy warning', () => {
      const warnings: LinterWarning[] = [{
        name: 'multiple_permissive_policies',
        title: 'Multiple permissive policies',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: 'Table has multiple permissive policies',
        metadata: {
          table_name: 'documents',
          schema_name: 'public',
          role: 'authenticated',
          action: 'SELECT',
          policy_names: ['policy_1', 'policy_2'],
        },
        cache_key: 'test-4',
      }];

      const result = parser.parse(warnings);
      
      expect(result.multiplePermissivePolicies).toHaveLength(1);
      expect(result.multiplePermissivePolicies[0]).toEqual({
        tableName: 'documents',
        schemaName: 'public',
        role: 'authenticated',
        action: 'SELECT',
        policyNames: ['policy_1', 'policy_2'],
      });
    });

    it('should normalize action to uppercase', () => {
      const warnings: LinterWarning[] = [{
        name: 'multiple_permissive_policies',
        title: 'Multiple permissive policies',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: 'Table has multiple permissive policies',
        metadata: {
          tableName: 'items',
          schema: 'public',
          role: 'user',
          command: 'insert',
          policies: ['insert_policy_1', 'insert_policy_2'],
        },
        cache_key: 'test-5',
      }];

      const result = parser.parse(warnings);
      
      expect(result.multiplePermissivePolicies).toHaveLength(1);
      expect(result.multiplePermissivePolicies[0].action).toBe('INSERT');
    });
  });

  describe('Duplicate Indexes', () => {
    it('should parse duplicate index warning', () => {
      const warnings: LinterWarning[] = [{
        name: 'duplicate_index',
        title: 'Duplicate indexes',
        level: 'WARN',
        categories: ['STORAGE'],
        detail: 'Multiple indexes on same columns',
        metadata: {
          table_name: 'products',
          schema_name: 'public',
          index_names: ['idx_product_name', 'idx_product_name_2'],
          columns: ['name'],
        },
        cache_key: 'test-6',
      }];

      const result = parser.parse(warnings);
      
      expect(result.duplicateIndexes).toHaveLength(1);
      expect(result.duplicateIndexes[0]).toEqual({
        tableName: 'products',
        schemaName: 'public',
        indexNames: ['idx_product_name', 'idx_product_name_2'],
        columns: ['name'],
      });
    });
  });

  describe('Unindexed Foreign Keys', () => {
    it('should parse unindexed foreign key warning', () => {
      const warnings: LinterWarning[] = [{
        name: 'unindexed_foreign_key',
        title: 'Unindexed foreign key',
        level: 'WARN',
        categories: ['PERFORMANCE'],
        detail: 'Foreign key without covering index',
        metadata: {
          table_name: 'order_items',
          schema_name: 'public',
          fk_name: 'fk_order_id',
          fk_columns: [1, 2],
        },
        cache_key: 'test-7',
      }];

      const result = parser.parse(warnings);
      
      expect(result.unindexedForeignKeys).toHaveLength(1);
      expect(result.unindexedForeignKeys[0]).toEqual({
        tableName: 'order_items',
        schemaName: 'public',
        fkName: 'fk_order_id',
        fkColumns: [1, 2],
      });
    });
  });

  describe('Unused Indexes', () => {
    it('should parse unused index warning', () => {
      const warnings: LinterWarning[] = [{
        name: 'unused_index',
        title: 'Unused index',
        level: 'INFO',
        categories: ['STORAGE'],
        detail: 'Index has never been used',
        metadata: {
          table_name: 'logs',
          schema_name: 'public',
          index_name: 'idx_old_column',
        },
        cache_key: 'test-8',
      }];

      const result = parser.parse(warnings);
      
      expect(result.unusedIndexes).toHaveLength(1);
      expect(result.unusedIndexes[0]).toEqual({
        tableName: 'logs',
        schemaName: 'public',
        indexName: 'idx_old_column',
      });
    });
  });

  describe('Mixed Warnings', () => {
    it('should categorize multiple warning types', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'auth_rls_initplan',
          title: 'Auth functions in RLS',
          level: 'WARN',
          categories: ['PERFORMANCE'],
          detail: 'Uses auth.uid()',
          metadata: {
            table_name: 'users',
            schema_name: 'public',
            policy_name: 'user_policy',
            auth_functions: ['auth.uid()'],
          },
          cache_key: 'test-9',
        },
        {
          name: 'duplicate_index',
          title: 'Duplicate indexes',
          level: 'WARN',
          categories: ['STORAGE'],
          detail: 'Duplicate indexes found',
          metadata: {
            table_name: 'products',
            schema_name: 'public',
            index_names: ['idx_1', 'idx_2'],
            columns: ['id'],
          },
          cache_key: 'test-10',
        },
        {
          name: 'unused_index',
          title: 'Unused index',
          level: 'INFO',
          categories: ['STORAGE'],
          detail: 'Never used',
          metadata: {
            table_name: 'logs',
            schema_name: 'public',
            index_name: 'idx_old',
          },
          cache_key: 'test-11',
        },
      ];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.duplicateIndexes).toHaveLength(1);
      expect(result.unusedIndexes).toHaveLength(1);
      expect(result.multiplePermissivePolicies).toHaveLength(0);
      expect(result.unindexedForeignKeys).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should skip unknown warning types', () => {
      const warnings: LinterWarning[] = [{
        name: 'unknown_warning_type',
        title: 'Unknown',
        level: 'WARN',
        categories: [],
        detail: 'Unknown warning',
        metadata: {},
        cache_key: 'test-12',
      }];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(0);
      expect(result.multiplePermissivePolicies).toHaveLength(0);
      expect(result.duplicateIndexes).toHaveLength(0);
      expect(result.unindexedForeignKeys).toHaveLength(0);
      expect(result.unusedIndexes).toHaveLength(0);
    });

    it('should handle malformed warnings gracefully', () => {
      const warnings: LinterWarning[] = [{
        name: 'auth_rls_initplan',
        title: 'Auth functions',
        level: 'WARN',
        categories: [],
        detail: 'Missing metadata',
        metadata: {}, // Missing required fields
        cache_key: 'test-13',
      }];

      const result = parser.parse(warnings);
      
      // Should still create warning with empty/default values
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].tableName).toBe('');
      expect(result.rlsAuthWarnings[0].schemaName).toBe('public'); // Default
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input array', () => {
      const result = parser.parse([]);
      
      expect(result).toBeDefined();
      expect(result.rlsAuthWarnings).toEqual([]);
      expect(result.multiplePermissivePolicies).toEqual([]);
      expect(result.duplicateIndexes).toEqual([]);
      expect(result.unindexedForeignKeys).toEqual([]);
      expect(result.unusedIndexes).toEqual([]);
    });

    it('should handle warnings with missing metadata fields', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'auth_rls_initplan',
          title: 'RLS Auth',
          level: 'WARN',
          categories: [],
          detail: 'Uses auth.uid()',
          metadata: {}, // No fields
          cache_key: 'test-edge-1',
        },
        {
          name: 'multiple_permissive_policies',
          title: 'Multiple policies',
          level: 'WARN',
          categories: [],
          detail: 'Multiple policies',
          metadata: { table_name: 'test' }, // Missing other fields
          cache_key: 'test-edge-2',
        },
        {
          name: 'duplicate_index',
          title: 'Duplicate',
          level: 'WARN',
          categories: [],
          detail: 'Duplicate indexes',
          metadata: { schema_name: 'public' }, // Missing table and indexes
          cache_key: 'test-edge-3',
        },
      ];

      const result = parser.parse(warnings);
      
      // Should parse all warnings with default values
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].tableName).toBe('');
      expect(result.rlsAuthWarnings[0].schemaName).toBe('public');
      expect(result.rlsAuthWarnings[0].policyName).toBe('');
      
      expect(result.multiplePermissivePolicies).toHaveLength(1);
      expect(result.multiplePermissivePolicies[0].tableName).toBe('test');
      expect(result.multiplePermissivePolicies[0].role).toBe('');
      expect(result.multiplePermissivePolicies[0].policyNames).toEqual([]);
      
      expect(result.duplicateIndexes).toHaveLength(1);
      expect(result.duplicateIndexes[0].tableName).toBe('');
      expect(result.duplicateIndexes[0].indexNames).toEqual([]);
    });

    it('should skip multiple unknown warning types gracefully', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'completely_unknown',
          title: 'Unknown 1',
          level: 'WARN',
          categories: [],
          detail: 'Unknown',
          metadata: {},
          cache_key: 'test-edge-4',
        },
        {
          name: 'another_unknown_type',
          title: 'Unknown 2',
          level: 'INFO',
          categories: [],
          detail: 'Unknown',
          metadata: {},
          cache_key: 'test-edge-5',
        },
        {
          name: 'auth_rls_initplan',
          title: 'Known type',
          level: 'WARN',
          categories: [],
          detail: 'Uses auth.uid()',
          metadata: {
            table_name: 'users',
            schema_name: 'public',
            policy_name: 'policy',
          },
          cache_key: 'test-edge-6',
        },
      ];

      const result = parser.parse(warnings);
      
      // Should only parse the known warning type
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.multiplePermissivePolicies).toHaveLength(0);
      expect(result.duplicateIndexes).toHaveLength(0);
      expect(result.unindexedForeignKeys).toHaveLength(0);
      expect(result.unusedIndexes).toHaveLength(0);
    });

    it('should handle warnings with null metadata', () => {
      const warnings: LinterWarning[] = [{
        name: 'unused_index',
        title: 'Unused',
        level: 'INFO',
        categories: [],
        detail: 'Unused index',
        metadata: null as any, // Null metadata
        cache_key: 'test-edge-7',
      }];

      // Should not throw, should handle gracefully
      expect(() => parser.parse(warnings)).not.toThrow();
    });

    it('should handle warnings with undefined metadata fields', () => {
      const warnings: LinterWarning[] = [{
        name: 'duplicate_index',
        title: 'Duplicate',
        level: 'WARN',
        categories: [],
        detail: 'Duplicate',
        metadata: {
          table_name: undefined,
          schema_name: undefined,
          index_names: undefined,
          columns: undefined,
        },
        cache_key: 'test-edge-8',
      }];

      const result = parser.parse(warnings);
      
      expect(result.duplicateIndexes).toHaveLength(1);
      expect(result.duplicateIndexes[0].tableName).toBe('');
      expect(result.duplicateIndexes[0].schemaName).toBe('public');
      expect(result.duplicateIndexes[0].indexNames).toEqual([]);
      expect(result.duplicateIndexes[0].columns).toEqual([]);
    });

    it('should handle mixed valid and invalid warnings', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'auth_rls_initplan',
          title: 'Valid',
          level: 'WARN',
          categories: [],
          detail: 'Uses auth.uid()',
          metadata: {
            table_name: 'users',
            schema_name: 'public',
            policy_name: 'policy',
          },
          cache_key: 'test-edge-9',
        },
        {
          name: 'unknown_type',
          title: 'Invalid',
          level: 'WARN',
          categories: [],
          detail: 'Unknown',
          metadata: {},
          cache_key: 'test-edge-10',
        },
        {
          name: 'duplicate_index',
          title: 'Valid',
          level: 'WARN',
          categories: [],
          detail: 'Duplicate',
          metadata: {
            table_name: 'products',
            index_names: ['idx1', 'idx2'],
            columns: ['id'],
          },
          cache_key: 'test-edge-11',
        },
      ];

      const result = parser.parse(warnings);
      
      // Should parse only valid warnings
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.duplicateIndexes).toHaveLength(1);
      expect(result.multiplePermissivePolicies).toHaveLength(0);
    });

    it('should handle warnings with empty string values', () => {
      const warnings: LinterWarning[] = [{
        name: 'unindexed_foreign_key',
        title: '',
        level: 'WARN',
        categories: [],
        detail: '',
        metadata: {
          table_name: '',
          schema_name: '',
          fk_name: '',
          fk_columns: [],
        },
        cache_key: '',
      }];

      const result = parser.parse(warnings);
      
      expect(result.unindexedForeignKeys).toHaveLength(1);
      expect(result.unindexedForeignKeys[0].tableName).toBe('');
      expect(result.unindexedForeignKeys[0].schemaName).toBe('public'); // Default fallback
      expect(result.unindexedForeignKeys[0].fkName).toBe('');
      expect(result.unindexedForeignKeys[0].fkColumns).toEqual([]);
    });

    it('should handle warnings with wrong data types in metadata', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'multiple_permissive_policies',
          title: 'Wrong types',
          level: 'WARN',
          categories: [],
          detail: 'Test',
          metadata: {
            table_name: 123 as any, // Should be string
            policy_names: 'not_an_array' as any, // Should be array
            role: ['array'] as any, // Should be string
          },
          cache_key: 'test-edge-12',
        },
      ];

      // Should handle gracefully without throwing
      expect(() => parser.parse(warnings)).not.toThrow();
      const result = parser.parse(warnings);
      expect(result.multiplePermissivePolicies).toHaveLength(1);
    });

    it('should handle action normalization with invalid values', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'multiple_permissive_policies',
          title: 'Invalid action',
          level: 'WARN',
          categories: [],
          detail: 'Test',
          metadata: {
            table_name: 'test',
            role: 'user',
            action: 'INVALID_ACTION',
            policy_names: ['p1'],
          },
          cache_key: 'test-edge-13',
        },
      ];

      const result = parser.parse(warnings);
      
      expect(result.multiplePermissivePolicies).toHaveLength(1);
      // Should default to SELECT for unknown actions
      expect(result.multiplePermissivePolicies[0].action).toBe('SELECT');
    });

    it('should extract auth functions from detail when metadata is missing', () => {
      const warnings: LinterWarning[] = [{
        name: 'auth_rls_initplan',
        title: 'Auth',
        level: 'WARN',
        categories: [],
        detail: 'Policy uses auth.uid() and auth.jwt() without optimization',
        metadata: {
          table_name: 'users',
          policy_name: 'policy',
          // No auth_functions in metadata
        },
        cache_key: 'test-edge-14',
      }];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].authFunctions).toContain('auth.uid()');
      expect(result.rlsAuthWarnings[0].authFunctions).toContain('auth.jwt()');
    });

    it('should handle warnings with alternative metadata field names', () => {
      const warnings: LinterWarning[] = [
        {
          name: 'auth_rls_initplan',
          title: 'Alt names',
          level: 'WARN',
          categories: [],
          detail: 'Test',
          metadata: {
            tableName: 'users', // camelCase instead of snake_case
            schema: 'custom', // short form
            policyName: 'policy',
          },
          cache_key: 'test-edge-15',
        },
      ];

      const result = parser.parse(warnings);
      
      expect(result.rlsAuthWarnings).toHaveLength(1);
      expect(result.rlsAuthWarnings[0].tableName).toBe('users');
      expect(result.rlsAuthWarnings[0].schemaName).toBe('custom');
      expect(result.rlsAuthWarnings[0].policyName).toBe('policy');
    });
  });
});

// Property-based tests
describe('Property 1: Parser categorization', () => {
  test.prop([
    fc.array(
      fc.oneof(
        // RLS auth warnings
        fc.record({
          name: fc.constantFrom('auth_rls_initplan', 'auth_rls_performance'),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({
            table_name: fc.string(),
            schema_name: fc.option(fc.string(), { nil: undefined }),
            policy_name: fc.string(),
            auth_functions: fc.option(fc.array(fc.constantFrom('auth.uid()', 'auth.jwt()', 'auth.role()')), { nil: undefined }),
          }),
          cache_key: fc.string(),
        }),
        // Multiple permissive policy warnings
        fc.record({
          name: fc.constantFrom('multiple_permissive_policies', 'multiple_permissive'),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({
            table_name: fc.string(),
            schema_name: fc.option(fc.string(), { nil: undefined }),
            role: fc.string(),
            action: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'select', 'insert'),
            policy_names: fc.array(fc.string()),
          }),
          cache_key: fc.string(),
        }),
        // Duplicate index warnings
        fc.record({
          name: fc.constantFrom('duplicate_index', 'duplicate_indexes'),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({
            table_name: fc.string(),
            schema_name: fc.option(fc.string(), { nil: undefined }),
            index_names: fc.array(fc.string(), { minLength: 2 }),
            columns: fc.array(fc.string(), { minLength: 1 }),
          }),
          cache_key: fc.string(),
        }),
        // Unindexed foreign key warnings
        fc.record({
          name: fc.constantFrom('unindexed_foreign_key', 'unindexed_fk'),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({
            table_name: fc.string(),
            schema_name: fc.option(fc.string(), { nil: undefined }),
            fk_name: fc.string(),
            fk_columns: fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1 }),
          }),
          cache_key: fc.string(),
        }),
        // Unused index warnings
        fc.record({
          name: fc.constantFrom('unused_index', 'unused_indexes'),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({
            table_name: fc.string(),
            schema_name: fc.option(fc.string(), { nil: undefined }),
            index_name: fc.string(),
          }),
          cache_key: fc.string(),
        }),
        // Unknown warning types (should be skipped)
        fc.record({
          name: fc.string().filter(s => 
            !s.includes('auth') && 
            !s.includes('rls') && 
            !s.includes('permissive') && 
            !s.includes('duplicate') && 
            !s.includes('index') && 
            !s.includes('foreign') && 
            !s.includes('unused')
          ),
          title: fc.string(),
          level: fc.constantFrom('WARN', 'INFO'),
          categories: fc.array(fc.string()),
          detail: fc.string(),
          metadata: fc.record({}),
          cache_key: fc.string(),
        })
      ),
      { minLength: 0, maxLength: 20 }
    )
  ])('should correctly categorize all warning types', (warnings) => {
    const parser = new LinterOutputParser();
    const result = parser.parse(warnings as LinterWarning[]);

    // Count expected warnings by type
    let expectedRLS = 0;
    let expectedPermissive = 0;
    let expectedDuplicate = 0;
    let expectedUnindexedFK = 0;
    let expectedUnused = 0;

    for (const warning of warnings) {
      if (warning.name === 'auth_rls_initplan' || warning.name === 'auth_rls_performance') {
        expectedRLS++;
      } else if (warning.name === 'multiple_permissive_policies' || warning.name === 'multiple_permissive') {
        expectedPermissive++;
      } else if (warning.name === 'duplicate_index' || warning.name === 'duplicate_indexes') {
        expectedDuplicate++;
      } else if (warning.name === 'unindexed_foreign_key' || warning.name === 'unindexed_fk') {
        expectedUnindexedFK++;
      } else if (warning.name === 'unused_index' || warning.name === 'unused_indexes') {
        expectedUnused++;
      }
      // Unknown types are not counted
    }

    // Verify all warnings are correctly categorized
    expect(result.rlsAuthWarnings).toHaveLength(expectedRLS);
    expect(result.multiplePermissivePolicies).toHaveLength(expectedPermissive);
    expect(result.duplicateIndexes).toHaveLength(expectedDuplicate);
    expect(result.unindexedForeignKeys).toHaveLength(expectedUnindexedFK);
    expect(result.unusedIndexes).toHaveLength(expectedUnused);

    // Verify total categorized warnings equals expected (unknown types excluded)
    const totalCategorized = 
      result.rlsAuthWarnings.length +
      result.multiplePermissivePolicies.length +
      result.duplicateIndexes.length +
      result.unindexedForeignKeys.length +
      result.unusedIndexes.length;

    const totalExpected = expectedRLS + expectedPermissive + expectedDuplicate + expectedUnindexedFK + expectedUnused;
    expect(totalCategorized).toBe(totalExpected);

    // Verify each categorized warning has required fields
    for (const warning of result.rlsAuthWarnings) {
      expect(warning).toHaveProperty('tableName');
      expect(warning).toHaveProperty('schemaName');
      expect(warning).toHaveProperty('policyName');
      expect(warning).toHaveProperty('authFunctions');
      expect(Array.isArray(warning.authFunctions)).toBe(true);
    }

    for (const warning of result.multiplePermissivePolicies) {
      expect(warning).toHaveProperty('tableName');
      expect(warning).toHaveProperty('schemaName');
      expect(warning).toHaveProperty('role');
      expect(warning).toHaveProperty('action');
      expect(['SELECT', 'INSERT', 'UPDATE', 'DELETE']).toContain(warning.action);
      expect(warning).toHaveProperty('policyNames');
      expect(Array.isArray(warning.policyNames)).toBe(true);
    }

    for (const warning of result.duplicateIndexes) {
      expect(warning).toHaveProperty('tableName');
      expect(warning).toHaveProperty('schemaName');
      expect(warning).toHaveProperty('indexNames');
      expect(Array.isArray(warning.indexNames)).toBe(true);
      expect(warning).toHaveProperty('columns');
      expect(Array.isArray(warning.columns)).toBe(true);
    }

    for (const warning of result.unindexedForeignKeys) {
      expect(warning).toHaveProperty('tableName');
      expect(warning).toHaveProperty('schemaName');
      expect(warning).toHaveProperty('fkName');
      expect(warning).toHaveProperty('fkColumns');
      expect(Array.isArray(warning.fkColumns)).toBe(true);
    }

    for (const warning of result.unusedIndexes) {
      expect(warning).toHaveProperty('tableName');
      expect(warning).toHaveProperty('schemaName');
      expect(warning).toHaveProperty('indexName');
    }
  }, { numRuns: 100 });
});

