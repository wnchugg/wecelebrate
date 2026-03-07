#!/usr/bin/env node

/**
 * Analyze unsafe assignment warnings by file
 */

import { execSync } from 'child_process';

try {
  const output = execSync('npm run lint 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  
  const lines = output.split('\n');
  const fileWarnings = new Map();
  let currentFile = '';
  
  for (const line of lines) {
    // Match file path lines (e.g., "/path/to/file.ts")
    if (line.match(/^[/~]/)) {
      currentFile = line.trim();
    }
    // Match warning lines with no-unsafe-assignment
    else if (line.includes('@typescript-eslint/no-unsafe-assignment') && currentFile) {
      const count = fileWarnings.get(currentFile) || 0;
      fileWarnings.set(currentFile, count + 1);
    }
  }
  
  // Sort by count descending
  const sorted = Array.from(fileWarnings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  console.log('\nTop 30 files with @typescript-eslint/no-unsafe-assignment warnings:\n');
  console.log('Count | File');
  console.log('------|-----');
  
  for (const [file, count] of sorted) {
    const shortPath = file.replace(process.cwd(), '').replace(/^\//, '');
    console.log(`${count.toString().padStart(5)} | ${shortPath}`);
  }
  
  const total = Array.from(fileWarnings.values()).reduce((sum, count) => sum + count, 0);
  console.log(`\nTotal: ${total} warnings across ${fileWarnings.size} files`);
  
} catch (error) {
  // Expected - linter exits with non-zero on warnings
}
