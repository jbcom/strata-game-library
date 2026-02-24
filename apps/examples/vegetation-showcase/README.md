# Vegetation Showcase

An interactive demonstration of Strata's GPU-instanced vegetation system.

## Features Demonstrated

- **GPU Instancing** - Renders thousands of vegetation instances efficiently
- **Biome-Based Placement** - Vegetation density varies by biome type
- **Seeded Random Generation** - Reproducible vegetation placement
- **Height-Based Positioning** - Instances placed on procedural terrain
- **Interactive Controls** - Adjust instance counts and distribution in real-time

## What's Included

- **Grass Instances** - Up to 20,000 grass blades with wind animation
- **Tree Instances** - Hundreds of trees distributed across biomes
- **Rock Instances** - Scattered rocks for environmental detail
- **Procedural Terrain** - Heightmap-based ground for realistic placement

## Running the Demo

```bash
# From this directory
pnpm install
pnpm dev
```

Visit `http://localhost:3002` to see the demo.

## Code Walkthrough

### Biome Configuration

```typescript
const biomes: BiomeData[] = [
    {
        name: 'grassland',
        threshold: 0,
        color: 0x3a5a2a,
        vegetation: 1.0,  // Normal vegetation density
    },
    {
        name: 'forest',
        threshold: 0.3,
        color: 0x2a4a1a,
        vegetation: 1.5,  // Increased density in forests
    },
    {
        name: 'rocky',
        threshold: 0.7,
        color: 0x5a5a4a,
        vegetation: 0.3,  // Sparse vegetation on rocks
    },
];
```

### Creating Vegetation Instances

```typescript
// Create grass instances
const grassMesh = createGrassInstances(5000, 100, biomes, {
    heightFunction,
    seed: 42,
    enableWind: true,
    windStrength: 0.5,
});

// Create tree instances
const treeMesh = createTreeInstances(200, 100, biomes, {
    heightFunction,
    seed: 1042,
    enableWind: true,
    windStrength: 0.3,
});

// Create rock instances
const rockMesh = createRockInstances(100, 100, biomes, {
    heightFunction,
    seed: 2042,
});
```

## Interactive Controls

Use the Leva controls panel (top-right) to adjust:

- **Grass Count** - Number of grass instances (0-20,000)
- **Tree Count** - Number of tree instances (0-1,000)
- **Rock Count** - Number of rock instances (0-500)
- **Area Size** - Distribution area size (10-200)
- **Seed** - Random seed for reproducible generation

## Performance

This example demonstrates efficient GPU instancing:

- **5,000 grass instances** - ~60 FPS on modern hardware
- **20,000 total instances** - Still maintains good performance
- **Single draw call per instance type** - Minimal CPU overhead

## Copy-Paste Ready

The code in this example is production-ready and can be copied directly into your project:

1. Install Strata: `pnpm install @jbcom/strata`
2. Import the functions: `import { createGrassInstances, createTreeInstances } from '@jbcom/strata'`
3. Create instances with your biome and terrain data
4. Add the meshes to your Three.js scene

## Learn More

- [Strata Documentation](../../README.md)
- [Instancing Core API](../../src/core/instancing.ts)
- [Vegetation Preset API](../../src/presets/vegetation/index.ts)
