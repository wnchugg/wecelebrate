#!/usr/bin/env node
/**
 * COMPLETE FIX FOR ALL SUPABASE INFO IMPORTS
 * 
 * This script fixes all absolute imports to relative imports for /utils/supabase/info
 * across the entire project.
 */

const fs = require('fs');
const path = require('path');

// Comprehensive mapping of all files and their correct relative paths
const fixes = {
  // Components (3 levels up: components -> app -> src, then root -> utils/supabase)
  '/src/app/components/BackendTroubleshootingPanel.tsx': '../../../utils/supabase/info',
  '/src/app/components/SiteLoaderWrapper.tsx': '../../../utils/supabase/info',
  '/src/app/components/RichTextEditor.tsx': '../../../utils/supabase/info',
  '/src/app/components/BackendConnectionStatus.tsx': '../../../utils/supabase/info',
  '/src/app/components/BackendConnectionDiagnostic.tsx': '../../../utils/supabase/info',
  
  // Components/admin (4 levels up)
  '/src/app/components/admin/JWTDiagnosticBanner.tsx': '../../../../utils/supabase/info',
  '/src/app/components/admin/HRISIntegrationTab.tsx': '../../../../utils/supabase/info',
  
  // Pages (3 levels up: pages -> app -> src, then root -> utils/supabase)
  '/src/app/pages/InitialSeed.tsx': '../../../utils/supabase/info',
  '/src/app/pages/Welcome.tsx': '../../../utils/supabase/info',
  '/src/app/pages/CelebrationCreate.tsx': '../../../utils/supabase/info',
  '/src/app/pages/JWTDebug.tsx': '../../../utils/supabase/info',
  '/src/app/pages/QuickDiagnostic.tsx': '../../../utils/supabase/info',
  '/src/app/pages/CelebrationTest.tsx': '../../../utils/supabase/info',
  '/src/app/pages/AuthDiagnostic.tsx': '../../../utils/supabase/info',
  '/src/app/pages/ClientPortal.tsx': '../../../utils/supabase/info',
  
  // Pages/admin (4 levels up)
  '/src/app/pages/admin/AdminUserManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/ConnectionTest.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/DataDiagnostic.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/AdminSignup.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/BootstrapAdmin.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/DeploymentChecklist.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/AdminHelper.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/AdminDebug.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/AdminLoginDebug.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/RoleManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/AccessGroupManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/LoginDiagnostic.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/QuickAuthCheck.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/SitesDiagnostic.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/WebhookManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/ScheduledEmailManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/ScheduledTriggersManagement.tsx': '../../../../utils/supabase/info',
  '/src/app/pages/admin/DeveloperTools.tsx': '../../../../utils/supabase/info',
  
  // Utils (3 levels up: utils -> app -> src, then root -> utils/supabase)
  '/src/app/utils/api.ts': '../../../utils/supabase/info',
  '/src/app/utils/storage.ts': '../../../utils/supabase/info',
  
  // Config (3 levels up)
  '/src/app/config/environments.ts': '../../../utils/supabase/info',
  '/src/app/config/deploymentEnvironments.ts': '../../../utils/supabase/info',
  
  // Lib (3 levels up)
  '/src/app/lib/apiClient.ts': '../../../utils/supabase/info',
  
  // Services (3 levels up)
  '/src/app/services/emailTemplateApi.ts': '../../../utils/supabase/info',
  '/src/app/services/automationApi.ts': '../../../utils/supabase/info',
  '/src/app/services/catalogApi.ts': '../../../utils/supabase/info',
};

console.log('🔄 Fixing Supabase info imports...\n');
console.log(`📂 Total files to fix: ${Object.keys(fixes).length}\n`);

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

Object.entries(fixes).forEach(([file, relativePath]) => {
  const fullPath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipped (not found): ${file}`);
      skippedCount++;
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file already has the correct import
    if (content.includes(`from '${relativePath}'`) || content.includes(`from "${relativePath}"`)) {
      console.log(`✅ Already fixed: ${file}`);
      skippedCount++;
      return;
    }
    
    // Check if file has the wrong import
    if (!content.includes("from '/utils/supabase/info'") && !content.includes('from "/utils/supabase/info"')) {
      console.log(`⏭️  Skipped (no import): ${file}`);
      skippedCount++;
      return;
    }
    
    // Replace absolute paths with relative paths
    content = content.replace(/from ['"]\/utils\/supabase\/info['"]/g, `from '${relativePath}'`);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`📊 Summary:`);
console.log(`   ✅ Fixed: ${successCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`${'='.repeat(50)}\n`);

if (successCount > 0) {
  console.log('🎉 Import fixes applied successfully!');
  console.log('💡 The build should now work correctly.');
} else if (skippedCount === Object.keys(fixes).length) {
  console.log('✨ All files are already using correct imports!');
} else {
  console.log('⚠️  Some files could not be fixed. Please check the errors above.');
}
