# Requirements Document

## Introduction

This feature addresses database performance optimization issues identified by Supabase's database linter. The system currently has three categories of performance warnings: RLS (Row Level Security) policies that inefficiently re-evaluate authentication functions for each row, multiple permissive RLS policies that cause redundant policy execution, and duplicate indexes that waste storage and slow down write operations.

## Glossary

- **RLS_Policy**: Row Level Security policy that controls access to database rows
- **Auth_Function**: Authentication function from the `auth` schema (e.g., `auth.uid()`, `auth.jwt()`)
- **Permissive_Policy**: RLS policy that grants access when its condition is true
- **Policy_Optimizer**: System component that analyzes and optimizes RLS policies
- **Index_Analyzer**: System component that identifies and removes duplicate indexes
- **Migration_Generator**: System component that creates SQL migration scripts

## Requirements

### Requirement 1: Optimize RLS Authentication Function Calls

**User Story:** As a database administrator, I want RLS policies to evaluate authentication functions once per query instead of once per row, so that query performance improves significantly.

#### Acceptance Criteria

1. WHEN an RLS policy contains `auth.uid()`, `auth.jwt()`, or `auth.role()` without subquery wrapping, THE Policy_Optimizer SHALL identify it as requiring optimization
2. WHEN optimizing an RLS policy, THE Policy_Optimizer SHALL wrap authentication function calls in `(SELECT ...)` subqueries
3. WHEN optimizing an RLS policy, THE Policy_Optimizer SHALL preserve the original policy logic and security guarantees
4. FOR ALL optimized policies, THE Migration_Generator SHALL create SQL migration scripts that drop the old policy and create the optimized version
5. WHEN an RLS policy contains `current_setting('request.jwt.claims', true)::json->>'sub'`, THE Policy_Optimizer SHALL replace it with `(SELECT auth.uid())`

### Requirement 2: Consolidate Multiple Permissive Policies

**User Story:** As a database administrator, I want to consolidate multiple permissive RLS policies for the same role and action, so that policy evaluation is more efficient.

#### Acceptance Criteria

1. WHEN multiple permissive policies exist for the same table, role, and action combination, THE Policy_Optimizer SHALL identify them as candidates for consolidation
2. WHEN consolidating policies, THE Policy_Optimizer SHALL combine policy conditions using OR logic
3. WHEN consolidating policies, THE Policy_Optimizer SHALL preserve all original access grants
4. FOR ALL consolidated policies, THE Migration_Generator SHALL create SQL migration scripts that drop individual policies and create a single combined policy
5. WHEN policies have conflicting USING and WITH CHECK clauses, THE Policy_Optimizer SHALL maintain separate policies and document the conflict

### Requirement 3: Remove Duplicate Indexes

**User Story:** As a database administrator, I want to remove duplicate indexes, so that storage is optimized and write performance improves.

#### Acceptance Criteria

1. WHEN multiple indexes exist on the same column(s) with the same definition, THE Index_Analyzer SHALL identify them as duplicates
2. WHEN removing duplicate indexes, THE Index_Analyzer SHALL preserve one index and mark others for removal
3. WHEN selecting which index to preserve, THE Index_Analyzer SHALL prefer indexes with explicit names over auto-generated names
4. FOR ALL duplicate indexes, THE Migration_Generator SHALL create SQL migration scripts to drop redundant indexes
5. WHEN an index is referenced by a foreign key constraint, THE Index_Analyzer SHALL not mark it for removal

### Requirement 4: Generate Safe Migration Scripts

**User Story:** As a database administrator, I want migration scripts that can be safely applied to production, so that optimizations don't cause downtime or data loss.

#### Acceptance Criteria

1. WHEN generating migration scripts, THE Migration_Generator SHALL wrap all operations in transactions
2. WHEN generating migration scripts, THE Migration_Generator SHALL include rollback scripts
3. WHEN generating migration scripts, THE Migration_Generator SHALL validate SQL syntax before output
4. WHEN generating migration scripts for RLS policies, THE Migration_Generator SHALL use `CREATE POLICY` with the same policy name after `DROP POLICY`
5. WHEN generating migration scripts for indexes, THE Migration_Generator SHALL use `DROP INDEX CONCURRENTLY` to avoid locking tables

### Requirement 5: Validate Optimizations

**User Story:** As a database administrator, I want to validate that optimizations maintain correct behavior, so that security and functionality are not compromised.

#### Acceptance Criteria

1. WHEN an optimization is proposed, THE Policy_Optimizer SHALL generate test queries to verify behavior
2. WHEN validating RLS optimizations, THE Policy_Optimizer SHALL confirm that the same rows are accessible before and after optimization
3. WHEN validating index removal, THE Index_Analyzer SHALL confirm that query plans remain efficient
4. FOR ALL optimizations, THE Migration_Generator SHALL include validation queries in migration scripts
5. WHEN validation fails, THE Policy_Optimizer SHALL reject the optimization and log the reason

### Requirement 6: Report Optimization Impact

**User Story:** As a database administrator, I want to see the expected impact of optimizations, so that I can prioritize which changes to apply first.

#### Acceptance Criteria

1. WHEN analyzing performance issues, THE Policy_Optimizer SHALL estimate the performance improvement for each optimization
2. WHEN reporting on RLS optimizations, THE Policy_Optimizer SHALL indicate how many row evaluations will be eliminated
3. WHEN reporting on index removal, THE Index_Analyzer SHALL calculate storage savings
4. FOR ALL optimizations, THE Migration_Generator SHALL include impact estimates in migration script comments
5. WHEN multiple optimizations are available, THE Policy_Optimizer SHALL rank them by expected impact

### Requirement 7: Handle Edge Cases Safely

**User Story:** As a database administrator, I want the optimizer to handle complex scenarios safely, so that edge cases don't cause issues.

#### Acceptance Criteria

1. WHEN an RLS policy uses authentication functions in complex expressions, THE Policy_Optimizer SHALL analyze the expression tree before optimizing
2. WHEN an RLS policy references multiple authentication functions, THE Policy_Optimizer SHALL wrap each function call independently
3. WHEN a table has both permissive and restrictive policies, THE Policy_Optimizer SHALL not consolidate across policy types
4. WHEN an index is part of a unique constraint, THE Index_Analyzer SHALL preserve it regardless of duplication
5. IF optimization cannot be performed safely, THEN THE Policy_Optimizer SHALL skip the optimization and document the reason

### Requirement 8: Identify and Index Unindexed Foreign Keys

**User Story:** As a database administrator, I want foreign key constraints to have covering indexes, so that join operations and referential integrity checks perform efficiently.

#### Acceptance Criteria

1. WHEN a foreign key constraint exists without a covering index, THE Index_Analyzer SHALL identify it as requiring an index
2. WHEN creating indexes for foreign keys, THE Migration_Generator SHALL use column order matching the foreign key definition
3. WHEN generating foreign key indexes, THE Migration_Generator SHALL use `CREATE INDEX CONCURRENTLY` to avoid locking tables
4. FOR ALL foreign key indexes, THE Migration_Generator SHALL include impact estimates for query performance improvement
5. WHEN a foreign key has multiple columns, THE Index_Analyzer SHALL create a composite index covering all columns in order

### Requirement 9: Remove Unused Indexes

**User Story:** As a database administrator, I want to remove indexes that have never been used, so that storage is optimized and write performance improves.

#### Acceptance Criteria

1. WHEN an index has never been used according to database statistics, THE Index_Analyzer SHALL identify it as a candidate for removal
2. WHEN removing unused indexes, THE Index_Analyzer SHALL check if the index is required for constraints or foreign keys
3. WHEN an unused index is also a duplicate, THE Index_Analyzer SHALL prioritize it for removal over used duplicates
4. FOR ALL unused indexes, THE Migration_Generator SHALL create SQL migration scripts with rollback capability
5. WHEN an index is unused but recently created, THE Index_Analyzer SHALL flag it for review rather than automatic removal
