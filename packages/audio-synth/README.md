# @strata-game-library/audio-synth

[![npm version](https://img.shields.io/npm/v/@strata-game-library/audio-synth)](https://www.npmjs.com/package/@strata-game-library/audio-synth)
[![license](https://img.shields.io/npm/l/@strata-game-library/audio-synth)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Procedural audio synthesis for Strata 3D using Tone.js -- SFX, music, and ambient sound generation.

## Installation

```bash
pnpm add @strata-game-library/audio-synth
```

Peer dependencies:

```bash
pnpm add react tone
```

## Quick Start

```tsx
import { SynthEngine, SoundPresets } from '@strata-game-library/audio-synth';

const engine = new SynthEngine();

// Play a procedural sound effect
engine.play(SoundPresets.FOOTSTEP_STONE);

// Generate ambient wind
engine.startAmbient('wind', { intensity: 0.6 });
```

Using the React component:

```tsx
import { AudioSynth } from '@strata-game-library/audio-synth/components';

function Game() {
  return <AudioSynth preset="forest" volume={0.8} />;
}
```

## Features

- **Sound effect generation** -- Procedurally synthesized footsteps, impacts, UI sounds, and environmental effects
- **Music sequencing** -- Pattern-based music generation with layered instruments
- **Ambient soundscapes** -- Wind, rain, fire, water, and forest atmosphere loops
- **Real-time synthesis** -- All audio generated on-the-fly using Tone.js, no audio files needed
- **React integration** -- Declarative components and hooks for R3F scenes
- **Preset library** -- Ready-to-use sound presets for common game scenarios

## Exports

| Path | Contents |
|------|----------|
| `@strata-game-library/audio-synth` | Full library |
| `@strata-game-library/audio-synth/core` | Core synthesis engine |
| `@strata-game-library/audio-synth/components` | React components |
| `@strata-game-library/audio-synth/presets` | Sound presets |

## Documentation

Full documentation and audio design guide: [https://strata.game/audio-synth/](https://strata.game/audio-synth/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
