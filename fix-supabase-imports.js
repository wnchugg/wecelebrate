#!/usr/bin/env node
/**
 * Script to fix all imports from absolute to relative paths
 * for /utils/supabase/info
 */

const fs = require('fs');
const path = require('path');

// Map of file paths to their correct relative import path
const fixes = [
  // components/admin/*.tsx → ../../../../utils/supabase/info
  { file: '/src/app/components/admin/JWTDiagnosticBanner.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/components/admin/HRISIntegrationTab.tsx', relativePath: '../../../../utils/supabase/info' },
  
  // components/*.tsx → ../../../utils/supabase/info
  { file: '/src/app/components/BackendTroubleshootingPanel.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/components/SiteLoaderWrapper.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/components/RichTextEditor.tsx', relativePath: '../../../utils/supabase/info' },
  
  // pages/admin/*.tsx → ../../../utils/supabase/info
  { file: '/src/app/pages/admin/AdminUserManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/ConnectionTest.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/DataDiagnostic.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/AdminSignup.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/BootstrapAdmin.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/DeploymentChecklist.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/AdminHelper.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/AdminDebug.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/AdminLoginDebug.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/RoleManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/AccessGroupManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/LoginDiagnostic.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/QuickAuthCheck.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/SitesDiagnostic.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/WebhookManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/ScheduledEmailManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/ScheduledTriggersManagement.tsx', relativePath: '../../../../utils/supabase/info' },
  { file: '/src/app/pages/admin/DeveloperTools.tsx', relativePath: '../../../../utils/supabase/info' },
  
  // pages/*.tsx → ../../../utils/supabase/info
  { file: '/src/app/pages/InitialSeed.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/Welcome.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/CelebrationCreate.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/JWTDebug.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/QuickDiagnostic.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/CelebrationTest.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/AuthDiagnostic.tsx', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/pages/ClientPortal.tsx', relativePath: '../../../utils/supabase/info' },
  
  // utils/*.ts → ../../../utils/supabase/info
  { file: '/src/app/utils/api.ts', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/utils/storage.ts', relativePath: '../../../utils/supabase/info' },
  
  // config/*.ts → ../../../utils/supabase/info
  { file: '/src/app/config/environments.ts', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/config/deploymentEnvironments.ts', relativePath: '../../../utils/supabase/info' },
  
  // lib/*.ts → ../../../utils/supabase/info
  { file: '/src/app/lib/apiClient.ts', relativePath: '../../../utils/supabase/info' },
  
  // services/*.ts → ../../../utils/supabase/info
  { file: '/src/app/services/emailTemplateApi.ts', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/services/automationApi.ts', relativePath: '../../../utils/supabase/info' },
  { file: '/src/app/services/catalogApi.ts', relativePath: '../../../utils/supabase/info' },
];

console.log('🔄 Fixing imports from absolute to relative paths...\n');

let successCount = 0;
let errorCount = 0;

fixes.forEach(({ file, relativePath }) => {
  const fullPath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all variants of the import
    const patterns = [
      { from: "from '/utils/supabase/info'", to: `from '${relativePath}'` },
      { from: 'from "/utils/supabase/info"', to: `from '${relativePath}'` },
    ];
    
    let changed = false;
    patterns.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      successCount++;
    } else {
      console.log(`⏭️  Skipped (already fixed): ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${successCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`\n🎉 Done!`);
