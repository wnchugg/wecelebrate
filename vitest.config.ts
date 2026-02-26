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
      '**/src/app/__tests__/bugfix/**/*.exploration.test.ts',      // Meta-tests that run test suite
      '**/src/app/__tests__/bugfix/**/*.preservation.test.ts',     // Meta-tests that run test suite
    ],
    
    // ==================== RESOURCE LIMITS ====================
    // Ultra-conservative defaults for local development (MacBook-friendly)
    // CI can override with higher limits via command-line flags
    maxConcurrency: 1,        // Max 1 test file at a time (prevents CPU overload)
    poolOptions: {
      threads: {
        maxThreads: 1,        // Single worker thread (minimal resource usage)
        minThreads: 1,        // Keep at least 1 worker
        singleThread: true,   // Force single-threaded execution
      }
    },
    
    // Limit workers to prevent CPU overload (safe for local dev)
    // CI can override with --poolOptions.threads.maxThreads=4 for better performance
    
    // Timeout protection
    testTimeout: 10000,       // 10s max per test
    hookTimeout: 10000,       // 10s max per hook
    teardownTimeout: 10000,   // 10s max for teardown
    
    // Memory optimization
    // isolate: false for local dev (memory-efficient), true for CI (test isolation)
    // CI should override with --isolate=true for better test isolation
    isolate: false,           // Share context between tests (reduces memory usage)
    pool: 'threads',          // Use threads pool (more efficient than forks)
    
    // Cleanup
    clearMocks: true,         // Clear mocks between tests
    restoreMocks: true,       // Restore mocks after tests
    mockReset: true,          // Reset mocks between tests
    
    // Cache for faster re-runs
    cache: {
      dir: '.vitest/cache'
    },
    
    // Dependency optimization for faster module loading
    deps: {
      optimizer: {
        web: {
          enabled: true,      // Enable web dependency optimization
        },
        ssr: {
          enabled: true,      // Enable SSR dependency optimization
        },
      },
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