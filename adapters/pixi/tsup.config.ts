import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'ES2022',
  jsx: 'automatic',
  external: [
    /^@strata-game-library\//,
    /^@babylonjs\//,
    'react',
    'reactylon',
  ],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: { js: '/* @strata-game-library/reactylon - ESM Build */' },
});
