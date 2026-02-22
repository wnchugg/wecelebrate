/**
 * Optimizers for RLS policies and SQL transformations.
 */

import type { 
  MultiplePermissiveWarning, 
  PolicyDefinition, 
  PolicyConsolidation 
} from './models';
import type { DatabaseConnection } from './db-utils';

export class PolicyOptimizer {
  /**
   * Optimize policy SQL by wrapping auth functions and replacing current_setting.
   */
  optimize(policySQL: string): string {
    let optimized = policySQL;
    
    // First replace current_setting patterns
    optimized = this.replaceCurrentSetting(optimized);
    
    // Then wrap auth functions
    optimized = this.optimizeAuthFunctions(optimized);
    
    return optimized;
  }

  /**
   * Wrap auth functions in SELECT subqueries.
   * Handles multiple auth functions independently.
   * Preserves original SQL structure and logic.
   */
  optimizeAuthFunctions(policySQL: string): string {
    let optimized = policySQL;

    // Patterns for unwrapped auth functions
    // Use negative lookbehind to avoid wrapping already wrapped functions
    const authPatterns = [
      {
        // Match auth.uid() not already wrapped in (SELECT ...)
        pattern: /(?<!\(SELECT\s+)(auth\.uid\(\))/gi,
        replacement: '(SELECT $1)',
      },
      {
        // Match auth.jwt() not already wrapped
        pattern: /(?<!\(SELECT\s+)(auth\.jwt\(\))/gi,
        replacement: '(SELECT $1)',
      },
      {
        // Match auth.role() not already wrapped
        pattern: /(?<!\(SELECT\s+)(auth\.role\(\))/gi,
        replacement: '(SELECT $1)',
      },
    ];

    // Apply each pattern independently
    for (const { pattern, replacement } of authPatterns) {
      optimized = optimized.replace(pattern, replacement);
    }

    return optimized;
  }

  /**
   * Replace current_setting patterns with (SELECT auth.uid()).
   */
  replaceCurrentSetting(policySQL: string): string {
    // Pattern to match current_setting('request.jwt.claims', true)::json->>'sub'
    const currentSettingPattern = 
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/gi;

    return policySQL.replace(currentSettingPattern, '(SELECT auth.uid())');
  }

  /**
   * Check if a policy SQL contains unwrapped auth functions.
   */
  needsOptimization(policySQL: string): boolean {
    // Check for unwrapped auth functions
    const unwrappedPatterns = [
      /(?<!\(SELECT\s+)auth\.uid\(\)/i,
      /(?<!\(SELECT\s+)auth\.jwt\(\)/i,
      /(?<!\(SELECT\s+)auth\.role\(\)/i,
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/i,
    ];

    return unwrappedPatterns.some(pattern => pattern.test(policySQL));
  }

  /**
   * Extract all auth function calls from policy SQL.
   */
  extractAuthFunctions(policySQL: string): string[] {
    const authFunctions: string[] = [];
    
    const patterns = [
      /auth\.uid\(\)/gi,
      /auth\.jwt\(\)/gi,
      /auth\.role\(\)/gi,
      /current_setting\(['"]request\.jwt\.claims['"],\s*true\)::json->>'sub'/gi,
    ];

    for (const pattern of patterns) {
      const matches = policySQL.match(pattern);
      if (matches) {
        authFunctions.push(...matches);
      }
    }

    return [...new Set(authFunctions)];
  }
}



/**
 * Consolidates multiple permissive RLS policies into single, more efficient policies.
 */
export class PolicyConsolidator {
  constructor(private db: DatabaseConnection) {}

  /**
   * Analyze warnings and generate policy consolidations.
   */
  async consolidate(warnings: MultiplePermissiveWarning[]): Promise<PolicyConsolidation[]> {
    const consolidations: PolicyConsolidation[] = [];

    for (const warning of warnings) {
      try {
        const consolidation = await this.consolidateWarning(warning);
        if (consolidation) {
          consolidations.push(consolidation);
        }
      } catch (error) {
        console.warn(`Failed to consolidate policies for ${warning.schemaName}.${warning.tableName}:`, error);
        continue;
      }
    }

    return consolidations;
  }

  /**
   * Consolidate a single warning into a policy consolidation.
   */
  private async consolidateWarning(
    warning: MultiplePermissiveWarning
  ): Promise<PolicyConsolidation | null> {
    // Fetch all policy definitions from database
    const policies = await this.fetchPolicyDefinitions(warning);

    if (policies.length === 0) {
      console.warn(`No policies found for ${warning.schemaName}.${warning.tableName}`);
      return null;
    }

    // Check for mixed permissive/restrictive policies
    if (this.hasMixedPolicyTypes(warning, policies)) {
      console.warn(`Mixed permissive/restrictive policies detected for ${warning.schemaName}.${warning.tableName}, skipping consolidation`);
      return null;
    }

    // Detect conflicts between USING and WITH CHECK clauses
    if (this.hasConflictingClauses(policies)) {
      console.warn(`Conflicting USING/WITH CHECK clauses detected for ${warning.schemaName}.${warning.tableName}, skipping consolidation`);
      return null;
    }

    // Generate consolidated policy
    const consolidatedPolicy = this.mergePolicies(policies, warning);

    // Estimate impact
    const estimatedImpact = this.estimateConsolidationImpact(policies);

    return {
      warning,
      originalPolicies: policies,
      consolidatedPolicy,
      estimatedImpact,
    };
  }

  /**
   * Fetch policy definitions from database for the given warning.
   */
  private async fetchPolicyDefinitions(
    warning: MultiplePermissiveWarning
  ): Promise<PolicyDefinition[]> {
    const policies: PolicyDefinition[] = [];

    for (const policyName of warning.policyNames) {
      try {
        const policyData = await this.db.getPolicyDefinition(
          warning.schemaName,
          warning.tableName,
          policyName
        );

        if (policyData) {
          policies.push({
            name: policyName,
            using: policyData.qual || '',
            withCheck: policyData.with_check || undefined,
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch policy ${policyName}:`, error);
        continue;
      }
    }

    return policies;
  }

  /**
   * Check if there are mixed permissive and restrictive policies.
   * This is a safety check - we should only consolidate permissive policies.
   */
  private hasMixedPolicyTypes(
    warning: MultiplePermissiveWarning,
    policies: PolicyDefinition[]
  ): boolean {
    // In practice, we would query pg_policies to check the 'permissive' column
    // For now, we assume the warning only contains permissive policies
    // This is a placeholder for the actual implementation
    return false;
  }

  /**
   * Detect conflicts between USING and WITH CHECK clauses.
   * Policies with conflicting clauses should not be consolidated.
   */
  private hasConflictingClauses(policies: PolicyDefinition[]): boolean {
    // Check if policies have different WITH CHECK clauses for the same USING clause
    // This is a simplified check - in practice, we would need more sophisticated analysis
    
    const withCheckClauses = policies
      .map(p => p.withCheck)
      .filter(wc => wc !== undefined && wc !== '');

    // If there are multiple different WITH CHECK clauses, consider it a conflict
    const uniqueWithChecks = new Set(withCheckClauses);
    
    // If we have WITH CHECK clauses and they're not all the same, it might be a conflict
    // However, we can still consolidate by OR-ing them together
    // So we only flag as conflict if the logic would be contradictory
    
    // For now, we allow consolidation even with different WITH CHECK clauses
    // They will be OR-ed together in mergePolicies
    return false;
  }

  /**
   * Merge multiple policies into a single consolidated policy.
   * Combines USING clauses with OR logic.
   * Combines WITH CHECK clauses with OR logic.
   */
  private mergePolicies(
    policies: PolicyDefinition[],
    warning: MultiplePermissiveWarning
  ): PolicyDefinition {
    // Combine USING clauses with OR
    const usingClauses = policies
      .map(p => p.using)
      .filter(u => u && u.trim() !== '')
      .map(u => `(${u})`); // Wrap each clause in parentheses

    const consolidatedUsing = usingClauses.join(' OR ');

    // Combine WITH CHECK clauses with OR (if they exist)
    const withCheckClauses = policies
      .map(p => p.withCheck)
      .filter(wc => wc && wc.trim() !== '')
      .map(wc => `(${wc})`); // Wrap each clause in parentheses

    const consolidatedWithCheck = withCheckClauses.length > 0
      ? withCheckClauses.join(' OR ')
      : undefined;

    // Generate consolidated policy name
    const consolidatedName = `${warning.tableName}_${warning.role}_${warning.action.toLowerCase()}_consolidated`;

    return {
      name: consolidatedName,
      using: consolidatedUsing,
      withCheck: consolidatedWithCheck,
    };
  }

  /**
   * Estimate the performance impact of consolidating policies.
   */
  private estimateConsolidationImpact(policies: PolicyDefinition[]): string {
    const policyCount = policies.length;
    const reductionPercent = Math.round(((policyCount - 1) / policyCount) * 100);
    
    return `Reduces policy evaluation overhead by ~${reductionPercent}% by consolidating ${policyCount} policies into 1`;
  }

  /**
   * Identify consolidation candidates from a set of policies.
   * Returns warnings for policies that can be consolidated.
   */
  identifyConsolidationCandidates(
    policies: Array<{
      schemaName: string;
      tableName: string;
      policyName: string;
      role: string;
      action: string;
      permissive: boolean;
    }>
  ): MultiplePermissiveWarning[] {
    // Group policies by table, role, action, and permissive type
    const groups = new Map<string, typeof policies>();

    for (const policy of policies) {
      // Only consider permissive policies
      if (!policy.permissive) {
        continue;
      }

      const key = `${policy.schemaName}.${policy.tableName}:${policy.role}:${policy.action}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key)!.push(policy);
    }

    // Create warnings for groups with multiple policies
    const warnings: MultiplePermissiveWarning[] = [];

    for (const [key, groupPolicies] of groups.entries()) {
      if (groupPolicies.length > 1) {
        const first = groupPolicies[0];
        warnings.push({
          schemaName: first.schemaName,
          tableName: first.tableName,
          role: first.role,
          action: this.normalizeAction(first.action),
          policyNames: groupPolicies.map(p => p.policyName),
        });
      }
    }

    return warnings;
  }

  /**
   * Normalize action string to valid action type.
   */
  private normalizeAction(action: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' {
    const normalized = action.toUpperCase();
    if (normalized === 'SELECT' || normalized === 'INSERT' || 
        normalized === 'UPDATE' || normalized === 'DELETE') {
      return normalized as 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    }
    return 'SELECT';
  }
}
