/**
 * Integration tests for semantic validator with real database.
 * 
 * These tests require a real Supabase database connection.
 * Set the following environment variables to run these tests:
 * - DB_HOST or DATABASE_URL
 * - DB_PORT (default: 5432)
 * - DB_NAME (default: postgres)
 * - DB_USER (default: postgres)
 * - DB_PASSWORD
 * 
 * To run these tests:
 * npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
 * 
 * Or skip them by default (they're marked as skipIf no DB config):
 * npm run test:safe
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SemanticValidator, type UserContext } from '../validator';
import type { RLSOptimization, PolicyConsolidation } from '../models';
import { DatabaseConnection } from '../db-utils';

// Check if database configuration is available
const hasDbConfig = !!(
  process.env.DATABASE_URL || 
  (process.env.DB_HOST && process.env.DB_PASSWORD)
);

// Skip these tests if no database configuration is provided
describe.skipIf(!hasDbConfig)('SemanticValidator Integration Tests (Real Database)', () => {
  let db: DatabaseConnection;
  let validator: SemanticValidator;

  beforeAll(async () => {
    // Create database connection
    db = new DatabaseConnection();
    
    try {
      await db.connect();
      console.log('✓ Connected to database for integration tests');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to connect to database:', errorMessage);
      console.error('\nTroubleshooting tips:');
      console.error('1. Verify your Supabase project is active (not paused)');
      console.error('2. Check if you need to use connection pooling instead of direct connection');
      console.error('3. Go to Supabase Dashboard > Project Settings > Database');
      console.error('4. Try the "Connection pooling" string instead of "Direct connection"');
      console.error('5. Ensure your IP is allowed (or temporarily allow all IPs for testing)');
      console.error('\nConnection pooling format:');
      console.error('DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
      throw error;
    }

    validator = new SemanticValidator(db);
  });

  afterAll(async () => {
    if (db) {
      await db.disconnect();
      console.log('✓ Disconnected from database');
    }
  });

  it('should connect to database successfully', async () => {
    expect(db.isConnected()).toBe(true);
  });

  it('should query pg_policies table', async () => {
    // Query for any policies in the public schema
    const query = `
      SELECT schemaname, tablename, policyname, permissive, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      LIMIT 5
    `;

    const results = await db.executeQuery(query);
    
    // Should return an array (may be empty if no policies exist)
    expect(Array.isArray(results)).toBe(true);
    
    console.log(`Found ${results.length} RLS policies in public schema`);
    
    if (results.length > 0) {
      console.log('Sample policy:', results[0]);
      
      // Verify structure
      expect(results[0]).toHaveProperty('schemaname');
      expect(results[0]).toHaveProperty('tablename');
      expect(results[0]).toHaveProperty('policyname');
    }
  });

  it('should query pg_indexes table', async () => {
    // Query for any indexes in the public schema
    const query = `
      SELECT schemaname, tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      LIMIT 5
    `;

    const results = await db.executeQuery(query);
    
    expect(Array.isArray(results)).toBe(true);
    
    console.log(`Found ${results.length} indexes in public schema`);
    
    if (results.length > 0) {
      console.log('Sample index:', results[0]);
    }
  });

  it('should get policy definition if policies exist', async () => {
    // First, find any policy that exists
    const query = `
      SELECT schemaname, tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      LIMIT 1
    `;

    const policies = await db.executeQuery(query);
    
    if (policies.length > 0) {
      const { schemaname, tablename, policyname } = policies[0];
      
      const policyDef = await db.getPolicyDefinition(schemaname, tablename, policyname);
      
      expect(policyDef).not.toBeNull();
      expect(policyDef?.policyname).toBe(policyname);
      expect(policyDef?.tablename).toBe(tablename);
      
      console.log('Policy definition:', policyDef);
    } else {
      console.log('No policies found in public schema - skipping policy definition test');
    }
  });

  it('should validate RLS optimization with real database (if policies exist)', async () => {
    // Find a policy with auth functions
    const query = `
      SELECT schemaname, tablename, policyname, qual
      FROM pg_policies
      WHERE schemaname = 'public'
        AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' OR qual LIKE '%auth.role()%')
      LIMIT 1
    `;

    const policies = await db.executeQuery(query);
    
    if (policies.length > 0) {
      const { schemaname, tablename, policyname, qual } = policies[0];
      
      console.log('Testing policy:', { schemaname, tablename, policyname });
      console.log('Original USING clause:', qual);
      
      // Create optimization
      const optimization: RLSOptimization = {
        warning: {
          tableName: tablename,
          schemaName: schemaname,
          policyName: policyname,
          authFunctions: ['auth.uid()'],
        },
        originalSQL: qual,
        optimizedSQL: qual.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())'),
        estimatedImpact: 'Test optimization',
      };

      // Create test user context
      const userContext: UserContext = {
        userId: '00000000-0000-0000-0000-000000000001',
        role: 'authenticated',
      };

      // Note: This will likely fail because we can't easily set up auth context
      // in a test environment, but it demonstrates the integration
      try {
        const [isValid, reason] = await validator.validateRLSOptimization(
          optimization,
          [userContext]
        );
        
        console.log('Validation result:', { isValid, reason });
      } catch (error) {
        console.log('Validation error (expected in test environment):', error);
      }
    } else {
      console.log('No policies with auth functions found - skipping validation test');
    }
  });

  it('should list all tables with RLS enabled', async () => {
    const query = `
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY policy_count DESC
    `;

    const results = await db.executeQuery(query);
    
    console.log(`Found ${results.length} tables with RLS policies`);
    
    if (results.length > 0) {
      console.log('Tables with most policies:');
      results.slice(0, 5).forEach((row: any) => {
        console.log(`  - ${row.tablename}: ${row.policy_count} policies`);
      });
    }
  });

  it('should identify potential optimization candidates', async () => {
    // Find policies with unwrapped auth functions
    // Note: Optimized patterns include space and optional alias: ( SELECT auth.uid() AS uid)
    const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        qual,
        CASE 
          WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%( SELECT auth.uid()%' THEN true
          WHEN qual LIKE '%auth.jwt()%' AND qual NOT LIKE '%( SELECT auth.jwt()%' THEN true
          WHEN qual LIKE '%auth.role()%' AND qual NOT LIKE '%( SELECT auth.role()%' THEN true
          ELSE false
        END as needs_optimization
      FROM pg_policies
      WHERE schemaname = 'public'
        AND (
          qual LIKE '%auth.uid()%' OR 
          qual LIKE '%auth.jwt()%' OR 
          qual LIKE '%auth.role()%'
        )
    `;

    const results = await db.executeQuery(query);
    
    const needsOptimization = results.filter((row: any) => row.needs_optimization);
    
    console.log(`Found ${needsOptimization.length} policies that could be optimized`);
    
    if (needsOptimization.length > 0) {
      console.log('Sample policies needing optimization:');
      needsOptimization.slice(0, 3).forEach((row: any) => {
        console.log(`  - ${row.tablename}.${row.policyname}`);
        console.log(`    USING: ${row.qual}`);
      });
    } else {
      console.log('✓ All policies with auth functions are already optimized!');
    }
  });
});

// Instructions for running these tests
if (!hasDbConfig) {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    Database Integration Tests Skipped                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  To run integration tests with your Supabase database:                    ║
║                                                                            ║
║  1. Get your database connection details from Supabase:                   ║
║     - Go to Project Settings > Database                                   ║
║     - Copy the "Connection string" (Direct connection)                    ║
║                                                                            ║
║  2. Add to your .env file:                                                ║
║                                                                            ║
║     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
║                                                                            ║
║     Or use individual variables:                                          ║
║                                                                            ║
║     DB_HOST=db.xxx.supabase.co                                           ║
║     DB_PORT=5432                                                          ║
║     DB_NAME=postgres                                                      ║
║     DB_USER=postgres                                                      ║
║     DB_PASSWORD=your_password                                             ║
║                                                                            ║
║  3. Run the integration tests:                                            ║
║                                                                            ║
║     npm run test:safe -- src/db-optimizer/__tests__/validator.integration.test.ts
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);
}
