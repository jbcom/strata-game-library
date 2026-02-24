---
title: Hooks
description: React hooks API reference
---

# Hooks API

React hooks provided by Strata packages.

## Core Hooks

### `useAnimationBlend`

Blend multiple animations with weighted mixing.

```tsx
import { useAnimationBlend } from '@strata-game-library/core';

function Character() {
  const { blend, setWeight } = useAnimationBlend({
    idle: idleAnimation,
    walk: walkAnimation,
    run: runAnimation,
  });

  useEffect(() => {
    setWeight('walk', velocity / maxSpeed);
  }, [velocity]);

  return <Character animation={blend} />;
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `blend` | `Animation` | Blended animation |
| `setWeight` | `(name: string, weight: number) => void` | Set animation weight |
| `getWeight` | `(name: string) => number` | Get current weight |

### `useFurInteraction`

Handle touch/mouse interaction with fur.

```tsx
import { useFurInteraction } from '@strata-game-library/core';

function InteractiveFur() {
  const { onPointerMove, deformation } = useFurInteraction();

  return (
    <FurMesh
      onPointerMove={onPointerMove}
      deformation={deformation}
    />
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `onPointerMove` | `(event: PointerEvent) => void` | Event handler |
| `deformation` | `DeformationMap` | Current deformation state |
| `reset` | `() => void` | Reset deformation |

## Mobile Plugin Hooks

### `useDevice`

Get device information (React Native / Capacitor).

```tsx
import { useDevice } from '@strata-game-library/capacitor/react';

function Game() {
  const device = useDevice();

  return (
    <div style={{ paddingTop: device.safeAreaInsets.top }}>
      <p>Platform: {device.platform}</p>
      <p>Type: {device.deviceType}</p>
      <p>Input: {device.inputMode}</p>
    </div>
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `platform` | `string` | 'ios', 'android', 'web', etc. |
| `deviceType` | `string` | 'mobile', 'tablet', 'desktop' |
| `inputMode` | `string` | 'touch', 'keyboard', 'gamepad' |
| `orientation` | `string` | 'portrait', 'landscape' |
| `safeAreaInsets` | `object` | Safe area for notches |

### `useInput`

Get unified input state (React Native / Capacitor).

```tsx
import { useInput } from '@strata-game-library/capacitor/react';

function Game() {
  const { leftStick, rightStick, buttons, isPressed } = useInput();

  useFrame(() => {
    player.move(leftStick.x, leftStick.y);
  });

  if (isPressed('jump')) {
    player.jump();
  }

  return <Player />;
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `leftStick` | `{ x: number, y: number }` | Left joystick (-1 to 1) |
| `rightStick` | `{ x: number, y: number }` | Right joystick |
| `buttons` | `Record<string, boolean>` | Button states |
| `triggers` | `{ left: number, right: number }` | Trigger values |
| `isPressed` | `(button: string) => boolean` | Check button |

### `useHaptics`

Trigger haptic feedback (React Native / Capacitor).

```tsx
import { useHaptics } from '@strata-game-library/capacitor/react';

function Game() {
  const { light, medium, heavy, custom, isSupported } = useHaptics();

  const handleHit = () => {
    if (isSupported) medium();
  };

  return <GameScene onHit={handleHit} />;
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `light` | `() => Promise<void>` | Light haptic |
| `medium` | `() => Promise<void>` | Medium haptic |
| `heavy` | `() => Promise<void>` | Heavy haptic |
| `custom` | `(options: HapticsOptions) => Promise<void>` | Custom haptic |
| `isSupported` | `boolean` | Device supports haptics |

### `useControlHints`

Get localized control hints based on input mode.

```tsx
import { useControlHints } from '@strata-game-library/capacitor/react';

function HelpOverlay() {
  const hints = useControlHints();

  return (
    <div>
      <p>Move: {hints.movement}</p>
      <p>Look: {hints.camera}</p>
      <p>Action: {hints.action}</p>
    </div>
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `movement` | `string` | Movement hint text |
| `camera` | `string` | Camera hint text |
| `action` | `string` | Primary action hint |

### `useStrata`

All-in-one hook for Capacitor plugin.

```tsx
import { useStrata } from '@strata-game-library/capacitor/react';

function Game() {
  const {
    deviceInfo,
    safeArea,
    inputMode,
    orientation,
    triggerHaptics,
  } = useStrata();

  return <GameScene />;
}
```

## Related

- [Components](/api/components/) - React components
- [Core Functions](/api/functions/) - Utility functions
- [Types](/api/types/) - TypeScript types
