import { defineConfig } from 'vite';

// Static build: `dist/` runs from any static host, at any base path.
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
