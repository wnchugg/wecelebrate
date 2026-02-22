#!/usr/bin/env node

/**
 * Lint Baseline Measurement Script
 * 
 * This script runs ESLint and captures the current warning counts by category.
 * It creates a baseline that can be used to track progress during the lint cleanup.
 * 
 * Usage:
 *   node scripts/lint-baseline.js [--output <file>] [--verbose]
 * 
 * Options:
 *   --output <file>  Write baseline to specified file (default: .kiro/specs/lint-warnings-cleanup/baseline.json)
 *   --verbose        Show detailed output
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
const verboseIndex = args.indexOf('--verbose');
const verbose = verboseIndex !== -1;
if (verbose) args.splice(verboseIndex, 1);

const outputIndex = args.indexOf('--output');
const outputFile = outputIndex !== -1 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : '.kiro/specs/lint-warnings-cleanup/baseline.json';

console.log('🔍 Running ESLint to capture baseline...\n');

let lintOutput;
try {
  // Run ESLint directly with JSON format, ignoring exit code (we expect warnings)
  lintOutput = execSync('npx eslint . --ext ts,tsx --format json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large output
  });
} catch (error) {
  // ESLint exits with non-zero when there are warnings/errors
  // We still want to capture the output
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

// Aggregate warnings by rule
const warningsByRule = {};
let totalWarnings = 0;
let totalErrors = 0;
let totalFiles = 0;

results.forEach(file => {
  if (file.messages.length > 0) {
    totalFiles++;
  }
  
  file.messages.forEach(message => {
    const rule = message.ruleId || 'unknown';
    const severity = message.severity; // 1 = warning, 2 = error
    
    if (!warningsByRule[rule]) {
      warningsByRule[rule] = {
        count: 0,
        severity: severity === 2 ? 'error' : 'warning',
        files: new Set()
      };
    }
    
    warningsByRule[rule].count++;
    warningsByRule[rule].files.add(file.filePath);
    
    if (severity === 2) {
      totalErrors++;
    } else {
      totalWarnings++;
    }
  });
});

// Convert Sets to arrays for JSON serialization
const warningsByRuleArray = Object.entries(warningsByRule)
  .map(([rule, data]) => ({
    rule,
    count: data.count,
    severity: data.severity,
    fileCount: data.files.size
  }))
  .sort((a, b) => b.count - a.count);

const baseline = {
  timestamp: new Date().toISOString(),
  totalWarnings,
  totalErrors,
  totalFiles,
  totalIssues: totalWarnings + totalErrors,
  warningsByRule: warningsByRuleArray,
  categoryCounts: warningsByRuleArray.reduce((acc, item) => {
    acc[item.rule] = item.count;
    return acc;
  }, {})
};

// Ensure output directory exists
mkdirSync(dirname(outputFile), { recursive: true });

// Write baseline to file
writeFileSync(outputFile, JSON.stringify(baseline, null, 2));

console.log('📊 Baseline Summary:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Total Issues:   ${baseline.totalIssues.toLocaleString()}`);
console.log(`  Warnings:     ${totalWarnings.toLocaleString()}`);
console.log(`  Errors:       ${totalErrors.toLocaleString()}`);
console.log(`Files Affected: ${totalFiles.toLocaleString()}`);
console.log(`Rule Categories: ${warningsByRuleArray.length}`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 Top Warning Categories:');
console.log('───────────────────────────────────────────────────────────');
warningsByRuleArray.slice(0, 15).forEach((item, index) => {
  const severity = item.severity === 'error' ? '🔴' : '⚠️';
  console.log(`${(index + 1).toString().padStart(2)}. ${severity} ${item.rule.padEnd(50)} ${item.count.toLocaleString().padStart(6)} (${item.fileCount} files)`);
});

if (warningsByRuleArray.length > 15) {
  console.log(`... and ${warningsByRuleArray.length - 15} more categories`);
}
console.log('───────────────────────────────────────────────────────────\n');

if (verbose) {
  console.log('📄 All Warning Categories:');
  console.log('───────────────────────────────────────────────────────────');
  warningsByRuleArray.forEach((item, index) => {
    const severity = item.severity === 'error' ? '🔴' : '⚠️';
    console.log(`${(index + 1).toString().padStart(2)}. ${severity} ${item.rule.padEnd(50)} ${item.count.toLocaleString().padStart(6)} (${item.fileCount} files)`);
  });
  console.log('───────────────────────────────────────────────────────────\n');
}

console.log(`✅ Baseline saved to: ${outputFile}\n`);
