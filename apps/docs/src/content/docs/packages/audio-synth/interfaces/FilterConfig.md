[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / FilterConfig

# Interface: FilterConfig

Defined in: [core/types.ts:54](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L54)

Filter configuration for sound shaping.

## Properties

### frequency

> **frequency**: `number`

Defined in: [core/types.ts:58](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L58)

Cutoff frequency in Hz

***

### Q?

> `optional` **Q**: `number`

Defined in: [core/types.ts:60](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L60)

Q factor (resonance)

***

### rolloff?

> `optional` **rolloff**: `FilterRollOff`

Defined in: [core/types.ts:62](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L62)

Rolloff in dB per octave

***

### type

> **type**: `BiquadFilterType`

Defined in: [core/types.ts:56](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L56)

Filter type
