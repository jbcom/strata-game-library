---
title: "MusicPattern"
---

[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / MusicPattern

# Interface: MusicPattern

Defined in: [core/types.ts:110](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L110)

Music pattern configuration.

## Properties

### direction?

> `optional` **direction**: `"up"` \| `"down"` \| `"upDown"` \| `"downUp"` \| `"random"`

Defined in: [core/types.ts:118](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L118)

Pattern direction

***

### envelope

> **envelope**: [`EnvelopeConfig`](EnvelopeConfig.md)

Defined in: [core/types.ts:126](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L126)

Envelope

***

### filter?

> `optional` **filter**: [`FilterConfig`](FilterConfig.md)

Defined in: [core/types.ts:128](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L128)

Optional filter

***

### id

> **id**: `string`

Defined in: [core/types.ts:112](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L112)

Pattern identifier

***

### interval

> **interval**: `string`

Defined in: [core/types.ts:120](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L120)

Interval between notes

***

### name

> **name**: `string`

Defined in: [core/types.ts:114](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L114)

Pattern name

***

### notes

> **notes**: `string`[]

Defined in: [core/types.ts:116](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L116)

Notes in the pattern

***

### oscillator

> **oscillator**: `object`

Defined in: [core/types.ts:122](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L122)

Oscillator type

#### type

> **type**: [`OscillatorType`](../type-aliases/OscillatorType.md)
