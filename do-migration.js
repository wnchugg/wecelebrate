import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Edge Function Migration...\n');

const BASE = __dirname;
const SRC = path.join(BASE, 'supabase/functions/server');
const DEST = path.join(BASE, 'supabase/functions/make-server-6fcaeea3');

// Create destination directory
if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST, { recursive: true });
  console.log(`✓ Created: ${DEST}\n`);
}

// Read all files
const files = fs.readdirSync(SRC);
let routesFixed = 0;

files.forEach(file => {
  const srcPath = path.join(SRC, file);
  const destPath = path.join(DEST, file);
  
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    // Copy directory recursively
    fs.mkdirSync(destPath, { recursive: true });
    const subFiles = fs.readdirSync(srcPath);
    subFiles.forEach(subFile => {
      fs.copyFileSync(
        path.join(srcPath, subFile),
        path.join(destPath, subFile)
      );
    });
    console.log(`✓ Copied dir: ${file}/`);
  } else {
    // Read file
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Fix routes in index.tsx
    if (file === 'index.tsx') {
      const before = content.match(/["']\/make-server-6fcaeea3\//g);
      content = content.replace(/["']\/make-server-6fcaeea3\//g, '"/');
      const after = content.match(/["']\/make-server-6fcaeea3\//g);
      routesFixed = before ? before.length : 0;
    }
    
    // Write to destination
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`✓ Copied: ${file}`);
  }
});

console.log(`\n✅ Migration Complete!`);
console.log(`\n📊 Summary:`);
console.log(`   - Files copied: ${files.length}`);
console.log(`   - Routes fixed: ${routesFixed}`);
console.log(`\n📁 New location: /supabase/functions/make-server-6fcaeea3/`);
console.log(`\n🎯 Next: Deploy with ./scripts/deploy-full-stack.sh dev`);