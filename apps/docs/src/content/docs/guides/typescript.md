---
title: TypeScript Usage
description: TypeScript integration guide for Strata
---

# TypeScript Usage

Strata is written in TypeScript and provides comprehensive type definitions.

## Setup

### Install Types

Three.js types are required:

```bash
pnpm add -D @types/three
```

### tsconfig.json

Recommended configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  }
}
```

## Importing Types

```typescript
import type {
  BiomeConfig,
  TerrainConfig,
  WaterConfig,
  SkyConfig,
  TimeOfDay,
  VegetationConfig,
  WindConfig,
  DeviceProfile,
  InputSnapshot,
} from '@strata-game-library/core/types';
```

## Component Props

All components have typed props:

```tsx
import { Water, type WaterProps } from '@strata-game-library/core';

const waterConfig: WaterProps = {
  size: 200,
  depth: 20,
  color: '#0077be',
  reflections: true,
};

<Water {...waterConfig} />
```

## Generic Functions

Some functions are generic:

```typescript
import { createPreset } from '@strata-game-library/presets';

interface CustomTerrainConfig extends TerrainConfig {
  crystalFormations: boolean;
}

const preset = createPreset<CustomTerrainConfig>({
  amplitude: 100,
  crystalFormations: true,
});
```

## Strict Null Checks

Handle nullable refs properly:

```tsx
const terrainRef = useRef<THREE.Mesh>(null);

useFrame(() => {
  if (terrainRef.current) {
    terrainRef.current.rotation.y += 0.01;
  }
});
```

## Custom Extensions

Extend existing types:

```typescript
import type { BiomeConfig } from '@strata-game-library/core/types';

interface AlienBiomeConfig extends BiomeConfig {
  crystalDensity: number;
  glowIntensity: number;
}

const alienBiome: AlienBiomeConfig = {
  name: 'alien',
  colors: { low: '#7b2cbf', mid: '#9d4edd', high: '#c77dff', cliff: '#5a189a' },
  terrainShape: { amplitude: 100, frequency: 0.01, sharpness: 0.8 },
  vegetation: { trees: false, grass: true },
  crystalDensity: 0.3,
  glowIntensity: 0.5,
};
```

## Related

- [API Reference](/api/)
- [Types Reference](/api/types/)
