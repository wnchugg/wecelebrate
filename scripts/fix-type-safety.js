#!/usr/bin/env node

/**
 * Production Hardening: Fix Unsafe Type Operations
 * 
 * This script adds proper type annotations to common patterns
 * that trigger no-unsafe-* ESLint errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Production Hardening: Fixing Unsafe Type Operations');
console.log('======================================================');
console.log('');

let filesFixed = 0;
let issuesFixed = 0;

// Patterns to fix
const fixes = [
  {
    name: 'API Response Types',
    pattern: /const\s+response\s*=\s*await\s+(\w+)\.json\(\)/g,
    replacement: 'const response = await $1.json() as Record<string, unknown>',
    description: 'Add type assertion to JSON parsing'
  },
  {
    name: 'Error Handling',
    pattern: /catch\s*\(error\)/g,
    replacement: 'catch (error: unknown)',
    description: 'Type catch errors as unknown'
  },
  {
    name: 'Event Handlers',
    pattern: /\(e\)\s*=>/g,
    replacement: '(e: React.MouseEvent | React.FormEvent) =>',
    description: 'Type event handlers properly'
  },
  {
    name: 'Object Property Access',
    pattern: /data\[(\w+)\]/g,
    replacement: '(data as Record<string, unknown>)[$1]',
    description: 'Add type assertion for dynamic property access'
  }
];

// Process file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileIssues = 0;

  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches && matches.length > 0) {
      content = content.replace(fix.pattern, fix.replacement);
      fileIssues += matches.length;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    issuesFixed += fileIssues;
    console.log(`   ✅ ${path.basename(filePath)} - Fixed ${fileIssues} issues`);
  }
}

// Recursively process directory
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, dist, build
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      processFile(fullPath);
    }
  }
}

// Create backup
const backupDir = `./backups/type-safety-fix-${Date.now()}`;
console.log('💾 Creating backup...');
fs.mkdirSync(backupDir, { recursive: true });
fs.cpSync('./src', path.join(backupDir, 'src'), { recursive: true });
console.log(`   ✅ Backup created: ${backupDir}`);
console.log('');

// Process files
console.log('🔨 Processing files...');
processDirectory('./src');
console.log('');

// Summary
console.log('📊 Summary:');
console.log(`   - Files modified: ${filesFixed}`);
console.log(`   - Issues fixed: ${issuesFixed}`);
console.log('');

if (filesFixed > 0) {
  console.log('✅ Type safety improvements applied!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Review changes: git diff src');
  console.log('   2. Run type check: npm run type-check');
  console.log('   3. Run linter: npm run lint');
  console.log('   4. Test the app: npm run dev');
} else {
  console.log('ℹ️  No automatic fixes available');
  console.log('   Manual review required for remaining type issues');
}
console.log('');
