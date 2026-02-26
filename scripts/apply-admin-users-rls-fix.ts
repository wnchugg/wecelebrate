/**
 * Script to apply the admin_users RLS policy fix
 * 
 * This script fixes the infinite recursion issue in the admin_users RLS policy
 * by replacing the problematic policy with one that doesn't query admin_users.
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key npm run tsx scripts/apply-admin-users-rls-fix.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key npm run tsx scripts/apply-admin-users-rls-fix.ts');
  console.error('');
  console.error('You can find your service role key in the Supabase dashboard:');
  console.error('  Project Settings > API > service_role key');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔧 Applying admin_users RLS policy fix...');
  console.log('');

  // Read the migration file
  const migrationPath = join(process.cwd(), 'supabase/migrations/fix_admin_users_rls_infinite_recursion.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not found, trying direct execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('COMMENT ON')) continue; // Skip comments
        if (statement.includes('SELECT') && statement.includes('FROM pg_policies')) continue; // Skip verification queries
        
        console.log(`  Executing: ${statement.substring(0, 60)}...`);
        
        const { error: execError } = await supabase.rpc('exec', {
          query: statement + ';'
        });

        if (execError) {
          console.error(`  ❌ Error executing statement: ${execError.message}`);
          throw execError;
        }
      }
    }

    console.log('');
    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('Verification:');
    console.log('  Run the following query in Supabase SQL Editor to verify:');
    console.log('');
    console.log('  SELECT policyname, cmd, qual');
    console.log('  FROM pg_policies');
    console.log('  WHERE tablename = \'admin_users\'');
    console.log('  ORDER BY policyname;');
    console.log('');
    console.log('Expected policies:');
    console.log('  1. Admin users can view their own record');
    console.log('  2. Admin users can update their own record');
    console.log('  3. Service role has full access to admin_users');
    console.log('');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    console.error('');
    console.error('Manual fix required:');
    console.error('  1. Go to Supabase Dashboard > SQL Editor');
    console.error('  2. Copy the contents of: supabase/migrations/fix_admin_users_rls_infinite_recursion.sql');
    console.error('  3. Paste and execute in the SQL Editor');
    console.error('');
    process.exit(1);
  }
}

applyMigration();
