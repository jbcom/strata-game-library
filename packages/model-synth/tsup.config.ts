import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  target: 'es2022',
  clean: true,
  sourcemap: true,
});
