---
title: Core Functions
description: Pure TypeScript utility functions API reference
---

# Core Functions API

Pure TypeScript functions with no React dependencies. Import from `@strata-game-library/core`.

## SDF Primitives

### `sdSphere`

Signed distance to a sphere.

```typescript
function sdSphere(
  point: [number, number, number],
  center: [number, number, number],
  radius: number
): number;
```

### `sdBox`

Signed distance to an axis-aligned box.

```typescript
function sdBox(
  point: [number, number, number],
  center: [number, number, number],
  size: [number, number, number]
): number;
```

### `sdCapsule`

Signed distance to a capsule.

```typescript
function sdCapsule(
  point: [number, number, number],
  start: [number, number, number],
  end: [number, number, number],
  radius: number
): number;
```

### `sdTorus`

Signed distance to a torus.

```typescript
function sdTorus(
  point: [number, number, number],
  center: [number, number, number],
  majorRadius: number,
  minorRadius: number
): number;
```

## SDF Operations

### `opUnion`

Boolean union of two SDFs.

```typescript
function opUnion(d1: number, d2: number): number;
```

### `opSubtraction`

Boolean subtraction (d1 - d2).

```typescript
function opSubtraction(d1: number, d2: number): number;
```

### `opSmoothUnion`

Smooth blended union.

```typescript
function opSmoothUnion(d1: number, d2: number, k: number): number;
// k = smoothness factor (0.1 - 1.0)
```

## Noise Functions

### `noise3D`

3D Perlin noise.

```typescript
function noise3D(x: number, y: number, z: number): number;
// Returns -1 to 1
```

### `fbm`

Fractal Brownian Motion noise.

```typescript
function fbm(
  x: number,
  y: number,
  z: number,
  options?: {
    octaves?: number;      // Default: 6
    persistence?: number;  // Default: 0.5
    lacunarity?: number;   // Default: 2.0
  }
): number;
```

### `warpedFbm`

Domain-warped FBM for organic shapes.

```typescript
function warpedFbm(
  x: number,
  y: number,
  z: number,
  options?: {
    octaves?: number;
    warpStrength?: number;
  }
): number;
```

## Terrain Functions

### `getBiomeAt`

Get biome type at a position.

```typescript
function getBiomeAt(
  x: number,
  z: number,
  config: BiomeConfig
): string;
```

### `getTerrainHeight`

Get terrain height at a position.

```typescript
function getTerrainHeight(
  x: number,
  z: number,
  biome: string,
  config?: TerrainConfig
): number;
```

### `sdTerrain`

SDF for terrain heightfield.

```typescript
function sdTerrain(
  point: [number, number, number],
  config: TerrainConfig
): number;
```

### `calcNormal`

Calculate surface normal from SDF.

```typescript
function calcNormal(
  point: [number, number, number],
  sdf: (p: [number, number, number]) => number,
  epsilon?: number
): [number, number, number];
```

## Marching Cubes

### `marchingCubes`

Generate mesh from SDF.

```typescript
function marchingCubes(
  sdf: (point: [number, number, number]) => number,
  bounds: { min: [number, number, number]; max: [number, number, number] },
  resolution: number
): { vertices: Float32Array; indices: Uint32Array };
```

### `createGeometryFromMarchingCubes`

Create Three.js geometry from SDF.

```typescript
function createGeometryFromMarchingCubes(options: {
  bounds: { min: [number, number, number]; max: [number, number, number] };
  resolution: number;
  sdf: (point: [number, number, number]) => number;
}): THREE.BufferGeometry;
```

### `generateTerrainChunk`

Generate complete terrain chunk.

```typescript
function generateTerrainChunk(options: {
  position: [number, number, number];
  size: number;
  resolution: number;
  sdfFunction: (p: [number, number, number]) => number;
  biomeFunction?: (x: number, z: number) => string;
}): THREE.BufferGeometry;
```

## Material Creation

### `createWaterMaterial`

Create simple water material.

```typescript
function createWaterMaterial(options: {
  color: THREE.Color;
  opacity?: number;
  reflectivity?: number;
  waveHeight?: number;
  waveSpeed?: number;
}): THREE.ShaderMaterial;
```

### `createSkyMaterial`

Create procedural sky material.

```typescript
function createSkyMaterial(options: {
  sunPosition: THREE.Vector3;
  turbidity?: number;
  rayleigh?: number;
}): THREE.ShaderMaterial;
```

## Animation

### `createTimeOfDay`

Create time of day object.

```typescript
function createTimeOfDay(
  hour: number,
  minute: number
): TimeOfDay;
```

### `createWalkCycle`

Create procedural walk animation.

```typescript
function createWalkCycle(options: {
  speed?: number;
  stride?: number;
  bounce?: number;
  armSwing?: number;
}): Animation;
```

## Related

- [Components](/api/components/) - React components
- [Hooks](/api/hooks/) - React hooks
- [Types](/api/types/) - TypeScript types
