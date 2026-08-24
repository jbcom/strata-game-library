import { defineConfig } from 'tsup';

const internalPackages = [
  '@strata-game-library/astro',
  '@strata-game-library/audio-synth',
  '@strata-game-library/capacitor',
  '@strata-game-library/core',
  '@strata-game-library/model-synth',
  '@strata-game-library/pixi',
  '@strata-game-library/presets',
  '@strata-game-library/r3f',
  '@strata-game-library/react-native',
  '@strata-game-library/reactylon',
  '@strata-game-library/shaders',
  '@strata-game-library/yuka',
];

// Private workspace builds can preserve their own dependency imports during
// development. The public umbrella cannot: it must not leak implementation
// module resolution (including directory-only ESM paths) into a consumer.
const bundledDependencies = [
  'howler',
  'maath',
  'miniplex',
  'ngraph.graph',
  'ngraph.path',
  'xstate',
  'zundo',
];

const peerPackages = [
  '@babylonjs/core',
  '@react-three/drei',
  '@react-three/fiber',
  '@react-three/rapier',
  '@pixi/react',
  'astro',
  'postprocessing',
  'pixi.js',
  'react',
  'react-dom',
  'react-native',
  'reactylon',
  'three',
  'tone',
  'typescript',
  'yuka',
  'zustand',
];

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    api: 'src/api.ts',
    components: 'src/components.ts',
    hooks: 'src/hooks.ts',
    core: 'src/core.ts',
    game: 'src/game.ts',
    compose: 'src/compose.ts',
    world: 'src/world.ts',
    utils: 'src/utils.ts',
    shaders: 'src/shaders.ts',
    presets: 'src/presets.ts',
    r3f: 'src/r3f.ts',
    reactylon: 'src/reactylon.ts',
    pixi: 'src/pixi.ts',
    'audio-synth': 'src/audio-synth.ts',
    'model-synth': 'src/model-synth.ts',
    capacitor: 'src/capacitor.ts',
    'react-native': 'src/react-native.ts',
    astro: 'src/astro.ts',
    yuka: 'src/yuka.ts',
  },
  format: ['esm'],
  // The public tarball must be self-contained. Resolve the declarations for
  // private workspace modules just as noExternal resolves their runtime code.
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'ES2022',
  treeshake: true,
  minify: false,
  keepNames: true,
  noExternal: [...internalPackages, ...bundledDependencies],
  external: peerPackages,
  banner: {
    js: '/* strata-game-library - umbrella ESM build */',
  },
});
