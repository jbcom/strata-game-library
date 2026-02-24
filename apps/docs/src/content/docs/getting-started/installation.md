---
title: Installation
description: Install Strata and its dependencies in your project
---

# Installation

Strata requires React Three Fiber and Three.js as peer dependencies. This guide covers installation for various package managers and project setups.

## Requirements

- **Node.js**: 18.0 or higher
- **React**: 18.0 or higher
- **Three.js**: 0.150 or higher
- **React Three Fiber**: 8.0 or higher

## Quick Install

### Using pnpm (Recommended)

```bash
pnpm add @strata-game-library/core @react-three/fiber @react-three/drei three
```

### Using npm

```bash
npm install @strata-game-library/core @react-three/fiber @react-three/drei three
```

### Using yarn

```bash
yarn add @strata-game-library/core @react-three/fiber @react-three/drei three
```

### Using bun

```bash
bun add @strata-game-library/core @react-three/fiber @react-three/drei three
```

## TypeScript Support

Strata is written in TypeScript and includes full type definitions. For the best experience, add Three.js types:

```bash
pnpm add -D @types/three
```

## Optional Packages

### Shaders Only

If you only need the GLSL shaders (no React dependencies):

```bash
pnpm add @strata-game-library/shaders
```

### Presets Only

For pre-configured terrain, weather, and effects:

```bash
pnpm add @strata-game-library/presets @strata-game-library/core
```

### Mobile Plugins

For React Native projects:

```bash
npm install @strata-game-library/react-native-plugin
cd ios && pod install
```

For Capacitor projects:

```bash
pnpm add @strata-game-library/capacitor-plugin
npx cap sync
```

## Framework Integration

### Next.js

Strata works with Next.js out of the box. For server-side rendering, use dynamic imports:

```tsx
import dynamic from 'next/dynamic';

const StrataScene = dynamic(() => import('./StrataScene'), {
  ssr: false,
  loading: () => <div>Loading 3D scene...</div>
});
```

### Vite

Strata works with Vite without additional configuration:

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### Create React App

For CRA projects, ensure you have react-scripts 5.0+ for proper ES module support.

## Verify Installation

Create a simple test scene to verify everything is working:

```tsx
import { Canvas } from '@react-three/fiber';
import { Water, ProceduralSky } from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 10, 20] }}>
        <ProceduralSky />
        <Water size={100} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
```

If you see a sky and water plane, Strata is installed correctly!

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors, ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### WebGL Not Supported

Strata requires WebGL 2.0. Check browser support at [caniuse.com/webgl2](https://caniuse.com/webgl2).

### Performance Issues

For better performance on mobile:

```tsx
<Canvas
  dpr={[1, 2]} // Limit pixel ratio
  performance={{ min: 0.5 }} // Allow frame dropping
>
  {/* Your scene */}
</Canvas>
```

## Next Steps

- [Quick Start](/getting-started/quick-start/) - Build your first scene
- [Architecture](/getting-started/architecture/) - Understand Strata's structure
- [Core Features](/core/) - Explore all features
