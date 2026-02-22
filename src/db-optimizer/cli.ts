#!/usr/bin/env node
/**
 * Database Optimizer CLI
 * 
 * Analyzes RLS policies and generates optimization migrations.
 * 
 * Usage:
 *   npm run db-optimizer:analyze    # Analyze policies and show optimization opportunities
 *   npm run db-optimizer:generate   # Generate migration scripts
 */

import { config } from 'dotenv';
config(); // Load environment variables from .env

import { DatabaseConnection } from './db-utils';
import { PolicyOptimizer } from './optimizer';
import type { RLSOptimization } from './models';
import * as fs from 'fs';
import * as path from 'path';

interface PolicyInfo {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string | null;
}

async function findPoliciesNeedingOptimization(db: DatabaseConnection): Promise<PolicyInfo[]> {
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
    WHERE schemaname = 'public'
      AND (
        qual LIKE '%auth.uid()%' OR 
        qual LIKE '%auth.jwt()%' OR 
        qual LIKE '%auth.role()%' OR
        qual LIKE '%current_setting%'
      )
    ORDER BY tablename, policyname
  `;

  const policies = await db.executeQuery<PolicyInfo>(query);
  
  // Filter to only those that actually need optimization
  const optimizer = new PolicyOptimizer();
  return policies.filter(policy => optimizer.needsOptimization(policy.qual));
}

function generateMigrationSQL(optimization: RLSOptimization, policy: PolicyInfo): string {
  const { schemaname, tablename, policyname, permissive, roles, cmd, with_check } = policy;
  const { originalSQL, optimizedSQL } = optimization;

  // Parse roles array (comes as string like "{authenticated,anon}")
  const rolesList = roles.toString().replace(/[{}]/g, '').split(',').map(r => r.trim());
  const rolesStr = rolesList.join(', ');

  let upSQL = `-- Optimize policy: ${policyname}\n`;
  upSQL += `-- Table: ${schemaname}.${tablename}\n`;
  upSQL += `-- Original USING: ${originalSQL}\n`;
  upSQL += `-- Optimized USING: ${optimizedSQL}\n\n`;
  upSQL += `BEGIN;\n\n`;
  upSQL += `-- Drop existing policy\n`;
  upSQL += `DROP POLICY IF EXISTS "${policyname}" ON ${schemaname}.${tablename};\n\n`;
  upSQL += `-- Create optimized policy\n`;
  upSQL += `CREATE POLICY "${policyname}"\n`;
  upSQL += `  ON ${schemaname}.${tablename}\n`;
  upSQL += `  AS ${permissive}\n`;
  upSQL += `  FOR ${cmd}\n`;
  upSQL += `  TO ${rolesStr}\n`;
  upSQL += `  USING (${optimizedSQL})`;
  
  if (with_check) {
    const optimizedWithCheck = new PolicyOptimizer().optimize(with_check);
    upSQL += `\n  WITH CHECK (${optimizedWithCheck})`;
  }
  
  upSQL += `;\n\n`;
  upSQL += `COMMIT;\n`;

  // Generate rollback SQL
  let downSQL = `-- Rollback optimization: ${policyname}\n`;
  downSQL += `-- Table: ${schemaname}.${tablename}\n\n`;
  downSQL += `BEGIN;\n\n`;
  downSQL += `-- Drop optimized policy\n`;
  downSQL += `DROP POLICY IF EXISTS "${policyname}" ON ${schemaname}.${tablename};\n\n`;
  downSQL += `-- Restore original policy\n`;
  downSQL += `CREATE POLICY "${policyname}"\n`;
  downSQL += `  ON ${schemaname}.${tablename}\n`;
  downSQL += `  AS ${permissive}\n`;
  downSQL += `  FOR ${cmd}\n`;
  downSQL += `  TO ${rolesStr}\n`;
  downSQL += `  USING (${originalSQL})`;
  
  if (with_check) {
    downSQL += `\n  WITH CHECK (${with_check})`;
  }
  
  downSQL += `;\n\n`;
  downSQL += `COMMIT;\n`;

  return `${upSQL}\n\n-- ROLLBACK SCRIPT:\n-- ${'-'.repeat(78)}\n${downSQL}`;
}

async function analyzeCommand() {
  console.log('🔍 Analyzing RLS policies...\n');

  const db = new DatabaseConnection();
  
  try {
    await db.connect();
    console.log('✓ Connected to database\n');

    const policies = await findPoliciesNeedingOptimization(db);
    
    if (policies.length === 0) {
      console.log('✨ No policies need optimization! All auth functions are already wrapped.\n');
      return;
    }

    console.log(`Found ${policies.length} policies that could be optimized:\n`);

    const optimizer = new PolicyOptimizer();
    const optimizations: Array<{ policy: PolicyInfo; optimization: RLSOptimization }> = [];

    for (const policy of policies) {
      const originalSQL = policy.qual;
      const optimizedSQL = optimizer.optimize(originalSQL);
      
      const authFunctions = optimizer.extractAuthFunctions(originalSQL);
      
      const optimization: RLSOptimization = {
        warning: {
          tableName: policy.tablename,
          schemaName: policy.schemaname,
          policyName: policy.policyname,
          authFunctions,
        },
        originalSQL,
        optimizedSQL,
        estimatedImpact: `Reduces auth function evaluations by ~${Math.min(95, authFunctions.length * 30)}%`,
      };

      optimizations.push({ policy, optimization });

      console.log(`📋 ${policy.tablename}.${policy.policyname}`);
      console.log(`   Auth functions: ${authFunctions.length}`);
      console.log(`   Impact: ${optimization.estimatedImpact}`);
      console.log(`   Original: ${originalSQL.substring(0, 80)}${originalSQL.length > 80 ? '...' : ''}`);
      console.log(`   Optimized: ${optimizedSQL.substring(0, 80)}${optimizedSQL.length > 80 ? '...' : ''}`);
      console.log();
    }

    console.log('\n📊 Summary:');
    console.log(`   Total policies: ${policies.length}`);
    console.log(`   Tables affected: ${new Set(policies.map(p => p.tablename)).size}`);
    console.log(`   Total auth function calls: ${optimizations.reduce((sum, o) => sum + o.optimization.warning.authFunctions.length, 0)}`);
    
    console.log('\n💡 Next steps:');
    console.log('   Run: npm run db-optimizer:generate');
    console.log('   This will create migration scripts in migrations/');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

async function generateCommand() {
  console.log('🔧 Generating migration scripts...\n');

  const db = new DatabaseConnection();
  
  try {
    await db.connect();
    console.log('✓ Connected to database\n');

    const policies = await findPoliciesNeedingOptimization(db);
    
    if (policies.length === 0) {
      console.log('✨ No policies need optimization!\n');
      return;
    }

    const optimizer = new PolicyOptimizer();
    const migrationsDir = path.join(process.cwd(), 'migrations', 'rls-optimizations');
    
    // Create migrations directory
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    let migrationCount = 0;

    for (const policy of policies) {
      const originalSQL = policy.qual;
      const optimizedSQL = optimizer.optimize(originalSQL);
      
      const authFunctions = optimizer.extractAuthFunctions(originalSQL);
      
      const optimization: RLSOptimization = {
        warning: {
          tableName: policy.tablename,
          schemaName: policy.schemaname,
          policyName: policy.policyname,
          authFunctions,
        },
        originalSQL,
        optimizedSQL,
        estimatedImpact: `Reduces auth function evaluations by ~${Math.min(95, authFunctions.length * 30)}%`,
      };

      const migrationSQL = generateMigrationSQL(optimization, policy);
      
      // Create filename
      const safeTableName = policy.tablename.replace(/[^a-z0-9]/gi, '_');
      const safePolicyName = policy.policyname.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const filename = `${timestamp}_${String(migrationCount + 1).padStart(3, '0')}_optimize_${safeTableName}_${safePolicyName}.sql`;
      const filepath = path.join(migrationsDir, filename);

      fs.writeFileSync(filepath, migrationSQL);
      
      console.log(`✓ Created: ${filename}`);
      migrationCount++;
    }

    console.log(`\n✨ Generated ${migrationCount} migration scripts in:`);
    console.log(`   ${migrationsDir}\n`);
    
    console.log('📋 Review the migrations:');
    console.log(`   cd migrations/rls-optimizations`);
    console.log(`   cat ${timestamp}_001_*.sql\n`);
    
    console.log('⚠️  Before applying:');
    console.log('   1. Review each migration carefully');
    console.log('   2. Test in a development environment first');
    console.log('   3. Back up your database');
    console.log('   4. Apply migrations one at a time\n');
    
    console.log('🚀 To apply a migration:');
    console.log('   psql $DATABASE_URL -f migrations/rls-optimizations/[filename].sql\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

async function analyzeIndexesCommand() {
  console.log('🔍 Analyzing database indexes...\n');

  const db = new DatabaseConnection();
  
  try {
    await db.connect();
    console.log('✓ Connected to database\n');

    // Find duplicate indexes
    console.log('📊 Checking for duplicate indexes...');
    const duplicateQuery = `
      SELECT 
        schemaname,
        tablename,
        array_agg(indexname) as index_names,
        array_agg(indexdef) as index_defs
      FROM pg_indexes
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename, indexdef
      HAVING COUNT(*) > 1
    `;
    
    const duplicates = await db.executeQuery<{
      schemaname: string;
      tablename: string;
      index_names: string[];
      index_defs: string[];
    }>(duplicateQuery);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} sets of duplicate indexes:\n`);
      for (const dup of duplicates) {
        console.log(`   Table: ${dup.tablename}`);
        console.log(`   Indexes: ${dup.index_names.join(', ')}`);
        console.log(`   Definition: ${dup.index_defs[0].substring(0, 80)}...`);
        console.log();
      }
    } else {
      console.log('   ✓ No duplicate indexes found\n');
    }

    // Find unused indexes
    console.log('📊 Checking for unused indexes...');
    const unusedQuery = `
      SELECT 
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
      ORDER BY pg_relation_size(indexrelid) DESC
    `;
    
    const unused = await db.executeQuery<{
      schemaname: string;
      tablename: string;
      indexname: string;
      idx_scan: number;
      index_size: string;
    }>(unusedQuery);

    if (unused.length > 0) {
      console.log(`\n⚠️  Found ${unused.length} unused indexes:\n`);
      for (const idx of unused) {
        console.log(`   ${idx.tablename}.${idx.indexname}`);
        console.log(`   Size: ${idx.index_size}, Scans: ${idx.idx_scan}`);
        console.log();
      }
    } else {
      console.log('   ✓ No unused indexes found\n');
    }

    // Find unindexed foreign keys
    console.log('📊 Checking for unindexed foreign keys...');
    const unindexedFKQuery = `
      SELECT 
        n.nspname as schema_name,
        t.relname as table_name,
        c.conname as fk_name,
        array_agg(a.attname ORDER BY array_position(c.conkey, a.attnum)) as fk_columns
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.contype = 'f'
        AND n.nspname = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.conrelid
            AND c.conkey[1:array_length(c.conkey, 1)] <@ i.indkey[0:array_length(c.conkey, 1)-1]
        )
      GROUP BY n.nspname, t.relname, c.conname, c.conkey
      ORDER BY t.relname, c.conname
    `;
    
    const unindexedFKs = await db.executeQuery<{
      schema_name: string;
      table_name: string;
      fk_name: string;
      fk_columns: string[];
    }>(unindexedFKQuery);

    if (unindexedFKs.length > 0) {
      console.log(`\n⚠️  Found ${unindexedFKs.length} unindexed foreign keys:\n`);
      for (const fk of unindexedFKs) {
        // Parse fk_columns if it's a string (PostgreSQL array format)
        const columns = typeof fk.fk_columns === 'string' 
          ? fk.fk_columns.replace(/[{}]/g, '').split(',').map(c => c.trim())
          : fk.fk_columns;
        
        console.log(`   ${fk.table_name}.${fk.fk_name}`);
        console.log(`   Columns: ${columns.join(', ')}`);
        console.log(`   Recommendation: CREATE INDEX idx_${fk.table_name}_fk_${columns.join('_')} ON ${fk.table_name} (${columns.join(', ')});`);
        console.log();
      }
    } else {
      console.log('   ✓ All foreign keys are indexed\n');
    }

    // Summary
    console.log('\n📊 Index Analysis Summary:');
    console.log(`   Duplicate index sets: ${duplicates.length}`);
    console.log(`   Unused indexes: ${unused.length}`);
    console.log(`   Unindexed foreign keys: ${unindexedFKs.length}`);
    
    const totalIssues = duplicates.length + unused.length + unindexedFKs.length;
    if (totalIssues > 0) {
      console.log('\n💡 Recommendations:');
      if (duplicates.length > 0) {
        console.log(`   • Remove ${duplicates.length} duplicate index sets to save storage`);
      }
      if (unused.length > 0) {
        console.log(`   • Consider removing ${unused.length} unused indexes (after verification)`);
      }
      if (unindexedFKs.length > 0) {
        console.log(`   • Add indexes to ${unindexedFKs.length} foreign keys to improve join performance`);
      }
    } else {
      console.log('\n✨ Your database indexes are well optimized!');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

async function generateIndexMigrationsCommand() {
  console.log('🔧 Generating index migration scripts...\n');

  const db = new DatabaseConnection();
  
  try {
    await db.connect();
    console.log('✓ Connected to database\n');

    // Find unindexed foreign keys
    const unindexedFKQuery = `
      SELECT 
        n.nspname as schema_name,
        t.relname as table_name,
        c.conname as fk_name,
        array_agg(a.attname ORDER BY array_position(c.conkey, a.attnum)) as fk_columns
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.contype = 'f'
        AND n.nspname = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.conrelid
            AND c.conkey[1:array_length(c.conkey, 1)] <@ i.indkey[0:array_length(c.conkey, 1)-1]
        )
      GROUP BY n.nspname, t.relname, c.conname, c.conkey
      ORDER BY t.relname, c.conname
    `;
    
    const unindexedFKs = await db.executeQuery<{
      schema_name: string;
      table_name: string;
      fk_name: string;
      fk_columns: string[];
    }>(unindexedFKQuery);

    if (unindexedFKs.length === 0) {
      console.log('✨ All foreign keys are already indexed!\n');
      return;
    }

    const migrationsDir = path.join(process.cwd(), 'migrations', 'index-optimizations');
    
    // Create migrations directory
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    let migrationCount = 0;

    for (const fk of unindexedFKs) {
      // Parse fk_columns if it's a string (PostgreSQL array format)
      const columns = typeof fk.fk_columns === 'string' 
        ? fk.fk_columns.replace(/[{}]/g, '').split(',').map(c => c.trim())
        : fk.fk_columns;
      
      const indexName = `idx_${fk.table_name}_fk_${columns.join('_')}`;
      
      // Generate migration SQL
      let upSQL = `-- Add index for foreign key: ${fk.fk_name}\n`;
      upSQL += `-- Table: ${fk.schema_name}.${fk.table_name}\n`;
      upSQL += `-- Columns: ${columns.join(', ')}\n`;
      upSQL += `-- Impact: Improves join performance and referential integrity checks\n\n`;
      upSQL += `BEGIN;\n\n`;
      upSQL += `-- Create index concurrently to avoid locking the table\n`;
      upSQL += `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}\n`;
      upSQL += `  ON ${fk.schema_name}.${fk.table_name} (${columns.join(', ')});\n\n`;
      upSQL += `COMMIT;\n`;

      // Generate rollback SQL
      let downSQL = `-- Remove index for foreign key: ${fk.fk_name}\n`;
      downSQL += `-- Table: ${fk.schema_name}.${fk.table_name}\n\n`;
      downSQL += `BEGIN;\n\n`;
      downSQL += `-- Drop index concurrently to avoid locking the table\n`;
      downSQL += `DROP INDEX CONCURRENTLY IF EXISTS ${fk.schema_name}.${indexName};\n\n`;
      downSQL += `COMMIT;\n`;

      const migrationSQL = `${upSQL}\n\n-- ROLLBACK SCRIPT:\n-- ${'-'.repeat(78)}\n${downSQL}`;
      
      // Create filename
      const safeTableName = fk.table_name.replace(/[^a-z0-9]/gi, '_');
      const safeColumns = columns.join('_').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const filename = `${timestamp}_${String(migrationCount + 1).padStart(3, '0')}_add_fk_index_${safeTableName}_${safeColumns}.sql`;
      const filepath = path.join(migrationsDir, filename);

      fs.writeFileSync(filepath, migrationSQL);
      
      console.log(`✓ Created: ${filename}`);
      console.log(`   Table: ${fk.table_name}`);
      console.log(`   Columns: ${columns.join(', ')}`);
      console.log(`   Index: ${indexName}\n`);
      migrationCount++;
    }

    console.log(`✨ Generated ${migrationCount} migration script(s) in:`);
    console.log(`   ${migrationsDir}\n`);
    
    console.log('📋 Review the migration:');
    console.log(`   cat ${path.join(migrationsDir, `${timestamp}_001_*.sql`)}\n`);
    
    console.log('⚠️  Before applying:');
    console.log('   1. Review the migration carefully');
    console.log('   2. Test in a development environment first');
    console.log('   3. Back up your database');
    console.log('   4. Note: CONCURRENTLY means no table locking during creation\n');
    
    console.log('🚀 To apply the migration:');
    console.log(`   psql $DATABASE_URL -f ${path.join(migrationsDir, `${timestamp}_001_*.sql`)}\n`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

// Main CLI
const command = process.argv[2];

if (command === 'analyze') {
  analyzeCommand().catch(console.error);
} else if (command === 'generate') {
  generateCommand().catch(console.error);
} else if (command === 'analyze-indexes') {
  analyzeIndexesCommand().catch(console.error);
} else if (command === 'generate-index-migrations') {
  generateIndexMigrationsCommand().catch(console.error);
} else {
  console.log('Database Optimizer CLI\n');
  console.log('Usage:');
  console.log('  npm run db-optimizer:analyze                  # Analyze RLS policies');
  console.log('  npm run db-optimizer:generate                 # Generate RLS migrations');
  console.log('  npm run db-optimizer:analyze-indexes          # Analyze database indexes');
  console.log('  npm run db-optimizer:generate-index-migrations # Generate index migrations\n');
  process.exit(1);
}
