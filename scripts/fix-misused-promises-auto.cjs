#!/usr/bin/env node

/**
 * Automated script to fix @typescript-eslint/no-misused-promises warnings
 * 
 * This script finds async functions passed directly to event handlers and wraps them
 * with the void operator: onClick={asyncFunc} -> onClick={() => void asyncFunc()}
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding files with misused promise warnings...\n');

// Get all TypeScript/TSX files in src
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

const files = getAllFiles('src');
console.log(`📁 Found ${files.length} TypeScript files\n`);

let totalFixed = 0;
let filesModified = 0;

// Pattern to match: event handler with direct function reference
// Matches: onClick={functionName}, onChange={functionName}, onSubmit={functionName}, etc.
// But NOT: onClick={() => ...}, onClick={(e) => ...}, onClick={function() {...}}
const eventHandlerPattern = /\b(on[A-Z][a-zA-Z]*)\s*=\s*\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Find all async function names in the file
  const asyncFunctions = new Set();
  
  // Match: const funcName = async
  const asyncConstPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*async/g;
  let match;
  while ((match = asyncConstPattern.exec(content)) !== null) {
    asyncFunctions.add(match[1]);
  }
  
  // Match: async function funcName
  const asyncFunctionPattern = /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = asyncFunctionPattern.exec(content)) !== null) {
    asyncFunctions.add(match[1]);
  }
  
  if (asyncFunctions.size === 0) {
    return; // No async functions in this file
  }
  
  // Now find event handlers that use these async functions
  let fixCount = 0;
  content = content.replace(eventHandlerPattern, (fullMatch, eventName, funcName) => {
    if (asyncFunctions.has(funcName)) {
      fixCount++;
      // Wrap with arrow function and void operator
      return `${eventName}={() => void ${funcName}()}`;
    }
    return fullMatch;
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), file)}: Fixed ${fixCount} warning(s)`);
    totalFixed += fixCount;
    filesModified++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n✨ Complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Warnings fixed: ${totalFixed}`);
console.log('\n🔍 Running linter to verify...\n');

// Run linter to check remaining warnings
try {
  const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
  const misusedPromisesCount = (lintOutput.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  } else {
    console.log('\n⚠️  Some warnings remain. They may require manual review.');
  }
} catch (error) {
  // Linter exits with error code when there are warnings, which is expected
  const output = error.stdout || error.message;
  const misusedPromisesCount = (output.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  } else {
    console.log('\n⚠️  Some warnings remain. They may require manual review.');
  }
}
