#!/usr/bin/env node

/**
 * Automated script to fix common unsafe assignment patterns
 * Focuses on adding type annotations to common patterns
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Get all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**']
});

let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    
    // Pattern 1: response.data without type assertion
    // Fix: response.data as Type[]
    const responseDataPattern = /const response = await apiClient\.(\w+)\.list\([^)]+\);\s*return response\.data;/g;
    if (responseDataPattern.test(content)) {
      content = content.replace(
        /const response = await apiClient\.clients\.list\([^)]+\);\s*return response\.data;/g,
        'const response = await apiClient.clients.list({ page: 1, limit: 1000 });\n    return response.data as Client[];'
      );
      content = content.replace(
        /const response = await apiClient\.sites\.list\([^)]+\);\s*return response\.data;/g,
        'const response = await apiClient.sites.list({ page: 1, limit: 1000 });\n    return response.data as Site[];'
      );
      content = content.replace(
        /const response = await apiClient\.gifts\.list\([^)]+\);\s*return response\.data;/g,
        'const response = await apiClient.gifts.list(params);\n    return response.data as Gift[];'
      );
      content = content.replace(
        /const response = await apiClient\.orders\.list\([^)]+\);\s*return response\.data;/g,
        'const response = await apiClient.orders.list(params);\n    return response.data as Order[];'
      );
      modified = true;
    }
    
    // Pattern 2: let variable = response.data (without type)
    // Fix: let variable: Type[] = response.data as Type[]
    const letResponsePattern = /let (\w+) = response\.data;/g;
    if (letResponsePattern.test(content)) {
      // This is tricky - we need context to know the type
      // For now, skip this pattern
    }
    
    // Pattern 3: Array.map with implicit any parameter
    // Fix: .map((item: Type) => ...)
    // This is complex and context-dependent, skip for now
    
    if (modified) {
      writeFileSync(file, content, 'utf-8');
      totalFixed++;
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('\nRunning linter to check remaining warnings...');

try {
  const output = execSync('npm run lint 2>&1', { encoding: 'utf-8' });
  const match = output.match(/(\d+) warnings/);
  if (match) {
    console.log(`Remaining warnings: ${match[1]}`);
  }
} catch (error) {
  // Linter exits with non-zero on warnings, that's expected
}
