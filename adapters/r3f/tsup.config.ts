import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'hooks/index': 'src/hooks/index.ts',
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
    'react', 'react-dom', 'three',
    '@react-three/fiber', '@react-three/drei',
    '@react-three/rapier', '@react-three/postprocessing',
    'postprocessing', 'zustand', 'yuka',
    'xstate', '@xstate/react', 'howler', 'leva',
    'maath', 'miniplex', 'miniplex-react',
    'tunnel-rat', 'zundo', 'immer',
  ],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: { js: '/* @strata-game-library/r3f - ESM Build */' },
});
