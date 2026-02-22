#!/usr/bin/env node

/**
 * Analyze explicit `any` type warnings from ESLint output
 * Groups warnings by file and context (function params, return types, variables)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the lint output
const lintFile = path.join(__dirname, '..', 'lint-explicit-any.json');
const lintData = JSON.parse(fs.readFileSync(lintFile, 'utf8'));

// Filter for explicit any warnings
const explicitAnyWarnings = [];
lintData.forEach(file => {
  if (file.messages && file.messages.length > 0) {
    file.messages.forEach(msg => {
      if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
        explicitAnyWarnings.push({
          file: file.filePath,
          line: msg.line,
          column: msg.column,
          message: msg.message
        });
      }
    });
  }
});

console.log(`\n=== Explicit Any Analysis ===`);
console.log(`Total explicit any warnings: ${explicitAnyWarnings.length}\n`);

// Group by file
const byFile = {};
explicitAnyWarnings.forEach(warning => {
  const relativePath = warning.file.replace(process.cwd() + '/', '');
  if (!byFile[relativePath]) {
    byFile[relativePath] = [];
  }
  byFile[relativePath].push(warning);
});

// Sort files by warning count
const sortedFiles = Object.entries(byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20); // Top 20 files

console.log('=== Top 20 Files with Most Explicit Any Warnings ===\n');
sortedFiles.forEach(([file, warnings]) => {
  console.log(`${file}: ${warnings.length} warnings`);
});

// Categorize by context (based on message patterns)
const categories = {
  functionParams: [],
  returnTypes: [],
  variables: [],
  other: []
};

explicitAnyWarnings.forEach(warning => {
  const msg = warning.message.toLowerCase();
  if (msg.includes('parameter') || msg.includes('param')) {
    categories.functionParams.push(warning);
  } else if (msg.includes('return')) {
    categories.returnTypes.push(warning);
  } else if (msg.includes('variable') || msg.includes('const') || msg.includes('let')) {
    categories.variables.push(warning);
  } else {
    categories.other.push(warning);
  }
});

console.log('\n=== Warnings by Context ===\n');
console.log(`Function Parameters: ${categories.functionParams.length}`);
console.log(`Return Types: ${categories.returnTypes.length}`);
console.log(`Variables: ${categories.variables.length}`);
console.log(`Other: ${categories.other.length}`);

// Identify common patterns
console.log('\n=== Sample Warnings by Category ===\n');

console.log('Function Parameters (first 5):');
categories.functionParams.slice(0, 5).forEach(w => {
  const relativePath = w.file.replace(process.cwd() + '/', '');
  console.log(`  ${relativePath}:${w.line} - ${w.message}`);
});

console.log('\nReturn Types (first 5):');
categories.returnTypes.slice(0, 5).forEach(w => {
  const relativePath = w.file.replace(process.cwd() + '/', '');
  console.log(`  ${relativePath}:${w.line} - ${w.message}`);
});

console.log('\nVariables (first 5):');
categories.variables.slice(0, 5).forEach(w => {
  const relativePath = w.file.replace(process.cwd() + '/', '');
  console.log(`  ${relativePath}:${w.line} - ${w.message}`);
});

// Save detailed analysis
const analysis = {
  totalWarnings: explicitAnyWarnings.length,
  byFile: Object.fromEntries(
    Object.entries(byFile).map(([file, warnings]) => [
      file.replace(process.cwd() + '/', ''),
      warnings.length
    ])
  ),
  byContext: {
    functionParams: categories.functionParams.length,
    returnTypes: categories.returnTypes.length,
    variables: categories.variables.length,
    other: categories.other.length
  },
  topFiles: sortedFiles.map(([file, warnings]) => ({
    file: file,
    count: warnings.length
  }))
};

const outputFile = path.join(__dirname, '..', '.kiro', 'specs', 'lint-warnings-cleanup', 'explicit-any-analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

console.log(`\n✅ Detailed analysis saved to: .kiro/specs/lint-warnings-cleanup/explicit-any-analysis.json`);
