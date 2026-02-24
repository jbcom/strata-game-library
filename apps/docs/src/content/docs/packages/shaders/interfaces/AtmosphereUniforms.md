[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / AtmosphereUniforms

# Interface: AtmosphereUniforms

Defined in: [volumetrics.ts:600](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L600)

## Extends

- [`IUniforms`](IUniforms.md)

## Indexable

\[`uniform`: `string`\]: `IUniform`\<`any`\>

## Properties

### tDepth

> **tDepth**: `object`

Defined in: [volumetrics.ts:602](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L602)

#### value

> **value**: `Texture`\<`unknown`\> \| `null`

***

### tDiffuse

> **tDiffuse**: `object`

Defined in: [volumetrics.ts:601](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L601)

#### value

> **value**: `Texture`\<`unknown`\> \| `null`

***

### uCameraFar

> **uCameraFar**: `object`

Defined in: [volumetrics.ts:611](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L611)

#### value

> **value**: `number`

***

### uCameraNear

> **uCameraNear**: `object`

Defined in: [volumetrics.ts:610](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L610)

#### value

> **value**: `number`

***

### uCameraPosition

> **uCameraPosition**: `object`

Defined in: [volumetrics.ts:609](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L609)

#### value

> **value**: `Vector3`

***

### uMieCoeff

> **uMieCoeff**: `object`

Defined in: [volumetrics.ts:608](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L608)

#### value

> **value**: `number`

***

### uProjectionMatrixInverse

> **uProjectionMatrixInverse**: `object`

Defined in: [volumetrics.ts:612](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L612)

#### value

> **value**: `Matrix4` \| `null`

***

### uRayleighCoeff

> **uRayleighCoeff**: `object`

Defined in: [volumetrics.ts:607](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L607)

#### value

> **value**: `number`

***

### uSkyColor

> **uSkyColor**: `object`

Defined in: [volumetrics.ts:606](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L606)

#### value

> **value**: `Color`

***

### uSunColor

> **uSunColor**: `object`

Defined in: [volumetrics.ts:605](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L605)

#### value

> **value**: `Color`

***

### uSunDirection

> **uSunDirection**: `object`

Defined in: [volumetrics.ts:604](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L604)

#### value

> **value**: `Vector3`

***

### uTime

> **uTime**: `object`

Defined in: [volumetrics.ts:603](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L603)

#### value

> **value**: `number`

***

### uViewMatrixInverse

> **uViewMatrixInverse**: `object`

Defined in: [volumetrics.ts:613](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L613)

#### value

> **value**: `Matrix4` \| `null`
