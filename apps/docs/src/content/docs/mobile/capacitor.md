---
title: Capacitor Plugin
description: Cross-platform input, device detection, and haptics for Capacitor games
---

# Capacitor Plugin

The `@strata-game-library/capacitor-plugin` provides cross-platform capabilities for web, iOS, Android, and Electron games.

## Installation

```bash
pnpm install @strata-game-library/capacitor-plugin
npx cap sync
```

## Features

- **Device Detection** - Platform, device type, input mode
- **Unified Input** - Touch, keyboard, and gamepad abstraction
- **Haptic Feedback** - Device vibration and gamepad rumble
- **Screen Orientation** - Lock/unlock orientation
- **Safe Area Insets** - Accurate for notched screens
- **React Hooks** - Ready for React/R3F integration

## Core API

### Strata Object

```typescript
import { Strata } from '@strata-game-library/capacitor-plugin';

// Get device profile
const profile = await Strata.getDeviceProfile();
console.log(profile.deviceType); // 'mobile' | 'tablet' | 'foldable' | 'desktop'
console.log(profile.inputMode);  // 'touch' | 'keyboard' | 'gamepad' | 'hybrid'

// Get control hints
const hints = await Strata.getControlHints();
console.log(hints.movement); // "Drag to move" or "WASD to move"

// Get input state
const input = await Strata.getInputSnapshot();
console.log(input.leftStick); // { x: 0, y: -1 }

// Trigger haptics
await Strata.triggerHaptics({ intensity: 'medium' });

// Configure touch (Web)
await Strata.configureTouchHandling({
  preventScrolling: true,
  preventZooming: true,
});
```

## React Hooks

### Setup with Provider

```tsx
import { DeviceProvider } from '@strata-game-library/capacitor-plugin/react';

function App() {
  return (
    <DeviceProvider>
      <Game />
    </DeviceProvider>
  );
}
```

### `useDevice()`

```tsx
import { useDevice } from '@strata-game-library/capacitor-plugin/react';

function Game() {
  const device = useDevice();

  // Show touch controls on mobile
  const showTouchControls = device.inputMode === 'touch';

  // Adjust for notch
  const paddingTop = device.safeAreaInsets.top;

  return (
    <>
      <Canvas style={{ paddingTop }}>
        {/* Your scene */}
      </Canvas>
      {showTouchControls && <TouchControls />}
    </>
  );
}
```

### `useInput()`

```tsx
import { useInput } from '@strata-game-library/capacitor-plugin/react';

function Game() {
  const { leftStick, rightStick, buttons, isPressed } = useInput();

  useFrame(() => {
    // Move character
    player.position.x += leftStick.x * speed;
    player.position.z += leftStick.y * speed;

    // Rotate camera
    camera.rotation.y += rightStick.x * sensitivity;
  });

  // Check button
  if (isPressed('jump')) {
    player.jump();
  }

  return <Player />;
}
```

### `useHaptics()`

```tsx
import { useHaptics } from '@strata-game-library/capacitor-plugin/react';

function Game() {
  const { light, medium, heavy, custom } = useHaptics();

  const handleHit = () => medium();
  const handleExplosion = () => heavy();
  const handlePickup = () => light();

  const handleCustom = () => {
    custom({
      intensity: 0.7,
      duration: 150,
    });
  };

  return <GameScene onHit={handleHit} />;
}
```

### `useControlHints()`

```tsx
import { useControlHints } from '@strata-game-library/capacitor-plugin/react';

function HelpOverlay() {
  const hints = useControlHints();

  return (
    <div className="help">
      <p>Move: {hints.movement}</p>
      <p>Look: {hints.camera}</p>
      <p>Jump: {hints.action}</p>
    </div>
  );
}
```

### `useStrata()`

All-in-one hook:

```tsx
import { useStrata } from '@strata-game-library/capacitor-plugin/react';

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

## Platform Support

| Feature | Web | iOS | Android | Electron |
|---------|-----|-----|---------|----------|
| Device Detection | ✅ | ✅ | ✅ | ✅ |
| Touch Input | ✅ | ✅ | ✅ | ✅ |
| Keyboard Input | ✅ | ⚠️* | ⚠️* | ✅ |
| Gamepad Input | ✅ | ⚠️* | ⚠️* | ✅ |
| Device Haptics | ⚠️** | ✅ | ✅ | ❌ |
| Gamepad Haptics | ✅ | ❌ | ❌ | ✅ |
| Safe Area Insets | ✅ | ✅ | ✅ | ✅ |
| Orientation Lock | ❌ | ✅ | ✅ | ❌ |

*⚠️ External keyboards/gamepads via Bluetooth*
*⚠️ Android Chrome only*

## Touch Handling

### Disable Browser Gestures

For games, disable default touch behaviors:

```typescript
import { Strata } from '@strata-game-library/capacitor-plugin';

// At app startup
await Strata.configureTouchHandling({
  preventScrolling: true,    // No page scroll
  preventZooming: true,      // No pinch zoom
  preventContextMenu: true,  // No long-press menu
});
```

### Virtual Joysticks

```tsx
import { VirtualJoystick, VirtualButton } from '@strata-game-library/capacitor-plugin/react';

function TouchControls() {
  return (
    <>
      <VirtualJoystick
        position="left"
        onMove={(x, y) => setMovement([x, y])}
      />
      <VirtualButton
        position={{ bottom: 20, right: 20 }}
        onPress={() => jump()}
        label="Jump"
      />
    </>
  );
}
```

## Performance Adaptation

```tsx
import { useDevice } from '@strata-game-library/capacitor-plugin/react';

function AdaptiveScene() {
  const device = useDevice();

  // Reduce quality on mobile
  const quality = device.deviceType === 'mobile' ? 'low' : 'high';

  const settings = {
    low: { shadows: false, particles: 100, dpr: 1 },
    high: { shadows: true, particles: 1000, dpr: 2 },
  }[quality];

  return (
    <Canvas dpr={settings.dpr}>
      <Scene shadows={settings.shadows} particles={settings.particles} />
    </Canvas>
  );
}
```

## Related

- [React Native Plugin](/mobile/react-native/) - For pure React Native apps
- [Mobile Plugins Overview](/mobile/) - Feature comparison
