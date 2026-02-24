# @strata-game-library/capacitor-plugin

[![npm version](https://img.shields.io/npm/v/@strata-game-library/capacitor-plugin)](https://www.npmjs.com/package/@strata-game-library/capacitor-plugin)
[![license](https://img.shields.io/npm/l/@strata-game-library/capacitor-plugin)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Cross-platform input, device detection, and haptics for Strata 3D games using Ionic Capacitor.

## Installation

```bash
pnpm add @strata-game-library/capacitor-plugin @capacitor/core
```

Peer dependency:

```bash
pnpm add react
```

Then sync native projects:

```bash
npx cap sync
```

## Quick Start

```ts
import { StrataPlugin } from '@strata-game-library/capacitor-plugin';

// Trigger haptic feedback
await StrataPlugin.hapticImpact({ style: 'medium' });

// Get device capabilities
const info = await StrataPlugin.getDeviceInfo();
console.log(info.platform, info.hasGyroscope);
```

Using the React hooks:

```tsx
import { useHaptics, useDeviceMotion } from '@strata-game-library/capacitor-plugin/react';

function GameControls() {
  const { impact } = useHaptics();
  const { acceleration, rotation } = useDeviceMotion();

  return <button onClick={() => impact('heavy')}>Fire</button>;
}
```

## Features

- **Haptic feedback** -- Impact, notification, and selection haptics with configurable intensity
- **Device sensors** -- Accelerometer, gyroscope, and magnetometer access
- **Touch input** -- Multi-touch tracking, gesture recognition, and virtual joystick support
- **Gamepad support** -- External controller detection and input mapping
- **Device detection** -- Platform capabilities, screen info, and performance profiling
- **Native performance** -- Direct native bridge calls for low-latency input handling
- **Cross-platform** -- iOS and Android support with web fallbacks

## Exports

| Path | Contents |
|------|----------|
| `@strata-game-library/capacitor-plugin` | Core plugin API |
| `@strata-game-library/capacitor-plugin/react` | React hooks and components |

## Platform Support

| Platform | Status |
|----------|--------|
| iOS | Supported |
| Android | Supported |
| Web | Supported (with fallbacks) |

## Documentation

Full documentation and mobile integration guide: [https://strata.game/mobile/capacitor/](https://strata.game/mobile/capacitor/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
