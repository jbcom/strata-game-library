---
title: "SFXPreset"
---

[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / SFXPreset

# Interface: SFXPreset

Defined in: [core/types.ts:68](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L68)

SFX preset definition.

## Properties

### duration?

> `optional` **duration**: `string`

Defined in: [core/types.ts:86](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L86)

Duration override

***

### envelope

> **envelope**: [`EnvelopeConfig`](EnvelopeConfig.md)

Defined in: [core/types.ts:78](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L78)

Envelope configuration

***

### filter?

> `optional` **filter**: [`FilterConfig`](FilterConfig.md)

Defined in: [core/types.ts:82](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L82)

Optional filter

***

### frequency?

> `optional` **frequency**: `number` \| [`FrequencySweep`](FrequencySweep.md)

Defined in: [core/types.ts:80](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L80)

Optional frequency sweep

***

### id

> **id**: `string`

Defined in: [core/types.ts:70](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L70)

Unique identifier

***

### name

> **name**: `string`

Defined in: [core/types.ts:72](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L72)

Display name

***

### noise?

> `optional` **noise**: `object`

Defined in: [core/types.ts:88](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L88)

Additional noise layer

#### envelope

> **envelope**: [`EnvelopeConfig`](EnvelopeConfig.md)

#### type

> **type**: `"white"` \| `"pink"` \| `"brown"`

#### volume?

> `optional` **volume**: `number`

***

### oscillator

> **oscillator**: `object`

Defined in: [core/types.ts:74](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L74)

Oscillator configuration

#### type

> **type**: [`OscillatorType`](../type-aliases/OscillatorType.md)

***

### volume?

> `optional` **volume**: `number`

Defined in: [core/types.ts:84](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L84)

Volume in decibels
