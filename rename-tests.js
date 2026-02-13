#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔄 Renaming test files...\n');

const testDir = path.join(__dirname, 'src', 'app', 'utils', '__tests__');

// File pairs to rename
const files = [
  { from: 'security.test.optimized.ts', to: 'security.test.ts' },
  { from: 'validators.test.optimized.ts', to: 'validators.test.ts' }
];

files.forEach(({ from, to }) => {
  const fromPath = path.join(testDir, from);
  const toPath = path.join(testDir, to);
  
  if (fs.existsSync(fromPath)) {
    console.log(`📝 Copying: ${from} → ${to}`);
    const content = fs.readFileSync(fromPath, 'utf8');
    fs.writeFileSync(toPath, content, 'utf8');
    console.log(`✅ Created: ${to}`);
    
    console.log(`🗑️  Deleting: ${from}`);
    fs.unlinkSync(fromPath);
    console.log(`✅ Deleted: ${from}\n`);
  } else {
    console.log(`⚠️  File not found: ${from}\n`);
  }
});

console.log('🎉 Renaming complete!');
console.log('\n📋 Verifying files...');
const testFiles = fs.readdirSync(testDir);
console.log('Test files in directory:');
testFiles.forEach(f => console.log(`  - ${f}`));
