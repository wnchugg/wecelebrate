/**
 * COPY THIS CODE AND RUN IT IN YOUR BROWSER'S DEVELOPER CONSOLE
 * (Press F12 → Console tab → Paste this code → Press Enter)
 * 
 * This will download the .optimized.ts files, rename them, and
 * allow you to re-upload them to Figma Make.
 */

async function downloadAndRenameTestFiles() {
  console.log('🚀 Starting test file rename process...\n');
  
  const files = [
    '/src/app/utils/__tests__/security.test.optimized.ts',
    '/src/app/utils/__tests__/validators.test.optimized.ts'
  ];
  
  for (const filePath of files) {
    try {
      console.log(`📥 Fetching: ${filePath}`);
      const response = await fetch(filePath);
      const content = await response.text();
      
      // Remove .optimized from filename
      const newFilename = filePath.replace('.optimized.ts', '.ts').split('/').pop();
      
      // Create download link
      const blob = new Blob([content], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newFilename;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded: ${newFilename}\n`);
    } catch (error) {
      console.error(`❌ Error with ${filePath}:`, error);
    }
  }
  
  console.log('✅ Done! Now:');
  console.log('1. Upload the downloaded files to /src/app/utils/__tests__/');
  console.log('2. Delete the .optimized.ts files');
  console.log('3. Run your tests!');
}

// Run it!
downloadAndRenameTestFiles();
