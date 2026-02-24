/**
 * React Three Fiber JSX type augmentation for DTS generation.
 *
 * R3F v9.5+ augments the React JSX namespace with Three.js elements
 * (mesh, group, etc.) in its three-types.d.ts. However, tsup's DTS
 * bundler does not always pick up these module augmentations from
 * external packages. This shim re-declares them so DTS emit succeeds.
 *
 * Consumers of this library should install @react-three/fiber which
 * provides the full, accurate type definitions at runtime.
 */

import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
