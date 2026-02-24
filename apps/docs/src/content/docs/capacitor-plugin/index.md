---
title: Capacitor Plugin
description: Strata Capacitor plugin for native mobile integration
---

# Capacitor Plugin

The `@strata-game-library/capacitor-plugin` provides native mobile integration for Strata applications using Ionic Capacitor. Deploy your 3D games and experiences to iOS and Android with native performance.

## Installation

```bash
pnpm add @strata-game-library/capacitor-plugin
npx cap sync
```

## Features

- **Native iOS and Android bridge** for Strata 3D rendering
- **Hardware-accelerated WebGL** context management
- **React hooks** for Capacitor integration
- **Touch input** with gesture recognition
- **Haptic feedback** for immersive interactions
- **Device orientation** sensors for gyroscope controls
- **Performance monitoring** with native profiling tools

## Quick Start

```tsx
import { StrataCapacitor } from '@strata-game-library/capacitor-plugin';

// Initialize the plugin
await StrataCapacitor.initialize({
  enableHaptics: true,
  enableGyroscope: true,
});

// Use in your Strata game
function MobileGame() {
  return (
    <Canvas>
      <Terrain biome="alpine" size={256} />
      <Water size={256} />
    </Canvas>
  );
}
```

## Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| WebGL 2.0 | Yes | Yes |
| Haptic Feedback | Yes | Yes |
| Gyroscope Input | Yes | Yes |
| AR Integration | ARKit | ARCore |
| Performance Tier | Auto-detect | Auto-detect |

## Related

- [Mobile Plugins Overview](/mobile/) — Cross-platform mobile features
- [React Native Plugin](/mobile/react-native/) — Alternative mobile approach
- [Performance Guide](/guides/performance/) — Optimization for mobile
