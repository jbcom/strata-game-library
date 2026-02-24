# Water Scene Example

An interactive water scene demonstrating Strata's water rendering capabilities.

## Features

- Advanced water material with reflections
- Animated wave displacement
- Underwater caustics effect
- Floating objects with buoyancy
- Dynamic lighting

## Quick Start

```bash
pnpm install
pnpm dev
```

## What This Example Shows

### Water Component

```tsx
import { Water, AdvancedWater } from '@jbcom/strata';

<Water
  size={100}
  resolution={256}
  waveSpeed={0.5}
  waveHeight={0.3}
/>
```

### Core Water Material

```typescript
import { createWaterMaterial, createWaterGeometry } from '@jbcom/strata';

const geometry = createWaterGeometry(100, 256);
const material = createWaterMaterial({
  color: 0x1a5f7a,
  transparent: true,
  opacity: 0.8,
});
```

## Project Structure

```text
water-scene/
├── src/
│   ├── App.tsx          # Main scene with water
│   └── main.tsx         # Entry point
├── index.html
├── package.json
└── README.md
```
