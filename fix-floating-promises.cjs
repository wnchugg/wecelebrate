#!/usr/bin/env node

/**
 * Script to automatically fix floating promise warnings
 * by adding the void operator to fire-and-forget promises
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to fix - these are fire-and-forget promises that should have void operator
const patterns = [
  // navigate() calls
  { regex: /^(\s+)navigate\(/gm, replacement: '$1void navigate(' },
  // checkConnection() calls
  { regex: /^(\s+)checkConnection\(/gm, replacement: '$1void checkConnection(' },
  // fetchData() calls
  { regex: /^(\s+)fetchData\(/gm, replacement: '$1void fetchData(' },
  // loadData() calls
  { regex: /^(\s+)loadData\(/gm, replacement: '$1void loadData(' },
  // initialize() calls
  { regex: /^(\s+)initialize\(/gm, replacement: '$1void initialize(' },
  // clipboard.writeText() calls
  { regex: /^(\s+)navigator\.clipboard\.writeText\(/gm, replacement: '$1void navigator.clipboard.writeText(' },
  // toast.promise() calls
  { regex: /^(\s+)toast\.promise\(/gm, replacement: '$1void toast.promise(' },
  // loadOrder() calls
  { regex: /^(\s+)loadOrder\(/gm, replacement: '$1void loadOrder(' },
  // loadGift() calls
  { regex: /^(\s+)loadGift\(/gm, replacement: '$1void loadGift(' },
  // loadClient() calls
  { regex: /^(\s+)loadClient\(/gm, replacement: '$1void loadClient(' },
  // loadSite() calls
  { regex: /^(\s+)loadSite\(/gm, replacement: '$1void loadSite(' },
  // loadCatalog() calls
  { regex: /^(\s+)loadCatalog\(/gm, replacement: '$1void loadCatalog(' },
  // refreshData() calls
  { regex: /^(\s+)refreshData\(/gm, replacement: '$1void refreshData(' },
  // handleRefresh() calls
  { regex: /^(\s+)handleRefresh\(/gm, replacement: '$1void handleRefresh(' },
  // handleSave() calls
  { regex: /^(\s+)handleSave\(/gm, replacement: '$1void handleSave(' },
  // handleDelete() calls
  { regex: /^(\s+)handleDelete\(/gm, replacement: '$1void handleDelete(' },
  // handleUpdate() calls
  { regex: /^(\s+)handleUpdate\(/gm, replacement: '$1void handleUpdate(' },
];

function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Skip node_modules, dist, build, etc.
      if (!['node_modules', 'dist', 'build', '.git', 'e2e', 'tests'].includes(item.name)) {
        files.push(...findTsxFiles(fullPath));
      }
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const pattern of patterns) {
    const newContent = content.replace(pattern.regex, (match, indent, ...args) => {
      // Check if this is a method declaration (has ): after the function call)
      const offset = args[args.length - 2]; // offset in the string
      const restOfLine = content.substring(offset + match.length, offset + match.length + 10);
      
      // Skip if it looks like a method declaration (followed by ): or (){)
      if (restOfLine.match(/^\):\s*(void|Promise|string|number|boolean|any)/)) {
        return match; // Don't modify method declarations
      }
      
      return pattern.replacement.replace('$1', indent);
    });
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
console.log('Finding TypeScript files...');
const files = findTsxFiles('src/app');
console.log(`Found ${files.length} files`);

console.log('\nFixing floating promises...');
let fixedCount = 0;

for (const file of files) {
  if (fixFile(file)) {
    fixedCount++;
    console.log(`✓ Fixed: ${file}`);
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('\nRun "npm run lint" to check remaining issues.');
