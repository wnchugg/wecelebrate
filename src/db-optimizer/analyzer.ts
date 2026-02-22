/**
 * Analyzers for RLS policies and indexes.
 */

import type {
  RLSAuthWarning,
  RLSOptimization,
  MultiplePermissiveWarning,
  PolicyConsolidation,
  DuplicateIndexWarning,
  UnindexedFKWarning,
  UnusedIndexWarning,
  IndexOptimization,
} from './models';

export class RLSAnalyzer {
  private dbConnection: any;

  constructor(dbConnection?: any) {
    this.dbConnection = dbConnection;
  }

  /**
   * Analyze RLS policies for auth function optimization.
   */
  async analyze(warnings: RLSAuthWarning[]): Promise<RLSOptimization[]> {
    const optimizations: RLSOptimization[] = [];

    for (const warning of warnings) {
      try {
        const optimization = await this.analyzePolicy(warning);
        if (optimization) {
          optimizations.push(optimization);
        }
      } catch (error) {
        console.warn(`Failed to analyze policy ${warning.policyName}:`, error);
        continue;
      }
    }

    return optimizations;
  }

  /**
   * Analyze a single RLS policy for optimization opportunities.
   */
  private async analyzePolicy(warning: RLSAuthWarning): Promise<RLSOptimization | null> {
    // Get policy definition from database
    const policyDef = await this.getPolicyDefinition(
      warning.schemaName,
      warning.tableName,
      warning.policyName
    );

    if (!policyDef) {
      return null;
    }

    // Extract the policy SQL (USING clause)
    const originalSQL = policyDef.qual || policyDef.using || '';
    
    if (!originalSQL) {
      return null;
    }

    // Check if optimization is needed
    const needsOptimization = this.needsOptimization(originalSQL);
    
    if (!needsOptimization) {
      return null;
    }

    // For now, return the warning with original SQL
    // Actual optimization will be done by PolicyOptimizer in task 3.2
    return {
      warning,
      originalSQL,
      optimizedSQL: originalSQL, // Will be optimized in task 3.2
      estimatedImpact: 'Reduces auth function evaluations from per-row to per-query',
    };
  }

  /**
   * Query database for policy definition using pg_policies.
   */
  private async getPolicyDefinition(
    schema: string,
    table: string,
    policyName: string
  ): Promise<any | null> {
    if (!this.dbConnection) {
      // If no database connection, return mock data for testing
      return {
        schemaname: schema,
        tablename: table,
        policyname: policyName,
        qual: null,
        using: null,
      };
    }

    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = $1 
          AND tablename = $2 
          AND policyname = $3
      `;

      const result = await this.dbConnection.executeQuery(query, [schema, table, policyName]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to query pg_policies:', error);
      return null;
    }
  }

  /**
   * Check if a policy SQL needs optimization.
   * Identifies unwrapped auth function calls.
   */
  private needsOptimization(sql: string): boolean {
    // Check for unwrapped auth functions
    const unwrappedAuthPatterns = [
      // auth.uid() not wrapped in SELECT
      /(?<!\(SELECT\s+)auth\.uid\(\)/i,
      // auth.jwt() not wrapped in SELECT
      /(?<!\(SELECT\s+)auth\.jwt\(\)/i,
      // auth.role() not wrapped in SELECT
      /(?<!\(SELECT\s+)auth\.role\(\)/i,
      // current_setting pattern
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/i,
    ];

    return unwrappedAuthPatterns.some(pattern => pattern.test(sql));
  }

  /**
   * Parse policy SQL to identify auth function calls.
   * Handles complex expressions (AND, OR, nested conditions).
   */
  identifyAuthFunctions(sql: string): string[] {
    const authFunctions: string[] = [];
    
    // Patterns to match auth functions
    const patterns = [
      /auth\.uid\(\)/gi,
      /auth\.jwt\(\)/gi,
      /auth\.role\(\)/gi,
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/gi,
    ];

    for (const pattern of patterns) {
      const matches = sql.match(pattern);
      if (matches) {
        authFunctions.push(...matches);
      }
    }

    // Remove duplicates and return
    return [...new Set(authFunctions)];
  }
}

export class PolicyConsolidator {
  /**
   * Consolidate multiple permissive policies.
   */
  consolidate(warnings: MultiplePermissiveWarning[]): PolicyConsolidation[] {
    // Implementation will be added in task 5.1
    return [];
  }
}

export class IndexAnalyzer {
  private dbConnection: any;

  constructor(dbConnection?: any) {
    this.dbConnection = dbConnection;
  }

  /**
   * Analyze indexes for duplicates, unused, and missing FK indexes.
   */
  async analyze(
    duplicates: DuplicateIndexWarning[],
    unused: UnusedIndexWarning[],
    unindexedFKs: UnindexedFKWarning[]
  ): Promise<IndexOptimization[]> {
    const optimizations: IndexOptimization[] = [];

    // Process duplicate indexes
    for (const duplicate of duplicates) {
      const duplicateOpts = await this.handleDuplicateIndexes(duplicate);
      optimizations.push(...duplicateOpts);
    }

    // Process unused indexes
    for (const unusedIndex of unused) {
      const unusedOpt = await this.handleUnusedIndex(unusedIndex);
      if (unusedOpt) {
        optimizations.push(unusedOpt);
      }
    }

    // Process unindexed foreign keys
    for (const unindexedFK of unindexedFKs) {
      const fkOpt = await this.handleUnindexedForeignKey(unindexedFK);
      if (fkOpt) {
        optimizations.push(fkOpt);
      }
    }

    return optimizations;
  }

  /**
   * Handle duplicate indexes - select which to preserve and mark others for removal.
   * Requirements: 3.2, 3.3, 3.5, 7.4
   */
  private async handleDuplicateIndexes(
    warning: DuplicateIndexWarning
  ): Promise<IndexOptimization[]> {
    const optimizations: IndexOptimization[] = [];
    const { schemaName, tableName, indexNames } = warning;

    if (indexNames.length <= 1) {
      return optimizations;
    }

    // Get detailed information about each index
    const indexInfos = await Promise.all(
      indexNames.map(async (indexName) => {
        const definition = await this.getIndexDefinition(schemaName, tableName, indexName);
        const isConstraintBacked = await this.isConstraintBackedIndex(schemaName, tableName, indexName);
        const usageStats = await this.getIndexUsageStats(schemaName, tableName, indexName);
        
        return {
          name: indexName,
          definition,
          isConstraintBacked,
          usageStats,
          isExplicitName: this.isExplicitName(indexName),
        };
      })
    );

    // Select which index to preserve
    const indexToPreserve = this.selectIndexToPreserve(indexInfos);

    // Mark others for removal
    for (const info of indexInfos) {
      if (info.name !== indexToPreserve && !info.isConstraintBacked) {
        optimizations.push({
          type: 'remove_duplicate',
          tableName,
          schemaName,
          indexToRemove: info.name,
          estimatedImpact: `Removes duplicate index, saves storage and improves write performance`,
        });
      }
    }

    return optimizations;
  }

  /**
   * Handle unused indexes - check if safe to remove.
   * Requirements: 9.1, 9.2, 9.3, 9.5
   */
  private async handleUnusedIndex(
    warning: UnusedIndexWarning
  ): Promise<IndexOptimization | null> {
    const { schemaName, tableName, indexName } = warning;

    // Check if index is required by constraints
    const isConstraintBacked = await this.isConstraintBackedIndex(schemaName, tableName, indexName);
    if (isConstraintBacked) {
      // Never remove constraint-backed indexes
      return null;
    }

    // Get usage statistics
    const usageStats = await this.getIndexUsageStats(schemaName, tableName, indexName);
    
    // Verify it's actually unused
    if (usageStats && usageStats.idx_scan > 0) {
      return null;
    }

    // Check creation time to protect recent indexes
    const creationTime = await this.getIndexCreationTime(schemaName, tableName, indexName);
    if (creationTime && this.isRecentIndex(creationTime)) {
      // Flag for review rather than automatic removal
      return {
        type: 'remove_unused',
        tableName,
        schemaName,
        indexToRemove: indexName,
        estimatedImpact: `Index is unused but recently created - flagged for manual review`,
      };
    }

    return {
      type: 'remove_unused',
      tableName,
      schemaName,
      indexToRemove: indexName,
      estimatedImpact: `Removes unused index, saves storage and improves write performance`,
    };
  }

  /**
   * Handle unindexed foreign keys - create covering indexes.
   * Requirements: 8.1, 8.2, 8.5
   */
  private async handleUnindexedForeignKey(
    warning: UnindexedFKWarning
  ): Promise<IndexOptimization | null> {
    const { schemaName, tableName, fkName, fkColumns } = warning;

    // Map FK column positions to column names
    const columnNames = await this.mapFKColumnsToNames(fkName, fkColumns);
    
    if (columnNames.length === 0) {
      return null;
    }

    // Generate index name
    const indexName = this.generateFKIndexName(tableName, columnNames);

    return {
      type: 'create_fk_index',
      tableName,
      schemaName,
      indexToCreate: {
        name: indexName,
        columns: columnNames,
      },
      estimatedImpact: `Creates index for foreign key, improves join performance and referential integrity checks`,
    };
  }

  /**
   * Select which duplicate index to preserve.
   * Prefer: 1) Constraint-backed, 2) Explicit names, 3) Most used
   */
  private selectIndexToPreserve(indexInfos: Array<{
    name: string;
    isConstraintBacked: boolean;
    isExplicitName: boolean;
    usageStats: { idx_scan: number } | null;
  }>): string {
    // First, prefer constraint-backed indexes
    const constraintBacked = indexInfos.filter(info => info.isConstraintBacked);
    if (constraintBacked.length > 0) {
      return constraintBacked[0].name;
    }

    // Second, prefer explicit names
    const explicitNames = indexInfos.filter(info => info.isExplicitName);
    if (explicitNames.length > 0) {
      // Among explicit names, prefer most used
      explicitNames.sort((a, b) => {
        const aScans = a.usageStats?.idx_scan || 0;
        const bScans = b.usageStats?.idx_scan || 0;
        return bScans - aScans;
      });
      return explicitNames[0].name;
    }

    // Finally, prefer most used
    indexInfos.sort((a, b) => {
      const aScans = a.usageStats?.idx_scan || 0;
      const bScans = b.usageStats?.idx_scan || 0;
      return bScans - aScans;
    });

    return indexInfos[0].name;
  }

  /**
   * Check if an index name is explicit (not auto-generated).
   */
  private isExplicitName(indexName: string): boolean {
    // Auto-generated patterns: *_pkey, *_key, *_idx, idx_*_*
    const autoGeneratedPatterns = [
      /_pkey$/,
      /_key$/,
      /_idx$/,
      /^idx_\d+_/,
    ];

    return !autoGeneratedPatterns.some(pattern => pattern.test(indexName));
  }

  /**
   * Check if an index is recently created (within 7 days).
   */
  private isRecentIndex(creationTime: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return creationTime >= sevenDaysAgo;
  }

  /**
   * Generate index name for foreign key.
   */
  private generateFKIndexName(tableName: string, columns: string[]): string {
    const columnsPart = columns.join('_');
    return `idx_${tableName}_fk_${columnsPart}`;
  }

  /**
   * Map FK column positions to column names.
   */
  private async mapFKColumnsToNames(fkName: string, fkColumns: number[]): Promise<string[]> {
    if (!this.dbConnection) {
      // Mock data for testing
      return fkColumns.map((pos) => `column_${pos}`);
    }

    try {
      const columns = await this.dbConnection.getForeignKeyColumns(fkName);
      // Sort by position to maintain FK column order
      columns.sort((a: any, b: any) => {
        const aPos = fkColumns.indexOf(a.columnPosition);
        const bPos = fkColumns.indexOf(b.columnPosition);
        return aPos - bPos;
      });
      return columns.map((col: any) => col.columnName);
    } catch (error) {
      console.error(`Failed to map FK columns for ${fkName}:`, error);
      return [];
    }
  }

  /**
   * Get index definition from database.
   */
  private async getIndexDefinition(
    schema: string,
    table: string,
    indexName: string
  ): Promise<string | null> {
    if (!this.dbConnection) {
      return null;
    }

    try {
      const result = await this.dbConnection.getIndexDefinition(schema, table, indexName);
      return result?.indexdef || null;
    } catch (error) {
      console.error(`Failed to get index definition for ${indexName}:`, error);
      return null;
    }
  }

  /**
   * Get index usage statistics from database.
   */
  private async getIndexUsageStats(
    schema: string,
    table: string,
    indexName: string
  ): Promise<{ idx_scan: number } | null> {
    if (!this.dbConnection) {
      return null;
    }

    try {
      const result = await this.dbConnection.getIndexUsageStats(schema, table, indexName);
      return result ? { idx_scan: result.idx_scan } : null;
    } catch (error) {
      console.error(`Failed to get index usage stats for ${indexName}:`, error);
      return null;
    }
  }

  /**
   * Check if an index is backed by a constraint (FK, unique, PK).
   */
  private async isConstraintBackedIndex(
    schema: string,
    table: string,
    indexName: string
  ): Promise<boolean> {
    if (!this.dbConnection) {
      return false;
    }

    try {
      const query = `
        SELECT COUNT(*) as count
        FROM pg_constraint c
        JOIN pg_class i ON i.oid = c.conindid
        JOIN pg_namespace n ON n.oid = i.relnamespace
        WHERE n.nspname = $1
          AND c.conrelid = (
            SELECT oid FROM pg_class 
            WHERE relname = $2 
            AND relnamespace = n.oid
          )
          AND i.relname = $3
          AND c.contype IN ('f', 'u', 'p')
      `;

      const result = await this.dbConnection.executeQuery(query, [schema, table, indexName]);
      return result.length > 0 && result[0].count > 0;
    } catch (error) {
      console.error(`Failed to check constraint backing for ${indexName}:`, error);
      return false;
    }
  }

  /**
   * Get index creation time from database.
   */
  private async getIndexCreationTime(
    schema: string,
    table: string,
    indexName: string
  ): Promise<Date | null> {
    if (!this.dbConnection) {
      return null;
    }

    try {
      const query = `
        SELECT pg_stat_file('base/' || db.oid || '/' || c.relfilenode)::json->>'creation' as creation_time
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        CROSS JOIN (SELECT oid FROM pg_database WHERE datname = current_database()) db
        WHERE n.nspname = $1
          AND c.relname = $2
      `;

      const result = await this.dbConnection.executeQuery(query, [schema, indexName]);
      if (result.length > 0 && result[0].creation_time) {
        return new Date(result[0].creation_time);
      }
      return null;
    } catch (error) {
      // pg_stat_file may not be available or may fail, return null
      return null;
    }
  }
}
