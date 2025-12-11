# @jbcom/strata

**The complete solution for foreground, midground, and background layer 3D gaming in Node.js**

Strata provides everything you need to build high-quality 3D games and experiences, from terrain generation to character animation, all optimized for performance across mobile, web, and desktop.

## 🎮 What is Strata?

Strata is a comprehensive library that solves the hardest problems in 3D game development:

- **Terrain Generation** - SDF-based terrain with marching cubes
- **Water Systems** - Advanced water rendering with caustics and foam
- **Vegetation** - GPU-accelerated instanced grass, trees, and rocks
- **Characters** - Articulated character system with procedural animation
- **Fur Rendering** - GPU-accelerated fur via layered geometry
- **Molecular Rendering** - Scientific visualization and particle systems
- **Sky & Volumetrics** - Procedural sky with volumetric fog
- **Ray Marching** - GPU-accelerated SDF ray marching

All organized into **presets** that you can drop into your game.

## 📚 Documentation

- **[Public API Contract](./PUBLIC_API.md)** - Stable, versioned API reference
- **[API Reference](./API.md)** - Complete API documentation with examples
- **[Developer Contract](./CONTRACT.md)** - Stability guarantees and versioning
- **[Examples](./examples/)** - Working examples for all features
- **[Tests](./tests/)** - Test suite documentation

## 🚀 Quick Start

```bash
npm install @jbcom/strata @react-three/fiber @react-three/drei three
```

```tsx
import { Water, Terrain, Character, createFurSystem } from '@jbcom/strata';
import { Canvas } from '@react-three/fiber';

function Game() {
  return (
    <Canvas>
      {/* Background Layer */}
      <Sky timeOfDay={{ sunAngle: 60 }} />
      <Terrain biomes={biomes} />
      
      {/* Midground Layer */}
      <Water size={100} />
      <Vegetation count={8000} />
      
      {/* Foreground Layer */}
      <Character 
        position={[0, 0, 0]}
        onAnimate={(time) => animateCharacter(character, time)}
      />
    </Canvas>
  );
}
```

## 🎯 Presets

Strata organizes features into **presets** - ready-to-use game development primitives:

### Background Layer
- `Sky` - Procedural sky with time-of-day and weather
- `Volumetrics` - Volumetric fog and underwater effects
- `Terrain` - SDF-based terrain generation
- `MarchingCubes` - Mesh generation from SDFs

### Midground Layer
- `Water` - Advanced water rendering
- `Vegetation` - GPU-instanced grass, trees, rocks
- `Raymarching` - GPU-accelerated SDF rendering

### Foreground Layer
- `Character` - Articulated character system
- `Fur` - Multi-layer fur rendering with wind and gravity
- `Molecular` - Molecular structure visualization

## 🧪 Testing

```bash
# Unit tests (core algorithms)
npm run test:unit

# Integration tests (React components)
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# All tests
npm run test:all
```

See [tests/README.md](./tests/README.md) for test documentation.

## 📖 Examples

```bash
# Basic examples
cd examples/basic/water
npm install && npm run dev

# Comprehensive example
cd examples/comprehensive
npm install && npm run dev
```

See [examples/README.md](./examples/README.md) for all examples.

## 🏗️ Architecture

Strata is built with a clear separation of concerns:

- **Core** (`src/core/`) - Pure TypeScript algorithms (no React)
- **Presets** (`src/presets/`) - Organized game primitives
- **Components** (`src/components/`) - React Three Fiber components
- **Shaders** (`src/shaders/`) - GLSL shader code

This architecture ensures:
- ✅ Framework-agnostic core
- ✅ Easy to test
- ✅ Reusable in any JavaScript/TypeScript environment
- ✅ Type-safe APIs

## 📦 Package Structure

```
@jbcom/strata
├── core/          # Pure TypeScript algorithms
├── presets/        # Organized game primitives
├── components/     # React Three Fiber components
├── shaders/        # GLSL shader code
└── utils/          # Utilities (texture loading, etc.)
```

## 🔗 Exports

```tsx
// Core algorithms (no React)
import { generateInstanceData, createWaterMaterial } from '@jbcom/strata/core';

// Presets (organized by layer)
import { Water, Terrain, Character } from '@jbcom/strata/presets';

// React components
import { Water, Terrain, Character } from '@jbcom/strata/components';

// Shaders
import { waterVertexShader, waterFragmentShader } from '@jbcom/strata/shaders';

// Main export (everything)
import { Water, createFurSystem, Character } from '@jbcom/strata';
```

## 🎨 Features

### GPU-Accelerated Everything
- Instanced rendering for thousands of objects
- GPU-driven wind and LOD calculations
- Ray marching for complex SDFs
- Shell-based fur rendering

### Production-Ready
- Input validation on all APIs
- Comprehensive error handling
- Seeded random for deterministic generation
- Performance optimized for mobile

### Developer Experience
- Full TypeScript support
- Comprehensive test coverage
- Visual regression testing
- Clear API contracts

## 📋 Public API Contract

The public API is defined in [PUBLIC_API.md](./PUBLIC_API.md). All APIs listed there are:
- **Stable** - Follow semantic versioning
- **Tested** - Covered by automated tests
- **Documented** - Clear examples and types

APIs not in PUBLIC_API.md are **internal** and may change without notice.

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT

## 🙏 Acknowledgments

Built on top of:
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)

Inspired by techniques from:
- Inigo Quilez's SDF articles
- Marching.js by Charlie Roberts
- Various procedural generation research
