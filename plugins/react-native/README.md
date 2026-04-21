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
import { StrataInputProvider, useDevice, useHaptics, useInput } from '@strata-game-library/react-native';

function GameScreen() {
  const device = useDevice();
  const input = useInput();
  const haptics = useHaptics();

  return (
    <GameCanvas
      deviceProfile={device}
      movement={input.leftStick}
      actionPressed={input.buttons.a}
      onCollision={() => haptics.trigger({ intensity: 'medium' })}
    />
  );
}

export function App() {
  return (
    <StrataInputProvider
      onInput={(snapshot) => console.log(snapshot.touches)}
    >
      <GameScreen />
    </StrataInputProvider>
  );
}
```

## Features

- **Touch input** -- Multi-touch tracking through `StrataInputProvider`
- **Haptic feedback** -- Impact feedback on iOS and Android vibration
- **Gamepad support** -- External controller detection, control hints, and native input snapshots through iOS GameController/MFi and Android InputDevice
- **Device detection** -- Screen, safe-area, orientation, performance, and capability queries
- **Control hints** -- Adaptive hints for touch, keyboard, and gamepad modes
- **Cross-platform** -- iOS and Android with unified API

## Platform Support

| Platform | Minimum Version |
|----------|-----------------|
| iOS | 14.0+ |
| Android | API 24+ (Android 7.0) |
| React Native | 0.72+ |

## Integration with Strata Core

This plugin works alongside `@strata-game-library/core` to bring the full Strata experience to mobile:

```tsx
import { createGame } from '@strata-game-library/core';
import { StrataInputProvider, useDevice, useInput } from '@strata-game-library/react-native';

const game = createGame({
  id: 'mobile-adventure',
  scenes: {
    start: { id: 'start', name: 'Start' },
  },
  modes: {
    play: { id: 'play', name: 'Play' },
  },
  initialScene: 'start',
  initialMode: 'play',
});

game.inputManager.setActionMap({
  jump: { keyboard: 'Space', gamepad: 'south' },
});

function MobileGame() {
  const device = useDevice();
  const input = useInput();

  return (
    <GameCanvas
      deviceProfile={device}
      movement={input.leftStick}
      jumpPressed={input.buttons.a}
    />
  );
}

export function App() {
  return (
    <StrataInputProvider>
      <MobileGame />
    </StrataInputProvider>
  );
}
```

## Documentation

Full documentation and mobile setup guide: [https://strata.game/mobile/react-native/](https://strata.game/mobile/react-native/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
