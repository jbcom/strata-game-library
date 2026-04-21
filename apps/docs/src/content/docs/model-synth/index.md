---
title: Model Synth
description: AI-powered 3D model generation for game assets
---

# Model Synth

The `@strata-game-library/model-synth` package provides Meshy-backed 3D model generation for game assets. It exposes a high-level `ModelSynth` workflow plus lower-level text-to-3D, rigging, animation, and retexture clients.

## Installation

```bash
pnpm add @strata-game-library/model-synth
```

## Quick Start

```tsx
import { ModelSynth } from '@strata-game-library/model-synth';

const synth = new ModelSynth({ apiKey: process.env.MESHY_API_KEY! });

const character = await synth.character({
  prompt: 'stylized otter river explorer with a satchel',
  style: 'cartoon',
  rigged: true,
  animations: [
    'idle',
    'walk',
    'run',
    {
      name: 'jump60',
      actionId: 466,
      postProcess: { operation_type: 'change_fps', fps: 60 },
    },
  ],
});

console.log(character.model_urls?.glb);
console.log(character.riggedModelUrls?.rigged);
console.log(character.animationUrls?.idle);
```

## Features

- **Text-to-3D** — Generate 3D models from natural language descriptions
- **Style Control** — Realistic, cartoon, anime, voxel, PBR, fantasy, and more
- **Character Pipeline** — Generate, rig, and optionally apply Meshy animation-library actions in one workflow
- **Rigging Client** — Direct access to Meshy rigging tasks and rigged GLB/FBX URLs
- **Animation Client** — Direct access to Meshy animation tasks and GLB/FBX animation outputs
- **Retexture Client** — Texture variant generation for generated models

## Character Workflow

`ModelSynth.character()` returns the completed text-to-3D task augmented with optional `riggingTask`, `riggedModelUrls`, `animationTasks`, and `animationUrls` fields.

```tsx
const result = await synth.character({
  prompt: 'armored fox knight',
  rigged: true,
  heightMeters: 1.4,
  animationStyle: 'stylized',
  fps: 30,
  animations: ['idle', 'run', 466],
});

const riggedGlb = result.riggedModelUrls?.rigged;
const runAnimation = result.animationUrls?.run;
```

Named animations are resolved through Strata's bundled Meshy action-id map (`idle`, `walk`, `run`, `jump`, `collect`, `hit`, `death`, `victory`, and dodge/slide variants). Numeric Meshy action ids and named object requests are also accepted.

## Lower-Level Clients

```tsx
const prop = await synth.prop({ prompt: 'mossy river rock', style: 'realistic' });
const coin = await synth.collectible({ prompt: 'glowing gold coin', style: 'cartoon' });

const rig = await synth.rigging.createRiggingTask({ input_task_id: prop.id });
const animation = await synth.animations.createAnimationTask({
  rig_task_id: rig.id,
  action_id: 30,
});
```

## Status

Model Synth is currently in active development. Text-to-3D, rigging, animation, retexture, and high-level character orchestration are implemented as task-based Meshy API workflows; production use should still validate the exact Meshy plan, rate limits, and generated asset licensing for your project.

## Related

- [Compositional Objects (RFC-002)](/getting-started/architecture/) — Architecture overview
- [Core Features](/core/) — Strata's core rendering capabilities
