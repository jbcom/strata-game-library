# @strata-game-library/model-synth

[![npm version](https://img.shields.io/npm/v/@strata-game-library/model-synth)](https://www.npmjs.com/package/@strata-game-library/model-synth)
[![license](https://img.shields.io/npm/l/@strata-game-library/model-synth)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Procedural 3D model generation using Meshy API -- characters, props, and animations for React Three Fiber games.

## Installation

```bash
pnpm add @strata-game-library/model-synth
```

## Quick Start

```ts
import { MeshyClient } from '@strata-game-library/model-synth';

const client = new MeshyClient({ apiKey: process.env.MESHY_API_KEY });

// Generate a 3D model from text
const task = await client.textTo3D({
  prompt: 'a medieval wooden treasure chest',
  topology: 'quad',
});

// Poll for completion and download
const result = await client.waitForResult(task.id);
console.log(result.modelUrl); // URL to the generated GLB file
```

## Features

- **Text-to-3D generation** -- Create 3D models from natural language descriptions via Meshy API
- **Auto-rigging** -- Automatically rig generated models with skeletal armatures
- **Animation generation** -- Generate walk cycles, idle, and action animations for rigged models
- **Texture refinement** -- Upscale and refine model textures for production quality
- **Type-safe API** -- Full TypeScript types with Zod validation for all API responses
- **Async workflow** -- Task-based generation with polling and webhook support

## API Overview

```ts
// Text to 3D
const task = await client.textTo3D({ prompt, topology, artStyle });

// Image to 3D
const task = await client.imageTo3D({ imageUrl, topology });

// Auto-rig a model
const task = await client.autoRig({ modelUrl, skeletonType });

// Generate animations
const task = await client.animate({ riggedModelUrl, animation });

// Check task status
const status = await client.getTask(taskId);
```

## Documentation

Full documentation and generation guide: [https://strata.game/model-synth/](https://strata.game/model-synth/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
