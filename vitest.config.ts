import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Simplified Figma Asset Plugin for tests
function figmaAssetPlugin() {
  return {
    name: 'figma-asset-plugin',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return '\0' + id;
      }
    },
    load(id: string) {
      if (id.startsWith('\0figma:asset/')) {
        const hash = id.slice('\0figma:asset/'.length);
        return `export default "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/${hash}"`;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), figmaAssetPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'], // Using comprehensive test setup
    css: true,
    
    // ==================== TEST FILE PATTERNS ====================
    // Include only Vitest-compatible tests
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Exclude non-Vitest tests (Playwright, Deno, Visual tests)
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      '**/e2e/**',                                    // Playwright E2E tests
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',       // E2E test files
      '**/*.visual.{test,spec}.{js,ts,jsx,tsx}',    // Visual regression tests
      '**/supabase/functions/server/tests/dashboard_api.test.ts',  // Deno test
      '**/supabase/functions/server/tests/helpers.test.ts',        // Deno test
      '**/supabase/functions/server/tests/validation.test.ts',     // Deno test
    ],
    
    // ==================== RESOURCE LIMITS ====================
    // Prevent system crashes by limiting parallel execution
    maxConcurrency: 4,        // Max 4 test files running at once
    pool: 'forks',            // Use process pool for better isolation
    poolOptions: {
      forks: {
        maxForks: 4,          // Max 4 worker processes
        minForks: 1,          // Keep at least 1 worker
        singleFork: false,    // Allow multiple forks
      }
    },
    
    // Limit workers to prevent CPU overload
    maxWorkers: 4,            // Max 4 workers
    minWorkers: 1,            // Min 1 worker
    
    // Timeout protection
    testTimeout: 10000,       // 10s max per test
    hookTimeout: 10000,       // 10s max per hook
    teardownTimeout: 10000,   // 10s max for teardown
    
    // Memory optimization
    isolate: true,            // Isolate tests (safer but uses more memory)
    
    // Cleanup
    clearMocks: true,         // Clear mocks between tests
    restoreMocks: true,       // Restore mocks after tests
    mockReset: true,          // Reset mocks between tests
    
    // Cache for faster re-runs
    cache: {
      dir: '.vitest/cache'
    },
    
    // ==================== COVERAGE ====================
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/test': path.resolve(__dirname, './src/test'),
    },
  },
});