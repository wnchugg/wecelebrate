#!/usr/bin/env node

/**
 * Lint Validation Script
 * 
 * This script runs ESLint and compares the results against a baseline to verify
 * that warning counts have decreased (or stayed the same) and no new warnings
 * were introduced.
 * 
 * Usage:
 *   node scripts/lint-validate.js [--baseline <file>] [--category <rule>] [--verbose]
 * 
 * Options:
 *   --baseline <file>  Path to baseline file (default: .kiro/specs/lint-warnings-cleanup/baseline.json)
 *   --category <rule>  Only validate specific rule category (e.g., @typescript-eslint/no-explicit-any)
 *   --verbose          Show detailed output
 * 
 * Exit codes:
 *   0 - Validation passed (warnings decreased or stayed same)
 *   1 - Validation failed (warnings increased or new categories introduced)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const verboseIndex = args.indexOf('--verbose');
const verbose = verboseIndex !== -1;
if (verbose) args.splice(verboseIndex, 1);

const baselineIndex = args.indexOf('--baseline');
const baselineFile = baselineIndex !== -1 && args[baselineIndex + 1]
  ? args[baselineIndex + 1]
  : '.kiro/specs/lint-warnings-cleanup/baseline.json';

const categoryIndex = args.indexOf('--category');
const targetCategory = categoryIndex !== -1 && args[categoryIndex + 1]
  ? args[categoryIndex + 1]
  : null;

// Load baseline
if (!existsSync(baselineFile)) {
  console.error(`❌ Baseline file not found: ${baselineFile}`);
  console.error('Run "node scripts/lint-baseline.js" first to create a baseline.');
  process.exit(1);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(baselineFile, 'utf-8'));
} catch (error) {
  console.error(`❌ Failed to parse baseline file: ${baselineFile}`);
  console.error(error.message);
  process.exit(1);
}

console.log('🔍 Running ESLint to validate changes...\n');

let lintOutput;
try {
  lintOutput = execSync('npx eslint . --ext ts,tsx --format json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024
  });
} catch (error) {
  lintOutput = error.stdout || '';
  if (!lintOutput) {
    console.error('❌ Failed to run ESLint');
    console.error(error.message);
    process.exit(1);
  }
}

let results;
try {
  // Clean output - remove any non-JSON content
  const jsonStart = lintOutput.indexOf('[');
  if (jsonStart !== -1) {
    lintOutput = lintOutput.substring(jsonStart);
  }
  results = JSON.parse(lintOutput);
} catch (error) {
  console.error('❌ Failed to parse ESLint output');
  console.error(error.message);
  console.error('Output preview:', lintOutput.substring(0, 200));
  process.exit(1);
}

// Aggregate current warnings by rule
const currentWarnings = {};
let totalWarnings = 0;
let totalErrors = 0;

results.forEach(file => {
  file.messages.forEach(message => {
    const rule = message.ruleId || 'unknown';
    const severity = message.severity;
    
    if (!currentWarnings[rule]) {
      currentWarnings[rule] = {
        count: 0,
        severity: severity === 2 ? 'error' : 'warning'
      };
    }
    
    currentWarnings[rule].count++;
    
    if (severity === 2) {
      totalErrors++;
    } else {
      totalWarnings++;
    }
  });
});

const totalIssues = totalWarnings + totalErrors;

// Compare against baseline
const baselineCounts = baseline.categoryCounts || {};
const improvements = [];
const regressions = [];
const newCategories = [];
const unchanged = [];

// Check if we're validating a specific category
if (targetCategory) {
  const baselineCount = baselineCounts[targetCategory] || 0;
  const currentCount = currentWarnings[targetCategory]?.count || 0;
  
  console.log(`📊 Validation for category: ${targetCategory}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Baseline:  ${baselineCount.toLocaleString()}`);
  console.log(`Current:   ${currentCount.toLocaleString()}`);
  console.log(`Change:    ${(currentCount - baselineCount).toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (currentCount > baselineCount) {
    console.log(`❌ VALIDATION FAILED: ${targetCategory} increased from ${baselineCount} to ${currentCount}`);
    process.exit(1);
  } else if (currentCount < baselineCount) {
    console.log(`✅ VALIDATION PASSED: ${targetCategory} decreased from ${baselineCount} to ${currentCount}`);
    console.log(`   Fixed: ${baselineCount - currentCount} warnings\n`);
  } else {
    console.log(`✅ VALIDATION PASSED: ${targetCategory} unchanged at ${currentCount}\n`);
  }
  
  process.exit(0);
}

// Full validation - check all categories
Object.keys(baselineCounts).forEach(rule => {
  const baselineCount = baselineCounts[rule];
  const currentCount = currentWarnings[rule]?.count || 0;
  const diff = currentCount - baselineCount;
  
  if (diff < 0) {
    improvements.push({ rule, baselineCount, currentCount, diff });
  } else if (diff > 0) {
    regressions.push({ rule, baselineCount, currentCount, diff });
  } else {
    unchanged.push({ rule, count: currentCount });
  }
});

// Check for new warning categories
Object.keys(currentWarnings).forEach(rule => {
  if (!baselineCounts[rule]) {
    newCategories.push({
      rule,
      count: currentWarnings[rule].count
    });
  }
});

// Print results
console.log('📊 Validation Summary:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Baseline Total:    ${baseline.totalIssues.toLocaleString()}`);
console.log(`Current Total:     ${totalIssues.toLocaleString()}`);
console.log(`Net Change:        ${(totalIssues - baseline.totalIssues).toLocaleString()}`);
console.log('═══════════════════════════════════════════════════════════\n');

if (improvements.length > 0) {
  console.log(`✅ Improvements (${improvements.length} categories):`);
  console.log('───────────────────────────────────────────────────────────');
  improvements.forEach(item => {
    console.log(`   ${item.rule.padEnd(50)} ${item.baselineCount.toLocaleString().padStart(6)} → ${item.currentCount.toLocaleString().padStart(6)} (${item.diff})`);
  });
  console.log('');
}

if (regressions.length > 0) {
  console.log(`❌ Regressions (${regressions.length} categories):`);
  console.log('───────────────────────────────────────────────────────────');
  regressions.forEach(item => {
    console.log(`   ${item.rule.padEnd(50)} ${item.baselineCount.toLocaleString().padStart(6)} → ${item.currentCount.toLocaleString().padStart(6)} (+${item.diff})`);
  });
  console.log('');
}

if (newCategories.length > 0) {
  console.log(`⚠️  New Warning Categories (${newCategories.length}):`);
  console.log('───────────────────────────────────────────────────────────');
  newCategories.forEach(item => {
    console.log(`   ${item.rule.padEnd(50)} ${item.count.toLocaleString().padStart(6)} (new)`);
  });
  console.log('');
}

if (verbose && unchanged.length > 0) {
  console.log(`➖ Unchanged (${unchanged.length} categories):`);
  console.log('───────────────────────────────────────────────────────────');
  unchanged.forEach(item => {
    console.log(`   ${item.rule.padEnd(50)} ${item.count.toLocaleString().padStart(6)}`);
  });
  console.log('');
}

// Determine validation result
const hasRegressions = regressions.length > 0 || newCategories.length > 0;
const totalFixed = improvements.reduce((sum, item) => sum + Math.abs(item.diff), 0);

if (hasRegressions) {
  console.log('❌ VALIDATION FAILED');
  console.log('   Warning counts increased or new categories introduced.');
  console.log('   Please review the changes and fix any regressions.\n');
  process.exit(1);
} else if (improvements.length > 0) {
  console.log('✅ VALIDATION PASSED');
  console.log(`   Fixed ${totalFixed} warnings across ${improvements.length} categories.`);
  console.log(`   No regressions detected.\n`);
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('   No changes detected. Warning counts unchanged.\n');
  process.exit(0);
}
