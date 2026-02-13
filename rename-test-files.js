#!/usr/bin/env node
/**
 * Simple script to rename optimized test files to their final names
 * Run with: node rename-test-files.js
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'src', 'app', 'utils', '__tests__');

const files = [
  {
    from: 'security.test.optimized.ts',
    to: 'security.test.ts'
  },
  {
    from: 'validators.test.optimized.ts',
    to: 'validators.test.ts'
  }
];

console.log('🔄 Renaming Day 1 test files...\n');

files.forEach(({ from, to }) => {
  const fromPath = path.join(testDir, from);
  const toPath = path.join(testDir, to);
  
  if (!fs.existsSync(fromPath)) {
    console.error(`❌ Error: ${from} not found`);
    process.exit(1);
  }
  
  console.log(`📝 Renaming ${from} → ${to}`);
  fs.renameSync(fromPath, toPath);
});

console.log('\n✅ Files renamed successfully!');
console.log('\n📋 Final test files:');
console.log(fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts')).join('\n'));

console.log('\n✅ Done! Now run:');
console.log('npm test -- src/app/utils/__tests__/');
