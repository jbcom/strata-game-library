import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { exampleResolve } from '../vite.shared';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: exampleResolve,
  server: {
    port: 3004,
  },
});
