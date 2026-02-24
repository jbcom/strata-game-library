[**@strata-game-library/presets**](../README.md)

***

[@strata-game-library/presets](../globals.md) / QuadrupedParams

# Interface: QuadrupedParams

Defined in: [creatures/quadruped.ts:24](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L24)

Four-Legged Creature Template

ONE template with ALL the knobs.
FORMS are suggested starting points (otter, horse, cow, etc.)
Everything is customizable from any form.

## Example

```ts
// Start with otter form, customize from there
const myCreature = createQuadruped('otter', {
  age: 'baby',
  furLength: 1.4, // extra fluffy
  tailLength: 0.8,
});

// Apply any color theme
const themed = applyTheme(myCreature, THEMES.arctic);
```

## Extended by

- [`MountParams`](MountParams.md)

## Properties

### age

> **age**: `"baby"` \| `"young"` \| `"adult"` \| `"old"`

Defined in: [creatures/quadruped.ts:113](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L113)

Age category

***

### bodyBulk

> **bodyBulk**: `number`

Defined in: [creatures/quadruped.ts:33](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L33)

Body height/bulk

***

### bodyLength

> **bodyLength**: `number`

Defined in: [creatures/quadruped.ts:29](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L29)

Body length front-to-back

***

### bodyWidth

> **bodyWidth**: `number`

Defined in: [creatures/quadruped.ts:31](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L31)

Body width

***

### build

> **build**: `"thin"` \| `"lean"` \| `"average"` \| `"stocky"` \| `"heavy"`

Defined in: [creatures/quadruped.ts:115](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L115)

Build type

***

### clawLength

> **clawLength**: `number`

Defined in: [creatures/quadruped.ts:83](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L83)

Claw/hoof length

***

### earDroop

> **earDroop**: `number`

Defined in: [creatures/quadruped.ts:51](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L51)

Ear droop (0 = erect, 1 = floppy)

***

### earPosition

> **earPosition**: `number`

Defined in: [creatures/quadruped.ts:53](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L53)

Ear position height on head

***

### earRoundness

> **earRoundness**: `number`

Defined in: [creatures/quadruped.ts:49](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L49)

Ear shape (0 = pointed, 1 = round)

***

### earSize

> **earSize**: `number`

Defined in: [creatures/quadruped.ts:47](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L47)

Ear size

***

### eyePosition

> **eyePosition**: `number`

Defined in: [creatures/quadruped.ts:59](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L59)

Eye position (0 = front-facing, 1 = side)

***

### eyeSize

> **eyeSize**: `number`

Defined in: [creatures/quadruped.ts:57](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L57)

Eye size

***

### foreheadSize

> **foreheadSize**: `number`

Defined in: [creatures/quadruped.ts:43](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L43)

Forehead prominence

***

### furDensity

> **furDensity**: `number`

Defined in: [creatures/quadruped.ts:99](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L99)

Fur density/thickness

***

### furLength

> **furLength**: `number`

Defined in: [creatures/quadruped.ts:97](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L97)

Fur length (0.3 = short, 1 = medium, 2 = long)

***

### hasTail

> **hasTail**: `boolean`

Defined in: [creatures/quadruped.ts:87](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L87)

Has tail

***

### headSize

> **headSize**: `number`

Defined in: [creatures/quadruped.ts:37](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L37)

Head size relative to body

***

### hornCount

> **hornCount**: `number`

Defined in: [creatures/quadruped.ts:107](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L107)

Horn count

***

### hornSize

> **hornSize**: `number`

Defined in: [creatures/quadruped.ts:105](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L105)

Horn size (0 = none)

***

### legLength

> **legLength**: `number`

Defined in: [creatures/quadruped.ts:73](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L73)

Leg length

***

### legRatio

> **legRatio**: `number`

Defined in: [creatures/quadruped.ts:77](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L77)

Front vs back leg ratio (1 = equal, >1 = longer back)

***

### legThickness

> **legThickness**: `number`

Defined in: [creatures/quadruped.ts:75](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L75)

Leg thickness

***

### mane

> **mane**: `number`

Defined in: [creatures/quadruped.ts:101](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L101)

Mane presence (0 = none, 1 = full mane)

***

### noseSize

> **noseSize**: `number`

Defined in: [creatures/quadruped.ts:65](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L65)

Nose size

***

### pawSize

> **pawSize**: `number`

Defined in: [creatures/quadruped.ts:79](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L79)

Paw/hoof size

***

### pupilShape

> **pupilShape**: `number`

Defined in: [creatures/quadruped.ts:61](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L61)

Pupil shape (0 = round, 1 = vertical slit)

***

### size

> **size**: `number`

Defined in: [creatures/quadruped.ts:27](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L27)

Overall size (0.2 = tiny, 1 = medium, 3 = large)

***

### snoutLength

> **snoutLength**: `number`

Defined in: [creatures/quadruped.ts:39](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L39)

Snout/muzzle length (0 = flat, 2 = very long)

***

### snoutWidth

> **snoutWidth**: `number`

Defined in: [creatures/quadruped.ts:41](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L41)

Snout width

***

### tailFluff

> **tailFluff**: `number`

Defined in: [creatures/quadruped.ts:93](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L93)

Tail bushiness (0 = sleek, 1 = fluffy)

***

### tailLength

> **tailLength**: `number`

Defined in: [creatures/quadruped.ts:89](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L89)

Tail length

***

### tailThickness

> **tailThickness**: `number`

Defined in: [creatures/quadruped.ts:91](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L91)

Tail thickness at base

***

### teethVisible

> **teethVisible**: `number`

Defined in: [creatures/quadruped.ts:69](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L69)

Visible teeth (0 = none, 1 = prominent)

***

### tuskSize

> **tuskSize**: `number`

Defined in: [creatures/quadruped.ts:109](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L109)

Tusk size (0 = none)

***

### wear

> **wear**: `number`

Defined in: [creatures/quadruped.ts:117](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L117)

Wear/scarring (0 = pristine, 1 = battle-worn)

***

### webbing

> **webbing**: `number`

Defined in: [creatures/quadruped.ts:81](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L81)

Webbing between toes (0 = none, 1 = full)

***

### whiskerLength

> **whiskerLength**: `number`

Defined in: [creatures/quadruped.ts:67](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L67)

Whisker length (0 = none)
