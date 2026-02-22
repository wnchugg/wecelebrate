#!/usr/bin/env node

/**
 * Phase 2: Fix more complex misused promise patterns
 * 
 * Handles:
 * 1. Arrow functions with parameters: onClick={(e) => asyncFunc(e)}
 * 2. Inline arrow functions: onClick={async () => {...}}
 * 3. Functions passed to callbacks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Phase 2: Finding remaining misused promise patterns...\n');

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
let totalFixed = 0;
let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Find all async function names
  const asyncFunctions = new Set();
  
  const asyncConstPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*async/g;
  let match;
  while ((match = asyncConstPattern.exec(content)) !== null) {
    asyncFunctions.add(match[1]);
  }
  
  const asyncFunctionPattern = /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = asyncFunctionPattern.exec(content)) !== null) {
    asyncFunctions.add(match[1]);
  }
  
  if (asyncFunctions.size === 0) {
    return;
  }
  
  let fixCount = 0;
  
  // Pattern 1: Arrow functions with parameters calling async functions
  // onClick={(e) => asyncFunc(e)} -> onClick={(e) => void asyncFunc(e)}
  // onClick={(e) => asyncFunc()} -> onClick={(e) => void asyncFunc()}
  asyncFunctions.forEach(funcName => {
    const arrowPattern = new RegExp(
      `(on[A-Z][a-zA-Z]*)\\s*=\\s*\\{\\s*\\(([^)]*)\\)\\s*=>\\s*${funcName}\\(([^)]*)\\)\\s*\\}`,
      'g'
    );
    
    content = content.replace(arrowPattern, (fullMatch, eventName, params, args) => {
      // Check if it's already wrapped with void
      if (fullMatch.includes('void')) {
        return fullMatch;
      }
      fixCount++;
      return `${eventName}={(${params}) => void ${funcName}(${args})}`;
    });
  });
  
  // Pattern 2: Arrow functions without parameters calling async functions
  // onClick={() => asyncFunc()} -> onClick={() => void asyncFunc()}
  asyncFunctions.forEach(funcName => {
    const arrowNoParamsPattern = new RegExp(
      `(on[A-Z][a-zA-Z]*)\\s*=\\s*\\{\\s*\\(\\)\\s*=>\\s*${funcName}\\(([^)]*)\\)\\s*\\}`,
      'g'
    );
    
    content = content.replace(arrowNoParamsPattern, (fullMatch, eventName, args) => {
      // Check if it's already wrapped with void
      if (fullMatch.includes('void')) {
        return fullMatch;
      }
      fixCount++;
      return `${eventName}={() => void ${funcName}(${args})}`;
    });
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), file)}: Fixed ${fixCount} warning(s)`);
    totalFixed += fixCount;
    filesModified++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n✨ Phase 2 Complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Warnings fixed: ${totalFixed}`);
console.log('\n🔍 Running linter to verify...\n');

try {
  const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
  const misusedPromisesCount = (lintOutput.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  }
} catch (error) {
  const output = error.stdout || error.message;
  const misusedPromisesCount = (output.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  }
}
