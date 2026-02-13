#!/usr/bin/env node
/**
 * File Rename Utility - Creates properly named test files
 * This script reads the .optimized.ts files and creates standard .test.ts versions
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'src', 'app', 'utils', '__tests__');

const files = [
  {
    source: path.join(testDir, 'security.test.optimized.ts'),
    target: path.join(testDir, 'security.test.ts')
  },
  {
    source: path.join(testDir, 'validators.test.optimized.ts'),
    target: path.join(testDir, 'validators.test.ts')
  }
];

console.log('📁 Reading and renaming test files...\n');

files.forEach(({ source, target }) => {
  const sourceName = path.basename(source);
  const targetName = path.basename(target);
  
  if (!fs.existsSync(source)) {
    console.error(`❌ Source not found: ${sourceName}`);
    return;
  }
  
  console.log(`📖 Reading: ${sourceName}`);
  const content = fs.readFileSync(source, 'utf8');
  
  console.log(`✍️  Writing: ${targetName}`);
  fs.writeFileSync(target, content, 'utf8');
  
  console.log(`🗑️  Removing: ${sourceName}`);
  fs.unlinkSync(source);
  
  console.log(`✅ ${sourceName} → ${targetName}\n`);
});

console.log('🎉 All files renamed successfully!');
console.log('\n📋 Current test files:');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));
testFiles.forEach(f => console.log(`  - ${f}`));

console.log('\n✅ Ready to test! Figma Make will auto-compile these files.');
