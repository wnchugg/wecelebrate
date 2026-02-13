#!/usr/bin/env node

/**
 * Quick Test Verification Script
 * 
 * Runs a series of quick tests to verify the test infrastructure is working
 * 
 * Usage: node verify-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Test Infrastructure...\n');

const checks = [];
let passed = 0;
let failed = 0;

// Helper function to run checks
function check(name, fn) {
  process.stdout.write(`${name}... `);
  try {
    fn();
    console.log('✅ PASS');
    passed++;
    return true;
  } catch (error) {
    console.log('❌ FAIL');
    console.log(`   Error: ${error.message}`);
    failed++;
    return false;
  }
}

// Check 1: Verify test files exist
check('Test files exist', () => {
  const files = [
    'vitest.config.ts',
    'playwright.config.ts',
    'src/test/setup.ts',
    'src/test/mockData/catalogData.ts',
    'src/test/mocks/handlers.ts',
    'src/types/__tests__/catalog.test.ts',
    'src/services/__tests__/catalogApi.test.ts',
  ];
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  }
});

// Check 2: Verify dependencies installed
check('Test dependencies installed', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const required = [
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    'msw',
    '@playwright/test',
  ];
  
  for (const dep of required) {
    if (!deps[dep]) {
      throw new Error(`Missing dependency: ${dep}`);
    }
  }
});

// Check 3: Verify npm scripts
check('Test scripts configured', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const scripts = packageJson.scripts;
  
  const required = [
    'test',
    'test:watch',
    'test:ui',
    'test:coverage',
    'test:e2e',
  ];
  
  for (const script of required) {
    if (!scripts[script]) {
      throw new Error(`Missing script: ${script}`);
    }
  }
});

// Check 4: Type check
check('TypeScript compiles', () => {
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript errors found');
  }
});

// Check 5: Run tests
check('Tests execute successfully', () => {
  try {
    execSync('npm test -- --run', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Tests failed');
  }
});

// Check 6: Mock data loads
check('Mock data loads correctly', () => {
  const mockDataPath = path.join(__dirname, 'src/test/mockData/catalogData.ts');
  const content = fs.readFileSync(mockDataPath, 'utf-8');
  
  if (!content.includes('mockCatalogs')) {
    throw new Error('Mock catalogs not found');
  }
  if (!content.includes('mockSiteConfigs')) {
    throw new Error('Mock site configs not found');
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed === 0) {
  console.log('✅ All checks passed! Test infrastructure is ready.\n');
  console.log('Quick commands:');
  console.log('  npm test              - Run unit tests');
  console.log('  npm run test:ui       - Open test UI');
  console.log('  npm run test:e2e      - Run E2E tests');
  console.log('  npm run test:coverage - Generate coverage report\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the errors above.\n');
  process.exit(1);
}
