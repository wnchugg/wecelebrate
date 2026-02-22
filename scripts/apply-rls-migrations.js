#!/usr/bin/env node
/**
 * Apply RLS optimization migrations using psql
 * 
 * Usage: node scripts/apply-rls-migrations.js
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const MIGRATIONS_DIR = 'migrations/rls-optimizations';
const PSQL_PATH = '/opt/homebrew/opt/postgresql@14/bin/psql';

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('');
  console.error('Please set it in your .env file or export it:');
  console.error('  export DATABASE_URL="postgresql://..."');
  process.exit(1);
}

console.log('🔧 RLS Policy Optimization - Migration Script');
console.log('='.repeat(50));
console.log('');

// Get all migration files
const files = readdirSync(MIGRATIONS_DIR)
  .filter(f => f.startsWith('2026-02-20_') && f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration files`);
console.log('');

// Extract UP migration from file (everything before ROLLBACK)
function extractUpMigration(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const upLines = [];
  
  for (const line of lines) {
    if (line.includes('-- ROLLBACK SCRIPT:')) {
      break;
    }
    upLines.push(line);
  }
  
  return upLines.join('\n');
}

let successCount = 0;
let failCount = 0;

// Apply each migration
for (const file of files) {
  const filepath = join(MIGRATIONS_DIR, file);
  const shortName = file.replace('2026-02-20_', '').replace('.sql', '').substring(0, 60);
  
  console.log(`📝 ${shortName}...`);
  
  try {
    const upMigration = extractUpMigration(filepath);
    
    // Apply migration using psql
    execSync(`${PSQL_PATH} "${process.env.DATABASE_URL}" -c "${upMigration.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('   ✓ Success');
    successCount++;
  } catch (error) {
    console.log('   ❌ Failed');
    console.error('   Error:', error.message);
    failCount++;
  }
  
  console.log('');
}

console.log('='.repeat(50));
console.log('✨ Migration Summary:');
console.log(`   Success: ${successCount}`);
console.log(`   Failed: ${failCount}`);
console.log('');

// Verify results
console.log('🔍 Verifying optimizations...');
try {
  const result = execSync(
    `${PSQL_PATH} "${process.env.DATABASE_URL}" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%(SELECT auth.uid())%';"`,
    { encoding: 'utf8' }
  );
  
  const optimizedCount = parseInt(result.trim());
  console.log(`   Optimized policies: ${optimizedCount}`);
  console.log('');
  
  if (optimizedCount === files.length) {
    console.log('🎉 All migrations applied successfully!');
  } else {
    console.log('⚠️  Some migrations may not have applied correctly');
    console.log(`   Expected: ${files.length}`);
    console.log(`   Found: ${optimizedCount}`);
  }
} catch (error) {
  console.error('   Error verifying:', error.message);
}

console.log('');
console.log('Done!');
