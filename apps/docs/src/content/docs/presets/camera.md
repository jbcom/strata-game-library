---
title: Camera Presets
description: Pre-configured camera controllers for different game perspectives
---

# Camera Presets

Ready-to-use camera configurations for common game perspectives.

## Quick Start

```typescript
import { createCameraPreset, CameraPresets } from '@strata-game-library/presets/camera';

<CameraController {...CameraPresets.THIRD_PERSON} />
```

## Available Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| `FIRST_PERSON` | Eye-level view | FPS games |
| `THIRD_PERSON` | Over shoulder | Action games |
| `TOP_DOWN` | Birds eye | Strategy, RPG |
| `ISOMETRIC` | 45° angle | Tactics, city builders |
| `ORBIT` | Free rotation | Viewers, editors |
| `CINEMATIC` | Smooth dolly | Cutscenes |
| `SIDE_SCROLLER` | 2D perspective | Platformers |

## Preset Examples

### Third Person

```typescript
CameraPresets.THIRD_PERSON = {
  type: 'follow',

  offset: [0, 2, -5],
  lookAtOffset: [0, 1.5, 0],

  smoothing: {
    position: 0.1,
    rotation: 0.05,
  },

  limits: {
    minDistance: 2,
    maxDistance: 10,
    minPolarAngle: 0.2,
    maxPolarAngle: Math.PI / 2,
  },

  collision: {
    enabled: true,
    radius: 0.3,
  },

  input: {
    mouseSensitivity: 0.002,
    zoomSpeed: 1,
  },
};
```

### Cinematic

```typescript
CameraPresets.CINEMATIC = {
  type: 'path',

  smoothing: {
    position: 0.02,
    rotation: 0.01,
  },

  depthOfField: {
    enabled: true,
    focusDistance: 10,
    aperture: 0.025,
  },

  motionBlur: {
    enabled: true,
    amount: 0.5,
  },

  letterbox: {
    enabled: true,
    aspect: 2.35,
  },
};
```

## Using with Components

```tsx
import { CameraController } from '@strata-game-library/core';
import { CameraPresets } from '@strata-game-library/presets/camera';

<CameraController
  {...CameraPresets.THIRD_PERSON}
  target={playerRef}
/>
```

## Related

- [Characters](/core/characters/) - Character controllers
- [Animation Presets](/presets/animation/) - Movement animations
