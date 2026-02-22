#!/usr/bin/env node

/**
 * Script to help fix @typescript-eslint/no-misused-promises warnings
 * 
 * This script identifies files with misused promise warnings and provides
 * guidance on how to fix them.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run lint and get JSON output
console.log('Running linter to find misused promise warnings...\n');

try {
  // Get lint output (will exit with non-zero, so we catch it)
  const output = execSync('npm run lint -- --format json --no-color', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  const results = JSON.parse(output);
  processResults(results);
} catch (error) {
  // ESLint exits with error code when there are warnings
  if (error.stdout) {
    try {
      const results = JSON.parse(error.stdout);
      processResults(results);
    } catch (parseError) {
      console.error('Failed to parse lint output');
      process.exit(1);
    }
  } else {
    console.error('Failed to run linter');
    process.exit(1);
  }
}

function processResults(results) {
  const filesWithIssues = [];
  
  for (const file of results) {
    const misusedPromises = file.messages.filter(
      msg => msg.ruleId === '@typescript-eslint/no-misused-promises'
    );
    
    if (misusedPromises.length > 0) {
      filesWithIssues.push({
        filePath: file.filePath,
        relativePath: file.filePath.replace(process.cwd() + '/', ''),
        warnings: misusedPromises
      });
    }
  }
  
  console.log(`Found ${filesWithIssues.length} files with misused promise warnings\n`);
  console.log('Files to fix:');
  console.log('='.repeat(80));
  
  filesWithIssues.forEach((file, index) => {
    console.log(`\n${index + 1}. ${file.relativePath}`);
    console.log(`   Warnings: ${file.warnings.length}`);
    file.warnings.forEach(warning => {
      console.log(`   - Line ${warning.line}:${warning.column} - ${warning.message}`);
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal files: ${filesWithIssues.length}`);
  console.log(`Total warnings: ${filesWithIssues.reduce((sum, f) => sum + f.warnings.length, 0)}`);
  
  // Write to file for reference
  fs.writeFileSync(
    'misused-promises-files.json',
    JSON.stringify(filesWithIssues, null, 2)
  );
  console.log('\nDetailed output written to: misused-promises-files.json');
}
