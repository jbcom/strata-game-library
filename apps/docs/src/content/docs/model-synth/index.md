---
title: Model Synth
description: AI-powered 3D model generation for game assets
---

# Model Synth

The `@strata-game-library/model-synth` package provides AI-powered 3D model generation. Create game assets from text descriptions, generate procedural meshes, and build complex models from compositional primitives.

## Installation

```bash
pnpm add @strata-game-library/model-synth
```

## Quick Start

```tsx
import { generateModel, ModelPreview } from '@strata-game-library/model-synth';

// Generate a model from a text description
const model = await generateModel({
  prompt: 'medieval wooden barrel with iron bands',
  style: 'low-poly',
  polyCount: 500,
});
```

## Features

- **Text-to-3D** — Generate 3D models from natural language descriptions
- **Style Control** — Low-poly, realistic, stylized, and more
- **Procedural Meshes** — Algorithmic mesh generation for common game objects
- **Compositional Building** — Combine primitive shapes into complex models
- **LOD Generation** — Automatic level-of-detail variants
- **UV Mapping** — Automatic UV unwrapping for generated models

## Compositional System

Build complex models from primitive shapes and materials:

```tsx
import { createProp } from '@strata-game-library/model-synth';

const crate = createProp({
  components: [
    { shape: 'box', size: [1, 1, 1], material: 'wood_oak' },
    { shape: 'box', size: [1.05, 0.03, 0.02], material: 'metal_iron', position: [0, 0.3, 0] },
    { shape: 'box', size: [1.05, 0.03, 0.02], material: 'metal_iron', position: [0, -0.3, 0] },
  ],
});
```

## Procedural Generation

Generate common game objects procedurally:

```tsx
import { generateTree, generateRock, generateBuilding } from '@strata-game-library/model-synth';

const tree = generateTree({ species: 'oak', height: 8, foliageDensity: 0.8 });
const rock = generateRock({ size: 2, roughness: 0.6, moss: true });
const house = generateBuilding({ style: 'medieval', floors: 2, width: 6 });
```

## Status

Model Synth is currently in active development. The compositional system is available for use, while AI-powered text-to-3D generation is in preview.

## Related

- [Compositional Objects (RFC-002)](/getting-started/architecture/) — Architecture overview
- [Core Features](/core/) — Strata's core rendering capabilities
