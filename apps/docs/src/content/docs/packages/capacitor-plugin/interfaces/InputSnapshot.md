[**@strata-game-library/capacitor-plugin**](../README.md)

***

[@strata-game-library/capacitor-plugin](../globals.md) / InputSnapshot

# Interface: InputSnapshot

Defined in: [definitions.ts:34](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L34)

## Properties

### buttons

> **buttons**: `Record`\<`string`, `boolean`\>

Defined in: [definitions.ts:38](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L38)

***

### leftStick

> **leftStick**: [`Vector2`](Vector2.md)

Defined in: [definitions.ts:36](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L36)

***

### rightStick

> **rightStick**: [`Vector2`](Vector2.md)

Defined in: [definitions.ts:37](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L37)

***

### timestamp

> **timestamp**: `number`

Defined in: [definitions.ts:35](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L35)

***

### touches

> **touches**: `object`[]

Defined in: [definitions.ts:43](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L43)

#### id

> **id**: `number`

#### phase

> **phase**: `"began"` \| `"moved"` \| `"ended"` \| `"cancelled"`

#### position

> **position**: [`Vector2`](Vector2.md)

***

### triggers

> **triggers**: `object`

Defined in: [definitions.ts:39](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L39)

#### left

> **left**: `number`

#### right

> **right**: `number`
