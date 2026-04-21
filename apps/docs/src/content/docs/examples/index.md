---
title: Examples
description: Working example projects demonstrating Strata's capabilities
---

# Examples

Working example projects that demonstrate how to use Strata's features. Clone the repository and run any example locally.

## Getting the Examples

```bash
git clone https://github.com/jbcom/strata-game-library.git
cd strata-game-library
pnpm install
```

## Available Examples

### Basic Terrain

A minimal terrain setup demonstrating SDF-based terrain generation with biome blending.

```bash
pnpm --dir apps/examples/basic-terrain dev
```

- Procedural terrain with multi-biome blending
- Triplanar texturing
- Dynamic LOD
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/apps/examples/basic-terrain)

### Water Scene

Ocean rendering with Gerstner waves, reflections, and caustics.

```bash
pnpm --dir apps/examples/water-scene dev
```

- Gerstner wave simulation
- Fresnel reflections
- Procedural foam
- Underwater caustics
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/apps/examples/water-scene)

### Vegetation Showcase

GPU-instanced grass, trees, and rocks with wind animation.

```bash
pnpm --dir apps/examples/vegetation-showcase dev
```

- 15,000+ grass instances at 60fps
- Procedural wind animation
- Tree and rock placement
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/apps/examples/vegetation-showcase)

### Sky & Volumetrics

Procedural sky with day/night cycle and volumetric effects.

```bash
pnpm --dir apps/examples/sky-volumetrics dev
```

- Atmospheric scattering
- Day/night cycle
- Volumetric fog and god rays
- Star rendering
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/apps/examples/sky-volumetrics)

### Full API Showcase

Complete scene integrating all Strata features.

```bash
pnpm --dir apps/examples/api-showcase dev
```

- All features combined
- Runtime composition examples with `RuntimeProp` and `RuntimeCreature`
- Performance-optimized
- Interactive controls
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/apps/examples/api-showcase)

## Running Examples

Each example is a standalone project with its own dependencies:

```bash
# Install workspace dependencies
pnpm install

# Run a specific example
pnpm --dir apps/examples/basic-terrain dev
pnpm --dir apps/examples/water-scene dev
pnpm --dir apps/examples/vegetation-showcase dev
pnpm --dir apps/examples/sky-volumetrics dev
pnpm --dir apps/examples/api-showcase dev
```

## Related

- [Live Showcase](/showcase/) - See the demos running live
- [Getting Started](/getting-started/) - Start building with Strata
- [API Reference](/api/) - Complete API documentation
