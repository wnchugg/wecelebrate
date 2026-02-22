/**
 * Migration script generator.
 */

import type {
  MigrationScript,
  RLSOptimization,
  PolicyConsolidation,
  IndexOptimization,
} from './models';

export class MigrationGenerator {
  private migrationCounter = 0;

  /**
   * Generate migration scripts for all optimizations.
   */
  generate(
    rlsOptimizations: RLSOptimization[],
    policyConsolidations: PolicyConsolidation[],
    indexOptimizations: IndexOptimization[]
  ): MigrationScript[] {
    const migrations: MigrationScript[] = [];

    // Generate RLS optimization migrations
    for (const optimization of rlsOptimizations) {
      const migration = this.generateRLSMigration(optimization);
      if (migration) {
        migrations.push(migration);
      }
    }

    // Generate policy consolidation migrations
    for (const consolidation of policyConsolidations) {
      const migration = this.generateConsolidationMigration(consolidation);
      if (migration) {
        migrations.push(migration);
      }
    }

    // Generate index optimization migrations
    for (const optimization of indexOptimizations) {
      const migration = this.generateIndexMigration(optimization);
      if (migration) {
        migrations.push(migration);
      }
    }

    return migrations;
  }

  /**
   * Generate migration for RLS policy optimization.
   * Uses DROP POLICY followed by CREATE POLICY with same name.
   * Includes original and optimized SQL in comments.
   */
  private generateRLSMigration(optimization: RLSOptimization): MigrationScript | null {
    const { warning, originalSQL, optimizedSQL, estimatedImpact } = optimization;
    const { schemaName, tableName, policyName } = warning;

    // Validate SQL syntax
    if (!this.validateSQLSyntax(optimizedSQL)) {
      console.warn(`Invalid SQL syntax for RLS optimization: ${schemaName}.${tableName}.${policyName}`);
      return null;
    }

    // Generate migration ID
    const id = this.generateMigrationId('rls_optimize');

    // Generate up migration (apply optimization)
    const upSQL = this.wrapInTransaction(`
-- RLS Policy Optimization: ${schemaName}.${tableName}.${policyName}
-- Original SQL:
-- ${originalSQL.split('\n').join('\n-- ')}

-- Drop existing policy
DROP POLICY IF EXISTS "${policyName}" ON ${schemaName}.${tableName};

-- Create optimized policy
${optimizedSQL};
`.trim());

    // Generate down migration (rollback)
    const downSQL = this.wrapInTransaction(`
-- Rollback RLS Policy Optimization: ${schemaName}.${tableName}.${policyName}

-- Drop optimized policy
DROP POLICY IF EXISTS "${policyName}" ON ${schemaName}.${tableName};

-- Restore original policy
${originalSQL};
`.trim());

    // Generate validation query
    const validationSQL = `
-- Validation: Verify policy exists and is optimized
SELECT 
  policyname,
  qual as using_clause
FROM pg_policies
WHERE schemaname = '${schemaName}'
  AND tablename = '${tableName}'
  AND policyname = '${policyName}';
`.trim();

    return {
      id,
      description: `Optimize RLS policy ${schemaName}.${tableName}.${policyName} - ${estimatedImpact}`,
      upSQL,
      downSQL,
      validationSQL,
      estimatedImpact,
    };
  }

  /**
   * Generate migration for policy consolidation.
   * Drops individual policies and creates a single combined policy.
   */
  private generateConsolidationMigration(consolidation: PolicyConsolidation): MigrationScript | null {
    const { warning, originalPolicies, consolidatedPolicy, estimatedImpact } = consolidation;
    const { schemaName, tableName, role, action } = warning;

    // Build consolidated policy SQL
    const consolidatedSQL = this.buildPolicySQL(
      consolidatedPolicy.name,
      schemaName,
      tableName,
      action,
      role,
      consolidatedPolicy.using,
      consolidatedPolicy.withCheck
    );

    // Validate SQL syntax
    if (!this.validateSQLSyntax(consolidatedSQL)) {
      console.warn(`Invalid SQL syntax for policy consolidation: ${schemaName}.${tableName}`);
      return null;
    }

    // Generate migration ID
    const id = this.generateMigrationId('policy_consolidate');

    // Generate up migration (apply consolidation)
    const dropStatements = originalPolicies
      .map(p => `DROP POLICY IF EXISTS "${p.name}" ON ${schemaName}.${tableName};`)
      .join('\n');

    const upSQL = this.wrapInTransaction(`
-- Policy Consolidation: ${schemaName}.${tableName} (${role}, ${action})
-- Consolidating ${originalPolicies.length} policies into 1

-- Drop individual policies
${dropStatements}

-- Create consolidated policy
${consolidatedSQL};
`.trim());

    // Generate down migration (rollback)
    const restoreStatements = originalPolicies
      .map(p => {
        const policySQL = this.buildPolicySQL(
          p.name,
          schemaName,
          tableName,
          action,
          role,
          p.using,
          p.withCheck
        );
        return policySQL;
      })
      .join(';\n\n') + ';';

    const downSQL = this.wrapInTransaction(`
-- Rollback Policy Consolidation: ${schemaName}.${tableName}

-- Drop consolidated policy
DROP POLICY IF EXISTS "${consolidatedPolicy.name}" ON ${schemaName}.${tableName};

-- Restore original policies
${restoreStatements}
`.trim());

    // Generate validation query
    const validationSQL = `
-- Validation: Verify consolidated policy exists
SELECT 
  policyname,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = '${schemaName}'
  AND tablename = '${tableName}'
  AND policyname = '${consolidatedPolicy.name}';
`.trim();

    return {
      id,
      description: `Consolidate ${originalPolicies.length} policies for ${schemaName}.${tableName} - ${estimatedImpact}`,
      upSQL,
      downSQL,
      validationSQL,
      estimatedImpact,
    };
  }

  /**
   * Generate migration for index optimization.
   * Uses DROP INDEX CONCURRENTLY for removals.
   * Uses CREATE INDEX CONCURRENTLY for additions.
   */
  private generateIndexMigration(optimization: IndexOptimization): MigrationScript | null {
    const { type, schemaName, tableName, indexToRemove, indexToCreate, estimatedImpact } = optimization;

    let id: string;
    let description: string;
    let upSQL: string;
    let downSQL: string;
    let validationSQL: string;

    if (type === 'remove_duplicate' || type === 'remove_unused') {
      if (!indexToRemove) {
        console.warn(`Missing index name for removal: ${schemaName}.${tableName}`);
        return null;
      }

      id = this.generateMigrationId(`index_${type}`);
      description = `Remove ${type === 'remove_duplicate' ? 'duplicate' : 'unused'} index ${schemaName}.${indexToRemove} - ${estimatedImpact}`;

      // For index removal, we don't use transactions (CONCURRENTLY cannot run in transaction)
      upSQL = `
-- Index Removal: ${schemaName}.${indexToRemove}
-- Type: ${type}
-- ${estimatedImpact}

DROP INDEX CONCURRENTLY IF EXISTS ${schemaName}.${indexToRemove};
`.trim();

      // For rollback, we would need the original index definition
      // This is a placeholder - in practice, we should fetch the definition first
      downSQL = `
-- Rollback: Cannot automatically recreate dropped index
-- Manual intervention required to restore index ${schemaName}.${indexToRemove}
-- Please refer to the original index definition from pg_indexes
`.trim();

      validationSQL = `
-- Validation: Verify index is removed
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = '${schemaName}'
  AND indexname = '${indexToRemove}';
-- Should return 0 rows
`.trim();

    } else if (type === 'create_fk_index') {
      if (!indexToCreate) {
        console.warn(`Missing index definition for creation: ${schemaName}.${tableName}`);
        return null;
      }

      const { name, columns } = indexToCreate;
      const columnList = columns.join(', ');

      id = this.generateMigrationId('index_create_fk');
      description = `Create foreign key index ${schemaName}.${name} on ${tableName}(${columnList}) - ${estimatedImpact}`;

      // For index creation, we don't use transactions (CONCURRENTLY cannot run in transaction)
      upSQL = `
-- Foreign Key Index Creation: ${schemaName}.${name}
-- Table: ${tableName}
-- Columns: ${columnList}
-- ${estimatedImpact}

CREATE INDEX CONCURRENTLY IF NOT EXISTS ${name}
ON ${schemaName}.${tableName} (${columnList});
`.trim();

      downSQL = `
-- Rollback: Remove foreign key index ${schemaName}.${name}

DROP INDEX CONCURRENTLY IF EXISTS ${schemaName}.${name};
`.trim();

      validationSQL = `
-- Validation: Verify index exists and covers FK columns
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = '${schemaName}'
  AND tablename = '${tableName}'
  AND indexname = '${name}';
-- Should return 1 row
`.trim();

    } else {
      console.warn(`Unknown index optimization type: ${type}`);
      return null;
    }

    return {
      id,
      description,
      upSQL,
      downSQL,
      validationSQL,
      estimatedImpact,
    };
  }

  /**
   * Build CREATE POLICY SQL statement.
   */
  private buildPolicySQL(
    policyName: string,
    schemaName: string,
    tableName: string,
    action: string,
    role: string,
    using: string,
    withCheck?: string
  ): string {
    let sql = `CREATE POLICY "${policyName}" ON ${schemaName}.${tableName}\n`;
    sql += `FOR ${action} TO ${role}\n`;
    sql += `USING (${using})`;
    
    if (withCheck) {
      sql += `\nWITH CHECK (${withCheck})`;
    }

    return sql;
  }

  /**
   * Wrap SQL statements in a transaction.
   */
  private wrapInTransaction(sql: string): string {
    return `BEGIN;\n\n${sql}\n\nCOMMIT;`;
  }

  /**
   * Generate a unique migration ID.
   */
  private generateMigrationId(prefix: string): string {
    this.migrationCounter++;
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    return `${timestamp}_${prefix}_${this.migrationCounter}`;
  }

  /**
   * Validate SQL syntax.
   * Basic validation to check for common syntax errors.
   */
  validateSQLSyntax(sql: string): boolean {
    if (!sql || sql.trim().length === 0) {
      return false;
    }

    // Basic syntax checks
    const trimmed = sql.trim();

    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of trimmed) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) return false;
    }
    if (parenCount !== 0) return false;

    // Check for SQL keywords that should be present
    const hasValidKeywords = /\b(CREATE|DROP|ALTER|SELECT|INSERT|UPDATE|DELETE|POLICY|INDEX|TABLE)\b/i.test(trimmed);
    if (!hasValidKeywords) {
      return false;
    }

    // Check for common syntax errors
    const hasSyntaxErrors = [
      /;;/,  // Double semicolons
      /\bON\s+ON\b/i,  // Duplicate ON keyword
      /\bTO\s+TO\b/i,  // Duplicate TO keyword
    ].some(pattern => pattern.test(trimmed));

    if (hasSyntaxErrors) {
      return false;
    }

    return true;
  }
}
