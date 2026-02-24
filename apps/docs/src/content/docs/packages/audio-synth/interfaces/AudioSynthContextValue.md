---
title: "AudioSynthContextValue"
---

[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / AudioSynthContextValue

# Interface: AudioSynthContextValue

Defined in: [core/types.ts:166](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L166)

Audio context value for React context.

## Properties

### isReady

> **isReady**: `boolean`

Defined in: [core/types.ts:170](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L170)

Whether audio is ready

***

### manager

> **manager**: [`ISynthManager`](ISynthManager.md) \| `null`

Defined in: [core/types.ts:168](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L168)

Synth manager instance

***

### playMusic()

> **playMusic**: (`patternId`) => `void`

Defined in: [core/types.ts:174](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L174)

Play background music

#### Parameters

##### patternId

`string`

#### Returns

`void`

***

### playSFX()

> **playSFX**: (`preset`) => `void`

Defined in: [core/types.ts:172](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L172)

Play a sound effect

#### Parameters

##### preset

`string` | [`SFXPreset`](SFXPreset.md)

#### Returns

`void`

***

### setMasterVolume()

> **setMasterVolume**: (`volume`) => `void`

Defined in: [core/types.ts:178](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L178)

Set master volume

#### Parameters

##### volume

`number`

#### Returns

`void`

***

### stopMusic()

> **stopMusic**: () => `void`

Defined in: [core/types.ts:176](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L176)

Stop background music

#### Returns

`void`
