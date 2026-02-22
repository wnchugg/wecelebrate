/**
 * Tests for migration generator.
 */

import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { MigrationGenerator } from '../migration';
import type {
  RLSOptimization,
  PolicyConsolidation,
  IndexOptimization,
  RLSAuthWarning,
  MultiplePermissiveWarning,
  PolicyDefinition,
} from '../models';

describe('MigrationGenerator', () => {
  it('should initialize generator', () => {
    const generator = new MigrationGenerator();
    expect(generator).toBeDefined();
  });

  describe('SQL Syntax Validation', () => {
    const generator = new MigrationGenerator();

    it('should validate correct SQL', () => {
      const validSQL = 'CREATE POLICY test ON schema.table FOR SELECT TO authenticated USING (auth.uid() = user_id)';
      expect(generator.validateSQLSyntax(validSQL)).toBe(true);
    });

    it('should reject empty SQL', () => {
      expect(generator.validateSQLSyntax('')).toBe(false);
      expect(generator.validateSQLSyntax('   ')).toBe(false);
    });

    it('should reject SQL with unbalanced parentheses', () => {
      const unbalanced1 = 'CREATE POLICY test ON schema.table USING (auth.uid() = user_id';
      const unbalanced2 = 'CREATE POLICY test ON schema.table USING auth.uid() = user_id)';
      expect(generator.validateSQLSyntax(unbalanced1)).toBe(false);
      expect(generator.validateSQLSyntax(unbalanced2)).toBe(false);
    });

    it('should reject SQL without valid keywords', () => {
      const noKeywords = 'this is not valid sql';
      expect(generator.validateSQLSyntax(noKeywords)).toBe(false);
    });

    it('should reject SQL with double semicolons', () => {
      const doubleSemicolon = 'CREATE POLICY test ON schema.table;;';
      expect(generator.validateSQLSyntax(doubleSemicolon)).toBe(false);
    });

    it('should reject SQL with duplicate keywords', () => {
      const duplicateOn = 'CREATE POLICY test ON ON schema.table';
      expect(generator.validateSQLSyntax(duplicateOn)).toBe(false);
    });
  });

  describe('RLS Migration Generation', () => {
    const generator = new MigrationGenerator();

    it('should generate RLS optimization migration', () => {
      const warning: RLSAuthWarning = {
        tableName: 'users',
        schemaName: 'public',
        policyName: 'user_select_policy',
        authFunctions: ['auth.uid()'],
      };

      const optimization: RLSOptimization = {
        warning,
        originalSQL: 'CREATE POLICY "user_select_policy" ON public.users FOR SELECT TO authenticated USING (auth.uid() = user_id)',
        optimizedSQL: 'CREATE POLICY "user_select_policy" ON public.users FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id)',
        estimatedImpact: 'Reduces row evaluation overhead by ~80%',
      };

      const migrations = generator.generate([optimization], [], []);

      expect(migrations).toHaveLength(1);
      expect(migrations[0].description).toContain('user_select_policy');
      expect(migrations[0].upSQL).toContain('DROP POLICY IF EXISTS');
      expect(migrations[0].upSQL).toContain('CREATE POLICY');
      expect(migrations[0].upSQL).toContain('BEGIN');
      expect(migrations[0].upSQL).toContain('COMMIT');
      expect(migrations[0].downSQL).toContain('DROP POLICY IF EXISTS');
      expect(migrations[0].downSQL).toContain(optimization.originalSQL);
      expect(migrations[0].validationSQL).toContain('pg_policies');
      expect(migrations[0].estimatedImpact).toBe(optimization.estimatedImpact);
    });

    it('should include original SQL in comments', () => {
      const warning: RLSAuthWarning = {
        tableName: 'posts',
        schemaName: 'public',
        policyName: 'post_policy',
        authFunctions: ['auth.uid()'],
      };

      const optimization: RLSOptimization = {
        warning,
        originalSQL: 'CREATE POLICY "post_policy" ON public.posts FOR SELECT USING (auth.uid() = author_id)',
        optimizedSQL: 'CREATE POLICY "post_policy" ON public.posts FOR SELECT USING ((SELECT auth.uid()) = author_id)',
        estimatedImpact: 'Reduces overhead',
      };

      const migrations = generator.generate([optimization], [], []);

      expect(migrations[0].upSQL).toContain('-- Original SQL:');
      expect(migrations[0].upSQL).toContain('-- CREATE POLICY');
    });

    it('should use same policy name in DROP and CREATE', () => {
      const warning: RLSAuthWarning = {
        tableName: 'comments',
        schemaName: 'public',
        policyName: 'comment_policy',
        authFunctions: ['auth.uid()'],
      };

      const optimization: RLSOptimization = {
        warning,
        originalSQL: 'CREATE POLICY "comment_policy" ON public.comments FOR SELECT USING (auth.uid() = user_id)',
        optimizedSQL: 'CREATE POLICY "comment_policy" ON public.comments FOR SELECT USING ((SELECT auth.uid()) = user_id)',
        estimatedImpact: 'Reduces overhead',
      };

      const migrations = generator.generate([optimization], [], []);

      // Check upSQL has one DROP and one CREATE (the optimized one)
      const upSQL = migrations[0].upSQL;
      const dropCountUp = (upSQL.match(/DROP POLICY IF EXISTS "comment_policy"/g) || []).length;
      
      // The upSQL should have the optimized CREATE statement
      // Note: The original SQL appears in comments, so we need to be careful with our regex
      // We're looking for actual CREATE POLICY statements, not commented ones
      const createLines = upSQL.split('\n').filter(line => 
        !line.trim().startsWith('--') && line.includes('CREATE POLICY "comment_policy"')
      );

      expect(dropCountUp).toBe(1);
      expect(createLines.length).toBe(1);
      
      // Verify the policy name is consistent
      expect(upSQL).toContain('DROP POLICY IF EXISTS "comment_policy" ON public.comments');
      expect(upSQL).toContain('CREATE POLICY "comment_policy" ON public.comments');
    });
  });

  describe('Policy Consolidation Migration Generation', () => {
    const generator = new MigrationGenerator();

    it('should generate policy consolidation migration', () => {
      const warning: MultiplePermissiveWarning = {
        tableName: 'documents',
        schemaName: 'public',
        role: 'authenticated',
        action: 'SELECT',
        policyNames: ['policy_1', 'policy_2'],
      };

      const originalPolicies: PolicyDefinition[] = [
        { name: 'policy_1', using: 'user_id = auth.uid()' },
        { name: 'policy_2', using: 'is_public = true' },
      ];

      const consolidatedPolicy: PolicyDefinition = {
        name: 'documents_authenticated_select_consolidated',
        using: '(user_id = auth.uid()) OR (is_public = true)',
      };

      const consolidation: PolicyConsolidation = {
        warning,
        originalPolicies,
        consolidatedPolicy,
        estimatedImpact: 'Reduces policy evaluation overhead by ~50%',
      };

      const migrations = generator.generate([], [consolidation], []);

      expect(migrations).toHaveLength(1);
      expect(migrations[0].description).toContain('Consolidate 2 policies');
      expect(migrations[0].upSQL).toContain('DROP POLICY IF EXISTS "policy_1"');
      expect(migrations[0].upSQL).toContain('DROP POLICY IF EXISTS "policy_2"');
      expect(migrations[0].upSQL).toContain('CREATE POLICY');
      expect(migrations[0].upSQL).toContain('BEGIN');
      expect(migrations[0].upSQL).toContain('COMMIT');
      expect(migrations[0].downSQL).toContain('DROP POLICY IF EXISTS "documents_authenticated_select_consolidated"');
      expect(migrations[0].downSQL).toContain('policy_1');
      expect(migrations[0].downSQL).toContain('policy_2');
    });

    it('should handle WITH CHECK clauses in consolidation', () => {
      const warning: MultiplePermissiveWarning = {
        tableName: 'posts',
        schemaName: 'public',
        role: 'authenticated',
        action: 'INSERT',
        policyNames: ['insert_policy_1', 'insert_policy_2'],
      };

      const originalPolicies: PolicyDefinition[] = [
        { name: 'insert_policy_1', using: 'true', withCheck: 'user_id = auth.uid()' },
        { name: 'insert_policy_2', using: 'true', withCheck: 'is_admin = true' },
      ];

      const consolidatedPolicy: PolicyDefinition = {
        name: 'posts_authenticated_insert_consolidated',
        using: '(true) OR (true)',
        withCheck: '(user_id = auth.uid()) OR (is_admin = true)',
      };

      const consolidation: PolicyConsolidation = {
        warning,
        originalPolicies,
        consolidatedPolicy,
        estimatedImpact: 'Reduces overhead',
      };

      const migrations = generator.generate([], [consolidation], []);

      expect(migrations[0].upSQL).toContain('WITH CHECK');
    });
  });

  describe('Index Migration Generation', () => {
    const generator = new MigrationGenerator();

    it('should generate duplicate index removal migration', () => {
      const optimization: IndexOptimization = {
        type: 'remove_duplicate',
        tableName: 'users',
        schemaName: 'public',
        indexToRemove: 'users_email_idx_duplicate',
        estimatedImpact: 'Saves 10MB storage',
      };

      const migrations = generator.generate([], [], [optimization]);

      expect(migrations).toHaveLength(1);
      expect(migrations[0].description).toContain('Remove duplicate index');
      expect(migrations[0].upSQL).toContain('DROP INDEX CONCURRENTLY');
      expect(migrations[0].upSQL).toContain('users_email_idx_duplicate');
      expect(migrations[0].upSQL).not.toContain('BEGIN');
      expect(migrations[0].upSQL).not.toContain('COMMIT');
      expect(migrations[0].validationSQL).toContain('pg_indexes');
    });

    it('should generate unused index removal migration', () => {
      const optimization: IndexOptimization = {
        type: 'remove_unused',
        tableName: 'logs',
        schemaName: 'public',
        indexToRemove: 'logs_old_idx',
        estimatedImpact: 'Saves 50MB storage',
      };

      const migrations = generator.generate([], [], [optimization]);

      expect(migrations).toHaveLength(1);
      expect(migrations[0].description).toContain('Remove unused index');
      expect(migrations[0].upSQL).toContain('DROP INDEX CONCURRENTLY');
    });

    it('should generate foreign key index creation migration', () => {
      const optimization: IndexOptimization = {
        type: 'create_fk_index',
        tableName: 'orders',
        schemaName: 'public',
        indexToCreate: {
          name: 'idx_orders_user_id',
          columns: ['user_id'],
        },
        estimatedImpact: 'Improves join performance by ~70%',
      };

      const migrations = generator.generate([], [], [optimization]);

      expect(migrations).toHaveLength(1);
      expect(migrations[0].description).toContain('Create foreign key index');
      expect(migrations[0].upSQL).toContain('CREATE INDEX CONCURRENTLY');
      expect(migrations[0].upSQL).toContain('idx_orders_user_id');
      expect(migrations[0].upSQL).toContain('ON public.orders (user_id)');
      expect(migrations[0].upSQL).not.toContain('BEGIN');
      expect(migrations[0].downSQL).toContain('DROP INDEX CONCURRENTLY');
    });

    it('should generate composite foreign key index', () => {
      const optimization: IndexOptimization = {
        type: 'create_fk_index',
        tableName: 'order_items',
        schemaName: 'public',
        indexToCreate: {
          name: 'idx_order_items_order_product',
          columns: ['order_id', 'product_id'],
        },
        estimatedImpact: 'Improves join performance',
      };

      const migrations = generator.generate([], [], [optimization]);

      expect(migrations[0].upSQL).toContain('(order_id, product_id)');
    });

    it('should use CONCURRENTLY for index operations', () => {
      const removeOptimization: IndexOptimization = {
        type: 'remove_duplicate',
        tableName: 'users',
        schemaName: 'public',
        indexToRemove: 'users_idx',
        estimatedImpact: 'Saves storage',
      };

      const createOptimization: IndexOptimization = {
        type: 'create_fk_index',
        tableName: 'posts',
        schemaName: 'public',
        indexToCreate: {
          name: 'idx_posts_user_id',
          columns: ['user_id'],
        },
        estimatedImpact: 'Improves performance',
      };

      const migrations = generator.generate([], [], [removeOptimization, createOptimization]);

      expect(migrations[0].upSQL).toContain('CONCURRENTLY');
      expect(migrations[1].upSQL).toContain('CONCURRENTLY');
    });
  });

  describe('Migration Generation Completeness', () => {
    const generator = new MigrationGenerator();

    it('should generate migrations for all optimization types', () => {
      const rlsWarning: RLSAuthWarning = {
        tableName: 'users',
        schemaName: 'public',
        policyName: 'user_policy',
        authFunctions: ['auth.uid()'],
      };

      const rlsOptimization: RLSOptimization = {
        warning: rlsWarning,
        originalSQL: 'CREATE POLICY "user_policy" ON public.users FOR SELECT USING (auth.uid() = user_id)',
        optimizedSQL: 'CREATE POLICY "user_policy" ON public.users FOR SELECT USING ((SELECT auth.uid()) = user_id)',
        estimatedImpact: 'Reduces overhead',
      };

      const consolidationWarning: MultiplePermissiveWarning = {
        tableName: 'posts',
        schemaName: 'public',
        role: 'authenticated',
        action: 'SELECT',
        policyNames: ['policy_1', 'policy_2'],
      };

      const consolidation: PolicyConsolidation = {
        warning: consolidationWarning,
        originalPolicies: [
          { name: 'policy_1', using: 'condition_1' },
          { name: 'policy_2', using: 'condition_2' },
        ],
        consolidatedPolicy: {
          name: 'consolidated',
          using: '(condition_1) OR (condition_2)',
        },
        estimatedImpact: 'Reduces overhead',
      };

      const indexOptimization: IndexOptimization = {
        type: 'create_fk_index',
        tableName: 'comments',
        schemaName: 'public',
        indexToCreate: {
          name: 'idx_comments_post_id',
          columns: ['post_id'],
        },
        estimatedImpact: 'Improves performance',
      };

      const migrations = generator.generate(
        [rlsOptimization],
        [consolidation],
        [indexOptimization]
      );

      expect(migrations).toHaveLength(3);
      expect(migrations[0].description).toContain('user_policy');
      expect(migrations[1].description).toContain('Consolidate');
      expect(migrations[2].description).toContain('foreign key index');
    });

    it('should include all required fields in migrations', () => {
      const optimization: RLSOptimization = {
        warning: {
          tableName: 'test',
          schemaName: 'public',
          policyName: 'test_policy',
          authFunctions: ['auth.uid()'],
        },
        originalSQL: 'CREATE POLICY "test_policy" ON public.test FOR SELECT USING (auth.uid() = id)',
        optimizedSQL: 'CREATE POLICY "test_policy" ON public.test FOR SELECT USING ((SELECT auth.uid()) = id)',
        estimatedImpact: 'Test impact',
      };

      const migrations = generator.generate([optimization], [], []);

      expect(migrations[0]).toHaveProperty('id');
      expect(migrations[0]).toHaveProperty('description');
      expect(migrations[0]).toHaveProperty('upSQL');
      expect(migrations[0]).toHaveProperty('downSQL');
      expect(migrations[0]).toHaveProperty('validationSQL');
      expect(migrations[0]).toHaveProperty('estimatedImpact');
    });
  });

  describe('Transaction Wrapping', () => {
    const generator = new MigrationGenerator();

    it('should wrap RLS migrations in transactions', () => {
      const optimization: RLSOptimization = {
        warning: {
          tableName: 'test',
          schemaName: 'public',
          policyName: 'test_policy',
          authFunctions: ['auth.uid()'],
        },
        originalSQL: 'CREATE POLICY "test_policy" ON public.test FOR SELECT USING (auth.uid() = id)',
        optimizedSQL: 'CREATE POLICY "test_policy" ON public.test FOR SELECT USING ((SELECT auth.uid()) = id)',
        estimatedImpact: 'Test',
      };

      const migrations = generator.generate([optimization], [], []);

      expect(migrations[0].upSQL).toMatch(/^BEGIN;/);
      expect(migrations[0].upSQL).toMatch(/COMMIT;$/);
      expect(migrations[0].downSQL).toMatch(/^BEGIN;/);
      expect(migrations[0].downSQL).toMatch(/COMMIT;$/);
    });

    it('should wrap policy consolidation migrations in transactions', () => {
      const consolidation: PolicyConsolidation = {
        warning: {
          tableName: 'test',
          schemaName: 'public',
          role: 'authenticated',
          action: 'SELECT',
          policyNames: ['p1', 'p2'],
        },
        originalPolicies: [
          { name: 'p1', using: 'c1' },
          { name: 'p2', using: 'c2' },
        ],
        consolidatedPolicy: {
          name: 'consolidated',
          using: '(c1) OR (c2)',
        },
        estimatedImpact: 'Test',
      };

      const migrations = generator.generate([], [consolidation], []);

      expect(migrations[0].upSQL).toMatch(/^BEGIN;/);
      expect(migrations[0].upSQL).toMatch(/COMMIT;$/);
    });

    it('should NOT wrap index operations in transactions', () => {
      const optimization: IndexOptimization = {
        type: 'create_fk_index',
        tableName: 'test',
        schemaName: 'public',
        indexToCreate: {
          name: 'idx_test',
          columns: ['col'],
        },
        estimatedImpact: 'Test',
      };

      const migrations = generator.generate([], [], [optimization]);

      expect(migrations[0].upSQL).not.toContain('BEGIN');
      expect(migrations[0].upSQL).not.toContain('COMMIT');
    });
  });
});

// Property-based tests will be added in tasks 11.5-11.9
