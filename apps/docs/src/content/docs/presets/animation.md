---
title: Animation Presets
description: Pre-configured animation settings for characters and creatures
---

# Animation Presets

Ready-to-use animation configurations for character movement and behavior.

## Quick Start

```typescript
import { createAnimationPreset, AnimationPresets } from '@strata-game-library/presets/animation';

<Character animation={AnimationPresets.HUMANOID_WALK} />
```

## Available Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| `HUMANOID_WALK` | Bipedal walk cycle | Human characters |
| `HUMANOID_RUN` | Bipedal run cycle | Human running |
| `QUADRUPED_WALK` | Four-legged walk | Dogs, horses |
| `QUADRUPED_RUN` | Four-legged run | Fast animals |
| `BIRD_FLY` | Wing flapping | Flying creatures |
| `FISH_SWIM` | Undulating motion | Aquatic |
| `SPIDER_CRAWL` | Eight-legged | Arachnids |

## Preset Examples

### Humanoid Walk

```typescript
AnimationPresets.HUMANOID_WALK = {
  type: 'procedural',

  gait: {
    speed: 1.5,
    strideLength: 0.8,
    strideDuration: 0.6,
  },

  body: {
    bounce: 0.03,
    sway: 0.02,
    lean: 0.05,
  },

  arms: {
    swing: 0.3,
    swingOffset: Math.PI,
  },

  legs: {
    lift: 0.15,
    bendAngle: 0.4,
  },

  ik: {
    footPlacement: true,
    hipAdjustment: true,
  },
};
```

### Quadruped Run

```typescript
AnimationPresets.QUADRUPED_RUN = {
  type: 'procedural',

  gait: {
    pattern: 'gallop',
    speed: 8,
    strideLength: 2.5,
  },

  body: {
    bounce: 0.15,
    stretch: 0.1,
  },

  legs: {
    frontPhase: 0,
    backPhase: 0.5,
    lift: 0.4,
  },

  spine: {
    flex: 0.2,
    twist: 0.1,
  },
};
```

## Using with Components

```tsx
import { Character } from '@strata-game-library/core';
import { AnimationPresets } from '@strata-game-library/presets/animation';

<Character
  model={characterModel}
  animation={isRunning ? AnimationPresets.HUMANOID_RUN : AnimationPresets.HUMANOID_WALK}
/>
```

## Related

- [Characters](/core/characters/) - Character system
- [Camera Presets](/presets/camera/) - Camera following
- [Physics Presets](/presets/physics/) - Physics settings
