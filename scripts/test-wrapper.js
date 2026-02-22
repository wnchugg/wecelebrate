#!/usr/bin/env node

/**
 * Test Execution Wrapper
 * 
 * This script runs the test suite and verifies all tests pass.
 * It provides a simple pass/fail result for validation purposes.
 * 
 * Usage:
 *   node scripts/test-wrapper.js [--coverage] [--verbose]
 * 
 * Options:
 *   --coverage  Run tests with coverage
 *   --verbose   Show detailed test output
 * 
 * Exit codes:
 *   0 - All tests passed
 *   1 - Tests failed or error occurred
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const verboseIndex = args.indexOf('--verbose');
const verbose = verboseIndex !== -1;
if (verbose) args.splice(verboseIndex, 1);

const coverageIndex = args.indexOf('--coverage');
const coverage = coverageIndex !== -1;
if (coverage) args.splice(coverageIndex, 1);

// Determine which test command to run
const testCommand = coverage ? 'npm run test:coverage' : 'npm run test:safe';

console.log('🧪 Running test suite...');
console.log(`   Command: ${testCommand}\n`);

const startTime = Date.now();

try {
  const output = execSync(testCommand, {
    encoding: 'utf-8',
    stdio: verbose ? 'inherit' : 'pipe',
    maxBuffer: 50 * 1024 * 1024
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  if (!verbose && output) {
    // Extract summary from output
    const lines = output.split('\n');
    const summaryStart = lines.findIndex(line => line.includes('Test Files') || line.includes('Tests'));
    if (summaryStart !== -1) {
      console.log('\n📊 Test Summary:');
      console.log('═══════════════════════════════════════════════════════════');
      lines.slice(summaryStart, summaryStart + 5).forEach(line => {
        if (line.trim()) console.log(`   ${line.trim()}`);
      });
      console.log('═══════════════════════════════════════════════════════════');
    }
  }
  
  console.log(`\n✅ All tests passed! (${duration}s)\n`);
  process.exit(0);
  
} catch (error) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.error(`\n❌ Tests failed! (${duration}s)\n`);
  
  if (!verbose && error.stdout) {
    // Show failure summary
    const output = error.stdout.toString();
    const lines = output.split('\n');
    
    // Find and show failed tests
    const failedTests = lines.filter(line => 
      line.includes('FAIL') || 
      line.includes('✕') || 
      line.includes('Error:')
    );
    
    if (failedTests.length > 0) {
      console.error('Failed tests:');
      console.error('───────────────────────────────────────────────────────────');
      failedTests.slice(0, 10).forEach(line => {
        console.error(`   ${line.trim()}`);
      });
      if (failedTests.length > 10) {
        console.error(`   ... and ${failedTests.length - 10} more failures`);
      }
      console.error('───────────────────────────────────────────────────────────\n');
    }
    
    console.error('Run with --verbose flag to see full output.\n');
  }
  
  process.exit(1);
}
