---
title: Audio Synth
description: Procedural audio synthesis and spatial sound design for game audio
---

# Audio Synth

The `@strata-game-library/audio-synth` package provides procedural audio synthesis for game sound effects and music. Generate sounds programmatically without audio files — explosions, footsteps, UI clicks, ambient music, and more.

## Installation

```bash
pnpm add @strata-game-library/audio-synth
```

## Quick Start

```tsx
import { AudioSynthProvider, usePlaySFX, usePlayMusic } from '@strata-game-library/audio-synth';

function Game() {
  return (
    <AudioSynthProvider>
      <GameContent />
    </AudioSynthProvider>
  );
}

function GameContent() {
  const playSFX = usePlaySFX();
  const playMusic = usePlayMusic();

  return (
    <button onClick={() => playSFX('explosion')}>
      Play Explosion
    </button>
  );
}
```

## Features

- **Procedural SFX** — Generate sound effects from parameters, not audio files
- **Music Patterns** — Compose and play music programmatically
- **Spatial Audio** — 3D positional sound that follows objects in the scene
- **React Integration** — Hooks and context providers for React apps
- **Preset Library** — Built-in presets for common game sounds

## SFX Presets

Built-in sound effect presets:

| Preset | Description |
|--------|-------------|
| `explosion` | Rumbling explosion with decay |
| `laser` | Sci-fi laser beam |
| `gunshot` | Firearm discharge |
| `footstep` | Walking sound |
| `impact` | Physical collision |
| `pickup` | Item collection |
| `powerup` | Power-up activation |
| `select` | UI selection |
| `confirm` | UI confirmation |
| `error` | UI error notification |
| `ricochet` | Bullet ricochet |

## Music Patterns

Built-in music patterns for different game states:

| Pattern | Description |
|---------|-------------|
| `ambient` | Calm background atmosphere |
| `exploration` | Adventurous exploration theme |
| `combat` | Intense battle music |
| `menu` | Main menu background |
| `defeat` | Game over theme |

## API Reference

See the [detailed API documentation](/packages/audio-synth/) for complete type definitions and usage examples.

## Related

- [Audio Presets](/presets/audio/) — Pre-configured audio settings
- [API Reference](/packages/audio-synth/) — Full TypeDoc documentation
