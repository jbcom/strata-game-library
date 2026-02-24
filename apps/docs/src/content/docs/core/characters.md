---
title: Character System
description: Articulated characters with IK chains, procedural animation, and physics
---

# 🎮 Character System

Strata's character system provides articulated characters with inverse kinematics (IK) chains, procedural walk cycles, and physics integration for games.

## Quick Start

```tsx
import { Character, createWalkCycle } from '@strata-game-library/core';

<Character
  model={characterModel}
  animation={createWalkCycle({ speed: 1.5 })}
/>
```

## Components

### `<Character>`

Complete character controller with animation:

```tsx
import { Character } from '@strata-game-library/core';

<Character
  // Model
  model={characterGLTF}
  scale={1}

  // Position & Movement
  position={[0, 0, 0]}
  rotation={[0, 0, 0]}

  // Animation
  animation="idle"
  animationSpeed={1}

  // Physics
  physics
  mass={70}
  friction={0.5}

  // Controls
  controlled
  moveSpeed={5}
  jumpForce={8}

  // IK
  footIK
  handIK
/>
```

### `<IKChain>`

Inverse kinematics for limbs:

```tsx
import { IKChain } from '@strata-game-library/core';

<IKChain
  // Chain definition
  bones={['shoulder', 'elbow', 'wrist']}
  target={targetPosition}

  // Constraints
  constraints={{
    elbow: { min: 0, max: Math.PI * 0.9 }
  }}

  // Solver
  iterations={10}
  tolerance={0.001}
/>
```

## Animation System

### Procedural Walk Cycle

```tsx
import { createWalkCycle, createRunCycle } from '@strata-game-library/core';

const walk = createWalkCycle({
  speed: 1,
  stride: 0.8,
  bounce: 0.05,
  armSwing: 0.3
});

const run = createRunCycle({
  speed: 2,
  stride: 1.2,
  bounce: 0.1,
  armSwing: 0.5
});

<Character animation={isRunning ? run : walk} />
```

### Animation Blending

```tsx
import { useAnimationBlend } from '@strata-game-library/core';

function AnimatedCharacter() {
  const { blend, setWeight } = useAnimationBlend({
    idle: idleAnimation,
    walk: walkAnimation,
    run: runAnimation
  });

  useEffect(() => {
    setWeight('walk', velocity / maxWalkSpeed);
    setWeight('run', Math.max(0, velocity - maxWalkSpeed) / maxRunSpeed);
  }, [velocity]);

  return <Character animation={blend} />;
}
```

### State Machine

```tsx
import { createAnimationStateMachine } from '@strata-game-library/core';

const stateMachine = createAnimationStateMachine({
  initial: 'idle',
  states: {
    idle: {
      animation: idleAnimation,
      transitions: {
        walk: { condition: (ctx) => ctx.velocity > 0.1 },
        jump: { condition: (ctx) => ctx.isJumping }
      }
    },
    walk: {
      animation: walkAnimation,
      transitions: {
        idle: { condition: (ctx) => ctx.velocity < 0.1 },
        run: { condition: (ctx) => ctx.velocity > 5 },
        jump: { condition: (ctx) => ctx.isJumping }
      }
    },
    run: {
      animation: runAnimation,
      transitions: {
        walk: { condition: (ctx) => ctx.velocity < 5 },
        jump: { condition: (ctx) => ctx.isJumping }
      }
    },
    jump: {
      animation: jumpAnimation,
      transitions: {
        idle: { condition: (ctx) => ctx.isGrounded }
      }
    }
  }
});
```

## Inverse Kinematics

### Foot IK (Ground Adaptation)

```tsx
<Character
  footIK
  footIKConfig={{
    raycastDistance: 2,
    ankleHeight: 0.1,
    smoothing: 0.1,
    terrainLayers: ['ground', 'stairs']
  }}
/>
```

### Hand IK (Object Interaction)

```tsx
const targetRef = useRef();

<mesh ref={targetRef} position={[1, 1, 0]}>
  <boxGeometry args={[0.2, 0.2, 0.2]} />
</mesh>

<Character
  handIK
  handIKTargets={{
    rightHand: targetRef
  }}
/>
```

### Look-At IK

```tsx
<Character
  lookAtIK
  lookAtTarget={cameraPosition}
  lookAtConfig={{
    headWeight: 0.6,
    spineWeight: 0.3,
    eyeWeight: 1
  }}
/>
```

## Physics Integration

### Ragdoll

```tsx
import { Ragdoll } from '@strata-game-library/core';

<Ragdoll
  model={characterModel}

  // Physics
  enabled={isDead}
  mass={70}
  friction={0.5}

  // Joints
  joints={{
    neck: { swing: 45, twist: 30 },
    shoulder: { swing: 120, twist: 90 },
    elbow: { swing: 140, twist: 0 },
    hip: { swing: 90, twist: 45 },
    knee: { swing: 140, twist: 0 }
  }}

  // Initial force
  impactForce={impactVector}
  impactPoint={hitPoint}
/>
```

### Character Controller

```tsx
import { CharacterController } from '@strata-game-library/core';

<CharacterController
  // Capsule shape
  height={1.8}
  radius={0.3}

  // Movement
  moveSpeed={5}
  runSpeed={10}
  jumpForce={8}

  // Ground detection
  groundDistance={0.1}
  slopeLimit={45}
  stepHeight={0.3}

  // Input
  input={inputState}

  // Camera
  cameraFollow
  cameraOffset={[0, 2, -5]}
/>
```

## Presets

### Humanoid Preset

```tsx
import { createHumanoidPreset } from '@strata-game-library/presets/animation';

const humanoid = createHumanoidPreset({
  height: 1.8,
  proportions: 'athletic',
  style: 'realistic'
});

<Character {...humanoid} model={characterModel} />
```

### Creature Preset

```tsx
import { createCreaturePreset } from '@strata-game-library/presets/animation';

const quadruped = createCreaturePreset({
  type: 'quadruped',
  legs: 4,
  gait: 'trot'
});
```

## Performance

### LOD for Characters

```tsx
<Character
  lod
  lodDistances={[10, 30, 100]}
  lodModels={[
    highPolyModel,   // 0-10 units
    midPolyModel,    // 10-30 units
    lowPolyModel     // 30-100 units
  ]}
/>
```

### Crowd Rendering

```tsx
import { CharacterCrowd } from '@strata-game-library/core';

<CharacterCrowd
  count={100}
  model={crowdModel}
  animations={[walkAnimation, idleAnimation]}
  spread={50}

  // Simplified physics
  avoidance
  avoidanceRadius={1}
/>
```

## Related

- [Animation Presets](/presets/animation/) - Pre-built animations
- [Physics Presets](/presets/physics/) - Physics configurations
- [Camera Presets](/presets/camera/) - Camera controllers
