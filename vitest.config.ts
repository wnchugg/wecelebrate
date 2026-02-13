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