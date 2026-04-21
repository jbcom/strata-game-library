import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AliasOptions } from 'vite';

const examplesRoot = fileURLToPath(new URL('.', import.meta.url));

export const exampleResolve: { alias: AliasOptions } = {
  alias: {
    '@react-three/drei': path.join(examplesRoot, 'node_modules/@react-three/drei'),
    '@react-three/fiber': path.join(examplesRoot, 'node_modules/@react-three/fiber'),
    react: path.join(examplesRoot, 'node_modules/react'),
    'react-dom': path.join(examplesRoot, 'node_modules/react-dom'),
    three: path.join(examplesRoot, 'node_modules/three'),
  },
};
