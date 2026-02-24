---
title: "SynthManager"
---

[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / SynthManager

# Class: SynthManager

Defined in: [core/SynthManager.ts:29](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L29)

Creates and manages procedural audio synthesis.

## Example

```typescript
const manager = createSynthManager({ masterVolume: 0.8 });
await manager.init();
manager.playSFX('gunshot');
```

## Implements

- [`ISynthManager`](../interfaces/ISynthManager.md)

## Constructors

### Constructor

> **new SynthManager**(`config`): `SynthManager`

Defined in: [core/SynthManager.ts:39](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L39)

#### Parameters

##### config

[`SynthManagerConfig`](../interfaces/SynthManagerConfig.md) = `{}`

#### Returns

`SynthManager`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [core/SynthManager.ts:281](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L281)

Dispose all resources.

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`dispose`](../interfaces/ISynthManager.md#dispose)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [core/SynthManager.ts:50](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L50)

Initialize the Tone.js audio context.
MUST be called after a user gesture (click/touch).

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`init`](../interfaces/ISynthManager.md#init)

***

### isReady()

> **isReady**(): `boolean`

Defined in: [core/SynthManager.ts:71](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L71)

Check if the audio context is ready.

#### Returns

`boolean`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`isReady`](../interfaces/ISynthManager.md#isready)

***

### playMusic()

> **playMusic**(`patternId`): `void`

Defined in: [core/SynthManager.ts:161](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L161)

Play background music from a pattern ID.

#### Parameters

##### patternId

`string`

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`playMusic`](../interfaces/ISynthManager.md#playmusic)

***

### playSFX()

> **playSFX**(`presetOrId`): `void`

Defined in: [core/SynthManager.ts:78](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L78)

Play a sound effect from a preset or preset ID.

#### Parameters

##### presetOrId

`string` | [`SFXPreset`](../interfaces/SFXPreset.md)

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`playSFX`](../interfaces/ISynthManager.md#playsfx)

***

### setMasterVolume()

> **setMasterVolume**(`volume`): `void`

Defined in: [core/SynthManager.ts:260](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L260)

Set master volume.

#### Parameters

##### volume

`number`

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`setMasterVolume`](../interfaces/ISynthManager.md#setmastervolume)

***

### stopAll()

> **stopAll**(): `void`

Defined in: [core/SynthManager.ts:268](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L268)

Stop all sounds and reset.

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`stopAll`](../interfaces/ISynthManager.md#stopall)

***

### stopMusic()

> **stopMusic**(): `void`

Defined in: [core/SynthManager.ts:240](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/SynthManager.ts#L240)

Stop background music.

#### Returns

`void`

#### Implementation of

[`ISynthManager`](../interfaces/ISynthManager.md).[`stopMusic`](../interfaces/ISynthManager.md#stopmusic)
