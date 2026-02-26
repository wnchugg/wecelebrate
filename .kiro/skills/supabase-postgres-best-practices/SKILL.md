---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
license: MIT
metadata:
  author: supabase
  version: "1.1.0"
  organization: Supabase
  date: January 2026
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## Core Best Practices

### Query Performance

1. **Use Indexes Wisely**
   - Add indexes on frequently queried columns
   - Use composite indexes for multi-column queries
   - Consider partial indexes for filtered queries
   - Monitor index usage with `pg_stat_user_indexes`

2. **Avoid N+1 Queries**
   - Use JOINs instead of multiple queries
   - Batch queries when possible
   - Use Supabase's `.select()` with relationships

3. **Optimize WHERE Clauses**
   - Put most selective filters first
   - Use indexed columns in WHERE clauses
   - Avoid functions on indexed columns

### Connection Management

1. **Use Connection Pooling**
   - Supabase provides pgBouncer by default
   - Use transaction mode for short queries
   - Use session mode for complex transactions

2. **Limit Connection Count**
   - Don't create connections per request
   - Reuse Supabase client instances
   - Configure appropriate pool sizes

### Security & RLS

1. **Enable Row Level Security**
   - Always enable RLS on tables with user data
   - Create policies for SELECT, INSERT, UPDATE, DELETE
   - Test policies thoroughly

2. **Use Parameterized Queries**
   - Never concatenate user input into SQL
   - Use Supabase client methods (they're parameterized)
   - Validate input before queries

### Schema Design

1. **Choose Appropriate Data Types**
   - Use `uuid` for IDs (better distribution)
   - Use `timestamptz` for timestamps
   - Use `jsonb` for flexible data (not `json`)

2. **Normalize Appropriately**
   - Normalize to reduce redundancy
   - Denormalize for read-heavy workloads
   - Use materialized views for complex aggregations

## Common Patterns

### Efficient Pagination

```sql
-- Good: Use cursor-based pagination
SELECT * FROM posts
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT 20;

-- Avoid: OFFSET for large datasets
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000; -- Slow for large offsets
```

### Proper Indexing

```sql
-- Create index on frequently queried columns
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Composite index for multi-column queries
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Partial index for filtered queries
CREATE INDEX idx_active_posts ON posts(user_id)
WHERE status = 'active';
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own posts
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- Policy for public posts
CREATE POLICY "Anyone can view public posts"
ON posts FOR SELECT
USING (is_public = true);
```

## Performance Monitoring

### Check Slow Queries

```sql
-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Check Index Usage

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_toast%';
```

## Resources

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
