[**@strata-game-library/presets**](../README.md)

***

[@strata-game-library/presets](../globals.md) / createQuadruped

# Function: createQuadruped()

> **createQuadruped**(`form`, `customizations?`): [`QuadrupedParams`](../interfaces/QuadrupedParams.md)

Defined in: [creatures/quadruped.ts:564](https://github.com/strata-game-library/presets/blob/3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305/src/creatures/quadruped.ts#L564)

Create a quadruped starting from a form

## Parameters

### form

[`FormName`](../type-aliases/FormName.md)

Starting form (otter, dog, horse, etc.)

### customizations?

`Partial`\<[`QuadrupedParams`](../interfaces/QuadrupedParams.md)\>

Any parameter overrides

## Returns

[`QuadrupedParams`](../interfaces/QuadrupedParams.md)

Complete parameter set

## Example

```ts
// Baby otter with extra fluffy fur
const babyOtter = createQuadruped('otter', {
  age: 'baby',
  furLength: 1.5,
});

// Battle-scarred old wolf
const alphaWolf = createQuadruped('wolf', {
  age: 'old',
  build: 'heavy',
  wear: 0.7,
  size: 1.4,
});
```
