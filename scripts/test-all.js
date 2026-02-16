#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests with their respective test runners
 * Usage: node scripts/test-all.js [--verbose] [--coverage]
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Parse arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const coverage = args.includes('--coverage');
const help = args.includes('--help');

if (help) {
  console.log('Usage: node scripts/test-all.js [--verbose] [--coverage]');
  console.log('');
  console.log('Options:');
  console.log('  --verbose   Show detailed test output');
  console.log('  --coverage  Generate coverage reports');
  console.log('  --help      Show this help message');
  process.exit(0);
}

// Track results
const results = {
  passed: [],
  failed: [],
  skipped: [],
};

// Print header
console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║         Comprehensive Test Suite - All Test Runners           ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
console.log('');

/**
 * Run a command and return a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || rootDir,
      stdio: verbose ? 'inherit' : 'pipe',
      shell: true,
      ...options,
    });

    let output = '';
    let errorOutput = '';

    if (!verbose) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output, errorOutput });
      } else {
        reject({ success: false, output, errorOutput, code });
      }
    });

    child.on('error', (error) => {
      reject({ success: false, error: error.message });
    });
  });
}

/**
 * Run a test suite
 */
async function runTestSuite(name, command, args, description, options = {}) {
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}Running: ${name}${colors.reset}`);
  console.log(`${colors.blue}Description: ${description}${colors.reset}`);
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  try {
    const result = await runCommand(command, args, options);
    console.log(`${colors.green}✓ ${name} passed${colors.reset}`);
    
    if (!verbose && result.output) {
      // Extract test counts if available
      const lines = result.output.split('\n');
      const testLines = lines.filter(line => 
        line.includes('Test Files') || line.includes('Tests') || line.includes('passed')
      );
      if (testLines.length > 0) {
        testLines.slice(-2).forEach(line => console.log(line.trim()));
      }
    }
    
    console.log('');
    results.passed.push(name);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ${name} failed${colors.reset}`);
    console.log('');
    
    if (!verbose && error.output) {
      console.log('Last 20 lines of output:');
      const lines = error.output.split('\n');
      lines.slice(-20).forEach(line => console.log(line));
      console.log('');
    }
    
    results.failed.push(name);
    return false;
  }
}

/**
 * Check if a command exists
 */
async function commandExists(command) {
  try {
    await runCommand(command, ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  // 1. Vitest Tests
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  1. Vitest Tests (Frontend & Backend Logic)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  const vitestCmd = coverage ? 'test:coverage' : 'test:safe';
  await runTestSuite(
    'Vitest Tests',
    'npm',
    ['run', vitestCmd],
    'All Vitest-compatible tests (123 files, 2859 tests)'
  );

  // 2. Playwright E2E Tests
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  2. Playwright E2E Tests${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  const playwrightExists = existsSync(join(rootDir, 'node_modules', '.bin', 'playwright'));
  if (playwrightExists) {
    await runTestSuite(
      'Playwright E2E',
      'npm',
      ['run', 'test:e2e'],
      'End-to-end tests with Playwright'
    );
  } else {
    console.log(`${colors.yellow}⚠ Playwright not found - skipping E2E tests${colors.reset}`);
    console.log(`${colors.yellow}  Install with: npx playwright install${colors.reset}`);
    console.log('');
    results.skipped.push('Playwright E2E');
  }

  // 3. Deno Backend Tests
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  3. Deno Backend Tests${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  const denoExists = await commandExists('/Users/nicholuschugg/.deno/bin/deno') || await commandExists('deno');
  if (denoExists) {
    const denoTestsDir = join(rootDir, 'supabase', 'functions', 'server', 'tests');
    const denoCmd = '/Users/nicholuschugg/.deno/bin/deno';
    
    // Dashboard API Tests
    if (existsSync(join(denoTestsDir, 'dashboard_api.test.ts'))) {
      await runTestSuite(
        'Deno: Dashboard API',
        denoCmd,
        ['test', '--allow-net', '--allow-env', '--no-check', 'dashboard_api.test.ts'],
        'Dashboard analytics API tests (30 tests)',
        { 
          cwd: denoTestsDir,
          env: { ...process.env, DENO_TLS_CA_STORE: 'system' }
        }
      );
    }
    
    // Helpers Tests
    if (existsSync(join(denoTestsDir, 'helpers.test.ts'))) {
      await runTestSuite(
        'Deno: Helpers',
        denoCmd,
        ['test', '--allow-net', '--allow-env', '--no-check', 'helpers.test.ts'],
        'Backend helper function tests',
        { 
          cwd: denoTestsDir,
          env: { ...process.env, DENO_TLS_CA_STORE: 'system' }
        }
      );
    }
    
    // Validation Tests
    if (existsSync(join(denoTestsDir, 'validation.test.ts'))) {
      await runTestSuite(
        'Deno: Validation',
        denoCmd,
        ['test', '--allow-net', '--allow-env', '--no-check', 'validation.test.ts'],
        'Backend validation function tests',
        { 
          cwd: denoTestsDir,
          env: { ...process.env, DENO_TLS_CA_STORE: 'system' }
        }
      );
    }
  } else {
    console.log(`${colors.yellow}⚠ Deno not found - skipping Deno backend tests${colors.reset}`);
    console.log(`${colors.yellow}  Install from: https://deno.land/#installation${colors.reset}`);
    console.log('');
    results.skipped.push('Deno Backend Tests');
  }

  // 4. Type Checking
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  4. TypeScript Type Checking${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  await runTestSuite(
    'Type Check',
    'npm',
    ['run', 'type-check'],
    'TypeScript type checking'
  );

  // 5. Linting
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  5. ESLint Code Quality${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  await runTestSuite(
    'Lint Check',
    'npm',
    ['run', 'lint'],
    'ESLint code quality checks'
  );

  // Print Summary
  console.log('');
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                        Test Summary                            ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  const totalSuites = results.passed.length + results.failed.length;

  if (results.failed.length === 0) {
    console.log(`${colors.green}✓ All test suites passed! (${results.passed.length}/${totalSuites})${colors.reset}`);
    if (results.skipped.length > 0) {
      console.log(`${colors.yellow}⚠ ${results.skipped.length} suite(s) skipped${colors.reset}`);
    }
    console.log('');
    console.log(`${colors.green}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║                    🎉 SUCCESS! 🎉                              ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ ${results.failed.length} test suite(s) failed${colors.reset}`);
    console.log(`${colors.green}✓ ${results.passed.length} test suite(s) passed${colors.reset}`);
    if (results.skipped.length > 0) {
      console.log(`${colors.yellow}⚠ ${results.skipped.length} suite(s) skipped${colors.reset}`);
    }
    console.log('');
    
    if (results.failed.length > 0) {
      console.log(`${colors.red}Failed test suites:${colors.reset}`);
      results.failed.forEach(test => {
        console.log(`${colors.red}  - ${test}${colors.reset}`);
      });
      console.log('');
    }
    
    console.log(`${colors.red}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║                      TESTS FAILED                              ║${colors.reset}`);
    console.log(`${colors.red}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
