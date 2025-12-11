import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
  optimizeDeps: {
    include: ['@jbcom/strata'],
  },
});
