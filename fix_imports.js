const fs = require('fs');
const path = require('path');

/**
 * Fix @/app/ import paths to relative paths for Figma Make compatibility
 */

const replacements = [
  // UI components
  { from: /@\/app\/components\/ui\//g, to: './ui/' },
  // Components (general)
  { from: /@\/app\/components\//g, to: './' },
  // Context
  { from: /@\/app\/context\//g, to: '../context/' },
  // Utils
  { from: /@\/app\/utils\//g, to: '../utils/' },
  // Data
  { from: /@\/app\/data\//g, to: '../data/' },
  // Config
  { from: /@\/app\/config\//g, to: '../config/' },
  // Pages
  { from: /@\/app\/pages\//g, to: '../pages/' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const { from, to } of replacements) {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log('🔧 Fixing import paths for Figma Make...\n');

const directories = [
  'src/app/components',
  'src/app/pages',
  'src/app/context',
  'src/app/utils',
];

let totalFixed = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processing ${dir}...`);
    const files = walkDir(dir);
    
    for (const file of files) {
      if (fixFile(file)) {
        totalFixed++;
      }
    }
  }
}

console.log(`\n✅ Complete! Fixed ${totalFixed} files.`);
