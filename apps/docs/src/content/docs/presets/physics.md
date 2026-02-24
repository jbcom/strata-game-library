---
title: Physics Presets
description: Pre-configured physics settings for different game scenarios
---

# Physics Presets

Ready-to-use physics configurations for common game scenarios.

## Quick Start

```typescript
import { createPhysicsPreset, PhysicsPresets } from '@strata-game-library/presets/physics';

<PhysicsWorld {...PhysicsPresets.REALISTIC} />
```

## Available Presets

| Preset | Description | Gravity |
|--------|-------------|---------|
| `REALISTIC` | Earth-like | -9.81 |
| `MOON` | Low gravity | -1.62 |
| `SPACE` | Zero gravity | 0 |
| `UNDERWATER` | Buoyant | -2 |
| `ARCADE` | Snappy controls | -20 |
| `PLATFORMER` | Tight jumps | -25 |

## Preset Examples

### Realistic

```typescript
PhysicsPresets.REALISTIC = {
  gravity: [0, -9.81, 0],

  materials: {
    default: {
      friction: 0.5,
      restitution: 0.3,
    },
    ice: {
      friction: 0.05,
      restitution: 0.1,
    },
    rubber: {
      friction: 0.9,
      restitution: 0.8,
    },
  },

  solver: {
    iterations: 8,
    tolerance: 0.001,
  },

  sleeping: {
    enabled: true,
    threshold: 0.1,
  },
};
```

### Platformer

```typescript
PhysicsPresets.PLATFORMER = {
  gravity: [0, -25, 0],

  character: {
    jumpForce: 15,
    airControl: 0.8,
    groundFriction: 0.9,
    airFriction: 0.1,
    coyoteTime: 0.1,
    jumpBuffer: 0.1,
  },

  materials: {
    default: {
      friction: 0.3,
      restitution: 0,
    },
  },
};
```

## Using with Components

```tsx
import { PhysicsWorld, RigidBody } from '@strata-game-library/core';
import { PhysicsPresets } from '@strata-game-library/presets/physics';

<PhysicsWorld {...PhysicsPresets.REALISTIC}>
  <RigidBody type="dynamic">
    <mesh>
      <boxGeometry />
    </mesh>
  </RigidBody>
</PhysicsWorld>
```

## Related

- [Characters](/core/characters/) - Character physics
- [Water](/core/water/) - Buoyancy physics
