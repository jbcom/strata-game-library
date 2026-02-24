[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / VolumetricFogUniforms

# Interface: VolumetricFogUniforms

Defined in: [volumetrics.ts:565](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L565)

## Extends

- [`IUniforms`](IUniforms.md)

## Indexable

\[`uniform`: `string`\]: `IUniform`\<`any`\>

## Properties

### tDepth

> **tDepth**: `object`

Defined in: [volumetrics.ts:566](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L566)

#### value

> **value**: `Texture`\<`unknown`\> \| `null`

***

### tDiffuse

> **tDiffuse**: `object`

Defined in: [volumetrics.ts:567](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L567)

#### value

> **value**: `Texture`\<`unknown`\> \| `null`

***

### uCameraFar

> **uCameraFar**: `object`

Defined in: [volumetrics.ts:569](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L569)

#### value

> **value**: `number`

***

### uCameraNear

> **uCameraNear**: `object`

Defined in: [volumetrics.ts:568](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L568)

#### value

> **value**: `number`

***

### uCameraPosition

> **uCameraPosition**: `object`

Defined in: [volumetrics.ts:579](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L579)

#### value

> **value**: `Vector3`

***

### uFogColor

> **uFogColor**: `object`

Defined in: [volumetrics.ts:570](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L570)

#### value

> **value**: `Color`

***

### uFogDensity

> **uFogDensity**: `object`

Defined in: [volumetrics.ts:571](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L571)

#### value

> **value**: `number`

***

### uFogFalloff

> **uFogFalloff**: `object`

Defined in: [volumetrics.ts:573](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L573)

#### value

> **value**: `number`

***

### uFogHeight

> **uFogHeight**: `object`

Defined in: [volumetrics.ts:572](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L572)

#### value

> **value**: `number`

***

### uLightColor

> **uLightColor**: `object`

Defined in: [volumetrics.ts:576](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L576)

#### value

> **value**: `Color`

***

### uLightDirection

> **uLightDirection**: `object`

Defined in: [volumetrics.ts:575](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L575)

#### value

> **value**: `Vector3`

***

### uProjectionMatrixInverse

> **uProjectionMatrixInverse**: `object`

Defined in: [volumetrics.ts:580](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L580)

#### value

> **value**: `Matrix4` \| `null`

***

### uResolution

> **uResolution**: `object`

Defined in: [volumetrics.ts:578](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L578)

#### value

> **value**: `Vector2`

***

### uScatteringStrength

> **uScatteringStrength**: `object`

Defined in: [volumetrics.ts:577](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L577)

#### value

> **value**: `number`

***

### uTime

> **uTime**: `object`

Defined in: [volumetrics.ts:574](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L574)

#### value

> **value**: `number`

***

### uViewMatrixInverse

> **uViewMatrixInverse**: `object`

Defined in: [volumetrics.ts:581](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L581)

#### value

> **value**: `Matrix4` \| `null`
