[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / ISynthManager

# Interface: ISynthManager

Defined in: [core/types.ts:144](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L144)

Synth manager interface.

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [core/types.ts:160](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L160)

Dispose all resources

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [core/types.ts:146](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L146)

Initialize the audio context

#### Returns

`Promise`\<`void`\>

***

### isReady()

> **isReady**(): `boolean`

Defined in: [core/types.ts:148](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L148)

Check if initialized

#### Returns

`boolean`

***

### playMusic()

> **playMusic**(`patternId`): `void`

Defined in: [core/types.ts:152](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L152)

Play background music

#### Parameters

##### patternId

`string`

#### Returns

`void`

***

### playSFX()

> **playSFX**(`preset`): `void`

Defined in: [core/types.ts:150](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L150)

Play a sound effect

#### Parameters

##### preset

`string` | [`SFXPreset`](SFXPreset.md)

#### Returns

`void`

***

### setMasterVolume()

> **setMasterVolume**(`volume`): `void`

Defined in: [core/types.ts:156](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L156)

Set master volume

#### Parameters

##### volume

`number`

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

Defined in: [core/types.ts:158](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L158)

Stop all sounds

#### Returns

`void`

***

### stopMusic()

> **stopMusic**(): `void`

Defined in: [core/types.ts:154](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/core/types.ts#L154)

Stop background music

#### Returns

`void`
