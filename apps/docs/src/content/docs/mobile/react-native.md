---
title: React Native Plugin
description: Cross-platform input, device detection, and haptics for React Native games
---

# React Native Plugin

The `@strata-game-library/react-native` provides native mobile capabilities for React Native games built with Strata.

## Installation

```bash
npm install @strata-game-library/react-native
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

Automatically linked via autolinking.

## Features

- **Device Detection** - Identify device type, platform, and performance capabilities
- **Input Handling** - Unified touch input with `StrataInputProvider`
- **Haptic Feedback** - iOS Taptic Engine, Android Vibrator
- **Safe Area Insets** - Native detection for notches
- **Orientation** - Get and lock screen orientation
- **Performance Mode** - Detect low power mode

## Hooks

### `useDevice()`

Returns the current device profile:

```tsx
import { useDevice } from '@strata-game-library/react-native';

function Game() {
  const device = useDevice();

  // Adapt UI based on device
  if (device.deviceType === 'tablet') {
    return <TabletLayout />;
  }

  // Check safe areas for notch
  const style = {
    paddingTop: device.safeAreaInsets.top,
    paddingBottom: device.safeAreaInsets.bottom,
  };

  return <View style={style}>{/* Game content */}</View>;
}
```

### `useInput()`

Returns the current input state (requires `StrataInputProvider`):

```tsx
import { useInput, StrataInputProvider } from '@strata-game-library/react-native';

function Game() {
  const input = useInput();

  // Use joystick values for movement
  const moveX = input.leftStick.x;
  const moveY = input.leftStick.y;

  // Check button presses
  if (input.buttons.jump) {
    player.jump();
  }

  return <GameCanvas movement={[moveX, moveY]} />;
}

// Wrap with provider
function App() {
  return (
    <StrataInputProvider>
      <Game />
    </StrataInputProvider>
  );
}
```

### `useHaptics()`

Returns haptic feedback controls:

```tsx
import { useHaptics } from '@strata-game-library/react-native';

function Game() {
  const { trigger, isSupported } = useHaptics();

  const handleCollision = async () => {
    if (isSupported) {
      await trigger({ intensity: 'medium' });
    }
  };

  const handleExplosion = async () => {
    await trigger({
      intensity: 'heavy',
      duration: 200,
    });
  };

  const handlePattern = async () => {
    await trigger({
      pattern: [100, 50, 100, 50, 200], // on, off, on, off, on
    });
  };

  return <GameCanvas onCollision={handleCollision} />;
}
```

### `useControlHints()`

Returns localized control hints based on input mode:

```tsx
import { useControlHints } from '@strata-game-library/react-native';

function ControlsOverlay() {
  const hints = useControlHints();

  return (
    <View>
      <Text>{hints.movement}</Text>   {/* "Drag to move" or "WASD to move" */}
      <Text>{hints.action}</Text>     {/* "Tap to jump" or "Space to jump" */}
      <Text>{hints.camera}</Text>     {/* "Swipe to look" or "Mouse to look" */}
    </View>
  );
}
```

## Components

### `<StrataInputProvider>`

Wraps your app to capture and process input events:

```tsx
import { StrataInputProvider } from '@strata-game-library/react-native';

function App() {
  return (
    <StrataInputProvider
      onInput={(snapshot) => {
        // Process raw input
        console.log(snapshot.touches);
      }}
      joystickConfig={{
        size: 100,
        deadzone: 0.1,
      }}
    >
      <Game />
    </StrataInputProvider>
  );
}
```

### `<VirtualJoystick>`

On-screen virtual joystick:

```tsx
import { VirtualJoystick } from '@strata-game-library/react-native';

<VirtualJoystick
  position="left"          // 'left' | 'right'
  size={120}               // Diameter in pixels
  innerSize={60}           // Inner stick size
  deadzone={0.1}           // Dead zone radius
  color="rgba(255,255,255,0.3)"
  activeColor="rgba(255,255,255,0.5)"
  onMove={(x, y) => {
    // -1 to 1 for each axis
    setMovement([x, y]);
  }}
/>
```

## Utilities

### `setOrientation()`

Lock screen orientation:

```typescript
import { setOrientation } from '@strata-game-library/react-native';

// Lock to landscape
await setOrientation('landscape');

// Lock to portrait
await setOrientation('portrait');

// Unlock
await setOrientation('auto');
```

### `getPerformanceLevel()`

Get device performance tier:

```typescript
import { getPerformanceLevel } from '@strata-game-library/react-native';

const level = await getPerformanceLevel();
// 'low' | 'medium' | 'high'

// Adjust graphics based on level
const graphicsSettings = {
  low: { shadows: false, particles: 100 },
  medium: { shadows: true, particles: 500 },
  high: { shadows: true, particles: 2000 },
}[level];
```

## Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| Device Detection | ✅ | ✅ |
| Touch Input | ✅ | ✅ |
| Haptics (Light) | ✅ Taptic | ✅ |
| Haptics (Heavy) | ✅ Taptic | ✅ |
| Safe Area Insets | ✅ | ✅ |
| Orientation Lock | ✅ | ✅ |
| Performance Detection | ✅ | ✅ |
| Low Power Mode | ✅ | ✅ |

## Performance Tips

1. **Use `useMemo`** for input processing to avoid re-renders
2. **Debounce haptics** to prevent rapid successive calls
3. **Check `isSupported`** before using haptics
4. **Use orientation lock** to prevent layout shifts during gameplay

## Related

- [Capacitor Plugin](/mobile/capacitor/) - Alternative for web-first apps
- [Mobile Plugins Overview](/mobile/) - Feature comparison
