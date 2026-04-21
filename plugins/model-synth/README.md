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
import { ModelSynth } from '@strata-game-library/model-synth';

const synth = new ModelSynth({ apiKey: process.env.MESHY_API_KEY! });

// Generate, rig, and animate a character.
const otter = await synth.character({
  prompt: 'a cute otter adventurer with a satchel',
  style: 'cartoon',
  rigged: true,
  animations: [
    'idle',
    'walk',
    {
      name: 'jump60',
      actionId: 466,
      postProcess: { operation_type: 'change_fps', fps: 60 },
    },
  ],
});

console.log(otter.model_urls?.glb);
console.log(otter.riggedModelUrls?.rigged);
console.log(otter.animationUrls?.idle);
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
const preview = await synth.text3d.createPreviewTask(params, makeRequest);

// Character workflow
const character = await synth.character({
  prompt: 'stylized fox hero',
  rigged: true,
  animations: ['idle', 'run', 466],
});

// Props and collectibles
const prop = await synth.prop({ prompt: 'mossy river rock' });
const coin = await synth.collectible({ prompt: 'glowing gold coin' });

// Lower-level rigging/animation clients remain available
const rig = await synth.rigging.createRiggingTask({ input_task_id: preview.id });
const animation = await synth.animations.createAnimationTask({
  rig_task_id: rig.id,
  action_id: 30,
});
```

## Documentation

Full documentation and generation guide: [https://strata.game/model-synth/](https://strata.game/model-synth/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
