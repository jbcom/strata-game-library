# Basic Terrain Example

A simple example demonstrating procedural terrain generation with Strata.

## Features

- SDF-based terrain generation
- Marching cubes mesh creation
- Basic lighting and camera controls
- Core-only usage demonstration

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## What This Example Shows

### React Three Fiber Usage

The main `App.tsx` shows how to use Strata components in a React Three Fiber scene:

```tsx
import { Terrain } from '@jbcom/strata/components';

function Scene() {
  return (
    <Canvas>
      <Terrain size={100} resolution={64} />
    </Canvas>
  );
}
```

### Core-Only Usage

The `core-usage.ts` file shows how to use Strata's core functions without React:

```typescript
import { marchingCubes, createSphere } from '@jbcom/strata/core';

// Generate mesh from SDF
const geometry = marchingCubes(sdfFunction, bounds, resolution);
```

## Project Structure

```text
basic-terrain/
├── src/
│   ├── App.tsx          # Main React component
│   ├── core-usage.ts    # Core-only usage example
│   └── main.tsx         # Entry point
├── index.html
├── package.json
└── README.md
```

## Screenshot

![Basic Terrain](./screenshot.png)

A procedurally generated terrain with marching cubes.
