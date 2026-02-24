---
title: Live Showcase
description: Interactive demos showcasing Strata's capabilities
---

# Live Showcase

Experience Strata in action with these interactive demos. Each demo runs directly in your browser using WebGL.

## Featured Demos

<div class="feature-grid">

### 🏔️ [Terrain Demo](/showcase/terrain/)

Procedural terrain generation using SDFs and marching cubes with triplanar texturing and multi-biome blending.

### 🌊 [Water Demo](/showcase/water/)

Realistic water rendering featuring Gerstner wave simulation, Fresnel-based reflections, procedural foam, and underwater caustics.

### 🌿 [Vegetation Demo](/showcase/vegetation/)

GPU-accelerated instancing capable of rendering 10,000+ instances of grass, trees, and rocks at 60fps with procedural wind animation.

### ☀️ [Sky & Volumetrics Demo](/showcase/sky/)

Physically-based atmospheric scattering with dynamic day/night cycle, volumetric clouds, and god rays.

### 🎬 [Full Scene Demo](/showcase/full-scene/)

Complete integration of all features into a cohesive explorable environment.

</div>

## Running Demos Locally

Clone the examples repository and run locally for the best experience:

```bash
# Clone examples
git clone https://github.com/strata-game-library/examples.git
cd examples

# Install dependencies
pnpm install

# Run specific demos
pnpm dev:terrain    # Port 3000
pnpm dev:water      # Port 3001
pnpm dev:vegetation # Port 3002
pnpm dev:sky        # Port 3003
```

## What These Demos Showcase

| Demo | Features Demonstrated |
|------|----------------------|
| Terrain | SDF, Marching Cubes, Biomes, Triplanar Texturing |
| Water | Gerstner Waves, Reflections, Caustics, Foam |
| Vegetation | GPU Instancing, Wind Animation, LOD |
| Sky | Atmospheric Scattering, Day/Night, Stars |
| Full Scene | All features integrated together |

## Performance

All demos are optimized for:

- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Low-end devices (with reduced settings)

If performance is poor, try:

1. Closing other browser tabs
2. Using a discrete GPU (if available)
3. Reducing browser window size

## Source Code

Every demo includes source code that you can use directly in your projects:

- [Basic Terrain Source](https://github.com/strata-game-library/examples/tree/main/basic-terrain)
- [Water Scene Source](https://github.com/strata-game-library/examples/tree/main/water-scene)
- [Vegetation Showcase Source](https://github.com/strata-game-library/examples/tree/main/vegetation-showcase)
- [Sky Volumetrics Source](https://github.com/strata-game-library/examples/tree/main/sky-volumetrics)
- [API Showcase Source](https://github.com/strata-game-library/examples/tree/main/api-showcase)

## Related

- [Getting Started](/getting-started/) - Start building with Strata
- [Core Features](/core/) - Learn about each feature
- [API Reference](/api/) - Complete API documentation
