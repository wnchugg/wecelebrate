/**
 * Configuration for database optimizer.
 */

export interface OptimizerConfig {
  /** Minimum number of examples for property-based tests */
  minPropertyTestExamples: number;
  
  /** Maximum number of examples for property-based tests */
  maxPropertyTestExamples: number;
  
  /** Threshold in days for considering an index "recent" */
  recentIndexThresholdDays: number;
  
  /** Database connection retry attempts */
  maxRetryAttempts: number;
  
  /** Database query timeout in milliseconds */
  queryTimeoutMs: number;
}

export const DEFAULT_CONFIG: OptimizerConfig = {
  minPropertyTestExamples: 100,
  maxPropertyTestExamples: 1000,
  recentIndexThresholdDays: 7,
  maxRetryAttempts: 3,
  queryTimeoutMs: 30000,
};
