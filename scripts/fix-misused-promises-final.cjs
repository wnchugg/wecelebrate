#!/usr/bin/env node

/**
 * Final pass: Fix all remaining misused promise patterns
 * 
 * Handles:
 * 1. navigate() calls (react-router returns Promise)
 * 2. Any remaining arrow functions with async calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Final pass: Fixing remaining misused promise patterns...\n');

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
  let fixCount = 0;
  
  // Pattern 1: onClick={() => navigate(...)}
  // Fix: onClick={() => void navigate(...)}
  const navigatePattern = /(on[A-Z][a-zA-Z]*)\s*=\s*\{\s*\(\s*\)\s*=>\s*navigate\(/g;
  content = content.replace(navigatePattern, (match, eventName) => {
    if (match.includes('void')) {
      return match;
    }
    fixCount++;
    return `${eventName}={() => void navigate(`;
  });
  
  // Pattern 2: onClick={(e) => navigate(...)}
  const navigateWithParamPattern = /(on[A-Z][a-zA-Z]*)\s*=\s*\{\s*\(([^)]+)\)\s*=>\s*navigate\(/g;
  content = content.replace(navigateWithParamPattern, (match, eventName, params) => {
    if (match.includes('void')) {
      return match;
    }
    fixCount++;
    return `${eventName}={(${params}) => void navigate(`;
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), file)}: Fixed ${fixCount} warning(s)`);
    totalFixed += fixCount;
    filesModified++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n✨ Final pass complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Warnings fixed: ${totalFixed}`);
console.log('\n🔍 Running linter to verify...\n');

try {
  const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
  const misusedPromisesCount = (lintOutput.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  } else {
    console.log(`\n⚠️  ${misusedPromisesCount} warnings remain - may need manual review`);
  }
} catch (error) {
  const output = error.stdout || error.message;
  const misusedPromisesCount = (output.match(/no-misused-promises/g) || []).length;
  console.log(`📊 Remaining misused-promises warnings: ${misusedPromisesCount}`);
  
  if (misusedPromisesCount === 0) {
    console.log('\n🎉 All misused promise warnings fixed!');
  } else {
    console.log(`\n⚠️  ${misusedPromisesCount} warnings remain - may need manual review`);
  }
}
