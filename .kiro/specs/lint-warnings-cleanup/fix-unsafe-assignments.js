#!/usr/bin/env node

/**
 * Automated fix script for @typescript-eslint/no-unsafe-assignment warnings
 * 
 * This script identifies and fixes common patterns:
 * 1. JSON.parse() assignments - add type annotation
 * 2. Array destructuring from any[] - add type annotations
 * 3. Direct assignments from any - add type assertions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with unsafe assignment warnings
function getFilesWithWarnings() {
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const lines = output.split('\n');
    
    const files = new Set();
    let currentFile = null;
    
    for (const line of lines) {
      // Match file paths
      if (line.match(/^\/.*\.(ts|tsx)$/)) {
        currentFile = line.trim();
      }
      // Match unsafe assignment warnings
      else if (line.includes('@typescript-eslint/no-unsafe-assignment') && currentFile) {
        // Extract relative path
        const match = currentFile.match(/jala2-app\/(.*)/);
        if (match) {
          files.add(match[1]);
        }
      }
    }
    
    return Array.from(files);
  } catch (error) {
    console.error('Error getting files with warnings:', error.message);
    return [];
  }
}

// Fix JSON.parse assignments
function fixJsonParseAssignments(content) {
  let modified = false;
  
  // Pattern: let/const variable = JSON.parse(...)
  // Fix: let/const variable: unknown = JSON.parse(...) as unknown
  const jsonParsePattern = /(let|const)\s+(\w+)\s*=\s*JSON\.parse\(/g;
  
  if (content.match(jsonParsePattern)) {
    content = content.replace(
      /(let|const)\s+(\w+)\s*=\s*JSON\.parse\(/g,
      (match, keyword, varName) => {
        modified = true;
        return `${keyword} ${varName}: unknown = JSON.parse(`;
      }
    );
    
    // Add 'as unknown' after the closing parenthesis if not already there
    content = content.replace(
      /JSON\.parse\(([^)]+)\)(?!\s+as\s+unknown)/g,
      (match) => {
        if (!match.includes(' as unknown')) {
          modified = true;
          return match + ' as unknown';
        }
        return match;
      }
    );
  }
  
  return { content, modified };
}

// Fix array destructuring from useState, Promise.all, etc.
function fixArrayDestructuring(content) {
  let modified = false;
  
  // Pattern: const [a, b] = someFunction()
  // This is tricky because we need context to know the right type
  // For now, we'll skip this and handle manually
  
  return { content, modified };
}

// Process a single file
function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf-8');
    let totalModified = false;
    
    // Apply fixes
    let result = fixJsonParseAssignments(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    result = fixArrayDestructuring(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    // Write back if modified
    if (totalModified) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('Finding files with unsafe assignment warnings...\n');
  
  const files = getFilesWithWarnings();
  console.log(`Found ${files.length} files with warnings\n`);
  
  if (files.length === 0) {
    console.log('No files to process!');
    return;
  }
  
  console.log('Processing files...\n');
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✓ Processed ${files.length} files, fixed ${fixedCount} files`);
  console.log('\nRun "npm run lint" to see remaining warnings');
}

main();
