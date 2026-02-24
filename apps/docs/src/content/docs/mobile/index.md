---
title: Mobile Plugins
description: Cross-platform input, device detection, and haptics for Strata games
---

# Mobile Plugins

Strata provides mobile plugins for both React Native and Capacitor, enabling cross-platform input handling, device detection, and haptic feedback for mobile games.

## Available Plugins

| Plugin | Platform | Use Case |
|--------|----------|----------|
| [@strata-game-library/react-native-plugin](/mobile/react-native/) | React Native | Native mobile apps |
| [@strata-game-library/capacitor-plugin](/mobile/capacitor/) | Capacitor | Hybrid web/mobile apps |

## Features

Both plugins provide:

- **🎮 Device Detection** - Identify device type, platform, and capabilities
- **👆 Unified Input** - Abstract touch, keyboard, and gamepad into one API
- **📳 Haptic Feedback** - Cross-platform vibration with intensity control
- **📱 Safe Area Insets** - Native safe area detection for notches
- **🔄 Screen Orientation** - Get and set orientation
- **⚡ Performance Mode** - Detect low power mode

## Quick Comparison

| Feature | React Native | Capacitor |
|---------|--------------|-----------|
| iOS Support | ✅ Native | ✅ Native |
| Android Support | ✅ Native | ✅ Native |
| Web Support | ❌ | ✅ |
| Electron Support | ❌ | ✅ |
| React Hooks | ✅ | ✅ |
| Bundle Size | Larger | Smaller |
| Native Performance | Best | Good |

## Choosing a Plugin

### Use React Native Plugin if

- Building a pure React Native app
- Need maximum native performance
- Using react-native-three or expo-three

### Use Capacitor Plugin if

- Building a web-first app
- Want to deploy to web, iOS, Android, and desktop
- Using standard React Three Fiber on web

## Quick Start

### React Native

```bash
npm install @strata-game-library/react-native-plugin
cd ios && pod install
```

```tsx
import { useDevice, useInput, useHaptics } from '@strata-game-library/react-native-plugin';

function Game() {
  const device = useDevice();
  const input = useInput();
  const { trigger } = useHaptics();

  return <Canvas>{/* Your R3F scene */}</Canvas>;
}
```

### Capacitor

```bash
pnpm install @strata-game-library/capacitor-plugin
npx cap sync
```

```tsx
import { DeviceProvider, useDevice, useInput } from '@strata-game-library/capacitor-plugin/react';

function App() {
  return (
    <DeviceProvider>
      <Game />
    </DeviceProvider>
  );
}
```

## Common API

Both plugins share the same core API:

### Device Profile

```typescript
interface DeviceProfile {
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';
  deviceType: 'mobile' | 'tablet' | 'foldable' | 'desktop';
  inputMode: 'touch' | 'keyboard' | 'gamepad' | 'hybrid';
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  hasPointer: boolean;
  hasGamepad: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### Input Snapshot

```typescript
interface InputSnapshot {
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
  triggers: { left: number; right: number };
  touches: Array<{
    id: number;
    position: { x: number; y: number };
    phase: 'began' | 'moved' | 'ended' | 'cancelled';
  }>;
}
```

### Haptics Options

```typescript
interface HapticsOptions {
  intensity: 'light' | 'medium' | 'heavy';
  customIntensity?: number;
  duration?: number;
  pattern?: number[];
}
```

## Related

- [React Native Plugin](/mobile/react-native/) - Full React Native docs
- [Capacitor Plugin](/mobile/capacitor/) - Full Capacitor docs
