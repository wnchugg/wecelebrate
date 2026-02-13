#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Recursively find all .ts and .tsx files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Get the directory of the file to calculate relative paths
  const fileDir = path.dirname(filePath);
  const srcAppDir = path.resolve('./src/app');
  
  // Calculate relative path from file to src/app
  const relativeToSrcApp = path.relative(fileDir, srcAppDir);
  const prefix = relativeToSrcApp || '.';
  
  // Replacement patterns
  const replacements = [
    // UI components (always in same directory or subdirectory)
    [/@\/app\/components\/ui\//g, './ui/'],
    
    // Components (relative to current file)
    [/@\/app\/components\//g, relativeToSrcApp ? `${relativeToSrcApp}/components/` : './components/'],
    
    // Other directories
    [/@\/app\/context\//g, relativeToSrcApp ? `${relativeToSrcApp}/context/` : './context/'],
    [/@\/app\/utils\//g, relativeToSrcApp ? `${relativeToSrcApp}/utils/` : './utils/'],
    [/@\/app\/data\//g, relativeToSrcApp ? `${relativeToSrcApp}/data/` : './data/'],
    [/@\/app\/config\//g, relativeToSrcApp ? `${relativeToSrcApp}/config/` : './config/'],
    [/@\/app\/pages\//g, relativeToSrcApp ? `${relativeToSrcApp}/pages/` : './pages/'],
    [/@\/app\/hooks\//g, relativeToSrcApp ? `${relativeToSrcApp}/hooks/` : './hooks/'],
    [/@\/app\/types\//g, relativeToSrcApp ? `${relativeToSrcApp}/types/` : './types/'],
    [/@\/app\/i18n\//g, relativeToSrcApp ? `${relativeToSrcApp}/i18n/` : './i18n/'],
    [/@\/app\/lib\//g, relativeToSrcApp ? `${relativeToSrcApp}/lib/` : './lib/'],
    [/@\/app\/schemas\//g, relativeToSrcApp ? `${relativeToSrcApp}/schemas/` : './schemas/'],
  ];
  
  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main
console.log('🔧 Fixing @/app/ imports...\n');

const files = findFiles('./src/app');
let fixedCount = 0;

files.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files!`);
console.log('\n🔍 Verifying...');

// Verify no @/app/ imports remain
let remainingImports = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/app/')) {
    console.log(`⚠️  Still has @/app/ imports: ${file}`);
    remainingImports++;
  }
});

if (remainingImports === 0) {
  console.log('✅ All @/app/ imports have been fixed!');
} else {
  console.log(`⚠️  ${remainingImports} files still have @/app/ imports`);
}
