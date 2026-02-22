/**
 * Impact estimation for optimizations.
 */

import type {
  RLSOptimization,
  PolicyConsolidation,
  IndexOptimization,
} from './models';

interface RankedOptimization {
  type: 'rls' | 'consolidation' | 'index';
  optimization: RLSOptimization | PolicyConsolidation | IndexOptimization;
  impactScore: number;
  estimatedImpact: string;
}

export class ImpactEstimator {
  /**
   * Estimate impact of RLS optimization.
   * Estimates row evaluation savings based on auth function count.
   */
  estimateRLSImpact(optimization: RLSOptimization): string {
    const authFunctionCount = optimization.warning.authFunctions.length;
    
    // Each auth function call per row is expensive
    // Estimate based on typical table sizes and query patterns
    if (authFunctionCount === 1) {
      return 'High: Eliminates per-row auth function evaluation (1 function)';
    } else if (authFunctionCount === 2) {
      return `Very High: Eliminates per-row auth function evaluation (${authFunctionCount} functions)`;
    } else {
      return `Critical: Eliminates per-row auth function evaluation (${authFunctionCount} functions)`;
    }
  }

  /**
   * Estimate impact of policy consolidation.
   * Estimates savings based on number of policies being consolidated.
   */
  estimatePolicyConsolidationImpact(consolidation: PolicyConsolidation): string {
    const policyCount = consolidation.originalPolicies.length;
    
    // Multiple permissive policies cause redundant evaluation
    if (policyCount === 2) {
      return 'Medium: Consolidates 2 permissive policies into 1';
    } else if (policyCount === 3) {
      return 'High: Consolidates 3 permissive policies into 1';
    } else {
      return `Very High: Consolidates ${policyCount} permissive policies into 1`;
    }
  }

  /**
   * Estimate impact of index optimization.
   * Calculates storage savings for removals and query performance for additions.
   */
  estimateIndexImpact(optimization: IndexOptimization): string {
    switch (optimization.type) {
      case 'remove_duplicate':
        return 'Medium: Reduces storage and write overhead by removing duplicate index';
      
      case 'remove_unused':
        return 'Low: Reduces storage and write overhead by removing unused index';
      
      case 'create_fk_index':
        const columnCount = optimization.indexToCreate?.columns.length || 1;
        if (columnCount === 1) {
          return 'High: Improves foreign key join performance and referential integrity checks';
        } else {
          return `High: Improves foreign key join performance for ${columnCount}-column composite key`;
        }
      
      default:
        return 'Unknown impact';
    }
  }

  /**
   * Rank all optimizations by estimated impact.
   * Returns optimizations sorted by impact score (highest first).
   */
  rankByImpact(
    rlsOptimizations: RLSOptimization[],
    policyConsolidations: PolicyConsolidation[],
    indexOptimizations: IndexOptimization[]
  ): RankedOptimization[] {
    const ranked: RankedOptimization[] = [];

    // Add RLS optimizations with impact scores
    for (const opt of rlsOptimizations) {
      const impact = this.estimateRLSImpact(opt);
      const score = this.calculateImpactScore('rls', opt);
      ranked.push({
        type: 'rls',
        optimization: opt,
        impactScore: score,
        estimatedImpact: impact,
      });
    }

    // Add policy consolidations with impact scores
    for (const opt of policyConsolidations) {
      const impact = this.estimatePolicyConsolidationImpact(opt);
      const score = this.calculateImpactScore('consolidation', opt);
      ranked.push({
        type: 'consolidation',
        optimization: opt,
        impactScore: score,
        estimatedImpact: impact,
      });
    }

    // Add index optimizations with impact scores
    for (const opt of indexOptimizations) {
      const impact = this.estimateIndexImpact(opt);
      const score = this.calculateImpactScore('index', opt);
      ranked.push({
        type: 'index',
        optimization: opt,
        impactScore: score,
        estimatedImpact: impact,
      });
    }

    // Sort by impact score (highest first)
    ranked.sort((a, b) => b.impactScore - a.impactScore);

    return ranked;
  }

  /**
   * Calculate numeric impact score for ranking.
   */
  private calculateImpactScore(
    type: 'rls' | 'consolidation' | 'index',
    optimization: RLSOptimization | PolicyConsolidation | IndexOptimization
  ): number {
    if (type === 'rls') {
      const rls = optimization as RLSOptimization;
      // RLS optimizations have high impact, scaled by auth function count
      return 100 + (rls.warning.authFunctions.length * 20);
    } else if (type === 'consolidation') {
      const cons = optimization as PolicyConsolidation;
      // Policy consolidation impact scales with number of policies
      return 80 + (cons.originalPolicies.length * 10);
    } else {
      const idx = optimization as IndexOptimization;
      // Index optimizations vary by type
      switch (idx.type) {
        case 'create_fk_index':
          return 70; // High impact for query performance
        case 'remove_duplicate':
          return 50; // Medium impact for storage/writes
        case 'remove_unused':
          return 30; // Low impact
        default:
          return 0;
      }
    }
  }
}
