---
title: Examples
description: Working example projects demonstrating Strata's capabilities
---

# Examples

Working example projects that demonstrate how to use Strata's features. Clone the repository and run any example locally.

## Getting the Examples

```bash
git clone https://github.com/jbcom/strata-game-library.git
cd strata-game-library/examples
pnpm install
```

## Available Examples

### Basic Terrain

A minimal terrain setup demonstrating SDF-based terrain generation with biome blending.

```bash
pnpm dev:terrain
```

- Procedural terrain with multi-biome blending
- Triplanar texturing
- Dynamic LOD
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/basic-terrain)

### Water Scene

Ocean rendering with Gerstner waves, reflections, and caustics.

```bash
pnpm dev:water
```

- Gerstner wave simulation
- Fresnel reflections
- Procedural foam
- Underwater caustics
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/water-scene)

### Vegetation Showcase

GPU-instanced grass, trees, and rocks with wind animation.

```bash
pnpm dev:vegetation
```

- 15,000+ grass instances at 60fps
- Procedural wind animation
- Tree and rock placement
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/vegetation-showcase)

### Sky & Volumetrics

Procedural sky with day/night cycle and volumetric effects.

```bash
pnpm dev:sky
```

- Atmospheric scattering
- Day/night cycle
- Volumetric fog and god rays
- Star rendering
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/sky-volumetrics)

### Full API Showcase

Complete scene integrating all Strata features.

```bash
pnpm dev:showcase
```

- All features combined
- Performance-optimized
- Interactive controls
- [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/api-showcase)

## Running Examples

Each example is a standalone project with its own dependencies:

```bash
# Install all example dependencies
pnpm install

# Run a specific example
pnpm dev:terrain    # http://localhost:3000
pnpm dev:water      # http://localhost:3001
pnpm dev:vegetation # http://localhost:3002
pnpm dev:sky        # http://localhost:3003
pnpm dev:showcase   # http://localhost:3004
```

## Related

- [Live Showcase](/showcase/) - See the demos running live
- [Getting Started](/getting-started/) - Start building with Strata
- [API Reference](/api/) - Complete API documentation
