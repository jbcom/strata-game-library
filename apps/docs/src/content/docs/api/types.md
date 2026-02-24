---
title: Types
description: TypeScript type definitions API reference
---

# Types API

TypeScript type definitions. Import from `@strata-game-library/core/types`.

## Terrain Types

### `BiomeConfig`

```typescript
interface BiomeConfig {
  name: string;
  colors: {
    low: string;
    mid: string;
    high: string;
    cliff: string;
  };
  terrainShape: {
    amplitude: number;
    frequency: number;
    sharpness: number;
  };
  vegetation: {
    trees: boolean;
    grass: boolean;
    grassColor?: string;
  };
}
```

### `TerrainConfig`

```typescript
interface TerrainConfig {
  amplitude: number;
  frequency: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seed?: number;
}
```

### `TerrainChunk`

```typescript
interface TerrainChunk {
  position: [number, number, number];
  size: number;
  resolution: number;
  geometry: THREE.BufferGeometry;
  biome: string;
}
```

## Water Types

### `WaterConfig`

```typescript
interface WaterConfig {
  size: number;
  depth: number;
  color: string;
  shallowColor?: string;
  opacity: number;
  reflections: boolean;
  caustics: boolean;
  foam: boolean;
}
```

### `WaveConfig`

```typescript
interface WaveConfig {
  height: number;
  length: number;
  speed: number;
  direction: [number, number];
  steepness?: number;
}
```

### `GerstnerWave`

```typescript
interface GerstnerWave {
  amplitude: number;
  wavelength: number;
  speed: number;
  direction: [number, number];
  steepness: number;
}
```

## Sky Types

### `SkyConfig`

```typescript
interface SkyConfig {
  sunPosition?: [number, number, number];
  timeOfDay?: TimeOfDay;
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  stars: boolean;
  moon: boolean;
  moonPhase?: number;
}
```

### `TimeOfDay`

```typescript
interface TimeOfDay {
  hour: number;        // 0-23
  minute: number;      // 0-59
  sunAngle: number;    // Calculated
  sunPosition: [number, number, number];  // Calculated
  isDay: boolean;
  isNight: boolean;
}
```

## Vegetation Types

### `VegetationConfig`

```typescript
interface VegetationConfig {
  count: number;
  spread: number;
  spreadType: 'random' | 'grid' | 'noise' | 'biome';
  color: string;
  colorVariation: number;
  height: number | [number, number];
  heightVariation: number;
}
```

### `WindConfig`

```typescript
interface WindConfig {
  speed: number;
  strength: number;
  direction: [number, number, number];
  turbulence?: number;
  noiseScale?: number;
}
```

## Animation Types

### `AnimationConfig`

```typescript
interface AnimationConfig {
  type: 'procedural' | 'keyframe' | 'blend';
  speed: number;
  loop: boolean;
}
```

### `IKConfig`

```typescript
interface IKConfig {
  bones: string[];
  target: [number, number, number] | React.RefObject<THREE.Object3D>;
  constraints?: Record<string, { min: number; max: number }>;
  iterations?: number;
  tolerance?: number;
}
```

### `GaitConfig`

```typescript
interface GaitConfig {
  speed: number;
  strideLength: number;
  strideDuration: number;
  bounce: number;
  sway: number;
  lean: number;
}
```

## Mobile Types

### `DeviceProfile`

```typescript
interface DeviceProfile {
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';
  deviceType: 'mobile' | 'tablet' | 'foldable' | 'desktop';
  inputMode: 'touch' | 'keyboard' | 'gamepad' | 'hybrid';
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  hasPointer: boolean;
  hasGamepad: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### `InputSnapshot`

```typescript
interface InputSnapshot {
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
  triggers: { left: number; right: number };
  touches: Array<{
    id: number;
    position: { x: number; y: number };
    phase: 'began' | 'moved' | 'ended' | 'cancelled';
  }>;
}
```

### `HapticsOptions`

```typescript
interface HapticsOptions {
  intensity: 'light' | 'medium' | 'heavy';
  customIntensity?: number;
  duration?: number;
  pattern?: number[];
}
```

## Utility Types

### `Vector3`

```typescript
type Vector3 = [number, number, number];
```

### `Color`

```typescript
type Color = string | number | THREE.Color;
```

## Related

- [Components](/api/components/) - React components
- [Hooks](/api/hooks/) - React hooks
- [Core Functions](/api/functions/) - Utility functions
