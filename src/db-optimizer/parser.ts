/**
 * Parser for Supabase linter output.
 */

import type {
  LinterWarning,
  ParsedOutput,
  RLSAuthWarning,
  MultiplePermissiveWarning,
  DuplicateIndexWarning,
  UnindexedFKWarning,
  UnusedIndexWarning,
} from './models';

export class LinterOutputParser {
  /**
   * Parse linter warnings into categorized output.
   */
  parse(warnings: LinterWarning[]): ParsedOutput {
    const parsed: ParsedOutput = {
      rlsAuthWarnings: [],
      multiplePermissivePolicies: [],
      duplicateIndexes: [],
      unindexedForeignKeys: [],
      unusedIndexes: [],
    };

    for (const warning of warnings) {
      try {
        this.categorizeWarning(warning, parsed);
      } catch (error) {
        // Skip warnings that can't be parsed, log error
        console.warn(`Failed to parse warning ${warning.name}:`, error);
        continue;
      }
    }

    return parsed;
  }

  private categorizeWarning(warning: LinterWarning, parsed: ParsedOutput): void {
      const { name, metadata } = warning;

      // Categorize based on warning name
      if (name === 'auth_rls_initplan' || name.includes('auth') && name.includes('rls')) {
        // RLS authentication function warnings
        const rlsWarning: RLSAuthWarning = {
          tableName: metadata.table_name || metadata.tableName || '',
          schemaName: metadata.schema_name || metadata.schemaName || metadata.schema || 'public',
          policyName: metadata.policy_name || metadata.policyName || '',
          authFunctions: this.extractAuthFunctions(warning),
        };
        parsed.rlsAuthWarnings.push(rlsWarning);
      } else if (name === 'multiple_permissive_policies' || name.includes('multiple') && name.includes('permissive')) {
        // Multiple permissive policies warnings
        const permissiveWarning: MultiplePermissiveWarning = {
          tableName: metadata.table_name || metadata.tableName || '',
          schemaName: metadata.schema_name || metadata.schemaName || metadata.schema || 'public',
          role: metadata.role || metadata.role_name || '',
          action: this.normalizeAction(metadata.action || metadata.command || 'SELECT'),
          policyNames: metadata.policy_names || metadata.policyNames || metadata.policies || [],
        };
        parsed.multiplePermissivePolicies.push(permissiveWarning);
      } else if (name === 'duplicate_index' || name.includes('duplicate') && name.includes('index')) {
        // Duplicate index warnings
        const duplicateWarning: DuplicateIndexWarning = {
          tableName: metadata.table_name || metadata.tableName || '',
          schemaName: metadata.schema_name || metadata.schemaName || metadata.schema || 'public',
          indexNames: metadata.index_names || metadata.indexNames || metadata.indexes || [],
          columns: metadata.columns || metadata.column_names || metadata.columnNames || [],
        };
        parsed.duplicateIndexes.push(duplicateWarning);
      } else if (name === 'unindexed_foreign_key' || name === 'unindexed_fk' || (name.includes('unindexed') && (name.includes('foreign') || name.includes('fk')))) {
        // Unindexed foreign key warnings
        const fkWarning: UnindexedFKWarning = {
          tableName: metadata.table_name || metadata.tableName || '',
          schemaName: metadata.schema_name || metadata.schemaName || metadata.schema || 'public',
          fkName: metadata.fk_name || metadata.fkName || metadata.constraint_name || '',
          fkColumns: metadata.fk_columns || metadata.fkColumns || metadata.column_positions || [],
        };
        parsed.unindexedForeignKeys.push(fkWarning);
      } else if (name === 'unused_index' || name.includes('unused') && name.includes('index')) {
        // Unused index warnings
        const unusedWarning: UnusedIndexWarning = {
          tableName: metadata.table_name || metadata.tableName || '',
          schemaName: metadata.schema_name || metadata.schemaName || metadata.schema || 'public',
          indexName: metadata.index_name || metadata.indexName || '',
        };
        parsed.unusedIndexes.push(unusedWarning);
      }
      // Unknown warning types are silently skipped (as per requirements)
    }

    private extractAuthFunctions(warning: LinterWarning): string[] {
      const authFunctions: string[] = [];
      const { detail, metadata } = warning;

      // Check metadata first
      if (metadata.auth_functions) {
        return Array.isArray(metadata.auth_functions) 
          ? metadata.auth_functions 
          : [metadata.auth_functions];
      }

      // Parse from detail text if not in metadata
      const authPatterns = [
        /auth\.uid\(\)/g,
        /auth\.jwt\(\)/g,
        /auth\.role\(\)/g,
        /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/g,
      ];

      for (const pattern of authPatterns) {
        const matches = detail.match(pattern);
        if (matches) {
          authFunctions.push(...matches);
        }
      }

      // Remove duplicates
      return [...new Set(authFunctions)];
    }

    private normalizeAction(action: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' {
      const normalized = action.toUpperCase();
      if (normalized === 'SELECT' || normalized === 'INSERT' || 
          normalized === 'UPDATE' || normalized === 'DELETE') {
        return normalized as 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
      }
      // Default to SELECT if unknown
      return 'SELECT';
    }
}
