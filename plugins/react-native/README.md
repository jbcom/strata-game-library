# @strata-game-library/react-native

[![npm version](https://img.shields.io/npm/v/@strata-game-library/react-native)](https://www.npmjs.com/package/@strata-game-library/react-native)
[![license](https://img.shields.io/npm/l/@strata-game-library/react-native)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

React Native plugin for Strata 3D -- cross-platform input, device detection, and haptics for mobile games.

## Installation

```bash
pnpm add @strata-game-library/react-native
```

Peer dependencies:

```bash
pnpm add @strata-game-library/core react react-native
```

Then install native dependencies:

```bash
cd ios && pod install
```

## Quick Start

```tsx
import { StrataView, useStrataInput } from '@strata-game-library/react-native';

function GameScreen() {
  const { touches, tilt } = useStrataInput();

  return (
    <StrataView
      style={{ flex: 1 }}
      onTouch={(e) => console.log(e.position)}
    >
      {/* Your R3F scene renders here */}
    </StrataView>
  );
}
```

## Features

- **Native rendering bridge** -- High-performance GL surface for React Three Fiber scenes
- **Touch input** -- Multi-touch tracking, gestures, and virtual joystick
- **Haptic feedback** -- Impact, notification, and custom haptic patterns
- **Device sensors** -- Accelerometer, gyroscope, and compass for tilt controls
- **Gamepad support** -- External controller detection and button mapping
- **Device detection** -- Performance profiling and capability queries
- **Cross-platform** -- iOS and Android with unified API

## Platform Support

| Platform | Minimum Version |
|----------|-----------------|
| iOS | 13.0+ |
| Android | API 24+ (Android 7.0) |
| React Native | 0.72+ |

## Integration with Strata Core

This plugin works alongside `@strata-game-library/core` to bring the full Strata experience to mobile:

```tsx
import { StrataView } from '@strata-game-library/react-native';
import { Terrain, Water } from '@strata-game-library/core/components';

function MobileGame() {
  return (
    <StrataView style={{ flex: 1 }}>
      <Terrain size={128} />
      <Water position={[0, -1, 0]} />
    </StrataView>
  );
}
```

## Documentation

Full documentation and mobile setup guide: [https://strata.game/mobile/react-native/](https://strata.game/mobile/react-native/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
