#!/usr/bin/env node

/**
 * Fix Regex Issues in security.ts
 * Fixes three double-backslash regex patterns
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol}${colors.reset} ${message}`);
}

console.log('');
console.log(`${colors.blue}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}   Fix security.ts Regex Issues${colors.reset}`);
console.log(`${colors.blue}════════════════════════════════════════${colors.reset}`);
console.log('');

const filePath = path.join(__dirname, '..', 'supabase', 'functions', 'server', 'security.ts');

// Check if file exists
if (!fs.existsSync(filePath)) {
  log('red', '✗', `Error: ${filePath} not found!`);
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Create backup
const backupPath = `${filePath}.backup.${Date.now()}`;
fs.writeFileSync(backupPath, content, 'utf8');
log('green', '✓', `Backup created: ${path.basename(backupPath)}`);
console.log('');

// Count issues before
const issuesBefore = (content.match(/\\\\w|\\\\D|\\\\\./g) || []).length;
log('yellow', '→', `Found ${issuesBefore} regex issues with double backslashes`);
console.log('');

// Fix 1: String sanitization - on\\w+= should be on\w+=
log('yellow', '→', 'Fixing: .replace(/on\\\\w+=/gi, \'\') → .replace(/on\\w+=/gi, \'\')');
content = content.replace(/\/on\\\\w\+=/g, '/on\\w+=/');

// Fix 2: Email validation - \\. should be \.
log('yellow', '→', 'Fixing: Email regex \\\\. → \\.');
content = content.replace(/\\\\\\\./g, '\\.');

// Fix 3: Phone validation - \\D should be \D
log('yellow', '→', 'Fixing: .replace(/\\\\D/g, \'\') → .replace(/\\D/g, \'\')');
content = content.replace(/\/\\\\\\\\D\//g, '/\\D/');

console.log('');

// Write the fixed content
fs.writeFileSync(filePath, content, 'utf8');

// Count issues after
const issuesAfter = (content.match(/\\\\w|\\\\D|\\\\\./g) || []).length;

if (issuesAfter === 0) {
  log('green', '✓', 'All regex issues fixed!');
  console.log('');
  console.log('Changes made:');
  console.log('  - Fixed on\\w+= pattern in string sanitization');
  console.log('  - Fixed \\. pattern in email validation');
  console.log('  - Fixed \\D pattern in phone validation');
  console.log('');
  console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}   Success! Ready to redeploy${colors.reset}`);
  console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Deploy to dev: ./scripts/redeploy-backend.sh dev');
  console.log('  2. Test login at: http://localhost:5173/admin/login');
  console.log('');
  console.log('To restore backup if needed:');
  console.log(`  cp ${backupPath} ${filePath}`);
  console.log('');
} else {
  log('red', '✗', `Warning: ${issuesAfter} issues still remain`);
  console.log('');
  
  // Show remaining issues
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (/\\\\w|\\\\D|\\\\./.test(line)) {
      console.log(`  Line ${index + 1}: ${line.trim()}`);
    }
  });
  
  console.log('');
  console.log('You can restore the backup if needed:');
  console.log(`  cp ${backupPath} ${filePath}`);
  process.exit(1);
}
