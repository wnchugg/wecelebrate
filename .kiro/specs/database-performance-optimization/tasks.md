# Implementation Plan: Database Performance Optimization

## Overview

This implementation creates a Python-based system to analyze and optimize database performance issues from Supabase's linter output. The system will generate safe SQL migration scripts for RLS policy optimization, policy consolidation, and index management.

## Tasks

- [x] 1. Set up project structure and core data models
  - Create Python package structure with modules for parsing, analysis, optimization, and migration generation
  - Define Pydantic models for linter warnings, optimizations, and migrations
  - Set up pytest and hypothesis (property-based testing library)
  - Configure database connection utilities (psycopg2 or asyncpg)
  - _Requirements: All requirements (foundation)_

- [-] 2. Implement linter output parser
  - [x] 2.1 Create LinterOutputParser class
    - Parse JSON linter output into typed warning objects
    - Categorize warnings by type (RLS auth, multiple permissive, duplicate index, unindexed FK, unused index)
    - Extract metadata from each warning type
    - _Requirements: 1.1, 2.1, 3.1, 8.1, 9.1_
  
  - [x] 2.2 Write property test for parser
    - **Property 1: Parser categorization**
    - Generate random linter JSON with various warning types
    - Verify all warnings are correctly categorized
    - **Validates: Requirements 1.1, 2.1, 3.1, 8.1, 9.1**
  
  - [x] 2.3 Write unit tests for parser edge cases
    - Test empty input, malformed JSON, missing fields
    - Test unknown warning types (should skip gracefully)
    - _Requirements: Error handling_

- [x] 3. Implement RLS policy analyzer and optimizer
  - [x] 3.1 Create RLSAnalyzer class
    - Query database for current policy definitions using pg_policies
    - Parse policy SQL to identify auth function calls
    - Handle complex expressions (AND, OR, nested conditions)
    - _Requirements: 1.1, 1.2, 7.1_
  
  - [x] 3.2 Create PolicyOptimizer for RLS transformations
    - Wrap auth.uid(), auth.jwt(), auth.role() in (SELECT ...) subqueries
    - Replace current_setting patterns with (SELECT auth.uid())
    - Handle multiple auth functions independently
    - Preserve original SQL structure and logic
    - _Requirements: 1.2, 1.5, 7.2_
  
  - [x] 3.3 Write property test for auth function detection
    - **Property 1: RLS Auth Function Detection**
    - Generate random policy SQL with and without wrapped auth functions
    - Verify correct identification of optimization candidates
    - **Validates: Requirements 1.1**
  
  - [x] 3.4 Write property test for auth function wrapping
    - **Property 2: Auth Function Wrapping**
    - Generate random policies requiring optimization
    - Verify all auth functions are wrapped after optimization
    - **Validates: Requirements 1.2**
  
  - [x] 3.5 Write property test for current_setting replacement
    - **Property 3: Current Setting Replacement**
    - Generate policies with current_setting patterns
    - Verify replacement with (SELECT auth.uid())
    - **Validates: Requirements 1.5**
  
  - [x] 3.6 Write property test for multiple auth function wrapping
    - **Property 4: Multiple Auth Function Wrapping**
    - Generate policies with multiple auth functions
    - Verify each is wrapped independently
    - **Validates: Requirements 7.2**
  
  - [x] 3.7 Write property test for complex expression handling
    - **Property 29: Complex Expression Handling**
    - Generate policies with nested AND/OR conditions
    - Verify only auth functions are wrapped, not entire expressions
    - **Validates: Requirements 7.1**

- [x] 4. Checkpoint - Ensure RLS optimization tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement policy consolidation
  - [x] 5.1 Create PolicyConsolidator class
    - Identify multiple permissive policies for same table/role/action
    - Fetch all policy definitions from database
    - Detect conflicts between USING and WITH CHECK clauses
    - Check for mixed permissive/restrictive policies
    - _Requirements: 2.1, 2.5, 7.3_
  
  - [x] 5.2 Implement policy merging logic
    - Combine USING clauses with OR logic
    - Combine WITH CHECK clauses with OR logic
    - Generate consolidated policy SQL
    - _Requirements: 2.2_
  
  - [x] 5.3 Write property test for consolidation detection
    - **Property 6: Permissive Policy Consolidation Detection**
    - Generate random policy sets with various table/role/action combinations
    - Verify correct identification of consolidation candidates
    - **Validates: Requirements 2.1**
  
  - [x] 5.4 Write property test for OR logic consolidation
    - **Property 7: OR Logic Consolidation**
    - Generate random policy sets for consolidation
    - Verify USING and WITH CHECK clauses are OR-combined
    - **Validates: Requirements 2.2**
  
  - [x] 5.5 Write property test for conflicting policy detection
    - **Property 8: Conflicting Policy Detection**
    - Generate policies with conflicting clauses
    - Verify they are not consolidated
    - **Validates: Requirements 2.5**
  
  - [x] 5.6 Write property test for policy type separation
    - **Property 9: Policy Type Separation**
    - Generate mixed permissive/restrictive policy sets
    - Verify no cross-type consolidation
    - **Validates: Requirements 7.3**

- [x] 6. Implement semantic validation
  - [x] 6.1 Create SemanticValidator class
    - Generate test queries for original and optimized policies
    - Execute queries against test database states
    - Compare result sets for equality
    - Test with various user contexts (different auth.uid() values)
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Write property test for semantic preservation
    - **Property 5: Semantic Preservation**
    - Generate random optimizations (RLS and consolidation)
    - Create test database states and user contexts
    - Verify optimized version grants access to same rows as original
    - **Validates: Requirements 1.3, 2.3, 5.2**
  
  - [x] 6.3 Write property test for validation query generation
    - **Property 27: Validation Query Generation**
    - Generate random optimizations
    - Verify test queries are generated for each
    - **Validates: Requirements 5.1**
  
  - [x] 6.4 Write property test for validation failure handling
    - **Property 28: Validation Failure Handling**
    - Create optimizations that should fail validation
    - Verify they are rejected and logged
    - **Validates: Requirements 5.5**

- [x] 7. Checkpoint - Ensure policy consolidation and validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement index analyzer
  - [x] 8.1 Create IndexAnalyzer class
    - Query pg_indexes for index definitions
    - Query pg_stat_user_indexes for usage statistics
    - Query pg_constraint for foreign key and constraint information
    - Identify duplicate indexes (same table, columns, definition)
    - Identify unused indexes (idx_scan = 0)
    - Identify unindexed foreign keys
    - _Requirements: 3.1, 8.1, 9.1_
  
  - [x] 8.2 Implement duplicate index handling
    - Select which duplicate to preserve (prefer explicit names)
    - Mark others for removal
    - Check for constraint backing (FK, unique, PK)
    - Never remove constraint-backed indexes
    - _Requirements: 3.2, 3.3, 3.5, 7.4_
  
  - [x] 8.3 Implement unused index handling
    - Identify unused indexes from statistics
    - Check if required by constraints
    - Check creation time (protect recent indexes)
    - Prioritize unused duplicates for removal
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 8.4 Implement foreign key index creation
    - Map FK column positions to column names
    - Generate composite indexes for multi-column FKs
    - Ensure column order matches FK definition
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [x] 8.5 Write property test for duplicate index detection
    - **Property 10: Duplicate Index Detection**
    - Generate random index sets with duplicates
    - Verify all but one are identified as duplicates
    - **Validates: Requirements 3.1**
  
  - [x] 8.6 Write property test for duplicate index preservation
    - **Property 11: Duplicate Index Preservation**
    - Generate duplicate index sets
    - Verify exactly one is preserved
    - **Validates: Requirements 3.2**
  
  - [x] 8.7 Write property test for explicit name preference
    - **Property 12: Explicit Name Preference**
    - Generate duplicates with mixed name patterns
    - Verify explicit names are preferred
    - **Validates: Requirements 3.3**
  
  - [x] 8.8 Write property test for constraint-backed index preservation
    - **Property 13: Constraint-Backed Index Preservation**
    - Generate indexes with and without constraint backing
    - Verify constraint-backed indexes are never removed
    - **Validates: Requirements 3.5, 7.4, 9.2**
  
  - [x] 8.9 Write property test for unindexed FK detection
    - **Property 14: Unindexed Foreign Key Detection**
    - Generate FK constraints with and without covering indexes
    - Verify unindexed FKs are identified
    - **Validates: Requirements 8.1**
  
  - [x] 8.10 Write property test for FK index column order
    - **Property 15: Foreign Key Index Column Order**
    - Generate FK indexes
    - Verify column order matches FK definition
    - **Validates: Requirements 8.2**
  
  - [x] 8.11 Write property test for composite FK indexes
    - **Property 16: Composite Foreign Key Indexes**
    - Generate multi-column FKs
    - Verify composite indexes are created
    - **Validates: Requirements 8.5**
  
  - [x] 8.12 Write property test for unused index detection
    - **Property 17: Unused Index Detection**
    - Generate indexes with various usage statistics
    - Verify unused indexes (idx_scan = 0) are identified
    - **Validates: Requirements 9.1**
  
  - [x] 8.13 Write property test for unused duplicate prioritization
    - **Property 18: Unused Duplicate Prioritization**
    - Generate duplicate sets with mixed usage
    - Verify unused duplicates are prioritized for removal
    - **Validates: Requirements 9.3**
  
  - [x] 8.14 Write property test for recent index protection
    - **Property 19: Recent Index Protection**
    - Generate unused indexes with various creation times
    - Verify recent indexes are flagged for review
    - **Validates: Requirements 9.5**

- [x] 9. Checkpoint - Ensure index analysis tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement impact estimation
  - [x] 10.1 Create ImpactEstimator class
    - Estimate row evaluation savings for RLS optimizations
    - Calculate storage savings for index removals
    - Estimate query performance improvement for FK indexes
    - Rank optimizations by impact
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [x] 10.2 Write property test for impact estimation completeness
    - **Property 25: Impact Estimation Completeness**
    - Generate random optimizations
    - Verify all have impact estimates
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [x] 10.3 Write property test for impact-based ranking
    - **Property 26: Impact-Based Ranking**
    - Generate multiple optimizations with different impacts
    - Verify they are ranked by impact (highest first)
    - **Validates: Requirements 6.5**

- [x] 11. Implement migration generator
  - [x] 11.1 Create MigrationGenerator class
    - Generate up migrations (apply optimization)
    - Generate down migrations (rollback)
    - Wrap operations in transactions (BEGIN/COMMIT)
    - Include validation queries
    - Add impact estimates in comments
    - _Requirements: 4.1, 4.2, 5.4, 6.4_
  
  - [x] 11.2 Implement RLS migration patterns
    - Use DROP POLICY followed by CREATE POLICY with same name
    - Include original and optimized SQL in comments
    - _Requirements: 4.4_
  
  - [x] 11.3 Implement index migration patterns
    - Use DROP INDEX CONCURRENTLY for removals
    - Use CREATE INDEX CONCURRENTLY for additions
    - Include index definitions in comments
    - _Requirements: 4.5, 8.3_
  
  - [x] 11.4 Implement SQL syntax validation
    - Parse generated SQL to verify syntax
    - Use sqlparse or similar library
    - Reject migrations with invalid SQL
    - _Requirements: 4.3_
  
  - [ ]* 11.5 Write property test for safe migration structure
    - **Property 20: Safe Migration Structure**
    - Generate random migrations
    - Verify all include transactions, rollback, and validation
    - **Validates: Requirements 4.1, 4.2, 5.4**
  
  - [ ]* 11.6 Write property test for non-blocking SQL patterns
    - **Property 21: Non-Blocking SQL Patterns**
    - Generate index operation migrations
    - Verify CONCURRENTLY is used in all DROP/CREATE INDEX statements
    - **Validates: Requirements 4.5, 8.3**
  
  - [ ]* 11.7 Write property test for RLS policy recreation pattern
    - **Property 22: RLS Policy Recreation Pattern**
    - Generate RLS optimization migrations
    - Verify DROP then CREATE with same policy name
    - **Validates: Requirements 4.4**
  
  - [ ]* 11.8 Write property test for SQL syntax validation
    - **Property 23: SQL Syntax Validation**
    - Generate random migrations
    - Verify all SQL is syntactically valid
    - **Validates: Requirements 4.3**
  
  - [ ]* 11.9 Write property test for migration generation completeness
    - **Property 24: Migration Generation Completeness**
    - Generate random optimizations
    - Verify migrations are generated for all
    - **Validates: Requirements 1.4, 2.4, 3.4, 9.4**

- [ ] 12. Checkpoint - Ensure migration generation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement safety checks and error handling
  - [ ] 13.1 Add safety validation layer
    - Verify no constraint-backed indexes are removed
    - Verify no cross-type policy consolidation
    - Verify no unsafe expression patterns are optimized
    - Skip unsafe optimizations and log reasons
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [ ] 13.2 Implement error handling
    - Handle database connection errors with retry logic
    - Handle parsing errors gracefully (skip and log)
    - Handle query timeouts with clear error messages
    - Handle permission errors with helpful messages
    - _Requirements: Error handling section_
  
  - [ ]* 13.3 Write property test for safe optimization skipping
    - **Property 30: Safe Optimization Skipping**
    - Generate unsafe optimization scenarios
    - Verify they are skipped and documented
    - **Validates: Requirements 7.5**
  
  - [ ]* 13.4 Write unit tests for error conditions
    - Test database connection failures
    - Test malformed SQL parsing
    - Test permission denied scenarios
    - Test timeout handling
    - _Requirements: Error handling section_

- [ ] 14. Implement main orchestration and CLI
  - [ ] 14.1 Create main orchestrator
    - Wire together parser, analyzers, optimizers, and generator
    - Coordinate the full pipeline from linter output to migrations
    - Handle errors and collect results
    - _Requirements: All requirements (integration)_
  
  - [ ] 14.2 Create CLI interface
    - Accept linter JSON file as input
    - Accept database connection parameters
    - Output migration scripts to files
    - Provide progress reporting and summary
    - _Requirements: All requirements (usability)_
  
  - [ ]* 14.3 Write integration tests
    - Test end-to-end flow with real linter output examples
    - Test with various database states
    - Verify generated migrations are correct
    - _Requirements: All requirements_

- [ ] 15. Final checkpoint - Run all tests and verify completeness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each property test should run minimum 100 iterations
- Use hypothesis library for property-based testing in Python
- Use psycopg2 or asyncpg for database connections
- Use sqlparse for SQL parsing and validation
- Use Pydantic for data models and validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end functionality
