---
title: Components
description: React Three Fiber components API reference
---

# Components API

All Strata React Three Fiber components with their props.

## Terrain Components

### `<Terrain>`

Procedural terrain with automatic chunking and LOD.

```tsx
<Terrain
  biomes={['grassland', 'mountain']}
  amplitude={80}
  frequency={0.01}
  resolution={64}
  size={500}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `biomes` | `string[]` | `['default']` | Biome types |
| `amplitude` | `number` | `50` | Max terrain height |
| `frequency` | `number` | `0.02` | Noise frequency |
| `octaves` | `number` | `6` | Noise octaves |
| `resolution` | `number` | `64` | Mesh resolution |
| `size` | `number` | `256` | Terrain size |
| `chunkSize` | `number` | `32` | Chunk size |
| `position` | `[number, number, number]` | `[0,0,0]` | Position |

## Water Components

### `<Water>`

Simple animated water plane.

```tsx
<Water size={200} depth={20} color="#0077be" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `100` | Water plane size |
| `depth` | `number` | `10` | Visual depth |
| `color` | `string` | `'#0077be'` | Water color |
| `opacity` | `number` | `0.8` | Transparency |
| `waveSpeed` | `number` | `1` | Animation speed |
| `waveHeight` | `number` | `0.5` | Wave amplitude |

### `<AdvancedWater>`

Full-featured water with all effects.

```tsx
<AdvancedWater size={300} reflections caustics foam />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `100` | Water size |
| `waveHeight` | `number` | `1` | Wave height |
| `reflections` | `boolean` | `false` | Enable reflections |
| `caustics` | `boolean` | `false` | Enable caustics |
| `foam` | `boolean` | `false` | Enable foam |
| `foamThreshold` | `number` | `0.7` | Foam wave height |

## Vegetation Components

### `<GrassInstances>`

GPU-instanced grass with wind.

```tsx
<GrassInstances count={10000} spread={100} windSpeed={1} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1000` | Instance count |
| `spread` | `number` | `50` | Distribution radius |
| `color` | `string` | `'#4a7c23'` | Base color |
| `height` | `number` | `0.5` | Blade height |
| `windSpeed` | `number` | `1` | Wind speed |
| `windStrength` | `number` | `0.3` | Wind bend |

### `<TreeInstances>`

GPU-instanced trees with variety.

```tsx
<TreeInstances count={500} spread={200} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `100` | Instance count |
| `spread` | `number` | `100` | Distribution radius |
| `minHeight` | `number` | `3` | Min tree height |
| `maxHeight` | `number` | `8` | Max tree height |
| `types` | `string[]` | `['default']` | Tree types |

### `<RockInstances>`

GPU-instanced rocks and boulders.

```tsx
<RockInstances count={200} spread={150} moss />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `100` | Instance count |
| `spread` | `number` | `100` | Distribution radius |
| `minScale` | `number` | `0.5` | Min rock scale |
| `maxScale` | `number` | `3` | Max rock scale |
| `moss` | `boolean` | `false` | Enable moss |

## Sky Components

### `<ProceduralSky>`

Procedural sky with atmospheric scattering.

```tsx
<ProceduralSky sunPosition={[100, 50, 100]} stars moon />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sunPosition` | `[number, number, number]` | `[0,1,0]` | Sun position |
| `timeOfDay` | `TimeOfDay` | - | Time-based position |
| `turbidity` | `number` | `10` | Atmospheric haze |
| `rayleigh` | `number` | `2` | Blue scattering |
| `stars` | `boolean` | `false` | Show stars |
| `moon` | `boolean` | `false` | Show moon |
| `moonPhase` | `number` | `0.5` | Moon phase (0-1) |

## Volumetric Components

### `<VolumetricFogMesh>`

Height-based volumetric fog.

```tsx
<VolumetricFogMesh density={0.02} color="#8899aa" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `density` | `number` | `0.02` | Fog density |
| `color` | `string` | `'#ffffff'` | Fog color |
| `baseHeight` | `number` | `0` | Fog floor |
| `maxHeight` | `number` | `100` | Fog ceiling |
| `animated` | `boolean` | `false` | Animate noise |

### `<UnderwaterOverlay>`

Underwater effect overlay.

```tsx
<UnderwaterOverlay fogColor="#003366" caustics />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fogColor` | `string` | `'#003366'` | Fog color |
| `fogDensity` | `number` | `0.03` | Fog density |
| `caustics` | `boolean` | `false` | Enable caustics |
| `particles` | `boolean` | `false` | Enable particles |

### `<GodRays>`

Volumetric light shafts.

```tsx
<GodRays lightPosition={[50, 80, 50]} intensity={0.5} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lightPosition` | `[number, number, number]` | Required | Light source |
| `intensity` | `number` | `0.5` | Ray intensity |
| `decay` | `number` | `0.95` | Distance falloff |
| `samples` | `number` | `60` | Quality samples |

## Related

- [Hooks](/api/hooks/) - React hooks
- [Core Functions](/api/functions/) - Utility functions
- [Types](/api/types/) - TypeScript types
