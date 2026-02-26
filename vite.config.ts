import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Simplified Figma Asset Plugin
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
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
  ],
  resolve: {
    alias: {
      // More specific aliases must come before general ones
      '@/components': path.resolve(__dirname, './src/app/components'),
      '@/utils': path.resolve(__dirname, './src/app/utils'),
      '@/context': path.resolve(__dirname, './src/app/context'),
      '@/pages': path.resolve(__dirname, './src/app/pages'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@': path.resolve(__dirname, './src'),
      '/utils': path.resolve(__dirname, './utils'),
    },
  },
  envPrefix: 'VITE_',
})