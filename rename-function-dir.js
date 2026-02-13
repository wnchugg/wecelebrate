#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, 'supabase', 'functions', 'server');
const newPath = path.join(__dirname, 'supabase', 'functions', 'make-server-6fcaeea3');

console.log('Renaming Edge Function directory...');
console.log(`From: ${oldPath}`);
console.log(`To: ${newPath}`);

try {
  if (fs.existsSync(newPath)) {
    console.log('⚠️  Target directory already exists, removing it first...');
    fs.rmSync(newPath, { recursive: true, force: true });
  }
  
  fs.renameSync(oldPath, newPath);
  console.log('✅ Successfully renamed directory!');
  console.log('\n🎯 Next step: Run deployment script');
  console.log('   ./scripts/deploy-full-stack.sh dev');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
