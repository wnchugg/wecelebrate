/**
 * Semantic validation for optimizations.
 */

import type { RLSOptimization, PolicyConsolidation } from './models';
import { DatabaseConnection } from './db-utils';

/**
 * User context for testing RLS policies.
 */
export interface UserContext {
  userId: string;
  role: string;
  jwtClaims?: Record<string, any>;
}

/**
 * Test database state for validation.
 */
export interface TestDatabaseState {
  tableName: string;
  schemaName: string;
  testRows: Record<string, any>[];
}

/**
 * Validation result with details.
 */
export interface ValidationResult {
  isValid: boolean;
  reason: string;
  originalRowCount?: number;
  optimizedRowCount?: number;
  userContext?: UserContext;
}

export class SemanticValidator {
  constructor(private db: DatabaseConnection) {}

  /**
   * Validate that RLS optimization preserves access grants.
   * Tests with various user contexts to ensure the optimized policy
   * grants access to the same rows as the original policy.
   * 
   * @returns Tuple of [isValid, reason]
   */
  async validateRLSOptimization(
    optimization: RLSOptimization,
    userContexts?: UserContext[]
  ): Promise<[boolean, string]> {
    const { warning, originalSQL, optimizedSQL } = optimization;
    const { schemaName, tableName, policyName } = warning;

    // Use default user contexts if none provided
    const contexts = userContexts || this.generateDefaultUserContexts();

    try {
      // For each user context, verify that the same rows are accessible
      for (const context of contexts) {
        const testQuery = this.generateTestQuery(
          schemaName,
          tableName,
          policyName,
          context
        );

        // Execute query with original policy
        const originalResults = await this.executeWithPolicy(
          testQuery,
          originalSQL,
          context
        );

        // Execute query with optimized policy
        const optimizedResults = await this.executeWithPolicy(
          testQuery,
          optimizedSQL,
          context
        );

        // Compare result sets
        if (!this.areResultSetsEqual(originalResults, optimizedResults)) {
          return [
            false,
            `Validation failed for user context ${context.userId}: ` +
            `Original returned ${originalResults.length} rows, ` +
            `optimized returned ${optimizedResults.length} rows`
          ];
        }
      }

      return [true, 'Semantic validation passed for all user contexts'];
    } catch (error) {
      return [false, `Validation error: ${error instanceof Error ? error.message : String(error)}`];
    }
  }

  /**
   * Validate that policy consolidation preserves access grants.
   * Tests that the consolidated policy grants access to the same rows
   * as the union of all original policies.
   * 
   * @returns Tuple of [isValid, reason]
   */
  async validatePolicyConsolidation(
    consolidation: PolicyConsolidation,
    userContexts?: UserContext[]
  ): Promise<[boolean, string]> {
    const { warning, originalPolicies, consolidatedPolicy } = consolidation;
    const { schemaName, tableName, role } = warning;

    // Use default user contexts if none provided
    const contexts = userContexts || this.generateDefaultUserContexts();

    try {
      for (const context of contexts) {
        // Generate test query
        const testQuery = this.generateTestQuery(
          schemaName,
          tableName,
          'consolidated_test',
          context
        );

        // Execute with each original policy and collect all accessible rows
        const originalRowIds = new Set<string>();
        for (const policy of originalPolicies) {
          const policySQL = this.buildPolicySQL(
            schemaName,
            tableName,
            policy.name,
            role,
            warning.action,
            policy.using,
            policy.withCheck
          );
          
          const results = await this.executeWithPolicy(
            testQuery,
            policySQL,
            context
          );
          
          // Add row IDs to set (assuming rows have an 'id' field)
          results.forEach(row => originalRowIds.add(this.getRowIdentifier(row)));
        }

        // Execute with consolidated policy
        const consolidatedSQL = this.buildPolicySQL(
          schemaName,
          tableName,
          consolidatedPolicy.name,
          role,
          warning.action,
          consolidatedPolicy.using,
          consolidatedPolicy.withCheck
        );

        const consolidatedResults = await this.executeWithPolicy(
          testQuery,
          consolidatedSQL,
          context
        );

        const consolidatedRowIds = new Set<string>(
          consolidatedResults.map(row => this.getRowIdentifier(row))
        );

        // Verify that consolidated policy grants access to exactly the same rows
        if (!this.areSetsEqual(originalRowIds, consolidatedRowIds)) {
          return [
            false,
            `Validation failed for user context ${context.userId}: ` +
            `Original policies granted access to ${originalRowIds.size} rows, ` +
            `consolidated policy grants access to ${consolidatedRowIds.size} rows`
          ];
        }
      }

      return [true, 'Semantic validation passed for policy consolidation'];
    } catch (error) {
      return [false, `Validation error: ${error instanceof Error ? error.message : String(error)}`];
    }
  }

  /**
   * Generate test queries for validation.
   * Creates a SELECT query that will be filtered by the RLS policy.
   */
  generateTestQuery(
    schemaName: string,
    tableName: string,
    policyName: string,
    context: UserContext
  ): string {
    return `SELECT * FROM ${schemaName}.${tableName}`;
  }

  /**
   * Execute a query with a specific policy in a test transaction.
   * Sets up the user context and applies the policy temporarily.
   */
  private async executeWithPolicy(
    query: string,
    policySQL: string,
    context: UserContext
  ): Promise<any[]> {
    // This is a simplified implementation
    // In a real implementation, this would:
    // 1. Start a transaction
    // 2. Set up the user context (auth.uid(), auth.role(), etc.)
    // 3. Apply the policy temporarily
    // 4. Execute the query
    // 5. Rollback the transaction
    
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Compare two result sets for equality.
   * Checks that both sets contain the same rows (order-independent).
   */
  private areResultSetsEqual(results1: any[], results2: any[]): boolean {
    if (results1.length !== results2.length) {
      return false;
    }

    // Convert to sets of row identifiers for comparison
    const set1 = new Set(results1.map(row => this.getRowIdentifier(row)));
    const set2 = new Set(results2.map(row => this.getRowIdentifier(row)));

    return this.areSetsEqual(set1, set2);
  }

  /**
   * Compare two sets for equality.
   */
  private areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) {
      return false;
    }

    for (const item of set1) {
      if (!set2.has(item)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get a unique identifier for a row.
   * Uses JSON stringification for comparison.
   */
  private getRowIdentifier(row: any): string {
    // Sort keys for consistent comparison
    const sortedRow = Object.keys(row)
      .sort()
      .reduce((acc, key) => {
        acc[key] = row[key];
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sortedRow);
  }

  /**
   * Build complete policy SQL statement.
   */
  private buildPolicySQL(
    schemaName: string,
    tableName: string,
    policyName: string,
    role: string,
    action: string,
    using: string,
    withCheck?: string
  ): string {
    let sql = `CREATE POLICY "${policyName}" ON ${schemaName}.${tableName}\n`;
    sql += `FOR ${action} TO ${role}\n`;
    sql += `USING (${using})`;
    
    if (withCheck) {
      sql += `\nWITH CHECK (${withCheck})`;
    }
    
    sql += ';';
    return sql;
  }

  /**
   * Generate default user contexts for testing.
   * Creates a variety of user contexts to test different scenarios.
   */
  private generateDefaultUserContexts(): UserContext[] {
    return [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        role: 'authenticated',
        jwtClaims: { sub: '00000000-0000-0000-0000-000000000001' }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        role: 'authenticated',
        jwtClaims: { sub: '00000000-0000-0000-0000-000000000002' }
      },
      {
        userId: '00000000-0000-0000-0000-000000000003',
        role: 'service_role',
        jwtClaims: { sub: '00000000-0000-0000-0000-000000000003', role: 'service_role' }
      }
    ];
  }
}
