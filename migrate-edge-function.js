#!/usr/bin/env node

/**
 * Migration Script: Rename Edge Function Directory
 * From: /supabase/functions/server
 * To: /supabase/functions/make-server-6fcaeea3
 * 
 * Also removes "/make-server-6fcaeea3" prefix from all routes
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'supabase', 'functions', 'server');
const DEST_DIR = path.join(process.cwd(), 'supabase', 'functions', 'make-server-6fcaeea3');

console.log('🔧 Edge Function Migration Script');
console.log('=' .repeat(50));
console.log('');
console.log(`Source:      ${SRC_DIR}`);
console.log(`Destination: ${DEST_DIR}`);
console.log('');

// Step 1: Create destination directory
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
  console.log('✓ Created destination directory');
} else {
  console.log('! Destination directory already exists');
}

// Step 2: Read all files from source
const files = fs.readdirSync(SRC_DIR, { withFileTypes: true });

let filesProcessed = 0;
let routesUpdated = 0;

files.forEach(file => {
  const srcPath = path.join(SRC_DIR, file.name);
  const destPath = path.join(DEST_DIR, file.name);
  
  if (file.isDirectory()) {
    // Recursively copy directories
    if (file.name === 'tests') {
      fs.mkdirSync(destPath, { recursive: true });
      const testFiles = fs.readdirSync(srcPath);
      testFiles.forEach(testFile => {
        fs.copyFileSync(
          path.join(srcPath, testFile),
          path.join(destPath, testFile)
        );
      });
      console.log(`✓ Copied directory: ${file.name}/`);
    }
  } else {
    // Process file
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Special handling for index.tsx - remove route prefixes
    if (file.name === 'index.tsx' || file.name === 'index.ts') {
      const originalContent = content;
      
      // Replace route prefixes
      content = content.replace(/["']\/make-server-6fcaeea3\//g, '"/');
      
      // Count how many routes were updated
      const matches = originalContent.match(/["']\/make-server-6fcaeea3\//g);
      if (matches) {
        routesUpdated = matches.length;
      }
      
      console.log(`✓ Updated ${routesUpdated} route prefixes in ${file.name}`);
    }
    
    // Write to destination
    fs.writeFileSync(destPath, content, 'utf8');
    filesProcessed++;
  }
});

console.log('');
console.log('=' .repeat(50));
console.log('✅ Migration Complete!');
console.log('');
console.log(`Files copied: ${filesProcessed}`);
console.log(`Routes updated: ${routesUpdated}`);
console.log('');
console.log('Next steps:');
console.log('1. Review the new directory');
console.log('2. Test deployment: ./scripts/deploy-full-stack.sh dev');
console.log('3. Delete old directory: rm -rf supabase/functions/server');
console.log('');
