/**
 * Type definitions for linter warnings, optimizations, and migrations.
 */

// Linter Warning Types
export interface LinterWarning {
  name: string;
  title: string;
  level: 'WARN' | 'INFO';
  categories: string[];
  detail: string;
  metadata: Record<string, any>;
  cache_key: string;
}

export interface RLSAuthWarning {
  tableName: string;
  schemaName: string;
  policyName: string;
  authFunctions: string[]; // e.g., ['auth.uid()', 'auth.role()']
}

export interface MultiplePermissiveWarning {
  tableName: string;
  schemaName: string;
  role: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  policyNames: string[];
}

export interface DuplicateIndexWarning {
  tableName: string;
  schemaName: string;
  indexNames: string[];
  columns: string[];
}

export interface UnindexedFKWarning {
  tableName: string;
  schemaName: string;
  fkName: string;
  fkColumns: number[]; // Column positions
}

export interface UnusedIndexWarning {
  tableName: string;
  schemaName: string;
  indexName: string;
}

export interface ParsedOutput {
  rlsAuthWarnings: RLSAuthWarning[];
  multiplePermissivePolicies: MultiplePermissiveWarning[];
  duplicateIndexes: DuplicateIndexWarning[];
  unindexedForeignKeys: UnindexedFKWarning[];
  unusedIndexes: UnusedIndexWarning[];
}

// Optimization Types
export interface PolicyDefinition {
  name: string;
  using: string; // SQL expression for USING clause
  withCheck?: string; // SQL expression for WITH CHECK clause
}

export interface RLSOptimization {
  warning: RLSAuthWarning;
  originalSQL: string;
  optimizedSQL: string;
  estimatedImpact: string;
}

export interface PolicyConsolidation {
  warning: MultiplePermissiveWarning;
  originalPolicies: PolicyDefinition[];
  consolidatedPolicy: PolicyDefinition;
  estimatedImpact: string;
}

export type IndexOptimizationType = 'remove_duplicate' | 'remove_unused' | 'create_fk_index';

export interface IndexOptimization {
  type: IndexOptimizationType;
  tableName: string;
  schemaName: string;
  indexToRemove?: string;
  indexToCreate?: {
    name: string;
    columns: string[];
  };
  estimatedImpact: string;
}

// Migration Types
export interface MigrationScript {
  id: string;
  description: string;
  upSQL: string; // SQL to apply the optimization
  downSQL: string; // SQL to rollback the optimization
  validationSQL: string; // SQL to validate the optimization
  estimatedImpact: string;
}
